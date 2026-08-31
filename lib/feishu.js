/**
 * dsh-code — Feishu bot half.
 *
 * Bridges DeepSeek Harness and a Feishu (飞书) self-built app:
 *
 *  - outbound: global session monitoring. Consumes the same `apiProxy` event
 *    streams the browser GUI uses (`events.mux` + `events.host`) and pushes
 *    rich-text notifications to configured users/groups when a turn ends, an
 *    approval is requested, an ask_user_question is pending, or an agent
 *    errors. Subagent descendant sessions (`parentSessionId`/
 *    `origin: 'subagent'` in the session lineage) only push blocking notices
 *    (approvals, questions) so they never hang unnoticed; their non-blocking
 *    notices (turn end, errors) stay main-agent only;
 *  - inbound: receives messages through the official SDK's WebSocket long
 *    connection (no public callback URL needed) and routes them: plain text
 *    goes to the sender's "focus session" via `sessions.prompt` (identical to
 *    typing in the GUI composer); directives list/switch/create/cancel
 *    sessions and answer pending approvals/questions via `apiProxy.respond`.
 *
 * The module never imports the Feishu SDK eagerly: the dependency loads on
 * first `start()` so a missing install degrades to a logged error instead of
 * breaking the whole plugin.
 */
import { randomUUID } from 'node:crypto'

/** Sentinel the settings UI sends back when the stored secret is unchanged. */
export const SECRET_MASK = '••••••••'

const TURN_END_DEBOUNCE_MS = 1500
const STREAM_RETRY_MS = 3000
const RESTART_MAX_BACKOFF_MS = 60000
const SENT_CTX_CAP = 300
const NOTIFIED_CAP = 600
const SERIAL_CAP = 400
const TITLE_TTL_MS = 60000
const WATCHDOG_MS = 60000

function clip(text, max) {
	const value = String(text ?? '')
	if (value.length <= max) return value
	return value.slice(0, max) + '\n…（已截断，完整内容见 DeepSeek Harness 界面）'
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Short human-readable session tag. DSH mints ids as `session-<uuid>`; the
 *  literal `session-` prefix is 8 chars, so a plain head-slice would always
 *  show just the prefix and never the distinguishing part — strip it first. */
function shortId(sessionId) {
	const id = String(sessionId ?? '')
	const core = id.startsWith('session-') ? id.slice('session-'.length) : id
	if (core === '') return id
	return core.length <= 8 ? core : core.slice(0, 8)
}

/** Extract display text from an assistant/user message's content blocks. */
export function extractMessageText(message) {
	const content = message?.content
	if (!Array.isArray(content)) return ''
	const parts = []
	for (const block of content) {
		if (block !== null && typeof block === 'object' && block.type === 'text' && typeof block.text === 'string') {
			parts.push(block.text)
		}
	}
	return parts.join('\n').trim()
}

/**
 * Build a wire-valid `ask_user_question` answer from free Feishu text.
 * Returns `{ answers }` or `{ error }`. Rules mirror the host's
 * `matchesQuestions` validation: one answer per question in order; selected
 * labels must exist verbatim; single-select questions accept at most one
 * selection OR a custom text, never both.
 */
export function buildQuestionAnswer(questions, rawText) {
	const text = String(rawText ?? '').trim()
	if (text === '') return { error: '回复内容为空' }
	const answers = []
	// Multi-line batches: one line per question when the counts line up.
	const lines = text.split('\n').map((line) => line.trim()).filter((line) => line !== '')
	const perQuestion = questions.length > 1 && lines.length === questions.length ? lines : null
	for (let index = 0; index < questions.length; index += 1) {
		const question = questions[index]
		const part = perQuestion !== null ? perQuestion[index] : text
		const options = Array.isArray(question.options) ? question.options : []
		const labels = options.map((option) => option.label)
		const numbers = [...part.matchAll(/\d+/g)].map((m) => Number(m[0]))
		const looksNumeric = /^[\d\s,，、;；]+$/.test(part) && numbers.length > 0
		if (options.length === 0) {
			answers.push({ id: question.id, selected: [], custom: part })
			continue
		}
		if (looksNumeric) {
			const picked = []
			for (const num of numbers) {
				if (num < 1 || num > labels.length) return { error: `选项序号 ${num} 超出范围（1-${labels.length}）` }
				const label = labels[num - 1]
				if (!picked.includes(label)) picked.push(label)
			}
			if (question.multiSelect !== true && picked.length > 1) {
				return { error: `问题「${question.header ?? question.question}」为单选，只能选择一个选项` }
			}
			answers.push({ id: question.id, selected: picked })
			continue
		}
		const matched = labels.find((label) => label.toLowerCase() === part.toLowerCase())
		if (matched !== undefined) {
			answers.push({ id: question.id, selected: [matched] })
			continue
		}
		if (question.multiSelect === true) {
			// Multi-select may pair a label match with custom text; free text
			// that names no option rides as custom.
			answers.push({ id: question.id, selected: [], custom: part })
			continue
		}
		answers.push({ id: question.id, selected: [], custom: part })
	}
	return { answers }
}

/** Parse one inbound Feishu text into a directive descriptor (pure). */
export function parseDirective(text) {
	const raw = String(text ?? '').trim()
	if (raw === '') return { kind: 'empty' }
	let m
	if (/^(\/help|帮助|help)$/i.test(raw)) return { kind: 'help' }
	if (/^\/id$/i.test(raw)) return { kind: 'whoami' }
	if (/^(\/(list|ls)|列表)$/i.test(raw)) return { kind: 'list' }
	m = raw.match(/^(?:\/(use|focus)|切换)\s+(\S+)/i)
	if (m !== null) return { kind: 'use', ref: m[2] }
	m = raw.match(/^(?:\/new|新建)\s+([\s\S]+)/i)
	if (m !== null) return { kind: 'new', message: m[1].trim() }
	if (/^(?:\/cancel|取消)$/i.test(raw)) return { kind: 'cancel' }
	m = raw.match(/^(批准|允许|同意|通过|approve|yes|y)(?:\s*[#＃]?(\d+))?\s*$/i)
	if (m !== null) return { kind: 'approve', serial: m[2] !== undefined ? Number(m[2]) : undefined }
	m = raw.match(/^(拒绝|否决|不同意|不批|驳回|reject|no|n|deny)(?:\s*[#＃]?(\d+))?\s*$/i)
	if (m !== null) return { kind: 'reject', serial: m[2] !== undefined ? Number(m[2]) : undefined }
	if (/^\d+$/.test(raw)) return { kind: 'maybe-answer', serial: Number(raw) }
	return { kind: 'text', text: raw }
}

/** Capped map: drops the oldest entry beyond `cap`. */
function cappedSet(map, key, value, cap) {
	map.set(key, value)
	while (map.size > cap) map.delete(map.keys().next().value)
}

/** Build a Feishu interactive-card object rendering one Markdown body (pure). */
export function buildCard(title, markdown, template) {
	return {
		config: { wide_screen_mode: true },
		header: {
			title: { tag: 'plain_text', content: title },
			...(template !== undefined ? { template } : {}),
		},
		elements: [{ tag: 'markdown', content: markdown }],
	}
}

export function createFeishuBot({ config, apiProxy, logger }) {
	const cfg = config
	const log = {
		info: (...args) => { try { logger?.info?.(...args) } catch { console.log('[dsh-code:feishu]', ...args) } },
		warn: (...args) => { try { logger?.warn?.(...args) } catch { console.warn('[dsh-code:feishu]', ...args) } },
		error: (...args) => { try { logger?.error?.(...args) } catch { console.error('[dsh-code:feishu]', ...args) } },
	}

	let sdk = null
	let client = null
	let wsClient = null
	let disposed = false
	let started = false
	const abort = new AbortController()
	const timers = new Set()

	// ── runtime state ──────────────────────────────────────────────────────
	const sessionMeta = new Map() // sessionId -> meta
	// Subagent descendant sessions: non-blocking notices (turn end, errors) stay
	// main-agent only, but blocking ones (approvals, questions) still push so a
	// subagent is never stuck waiting on a human nobody told. The direct parent
	// is kept to attribute the notice and re-focus the root main session.
	const subagentParents = new Map() // subagent sessionId -> direct parent sessionId
	const focusByUser = new Map() // openId -> sessionId
	const lastListByUser = new Map() // openId -> sessionId[]
	const bySerial = new Map() // serial -> { kind, sessionId, approvalId?, rpcId? }
	const sentCtx = new Map() // feishu message_id -> ctx (reply routing)
	const notified = new Map() // dedup key -> timestamp
	let serial = 0
	let botOpenId = null
	const titleCache = { at: 0, map: new Map() }
	const stats = { sent: 0, received: 0, restarts: 0, startedAt: 0, lastError: '', state: 'idle' }
	const hintSent = new Set() // one-time guidance per chat

	function later(fn, ms) {
		const handle = setTimeout(() => { timers.delete(handle); try { if (!disposed) fn() } catch (error) { log.error('timer handler failed:', String(error?.message ?? error)) } }, ms)
		timers.add(handle)
		return handle
	}

	function ensureMeta(sessionId) {
		let meta = sessionMeta.get(sessionId)
		if (meta === undefined) {
			meta = {
				running: false,
				turnText: '',
				lastText: '',
				pendingApprovals: new Map(), // approvalId -> entry
				pendingQuestion: undefined, // { rpcId, questions }
				turnEndTimer: undefined,
				endText: '',
			}
			sessionMeta.set(sessionId, meta)
		}
		return meta
	}

	// ── outbound messaging ─────────────────────────────────────────────────
	async function loadSdk() {
		if (sdk === null) sdk = await import('@larksuiteoapi/node-sdk')
		return sdk
	}

	async function callWithRetry(label, fn, attempts = 3) {
		let lastError
		for (let attempt = 0; attempt < attempts; attempt += 1) {
			try {
				const response = await fn()
				if (response !== null && typeof response === 'object' && typeof response.code === 'number' && response.code !== 0) {
					throw new Error(`code ${response.code}: ${response.msg ?? 'unknown feishu error'}`)
				}
				return response
			} catch (error) {
				lastError = error
				if (attempt < attempts - 1) await sleep(800 * 2 ** attempt)
			}
		}
		log.warn(`${label} failed after ${attempts} attempts:`, String(lastError?.message ?? lastError))
		stats.lastError = `${label}: ${String(lastError?.message ?? lastError)}`
		throw lastError
	}

	function targets() {
		return Array.isArray(cfg.targets) ? cfg.targets.filter((t) => typeof t?.id === 'string' && t.id !== '') : []
	}

	/** Send a rich-text (post) message to one target; returns the message_id. */
	async function sendPost(target, title, lines) {
		const content = JSON.stringify({
			zh_cn: {
				title,
				content: lines.map((line) => line.map((seg) => {
					if (seg.t === 'a') return { tag: 'a', text: seg.text, href: seg.href }
					return { tag: 'text', text: seg.text }
				})),
			},
		})
		const response = await callWithRetry(`send to ${target.label || target.id}`, () => client.im.message.create({
			data: {
				receive_id: target.id,
				msg_type: 'post',
				content,
			},
			params: { receive_id_type: target.kind === 'chat' ? 'chat_id' : 'open_id' },
		}))
		stats.sent += 1
		return response?.data?.message_id
	}

	/** Send one Markdown card (interactive message) to one target; returns message_id. */
	async function sendCard(target, title, markdown, template) {
		const card = buildCard(title, markdown, template)
		const response = await callWithRetry(`send card to ${target.label || target.id}`, () => client.im.message.create({
			data: {
				receive_id: target.id,
				msg_type: 'interactive',
				content: JSON.stringify(card),
			},
			params: { receive_id_type: target.kind === 'chat' ? 'chat_id' : 'open_id' },
		}))
		stats.sent += 1
		return response?.data?.message_id
	}

	/** Fallback renderer: flatten a Markdown body into post rich-text lines. */
	function markdownToPostLines(markdown) {
		return String(markdown ?? '').split('\n').map((line) => [{ text: line }])
	}

	/** Send one notice to one target in the configured format; returns message_id. */
	async function sendFormatted(target, title, markdown, template) {
		if (cfg.pushFormat === 'post') return sendPost(target, title, markdownToPostLines(markdown))
		return sendCard(target, title, markdown, template)
	}

	async function replyText(chatMessageId, text) {
		try {
			await callWithRetry('reply', () => client.im.message.reply({
				path: { message_id: chatMessageId },
				data: { msg_type: 'text', content: JSON.stringify({ text }) },
			}), 2)
			stats.sent += 1
		} catch { /* already logged */ }
	}

	/** Push one notice to every configured target in the configured format.
	 *  `autoFocus` additionally points each user target's focus session at the
	 *  notified session, so their next plain-text message continues it — the
	 *  behavior the notification wording promises (no quote-reply, no /use). */
	async function broadcastNotice({ title, markdown, template, ctx, autoFocus, focusSessionId }) {
		const list = targets()
		if (list.length === 0) {
			log.warn('feishu push skipped: no targets configured')
			return
		}
		// focusSessionId overrides ctx.sessionId for focus routing (subagent
		// notices re-focus the root main session, which plain text can prompt).
		const focusTarget = typeof focusSessionId === 'string' ? focusSessionId : ctx?.sessionId
		for (const target of list) {
			if (autoFocus === true && target.kind === 'user' && typeof focusTarget === 'string') focusByUser.set(target.id, focusTarget)
			try {
				const messageId = await sendFormatted(target, title, markdown, template)
				if (ctx !== undefined && typeof messageId === 'string') cappedSet(sentCtx, messageId, ctx, SENT_CTX_CAP)
			} catch { /* logged in callWithRetry */ }
		}
	}

	function nextSerial() {
		serial += 1
		while (bySerial.size > SERIAL_CAP) bySerial.delete(bySerial.keys().next().value)
		return serial
	}

	function markNotified(key) {
		if (notified.has(key)) return false
		cappedSet(notified, key, Date.now(), NOTIFIED_CAP)
		return true
	}

	// ── session metadata helpers ───────────────────────────────────────────
	/** Whether the session is a subagent descendant. */
	function isSubagent(sessionId) {
		return subagentParents.has(sessionId)
	}

	/** Record lineage from one session-summary shape (list item or added frame). */
	function markLineage(sessionId, summary) {
		if (summary?.parentSessionId !== undefined || summary?.origin === 'subagent') {
			subagentParents.set(sessionId, summary.parentSessionId)
		}
	}

	/** Nearest known main-agent ancestor of a (possibly nested) subagent. */
	function rootSessionOf(sessionId) {
		let current = sessionId
		const seen = new Set()
		while (subagentParents.has(current) && !seen.has(current)) {
			seen.add(current)
			const parent = subagentParents.get(current)
			if (typeof parent !== 'string') break
			current = parent
		}
		return current
	}

	async function refreshTitles(force) {
		if (!force && Date.now() - titleCache.at < TITLE_TTL_MS) return
		try {
			const response = await apiProxy.sessions.list({ rpcId: randomUUID(), payload: {} })
			if (response?.result?.ok === true) {
				for (const item of response.result.value.items ?? []) {
					// Baseline subagent knowledge for sessions created before this
					// bot (re)started: host/session-added only covers live additions.
					markLineage(item.sessionId, item)
					const title = item?.projections?.values?.title
					if (typeof title === 'string' && title !== '') titleCache.map.set(item.sessionId, title)
				}
			}
			titleCache.at = Date.now()
		} catch (error) {
			log.warn('session list refresh failed:', String(error?.message ?? error))
		}
	}

	async function titleOf(sessionId) {
		await refreshTitles(false)
		return titleCache.map.get(sessionId) ?? `会话 ${shortId(sessionId)}`
	}

	/** Fetch the session log tail to recover the last assistant text. */
	async function fetchLastAssistantText(sessionId) {
		try {
			const response = await apiProxy.sessions.history({ rpcId: randomUUID(), payload: { sessionId, maxMessages: 12 } })
			if (response?.result?.ok !== true) return ''
			const events = response.result.value.events ?? []
			for (let index = events.length - 1; index >= 0; index -= 1) {
				const event = events[index]?.event
				if (event?.type === 'assistant/message') {
					const text = extractMessageText(event.data?.message)
					if (text !== '') return text
				}
			}
		} catch { /* history unavailable */ }
		return ''
	}

	// ── notifications ──────────────────────────────────────────────────────
	async function notifyTurnEnd(sessionId) {
		if (isSubagent(sessionId)) return
		const meta = ensureMeta(sessionId)
		let text = meta.endText || meta.turnText || meta.lastText
		if (text === '') text = await fetchLastAssistantText(sessionId)
		const title = await titleOf(sessionId)
		if (isSubagent(sessionId)) return // lineage learned by the list refresh above
		const n = nextSerial()
		bySerial.set(n, { kind: 'session', sessionId })
		const max = cfg.replyMaxChars ?? 2000
		const body = text === '' ? '*（本轮没有可展示的回复文本）*' : clip(text, max)
		await broadcastNotice({
			title: `✅ 任务结束 [${n}]`,
			template: 'green',
			markdown: `**会话**：${title}（${shortId(sessionId)}）\n\n${body}\n\n---\n继续：直接发送文本即可向该会话下达指令（焦点已自动切换到该会话）`,
			ctx: { kind: 'session', sessionId },
			autoFocus: true,
		})
	}

	async function notifyApproval(sessionId, entry) {
		// Blocking wait: pushed for subagent sessions too — a subagent stuck on
		// an approval nobody is told about would silently hang the whole task.
		if (cfg.pushOn?.approval !== true) return
		if (!markNotified(`appr:${entry.approvalId}`)) return
		const title = await titleOf(sessionId)
		const subagent = isSubagent(sessionId) // after the list-refresh baseline
		const n = nextSerial()
		bySerial.set(n, { kind: 'approval', sessionId, approvalId: entry.approvalId, rpcId: entry.rpcId })
		const parts = [
			`**会话**：${title}（${shortId(sessionId)}）`,
			`**工具**：\`${entry.toolName}\``,
		]
		if (typeof entry.reason === 'string' && entry.reason !== '') parts.push(`**原因**：${clip(entry.reason, 400)}`)
		if (subagent) parts.push(`**来源**：子智能体（主会话：${await titleOf(rootSessionOf(sessionId))}）`)
		parts.push('', `回复「批准」或「拒绝」处理（可带序号，如：批准 ${n}）`)
		await broadcastNotice({
			title: subagent ? `🔐 需要审批 [${n}]（子智能体）` : `🔐 需要审批 [${n}]`,
			template: 'orange',
			markdown: parts.join('\n'),
			ctx: { kind: 'approval', sessionId, approvalId: entry.approvalId, rpcId: entry.rpcId },
			autoFocus: true,
			...(subagent ? { focusSessionId: rootSessionOf(sessionId) } : {}),
		})
	}

	async function notifyQuestion(sessionId, entry) {
		// Blocking wait: pushed for subagent sessions too (same posture as
		// approvals).
		if (cfg.pushOn?.question !== true) return
		if (!markNotified(`q:${entry.rpcId}`)) return
		const title = await titleOf(sessionId)
		const subagent = isSubagent(sessionId) // after the list-refresh baseline
		const n = nextSerial()
		bySerial.set(n, { kind: 'question', sessionId, rpcId: entry.rpcId })
		const parts = [`**会话**：${title}（${shortId(sessionId)}）`, '']
		if (subagent) parts.splice(1, 0, `**来源**：子智能体（主会话：${await titleOf(rootSessionOf(sessionId))}）`)
		entry.questions.forEach((question, qi) => {
			parts.push(entry.questions.length > 1 ? `**问题 ${qi + 1}**：${clip(question.question, 300)}` : clip(question.question, 500))
			for (const [oi, option] of (question.options ?? []).entries()) {
				const desc = typeof option.description === 'string' && option.description !== '' ? ` — ${option.description}` : ''
				parts.push(`${oi + 1}. ${option.label}${clip(desc, 120)}`)
			}
			parts.push('')
		})
		parts.push(`回复选项序号（如 1）或自定义文字作答${entry.questions.length > 1 ? '；多问题可按行分别作答' : ''}（序号：${n}）`)
		await broadcastNotice({
			title: subagent ? `❓ 等待回答 [${n}]（子智能体）` : `❓ 等待回答 [${n}]`,
			template: 'blue',
			markdown: parts.join('\n'),
			ctx: { kind: 'question', sessionId, rpcId: entry.rpcId },
			autoFocus: true,
			...(subagent ? { focusSessionId: rootSessionOf(sessionId) } : {}),
		})
	}

	async function notifyError(sessionId, message) {
		if (cfg.pushOn?.error !== true) return
		if (isSubagent(sessionId)) return
		const key = `err:${sessionId}:${String(message).slice(0, 80)}`
		if (!markNotified(key)) return
		const title = await titleOf(sessionId)
		if (isSubagent(sessionId)) return // lineage learned by the list refresh above
		await broadcastNotice({
			title: '💥 任务出错',
			template: 'red',
			markdown: `**会话**：${title}（${shortId(sessionId)}）\n\n\`\`\`\n${clip(String(message), 800)}\n\`\`\``,
			ctx: { kind: 'session', sessionId },
		})
	}

	// ── global event streams ───────────────────────────────────────────────
	function onMuxEnvelope(envelope) {
		const frame = envelope?.payload
		const rpcId = envelope?.rpcId
		if (frame === undefined || frame === null) return
		switch (frame.type) {
			case 'session/subscribed': {
				ensureMeta(frame.sessionId)
				return
			}
			case 'session/event': {
				const event = frame.event
				const meta = ensureMeta(frame.sessionId)
				if (event?.type === 'turn/start') {
					meta.turnText = ''
					if (meta.turnEndTimer !== undefined) { clearTimeout(meta.turnEndTimer); meta.turnEndTimer = undefined }
				} else if (event?.type === 'assistant/message') {
					const text = extractMessageText(event.data?.message)
					if (text !== '') { meta.turnText = text; meta.lastText = text }
				} else if (event?.type === 'turn/end') {
					if (cfg.pushOn?.turnEnd === true && !isSubagent(frame.sessionId)) {
						meta.endText = meta.turnText || meta.lastText
						if (meta.turnEndTimer !== undefined) clearTimeout(meta.turnEndTimer)
						const sessionId = frame.sessionId
						// Raw setTimeout (not the shared `later` set): a turn that
						// restarts within the debounce window clears this handle, and
						// an externally-cleared `later` entry would leak in the set.
						meta.turnEndTimer = setTimeout(() => {
							meta.turnEndTimer = undefined
							if (!disposed) notifyTurnEnd(sessionId).catch(() => {})
						}, TURN_END_DEBOUNCE_MS)
					}
				}
				return
			}
			case 'approval/requested': {
				// Subagent approvals are recorded like any other: they are pushed
				// (blocking waits must never go unnoticed) and answerable via
				// serial number or quote-reply.
				const meta = ensureMeta(frame.sessionId)
				const entry = { rpcId, approvalId: frame.approvalId, toolName: frame.toolName, reason: frame.reason, at: Date.now() }
				meta.pendingApprovals.set(frame.approvalId, entry)
				notifyApproval(frame.sessionId, entry).catch(() => {})
				return
			}
			case 'approval/resolved': {
				sessionMeta.get(frame.sessionId)?.pendingApprovals.delete(frame.approvalId)
				return
			}
			case 'question/requested': {
				const meta = ensureMeta(frame.sessionId)
				const entry = { rpcId, questions: frame.questions ?? [], at: Date.now() }
				meta.pendingQuestion = entry
				notifyQuestion(frame.sessionId, entry).catch(() => {})
				return
			}
			case 'question/resolved': {
				const meta = sessionMeta.get(frame.sessionId)
				if (meta?.pendingQuestion?.rpcId === frame.questionRpcId) meta.pendingQuestion = undefined
				return
			}
			case 'stream/error': {
				log.warn('mux stream error frame:', JSON.stringify(frame.error ?? {}))
				return
			}
			default:
		}
	}

	function onHostEnvelope(envelope) {
		const frame = envelope?.payload
		if (frame === undefined || frame === null) return
		switch (frame.type) {
			case 'host/session-status': {
				ensureMeta(frame.sessionId).running = frame.running
				return
			}
			case 'host/agent-error': {
				notifyError(frame.sessionId, frame.message).catch(() => {})
				return
			}
			case 'host/session-added': {
				ensureMeta(frame.sessionId)
				markLineage(frame.sessionId, frame)
				titleCache.at = 0 // force title refresh on next need
				return
			}
			case 'host/session-removed': {
				sessionMeta.delete(frame.sessionId)
				subagentParents.delete(frame.sessionId)
				for (const [openId, sessionId] of focusByUser) if (sessionId === frame.sessionId) focusByUser.delete(openId)
				return
			}
			default:
		}
	}

	async function runStream(name, open, consume) {
		while (!disposed) {
			try {
				const stream = open()
				for await (const envelope of stream) {
					if (disposed) break
					try { consume(envelope) } catch (error) { log.error(`${name} frame handler failed:`, String(error?.message ?? error)) }
				}
			} catch (error) {
				if (disposed) break
				log.warn(`${name} stream error:`, String(error?.message ?? error))
				stats.lastError = `${name}: ${String(error?.message ?? error)}`
			}
			if (disposed) break
			await sleep(STREAM_RETRY_MS)
		}
	}

	// ── inbound routing ────────────────────────────────────────────────────
	function isAllowed(openId) {
		const allow = Array.isArray(cfg.allowedOpenIds) ? cfg.allowedOpenIds.filter((id) => id !== '') : []
		return allow.length === 0 ? false : allow.includes(openId)
	}

	function whitelistConfigured() {
		return Array.isArray(cfg.allowedOpenIds) && cfg.allowedOpenIds.some((id) => id !== '')
	}

	function pendingApprovalsOf(sessionId) {
		return [...(sessionMeta.get(sessionId)?.pendingApprovals.values() ?? [])].sort((a, b) => a.at - b.at)
	}

	function allPendingApprovals() {
		const all = []
		for (const [sessionId, meta] of sessionMeta) {
			for (const entry of meta.pendingApprovals.values()) all.push({ sessionId, ...entry })
		}
		return all.sort((a, b) => a.at - b.at)
	}

	async function respondApproval(target, outcome, replyTo) {
		try {
			const receipt = await apiProxy.respond({
				type: 'client-response',
				rpcId: target.rpcId,
				result: { ok: true, value: { sessionId: target.sessionId, approvalId: target.approvalId, outcome } },
			})
			if (receipt?.accepted === true) {
				sessionMeta.get(target.sessionId)?.pendingApprovals.delete(target.approvalId)
				await replyText(replyTo, outcome === 'allowed-once' ? '✅ 已批准，任务继续执行' : '⛔ 已拒绝该请求')
			} else {
				await replyText(replyTo, '⚠️ 该审批请求已失效（可能已在别处处理或被取消）')
			}
		} catch (error) {
			await replyText(replyTo, '⚠️ 处理审批失败：' + String(error?.message ?? error))
		}
	}

	async function resolveApprovalTarget(directive, openId) {
		if (directive.serial !== undefined) {
			const ctxEntry = bySerial.get(directive.serial)
			if (ctxEntry?.kind === 'approval') {
				const meta = sessionMeta.get(ctxEntry.sessionId)
				const entry = meta?.pendingApprovals.get(ctxEntry.approvalId)
				if (entry !== undefined) return { sessionId: ctxEntry.sessionId, ...entry }
			}
			return undefined
		}
		const focusId = focusByUser.get(openId)
		if (focusId !== undefined) {
			const list = pendingApprovalsOf(focusId)
			if (list.length > 0) return { sessionId: focusId, ...list[list.length - 1] }
		}
		const all = allPendingApprovals()
		if (all.length === 1) return all[0]
		return undefined
	}

	async function respondQuestion(target, rawText, replyTo) {
		const built = buildQuestionAnswer(target.questions, rawText)
		if ('error' in built) { await replyText(replyTo, '⚠️ ' + built.error); return }
		try {
			const receipt = await apiProxy.respond({
				type: 'client-response',
				rpcId: target.rpcId,
				result: { ok: true, value: { sessionId: target.sessionId, answer: { answers: built.answers } } },
			})
			if (receipt?.accepted === true) {
				const meta = sessionMeta.get(target.sessionId)
				if (meta?.pendingQuestion?.rpcId === target.rpcId) meta.pendingQuestion = undefined
				await replyText(replyTo, '✅ 已提交回答，任务继续执行')
			} else {
				await replyText(replyTo, '⚠️ 该提问已失效（可能已在别处回答或被取消）')
			}
		} catch (error) {
			await replyText(replyTo, '⚠️ 提交回答失败：' + String(error?.message ?? error))
		}
	}

	async function promptSession(sessionId, text, replyTo) {
		try {
			const response = await apiProxy.sessions.prompt({
				rpcId: randomUUID(),
				payload: { sessionId, mode: 'queue', content: [{ type: 'text', text }] },
			})
			if (response?.result?.ok === true) {
				focusByUser.set(replyTo.openId, sessionId)
				const title = await titleOf(sessionId)
				await replyText(replyTo.messageId, `✓ 已发送到「${title}」，完成后会推送结果`)
			} else {
				const error = response?.result?.error
				await replyText(replyTo.messageId, '⚠️ 发送失败：' + (error?.message ?? 'unknown error'))
			}
		} catch (error) {
			await replyText(replyTo.messageId, '⚠️ 发送失败：' + String(error?.message ?? error))
		}
	}

	async function handleList(openId, replyTo) {
		await refreshTitles(true)
		let items = []
		let workspaces = []
		let archived = new Set()
		try {
			const [sessionsResp, wsResp] = await Promise.all([
				apiProxy.sessions.list({ rpcId: randomUUID(), payload: {} }),
				apiProxy.workspace.list({ rpcId: randomUUID(), payload: {} }),
			])
			if (sessionsResp?.result?.ok === true) items = sessionsResp.result.value.items ?? []
			if (wsResp?.result?.ok === true) {
				workspaces = wsResp.result.value.items ?? []
				archived = new Set(wsResp.result.value.archivedSessionIds ?? [])
			}
		} catch (error) {
			await replyText(replyTo.messageId, '⚠️ 获取会话列表失败：' + String(error?.message ?? error))
			return
		}
		// Grouped by workspace: sessions of each workspace (newest first), at
		// most LIST_PER_WORKSPACE shown per group; numbering stays sequential
		// across the whole list so `/use <序号>` works unchanged.
		const LIST_PER_WORKSPACE = 10
		const summaryById = new Map()
		for (const item of items) {
			// Main-agent sessions only: subagent descendants cannot be steered
			// via sessions.prompt, so they are not focus candidates here (their
			// blocking approvals/questions are still pushed, just not listable).
			if (item.blank !== true && !archived.has(item.sessionId) && !isSubagent(item.sessionId)) summaryById.set(item.sessionId, item)
		}
		if (summaryById.size === 0) { await replyText(replyTo.messageId, '当前没有会话。用 /new <内容> 新建一个。'); return }
		const lines = []
		const orderedIds = []
		const listed = new Set()
		const renderSession = (item) => {
			const meta = sessionMeta.get(item.sessionId)
			let state = '● 空闲'
			if (meta?.pendingApprovals.size > 0) state = '🔐 待审批'
			else if (meta?.pendingQuestion !== undefined) state = '❓ 待回答'
			else if (item.running === true || meta?.running === true) state = '▶ 运行中'
			const title = titleCache.map.get(item.sessionId) ?? `会话 ${shortId(item.sessionId)}`
			const focusMark = focusByUser.get(openId) === item.sessionId ? ' ★' : ''
			orderedIds.push(item.sessionId)
			listed.add(item.sessionId)
			return `${orderedIds.length}. [${state}] ${title}${focusMark}`
		}
		const renderGroup = (header, members) => {
			if (members.length === 0) return
			lines.push(header)
			// Every member counts as affiliated even when the 10-item window
			// hides it — otherwise truncated sessions leak into 未分组.
			for (const item of members) listed.add(item.sessionId)
			for (const item of members.slice(0, LIST_PER_WORKSPACE)) lines.push('  ' + renderSession(item))
			if (members.length > LIST_PER_WORKSPACE) lines.push(`  …还有 ${members.length - LIST_PER_WORKSPACE} 条`)
		}
		for (const ws of workspaces) {
			const members = (ws.sessionIds ?? [])
				.map((id) => summaryById.get(id))
				.filter((item) => item !== undefined)
				.sort((a, b) => b.updatedAt - a.updatedAt)
			renderGroup(`📁 ${ws.title !== '' ? ws.title : ws.path}（${members.length}）`, members)
		}
		const rest = [...summaryById.values()]
			.filter((item) => !listed.has(item.sessionId))
			.sort((a, b) => b.updatedAt - a.updatedAt)
		renderGroup('📁 未分组', rest)
		lastListByUser.set(openId, orderedIds)
		await replyText(replyTo.messageId, lines.join('\n') + '\n\n/use <序号> 切换焦点会话')
	}

	async function handleUse(openId, ref, replyTo) {
		const list = lastListByUser.get(openId) ?? []
		const num = Number(ref)
		let sessionId
		if (Number.isInteger(num) && num >= 1 && num <= list.length) sessionId = list[num - 1]
		else {
			// Match by short id against the meta map.
			for (const id of sessionMeta.keys()) if (shortId(id) === ref || id === ref) { sessionId = id; break }
		}
		if (sessionId === undefined) { await replyText(replyTo.messageId, '⚠️ 找不到该会话，先用 /list 查看编号'); return }
		focusByUser.set(openId, sessionId)
		const title = await titleOf(sessionId)
		await replyText(replyTo.messageId, `✓ 焦点已切换到「${title}」，之后直接发文字即转发给该会话`)
	}

	async function handleNew(openId, message, replyTo) {
		try {
			const response = await apiProxy.sessions.create({ rpcId: randomUUID(), payload: {} })
			if (response?.result?.ok !== true) {
				await replyText(replyTo.messageId, '⚠️ 新建会话失败：' + (response?.result?.error?.message ?? 'unknown error'))
				return
			}
			const sessionId = response.result.value.sessionId
			focusByUser.set(openId, sessionId)
			await replyText(replyTo.messageId, `✓ 已创建会话 ${shortId(sessionId)}，正在发送首条消息…`)
			await promptSession(sessionId, message, replyTo)
		} catch (error) {
			await replyText(replyTo.messageId, '⚠️ 新建会话失败：' + String(error?.message ?? error))
		}
	}

	async function handleCancel(openId, replyTo) {
		const sessionId = focusByUser.get(openId)
		if (sessionId === undefined) { await replyText(replyTo.messageId, '⚠️ 当前没有焦点会话，先 /list + /use 选择'); return }
		try {
			const response = await apiProxy.sessions.cancel({ rpcId: randomUUID(), payload: { sessionId } })
			if (response?.result?.ok === true) await replyText(replyTo.messageId, '✓ 已请求取消当前回合')
			else await replyText(replyTo.messageId, '⚠️ 取消失败：' + (response?.result?.error?.message ?? 'unknown error'))
		} catch (error) {
			await replyText(replyTo.messageId, '⚠️ 取消失败：' + String(error?.message ?? error))
		}
	}

	function helpText() {
		return [
			'指令列表：',
			'/list — 列出会话（编号+状态）',
			'/use <序号> — 切换焦点会话',
			'纯文本 — 转发给焦点会话（等同在界面输入）',
			'/new <内容> — 新建会话并发送首条消息',
			'/cancel — 取消焦点会话当前回合',
			'批准 / 拒绝 [序号] — 处理权限审批',
			'数字或选项文字 — 回答待处理提问',
			'/id — 查看你的 open_id',
			'也可以直接「回复」某条通知消息来定位上下文',
		].join('\n')
	}

	async function route(openId, message, rawText) {
		const replyTo = { messageId: message.message_id, openId }
		const directive = parseDirective(rawText)
		if (directive.kind === 'empty') return
		if (directive.kind === 'whoami') { await replyText(message.message_id, `你的 open_id：\n${openId}\n请把它加入插件设置的白名单`); return }
		if (directive.kind === 'help') { await replyText(message.message_id, helpText()); return }
		if (!whitelistConfigured()) {
			if (!hintSent.has(message.chat_id)) {
				hintSent.add(message.chat_id)
				await replyText(message.message_id, '⚠️ 白名单未配置：请在 DeepSeek Harness 设置 →「飞书机器人」中把你的 open_id 加入白名单（发 /id 可查询）')
			}
			return
		}
		if (!isAllowed(openId)) {
			if (!hintSent.has('deny:' + openId)) {
				hintSent.add('deny:' + openId)
				await replyText(message.message_id, '⚠️ 你不在操作白名单中，指令被忽略')
			}
			return
		}

		// Reply-to-notification routing: a direct reply to one of our pushes
		// inherits that notification's context without needing serial numbers.
		// (Feishu sets parent_id only for the quote-reply gesture; a plain
		// message has none and rides the focus-session path instead.)
		const parentId = message.parent_id ?? message.root_id
		const parentCtx = typeof parentId === 'string' ? sentCtx.get(parentId) : undefined
		if (typeof parentId === 'string' && parentId !== '' && parentCtx === undefined) {
			log.info('feishu reply to %s carries no known notification context (sent before last restart?)', parentId)
		}

		switch (directive.kind) {
			case 'list': return void await handleList(openId, replyTo)
			case 'use': return void await handleUse(openId, directive.ref, replyTo)
			case 'new': return void await handleNew(openId, directive.message, replyTo)
			case 'cancel': return void await handleCancel(openId, replyTo)
			case 'approve':
			case 'reject': {
				const target = await resolveApprovalTarget(directive, openId)
				if (target === undefined) { await replyText(message.message_id, '⚠️ 找不到待处理的审批请求（可能已处理）；用 /list 查看会话状态'); return }
				await respondApproval(target, directive.kind === 'approve' ? 'allowed-once' : 'rejected', message.message_id)
				return
			}
			default:
		}

		// Question answering: an explicit numeric directive or a direct reply
		// to a question notification.
		const focusId = focusByUser.get(openId)
		const focusQuestion = focusId !== undefined ? sessionMeta.get(focusId)?.pendingQuestion : undefined
		if (directive.kind === 'maybe-answer') {
			const serialEntry = bySerial.get(directive.serial)
			if (serialEntry?.kind === 'question') {
				const meta = sessionMeta.get(serialEntry.sessionId)
				if (meta?.pendingQuestion?.rpcId === serialEntry.rpcId) {
					await respondQuestion({ sessionId: serialEntry.sessionId, ...meta.pendingQuestion }, String(directive.serial), message.message_id)
					return
				}
			}
			if (focusQuestion !== undefined) {
				await respondQuestion({ sessionId: focusId, ...focusQuestion }, rawText, message.message_id)
				return
			}
		}
		if (parentCtx?.kind === 'question') {
			const meta = sessionMeta.get(parentCtx.sessionId)
			if (meta?.pendingQuestion?.rpcId === parentCtx.rpcId) {
				await respondQuestion({ sessionId: parentCtx.sessionId, ...meta.pendingQuestion }, rawText, message.message_id)
				return
			}
			await replyText(message.message_id, '⚠️ 该提问已失效')
			return
		}
		if (parentCtx?.kind === 'approval') {
			const approveHit = /^(批准|允许|同意|通过|approve|yes|y)$/i.test(rawText.trim())
			const rejectHit = /^(拒绝|否决|不同意|不批|驳回|reject|no|n|deny)$/i.test(rawText.trim())
			const meta = sessionMeta.get(parentCtx.sessionId)
			const entry = meta?.pendingApprovals.get(parentCtx.approvalId)
			if (entry === undefined) { await replyText(message.message_id, '⚠️ 该审批已失效'); return }
			if (!approveHit && !rejectHit) { await replyText(message.message_id, '请回复「批准」或「拒绝」'); return }
			await respondApproval({ sessionId: parentCtx.sessionId, ...entry }, approveHit ? 'allowed-once' : 'rejected', message.message_id)
			return
		}

		// Plain text → the focus session (multi-turn loop). A session-focus is
		// established automatically when a notification about that session is
		// pushed (autoFocus), or by quote-replying to one of our pushes.
		const targetSession = parentCtx?.sessionId !== undefined ? parentCtx.sessionId : focusByUser.get(openId)
		if (parentCtx?.sessionId !== undefined) focusByUser.set(openId, parentCtx.sessionId)
		if (targetSession === undefined) {
			await replyText(message.message_id, '还没有焦点会话：/list 查看会话，/use <序号> 选择，或 /new <内容> 新建；收到某会话的通知后直接发文字也会自动进该会话')
			return
		}
		focusByUser.set(openId, targetSession)
		await promptSession(targetSession, rawText, replyTo)
	}

	async function onEvent(data) {
		if (disposed) return
		try {
			const message = data?.message
			const sender = data?.sender
			if (message === undefined || sender?.sender_type !== 'user') return
			if (message.message_type !== 'text') {
				await replyText(message.message_id, '暂时只支持文本消息')
				return
			}
			let text = ''
			try { text = JSON.parse(message.content)?.text ?? '' } catch { return }
			if (message.chat_type === 'group') {
				const mentions = Array.isArray(message.mentions) ? message.mentions : []
				let botMentioned = botOpenId === null // unknown bot id → accept any mention
				for (const mention of mentions) {
					if (botOpenId !== null && mention?.id?.open_id === botOpenId) botMentioned = true
					// Strip every mention placeholder from the working text.
					if (typeof mention?.key === 'string' && mention.key !== '') {
						text = text.split(mention.key).join(' ')
					}
				}
				if (!botMentioned) return
			}
			const openId = sender.sender_id?.open_id
			if (typeof openId !== 'string' || openId === '') return
			stats.received += 1
			await route(openId, message, text.trim())
		} catch (error) {
			log.error('inbound handler failed:', String(error?.message ?? error))
		}
	}

	// ── lifecycle ──────────────────────────────────────────────────────────
	let restartTimer

	function scheduleRestart(reason) {
		if (disposed) return
		if (restartTimer !== undefined) return
		stats.state = 'restarting'
		stats.restarts += 1
		const delay = Math.min(RESTART_MAX_BACKOFF_MS, 1000 * 2 ** Math.min(stats.restarts, 6))
		log.warn(`feishu bot restarting in ${delay}ms (${reason})`)
		restartTimer = setTimeout(() => {
			restartTimer = undefined
			if (disposed) return
			stopTransports()
			startInternal().catch((error) => {
				log.error('feishu bot restart failed:', String(error?.message ?? error))
				stats.lastError = String(error?.message ?? error)
				stats.state = 'error'
				scheduleRestart('restart failed')
			})
		}, delay)
	}

	function stopTransports() {
		for (const handle of timers) clearTimeout(handle)
		timers.clear()
		if (wsClient !== null) {
			try { wsClient.close({ force: true }) } catch { /* already closed */ }
			wsClient = null
		}
	}

	async function startInternal() {
		const loaded = await loadSdk()
		if (disposed) return
		client = new loaded.Client({ appId: cfg.appId, appSecret: cfg.appSecret, appType: loaded.AppType.SelfBuild })
		const dispatcher = new loaded.EventDispatcher({}).register({
			'im.message.receive_v1': (data) => { void onEvent(data) },
		})
		wsClient = new loaded.WSClient({
			appId: cfg.appId,
			appSecret: cfg.appSecret,
			loggerLevel: loaded.LoggerLevel.error,
			handshakeTimeoutMs: 20000,
			onReady: () => { stats.state = 'connected'; stats.lastError = '' },
			onReconnecting: () => { stats.state = 'reconnecting' },
			onReconnected: () => { stats.state = 'connected'; stats.lastError = '' },
			onError: (error) => {
				stats.state = 'error'
				stats.lastError = String(error?.message ?? error)
				log.error('feishu long connection fatal:', stats.lastError)
				scheduleRestart('fatal ws error')
			},
		})
		await wsClient.start({ eventDispatcher: dispatcher })
		stats.state = 'connected'
		stats.startedAt = Date.now()
		// Learn our own open_id for group @-mention filtering. This SDK build
		// has no client.bot.info; use the raw request helper (GET /open-apis/bot/v3/info).
		try {
			const info = await client.request({ url: '/open-apis/bot/v3/info', method: 'GET' })
			const own = info?.bot?.open_id
			if (typeof own === 'string' && own !== '') botOpenId = own
		} catch { /* group filtering degrades to any-mention */ }
		// Global monitors: same API surface the browser GUI consumes.
		void runStream('mux', () => apiProxy.events.mux({ rpcId: randomUUID(), payload: {} }, abort.signal), onMuxEnvelope)
		void runStream('host', () => apiProxy.events.host({ rpcId: randomUUID(), payload: {} }, abort.signal), onHostEnvelope)
		later(function watchdog() {
			try {
				const status = wsClient?.getConnectionStatus?.()
				if (status?.state === 'failed') scheduleRestart('watchdog: connection failed')
				else later(watchdog, WATCHDOG_MS)
			} catch { later(watchdog, WATCHDOG_MS) }
		}, WATCHDOG_MS)
		log.info('feishu bot started (targets: %d, whitelist: %d)', targets().length, (cfg.allowedOpenIds ?? []).filter((x) => x !== '').length)
	}

	return {
		async start() {
			if (started) return
			started = true
			try {
				await startInternal()
			} catch (error) {
				stats.state = 'error'
				stats.lastError = String(error?.message ?? error)
				log.error('feishu bot start failed:', stats.lastError)
				scheduleRestart('initial start failed')
				throw error
			}
		},
		stop() {
			disposed = true
			if (restartTimer !== undefined) { clearTimeout(restartTimer); restartTimer = undefined }
			abort.abort()
			stopTransports()
			stats.state = 'stopped'
		},
		status() {
			const pendingApprovals = allPendingApprovals().length
			let pendingQuestions = 0
			for (const meta of sessionMeta.values()) if (meta.pendingQuestion !== undefined) pendingQuestions += 1
			return {
				state: stats.state,
				lastError: stats.lastError,
				startedAt: stats.startedAt,
				restarts: stats.restarts,
				sent: stats.sent,
				received: stats.received,
				targets: targets().length,
				pendingApprovals,
				pendingQuestions,
				connection: (() => { try { return wsClient?.getConnectionStatus?.() ?? null } catch { return null } })(),
			}
		},
		async sendTest() {
			const list = targets()
			if (list.length === 0) return { ok: false, error: '未配置任何推送目标（用户或群聊）' }
			if (client === null) {
				const loaded = await loadSdk()
				client = new loaded.Client({ appId: cfg.appId, appSecret: cfg.appSecret, appType: loaded.AppType.SelfBuild })
			}
			const results = []
			for (const target of list) {
				try {
					await sendFormatted(target, '✅ DeepSeek Harness 测试消息', '飞书机器人配置成功！任务状态将推送到这里。\n\n发送 **/help** 查看可用指令。', 'green')
					results.push({ id: target.id, ok: true })
				} catch (error) {
					results.push({ id: target.id, ok: false, error: String(error?.message ?? error) })
				}
			}
			return { ok: results.some((r) => r.ok), results }
		},
		/** Push one sample notification card (no real session involved: no ctx,
		 *  no focus change, no reply-routing registration). */
		async sendDemo(kind) {
			const samples = {
				turnEnd: {
					title: '✅ 任务结束（样例）',
					template: 'green',
					markdown: '**会话**：样例会话（demo-0001）\n\n这是一条**样例回复**，用于预览卡片渲染：\n\n```python\ndef fib(n):\n    return n if n < 2 else fib(n - 1) + fib(n - 2)\n```\n\n- 支持代码块与 `行内代码`\n- 支持**加粗**、列表与[链接](https://open.feishu.cn)\n\n---\n继续：直接发送文本即可向该会话下达指令（焦点已自动切换到该会话）',
				},
				approval: {
					title: '🔐 需要审批（样例）[1]',
					template: 'orange',
					markdown: '**会话**：样例会话（demo-0001）\n**工具**：`bash`\n**原因**：命令需要工作区外写入：`npm install -g prettier`\n\n回复「批准」或「拒绝」处理（可带序号，如：批准 1）',
				},
				question: {
					title: '❓ 等待回答（样例）[2]',
					template: 'blue',
					markdown: '**会话**：样例会话（demo-0001）\n\n本次发布采用哪种部署方式？\n1. Docker 容器化 — 打成镜像后部署\n2. 宿主机直跑 — 用系统 Node 直接运行\n3. 取消本次发布\n\n回复选项序号（如 1）或自定义文字作答（序号：2）',
				},
				error: {
					title: '💥 任务出错（样例）',
					template: 'red',
					markdown: '**会话**：样例会话（demo-0001）\n\n```\nError: LLM request failed after 3 retries\n  cause: connect ETIMEDOUT api.example.com:443\n```',
				},
			}
			const sample = samples[kind]
			if (sample === undefined) return { ok: false, error: `unknown demo type "${kind}" (turnEnd/approval/question/error)` }
			if (targets().length === 0) return { ok: false, error: '未配置任何推送目标（用户或群聊）' }
			if (client === null) {
				const loaded = await loadSdk()
				client = new loaded.Client({ appId: cfg.appId, appSecret: cfg.appSecret, appType: loaded.AppType.SelfBuild })
			}
			try {
				await broadcastNotice({ ...sample })
				return { ok: true, kind }
			} catch (error) {
				return { ok: false, error: String(error?.message ?? error) }
			}
		},
	}
}

/** Internal hooks for unit tests / debugging. */
export const __testing = { extractMessageText, buildQuestionAnswer, parseDirective, clip, buildCard, shortId }

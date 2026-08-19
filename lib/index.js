/**
 * dsh-code — host half.
 *
 * Provides:
 *  - the `codex-clone` settings namespace (theme flavor, background image,
 *    username, avatar, quick prompts) persisted in $DSH_HOME/settings.yaml;
 *  - a `/__codex` HTTP route family on the web server:
 *      GET  /__codex/git?session=<id>    git change stats for the session cwd
 *      GET  /__codex/git?cwd=<path>      git change stats for an explicit dir
 *      GET  /__codex/stats               aggregate usage stats + daily activity
 *      GET  /__codex/asset?f=<name>      serve uploaded avatar/background files
 *      POST /__codex/upload              store an image, returns its asset URL
 *
 * The browser half (./client) consumes these endpoints with plain fetch().
 */
import { execFile } from 'node:child_process'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { randomBytes } from 'node:crypto'
import os from 'node:os'
import path from 'node:path'
import { settingsNamespace } from '@deepseek-ai/dsh-settings'
import z from '@deepseek-ai/schemastery'

export const NAMESPACE = 'dsh-code'
const NS = settingsNamespace(NAMESPACE)

/** Durable settings owned by this plugin. */
const CodexCloneSchema = z.object({
	/** Active Catppuccin flavor (or built-in light/dark/system). */
	themeFlavor: z.union(['system', 'light', 'dark', 'latte', 'frappe', 'macchiato', 'mocha']).default('mocha'),
	/** Background image URL ('' = none). May be an asset URL, http(s) URL or data: URL. */
	backgroundImage: z.string().default(''),
	/** 0..1 — how strongly the wallpaper shows through translucent surfaces. */
	backgroundOpacity: z.number().min(0.05).max(0.9).default(0.3),
	/** Display name shown on the profile page. */
	username: z.string().default(''),
	/** Avatar URL ('' = generated initials). */
	avatar: z.string().default(''),
	/** Quick-prompt cards shown above the composer on the home screen. */
	quickPrompts: z
		.array(z.object({ title: z.string(), icon: z.string().default('✨'), prompt: z.string() }))
		.default([]),
})

// ── tiny HTTP helpers ────────────────────────────────────────────────────────

function sendJson(res, code, value) {
	const body = JSON.stringify(value)
	res.writeHead(code, {
		'content-type': 'application/json; charset=utf-8',
		'cache-control': 'no-store',
	})
	res.end(body)
}

function readBody(req, limit) {
	return new Promise((resolve, reject) => {
		const chunks = []
		let size = 0
		req.on('data', (chunk) => {
			size += chunk.length
			if (size > limit) {
				reject(new Error('payload too large'))
				req.destroy()
				return
			}
			chunks.push(chunk)
		})
		req.on('end', () => resolve(Buffer.concat(chunks)))
		req.on('error', reject)
	})
}

function git(args, cwd, timeoutMs = 8000) {
	return new Promise((resolve) => {
		execFile('git', args, { cwd, timeout: timeoutMs, maxBuffer: 16 * 1024 * 1024 }, (error, stdout, stderr) => {
			if (error) resolve({ ok: false, error: stderr || String(error) })
			else resolve({ ok: true, stdout })
		})
	})
}

// ── git change stats ─────────────────────────────────────────────────────────

const gitCache = new Map() // cwd -> { at, value }
const GIT_TTL_MS = 2500

async function gitStats(cwd) {
	const cached = gitCache.get(cwd)
	if (cached !== undefined && Date.now() - cached.at < GIT_TTL_MS) return cached.value
	const probe = await git(['rev-parse', '--is-inside-work-tree'], cwd)
	if (!probe.ok || probe.stdout.trim() !== 'true') {
		const value = { isRepo: false }
		gitCache.set(cwd, { at: Date.now(), value })
		return value
	}
	const [branchR, statusR, numstatR] = await Promise.all([
		git(['symbolic-ref', '--short', 'HEAD'], cwd),
		git(['status', '--porcelain'], cwd),
		git(['diff', 'HEAD', '--numstat'], cwd),
	])
	let branch = branchR.ok ? branchR.stdout.trim() : ''
	if (branch === '') {
		const rev = await git(['rev-parse', '--short', 'HEAD'], cwd)
		branch = rev.ok ? rev.stdout.trim() : 'HEAD'
	}
	const lines = statusR.ok ? statusR.stdout.split('\n').filter((line) => line.trim() !== '') : []
	let untracked = 0
	let changed = 0
	for (const line of lines) {
		if (line.startsWith('??')) untracked += 1
		else changed += 1
	}
	let added = 0
	let deleted = 0
	const files = []
	const numstatSource = numstatR.ok ? numstatR.stdout : (await git(['diff', '--cached', '--numstat'], cwd)).stdout ?? ''
	for (const line of numstatSource.split('\n')) {
		if (line.trim() === '') continue
		const [a, d, ...rest] = line.split('\t')
		const file = rest.join('\t')
		if (file === '') continue
		const add = a === '-' ? 0 : Number(a) || 0
		const del = d === '-' ? 0 : Number(d) || 0
		added += add
		deleted += del
		files.push({ file, added: add, deleted: del })
	}
	files.sort((x, y) => y.added + y.deleted - (x.added + x.deleted))
	const value = {
		isRepo: true,
		branch,
		added,
		deleted,
		changed,
		untracked,
		files: files.slice(0, 120),
	}
	gitCache.set(cwd, { at: Date.now(), value })
	return value
}

// ── workspace file search (for @ mentions) ───────────────────────────────────

const FILE_SEARCH_IGNORE_DIRS = new Set([
	'node_modules', '.git', 'dist', 'build', 'out', 'coverage', '.next', '.nuxt', '.output',
	'__pycache__', '.venv', 'venv', '.tox', '.mypy_cache', '.pytest_cache', 'target',
	'.gradle', '.idea', '.vscode', '.cache', '.turbo', '.svelte-kit',
])
const FILE_SEARCH_IGNORE_FILES = new Set(['.DS_Store', 'Thumbs.db', 'desktop.ini'])
const FILE_SEARCH_ROOT_DOTFILES = new Set(['.gitignore', '.gitattributes', '.editorconfig', '.env', '.envrc', '.npmrc'])

/** Recursively list files/directories under root, pruning junk directories. */
async function walkWorkspace(root, { maxEntries = 40000, maxDepth = 12 } = {}) {
	const entries = []
	const stack = [{ dir: root, rel: '', depth: 0 }]
	while (stack.length > 0) {
		const frame = stack.pop()
		let dirents
		try {
			dirents = await readdir(frame.dir, { withFileTypes: true })
		} catch {
			continue
		}
		dirents.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
		for (const dirent of dirents) {
			if (entries.length >= maxEntries) break
			if (FILE_SEARCH_IGNORE_FILES.has(dirent.name)) continue
			if (dirent.isDirectory()) {
				if (dirent.name.startsWith('.') || FILE_SEARCH_IGNORE_DIRS.has(dirent.name)) continue
				const rel = frame.rel === '' ? dirent.name : `${frame.rel}/${dirent.name}`
				entries.push({ name: dirent.name, rel, type: 'dir' })
				if (frame.depth + 1 < maxDepth) stack.push({ dir: path.join(frame.dir, dirent.name), rel, depth: frame.depth + 1 })
			} else if (dirent.isFile()) {
				if (dirent.name.startsWith('.') && !(frame.depth === 0 && FILE_SEARCH_ROOT_DOTFILES.has(dirent.name))) continue
				const rel = frame.rel === '' ? dirent.name : `${frame.rel}/${dirent.name}`
				entries.push({ name: dirent.name, rel, type: 'file' })
			}
		}
	}
	return entries
}

const filesCache = new Map() // root -> { at, entries: Promise<entries> }
const FILES_TTL_MS = 8000

async function workspaceEntries(root) {
	const cached = filesCache.get(root)
	if (cached !== undefined && Date.now() - cached.at < FILES_TTL_MS) return cached.entries
	const promise = walkWorkspace(root)
	filesCache.set(root, { at: Date.now(), entries: promise })
	if (filesCache.size > 16) filesCache.delete(filesCache.keys().next().value)
	return promise
}

/** Rank entries against a query; empty query yields a shallow dirs-first suggestion list. */
function searchWorkspaceEntries(entries, query, limit = 30) {
	const nq = (query ?? '').trim().toLowerCase()
	const scored = []
	for (const entry of entries) {
		const name = entry.name.toLowerCase()
		const rel = entry.rel.toLowerCase()
		let score
		if (nq === '') {
			const depth = rel.split('/').length - 1
			score = depth * 2 + (entry.type === 'dir' ? 0 : 1)
		} else if (nq.includes('/')) {
			if (rel.startsWith(nq)) score = 0
			else if (rel.includes(`/${nq}`)) score = 1
			else if (rel.includes(nq)) score = 2
			else continue
		} else {
			if (name.startsWith(nq)) score = 0
			else if (name.includes(nq)) score = 1
			else if (rel.includes(nq)) score = 2
			else continue
		}
		scored.push({ entry, score, len: entry.rel.length })
	}
	scored.sort((a, b) => a.score - b.score || a.len - b.len || (a.entry.rel < b.entry.rel ? -1 : 1))
	return scored.slice(0, limit).map((s) => s.entry)
}

// ── usage stats engine ───────────────────────────────────────────────────────

let statsCache // { at, value }
const STATS_TTL_MS = 20000

function dayKey(time, offsetMinutes) {
	const local = new Date(time - offsetMinutes * 60000)
	const y = local.getUTCFullYear()
	const m = String(local.getUTCMonth() + 1).padStart(2, '0')
	const d = String(local.getUTCDate()).padStart(2, '0')
	return `${y}-${m}-${d}`
}

async function computeStats(ctx, tzOffsetMinutes) {
	const persistence = ctx.get('sessionPersistence')
	if (persistence === undefined) return { error: 'session persistence unavailable' }
	const headers = await persistence.list()
	const daily = Object.create(null)
	let totalTokens = 0
	let peakTokens = 0
	let longestChatMs = 0
	let totalTurns = 0
	let memberSince = 0
	for (const header of headers) {
		let events
		try {
			events = (await persistence.readFrom(header.id, 0)).events
		} catch {
			continue
		}
		if (events.length === 0) continue
		if (memberSince === 0 || header.createdAt < memberSince) memberSince = header.createdAt
		let sessionTokens = 0
		let first = 0
		let last = 0
		let turns = 0
		for (const event of events) {
			if (event.time > 0) {
				if (first === 0 || event.time < first) first = event.time
				if (event.time > last) last = event.time
				const day = dayKey(event.time, tzOffsetMinutes)
				daily[day] ??= { tokens: 0, events: 0 }
				daily[day].events += 1
			}
			if (event.type === 'turn/start') turns += 1
			if (event.type === 'assistant/message') {
				const usage = event.data?.usage
				if (usage !== undefined) {
					const input = usage.inputTokens || 0
					const output = usage.outputTokens || 0
					const cacheRead = usage.cacheReadTokens || 0
					const cacheWrite = usage.cacheWriteTokens || 0
					const all = input + output + cacheRead + cacheWrite
					sessionTokens += all
					const pressure = input + cacheRead + cacheWrite
					if (pressure > peakTokens) peakTokens = pressure
					if (event.time > 0) daily[dayKey(event.time, tzOffsetMinutes)].tokens += all
				}
			}
		}
		totalTokens += sessionTokens
		totalTurns += turns
		if (sessionTokens > 0 && first > 0 && last > first) {
			daily[dayKey(first, tzOffsetMinutes)].sessions = (daily[dayKey(first, tzOffsetMinutes)].sessions ?? 0) + 1
			const duration = last - first
			if (duration > longestChatMs) longestChatMs = duration
		}
	}
	// streaks over active days
	const days = Object.keys(daily).sort()
	let longestStreak = 0
	let run = 0
	let prev // previous day Date
	for (const key of days) {
		const date = new Date(`${key}T00:00:00Z`)
		if (prev !== undefined && date.getTime() - prev.getTime() === 86400000) run += 1
		else run = 1
		if (run > longestStreak) longestStreak = run
		prev = date
	}
	const todayKey = dayKey(Date.now(), tzOffsetMinutes)
	const yesterdayKey = dayKey(Date.now() - 86400000, tzOffsetMinutes)
	let currentStreak = 0
	if (daily[todayKey] !== undefined || daily[yesterdayKey] !== undefined) {
		let cursor = daily[todayKey] !== undefined ? new Date(`${todayKey}T00:00:00Z`) : new Date(`${yesterdayKey}T00:00:00Z`)
		for (;;) {
			const key = cursor.toISOString().slice(0, 10)
			if (daily[key] === undefined) break
			currentStreak += 1
			cursor = new Date(cursor.getTime() - 86400000)
		}
	}
	return {
		generatedAt: Date.now(),
		sessionCount: headers.length,
		totalTokens,
		peakTokens,
		longestChatMs,
		totalTurns,
		memberSince,
		currentStreak,
		longestStreak,
		daily,
	}
}

// ── asset storage ────────────────────────────────────────────────────────────

function assetsDir() {
	const home = process.env.DSH_HOME || path.join(os.homedir(), '.dsh')
	return path.join(home, 'codex-clone-assets')
}

const EXT_BY_MAGIC = [
	[/^\x89PNG/, '.png', 'image/png'],
	[/^\xff\xd8\xff/, '.jpg', 'image/jpeg'],
	[/^RIFF....WEBP/, '.webp', 'image/webp'],
	[/^GIF8/, '.gif', 'image/gif'],
]

const MIME_BY_EXT = {
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.webp': 'image/webp',
	'.gif': 'image/gif',
	'.svg': 'image/svg+xml',
}

// ── route handler ────────────────────────────────────────────────────────────

function makeHandler(ctx) {
	return async (req, res) => {
		try {
			const url = new URL(req.url ?? '/', 'http://localhost')
			const route = url.pathname
			if (route === '/__codex/git') {
				let cwd = url.searchParams.get('cwd')
				if (cwd === null || cwd === '') {
					const sessionId = url.searchParams.get('session')
					const resolved = sessionId === null ? undefined : await resolveSessionCwd(ctx, sessionId)
					cwd = resolved ?? process.cwd()
				}
				sendJson(res, 200, await gitStats(cwd))
				return
			}
			if (route === '/__codex/files') {
				let cwd = url.searchParams.get('cwd')
				if (cwd === null || cwd === '') {
					const sessionId = url.searchParams.get('session')
					cwd = sessionId === null ? undefined : await resolveSessionCwd(ctx, sessionId)
				}
				const root = path.resolve(cwd ?? process.cwd())
				const q = url.searchParams.get('q') ?? ''
				const limit = Math.max(1, Math.min(Number(url.searchParams.get('limit')) || 30, 60))
				const entries = await workspaceEntries(root)
				sendJson(res, 200, { root, items: searchWorkspaceEntries(entries, q, limit) })
				return
			}
			if (route === '/__codex/stats') {
				const tz = Number(url.searchParams.get('tz')) || 0
				if (statsCache !== undefined && Date.now() - statsCache.at < STATS_TTL_MS && statsCache.tz === tz) {
					sendJson(res, 200, statsCache.value)
					return
				}
				const value = await computeStats(ctx, tz)
				statsCache = { at: Date.now(), tz, value }
				sendJson(res, 200, value)
				return
			}
			if (route === '/__codex/upload' && req.method === 'POST') {
				const body = await readBody(req, 12 * 1024 * 1024)
				const head = body.slice(0, 16).toString('latin1')
				const magic = EXT_BY_MAGIC.find(([re]) => re.test(head))
				if (magic === undefined) {
					sendJson(res, 400, { error: 'unsupported image type (png/jpeg/webp/gif allowed)' })
					return
				}
				const dir = assetsDir()
				await mkdir(dir, { recursive: true })
				const name = `${Date.now().toString(36)}-${randomBytes(4).toString('hex')}${magic[1]}`
				await writeFile(path.join(dir, name), body)
				sendJson(res, 200, { url: `/__codex/asset?f=${name}` })
				return
			}
			if (route === '/__codex/asset') {
				const file = path.basename(url.searchParams.get('f') ?? '')
				if (file === '' || file === '.' || file === '..') {
					res.writeHead(404)
					res.end()
					return
				}
				const full = path.join(assetsDir(), file)
				const ext = path.extname(file).toLowerCase()
				const mime = MIME_BY_EXT[ext]
				if (mime === undefined) {
					res.writeHead(404)
					res.end()
					return
				}
				try {
					const body = await readFile(full)
					res.writeHead(200, { 'content-type': mime, 'cache-control': 'public, max-age=86400' })
					res.end(body)
				} catch {
					res.writeHead(404)
					res.end()
				}
				return
			}
			sendJson(res, 404, { error: 'unknown codex-clone route' })
		} catch (error) {
			try {
				sendJson(res, 500, { error: String(error?.message ?? error) })
			} catch {
				/* response already closed */
			}
		}
	}
}

async function resolveSessionCwd(ctx, sessionId) {
	const sessions = ctx.get('sessions')
	if (sessions !== undefined) {
		const live = sessions.get(sessionId)
		const cwd = live?.header?.cwd
		if (typeof cwd === 'string' && cwd !== '') return cwd
	}
	const persistence = ctx.get('sessionPersistence')
	if (persistence !== undefined && typeof persistence.list === 'function') {
		try {
			for (const header of await persistence.list()) {
				if (header.id === sessionId && typeof header.cwd === 'string' && header.cwd !== '') return header.cwd
			}
		} catch {
			/* fall through to process cwd */
		}
	}
	return undefined
}

// ── plugin body ──────────────────────────────────────────────────────────────

export const name = 'dsh-code'

export function apply(ctx) {
	ctx.inject(['settings'], (settingsCtx) => {
		try {
			settingsCtx.settings.register(NS, CodexCloneSchema)
		} catch (error) {
			settingsCtx.logger?.warn?.(`dsh-code: settings registration failed: ${String(error?.message ?? error)}`)
		}
	})
	ctx.inject(['webServer'], (httpCtx) => {
		httpCtx.effect(() => httpCtx.webServer.register({ kind: 'prefix', path: '/__codex', handler: makeHandler(httpCtx) }), 'dsh-code: /__codex routes')
		// Inject inline CSS + script into the HTML <head> so wide-chat takes effect
		// on the very first paint. CSS variables defined on child elements (.wSkVaW_root)
		// override html-level ones, and !important doesn't work on custom properties,
		// so we use a MutationObserver to set inline styles directly on the root element
		// as soon as it appears in the DOM — before the browser paints it.
		httpCtx.effect(() => httpCtx.webServer.tapIndex((html) => {
			const css = `<style id="ccx-wide-chat-early">html.ccx-wide-chat [data-conversation-scroll]{padding-left:32px!important;padding-right:32px!important}html.ccx-wide-chat [data-composer-seat]{padding-left:32px!important;padding-right:32px!important;background:transparent!important}html.ccx-wide-chat .ccx-homecards{max-width:100%!important}html.ccx-wide-chat .ccx-cards-row{right:56px}</style>`
			const script = `<script>try{var _c=localStorage.getItem("dsh-code:config:v1")||localStorage.getItem("dsh-codex-clone:config:v1");if(_c&&JSON.parse(_c).wideChat===true){document.documentElement.classList.add("ccx-wide-chat");var _s=new WeakSet;var _o=new MutationObserver(function(){var _all=document.querySelectorAll("[data-phase]");for(var i=0;i<_all.length;i++){var _r=_all[i];if(!_s.has(_r)){_r.style.setProperty("--dsh-chat-content-width","9999px","important");_r.style.setProperty("--dsh-composer-card-max-width","9999px","important");_s.add(_r)}}});_o.observe(document.body||document.documentElement,{childList:true,subtree:true})}}catch(e){}<\/script>`
			return html.replace('</head>', css + script + '</head>')
		}), 'dsh-code: wide-chat early injection')
	})
}

/** Internal hooks for unit tests / debugging. */
export const __filesSearch = { walkWorkspace, searchWorkspaceEntries }

export default { name, apply }

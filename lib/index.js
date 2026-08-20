/**
 * dsh-code — host half.
 *
 * Provides:
 *  - the `codex-clone` settings namespace (theme flavor, background image,
 *    username, avatar, quick prompts) persisted in $DSH_HOME/settings.yaml;
 *  - a `/__codex` HTTP route family on the web server:
 *      GET  /__codex/git?session=<id>    git change stats for the session cwd
 *      GET  /__codex/git?cwd=<path>      git change stats for an explicit dir
 *      GET  /__codex/file?path=<p>       read one workspace file for the preview sidebar
 *      POST /__codex/file                write one workspace file (editor save)
 *      GET  /__codex/raw?path=<p>        serve raw workspace file bytes (markdown images)
 *      GET  /__codex/tree                recursive workspace listing for the file-tree sidebar
 *      GET  /__codex/stats               aggregate usage stats + daily activity
 *      GET  /__codex/asset?f=<name>      serve uploaded avatar/background files
 *      POST /__codex/upload              store an image, returns its asset URL
 *
 * The browser half (./client) consumes these endpoints with plain fetch().
 */
import { execFile } from 'node:child_process'
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises'
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
	const [branchR, statusR, numstatR, untrackedR] = await Promise.all([
		git(['symbolic-ref', '--short', 'HEAD'], cwd),
		git(['status', '--porcelain'], cwd),
		git(['diff', 'HEAD', '--numstat'], cwd),
		git(['ls-files', '--others', '--exclude-standard'], cwd),
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
	// Append untracked file names so the git card can list (and preview) them too.
	const seen = new Set(files.map((f) => f.file))
	const untrackedFiles = []
	if (untrackedR.ok) {
		for (const line of untrackedR.stdout.split('\n')) {
			const file = line.trim()
			if (file === '' || seen.has(file)) continue
			seen.add(file)
			untrackedFiles.push({ file, added: 0, deleted: 0, untracked: true })
		}
	}
	files.push(...untrackedFiles)
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

// ── workspace file reader (for the preview sidebar) ─────────────────────────

/** Text reads cap out here; anything larger reports its size without content. */
const FILE_READ_MAX_TEXT = 1.5 * 1024 * 1024
/** Images ride back to the browser as base64 data URLs, so allow a bigger cap. */
const FILE_READ_MAX_IMAGE = 6 * 1024 * 1024
const FILE_READ_IMAGE_EXTS = new Set([
	'.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.ico', '.svg', '.avif',
])

/** Cheap binary sniff: a NUL byte inside the head chunk marks non-text content. */
function looksBinary(buffer) {
	const n = Math.min(buffer.length, 8192)
	for (let i = 0; i < n; i += 1) {
		if (buffer[i] === 0) return true
	}
	return false
}

/**
 * Read one file for the browser preview sidebar.
 * Relative paths resolve against the session workspace (`session` param, or an
 * explicit `cwd`); `~/...` expands against the server user's home. Directory
 * targets return a shallow entry listing instead of content.
 */
async function readWorkspaceFile(ctx, url) {
	const requested = url.searchParams.get('path') ?? ''
	if (requested === '') return { status: 400, body: { error: 'missing path' } }
	let base
	const cwdParam = url.searchParams.get('cwd')
	if (cwdParam !== null && cwdParam !== '') {
		base = cwdParam
	} else {
		const sessionId = url.searchParams.get('session')
		base = (sessionId !== null ? await resolveSessionCwd(ctx, sessionId) : undefined) ?? process.cwd()
	}
	let target = requested
	if (target.startsWith('~/')) target = path.join(os.homedir(), target.slice(2))
	else if (target === '~') target = os.homedir()
	const abs = path.resolve(base, target)
	let stats
	try {
		stats = await stat(abs)
	} catch {
		return { status: 404, body: { error: 'no such file', path: abs } }
	}
	if (stats.isDirectory()) {
		let dirents = []
		try {
			dirents = await readdir(abs, { withFileTypes: true })
		} catch {
			return { status: 404, body: { error: 'directory unreadable', path: abs } }
		}
		dirents.sort((a, b) => (a.isDirectory() === b.isDirectory() ? (a.name < b.name ? -1 : 1) : a.isDirectory() ? -1 : 1))
		const entries = dirents.slice(0, 400).map((d) => ({ name: d.name, type: d.isDirectory() ? 'dir' : 'file' }))
		return { status: 200, body: { path: abs, kind: 'dir', count: dirents.length, entries } }
	}
	if (!stats.isFile()) return { status: 400, body: { error: 'not a regular file', path: abs } }
	const ext = path.extname(abs).toLowerCase()
	const isImage = FILE_READ_IMAGE_EXTS.has(ext)
	const cap = isImage ? FILE_READ_MAX_IMAGE : FILE_READ_MAX_TEXT
	if (stats.size > cap) {
		return {
			status: 200,
			body: { path: abs, kind: 'file', size: stats.size, mtime: stats.mtimeMs, tooLarge: true, image: isImage || undefined },
		}
	}
	let buffer
	try {
		buffer = await readFile(abs)
	} catch (error) {
		return { status: 500, body: { error: String(error?.message ?? error), path: abs } }
	}
	if (isImage) {
		return {
			status: 200,
			body: { path: abs, kind: 'file', size: stats.size, mtime: stats.mtimeMs, encoding: 'base64', image: true, content: buffer.toString('base64') },
		}
	}
	if (looksBinary(buffer)) {
		return {
			status: 200,
			body: { path: abs, kind: 'file', size: stats.size, mtime: stats.mtimeMs, encoding: 'base64', binary: true, content: buffer.toString('base64') },
		}
	}
	return {
		status: 200,
		body: { path: abs, kind: 'file', size: stats.size, mtime: stats.mtimeMs, encoding: 'utf8', content: buffer.toString('utf8') },
	}
}

// ── workspace file writer (for the file-tree editor) ────────────────────────

/** Editor saves cap out here (payload is JSON: content + metadata). */
const FILE_WRITE_MAX_BODY = 6 * 1024 * 1024

/**
 * Write one file from the browser editor. The target must stay inside the
 * session workspace (`cwd`/`session` resolution mirrors readWorkspaceFile);
 * `~/...` expansion is intentionally NOT applied so writes cannot escape the
 * workspace via the home shortcut. An optional `mtime` (the mtime the editor
 * loaded) yields 409 when the file changed on disk in the meantime. Parent
 * directories are created on demand so saving a brand-new path works.
 */
async function writeWorkspaceFile(ctx, url, req) {
	let raw
	try {
		raw = await readBody(req, FILE_WRITE_MAX_BODY)
	} catch {
		return { status: 413, body: { error: 'payload too large' } }
	}
	let payload
	try {
		payload = JSON.parse(raw.toString('utf8'))
	} catch {
		return { status: 400, body: { error: 'invalid json body' } }
	}
	const requested = typeof payload.path === 'string' ? payload.path.trim() : ''
	if (requested === '') return { status: 400, body: { error: 'missing path' } }
	if (typeof payload.content !== 'string') return { status: 400, body: { error: 'missing content' } }
	let base
	const cwdParam = typeof payload.cwd === 'string' && payload.cwd !== ''
		? payload.cwd
		: url.searchParams.get('cwd')
	if (cwdParam !== null && cwdParam !== '') {
		base = cwdParam
	} else {
		const sessionId = typeof payload.session === 'string' && payload.session !== ''
			? payload.session
			: url.searchParams.get('session')
		base = (sessionId !== null ? await resolveSessionCwd(ctx, sessionId) : undefined) ?? process.cwd()
	}
	base = path.resolve(base)
	const abs = path.resolve(base, requested)
	const rel = path.relative(base, abs)
	if (rel === '' || rel.startsWith('..') || path.isAbsolute(rel)) {
		return { status: 403, body: { error: 'path escapes the workspace', path: abs } }
	}
	if (typeof payload.mtime === 'number') {
		try {
			const current = await stat(abs)
			// 1ms tolerance for filesystem mtime granularity.
			if (current.mtimeMs > payload.mtime + 1) {
				return { status: 409, body: { error: 'file changed on disk', path: abs, mtime: current.mtimeMs } }
			}
		} catch {
			/* file does not exist yet — create it below */
		}
	}
	try {
		await mkdir(path.dirname(abs), { recursive: true })
		await writeFile(abs, payload.content, 'utf8')
	} catch (error) {
		return { status: 500, body: { error: String(error?.message ?? error), path: abs } }
	}
	const stats = await stat(abs)
	return { status: 200, body: { path: abs, size: stats.size, mtime: stats.mtimeMs } }
}

// ── workspace raw file server (markdown images, inline assets) ──────────────

/** Raw serving caps out here; larger assets are refused rather than buffered. */
const FILE_RAW_MAX = 20 * 1024 * 1024
const RAW_MIME_BY_EXT = {
	'.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
	'.webp': 'image/webp', '.bmp': 'image/bmp', '.ico': 'image/x-icon', '.svg': 'image/svg+xml',
	'.avif': 'image/avif', '.pdf': 'application/pdf',
	'.txt': 'text/plain; charset=utf-8', '.md': 'text/markdown; charset=utf-8',
	'.json': 'application/json; charset=utf-8', '.csv': 'text/csv; charset=utf-8',
	'.mp4': 'video/mp4', '.webm': 'video/webm', '.mp3': 'audio/mpeg', '.wav': 'audio/wav',
}

/**
 * Serve one workspace file's raw bytes (for `<img src>` rewriting in rendered
 * markdown). Resolution mirrors readWorkspaceFile, but the target MUST stay
 * inside the workspace — this route puts bytes straight into the browser, so
 * `~/` expansion is intentionally not applied here.
 */
async function serveWorkspaceFileRaw(ctx, url, res) {
	const requested = url.searchParams.get('path') ?? ''
	if (requested === '') {
		sendJson(res, 400, { error: 'missing path' })
		return
	}
	let base
	const cwdParam = url.searchParams.get('cwd')
	if (cwdParam !== null && cwdParam !== '') {
		base = cwdParam
	} else {
		const sessionId = url.searchParams.get('session')
		base = (sessionId !== null ? await resolveSessionCwd(ctx, sessionId) : undefined) ?? process.cwd()
	}
	base = path.resolve(base)
	const abs = path.resolve(base, requested)
	const rel = path.relative(base, abs)
	if (rel === '' || rel.startsWith('..') || path.isAbsolute(rel)) {
		sendJson(res, 403, { error: 'path escapes the workspace', path: abs })
		return
	}
	let stats
	try {
		stats = await stat(abs)
	} catch {
		sendJson(res, 404, { error: 'no such file', path: abs })
		return
	}
	if (!stats.isFile()) {
		sendJson(res, 400, { error: 'not a regular file', path: abs })
		return
	}
	if (stats.size > FILE_RAW_MAX) {
		sendJson(res, 413, { error: 'file too large', path: abs })
		return
	}
	let buffer
	try {
		buffer = await readFile(abs)
	} catch (error) {
		sendJson(res, 500, { error: String(error?.message ?? error), path: abs })
		return
	}
	const ext = path.extname(abs).toLowerCase()
	res.writeHead(200, {
		'content-type': RAW_MIME_BY_EXT[ext] ?? 'application/octet-stream',
		'content-length': buffer.length,
		'cache-control': 'private, max-age=300',
	})
	res.end(buffer)
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
			if (route === '/__codex/file') {
				if (req.method === 'POST') {
					const { status, body } = await writeWorkspaceFile(ctx, url, req)
					sendJson(res, status, body)
					return
				}
				const { status, body } = await readWorkspaceFile(ctx, url)
				sendJson(res, status, body)
				return
			}
			if (route === '/__codex/tree') {
				let cwd = url.searchParams.get('cwd')
				if (cwd === null || cwd === '') {
					const sessionId = url.searchParams.get('session')
					cwd = sessionId === null ? undefined : await resolveSessionCwd(ctx, sessionId)
				}
				const root = path.resolve(cwd ?? process.cwd())
				const entries = await workspaceEntries(root)
				sendJson(res, 200, { root, entries, truncated: entries.length >= 40000 })
				return
			}
			if (route === '/__codex/raw') {
				await serveWorkspaceFileRaw(ctx, url, res)
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
export const __fileReader = { readWorkspaceFile, writeWorkspaceFile, looksBinary }
export const __rawServer = { serveWorkspaceFileRaw }

export default { name, apply }

#!/usr/bin/env node
/**
 * dsh-codex-clone installer.
 *
 * 1. Symlinks this package into ~/.dsh/profiles/node_modules (client-modules
 *    resolves `package.json` from the profile's baseUrl).
 * 2. Symlinks this package into the dsh installation's node_modules (the
 *    Loader's bare `import()` resolves from the install tree).
 * 3. Appends the loader row to the web profile's cordis.patch.yml.
 *
 * Idempotent: re-running repairs drifted links and never duplicates the row.
 */
import { existsSync, lstatSync, mkdirSync, readFileSync, readlinkSync, rmSync, symlinkSync, writeFileSync, readdirSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const PKG_DIR = path.dirname(fileURLToPath(import.meta.url))
const PKG_NAME = 'dsh-codex-clone'
const DSH_HOME = process.env.DSH_HOME || path.join(os.homedir(), '.dsh')
const PROFILES_MODULES = path.join(DSH_HOME, 'profiles', 'node_modules')
const WEB_PATCH = path.join(DSH_HOME, 'profiles', 'web', 'cordis.patch.yml')

function fail(message) {
	console.error(`install: ${message}`)
	process.exit(1)
}

/** Locate the dsh installation's node_modules (the npx cache entry holding @deepseek-ai/dsh). */
function findInstallNodeModules() {
	if (process.env.DSH_INSTALL_NODE_MODULES) return process.env.DSH_INSTALL_NODE_MODULES
	const npxRoot = path.join(os.homedir(), '.npm', '_npx')
	if (existsSync(npxRoot)) {
		for (const entry of readdirSync(npxRoot)) {
			const candidate = path.join(npxRoot, entry, 'node_modules', '@deepseek-ai', 'dsh', 'package.json')
			if (existsSync(candidate)) return path.join(npxRoot, entry, 'node_modules')
		}
	}
	// fall back: resolve upward from a globally installed dsh
	fail('cannot locate the dsh installation node_modules; set DSH_INSTALL_NODE_MODULES=/path/to/node_modules')
}

function ensureSymlink(link, target) {
	mkdirSync(path.dirname(link), { recursive: true })
	if (existsSync(link) || lstatExists(link)) {
		if (lstatSync(link).isSymbolicLink()) {
			if (readlinkSync(link) === target) return 'ok'
			rmSync(link)
		} else {
			fail(`${link} exists and is not a symlink; refusing to touch it`)
		}
	}
	symlinkSync(target, link, 'dir')
	return 'created'
}

function lstatExists(p) {
	try {
		lstatSync(p)
		return true
	} catch {
		return false
	}
}

// ── 1 + 2: symlinks ──────────────────────────────────────────────────────────
const installModules = findInstallNodeModules()
const profileLink = path.join(PROFILES_MODULES, PKG_NAME)
const installLink = path.join(installModules, PKG_NAME)
console.log(`1) profile node_modules link: ${ensureSymlink(profileLink, PKG_DIR)} (${profileLink})`)
console.log(`2) install node_modules link: ${ensureSymlink(installLink, PKG_DIR)} (${installLink})`)

// ── 3: patch row ─────────────────────────────────────────────────────────────
if (!existsSync(WEB_PATCH)) fail(`web profile patch not found at ${WEB_PATCH}`)
const ROW_ID = 'dsh-codex-clone'
const INSERT_BLOCK = [
	'',
	'# dsh-codex-clone: Codex-style UI (themes, wallpaper, git card, $ skills, profile).',
	'- insert:',
	'    - id: dsh-codex-clone',
	"      name: 'dsh-codex-clone'",
	'',
].join('\n')
let patch = readFileSync(WEB_PATCH, 'utf8')
if (patch.includes(`id: ${ROW_ID}`)) {
	console.log('3) patch row already present; skipped')
} else {
	const stripped = patch.replace(/#[^\n]*/g, '').trim()
	if (stripped === '[]') {
		patch = patch.replace(/\[\s*\]\s*$/, INSERT_BLOCK)
	} else {
		patch = patch.endsWith('\n') ? patch + INSERT_BLOCK : patch + '\n' + INSERT_BLOCK
	}
	writeFileSync(WEB_PATCH, patch)
	console.log(`3) patch row appended to ${WEB_PATCH}`)
}

console.log('\nDone. Restart the dsh web server and refresh the browser to activate the plugin.')

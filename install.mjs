#!/usr/bin/env node
/**
 * dsh-code installer.
 *
 * 1. Symlinks this package into ~/.dsh/profiles/node_modules (client-modules
 *    resolves `package.json` from the profile's baseUrl).
 * 2. Symlinks this package into the dsh installation's node_modules (the
 *    Loader's bare `import()` resolves from the install tree).
 * 3. Appends the loader row to every profile's cordis.patch.yml (web, desktop,
 *    and any future profiles discovered under ~/.dsh/profiles/).
 *
 * Idempotent: re-running repairs drifted links and never duplicates the row.
 *
 * Upgrades from the pre-rename `dsh-codex-clone` install are handled
 * automatically: legacy symlinks and the legacy patch row are removed before
 * the new `dsh-code` registration is applied.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, lstatSync, mkdirSync, readFileSync, readlinkSync, rmSync, statSync, symlinkSync, writeFileSync, readdirSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const PKG_DIR = path.dirname(fileURLToPath(import.meta.url))
const PKG_NAME = 'dsh-code'
const LEGACY_PKG_NAME = 'dsh-codex-clone'
const DSH_HOME = process.env.DSH_HOME || path.join(os.homedir(), '.dsh')
const PROFILES_MODULES = path.join(DSH_HOME, 'profiles', 'node_modules')
const PROFILES_DIR = path.join(DSH_HOME, 'profiles')

function fail(message) {
	console.error(`install: ${message}`)
	process.exit(1)
}

/** Locate the dsh installation's node_modules (the npx cache entry holding
 *  @deepseek-ai/dsh). Multiple cached versions can coexist after upgrades
 *  (npx keeps one directory per resolved version); prefer the most recently
 *  installed one so relinking targets the tree you are about to run. */
function findInstallNodeModules() {
	if (process.env.DSH_INSTALL_NODE_MODULES) return process.env.DSH_INSTALL_NODE_MODULES
	const npxRoot = path.join(os.homedir(), '.npm', '_npx')
	if (existsSync(npxRoot)) {
		let best = null
		for (const entry of readdirSync(npxRoot)) {
			const pkgJson = path.join(npxRoot, entry, 'node_modules', '@deepseek-ai', 'dsh', 'package.json')
			if (!existsSync(pkgJson)) continue
			let mtimeMs = 0
			try { mtimeMs = statSync(pkgJson).mtimeMs } catch { /* keep 0 */ }
			if (best === null || mtimeMs > best.mtimeMs) {
				best = { mtimeMs, modules: path.join(npxRoot, entry, 'node_modules') }
			}
		}
		if (best !== null) return best.modules
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

// ── 0 + 1 + 2: symlinks ──────────────────────────────────────────────────────
const installModules = findInstallNodeModules()
// 0) Local dependency links: the package is imported via its realpath (this
//    directory), so its own imports (@deepseek-ai/dsh-settings, schemastery)
//    resolve from THIS node_modules. Gitignored; recreated on every install.
for (const dep of ['dsh-settings', 'schemastery', 'cordis']) {
	const link = path.join(PKG_DIR, 'node_modules', '@deepseek-ai', dep)
	const target = path.join(installModules, '@deepseek-ai', dep)
	ensureSymlink(link, target)
}
console.log('0) local dependency links ensured (node_modules/@deepseek-ai/*)')
// 0.5) Real npm dependencies. Unlike the @deepseek-ai/* links above (resolved
//      from the dsh install tree), @larksuiteoapi/node-sdk is a plain npm
//      dependency of THIS package and must live in this node_modules. The
//      feishu module imports it lazily, so a missing install only disables the
//      bot instead of breaking the plugin — but we try to install it here.
const FEISHU_SDK = path.join(PKG_DIR, 'node_modules', '@larksuiteoapi', 'node-sdk')
if (!existsSync(FEISHU_SDK)) {
	console.log('0.5) installing npm dependencies (@larksuiteoapi/node-sdk) …')
	const result = spawnSync('npm', ['install', '--omit=dev', '--no-audit', '--no-fund', '--cache', path.join(PKG_DIR, '.npm-cache')], {
		cwd: PKG_DIR,
		stdio: 'inherit',
	})
	if (result.status === 0 && existsSync(FEISHU_SDK)) {
		console.log('0.5) npm dependencies installed')
	} else {
		console.warn('0.5) WARNING: npm install did not complete; run `npm install` in this directory manually to enable the Feishu bot.')
	}
} else {
	console.log('0.5) npm dependencies already present (@larksuiteoapi/node-sdk)')
}
/** Remove a legacy (pre-rename) symlink if present; ignores anything that is not a symlink. */
function removeLegacySymlink(link) {
	if (lstatExists(link) && lstatSync(link).isSymbolicLink()) {
		rmSync(link)
		console.log(`removed legacy ${LEGACY_PKG_NAME} symlink: ${link}`)
	}
}
removeLegacySymlink(path.join(PROFILES_MODULES, LEGACY_PKG_NAME))
removeLegacySymlink(path.join(installModules, LEGACY_PKG_NAME))

const profileLink = path.join(PROFILES_MODULES, PKG_NAME)
const installLink = path.join(installModules, PKG_NAME)
console.log(`1) profile node_modules link: ${ensureSymlink(profileLink, PKG_DIR)} (${profileLink})`)
console.log(`2) install node_modules link: ${ensureSymlink(installLink, PKG_DIR)} (${installLink})`)

// ── 3: patch row (all profiles) ──────────────────────────────────────────────
// Discover every profile directory under ~/.dsh/profiles/ that contains a
// cordis.patch.yml (web, desktop, and any future profiles). The shared
// node_modules symlink (step 1) makes the client bundle visible to all of them.
const ROW_ID = 'dsh-code'
const INSERT_BLOCK = [
	'',
	'# dsh-code: Codex-style UI (themes, wallpaper, git card, $ skills, profile).',
	'- insert:',
	'    - id: dsh-code',
	"      name: 'dsh-code'",
	'',
].join('\n')

/** Strip legacy `dsh-codex-clone` registrations (comment, insert entry, emptied insert list). */
function removeLegacyPatchRows(text) {
	let changed = false
	const strip = (pattern) => {
		text = text.replace(pattern, () => { changed = true; return '' })
	}
	strip(new RegExp(`#[^\\n]*${LEGACY_PKG_NAME}[^\\n]*\\n`, 'g'))
	strip(new RegExp(`[ \\t]*-[ \\t]*id:[ \\t]*${LEGACY_PKG_NAME}[ \\t]*\\n[ \\t]*name:[ \\t]*'${LEGACY_PKG_NAME}'[ \\t]*\\n`, 'g'))
	strip(/^[ \t]*-[ \t]*insert:[ \t]*\n(?![ \t]+-[ \t])/gm)
	if (changed) text = text.replace(/\n{3,}/g, '\n\n')
	return { text, changed }
}

/** Ensure the dsh-code insert row exists in one profile's cordis.patch.yml. */
function ensurePatchRow(patchFile, profileName) {
	if (!existsSync(patchFile)) {
		console.log(`3) ${profileName}: patch file not found at ${patchFile}; skipped`)
		return
	}
	let patch = readFileSync(patchFile, 'utf8')
	const legacy = removeLegacyPatchRows(patch)
	if (legacy.changed) {
		patch = legacy.text
		writeFileSync(patchFile, patch)
		console.log(`3) ${profileName}: removed legacy ${LEGACY_PKG_NAME} rows`)
	}
	if (patch.includes(`id: ${ROW_ID}`)) {
		console.log(`3) ${profileName}: patch row already present; skipped`)
	} else {
		const stripped = patch.replace(/#[^\n]*/g, '').trim()
		if (stripped === '[]') {
			patch = patch.replace(/\[\s*\]\s*$/, INSERT_BLOCK)
		} else {
			patch = patch.endsWith('\n') ? patch + INSERT_BLOCK : patch + '\n' + INSERT_BLOCK
		}
		writeFileSync(patchFile, patch)
		console.log(`3) ${profileName}: patch row appended`)
	}
}

// Discover profile directories (each direct child of profiles/ that has a
// cordis.patch.yml is treated as a profile).
let patchedCount = 0
for (const entry of readdirSync(PROFILES_DIR)) {
	const patchFile = path.join(PROFILES_DIR, entry, 'cordis.patch.yml')
	if (entry === 'node_modules' || !existsSync(patchFile)) continue
	ensurePatchRow(patchFile, entry)
	patchedCount += 1
}
if (patchedCount === 0) {
	fail(`no profile cordis.patch.yml found under ${PROFILES_DIR}; run dsh once to initialize a profile`)
}

console.log(`\nDone. Patched ${patchedCount} profile(s). Restart dsh (web server or desktop app) to activate the plugin.`)

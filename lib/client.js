window.__ModuleLoader__.load({
	id: "dsh-code",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		const React = require("react");
		const h = React.createElement;
		const { useState, useEffect, useMemo, useRef, useCallback, useSyncExternalStore } = React;

		//#region styles
		const TAG_ID = "dsh-code/main.css";
		const CSS = `
/* ── home layout: composer stack anchored to the bottom on the hero screen ── */
[data-phase="hero"] > [data-conversation-scroll] {
	justify-content: flex-end !important;
	padding-bottom: 5vh;
}
/* ── wallpaper layer (set on <html>) sits behind everything ── */
html.ccx-wallpaper, html.ccx-wallpaper body {
	background-color: transparent !important;
}
/* ── wide chat mode: override DSH width variables ── */
html.ccx-wide-chat {
	--dsh-chat-content-width: 9999px !important;
	--dsh-composer-card-max-width: 9999px !important;
}
/* Elements tagged by JS as having restrictive max-width */
html.ccx-wide-chat [data-ccx-wide-target] {
	max-width: none !important;
	width: 100% !important;
	box-sizing: border-box !important;
}
/* Add horizontal padding so content doesn't touch edges */
html.ccx-wide-chat [data-conversation-scroll] {
	padding-left: 32px !important;
	padding-right: 32px !important;
}
html.ccx-wide-chat [data-composer-seat] {
	padding-left: 32px !important;
	padding-right: 32px !important;
	background: transparent !important;
}
/* HomeCards and CardsRow adapt: the composer card sits inside an input bar
   padded by --dsh-composer-side-clearance, so inset the greeting and the
   quick-prompt tiles by the same amount to keep their edges aligned with
   the composer card in wide mode (in normal mode the centered max-width
   already matches the card box). */
html.ccx-wide-chat .ccx-homecards {
	width: auto !important;
	max-width: none !important;
	margin: 0 var(--dsh-composer-side-clearance, 16px) !important;
}
html.ccx-wide-chat .ccx-cards-row {
	right: 56px;
}
/* ── home cards (input dock) ── */
.ccx-homecards { display:flex; flex-direction:column; gap:10px; width:100%; max-width:var(--dsh-composer-card-max-width); margin:0 auto; padding:0 4px; position:relative; }
/* Branch indicator - positioned to align with workspace/mode selector row above the composer */
.ccx-branch-indicator { position:absolute; top:-36px; right:0; display:flex; align-items:center; gap:4px; padding:4px 10px; border-radius:8px; background:var(--dsw-alias-bg-layer-1); border:1px solid var(--dsw-alias-border-l2); font-size:12px; font-family:var(--ds-font-family-code); color:var(--dsw-alias-label-secondary); }
.ccx-branch-icon { color:var(--dsw-alias-label-caption); }
.ccx-branch-name { color:var(--dsw-alias-label-primary); font-weight:500; }
.ccx-greet { display:flex; flex-direction:column; gap:2px; padding:0 6px 2px; }
.ccx-greet-title { font-size:20px; font-weight:600; color:var(--dsw-alias-label-primary); line-height:28px; }
/* ── task list (todo panel) above the composer: DSH sizes it narrower than the
   composer card (extra dock-inset subtractions); match the card's box instead.
   The card spans 100% minus the input bar's side-clearance padding, capped by
   --dsh-composer-card-max-width. ── */
[data-testid="todo-panel"] {
	width: calc(100% - var(--dsh-composer-side-clearance, 16px) - var(--dsh-composer-side-clearance, 16px)) !important;
	max-width: var(--dsh-composer-card-max-width) !important;
}
.ccx-tiles { display:grid; grid-template-columns:repeat(auto-fill,minmax(168px,1fr)); gap:8px; }
.ccx-tile { display:flex; flex-direction:column; gap:4px; text-align:left; padding:10px 12px; border-radius:14px; border:1px solid var(--dsw-alias-border-l2); background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 82%, transparent); color:var(--dsw-alias-label-primary); cursor:pointer; font:inherit; transition:border-color .12s, background-color .12s, transform .12s; backdrop-filter:blur(6px); }
.ccx-tile:hover { border-color:var(--dsw-alias-state-business-primary); background:var(--dsw-alias-interactive-bg-hover); transform:translateY(-1px); }
.ccx-tile-head { display:flex; align-items:center; gap:6px; font-size:13px; font-weight:500; line-height:20px; }
.ccx-tile-icon { font-size:15px; }
.ccx-tile-prompt { font-size:11px; color:var(--dsw-alias-label-caption); line-height:16px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
/* ── git change card — visually positioned below tab bar via fixed positioning ── */
.ccx-git-block { position:relative; display:flex; flex-direction:column; gap:6px; padding:8px 10px; border-radius:10px; border:1px solid var(--dsw-alias-border-l2); background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 92%, transparent); backdrop-filter:blur(8px); font-size:11px; }
/* Cards row: use fixed positioning to place below tab bar, top-right of conversation area */
.ccx-cards-row { position:fixed; top:80px; right:24px; z-index:50; display:flex; gap:6px; pointer-events:auto; }
/* Hide the input dock slot's default spacing when cards are fixed */
.ccx-cards-row:empty { display:none; }
.ccx-git-block-header { display:flex; align-items:center; justify-content:space-between; gap:8px; }
.ccx-git-block-title { font-size:13px; font-weight:500; color:var(--dsw-alias-label-primary); display:flex; align-items:center; gap:6px; }
.ccx-git-block-toggle { width:20px; height:20px; border:none; border-radius:6px; background:transparent; color:var(--dsw-alias-label-caption); cursor:pointer; display:grid; place-items:center; font-size:12px; transition:background-color .12s; }
.ccx-git-block-toggle:hover { background:var(--dsw-alias-interactive-bg-hover); }
.ccx-git-block-stats { display:flex; align-items:center; gap:12px; font-size:12px; font-family:var(--ds-font-family-code); }
.ccx-git-block-stat { display:flex; align-items:center; gap:4px; }
.ccx-git-add { color:var(--dsw-alias-state-success-primary); font-weight:600; }
.ccx-git-del { color:var(--dsw-alias-state-error-primary); font-weight:600; }
.ccx-git-files-count { color:var(--dsw-alias-label-caption); }
.ccx-git-dot { width:7px; height:7px; border-radius:50%; background:var(--dsw-alias-state-warn-primary); flex:none; }
.ccx-git-dot.clean { background:var(--dsw-alias-state-success-primary); }
.ccx-git-pop { position:absolute; top:calc(100% + 6px); right:0; z-index:60; min-width:300px; max-width:440px; max-height:340px; overflow:auto; border-radius:12px; border:1px solid var(--dsw-alias-border-l2); background:var(--dsw-alias-bg-overlay); box-shadow:var(--dsw-shadow-lv2, 0 8px 24px rgba(0,0,0,.18)); padding:8px; }
.ccx-git-pop-title { font-size:12px; color:var(--dsw-alias-label-caption); padding:2px 6px 8px; }
.ccx-git-file { display:flex; align-items:center; gap:8px; padding:4px 6px; border-radius:8px; font-size:12px; font-family:var(--ds-font-family-code); }
.ccx-git-file:hover { background:var(--dsw-alias-interactive-bg-hover); }
.ccx-git-file-path { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--dsw-alias-label-primary); direction:rtl; text-align:left; }
.ccx-git-empty { padding:10px 6px; font-size:12px; color:var(--dsw-alias-label-caption); }
/* ── $ skill menu ── */
.ccx-skillmenu { position:fixed; z-index:80; width:380px; max-width:calc(100vw - 32px); max-height:300px; overflow:auto; border-radius:12px; border:1px solid var(--dsw-alias-border-l2); background:var(--dsw-alias-bg-overlay); box-shadow:var(--dsw-shadow-lv2, 0 8px 24px rgba(0,0,0,.2)); padding:6px; }
.ccx-skillmenu-head { display:flex; align-items:center; justify-content:space-between; padding:4px 8px 6px; font-size:11px; color:var(--dsw-alias-label-caption); }
.ccx-skillmenu-kbd { font-family:var(--ds-font-family-code); border:1px solid var(--dsw-alias-border-l2); border-radius:4px; padding:0 4px; font-size:10px; }
.ccx-skill-item { display:flex; align-items:center; gap:8px; width:100%; padding:7px 8px; border:none; border-radius:8px; background:transparent; color:var(--dsw-alias-label-primary); font-size:13px; cursor:pointer; text-align:left; }
.ccx-skill-item.active { background:var(--dsw-alias-interactive-bg-hover-accent); }
.ccx-skill-item-name { font-weight:500; flex:none; font-family:var(--ds-font-family-code); }
.ccx-skill-item-desc { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--dsw-alias-label-caption); font-size:12px; }
/* ── @ file-mention chips (opaque tags covering the raw path text) ── */
.ccx-mention-overlay { position:fixed; z-index:60; pointer-events:none; overflow:hidden; }
.ccx-mention-mirror { position:fixed; left:0; top:0; z-index:-1; visibility:hidden; pointer-events:none; overflow:hidden; }
.ccx-chip { position:absolute; display:inline-flex; align-items:center; gap:4px; padding:0 6px; border-radius:6px; border:1px solid; box-sizing:border-box; overflow:hidden; white-space:nowrap; font-family:var(--ds-font-family-code, ui-monospace, SFMono-Regular, Menlo, monospace); }
.ccx-chip svg { flex:none; }
.ccx-chip-label { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
/* ── settings sections ── */
.ccx-section { display:flex; flex-direction:column; gap:22px; padding:4px 2px 24px; }
.ccx-group { display:flex; flex-direction:column; gap:10px; }
.ccx-group-title { font-size:14px; color:var(--dsw-alias-label-primary); line-height:22px; }
.ccx-group-hint { font-size:12px; color:var(--dsw-alias-label-caption); margin-top:-6px; }
.ccx-cubes { display:flex; flex-wrap:wrap; gap:8px; }
.ccx-cube { box-sizing:border-box; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; flex:1 0 108px; padding:14px 10px; border-radius:14px; border:1px solid var(--dsw-alias-border-l2); background:transparent; color:var(--dsw-alias-label-primary); font:inherit; font-size:13px; cursor:pointer; }
.ccx-cube:hover { background:var(--dsw-alias-interactive-bg-hover); }
.ccx-cube.selected { border-color:var(--dsw-alias-state-business-primary); background:var(--dsw-alias-interactive-bg-hover); }
.ccx-cube-dots { display:flex; gap:5px; }
.ccx-cube-dot { width:14px; height:14px; border-radius:50%; border:1px solid rgba(0,0,0,.08); }
.ccx-row { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.ccx-input { box-sizing:border-box; height:36px; padding:0 12px; border-radius:10px; border:1px solid var(--dsw-alias-border-l2); background:var(--dsw-alias-bg-layer-1); color:var(--dsw-alias-label-primary); font-size:13px; outline:none; min-width:0; }
.ccx-input:focus { border-color:var(--dsw-alias-state-business-primary); }
.ccx-btn { height:36px; padding:0 14px; border-radius:10px; border:1px solid var(--dsw-alias-border-l2); background:var(--dsw-alias-bg-layer-1); color:var(--dsw-alias-label-primary); font-size:13px; cursor:pointer; white-space:nowrap; }
.ccx-btn:hover { background:var(--dsw-alias-interactive-bg-hover); }
.ccx-btn.primary { background:var(--dsw-alias-button-info-fill); border-color:transparent; color:#fff; }
.ccx-btn.primary:hover { background:var(--dsw-alias-button-info-hover); }
.ccx-btn.danger { color:var(--dsw-alias-state-error-primary); }
.ccx-bg-preview { width:160px; height:90px; border-radius:12px; border:1px solid var(--dsw-alias-border-l2); background-size:cover; background-position:center; }
.ccx-range { accent-color:var(--dsw-alias-state-business-primary); width:180px; }
.ccx-qlist { display:flex; flex-direction:column; gap:6px; }
.ccx-qitem { display:flex; align-items:center; gap:8px; padding:8px 10px; border-radius:10px; border:1px solid var(--dsw-alias-border-l1); background:var(--dsw-alias-bg-layer-1); }
.ccx-qitem-body { flex:1; min-width:0; }
.ccx-qitem-title { font-size:13px; font-weight:500; color:var(--dsw-alias-label-primary); }
.ccx-qitem-prompt { font-size:12px; color:var(--dsw-alias-label-caption); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ccx-iconbtn { flex:none; width:26px; height:26px; border:none; border-radius:8px; background:transparent; color:var(--dsw-alias-label-caption); cursor:pointer; font-size:13px; }
.ccx-iconbtn:hover { background:var(--dsw-alias-interactive-bg-hover); color:var(--dsw-alias-state-error-primary); }
/* ── harness version row (bottom of the native General settings section) ──
   Mirrors the native settings item "group" so it blends in; the section CSS
   already strips the border-bottom of the last item, which this row is. */
.ccx-ver-group { display:flex; flex-direction:column; gap:8px; padding:16px 0; border-bottom:1px solid var(--dsw-alias-border-l2); }
.ccx-ver-title { font-size:14px; font-weight:400; line-height:22px; color:var(--dsw-alias-label-primary); }
.ccx-ver-value { font-size:13px; line-height:20px; color:var(--dsw-alias-label-secondary); font-family:var(--ds-font-family-code, ui-monospace, monospace); }
/* ── profile page ── */
.ccx-profile-head { position:relative; display:flex; flex-direction:column; align-items:center; gap:12px; padding:28px 2px 8px; text-align:center; }
.ccx-avatar-wrap { position:relative; flex:none; }
.ccx-avatar { width:96px; height:96px; border-radius:50%; object-fit:cover; display:block; border:2px solid var(--dsw-alias-border-l2); }
.ccx-avatar-fallback { width:96px; height:96px; border-radius:50%; display:grid; place-items:center; font-size:38px; font-weight:600; color:#fff; background:linear-gradient(135deg, var(--dsw-alias-state-business-primary), var(--dsw-static-purple-400, #9d7cd8)); }
.ccx-avatar-edit { position:absolute; right:2px; bottom:2px; width:24px; height:24px; border-radius:50%; border:1px solid var(--dsw-alias-border-l2); background:var(--dsw-alias-bg-overlay); color:var(--dsw-alias-label-secondary); cursor:pointer; font-size:11px; display:grid; place-items:center; }
.ccx-profile-id { display:flex; flex-direction:column; align-items:center; gap:6px; min-width:0; }
.ccx-profile-name-input { font-size:22px; font-weight:600; color:var(--dsw-alias-label-primary); background:transparent; border:none; border-bottom:1px dashed transparent; outline:none; padding:0 0 2px; max-width:320px; text-align:center; }
.ccx-profile-name-input:hover, .ccx-profile-name-input:focus { border-bottom-color:var(--dsw-alias-border-l2); }
.ccx-profile-sub { display:flex; align-items:center; gap:8px; font-size:13px; color:var(--dsw-alias-label-caption); }
.ccx-profile-sub { flex-wrap:wrap; justify-content:center; }
.ccx-statgrid { display:grid; grid-template-columns:repeat(5, 1fr); border:1px solid var(--dsw-alias-border-l1); border-radius:14px; background:var(--dsw-alias-bg-layer-1); overflow:hidden; }
.ccx-stat { display:flex; flex-direction:column; align-items:center; gap:6px; padding:16px 8px; }
.ccx-stat + .ccx-stat { border-left:1px solid var(--dsw-alias-border-l1); }
.ccx-stat-value { font-size:18px; font-weight:600; color:var(--dsw-alias-label-primary); font-variant-numeric:tabular-nums; line-height:24px; white-space:nowrap; }
.ccx-stat-label { font-size:12px; color:var(--dsw-alias-label-caption); white-space:nowrap; }
.ccx-heat-head { display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap; }
.ccx-heat-head .ccx-group-title { font-size:15px; font-weight:600; }
.ccx-seg { display:flex; gap:4px; }
.ccx-seg button { border:none; background:transparent; color:var(--dsw-alias-label-caption); font-size:13px; padding:4px 10px; cursor:pointer; border-radius:8px; }
.ccx-seg button.on { color:var(--dsw-alias-label-primary); font-weight:500; }
/* full-width responsive contribution grid: 52 week columns stretch to the container */
.ccx-heat { display:grid; grid-template-columns:repeat(52, minmax(4px, 1fr)); gap:3px; width:100%; }
.ccx-heat-month { font-size:10px; color:var(--dsw-alias-label-caption); height:16px; line-height:16px; overflow:visible; white-space:nowrap; }
.ccx-cell { aspect-ratio:1; width:100%; min-width:4px; border-radius:3px; position:relative; cursor:pointer; transition:transform .1s; }
.ccx-cell:hover { transform:scale(1.3); z-index:10; }
/* ── custom tooltip for heatmap and bars ── */
.ccx-tooltip-wrap { position:relative; }
.ccx-tooltip { position:absolute; bottom:calc(100% + 8px); left:50%; transform:translateX(-50%); padding:6px 10px; border-radius:8px; border:1px solid var(--dsw-alias-border-l2); background:var(--dsw-alias-bg-overlay); color:var(--dsw-alias-label-primary); font-size:11px; line-height:16px; white-space:nowrap; pointer-events:none; opacity:0; transition:opacity .12s; z-index:100; box-shadow:var(--dsw-shadow-lv2, 0 4px 12px rgba(0,0,0,.15)); }
.ccx-tooltip.visible { opacity:1; }
.ccx-tooltip-date { font-weight:500; color:var(--dsw-alias-label-primary); }
.ccx-tooltip-value { color:var(--dsw-alias-state-business-primary); font-family:var(--ds-font-family-code); }
.ccx-weekbars { display:flex; align-items:flex-end; gap:4px; height:120px; padding:4px 0; width:100%; }
.ccx-weekbar { flex:1; min-width:6px; max-width:26px; border-radius:3px 3px 0 0; background:var(--dsw-alias-state-business-primary); opacity:.85; position:relative; cursor:pointer; transition:opacity .12s; }
.ccx-weekbar:hover { opacity:1; }
.ccx-cum-svg { width:100%; height:140px; }
/* ── subagent card (session header utilities) ── */
.ccx-agents { position:relative; display:flex; align-items:center; }
.ccx-agents-pill { display:flex; align-items:center; gap:7px; height:28px; padding:0 10px; border-radius:9px; border:1px solid var(--dsw-alias-border-l2); background:var(--dsw-alias-bg-layer-1); color:var(--dsw-alias-label-secondary); font-size:12px; cursor:pointer; white-space:nowrap; transition:border-color .12s; }
.ccx-agents-pill:hover { border-color:var(--dsw-alias-border-l4); }
.ccx-agents-count { color:var(--dsw-alias-label-primary); font-weight:600; font-family:var(--ds-font-family-code); }
.ccx-agents-run { width:7px; height:7px; border-radius:50%; background:var(--dsw-alias-state-success-primary); animation:ccx-pulse 1.2s ease-in-out infinite; }
@keyframes ccx-pulse { 0%,100% { opacity:.4 } 50% { opacity:1 } }
.ccx-agents-pop { position:absolute; top:calc(100% + 6px); right:0; z-index:60; min-width:280px; max-width:400px; max-height:320px; overflow:auto; border-radius:12px; border:1px solid var(--dsw-alias-border-l2); background:var(--dsw-alias-bg-overlay); box-shadow:var(--dsw-shadow-lv2, 0 8px 24px rgba(0,0,0,.18)); padding:8px; }
.ccx-agent-row { display:flex; align-items:center; gap:8px; width:100%; padding:6px 8px; border:none; border-radius:8px; background:transparent; color:var(--dsw-alias-label-primary); font-size:12px; cursor:pointer; text-align:left; }
.ccx-agent-row:hover { background:var(--dsw-alias-interactive-bg-hover); }
.ccx-agent-dot { flex:none; width:7px; height:7px; border-radius:50%; background:var(--dsw-alias-label-dimmed); }
.ccx-agent-dot.running { background:var(--dsw-alias-state-success-primary); animation:ccx-pulse 1.2s ease-in-out infinite; }
.ccx-agent-label { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ccx-agent-mode { flex:none; font-size:10px; color:var(--dsw-alias-label-caption); border:1px solid var(--dsw-alias-border-l1); border-radius:5px; padding:0 5px; }
/* ── pet widget (shell overlay) — Codex-style animated companion ── */
.ccx-pet { position:fixed; z-index:90; pointer-events:auto; user-select:none; }
.ccx-pet.dragging { cursor:grabbing; }
.ccx-pet.dragging .ccx-pet-body { opacity:0.85; }
.ccx-pet-bubble { position:absolute; bottom:calc(100% + 2px); right:0; max-width:240px; padding:6px 10px; border-radius:12px 12px 2px 12px; border:1px solid var(--dsw-alias-border-l2); background:var(--dsw-alias-bg-overlay); color:var(--dsw-alias-label-primary); font-size:12px; line-height:18px; box-shadow:var(--dsw-shadow-lv2, 0 8px 24px rgba(0,0,0,.18)); white-space:nowrap; pointer-events:none; }
.ccx-pet-bubble.needs { border-color:var(--dsw-alias-state-warn-primary); color:var(--dsw-alias-state-warn-label); }
.ccx-pet-body { width:76px; height:76px; cursor:grab; color:var(--dsw-alias-state-business-primary); filter:drop-shadow(0 6px 14px rgba(0,0,0,.28)); --pp-hi:color-mix(in srgb, currentColor 58%, white); --pp-lo:color-mix(in srgb, currentColor 78%, black); --pp-line:color-mix(in srgb, currentColor 42%, black); }
.ccx-pet-body:active { cursor:grabbing; }
.ccx-pet-body svg { width:100%; height:100%; display:block; overflow:visible; }
/* Puppet parts transform around their own bounding box. */
.ccx-pet-body .pp-anim, .ccx-pet-body .pp-tail, .ccx-pet-body .pp-ear-l, .ccx-pet-body .pp-ear-r,
.ccx-pet-body .pp-eyes-open, .ccx-pet-body .pp-shadow, .ccx-pet-body .pp-paw-l, .ccx-pet-body .pp-paw-r,
.ccx-pet-body .pp-pawup-l, .ccx-pet-body .pp-pawup-r, .ccx-pet-body .pp-alert, .ccx-pet-body .pp-spark,
.ccx-pet-body .pp-thought circle, .ccx-pet-body .pp-codeline, .ccx-pet-body .pp-glow, .ccx-pet-body .pp-antenna,
.ccx-pet-body .pp-pickaxe, .ccx-pet-body .pp-mine-spark { transform-box:fill-box; }
/* ── idle: breathe, blink, slow tail sway, occasional ear twitch ── */
.ccx-pet-anim { transform-origin:50% 92%; animation:pp-breathe 3.4s ease-in-out infinite; }
@keyframes pp-breathe { 0%,100% { transform:translateY(0) scaleY(1) } 50% { transform:translateY(-1px) scaleY(1.02) } }
.pp-shadow { transform-origin:50% 50%; animation:pp-shadow 3.4s ease-in-out infinite; }
@keyframes pp-shadow { 0%,100% { transform:scaleX(1); opacity:.9 } 50% { transform:scaleX(.9); opacity:.65 } }
.pp-tail { transform-origin:10% 85%; animation:pp-tail 3s ease-in-out infinite; }
@keyframes pp-tail { 0%,100% { transform:rotate(7deg) } 50% { transform:rotate(-9deg) } }
.pp-ear-l { transform-origin:85% 95%; animation:pp-ear 7s ease-in-out infinite; }
.pp-ear-r { transform-origin:15% 95%; animation:pp-ear 7s ease-in-out infinite 3.5s; }
@keyframes pp-ear { 0%,86%,100% { transform:rotate(0deg) } 90% { transform:rotate(-9deg) } 94% { transform:rotate(5deg) } 97% { transform:rotate(-3deg) } }
.pp-eyes-open { transform-origin:50% 50%; animation:pp-blink 4.6s infinite; }
@keyframes pp-blink { 0%,91%,100% { transform:scaleY(1) } 94% { transform:scaleY(.12) } 97% { transform:scaleY(1) } }
/* ── thinking: head tilt, gaze up, pulsing thought dots ── */
.ccx-pet[data-state="thinking"] .ccx-pet-anim { animation:pp-tilt 2.8s ease-in-out infinite; }
@keyframes pp-tilt { 0%,100% { transform:rotate(0deg) } 30% { transform:rotate(-3deg) } 70% { transform:rotate(3deg) } }
.ccx-pet[data-state="thinking"] .pp-tail { animation-duration:2.2s; }
.pp-thought circle { opacity:0; transform-origin:50% 50%; animation:pp-thought 1.8s ease-in-out infinite; }
.pp-thought circle:nth-child(2) { animation-delay:.3s; }
.pp-thought circle:nth-child(3) { animation-delay:.6s; }
@keyframes pp-thought { 0% { opacity:0; transform:translateY(3px) scale(.6) } 30% { opacity:.95 } 70% { opacity:.85; transform:translateY(-2px) scale(1) } 100% { opacity:0; transform:translateY(-5px) scale(.8) } }
/* ── working: laptop pops in, paws type, sparks fly, screen glows ── */
.ccx-pet[data-state="working"] .ccx-pet-anim { animation:pp-bob .6s ease-in-out infinite; }
@keyframes pp-bob { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-2px) } }
.ccx-pet[data-state="working"] .pp-tail { animation-duration:.9s; }
.ccx-pet[data-state="working"] .pp-shadow { animation-duration:.6s; }
.ccx-pet[data-state="working"] .pp-ear-l, .ccx-pet[data-state="working"] .pp-ear-r { animation-duration:2.4s; }
.pp-laptop { transform-origin:50% 100%; animation:pp-pop .35s cubic-bezier(.3,1.6,.5,1) both; }
@keyframes pp-pop { from { transform:scale(0) } to { transform:scale(1) } }
.pp-paw-l { animation:pp-type .3s ease-in-out infinite alternate; }
.pp-paw-r { animation:pp-type .3s ease-in-out infinite alternate .3s; }
@keyframes pp-type { from { transform:translateY(0) } to { transform:translateY(1.8px) } }
.pp-glow { animation:pp-glow 1.2s ease-in-out infinite; }
@keyframes pp-glow { 0%,100% { opacity:.35 } 50% { opacity:.9 } }
.pp-codeline { transform-origin:0% 50%; animation:pp-codeline 1s ease-in-out infinite; }
.pp-codeline:nth-child(2) { animation-delay:.25s; }
.pp-codeline:nth-child(3) { animation-delay:.5s; }
@keyframes pp-codeline { 0%,100% { transform:scaleX(.45) } 50% { transform:scaleX(1) } }
.pp-spark { opacity:0; transform-origin:50% 50%; animation:pp-spark 1.15s ease-out infinite; }
.pp-spark:nth-child(2) { animation-delay:.4s; }
.pp-spark:nth-child(3) { animation-delay:.8s; }
@keyframes pp-spark { 0% { opacity:0; transform:translateY(3px) scale(.5) } 25% { opacity:1 } 100% { opacity:0; transform:translateY(-10px) scale(1.1) } }
.pp-antenna { animation:pp-glow 2.4s ease-in-out infinite; }
.ccx-pet[data-state="working"] .pp-antenna { animation-duration:.7s; }
/* ── needs: jump with squash & stretch, wave paws, alert badge ── */
.ccx-pet[data-state="needs"] .ccx-pet-anim { animation:pp-jump .85s cubic-bezier(.3,.7,.4,1) infinite; }
@keyframes pp-jump { 0%,100% { transform:translateY(0) scale(1,1) } 12% { transform:translateY(1px) scale(1.06,.9) } 40% { transform:translateY(-7px) scale(.96,1.06) } 60% { transform:translateY(-7px) scale(1,1) } 78% { transform:translateY(0) scale(1.04,.94) } 90% { transform:scale(1,1) } }
.ccx-pet[data-state="needs"] .pp-shadow { animation:pp-shadow-jump .85s ease-in-out infinite; }
@keyframes pp-shadow-jump { 0%,100% { transform:scaleX(1); opacity:.9 } 40%,60% { transform:scaleX(.65); opacity:.5 } }
.ccx-pet[data-state="needs"] .pp-tail { animation-duration:.7s; }
.pp-pawup-l { transform-origin:80% 90%; animation:pp-wave-l .7s ease-in-out infinite; }
.pp-pawup-r { transform-origin:20% 90%; animation:pp-wave-r .7s ease-in-out infinite .35s; }
@keyframes pp-wave-l { 0%,100% { transform:rotate(0deg) } 50% { transform:rotate(-16deg) } }
@keyframes pp-wave-r { 0%,100% { transform:rotate(0deg) } 50% { transform:rotate(16deg) } }
.pp-alert { transform-origin:50% 100%; animation:pp-alert 1.1s ease-in-out infinite; }
@keyframes pp-alert { 0%,100% { transform:scale(1) rotate(0deg) } 10% { transform:scale(1.25) } 22% { transform:scale(1) } 50% { transform:rotate(7deg) } 72% { transform:rotate(-7deg) } }
/* ── skin flavor ── */
.ccx-pet[data-skin="ghost"][data-state="idle"] .ccx-pet-anim { animation:pp-float 3.2s ease-in-out infinite; }
@keyframes pp-float { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-4px) } }
.ccx-pet[data-skin="ghost"] .pp-shadow { animation-duration:3.2s; }
/* ── depresso (瞅什魔): winds up and swings the pickaxe while working ── */
.ccx-pet[data-skin="depresso"] .ccx-pet-body { color:#5d84b2; }
.ccx-pet[data-skin="depresso"][data-state="working"] .ccx-pet-anim,
.ccx-pet[data-skin="depresso"][data-state="thinking"] .ccx-pet-anim { animation:pp-mine 1.1s ease-in-out infinite; }
@keyframes pp-mine { 0%,18% { transform:translateY(0) rotate(0deg) } 40% { transform:translateY(-1.5px) rotate(4deg) } 52% { transform:translateY(1.5px) rotate(-6deg) } 62% { transform:translateY(.5px) rotate(-3deg) } 72% { transform:translateY(1px) rotate(-5deg) } 100% { transform:translateY(0) rotate(0deg) } }
.ccx-pet[data-skin="depresso"][data-state="working"] .pp-shadow,
.ccx-pet[data-skin="depresso"][data-state="thinking"] .pp-shadow { animation-duration:1.1s; }
.pp-pickaxe { transform-origin:100% 100%; animation:pp-swing 1.1s infinite; }
@keyframes pp-swing {
	0%,18% { transform:rotate(26deg); animation-timing-function:cubic-bezier(.4,0,.6,1) }
	40% { transform:rotate(40deg); animation-timing-function:cubic-bezier(.7,0,1,1) }
	52% { transform:rotate(-45deg); animation-timing-function:cubic-bezier(0,.6,.4,1) }
	60% { transform:rotate(-38deg); animation-timing-function:ease-in-out }
	70% { transform:rotate(-43deg); animation-timing-function:cubic-bezier(.4,0,.6,1) }
	100% { transform:rotate(26deg) }
}
.pp-mine-spark { opacity:0; transform-origin:50% 50%; animation:pp-mine-spark 1.1s ease-out infinite; }
.pp-mine-spark:nth-child(2) { animation-delay:.06s; }
@keyframes pp-mine-spark { 0%,48% { opacity:0; transform:translateY(1px) scale(.4) } 56% { opacity:1; transform:translateY(-2px) scale(1) } 80% { opacity:0; transform:translateY(-8px) scale(.9) } 100% { opacity:0 } }
.ccx-pet-dots span { animation:ccx-dot 1.2s infinite; }
.ccx-pet-dots span:nth-child(2) { animation-delay:.2s }
.ccx-pet-dots span:nth-child(3) { animation-delay:.4s }
@keyframes ccx-dot { 0%,60%,100% { opacity:.25 } 30% { opacity:1 } }
.ccx-note { font-size:12px; color:var(--dsw-alias-label-caption); }
.ccx-refresh { position:absolute; top:8px; right:0; height:28px; padding:0 10px; font-size:12px; color:var(--dsw-alias-label-secondary); }
/* ── file preview sidebar (right-hand push panel) ── */
/* Push the whole shell left by the panel width while it is open. */
html.ccx-fp-open #root {
	margin-right: var(--ccx-fp-w, 540px) !important;
	transition: margin-right .18s ease-out;
}
/* No slide animation while the user drags the resize handle. */
html.ccx-fp-resizing #root { transition: none; }
/* Keep the floating cards row clear of the open panel. */
html.ccx-fp-open .ccx-cards-row { right: calc(var(--ccx-fp-w, 540px) + 24px); }
/* The panel background is set inline from the theme's solid base color
   (wallpaper-safe: never the translucent override); --ccx-fp-bg mirrors it
   for nested surfaces like the sticky code banner. */
.ccx-fp { position:fixed; top:0; right:0; bottom:0; width:var(--ccx-fp-w, 540px); z-index:87; display:flex; flex-direction:column; background:var(--ccx-fp-bg, var(--dsw-alias-bg-base)); border-left:1px solid var(--dsw-alias-border-l2); box-shadow:-14px 0 36px rgba(0,0,0,.20); animation:ccx-fp-in .18s ease-out; }
@keyframes ccx-fp-in { from { transform:translateX(26px); opacity:.35 } to { transform:none; opacity:1 } }
.ccx-fp-resize { position:absolute; left:-3px; top:0; bottom:0; width:6px; cursor:col-resize; z-index:2; }
.ccx-fp-resize:hover, .ccx-fp-resize.active { background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 35%, transparent); }
.ccx-fp-head { display:flex; align-items:center; gap:8px; padding:10px 12px; border-bottom:1px solid var(--dsw-alias-border-l1); flex:none; }
.ccx-fp-icon { flex:none; color:var(--dsw-alias-state-business-primary); display:grid; place-items:center; }
.ccx-fp-title { flex:1; min-width:0; display:flex; flex-direction:column; gap:1px; }
.ccx-fp-name { font-size:13px; font-weight:600; color:var(--dsw-alias-label-primary); font-family:var(--ds-font-family-code, ui-monospace, monospace); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ccx-fp-path { font-size:11px; color:var(--dsw-alias-label-caption); font-family:var(--ds-font-family-code, ui-monospace, monospace); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; direction:rtl; text-align:left; }
.ccx-fp-actions { flex:none; display:flex; align-items:center; gap:2px; }
.ccx-fp-btn { height:26px; padding:0 8px; border:none; border-radius:7px; background:transparent; color:var(--dsw-alias-label-secondary); font-size:12px; cursor:pointer; display:inline-flex; align-items:center; gap:4px; }
.ccx-fp-btn:hover { background:var(--dsw-alias-interactive-bg-hover); color:var(--dsw-alias-label-primary); }
.ccx-fp-btn.on { background:var(--dsw-alias-interactive-bg-hover-accent); color:var(--dsw-alias-label-primary); }
.ccx-fp-seg { display:flex; border:1px solid var(--dsw-alias-border-l2); border-radius:8px; overflow:hidden; }
.ccx-fp-seg button { border:none; background:transparent; color:var(--dsw-alias-label-caption); font-size:11px; padding:4px 9px; cursor:pointer; }
.ccx-fp-seg button.on { background:var(--dsw-alias-interactive-bg-hover-accent); color:var(--dsw-alias-label-primary); font-weight:500; }
.ccx-fp-body { flex:1; min-height:0; overflow:auto; padding:16px 18px; }
.ccx-fp-body.flush { padding:0; }
.ccx-fp-status { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; height:100%; min-height:180px; color:var(--dsw-alias-label-caption); font-size:13px; text-align:center; padding:24px; }
.ccx-fp-status .ccx-fp-status-icon { font-size:26px; }
.ccx-fp-status code { font-family:var(--ds-font-family-code, ui-monospace, monospace); font-size:12px; color:var(--dsw-alias-label-secondary); word-break:break-all; }
.ccx-fp-img-wrap { display:grid; place-items:center; min-height:240px; border-radius:10px; border:1px solid var(--dsw-alias-border-l1); background:repeating-conic-gradient(color-mix(in srgb, var(--dsw-alias-label-caption) 7%, transparent) 0% 25%, transparent 0% 50%) 0 0 / 18px 18px; padding:14px; }
.ccx-fp-img { max-width:100%; height:auto; border-radius:6px; }
.ccx-fp-meta { display:flex; flex-direction:column; gap:6px; font-size:12px; color:var(--dsw-alias-label-caption); font-family:var(--ds-font-family-code, ui-monospace, monospace); }
.ccx-fp-dir { display:flex; flex-direction:column; gap:2px; }
.ccx-fp-dir-item { display:flex; align-items:center; gap:8px; padding:5px 8px; border-radius:8px; font-size:12.5px; font-family:var(--ds-font-family-code, ui-monospace, monospace); color:var(--dsw-alias-label-primary); }
.ccx-fp-dir-item:hover { background:var(--dsw-alias-interactive-bg-hover); cursor:pointer; }
.ccx-fp-dir-item .ccx-fp-dir-type { flex:none; width:16px; text-align:center; color:var(--dsw-alias-label-caption); }
/* The reused ReadBlock fills the panel instead of capping to a card. */
.ccx-fp [data-read] { border:none; border-radius:0; background:transparent; }
.ccx-fp [data-read] > div:first-child { position:sticky; top:0; z-index:1; background:var(--ccx-fp-bg, var(--dsw-alias-bg-base)); border-bottom:1px solid var(--dsw-alias-border-l1); }
.ccx-fp [data-read] > div:last-child { max-height:none !important; overflow:visible !important; }
/* Markdown source view keeps the fence block styling but drops card margins. */
.ccx-fp .md-code-block { margin:0; }
/* ── clickable file rows in the git card ── */
.ccx-git-file.clickable { cursor:pointer; }
.ccx-git-file.clickable:hover .ccx-git-file-path { color:var(--dsw-alias-state-business-primary); }
.ccx-git-untracked { flex:none; font-size:10px; color:var(--dsw-alias-label-caption); border:1px solid var(--dsw-alias-border-l1); border-radius:5px; padding:0 5px; }
/* ── inline-code path hints inside conversation messages ── */
code.ccx-filehint { cursor:pointer; }
code.ccx-filehint > * { cursor:pointer; }
html.ccx-fp-hints code.ccx-filehint { text-decoration:underline dotted color-mix(in srgb, var(--dsw-alias-state-business-primary) 65%, transparent); text-underline-offset:3px; }
/* ── file tree dock (Codex-style right dock: tabbed editors + tree) ── */
/* Push the whole shell left by the dock width (tree pane + editor pane). */
html.ccx-ft-open #root {
	margin-right: calc(var(--ccx-ft-w, 280px) + var(--ccx-ft-ew, 0px)) !important;
	transition: margin-right .18s ease-out;
}
/* No slide animation while the user drags a resize handle. */
html.ccx-ft-resizing #root { transition: none; }
/* Keep the floating cards row clear of the open dock. */
html.ccx-ft-open .ccx-cards-row { right: calc(var(--ccx-ft-w, 280px) + var(--ccx-ft-ew, 0px) + 24px); }
/* Toggle button: fixed to the top-right corner; its vertical position is
   measured at runtime from the left sidebar's fold toggle so both sit at
   one height. */
.ccx-ft-toggle { position:fixed; top:22px; right:12px; z-index:88; width:28px; height:28px; border:none; border-radius:50%; background:transparent; color:var(--dsw-alias-label-secondary); cursor:pointer; display:grid; place-items:center; transition:background-color .12s, color .12s; }
.ccx-ft-toggle:hover { background:var(--dsw-alias-interactive-bg-hover); color:var(--dsw-alias-label-primary); }
.ccx-ft-toggle.active { color:var(--dsw-alias-state-business-primary); }
/* The dock background is set inline from the theme's solid base color
   (wallpaper-safe); --ccx-ft-bg mirrors it for nested sticky surfaces.
   Layout: [ tabbed editor pane (only while files are open) | tree pane ]. */
.ccx-ft-root { position:fixed; top:0; right:0; bottom:0; z-index:87; display:flex; background:var(--ccx-ft-bg, var(--dsw-alias-bg-base)); animation:ccx-ft-in .18s ease-out; }
@keyframes ccx-ft-in { from { transform:translateX(26px); opacity:.35 } to { transform:none; opacity:1 } }
.ccx-ft-treepane, .ccx-ft-editors { position:relative; display:flex; flex-direction:column; min-width:0; flex:none; }
/* The tree pane keeps the far-right edge; the editor pane sits to its left. */
.ccx-ft-treepane { width:var(--ccx-ft-w, 280px); border-left:1px solid var(--dsw-alias-border-l2); box-shadow:-14px 0 36px rgba(0,0,0,.20); }
.ccx-ft-editors { width:var(--ccx-ft-ew, 520px); border-left:1px solid var(--dsw-alias-border-l2); box-shadow:-14px 0 36px rgba(0,0,0,.20); animation:ccx-ft-in .18s ease-out; }
.ccx-ft-resize { position:absolute; left:-3px; top:0; bottom:0; width:6px; cursor:col-resize; z-index:3; }
.ccx-ft-resize:hover { background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 35%, transparent); }
/* ── editor pane: tab bar + stacked per-file views ── */
.ccx-ft-tabs { display:flex; align-items:center; gap:4px; min-height:60px; padding:8px 10px; border-bottom:1px solid var(--dsw-alias-border-l1); flex:none; overflow-x:auto; overflow-y:hidden; box-sizing:border-box; scrollbar-width:thin; }
.ccx-ft-tab { flex:none; display:inline-flex; align-items:center; gap:6px; max-width:190px; height:32px; padding:0 5px 0 10px; border-radius:9px; border:1px solid transparent; background:transparent; color:var(--dsw-alias-label-secondary); font-size:12px; font-family:var(--ds-font-family-code, ui-monospace, monospace); cursor:pointer; }
.ccx-ft-tab:hover { background:var(--dsw-alias-interactive-bg-hover); }
.ccx-ft-tab.active { background:var(--dsw-alias-interactive-bg-hover-accent); border-color:var(--dsw-alias-border-l2); color:var(--dsw-alias-label-primary); }
.ccx-ft-tab .ccx-ft-ico { color:var(--dsw-alias-label-caption); }
.ccx-ft-tab.active .ccx-ft-ico { color:var(--dsw-alias-state-business-primary); }
.ccx-ft-tab-name { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ccx-ft-tab-dirty { flex:none; width:6px; height:6px; border-radius:50%; background:var(--dsw-alias-state-warn-primary); }
.ccx-ft-tab-close { flex:none; width:18px; height:18px; border:none; border-radius:6px; background:transparent; color:var(--dsw-alias-label-caption); cursor:pointer; display:grid; place-items:center; font-size:11px; line-height:1; padding:0; }
.ccx-ft-tab-close:hover { background:var(--dsw-alias-interactive-bg-hover); color:var(--dsw-alias-label-primary); }
.ccx-ft-tabviews { flex:1; min-height:0; display:flex; flex-direction:column; }
.ccx-ft-tabview { flex:1; min-height:0; display:flex; flex-direction:column; }
/* Header leaves room on the right for the fixed toggle button. */
.ccx-ft-head { display:flex; align-items:center; gap:8px; min-height:60px; padding:8px 48px 8px 14px; border-bottom:1px solid var(--dsw-alias-border-l1); flex:none; box-sizing:border-box; }
.ccx-ft-head-ico { flex:none; color:var(--dsw-alias-state-business-primary); display:grid; place-items:center; }
.ccx-ft-head-title { flex:1; min-width:0; display:flex; flex-direction:column; gap:1px; }
.ccx-ft-head-name { font-size:13px; font-weight:600; color:var(--dsw-alias-label-primary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ccx-ft-head-path { font-size:11px; color:var(--dsw-alias-label-caption); font-family:var(--ds-font-family-code, ui-monospace, monospace); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; direction:rtl; text-align:left; }
.ccx-ft-head-actions { flex:none; display:flex; align-items:center; gap:2px; }
.ccx-ft-btn { height:26px; min-width:26px; padding:0 7px; border:none; border-radius:7px; background:transparent; color:var(--dsw-alias-label-secondary); font-size:12px; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:4px; white-space:nowrap; }
.ccx-ft-btn:hover { background:var(--dsw-alias-interactive-bg-hover); color:var(--dsw-alias-label-primary); }
.ccx-ft-btn.primary { background:var(--dsw-alias-button-info-fill); color:#fff; }
.ccx-ft-btn.primary:hover { background:var(--dsw-alias-button-info-hover); }
.ccx-ft-btn.disabled { opacity:.45; pointer-events:none; }
.ccx-ft-body { flex:1; min-height:0; overflow:auto; display:flex; flex-direction:column; }
.ccx-ft-status { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; height:100%; min-height:160px; color:var(--dsw-alias-label-caption); font-size:13px; text-align:center; padding:24px; }
.ccx-ft-status .ccx-ft-status-icon { font-size:26px; }
.ccx-ft-status code { font-family:var(--ds-font-family-code, ui-monospace, monospace); font-size:12px; color:var(--dsw-alias-label-secondary); word-break:break-all; }
/* ── tree rows ── */
.ccx-ft-tree { padding:6px 6px 18px; }
.ccx-ft-row { display:flex; align-items:center; gap:5px; height:26px; padding-right:8px; border-radius:7px; font-size:12.5px; color:var(--dsw-alias-label-primary); cursor:pointer; user-select:none; white-space:nowrap; }
.ccx-ft-row:hover { background:var(--dsw-alias-interactive-bg-hover); }
.ccx-ft-row.selected { background:var(--dsw-alias-interactive-bg-hover-accent); }
/* Rows whose file is open in a tab get a tinted icon (active row also bg). */
.ccx-ft-row.open .ccx-ft-ico { color:var(--dsw-alias-state-business-primary); }
.ccx-ft-chev { flex:none; width:14px; text-align:center; color:var(--dsw-alias-label-caption); font-size:12px; transform:rotate(0deg); transition:transform .1s ease-out; }
.ccx-ft-chev.open { transform:rotate(90deg); }
.ccx-ft-chev.placeholder { visibility:hidden; }
.ccx-ft-ico { flex:none; display:grid; place-items:center; color:var(--dsw-alias-label-caption); }
.ccx-ft-row.selected .ccx-ft-ico, .ccx-ft-row.selected .ccx-ft-name { color:var(--dsw-alias-state-business-primary); }
.ccx-ft-name { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; font-family:var(--ds-font-family-code, ui-monospace, monospace); }
.ccx-ft-note { padding:10px 12px; font-size:11px; color:var(--dsw-alias-label-caption); }
/* ── file view (viewer + editor, one per open tab) ── */
.ccx-ft-fileview { display:flex; flex-direction:column; flex:1; min-height:0; }
.ccx-ft-fileview-head { display:flex; align-items:center; gap:6px; min-height:42px; padding:6px 12px; border-bottom:1px solid var(--dsw-alias-border-l1); flex:none; box-sizing:border-box; }
.ccx-ft-fileview-title { flex:1; min-width:0; display:flex; flex-direction:column; gap:1px; }
.ccx-ft-fileview-name { font-size:13px; font-weight:600; color:var(--dsw-alias-label-primary); font-family:var(--ds-font-family-code, ui-monospace, monospace); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ccx-ft-fileview-path { font-size:11px; color:var(--dsw-alias-label-caption); font-family:var(--ds-font-family-code, ui-monospace, monospace); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; direction:rtl; text-align:left; }
.ccx-ft-fileview-actions { flex:none; display:flex; align-items:center; gap:4px; }
.ccx-ft-seg { display:flex; border:1px solid var(--dsw-alias-border-l2); border-radius:8px; overflow:hidden; }
.ccx-ft-seg button { border:none; background:transparent; color:var(--dsw-alias-label-caption); font-size:11px; padding:4px 9px; cursor:pointer; }
.ccx-ft-seg button.on { background:var(--dsw-alias-interactive-bg-hover-accent); color:var(--dsw-alias-label-primary); font-weight:500; }
.ccx-ft-dirty { flex:none; width:7px; height:7px; border-radius:50%; background:var(--dsw-alias-state-warn-primary); }
.ccx-ft-error { flex:none; padding:6px 12px; font-size:12px; color:var(--dsw-alias-state-error-primary); background:var(--dsw-alias-interactive-bg-hover-danger); border-bottom:1px solid var(--dsw-alias-border-l1); }
.ccx-ft-fileview-body { flex:1; min-height:0; overflow:auto; padding:14px 16px; }
.ccx-ft-fileview-body.flush { padding:0; }
.ccx-ft-fileview-body.editing { padding:0; display:flex; flex-direction:column; }
.ccx-ft-editor { flex:1; min-height:0; width:100%; border:none; outline:none; resize:none; padding:12px 14px; background:transparent; color:var(--dsw-alias-label-primary); font-family:var(--ds-font-family-code, ui-monospace, SFMono-Regular, Menlo, monospace); font-size:12.5px; line-height:20px; tab-size:4; }
/* ── overlay code editor: highlighted ReadBlock backdrop + transparent textarea ── */
.ccx-ft-codeedit { position:relative; flex:1; min-height:0; }
/* Backdrop layer: the platform ReadBlock (syntax colors + line numbers). */
.ccx-ft-codeedit-back { position:absolute; inset:0; overflow:hidden; pointer-events:none; }
/* The platform block ships margin:16px 0 — strip it so the textarea layer
   (inset:0 over the same box) lines up from the very first line. */
.ccx-ft-codeedit-back [data-read] { border:none; border-radius:0; background:transparent; margin:0 !important; }
/* Hide the ReadBlock banner (label/copy row) — the file head already covers it. */
.ccx-ft-codeedit-back [data-read] > div:first-child { display:none; }
.ccx-ft-codeedit-back [data-read] > div:last-child { max-height:none !important; overflow:visible !important; }
/* Input layer: invisible text, visible caret; font metrics are copied from the
   measured backdrop so glyphs overlap exactly. */
.ccx-ft-codeedit-input { position:absolute; inset:0; width:100%; height:100%; margin:0; border:none; outline:none; resize:none; overflow:auto; background:transparent; color:transparent; caret-color:var(--dsw-alias-label-primary); padding:0; white-space:pre; }
.ccx-ft-codeedit-input::selection { background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 32%, transparent); color:transparent; }
.ccx-ft-img-wrap { display:grid; place-items:center; min-height:200px; border-radius:10px; border:1px solid var(--dsw-alias-border-l1); background:repeating-conic-gradient(color-mix(in srgb, var(--dsw-alias-label-caption) 7%, transparent) 0% 25%, transparent 0% 50%) 0 0 / 18px 18px; padding:14px; }
.ccx-ft-img { max-width:100%; height:auto; border-radius:6px; }
/* The reused ReadBlock fills the panel instead of capping to a card. */
.ccx-ft-root [data-read] { border:none; border-radius:0; background:transparent; }
.ccx-ft-root [data-read] > div:first-child { position:sticky; top:0; z-index:1; background:var(--ccx-ft-bg, var(--dsw-alias-bg-base)); border-bottom:1px solid var(--dsw-alias-border-l1); }
.ccx-ft-root [data-read] > div:last-child { max-height:none !important; overflow:visible !important; }
.ccx-ft-root .md-code-block { margin:0; }
/* Rendered markdown images (rewritten to /__codex/raw) scale to the pane. */
.ccx-ft-fileview-body img:not(.ccx-ft-img), .ccx-fp-body img:not(.ccx-fp-img) { max-width:100%; height:auto; border-radius:6px; }
/* ── git diff viewer (IDEA-style two-pane side-by-side comparison) ── */
/* The diff body is a flush flex column: pane labels, scrollable table, banner. */
.ccx-fp-body.diff { padding:0; display:flex; flex-direction:column; }
/* Change-kind badge + +/- stats in the panel head. */
.ccx-fp-name .ccx-diff-badge { margin-left:8px; }
.ccx-diff-badge { display:inline-block; vertical-align:1px; font-size:10px; font-weight:500; padding:1px 7px; border-radius:6px; border:1px solid var(--dsw-alias-border-l2); color:var(--dsw-alias-label-secondary); font-family:inherit; }
.ccx-diff-badge.added, .ccx-diff-badge.untracked { color:var(--dsw-alias-state-success-primary); border-color:color-mix(in srgb, var(--dsw-alias-state-success-primary) 45%, transparent); background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 10%, transparent); }
.ccx-diff-badge.deleted { color:var(--dsw-alias-state-error-primary); border-color:color-mix(in srgb, var(--dsw-alias-state-error-primary) 45%, transparent); background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 10%, transparent); }
.ccx-diff-badge.modified { color:var(--dsw-alias-state-warn-primary); border-color:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 45%, transparent); background:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 10%, transparent); }
.ccx-diff-stats { display:inline-flex; gap:6px; margin-left:8px; font-family:var(--ds-font-family-code, ui-monospace, monospace); font-size:11px; }
/* Pane labels above the two columns. */
.ccx-diff-bar { flex:none; display:flex; border-bottom:1px solid var(--dsw-alias-border-l1); font-size:11px; color:var(--dsw-alias-label-caption); background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 55%, transparent); }
.ccx-diff-bar > span { flex:1; min-width:0; padding:5px 10px 5px 52px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ccx-diff-bar > span + span { border-left:1px solid var(--dsw-alias-border-l1); }
.ccx-diff-scroll { flex:1; min-height:0; overflow:auto; }
table.ccx-diff { border-collapse:collapse; table-layout:fixed; width:100%; font-family:var(--ds-font-family-code, ui-monospace, SFMono-Regular, Menlo, monospace); font-size:12px; line-height:20px; }
.ccx-diff col.ccx-diff-col-no { width:44px; }
.ccx-diff td { vertical-align:top; color:var(--dsw-alias-label-primary); }
.ccx-diff td.ccx-diff-no { padding:0 6px; text-align:right; color:var(--dsw-alias-label-caption); font-size:11px; user-select:none; background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 60%, transparent); border-right:1px solid var(--dsw-alias-border-l1); }
.ccx-diff td.ccx-diff-code { padding:0 8px; white-space:pre-wrap; word-break:break-word; }
/* Center divider between the two panes. */
.ccx-diff td.ccx-diff-no + td.ccx-diff-code + td.ccx-diff-no { border-left:1px solid var(--dsw-alias-border-l2); }
/* Removed / added / filler cells (IDEA-style tinting). */
.ccx-diff td.del { background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 10%, transparent); }
.ccx-diff td.del.ccx-diff-no { background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 16%, transparent); color:color-mix(in srgb, var(--dsw-alias-state-error-primary) 75%, var(--dsw-alias-label-primary)); }
.ccx-diff td.ins { background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 12%, transparent); }
.ccx-diff td.ins.ccx-diff-no { background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 18%, transparent); color:color-mix(in srgb, var(--dsw-alias-state-success-primary) 75%, var(--dsw-alias-label-primary)); }
.ccx-diff td.pad { background:color-mix(in srgb, var(--dsw-alias-label-caption) 7%, transparent); }
/* Word-level highlights inside a modified pair. */
.ccx-diff-hl-del { background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 30%, transparent); border-radius:2px; }
.ccx-diff-hl-ins { background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 32%, transparent); border-radius:2px; }
.ccx-diff-more { flex:none; padding:8px 12px; text-align:center; color:var(--dsw-alias-label-caption); font-size:12px; border-top:1px solid var(--dsw-alias-border-l1); }
/* Prev/next change navigation in the panel head. */
.ccx-diff-count { font-size:11px; color:var(--dsw-alias-label-caption); font-family:var(--ds-font-family-code, ui-monospace, monospace); white-space:nowrap; padding:0 1px; }
.ccx-diff-nav button { min-width:26px; padding:4px 7px; font-size:13px; line-height:1; }
.ccx-diff-nav button:disabled { opacity:.35; pointer-events:none; }
`;
		function installStyles() {
			if (typeof document === "undefined") return () => {};
			if (document.querySelector("style[data-plugin-css=" + JSON.stringify(TAG_ID) + "]") !== null) return () => {};
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-code";
			tag.dataset.pluginCss = TAG_ID;
			tag.textContent = CSS;
			document.head.appendChild(tag);
			return () => tag.remove();
		}
		//#endregion

		//#region catppuccin palettes
		const CATPPUCCIN = {
			latte: {
				label: "Latte", scheme: "light",
				colors: { rosewater: "#dc8a78", flamingo: "#dd7878", pink: "#ea76cb", mauve: "#8839ef", red: "#d20f39", maroon: "#e64553", peach: "#fe640b", yellow: "#df8e1d", green: "#40a02b", teal: "#179299", sky: "#04a5e5", sapphire: "#209fb5", blue: "#1e66f5", lavender: "#7287fd", text: "#4c4f69", subtext1: "#5c5f77", subtext0: "#6c6f85", overlay2: "#7c7f93", overlay1: "#8c8fa1", overlay0: "#9ca0b0", surface2: "#acb0be", surface1: "#bcc0cc", surface0: "#ccd0da", base: "#eff1f5", mantle: "#e6e9ef", crust: "#dce0e8" },
			},
			frappe: {
				label: "Frappé", scheme: "dark",
				colors: { rosewater: "#f2d5cf", flamingo: "#eebebe", pink: "#f4b8e4", mauve: "#ca9ee6", red: "#e78284", maroon: "#ea999c", peach: "#ef9f76", yellow: "#e5c890", green: "#a6d189", teal: "#81c8be", sky: "#99d1db", sapphire: "#85c1dc", blue: "#8caaee", lavender: "#babbf1", text: "#c6d0f5", subtext1: "#b5bfe2", subtext0: "#a5adce", overlay2: "#949cbb", overlay1: "#838ba7", overlay0: "#737994", surface2: "#626880", surface1: "#51576d", surface0: "#414559", base: "#303446", mantle: "#292c3c", crust: "#232634" },
			},
			macchiato: {
				label: "Macchiato", scheme: "dark",
				colors: { rosewater: "#f4dbd6", flamingo: "#f0c6c6", pink: "#f5bde6", mauve: "#c6a0f6", red: "#ed8796", maroon: "#ee99a0", peach: "#f5a97f", yellow: "#eed49f", green: "#a6da95", teal: "#8bd5ca", sky: "#91d7e3", sapphire: "#7dc4e4", blue: "#8aadf4", lavender: "#b7bdf8", text: "#cad3f5", subtext1: "#b8c0e0", subtext0: "#a5adcb", overlay2: "#939ab7", overlay1: "#8087a2", overlay0: "#6e738d", surface2: "#5b6078", surface1: "#494d64", surface0: "#363a4f", base: "#24273a", mantle: "#1e2030", crust: "#181926" },
			},
			mocha: {
				label: "Mocha", scheme: "dark",
				colors: { rosewater: "#f5e0dc", flamingo: "#f2cdcd", pink: "#f5c2e7", mauve: "#cba6f7", red: "#f38ba8", maroon: "#eba0ac", peach: "#fab387", yellow: "#f9e2af", green: "#a6e3a1", teal: "#94e2d5", sky: "#89dceb", sapphire: "#74c7ec", blue: "#89b4fa", lavender: "#b4befe", text: "#cdd6f4", subtext1: "#bac2de", subtext0: "#a6adc8", overlay2: "#939ab7", overlay1: "#7f849c", overlay0: "#6c7086", surface2: "#585b70", surface1: "#45475a", surface0: "#313244", base: "#1e1e2e", mantle: "#181825", crust: "#11111b" },
			},
		};

		function mix(a, b, tA) {
			const pct = Math.round(tA * 100);
			return "color-mix(in srgb, " + a + " " + pct + "%, " + b + " " + (100 - pct) + "%)";
		}
		function alpha(c, a) {
			return "color-mix(in srgb, " + c + " " + Math.round(a * 100) + "%, transparent)";
		}
		function hexToRgb(hex) {
			const value = hex.replace("#", "");
			return [parseInt(value.slice(0, 2), 16), parseInt(value.slice(2, 4), 16), parseInt(value.slice(4, 6), 16)];
		}
		function rgba(hex, a) {
			const [r, g, b] = hexToRgb(hex);
			return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
		}

		/** Map every DSH alias/specific token onto one Catppuccin palette. */
		function buildTokens(p, scheme) {
			const dark = scheme === "dark";
			return {
				"--dsw-alias-bg-base": p.base,
				"--dsw-alias-bg-layer-1": dark ? mix(p.base, p.surface0, 0.5) : mix(p.base, p.surface0, 0.8),
				"--dsw-alias-bg-layer-2": dark ? mix(p.base, p.surface0, 0.3) : mix(p.base, p.surface0, 0.68),
				"--dsw-alias-bg-layer-3": dark ? p.surface0 : mix(p.base, p.surface0, 0.55),
				"--dsw-alias-bg-mask-1": alpha(p.crust, dark ? 0.55 : 0.3),
				"--dsw-alias-bg-mask-2": alpha(p.crust, dark ? 0.25 : 0.14),
				"--dsw-alias-bg-mask-3": alpha(p.crust, 0.5),
				"--dsw-alias-bg-mask-drop": dark ? alpha(p.surface0, 0.75) : alpha(p.base, 0.75),
				"--dsw-alias-bg-mask-photo": "rgba(0, 0, 0, .88)",
				"--dsw-alias-bg-module-platform": dark ? p.surface0 : mix(p.base, p.surface0, 0.6),
				"--dsw-alias-bg-multi-select": dark ? p.surface1 : mix(p.base, p.surface0, 0.55),
				"--dsw-alias-bg-overlay": dark ? p.surface1 : mix(p.base, p.surface0, 0.45),
				"--dsw-alias-bg-skeleton": alpha(p.text, dark ? 0.08 : 0.05),
				"--dsw-alias-border-inverted": dark ? alpha(p.text, 0.06) : "rgba(0, 0, 0, 0)",
				"--dsw-alias-border-inverted2": dark ? alpha(p.text, 0.08) : "rgba(0, 0, 0, 0)",
				"--dsw-alias-border-l1": alpha(p.text, 0.08),
				"--dsw-alias-border-l2": alpha(p.text, 0.14),
				"--dsw-alias-border-l2-darkmode-thin": alpha(p.text, dark ? 0.09 : 0.12),
				"--dsw-alias-border-l3": alpha(p.text, 0.18),
				"--dsw-alias-border-l4": alpha(p.text, 0.24),
				"--dsw-alias-brand-primary": p.text,
				"--dsw-alias-brand-primary-invert": p.text,
				"--dsw-alias-brand-primary-new-colorprimary-new-color": p.blue,
				"--dsw-alias-brand-text": p.text,
				"--dsw-alias-button-contrast-fill": dark ? p.subtext0 : p.overlay2,
				"--dsw-alias-button-elevated-fill": dark ? p.surface1 : p.base,
				"--dsw-alias-button-floating-fill": dark ? p.surface1 : p.base,
				"--dsw-alias-button-floating-hover": dark ? p.surface2 : mix(p.base, p.surface0, 0.5),
				"--dsw-alias-button-ghost-active-border": p.overlay1,
				"--dsw-alias-button-ghost-active-fill": dark ? p.surface1 : p.surface0,
				"--dsw-alias-button-ghost-active-hover": dark ? p.surface2 : mix(p.surface0, p.surface1, 0.5),
				"--dsw-alias-button-info-fill": p.blue,
				"--dsw-alias-button-info-hover": mix(p.blue, p.text, 0.82),
				"--dsw-alias-button-primary-dimmed": dark ? p.surface1 : p.surface0,
				"--dsw-alias-button-primary-fill": p.text,
				"--dsw-alias-button-primary-hover": p.subtext0,
				"--dsw-alias-button-tool-bar-fill": alpha(p.overlay0, 0.55),
				"--dsw-alias-button-tool-bar-fill-invisible": alpha(p.overlay0, 0.35),
				"--dsw-alias-button-tool-bar-hover": alpha(p.overlay0, 0.7),
				"--dsw-alias-interactive-bg-active": alpha(p.text, 0.12),
				"--dsw-alias-interactive-bg-hover": alpha(p.text, 0.07),
				"--dsw-alias-interactive-bg-hover-accent": alpha(p.text, 0.16),
				"--dsw-alias-interactive-bg-hover-danger": alpha(p.red, 0.12),
				"--dsw-alias-interactive-bg-hover-solid": dark ? p.surface1 : mix(p.base, p.surface0, 0.4),
				"--dsw-alias-label-caption": p.overlay1,
				"--dsw-alias-label-dimmed": dark ? p.surface1 : p.surface2,
				"--dsw-alias-label-primary": p.text,
				"--dsw-alias-label-primary-bluish": p.text,
				"--dsw-alias-label-primary-dimmed": p.subtext1,
				"--dsw-alias-label-primary-foreground": p.base,
				"--dsw-alias-label-primary-inverted": dark ? p.mantle : p.crust,
				"--dsw-alias-label-secondary": p.subtext0,
				"--dsw-alias-label-tertiary": p.overlay0,
				"--dsw-alias-markdown-citation": dark ? p.surface1 : p.surface0,
				"--dsw-alias-markdown-code-block": dark ? p.mantle : p.crust,
				"--dsw-alias-markdown-code-block-banner": dark ? p.crust : mix(p.crust, p.base, 0.5),
				"--dsw-alias-markdown-code-segment-selected": dark ? p.surface1 : p.base,
				"--dsw-alias-markdown-code-segment-unselected": dark ? p.mantle : mix(p.crust, p.base, 0.5),
				"--dsw-alias-markdown-inline-code": p.surface0,
				"--dsw-alias-markdown-placeholder": dark ? p.surface0 : mix(p.crust, p.base, 0.55),
				"--dsw-alias-markdown-tag": dark ? p.surface0 : mix(p.crust, p.base, 0.4),
				"--dsw-alias-scrollbar-bg-l1": dark ? mix(p.surface0, p.surface1, 0.5) : p.surface1,
				"--dsw-alias-scrollbar-bg-l2": p.surface1,
				"--dsw-alias-scrollbar-hover-l1": p.surface2,
				"--dsw-alias-scrollbar-hover-l2": dark ? mix(p.surface2, p.overlay0, 0.5) : p.surface2,
				"--dsw-alias-state-business-primary": p.blue,
				"--dsw-alias-state-business-tertiary": alpha(p.blue, 0.18),
				"--dsw-alias-state-error-primary": p.red,
				"--dsw-alias-state-error-secondary": p.maroon,
				"--dsw-alias-state-success-primary": p.green,
				"--dsw-alias-state-success-secondary": p.teal,
				"--dsw-alias-state-success-tertiary": alpha(p.green, 0.16),
				"--dsw-alias-state-warn-label": dark ? p.yellow : p.peach,
				"--dsw-alias-state-warn-primary": dark ? p.yellow : p.peach,
				"--dsw-alias-state-warn-secondary": p.peach,
				"--dsw-alias-state-warn-tertiary": alpha(p.yellow, 0.18),
				"--dsw-alias-toast-bg": dark ? p.surface2 : p.text,
				"--dsw-alias-tooltip-bg": dark ? p.surface2 : p.text,
				"--dsw-specific-bubble": dark ? p.surface0 : mix(p.base, p.blue, 0.93),
				"--dsw-specific-bubble-highlight": dark ? p.surface1 : mix(p.base, p.blue, 0.85),
				"--dsw-specific-input-major": dark ? p.surface0 : p.base,
				"--dsw-specific-login-input": dark ? p.mantle : p.crust,
				"--dsw-specific-menu": dark ? p.surface0 : mix(p.base, p.surface0, 0.55),
				"--dsw-specific-selector": dark ? p.surface0 : mix(p.crust, p.base, 0.5),
				"--dsw-specific-sidebar-fill": dark ? p.mantle : p.crust,
				"--dsw-specific-sidebar-nav-item-active": p.surface0,
				"--dsw-specific-sidebar-nav-item-active-accent": alpha(p.blue, 0.16),
				"--dsw-specific-sidebar-nav-item-hover": dark ? mix(p.mantle, p.surface0, 0.5) : mix(p.crust, p.base, 0.55),
				"--dsw-specific-tip": dark ? p.surface0 : mix(p.crust, p.base, 0.45),
			};
		}
		//#endregion

		//#region helpers
		function formatTokens(n) {
			if (!Number.isFinite(n) || n <= 0) return "0";
			const unit = (x) => String(Math.round(x * 10) / 10);
			if (n >= 1e8) return unit(n / 1e8) + "亿";
			if (n >= 1e4) return unit(n / 1e4) + "万";
			return String(Math.round(n));
		}
		function formatDuration(ms) {
			if (!Number.isFinite(ms) || ms <= 0) return "0 分钟";
			const minutes = Math.round(ms / 60000);
			if (minutes < 60) return minutes + " 分钟";
			const hours = Math.floor(minutes / 60);
			const rest = minutes % 60;
			if (hours < 24) return hours + " 小时 " + rest + " 分";
			return Math.floor(hours / 24) + " 天 " + (hours % 24) + " 小时";
		}
		function formatDate(iso) {
			return iso;
		}
		function greetingOfHour(hour) {
			if (hour < 6) return "夜深了";
			if (hour < 12) return "早上好";
			if (hour < 14) return "中午好";
			if (hour < 18) return "下午好";
			return "晚上好";
		}
		function findComposerTextarea() {
			if (typeof document === "undefined") return null;
			return document.querySelector("[data-composer-seat] textarea");
		}
		function setTextareaValue(ta, text, caret) {
			const proto = typeof HTMLTextAreaElement !== "undefined" ? HTMLTextAreaElement.prototype : null;
			if (proto === null) return;
			const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
			if (descriptor === undefined || descriptor.set === undefined) return;
			descriptor.set.call(ta, text);
			ta.dispatchEvent(new Event("input", { bubbles: true }));
			if (caret !== undefined) {
				try { ta.setSelectionRange(caret, caret); } catch { /* noop */ }
			}
			ta.focus();
		}
		function insertIntoComposer(text) {
			const ta = findComposerTextarea();
			if (ta === null) return false;
			setTextareaValue(ta, text, text.length);
			return true;
		}
		//#endregion

		//#region FilePreview (right-hand file preview sidebar)
		const PRIM = require("@deepseek-ai/dsh-client-ui-primitives");
		const FP_WIDTH_KEY = "dsh-code:file-preview-width:v1";
		/** Line window rendered for huge files; ReadBlock's banner reports the cut. */
		const FP_MAX_LINES = 8000;

		/** Extension → highlighter language id (mirrors the platform LANG_ALIASES). */
		const FP_LANG_BY_EXT = {
			ts: "typescript", tsx: "tsx", js: "javascript", jsx: "jsx", mjs: "js", cjs: "js",
			py: "python", python: "python", rb: "ruby", go: "go", rs: "rust", java: "java",
			c: "c", h: "c", cpp: "cpp", cc: "cpp", cxx: "cpp", hpp: "cpp", hh: "cpp",
			cs: "csharp", kt: "kotlin", kts: "kotlin", swift: "swift", php: "php",
			yaml: "yaml", yml: "yaml", toml: "toml", ini: "ini",
			md: "markdown", markdown: "markdown", mdx: "mdx",
			html: "html", htm: "html", css: "css", scss: "scss", less: "less",
			sql: "sql", xml: "xml", lua: "lua",
			sh: "bash", bash: "bash", zsh: "zsh", fish: "shellscript",
			json: "json", jsonc: "jsonc",
		};
		const FP_IMAGE_MIME = {
			png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif",
			webp: "image/webp", bmp: "image/bmp", ico: "image/x-icon", svg: "image/svg+xml", avif: "image/avif",
		};
		const FP_MARKDOWN_EXTS = new Set(["md", "mdx", "markdown", "mdown", "mkd"]);
		/** Extensions accepted when an inline-code token has no path separator. */
		const FP_KNOWN_EXTS = new Set([
			...Object.keys(FP_LANG_BY_EXT), ...Object.keys(FP_IMAGE_MIME),
			...FP_MARKDOWN_EXTS, "txt", "text", "log", "csv", "tsv", "lock", "patch", "diff",
		]);
		function fpExt(p) {
			const name = baseName(String(p || ""));
			const dot = name.lastIndexOf(".");
			return dot <= 0 ? "" : name.slice(dot + 1).toLowerCase();
		}
		function fpIsImage(p) { return FP_IMAGE_MIME[fpExt(p)] !== undefined; }
		function fpIsMarkdown(p) { return FP_MARKDOWN_EXTS.has(fpExt(p)); }
		function fpLang(p) { return FP_LANG_BY_EXT[fpExt(p)]; }
		function fpFormatBytes(n) {
			if (!Number.isFinite(n) || n < 0) return "";
			if (n < 1024) return n + " B";
			if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
			return (n / 1024 / 1024).toFixed(2) + " MB";
		}
		function fpCleanPath(raw) {
			return String(raw ?? "").trim().replace(/^[\s"'`(【\[]+/, "").replace(/[\s"'`）),;:。.]+$/, "");
		}
		/** Heuristic gate for inline-code tokens that should behave as file links. */
		function fpPathLooksReal(raw) {
			const text = fpCleanPath(raw);
			if (text.length < 3 || text.length > 240) return false;
			if (/\s/.test(text) || text.includes("`") || text.includes("://")) return false;
			const hasSep = text.includes("/") || text.startsWith("~");
			const extOk = FP_KNOWN_EXTS.has(fpExt(text));
			if (!hasSep && !extOk) return false;
			// Bare two-segment fragments like "and/or" are prose, not paths.
			if (!extOk && !text.startsWith("/") && !text.startsWith("~") && !text.startsWith(".") && text.length <= 6) return false;
			return true;
		}
		function fpJoin(base, rel) {
			const b = String(base ?? "").replace(/[/\\]+$/, "");
			const r = String(rel ?? "").replace(/^[/\\]+/, "");
			if (b === "") return r;
			if (r === "") return b;
			return b + "/" + r;
		}

		// ── line diff engine (powers the IDEA-style two-pane comparison) ──
		/** Split content into lines; a trailing newline does not add a phantom row. */
		function fpSplitLines(text) {
			const all = String(text ?? "").split("\n");
			if (all.length > 0 && all[all.length - 1] === "") all.pop();
			return all;
		}
		/** Myers O(ND) line diff → steps [{t:'eq'|'del'|'ins', oldNo, newNo, text}]
		 *  with 1-based line numbers (0 on the side the step does not exist on).
		 *  Common prefix/suffix are trimmed first; middles that are too large or
		 *  too different degrade to a plain replace block instead of hanging. */
		function fpDiffLines(a, b) {
			const n = a.length, m = b.length;
			let start = 0;
			while (start < n && start < m && a[start] === b[start]) start += 1;
			let endA = n, endB = m;
			while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) { endA -= 1; endB -= 1; }
			const steps = [];
			for (let i = 0; i < start; i += 1) steps.push({ t: "eq", oldNo: i + 1, newNo: i + 1, text: a[i] });
			fpDiffMiddle(a, b, start, endA, endB, steps);
			const suffixLen = n - endA; // === m - endB
			for (let j = 0; j < suffixLen; j += 1) steps.push({ t: "eq", oldNo: endA + j + 1, newNo: endB + j + 1, text: a[endA + j] });
			return steps;
		}
		function fpDiffMiddle(a, b, from, endA, endB, out) {
			const n = endA - from, m = endB - from;
			if (n === 0 && m === 0) return;
			const emitReplace = () => {
				for (let i = 0; i < n; i += 1) out.push({ t: "del", oldNo: from + i + 1, newNo: 0, text: a[from + i] });
				for (let j = 0; j < m; j += 1) out.push({ t: "ins", oldNo: 0, newNo: from + j + 1, text: b[from + j] });
			};
			// Guards: keep time (O((n+m)·D)) and trace memory bounded.
			if (n + m > 8000 || n * m > 1000000) { emitReplace(); return; }
			const max = n + m;
			const MAX_D = 256;
			const size = 2 * max + 1;
			const v = new Int32Array(size);
			const trace = [];
			let depth = -1;
			let done = false;
			for (let d = 0; d <= max && !done; d += 1) {
				if (d > MAX_D) { emitReplace(); return; }
				trace.push(v.slice());
				depth = d;
				for (let k = -d; k <= d; k += 2) {
					let x;
					if (k === -d || (k !== d && v[k - 1 + max] < v[k + 1 + max])) x = v[k + 1 + max];
					else x = v[k - 1 + max] + 1;
					let y = x - k;
					while (x < n && y < m && a[from + x] === b[from + y]) { x += 1; y += 1; }
					v[k + max] = x;
					if (x >= n && y >= m) { done = true; break; }
				}
			}
			if (!done) { emitReplace(); return; }
			// Backtrack the edit sequence (inserts/deletes only). Each depth
			// contributes one edit possibly followed by a diagonal snake, which
			// must be peeled before classifying the edit itself.
			let x = n, y = m;
			const ops = [];
			for (let d = depth; d > 0; d -= 1) {
				const vd = trace[d];
				const k = x - y;
				let prevK;
				if (k === -d || (k !== d && vd[k - 1 + max] < vd[k + 1 + max])) prevK = k + 1;
				else prevK = k - 1;
				const prevX = vd[prevK + max];
				const prevY = prevX - prevK;
				while (x > prevX && y > prevY) { x -= 1; y -= 1; } // snake peel
				ops.push(x === prevX ? "ins" : "del");
				x = prevX; y = prevY;
			}
			ops.reverse();
			// Replay forward: equal diagonals between edits become 'eq' steps.
			let oi = 0, ni = 0;
			const emitEq = () => {
				while (oi < n && ni < m && a[from + oi] === b[from + ni]) {
					out.push({ t: "eq", oldNo: from + oi + 1, newNo: from + ni + 1, text: a[from + oi] });
					oi += 1; ni += 1;
				}
			};
			emitEq();
			for (const op of ops) {
				if (op === "del") { out.push({ t: "del", oldNo: from + oi + 1, newNo: 0, text: a[from + oi] }); oi += 1; }
				else { out.push({ t: "ins", oldNo: 0, newNo: from + ni + 1, text: b[from + ni] }); ni += 1; }
				emitEq();
			}
		}
		/** Align diff steps into side-by-side rows; consecutive delete/insert runs
		 *  pair up row-wise (IDEA shows such pairs as aligned modified lines). */
		function fpDiffRows(steps) {
			const rows = [];
			let i = 0;
			while (i < steps.length) {
				const s = steps[i];
				if (s.t === "eq") {
					rows.push({ kind: "ctx", left: { no: s.oldNo, text: s.text }, right: { no: s.newNo, text: s.text } });
					i += 1;
					continue;
				}
				const dels = [], inss = [];
				while (i < steps.length && steps[i].t !== "eq") {
					if (steps[i].t === "del") dels.push(steps[i]);
					else inss.push(steps[i]);
					i += 1;
				}
				const len = Math.max(dels.length, inss.length);
				for (let j = 0; j < len; j += 1) {
					rows.push({
						kind: "change",
						left: j < dels.length ? { no: dels[j].oldNo, text: dels[j].text } : null,
						right: j < inss.length ? { no: inss[j].newNo, text: inss[j].text } : null,
					});
				}
			}
			return rows;
		}
		/** Word-level LCS inside one modified pair → per-side highlighted
		 *  segments [{text, hl}], or null when the pair should stay whole-line. */
		function fpInlineDiff(a, b) {
			if (a === b || a === "" || b === "") return null;
			if (a.length * b.length > 60000) return null;
			const ta = a.match(/\S+|\s+/g) ?? [];
			const tb = b.match(/\S+|\s+/g) ?? [];
			const n = ta.length, m = tb.length;
			if (n * m > 40000) return null;
			const W = m + 1;
			const dp = new Uint32Array((n + 1) * W);
			for (let i = n - 1; i >= 0; i -= 1) {
				for (let j = m - 1; j >= 0; j -= 1) {
					dp[i * W + j] = ta[i] === tb[j]
						? dp[(i + 1) * W + j + 1] + 1
						: Math.max(dp[(i + 1) * W + j], dp[i * W + j + 1]);
				}
			}
			const left = [], right = [];
			const push = (arr, text, hl) => {
				const last = arr[arr.length - 1];
				if (last !== undefined && last.hl === hl) last.text += text;
				else arr.push({ text, hl });
			};
			let i = 0, j = 0;
			while (i < n && j < m) {
				if (ta[i] === tb[j]) { push(left, ta[i], false); push(right, tb[j], false); i += 1; j += 1; }
				else if (dp[(i + 1) * W + j] >= dp[i * W + j + 1]) { push(left, ta[i], true); i += 1; }
				else { push(right, tb[j], true); j += 1; }
			}
			while (i < n) { push(left, ta[i], true); i += 1; }
			while (j < m) { push(right, tb[j], true); j += 1; }
			return { left, right };
		}
		/** Build the renderable side-by-side model from one /__codex/git-diff
		 *  body: aligned rows (with word-level highlights on modified pairs) +
		 *  the hunk start indices the ↑/↓ change-navigation jumps between. */
		function fpBuildDiffModel(body) {
			if (body.binary === true || body.tooLarge === true) return { body, rows: [], hunks: [] };
			const steps = fpDiffLines(fpSplitLines(body.oldContent ?? ""), fpSplitLines(body.newContent ?? ""));
			const rows = fpDiffRows(steps);
			const hasChanges = rows.some((r) => r.kind === "change");
			const truncated = rows.length > FP_MAX_LINES;
			const shown = truncated ? rows.slice(0, FP_MAX_LINES) : rows;
			for (const row of shown) {
				if (row.kind !== "change" || row.left === null || row.right === null) continue;
				const inline = fpInlineDiff(row.left.text, row.right.text);
				if (inline !== null) { row.left.segs = inline.left; row.right.segs = inline.right; }
			}
			// One hunk = one contiguous run of change rows (IDEA-style jump targets).
			const hunks = [];
			for (let i = 0; i < shown.length; i += 1) {
				if (shown[i].kind === "change" && (i === 0 || shown[i - 1].kind !== "change")) hunks.push(i);
			}
			return { body, rows: shown, truncated, hasChanges, hunks };
		}

		function fpStatusPanel(icon, title, detail) {
			return h("div", { className: "ccx-fp-status" },
				h("span", { className: "ccx-fp-status-icon" }, icon),
				h("span", null, title),
				detail !== undefined && detail !== null ? detail : null,
			);
		}

		// ── IDEA-style two-pane diff rendering ──
		const DIFF_KIND_LABEL = { modified: "修改", added: "新增", deleted: "删除", untracked: "未跟踪" };
		function fpDiffCellPair(cell, mode) {
			// mode: "ctx" | "del" | "ins"; a null cell renders as filler.
			if (cell === null) {
				return [
					h("td", { key: "n", className: "ccx-diff-no pad" }, "\u00A0"),
					h("td", { key: "c", className: "ccx-diff-code pad" }, "\u00A0"),
				];
			}
			const mark = mode === "ctx" ? "" : " " + mode;
			const content = Array.isArray(cell.segs)
				? cell.segs.map((seg, si) => seg.hl
					? h("span", { key: si, className: mode === "del" ? "ccx-diff-hl-del" : "ccx-diff-hl-ins" }, seg.text)
					: seg.text)
				: (cell.text === "" ? "\u00A0" : cell.text);
			return [
				h("td", { key: "n", className: "ccx-diff-no" + mark }, cell.no),
				h("td", { key: "c", className: "ccx-diff-code" + mark }, content),
			];
		}
		function fpRenderDiffRow(row, idx) {
			if (row.kind === "ctx") {
				const L = fpDiffCellPair(row.left, "ctx");
				const R = fpDiffCellPair(row.right, "ctx");
				return h("tr", { key: idx, "data-ix": idx }, L[0], L[1], R[0], R[1]);
			}
			const L = fpDiffCellPair(row.left, "del");
			const R = fpDiffCellPair(row.right, "ins");
			return h("tr", { key: idx, "data-ix": idx }, L[0], L[1], R[0], R[1]);
		}
		/** Scroll the diff pane so the target row sits a little below the top
		 *  edge (a few context lines stay visible, IDEA-style). */
		function fpScrollToRow(sc, tr, behavior) {
			const scRect = sc.getBoundingClientRect();
			const trRect = tr.getBoundingClientRect();
			const inset = Math.min(84, Math.floor(sc.clientHeight * 0.16));
			const top = sc.scrollTop + (trRect.top - scRect.top) - inset;
			sc.scrollTo({ top: Math.max(0, top), behavior: behavior ?? "smooth" });
		}
		function fpRenderDiffBody(model, scrollRef) {
			if (model === null) return fpStatusPanel("⏳", "正在加载…");
			const body = model.body;
			if (body.tooLarge === true) return fpStatusPanel("📦", "文件过大（" + fpFormatBytes(body.size) + "）", "超出对比上限，暂不提供差异渲染。");
			if (body.binary === true) return fpStatusPanel("🧩", "二进制文件", "内容无法以文本形式对比。");
			if (model.hasChanges === false) return fpStatusPanel("✅", "没有差异", "两侧内容完全一致（变更可能已被还原）。");
			const leftLabel = body.kind === "added" || body.kind === "untracked"
				? "（无旧版本）"
				: (body.oldLabel ?? "HEAD") + " · 旧版本";
			const rightLabel = body.kind === "deleted"
				? "（已删除）"
				: (body.newLabel ?? "工作区") + " · 新版本";
			return h(React.Fragment, null,
				h("div", { className: "ccx-diff-bar" },
					h("span", null, leftLabel),
					h("span", null, rightLabel)),
				h("div", { className: "ccx-diff-scroll", ref: scrollRef },
					h("table", { className: "ccx-diff" },
						h("colgroup", null,
							h("col", { className: "ccx-diff-col-no" }),
							h("col", { className: "ccx-diff-col-code" }),
							h("col", { className: "ccx-diff-col-no" }),
							h("col", { className: "ccx-diff-col-code" })),
						h("tbody", null, model.rows.map(fpRenderDiffRow)))),
				model.truncated === true
					? h("div", { className: "ccx-diff-more" }, "差异过长，仅显示前 " + FP_MAX_LINES + " 行对比。")
					: null);
		}

		/** Module-level preview state shared by the git card, the click
		 *  interceptor and the sidebar panel. */
		const filePreviewStore = {
			state: { open: false, path: "", diff: null, sessionId: undefined, cwd: "", nonce: 0 },
			listeners: new Set(),
			get() { return this.state; },
			subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
			emit() { for (const fn of [...this.listeners]) { try { fn(); } catch { /* listener error */ } } },
			open(path) {
				const cleaned = fpCleanPath(path);
				if (cleaned === "") return;
				// One right-hand panel at a time: the file-tree sidebar yields.
				try { fileTreeStore.close(); } catch { /* tree region not loaded */ }
				this.state = { ...this.state, open: true, path: cleaned, diff: null, nonce: this.state.nonce + 1 };
				this.emit();
			},
			/** Open the IDEA-style two-pane git diff for one changed file.
			 *  `rel` is the workspace-relative path git itself reports. */
			openDiff(path, rel) {
				const cleaned = fpCleanPath(path);
				if (cleaned === "" || rel === "") return;
				try { fileTreeStore.close(); } catch { /* tree region not loaded */ }
				this.state = { ...this.state, open: true, path: cleaned, diff: { rel }, nonce: this.state.nonce + 1 };
				this.emit();
			},
			close() {
				if (!this.state.open) return;
				this.state = { ...this.state, open: false };
				this.emit();
			},
			setSession(sessionId, cwd) {
				if (this.state.sessionId === sessionId && this.state.cwd === cwd) return;
				// The preview is session-bound: leaving for another session closes it.
				const switchingAway = this.state.open && this.state.sessionId !== undefined && sessionId !== this.state.sessionId;
				this.state = { ...this.state, sessionId, cwd, open: switchingAway ? false : this.state.open };
				this.emit();
			},
		};

		/** Session-scoped bridge: keeps the module stores aware of the active
		 *  session's workspace so relative paths resolve server-side. Both
		 *  right-hand panels are session-bound: switching sessions closes them. */
		function SessionFileBridge(props) {
			const sessionId = props.sessionId;
			const cwd = props.useSession((s) => s.cwd) || "";
			useEffect(() => {
				filePreviewStore.setSession(sessionId, cwd);
				fileTreeStore.setSession(sessionId, cwd);
			}, [sessionId, cwd]);
			return null;
		}

		/** Global click interception: produced-file chips, native file-mention
		 *  buttons and path-like inline code tokens open the sidebar instead of
		 *  the OS handler. Full paths ride the `title` attribute on the chip /
		 *  mention buttons (their visible text is only the basename). */
		function makeFilePreviewInterceptor() {
			return function startFilePreviewInterceptor() {
				const intercept = (event, pathText) => {
					event.preventDefault();
					event.stopPropagation();
					filePreviewStore.open(pathText);
				};
				const onClick = (event) => {
					if (event.button !== 0 || event.defaultPrevented) return;
					const target = event.target instanceof Element ? event.target : null;
					if (target === null) return;
					const btn = target.closest("button");
					if (btn !== null) {
						// a) Turn-tail produced-file chips: buttons inside the
						//    [data-produced-files-row] container.
						// b) Inline markdown file-mention buttons (hashed
						//    *fileMention* class from the platform renderer).
						// c) Tool-row file links inside chat tool cards (hashed
						//    *fileLink* class; visible text is the path, already
						//    relativized to the session workspace).
						const isChip = btn.closest("[data-produced-files-row]") !== null;
						const cls = !isChip && typeof btn.className === "string" ? btn.className : "";
						const isFileButton = isChip || cls.indexOf("fileMention") !== -1 || cls.indexOf("fileLink") !== -1;
						if (isFileButton) {
							const pathText = fpCleanPath(btn.getAttribute("title") || btn.textContent);
							if (pathText !== "") intercept(event, pathText);
						}
						return;
					}
					// c) Inline code tokens that look like paths.
					const code = target.closest("code");
					if (code === null || code.closest("pre") !== null) return;
					if (code.querySelector("button") !== null) return;
					if (code.closest("[data-phase]") === null) return;
					const pathText = fpCleanPath(code.textContent);
					if (pathText === "" || !fpPathLooksReal(pathText)) return;
					intercept(event, pathText);
				};
				const onOver = (event) => {
					const target = event.target instanceof Element ? event.target : null;
					if (target === null || typeof target.closest !== "function") return;
					const code = target.closest("code");
					if (code === null || code.closest("pre") !== null || code.closest("[data-phase]") === null) return;
					if (fpPathLooksReal(code.textContent)) {
						code.classList.add("ccx-filehint");
						document.documentElement.classList.add("ccx-fp-hints");
					}
				};
				const onOut = (event) => {
					const target = event.target instanceof Element ? event.target : null;
					if (target === null || typeof target.closest !== "function") return;
					const code = target.closest("code");
					if (code !== null) code.classList.remove("ccx-filehint");
				};
				const onKey = (event) => {
					if (event.key === "Escape" && filePreviewStore.get().open) filePreviewStore.close();
				};
				document.addEventListener("click", onClick, true);
				document.addEventListener("mouseover", onOver);
				document.addEventListener("mouseout", onOut);
				document.addEventListener("keydown", onKey);
				return () => {
					document.removeEventListener("click", onClick, true);
					document.removeEventListener("mouseover", onOver);
					document.removeEventListener("mouseout", onOut);
					document.removeEventListener("keydown", onKey);
				};
			};
		}

		/** The right-hand panels need the theme's SOLID base color — the same
		 *  surface the chat page shows. Wallpaper mode overrides
		 *  `--dsw-alias-bg-base` with a translucent layer and forces body
		 *  transparent, so reading the live token/computed style would give
		 *  glass instead of a readable surface. Resolve the active theme's own
		 *  registered token (pre-override) from the theme snapshot; fall back
		 *  to the built-in static palette, then to the computed body color. */
		function ccxSamplePageBg(ctx) {
			try {
				const snap = ctx !== undefined && ctx.theme !== undefined && typeof ctx.theme.getTheme === "function" ? ctx.theme.getTheme() : undefined;
				const active = snap?.active;
				const registered = Array.isArray(snap?.themes) && active !== undefined
					? snap.themes.find((t) => t.id === active.id)
					: undefined;
				let token = registered?.tokens?.["--dsw-alias-bg-base"];
				if (token !== undefined && typeof token === "object" && token !== null) {
					token = active?.colorScheme === "light" ? token.light : token.dark;
				}
				if (typeof token === "string" && token !== "") return token;
				// Built-in light/dark themes register no tokens: use the static palette.
				if (active !== undefined) {
					const staticToken = active.colorScheme === "dark" ? "--dsw-static-neutral-bluish-950" : "--dsw-static-neutral-bluish-00";
					const v = getComputedStyle(document.body).getPropertyValue(staticToken).trim();
					if (v !== "") return v;
				}
			} catch { /* fall through */ }
			try {
				const bg = getComputedStyle(document.body).backgroundColor;
				if (bg && bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)") return bg;
			} catch { /* no background info */ }
			return "";
		}

		/** Resolve a markdown image target against the md file's own directory.
		 *  Returns the path to request from /__codex/raw (workspace-relative, or an
		 *  absolute path that stays inside the workspace server-side), or null
		 *  when the target must be left untouched (http/data URIs, ~ shortcuts). */
		function ccxResolveMdImagePath(mdPath, imgSrc) {
			const src = String(imgSrc ?? "").trim();
			if (src === "") return null;
			if (/^([a-z][a-z0-9+.-]*:|\/\/|~)/i.test(src)) return null;
			// Anchors / query fragments mean nothing to the filesystem.
			const clean = src.split(/[?#]/)[0];
			if (clean === "") return null;
			// Workspace-root-absolute targets resolve against the workspace itself.
			if (clean.startsWith("/")) return clean;
			const md = String(mdPath ?? "");
			const cut = md.lastIndexOf("/");
			const dir = cut === -1 ? "" : md.slice(0, cut);
			const segments = dir === "" ? [] : dir.split("/");
			for (const seg of clean.split("/")) {
				if (seg === "" || seg === ".") continue;
				if (seg === "..") { if (segments.length > 0) segments.pop(); continue; }
				segments.push(seg);
			}
			return segments.join("/");
		}

		/** Rewrite relative image URLs in markdown source into absolute
		 *  <origin>/__codex/raw URLs. The platform renderer only accepts full
		 *  http(s) URLs for images — every other form degrades to bare alt text —
		 *  so workspace images only show up once rewritten. Handles inline
		 *  `![alt](src "title")` (with the `<spaced target>` form) plus
		 *  `[label]: target` reference definitions; fenced code blocks keep their
		 *  literal text. */
		function ccxRewriteMarkdownImages(text, mdPath, cwd, sessionId) {
			const rewriteTarget = (target) => {
				const rel = ccxResolveMdImagePath(mdPath, target);
				if (rel === null || rel === "") return String(target ?? "");
				const params = new URLSearchParams();
				params.set("path", rel);
				if (cwd !== "") params.set("cwd", cwd);
				else if (sessionId !== undefined) params.set("session", String(sessionId));
				const origin = typeof location !== "undefined" && typeof location.origin === "string" ? location.origin : "";
				return origin + "/__codex/raw?" + params.toString();
			};
			const rewriteInline = (line) => line.replace(
				/(!\[[^\]]*\]\()\s*(?:<([^>]*)>|([^)\s]+))(\s+(?:"[^"]*"|'[^']*'))?\s*(\))/g,
				(m, open, bracketed, bare, title, close) => open + rewriteTarget(bracketed !== undefined ? bracketed : bare) + (title ?? "") + close,
			);
			const rewriteDefs = (line) => line.replace(
				/^(\s{0,3}\[[^\]]+\]:\s*)(?:<([^>]*)>|(\S+))(\s+.*)?$/,
				(m, label, bracketed, bare, rest) => label + rewriteTarget(bracketed !== undefined ? bracketed : bare) + (rest ?? ""),
			);
			const lines = String(text ?? "").split("\n");
			let inFence = false;
			let fenceMark = "";
			for (let i = 0; i < lines.length; i += 1) {
				const fence = lines[i].match(/^\s{0,3}(`{3,}|~{3,})/);
				if (fence !== null) {
					if (!inFence) { inFence = true; fenceMark = fence[1].slice(0, 3); }
					else if (fence[1].startsWith(fenceMark)) { inFence = false; fenceMark = ""; }
					continue;
				}
				if (inFence) continue;
				lines[i] = rewriteDefs(rewriteInline(lines[i]));
			}
			return lines.join("\n");
		}

		/** The right-hand push panel. Renders file content by type: markdown via
		 *  the platform renderer, code via the line-numbered ReadBlock, images
		 *  inline, directories as a shallow listing. */
		function makeFilePreviewPanel(ctx) {
			const MarkdownText = PRIM.MarkdownText;
			const ReadBlock = PRIM.ReadBlock;
			const writeClipboard = PRIM.writeClipboard;
			const samplePageBg = () => ccxSamplePageBg(ctx);

			function fpReadBlock(label, content, lang) {
				const all = String(content).split("\n");
				if (all.length > 0 && all[all.length - 1] === "") all.pop();
				const totalLines = all.length;
				const lines = all.slice(0, FP_MAX_LINES).map((text, i) => ({ number: i + 1, text }));
				return h(ReadBlock, {
					label,
					lines,
					totalLines,
					lang,
					maxLines: Math.max(lines.length, 1),
					className: "ccx-fp-read",
				});
			}
			function fpRenderBody(data, view, session) {
				const body = data.body;
				if (body.kind === "dir") {
					const items = (body.entries ?? []).map((entry) => h("div", {
						key: entry.type + ":" + entry.name,
						className: "ccx-fp-dir-item",
						title: "点击打开 " + entry.name,
						onClick: () => filePreviewStore.open(fpJoin(body.path, entry.name)),
					},
						h("span", { className: "ccx-fp-dir-type" }, entry.type === "dir" ? "📁" : "📄"),
						h("span", null, entry.name + (entry.type === "dir" ? "/" : "")),
					));
					return {
						flush: false,
						node: h(React.Fragment, null,
							h("div", { className: "ccx-meta", style: { marginBottom: "10px" } }, "目录 · " + body.count + " 项"),
							h("div", { className: "ccx-fp-dir" }, items.length > 0 ? items : "（空目录）")),
					};
				}
				if (body.tooLarge === true) {
					return { flush: false, node: fpStatusPanel("📦", "文件过大（" + fpFormatBytes(body.size) + "）", "超出预览上限，暂不提供内容渲染。") };
				}
				if (body.image === true && body.encoding === "base64") {
					const mime = FP_IMAGE_MIME[fpExt(body.path)] ?? "image/png";
					return {
						flush: false,
						node: h("div", { className: "ccx-fp-img-wrap" },
							h("img", { className: "ccx-fp-img", src: "data:" + mime + ";base64," + body.content, alt: baseName(body.path) })),
					};
				}
				if (body.binary === true) {
					return { flush: false, node: fpStatusPanel("🧩", "二进制文件（" + fpFormatBytes(body.size) + "）", "内容无法以文本形式预览。") };
				}
				let content = String(body.content ?? "");
				const ext = fpExt(body.path);
				if (ext === "json" || ext === "jsonc") {
					try { content = JSON.stringify(JSON.parse(content), null, 2); } catch { /* keep raw */ }
				}
				if (fpIsMarkdown(body.path) && view === "rendered" && MarkdownText !== undefined) {
					// Workspace-relative image targets must become absolute
					// /__codex/raw URLs or the renderer degrades them to alt text.
					const rewritten = ccxRewriteMarkdownImages(content, body.path, session?.cwd ?? "", session?.sessionId);
					return { flush: false, node: h(MarkdownText, { text: rewritten }) };
				}
				if (ReadBlock === undefined) {
					return { flush: false, node: h("pre", { style: { whiteSpace: "pre-wrap", fontSize: "12px" } }, content) };
				}
				const lang = fpIsMarkdown(body.path) ? "markdown" : fpLang(body.path);
				return { flush: true, node: fpReadBlock(body.path, content, lang) };
			}

			return function FilePreviewPanel() {
				const state = useSyncExternalStore(
					(fn) => filePreviewStore.subscribe(fn),
					() => filePreviewStore.get(),
					() => filePreviewStore.get(),
				);
				const [width, setWidth] = useState(() => {
					try {
						const saved = Number(JSON.parse(localStorage.getItem(FP_WIDTH_KEY) ?? "null"));
						if (Number.isFinite(saved) && saved >= 360 && saved <= 1200) return saved;
					} catch { /* storage unavailable */ }
					return 540;
				});
				const [view, setView] = useState("rendered");
				const [data, setData] = useState(null);
				const [copied, setCopied] = useState(false);
				const [panelBg, setPanelBg] = useState(() => samplePageBg());
				const widthRef = useRef(width);
				widthRef.current = width;

				// Push the shell left while open; clean up on close/unmount.
				useEffect(() => {
					const html = document.documentElement;
					if (state.open) html.classList.add("ccx-fp-open");
					else html.classList.remove("ccx-fp-open");
					return () => { html.classList.remove("ccx-fp-open"); };
				}, [state.open]);
				// Panel width variable (updated live while dragging).
				useEffect(() => {
					const html = document.documentElement;
					if (!state.open) return undefined;
					html.style.setProperty("--ccx-fp-w", width + "px");
					return () => { html.style.removeProperty("--ccx-fp-w"); };
				}, [state.open, width]);
				// Match the panel background to the chat page's actual painted color.
				useEffect(() => {
					if (!state.open) return undefined;
					const update = () => setPanelBg(samplePageBg());
					update();
					const off = ctx !== undefined && typeof ctx.on === "function" ? ctx.on("theme/change", update) : null;
					return () => { if (off) off(); };
				}, [state.open]);
				// Fresh view mode per file.
				useEffect(() => { setView("rendered"); setCopied(false); }, [state.path, state.nonce]);
				// Load content (file preview) or both diff sides (git diff mode).
				useEffect(() => {
					if (!state.open) return undefined;
					let alive = true;
					setData({ status: "loading" });
					const params = new URLSearchParams();
					if (state.diff !== null) {
						params.set("file", state.diff.rel);
						if (state.cwd !== "") params.set("cwd", state.cwd);
						else if (state.sessionId !== undefined) params.set("session", String(state.sessionId));
						fetch("/__codex/git-diff?" + params.toString()).then(async (res) => {
							const ctype = res.headers.get("content-type") ?? "";
							if (!ctype.includes("application/json")) {
								if (alive) setData({ status: "error", kind: res.status === 404 ? "route" : "http", code: res.status });
								return;
							}
							const body = await res.json();
							if (!alive) return;
							if (!res.ok || body.error !== undefined) {
								// "unknown codex-clone route" = the host half predates the
								// /__codex/git-diff route and needs one dsh web restart.
								const kind = body.error === "unknown codex-clone route" ? "route" : "other";
								setData({ status: "error", kind, message: body.error });
								return;
							}
							setData({ status: "ok", diffBody: body });
						}).catch((error) => {
							if (alive) setData({ status: "error", kind: "network", message: String(error?.message ?? error) });
						});
						return () => { alive = false; };
					}
					params.set("path", state.path);
					if (state.cwd !== "") params.set("cwd", state.cwd);
					else if (state.sessionId !== undefined) params.set("session", String(state.sessionId));
					fetch("/__codex/file?" + params.toString()).then(async (res) => {
						const ctype = res.headers.get("content-type") ?? "";
						if (!ctype.includes("application/json")) {
							if (alive) setData({ status: "error", kind: res.status === 404 ? "route" : "http", code: res.status });
							return;
						}
						const body = await res.json();
						if (!alive) return;
						if (!res.ok || body.error !== undefined) {
							// "unknown codex-clone route" = the host half predates the
							// /__codex/file route and needs one dsh web restart.
							const kind = body.error === "unknown codex-clone route" ? "route"
								: body.error === "no such file" ? "missing" : "other";
							setData({ status: "error", kind, message: body.error, resolved: body.path });
							return;
						}
						setData({ status: "ok", body });
					}).catch((error) => {
						if (alive) setData({ status: "error", kind: "network", message: String(error?.message ?? error) });
					});
					return () => { alive = false; };
				}, [state.open, state.path, state.diff, state.nonce, state.cwd, state.sessionId]);
				// The two-pane comparison needs room: widen the panel on diff open
				// (never shrink a width the user already chose).
				useEffect(() => {
					if (!state.open || state.diff === null) return;
					setWidth((w) => {
						if (w >= 780) return w;
						return Math.max(780, Math.min(980, Math.floor(window.innerWidth * 0.8)));
					});
				}, [state.open, state.diff, state.nonce]);
				// Side-by-side model: aligned rows, word-level highlights, hunks.
				const diffModel = useMemo(() => {
					if (state.diff === null || data === null || data.status !== "ok" || data.diffBody === undefined) return null;
					return fpBuildDiffModel(data.diffBody);
				}, [state.diff, data]);
				// Change-hunk navigation: ↑/↓ buttons + initial jump to the first change.
				const diffScrollRef = useRef(null);
				const [hunkIx, setHunkIx] = useState(0);
				const scrolledNonceRef = useRef(-1);
				useEffect(() => { setHunkIx(0); }, [state.diff, state.nonce]);
				useEffect(() => {
					if (!state.open || state.diff === null || diffModel === null) return;
					if (diffModel.hasChanges !== true || diffModel.hunks.length === 0) return;
					if (scrolledNonceRef.current === state.nonce) return;
					const sc = diffScrollRef.current;
					if (sc === null) return;
					scrolledNonceRef.current = state.nonce;
					const tr = sc.querySelector('tr[data-ix="' + diffModel.hunks[0] + '"]');
					if (tr !== null) fpScrollToRow(sc, tr, "auto");
				}, [state.open, state.diff, state.nonce, diffModel]);

				if (!state.open) return null;

				const jumpHunk = (delta) => {
					if (diffModel === null || diffModel.hunks.length === 0) return;
					const sc = diffScrollRef.current;
					if (sc === null) return;
					const nextIx = Math.max(0, Math.min(diffModel.hunks.length - 1, hunkIx + delta));
					setHunkIx(nextIx);
					const tr = sc.querySelector('tr[data-ix="' + diffModel.hunks[nextIx] + '"]');
					if (tr !== null) fpScrollToRow(sc, tr, "smooth");
				};

				const onResizeStart = (event) => {
					event.preventDefault();
					const startX = event.clientX;
					const startW = widthRef.current;
					document.body.style.cursor = "col-resize";
					document.documentElement.classList.add("ccx-fp-resizing");
					const onMove = (ev) => {
						const next = Math.max(360, Math.min(Math.round(window.innerWidth * 0.82), startW + (startX - ev.clientX)));
						setWidth(next);
					};
					const onUp = () => {
						document.body.style.cursor = "";
						document.documentElement.classList.remove("ccx-fp-resizing");
						document.removeEventListener("mousemove", onMove);
						document.removeEventListener("mouseup", onUp);
						try { localStorage.setItem(FP_WIDTH_KEY, JSON.stringify(widthRef.current)); } catch { /* quota */ }
					};
					document.addEventListener("mousemove", onMove);
					document.addEventListener("mouseup", onUp);
				};
				const diffMode = state.diff !== null;
				const okBody = !diffMode && data?.status === "ok" ? data.body : null;
				const displayPath = okBody !== null ? okBody.path : state.path;
				const isMarkdownFile = okBody !== null && okBody.kind === "file" && fpIsMarkdown(okBody.path);
				const sizeInfo = okBody !== null && typeof okBody.size === "number" ? " · " + fpFormatBytes(okBody.size) : "";
				const diffKind = diffMode && diffModel !== null ? String(diffModel.body.kind ?? "") : "";
				const diffSubtitle = diffMode
					? (diffModel !== null && typeof diffModel.body.file === "string" ? diffModel.body.file : state.path)
					: displayPath + sizeInfo;
				const onCopyPath = () => {
					if (copied) return;
					const doCopy = writeClipboard !== undefined
						? writeClipboard(displayPath)
						: (navigator.clipboard?.writeText(displayPath).then(() => true).catch(() => false) ?? Promise.resolve(false));
					doCopy.then((ok) => {
						if (!ok) return;
						setCopied(true);
						window.setTimeout(() => setCopied(false), 1200);
					});
				};

				let bodyNode;
				let flush = false;
				if (data === null || data.status === "loading") {
					bodyNode = fpStatusPanel("⏳", "正在加载…", h("code", null, state.path));
				} else if (data.status === "error") {
					if (data.kind === "route") {
						bodyNode = fpStatusPanel("🔌", diffMode ? "差异服务未就绪" : "文件预览服务未就绪",
							h(React.Fragment, null,
								h("span", null, "宿主路由 " + (diffMode ? "/__codex/git-diff" : "/__codex/file") + " 尚未加载。"),
								h("span", null, "重启一次 dsh web 服务即可启用" + (diffMode ? "差异对比" : "内容预览") + "。")));
					} else if (data.kind === "missing") {
						bodyNode = fpStatusPanel("🫥", "文件不存在或已被删除", h("code", null, data.resolved ?? state.path));
					} else {
						bodyNode = fpStatusPanel("⚠️", "加载失败", h("code", null, data.message ?? ("HTTP " + (data.code ?? ""))));
					}
				} else if (diffMode) {
					bodyNode = fpRenderDiffBody(diffModel, diffScrollRef);
					flush = true;
				} else {
					const rendered = fpRenderBody(data, view, { cwd: state.cwd, sessionId: state.sessionId });
					bodyNode = rendered.node;
					flush = rendered.flush;
				}

				return h("aside", {
					className: "ccx-fp" + (diffMode ? " ccx-fp-diff" : ""),
					role: "complementary",
					"aria-label": diffMode ? "变更对比" : "文件预览",
					style: panelBg !== ""
						? { background: panelBg, "--ccx-fp-bg": panelBg }
						: undefined,
				},
					h("div", { className: "ccx-fp-resize", onMouseDown: onResizeStart, title: "拖动调整宽度" }),
					h("div", { className: "ccx-fp-head" },
						h("span", { className: "ccx-fp-icon" }, mentionIconReact("file")),
						h("div", { className: "ccx-fp-title" },
							h("span", { className: "ccx-fp-name" },
								baseName(displayPath) || displayPath,
								diffMode && diffKind !== "" ? h("span", { className: "ccx-diff-badge " + diffKind }, DIFF_KIND_LABEL[diffKind] ?? diffKind) : null,
								diffMode && diffModel !== null && diffKind !== "untracked"
									? h("span", { className: "ccx-diff-stats" },
										h("span", { className: "ccx-git-add" }, "+" + (diffModel.body.added || 0)),
										h("span", { className: "ccx-git-del" }, "−" + (diffModel.body.deleted || 0)))
									: null),
							h("span", { className: "ccx-fp-path" }, diffSubtitle)),
						h("div", { className: "ccx-fp-actions" },
							diffMode && diffModel !== null && diffModel.hunks.length > 0 ? h(React.Fragment, null,
								h("span", { className: "ccx-diff-count", title: "当前修改处 / 修改处总数" },
									(hunkIx + 1) + " / " + diffModel.hunks.length),
								h("div", { className: "ccx-fp-seg ccx-diff-nav" },
									h("button", {
										type: "button", title: "上一个修改处", disabled: hunkIx <= 0,
										onClick: () => jumpHunk(-1),
									}, "↑"),
									h("button", {
										type: "button", title: "下一个修改处", disabled: hunkIx >= diffModel.hunks.length - 1,
										onClick: () => jumpHunk(1),
									}, "↓")))
								: null,
							diffMode ? h("button", {
								type: "button", className: "ccx-fp-btn", title: "以普通预览打开当前文件",
								onClick: () => filePreviewStore.open(state.path),
							}, "预览文件") : null,
							isMarkdownFile ? h("div", { className: "ccx-fp-seg" },
								h("button", { type: "button", className: view === "rendered" ? "on" : "", onClick: () => setView("rendered") }, "渲染"),
								h("button", { type: "button", className: view === "source" ? "on" : "", onClick: () => setView("source") }, "源码"),
							) : null,
							h("button", { type: "button", className: "ccx-fp-btn", onClick: onCopyPath }, copied ? "已复制" : "复制路径"),
							h("button", { type: "button", className: "ccx-fp-btn", title: "关闭（Esc）", onClick: () => filePreviewStore.close() }, "✕"))),
					h("div", { className: "ccx-fp-body" + (diffMode ? " diff" : (flush ? " flush" : "")) }, bodyNode),
				);
			};
		}
		//#endregion

		//#region GitCard
		function makeGitCard(ctx) {
			return function GitCard(props) {
				const sessionId = props.sessionId;
				const cwd = props.useSession((s) => s.cwd);
				const [stats, setStats] = useState(null);
				const [open, setOpen] = useState(true); // Default expanded
				const [isTrajectoryView, setIsTrajectoryView] = useState(false);
				const rootRef = useRef(null);

				// Detect if we're in trajectory view by checking the active tab
				useEffect(() => {
					const checkView = () => {
						// Find all tab-like buttons and check if "轨迹" tab is active
						const allButtons = document.querySelectorAll('button, [role="tab"], [data-tab]');
						let trajectoryActive = false;
						for (const btn of allButtons) {
							const text = (btn.textContent || "").trim();
							if (text === "轨迹") {
								// Check if this tab is currently active/selected
								const isActive = btn.classList.contains("active") ||
									btn.classList.contains("on") ||
									btn.getAttribute("aria-selected") === "true" ||
									btn.getAttribute("data-active") === "true" ||
									(btn.parentElement && btn.parentElement.querySelector(".active, .on") === btn);
								if (isActive) {
									trajectoryActive = true;
									break;
								}
							}
						}
						// Also check: if "对话" tab exists and is NOT active, we're likely in trajectory
						if (!trajectoryActive) {
							for (const btn of allButtons) {
								const text = (btn.textContent || "").trim();
								if (text === "对话") {
									const isActive = btn.classList.contains("active") ||
										btn.classList.contains("on") ||
										btn.getAttribute("aria-selected") === "true" ||
										btn.getAttribute("data-active") === "true" ||
										(btn.parentElement && btn.parentElement.querySelector(".active, .on") === btn);
									if (!isActive) {
										// Check if trajectory tab exists (meaning we switched away from chat)
										const hasTrajectoryTab = Array.from(allButtons).some(b => (b.textContent || "").trim() === "轨迹");
										if (hasTrajectoryTab) {
											trajectoryActive = true;
										}
									}
									break;
								}
							}
						}
						setIsTrajectoryView(trajectoryActive);
					};
					checkView();
					const interval = setInterval(checkView, 300);
					return () => clearInterval(interval);
				}, []);

				useEffect(() => {
					let alive = true;
					const load = async () => {
						try {
							const res = await fetch("/__codex/git?session=" + encodeURIComponent(sessionId));
							if (!res.ok) return;
							const data = await res.json();
							if (alive) setStats(data);
						} catch { /* server route unavailable */ }
					};
					load();
					const dispose = ctx.interval(load, 5000);
					return () => { alive = false; dispose(); };
				}, [sessionId, cwd]);
				useEffect(() => {
					if (!open) return;
					const onDown = (event) => {
						if (rootRef.current !== null && !rootRef.current.contains(event.target)) setOpen(false);
					};
					document.addEventListener("mousedown", onDown, true);
					return () => document.removeEventListener("mousedown", onDown, true);
				}, [open]);
				// Hide in trajectory view
				if (isTrajectoryView) return null;
				if (stats === null || stats.isRepo !== true) return null;
				const dirty = stats.added > 0 || stats.deleted > 0 || stats.changed > 0 || stats.untracked > 0;
				const totalFiles = stats.changed + stats.untracked;
				return h("div", { className: "ccx-git-block", ref: rootRef },
					h("div", { className: "ccx-git-block-header" },
						h("span", { className: "ccx-git-block-title" },
							h("span", { className: "ccx-git-dot" + (dirty ? "" : " clean") }),
							"变更"
						),
						h("button", {
							type: "button",
							className: "ccx-git-block-toggle",
							title: open ? "收起" : "展开文件列表",
							onClick: () => setOpen((v) => !v),
						}, open ? "▲" : "▼"),
					),
					h("div", { className: "ccx-git-block-stats" },
						stats.branch ? h("span", { className: "ccx-git-block-stat" },
							h("span", null, "⎇"),
							h("span", { style: { color: "var(--dsw-alias-label-primary)", fontWeight: 500 } }, stats.branch)
						) : null,
						dirty ? h(React.Fragment, null,
							h("span", { className: "ccx-git-block-stat" },
								h("span", { className: "ccx-git-add" }, "+" + stats.added),
							),
							h("span", { className: "ccx-git-block-stat" },
								h("span", { className: "ccx-git-del" }, "−" + stats.deleted),
							),
							h("span", { className: "ccx-git-block-stat" },
								h("span", { className: "ccx-git-files-count" }, totalFiles + " 文件"),
							),
						) : h("span", { className: "ccx-git-files-count" }, "已同步"),
					),
					open ? h("div", { className: "ccx-git-pop", style: { position: "relative", top: 0, right: 0, marginTop: "8px" } },
						h("div", { className: "ccx-git-pop-title" },
							"工作区变更 · " + totalFiles + " 个文件 · +" + stats.added + " −" + stats.deleted + (stats.untracked > 0 ? " · " + stats.untracked + " 未跟踪" : "")),
						stats.files.length === 0 && stats.untracked === 0
							? h("div", { className: "ccx-git-empty" }, "没有已跟踪的变更。")
							: stats.files.map((f) => h("div", {
								key: f.file,
								className: "ccx-git-file clickable",
								title: f.file + " · 点击对比变更",
								onClick: () => filePreviewStore.openDiff(fpJoin(cwd, f.file), f.file),
							},
								h("span", { className: "ccx-git-file-path" }, f.file),
								f.untracked === true
									? h("span", { className: "ccx-git-untracked" }, "未跟踪")
									: h(React.Fragment, null,
										h("span", { className: "ccx-git-add" }, "+" + f.added),
										h("span", { className: "ccx-git-del" }, "−" + f.deleted)))),
						(() => {
							const listedUntracked = stats.files.filter((f) => f.untracked === true).length;
							const rest = stats.untracked - listedUntracked;
							return rest > 0 ? h("div", { className: "ccx-git-empty" }, "另有 " + rest + " 个未跟踪文件。") : null;
						})(),
					) : null,
				);
			};
		}
		//#endregion

		//#region HomeCards
		const DEFAULT_PROMPTS = [
			{ icon: "🚀", title: "解释这个项目", prompt: "请解释这个项目的整体架构、主要模块和入口文件。" },
			{ icon: "🐛", title: "查找并修复 Bug", prompt: "帮我检查这个仓库，找出潜在的 bug 并修复它们。" },
			{ icon: "✨", title: "实现新功能", prompt: "帮我实现一个新功能：" },
			{ icon: "🧪", title: "补充测试", prompt: "为当前项目的核心逻辑补充单元测试。" },
			{ icon: "📖", title: "生成 README", prompt: "为这个项目生成一份结构完整的 README.md。" },
			{ icon: "🎨", title: "重构优化", prompt: "审视当前代码，给出可读性与性能的重构建议并实施。" },
		];
		function makeHomeCards(ctx, config, useConfig) {
			return function HomeCards(props) {
				const blank = props.useSession((s) => s.blank);
				const sessionId = props.sessionId;
				const cwd = props.useSession((s) => s.cwd) || "";
				const cfg = useConfig();
				const [branch, setBranch] = useState("");
				const [dirName, setDirName] = useState("");
				// Initialize quickPrompts with defaults if empty (ensures deletability)
				useEffect(() => {
					if (!Array.isArray(cfg.quickPrompts) || cfg.quickPrompts.length === 0) {
						config.set("quickPrompts", [...DEFAULT_PROMPTS]);
					}
				}, []); // Run only once on mount
				// Fetch git branch info using sessionId (same as GitCard)
				useEffect(() => {
					let alive = true;
					const fetchGitInfo = async () => {
						try {
							// Use sessionId to let server resolve cwd, same as GitCard
							const res = await fetch("/__codex/git?session=" + encodeURIComponent(sessionId || ""));
							if (!res.ok) {
								setBranch("");
								setDirName("");
								return;
							}
							const data = await res.json();
							if (alive) {
								if (data.isRepo && data.branch) {
									setBranch(data.branch);
								} else {
									setBranch("");
								}
								// Extract dir name from cwd if available
								if (cwd) {
									setDirName(cwd.split("/").filter(Boolean).pop() || "");
								} else {
									setDirName("");
								}
							}
						} catch {
							if (alive) {
								setBranch("");
								setDirName("");
							}
						}
					};
					fetchGitInfo();
					// Also poll every 5 seconds in case branch changes
					const interval = setInterval(fetchGitInfo, 5000);
					return () => { alive = false; clearInterval(interval); };
				}, [sessionId, cwd]);
				if (blank !== true) return null;
				const now = new Date();
				const name = typeof cfg.username === "string" && cfg.username !== "" ? cfg.username : "";
				const cards = Array.isArray(cfg.quickPrompts) && cfg.quickPrompts.length > 0 ? cfg.quickPrompts : DEFAULT_PROMPTS;
				return h("div", { className: "ccx-homecards" },
					// Branch indicator - positioned to align with workspace/mode row above
					branch !== "" ? h("div", { className: "ccx-branch-indicator" },
						h("span", { className: "ccx-branch-icon" }, "⎇"),
						h("span", { className: "ccx-branch-name" }, branch),
					) : null,
					h("div", { className: "ccx-greet" },
						h("div", { className: "ccx-greet-title" }, greetingOfHour(now.getHours()) + (name !== "" ? "，" + name : "") + " 👋"),
					),
					h("div", { className: "ccx-tiles" }, cards.map((card, index) =>
						h("button", {
							key: index,
							type: "button",
							className: "ccx-tile",
							title: card.prompt,
							onClick: () => insertIntoComposer(card.prompt),
						},
							h("span", { className: "ccx-tile-head" },
								h("span", { className: "ccx-tile-icon" }, card.icon || "✨"),
								h("span", null, card.title)),
							h("span", { className: "ccx-tile-prompt" }, card.prompt)),
					)),
				);
			};
		}
		//#endregion

		//#region SkillDollarMenu
		function makeSkillDollarMenu(ctx) {
			const catalogCache = new Map(); // sessionId -> { promise, items }
			const skillsApi = ctx.get("connection")?.api?.skills;
			function fetchCatalog(sessionId) {
				const existing = catalogCache.get(sessionId);
				if (existing !== undefined) return existing.promise;
				if (skillsApi === undefined) {
					const empty = Promise.resolve([]);
					catalogCache.set(sessionId, { promise: empty, items: [] });
					return empty;
				}
				const promise = (async () => {
					try {
						const { result } = await skillsApi.list({ sessionId });
						if (!result.ok) return [];
						return result.value.skills ?? [];
					} catch {
						return [];
					}
				})();
				const entry = { promise, items: [] };
				catalogCache.set(sessionId, entry);
				promise.then((items) => { entry.items = items; });
				return promise;
			}
			return function SkillDollarMenu(props) {
				const sessionId = props.sessionId;
				const [menu, setMenu] = useState(null); // { query, start, items, active }
				const menuRef = useRef(null);
				const stateRef = useRef(null);
				stateRef.current = menu;
				// warm the catalog once per session
				useEffect(() => { fetchCatalog(sessionId); }, [sessionId]);
				useEffect(() => {
					const tokenAt = (ta) => {
						const caret = ta.selectionEnd ?? ta.value.length;
						const before = ta.value.slice(0, caret);
						const match = /(?:^|[\s\n])\$([A-Za-z0-9_-]*)$/.exec(before);
						if (match === null) return null;
						return { query: match[1], start: caret - match[1].length - 1, caret };
					};
					const refresh = (ta) => {
						const token = tokenAt(ta);
						if (token === null) {
							if (stateRef.current !== null) setMenu(null);
							return;
						}
						fetchCatalog(sessionId).then((items) => {
							const lower = token.query.toLowerCase();
							const filtered = items
								.filter((item) => item.name.toLowerCase().includes(lower))
								.slice(0, 40);
							setMenu({ query: token.query, start: token.start, caret: token.caret, items: filtered, active: 0 });
						});
					};
					const onInput = (event) => {
						const ta = findComposerTextarea();
						if (ta === null || event.target !== ta) return;
						refresh(ta);
					};
					const onKeydown = (event) => {
						const current = stateRef.current;
						if (current === null) return;
						const ta = findComposerTextarea();
						if (ta === null || event.target !== ta) return;
						if (event.key === "ArrowDown") {
							event.preventDefault(); event.stopPropagation();
							setMenu({ ...current, active: Math.min(current.active + 1, current.items.length - 1) });
						} else if (event.key === "ArrowUp") {
							event.preventDefault(); event.stopPropagation();
							setMenu({ ...current, active: Math.max(current.active - 1, 0) });
						} else if (event.key === "Enter") {
							event.preventDefault(); event.stopPropagation();
							const item = current.items[current.active];
							if (item !== undefined) pick(item);
							else setMenu(null);
						} else if (event.key === "Escape") {
							event.preventDefault(); event.stopPropagation();
							setMenu(null);
						}
					};
					const pick = (item) => {
						const current = stateRef.current;
						const ta = findComposerTextarea();
						if (current === null || ta === null) { setMenu(null); return; }
						const caret = ta.selectionEnd ?? current.caret;
						const value = ta.value;
						const replacement = "/" + item.name + " ";
						const next = value.slice(0, current.start) + replacement + value.slice(caret);
						setTextareaValue(ta, next, current.start + replacement.length);
						setMenu(null);
					};
					const onMousedown = (event) => {
						if (stateRef.current === null) return;
						if (menuRef.current !== null && menuRef.current.contains(event.target)) return;
						const ta = findComposerTextarea();
						if (ta !== null && event.target === ta) { return; }
						setMenu(null);
					};
					document.addEventListener("input", onInput, true);
					document.addEventListener("keydown", onKeydown, true);
					document.addEventListener("mousedown", onMousedown, true);
					return () => {
						document.removeEventListener("input", onInput, true);
						document.removeEventListener("keydown", onKeydown, true);
						document.removeEventListener("mousedown", onMousedown, true);
					};
				}, [sessionId]);
				const pickItem = (item) => {
					const current = stateRef.current;
					const ta = findComposerTextarea();
					if (current === null || ta === null) { setMenu(null); return; }
					const caret = ta.selectionEnd ?? current.caret;
					const value = ta.value;
					const replacement = "/" + item.name + " ";
					const next = value.slice(0, current.start) + replacement + value.slice(caret);
					setTextareaValue(ta, next, current.start + replacement.length);
					setMenu(null);
				};
				if (menu === null) return null;
				const ta = findComposerTextarea();
				const rect = ta !== null ? ta.getBoundingClientRect() : null;
				const style = rect === null
					? { display: "none" }
					: { left: Math.max(16, rect.left), bottom: window.innerHeight - rect.top + 10 };
				return h("div", { className: "ccx-skillmenu", ref: menuRef, style, role: "listbox" },
					h("div", { className: "ccx-skillmenu-head" },
						h("span", null, "技能 · " + menu.items.length + " 项"),
						h("span", null,
							h("span", { className: "ccx-skillmenu-kbd" }, "↑↓"), " 选择 ",
							h("span", { className: "ccx-skillmenu-kbd" }, "Enter"), " 插入 ",
							h("span", { className: "ccx-skillmenu-kbd" }, "Esc"), " 关闭")),
					menu.items.length === 0
						? h("div", { className: "ccx-git-empty" }, "没有匹配的技能。")
						: menu.items.map((item, index) =>
							h("button", {
								key: item.name,
								type: "button",
								role: "option",
								className: "ccx-skill-item" + (index === menu.active ? " active" : ""),
								onMouseDown: (event) => { event.preventDefault(); pickItem(item); },
								onMouseEnter: () => setMenu((m) => (m === null ? m : { ...m, active: index })),
							},
								h("span", { className: "ccx-skill-item-name" }, "$" + item.name),
								h("span", { className: "ccx-skill-item-desc" }, item.description ?? "")),
						),
				);
			};
		}
		//#endregion

		//#region FileMention (@ 文件快捷引用)
		const CCX_MENTION_LS_KEY = "dsh-code:mentions:v1";
		/** Pre-rename storage key; migrated once on first load, kept for upgrades. */
		const LEGACY_MENTION_LS_KEY = "dsh-codex-clone:mentions:v1";

		/** Registry of inserted file/dir references (rel path -> "file"|"dir").
		 *  Used to (a) locate chip ranges inside the composer text and
		 *  (b) survive page reloads via localStorage. */
		const mentionRegistry = {
			map: new Map(),
			loaded: false,
			load() {
				if (this.loaded) return;
				this.loaded = true;
				try {
					// one-time upgrade from the pre-rename storage key
					if (localStorage.getItem(CCX_MENTION_LS_KEY) === null) {
						const legacy = localStorage.getItem(LEGACY_MENTION_LS_KEY);
						if (legacy !== null) {
							localStorage.setItem(CCX_MENTION_LS_KEY, legacy);
							localStorage.removeItem(LEGACY_MENTION_LS_KEY);
						}
					}
				} catch { /* storage unavailable */ }
				try {
					const raw = localStorage.getItem(CCX_MENTION_LS_KEY);
					if (raw) {
						const obj = JSON.parse(raw);
						if (obj && typeof obj === "object") {
							for (const key of Object.keys(obj)) {
								if (typeof key === "string" && key.length > 1) this.map.set(key, obj[key] === "dir" ? "dir" : "file");
							}
						}
					}
				} catch { /* noop */ }
			},
			save() {
				try {
					const obj = {};
					const keys = [...this.map.keys()].slice(-200);
					for (const key of keys) obj[key] = this.map.get(key);
					localStorage.setItem(CCX_MENTION_LS_KEY, JSON.stringify(obj));
				} catch { /* noop */ }
			},
			add(rel, type) {
				this.load();
				this.map.set(rel, type === "dir" ? "dir" : "file");
				this.save();
			},
			/** Sorted, non-overlapping mention ranges present in `value`. */
			ranges(value) {
				this.load();
				const wordChar = /[\p{L}\p{N}_]/u;
				const edgeOk = (ch) => ch === "" || !wordChar.test(ch);
				const out = [];
				for (const [rel, type] of this.map) {
					if (rel.length < 2) continue;
					let idx = 0;
					while ((idx = value.indexOf(rel, idx)) !== -1) {
						const start = idx;
						const end = idx + rel.length;
						const before = start === 0 ? "" : value[start - 1];
						const after = end >= value.length ? "" : value[end];
						if (edgeOk(before) && edgeOk(after)) out.push({ start, end, rel, type });
						idx = end;
					}
				}
				out.sort((a, b) => a.start - b.start || b.end - a.end);
				const res = [];
				let lastEnd = -1;
				for (const r of out) if (r.start >= lastEnd) { res.push(r); lastEnd = r.end; }
				return res;
			},
			rangeEndingAt(value, caret) {
				for (const r of this.ranges(value)) if (r.end === caret) return r;
				return null;
			},
		};

		const chipsBus = {
			listeners: new Set(),
			on(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
			emit() { for (const fn of this.listeners) try { fn(); } catch { /* noop */ } },
		};
		function scheduleChipsRefresh() { chipsBus.emit(); }

		const CCX_ICON_FOLDER_PATH = "M1.5 3h4.1l1.5 1.7h7.4a.5.5 0 0 1 .5.5v7.3a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5z";
		const CCX_ICON_FILE_PATH = "M4 1.5h5.2L13 5.3v9.2a.5.5 0 0 1-.5.5h-8.5a.5.5 0 0 1-.5-.5v-12.5a.5.5 0 0 1 .5-.5z";
		const CCX_ICON_WARN_PATH = "M8 1.5l7 12.5H1z M7.3 6h1.4v4H7.3z M7.3 11h1.4v1.5H7.3z";
		function mentionIconReact(kind) {
			const d = kind === "dir" ? CCX_ICON_FOLDER_PATH : kind === "warn" ? CCX_ICON_WARN_PATH : CCX_ICON_FILE_PATH;
			return h("svg", { width: 14, height: 14, viewBox: "0 0 16 16", fill: "currentColor", "aria-hidden": true }, h("path", { d }));
		}
		function mentionIconDom(kind, color) {
			const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			svg.setAttribute("width", "12");
			svg.setAttribute("height", "12");
			svg.setAttribute("viewBox", "0 0 16 16");
			svg.setAttribute("fill", "currentColor");
			svg.setAttribute("aria-hidden", "true");
			if (color) svg.style.color = color;
			const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
			p.setAttribute("d", kind === "dir" ? CCX_ICON_FOLDER_PATH : CCX_ICON_FILE_PATH);
			svg.appendChild(p);
			return svg;
		}
		function baseName(rel) {
			const at = rel.lastIndexOf("/");
			return at === -1 ? rel : rel.slice(at + 1);
		}

		/** '@' trigger source registered into the host input-trigger pipeline:
		 *  typing @ opens the native candidate menu with workspace files/dirs. */
		function makeFileMentionSource(ctx) {
			return function startFileMentionSource() {
				let dispose = null;
				let timer = null;
				const source = {
					name: "文件",
					trigger: "@",
					order: -10,
					candidates: async (projection, opts) => {
						const query = (opts && opts.query) || "";
						const params = new URLSearchParams();
						if (projection && projection.sessionId !== undefined) params.set("session", String(projection.sessionId));
						params.set("q", query);
						let res;
						try {
							res = await fetch("/__codex/files?" + params.toString(), { signal: opts && opts.signal });
						} catch (error) {
							if (error && error.name === "AbortError") return [];
							return [];
						}
						if (!res.ok) {
							if (res.status === 404) {
								return [{
									name: "文件搜索待启用",
									description: "host 路由未加载：请重启一次 dsh web 服务",
									icon: mentionIconReact("warn"),
									rel: null,
								}];
							}
							return [];
						}
						let data;
						try { data = await res.json(); } catch { return []; }
						return (data.items ?? []).map((item) => ({
							name: item.name,
							description: item.type === "dir" ? item.rel + "/" : item.rel,
							icon: mentionIconReact(item.type === "dir" ? "dir" : "file"),
							rel: item.rel,
							type: item.type,
						}));
					},
					onPick: ({ candidate }) => {
						if (candidate == null || candidate.rel == null) return "handled";
						mentionRegistry.add(candidate.rel, candidate.type === "dir" ? "dir" : "file");
						scheduleChipsRefresh();
						return { text: candidate.rel + " " };
					},
				};
				const tryRegister = () => {
					if (dispose !== null) return;
					const svc = ctx.get("inputTriggers");
					if (svc === undefined || svc === null || typeof svc.registerSource !== "function") return;
					try {
						dispose = svc.registerSource(source);
					} catch (error) {
						console.warn("dsh-code: @ file source registration failed:", error);
						if (timer !== null) { clearInterval(timer); timer = null; }
						return;
					}
					if (timer !== null) { clearInterval(timer); timer = null; }
				};
				tryRegister();
				if (dispose === null) timer = setInterval(tryRegister, 500);
				return () => {
					if (timer !== null) clearInterval(timer);
					if (dispose !== null) { try { dispose(); } catch { /* noop */ } dispose = null; }
				};
			};
		}

		/** Chip overlay: covers inserted rel-path tokens in the composer textarea
		 *  with Codex-style opaque chips showing only the basename. */
		function makeMentionChips(ctx) {
			return function MentionChips() {
				useEffect(() => {
					let overlay = null;
					let mirror = null;
					let mirrorInner = null;
					let raf = 0;
					let ro = null;
					let taBound = null;
					let taScrollOff = null;

					function parseRgba(str) {
						const m = /rgba?\(\s*([^)]+)\)/.exec(str || "");
						if (m === null) return null;
						const parts = m[1].split(",").map((s) => parseFloat(s));
						if (parts.length < 3 || parts.some((n) => !Number.isFinite(n))) return null;
						return [parts[0], parts[1], parts[2], parts.length > 3 ? parts[3] : 1];
					}
					function over(fg, bg) {
						const a = fg[3] + bg[3] * (1 - fg[3]);
						if (a <= 0) return [0, 0, 0, 0];
						const ch = (i) => (fg[i] * fg[3] + bg[i] * bg[3] * (1 - fg[3])) / a;
						return [ch(0), ch(1), ch(2), a];
					}
					function mix(a, b, t) {
						return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
					}
					function rgb(c) {
						return "rgb(" + Math.round(c[0]) + "," + Math.round(c[1]) + "," + Math.round(c[2]) + ")";
					}
					function parseHex(str) {
						const m = /^#?([0-9a-f]{6})$/i.exec((str || "").trim());
						if (m === null) return null;
						const n = parseInt(m[1], 16);
						return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1];
					}
					function cssVarColor(name) {
						try {
							const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
							if (v === "") return null;
							return parseRgba(v) || parseHex(v);
						} catch { return null; }
					}
					function chipColors(ta, cs) {
						let acc = null;
						let node = ta;
						while (node !== null && node instanceof Element) {
							const c = parseRgba(getComputedStyle(node).backgroundColor);
							if (c !== null && c[3] > 0) {
								acc = acc === null ? c : over(acc, c);
								if (acc[3] >= 1) break;
							}
							node = node.parentElement;
						}
						const text = parseRgba(cs.color) || [255, 255, 255, 1];
						const dark = (0.2126 * text[0] + 0.7152 * text[1] + 0.0722 * text[2]) > 140;
						const baseFlat = dark ? [24, 24, 37, 1] : [255, 255, 255, 1];
						const base = acc === null ? baseFlat : (acc[3] >= 1 ? acc : over(acc, baseFlat));
						// Calm, theme-adaptive blue accent (never red); label stays neutral.
						const accent = cssVarColor("--dsw-alias-state-business-primary")
							|| (dark ? [137, 180, 250] : [30, 102, 245]);
						return {
							bg: rgb(mix(base, accent, 0.10)),
							border: rgb(mix(base, accent, 0.30)),
							label: rgb(text),
							icon: rgb(mix(accent, [255, 255, 255], dark ? 0.10 : 0)),
						};
					}

					function disposeNodes() {
						if (ro !== null) { ro.disconnect(); ro = null; }
						if (taBound !== null && taScrollOff !== null) taScrollOff();
						taBound = null; taScrollOff = null;
						if (overlay !== null) overlay.remove();
						if (mirror !== null) mirror.remove();
						overlay = null; mirror = null; mirrorInner = null;
					}

					function render() {
						const ta = findComposerTextarea();
						if (ta === null) { disposeNodes(); return; }
						if (taBound !== ta) {
							if (ro !== null) ro.disconnect();
							if (taBound !== null && taScrollOff !== null) taScrollOff();
							taBound = ta;
							ro = new ResizeObserver(schedule);
							ro.observe(ta);
							const onTaScroll = () => schedule();
							ta.addEventListener("scroll", onTaScroll, { passive: true });
							taScrollOff = () => ta.removeEventListener("scroll", onTaScroll);
						}
						const ranges = mentionRegistry.ranges(ta.value);
						if (ranges.length === 0) {
							if (overlay !== null) { overlay.textContent = ""; overlay.style.display = "none"; }
							return;
						}
						if (overlay === null) {
							overlay = document.createElement("div");
							overlay.className = "ccx-mention-overlay";
							mirror = document.createElement("div");
							mirror.className = "ccx-mention-mirror";
							mirrorInner = document.createElement("div");
							mirror.appendChild(mirrorInner);
							document.body.appendChild(overlay);
							document.body.appendChild(mirror);
						}
						const cs = getComputedStyle(ta);
						const rect = ta.getBoundingClientRect();
						for (const el of [mirror, overlay]) {
							el.style.left = rect.left + "px";
							el.style.top = rect.top + "px";
							el.style.width = rect.width + "px";
							el.style.height = rect.height + "px";
						}
						mirror.style.boxSizing = "border-box";
						mirror.style.fontFamily = cs.fontFamily;
						mirror.style.fontSize = cs.fontSize;
						mirror.style.fontWeight = cs.fontWeight;
						mirror.style.fontStyle = cs.fontStyle;
						mirror.style.fontVariant = cs.fontVariant;
						mirror.style.lineHeight = cs.lineHeight;
						mirror.style.letterSpacing = cs.letterSpacing;
						mirror.style.padding = cs.padding;
						mirror.style.borderTopWidth = cs.borderTopWidth;
						mirror.style.borderRightWidth = cs.borderRightWidth;
						mirror.style.borderBottomWidth = cs.borderBottomWidth;
						mirror.style.borderLeftWidth = cs.borderLeftWidth;
						mirror.style.borderTopStyle = cs.borderTopStyle;
						mirror.style.borderRightStyle = cs.borderRightStyle;
						mirror.style.borderBottomStyle = cs.borderBottomStyle;
						mirror.style.borderLeftStyle = cs.borderLeftStyle;
						mirror.style.whiteSpace = cs.whiteSpace === "normal" ? "pre-wrap" : cs.whiteSpace;
						mirror.style.overflowWrap = cs.overflowWrap;
						mirror.style.wordBreak = cs.wordBreak;
						mirror.style.tabSize = cs.tabSize;
						mirror.style.textTransform = cs.textTransform;
						mirror.style.textIndent = cs.textIndent;
						mirror.style.display = "block";
						overlay.style.display = "block";
						mirrorInner.style.transform = "translateY(" + (-ta.scrollTop) + "px)";
						// rebuild mirror content with marker spans
						mirrorInner.textContent = "";
						const spans = [];
						let pos = 0;
						for (const r of ranges) {
							if (r.start > pos) mirrorInner.appendChild(document.createTextNode(ta.value.slice(pos, r.start)));
							const span = document.createElement("span");
							span.textContent = ta.value.slice(r.start, r.end);
							mirrorInner.appendChild(span);
							spans.push([span, r]);
							pos = r.end;
						}
						if (pos < ta.value.length) mirrorInner.appendChild(document.createTextNode(ta.value.slice(pos)));
						mirrorInner.appendChild(document.createTextNode("\u200b"));
						// place chips over the measured line rects
						const colors = chipColors(ta, cs);
						overlay.textContent = "";
						const mRect = mirror.getBoundingClientRect();
						const fontSize = parseFloat(cs.fontSize) || 14;
						for (const [span, r] of spans) {
							const rects = span.getClientRects();
							for (const cr of rects) {
								if (cr.width < 1 || cr.height < 1) continue;
								const chip = document.createElement("span");
								chip.className = "ccx-chip";
								chip.title = r.rel;
								chip.style.left = (cr.left - mRect.left - 2) + "px";
								chip.style.top = (cr.top - mRect.top - 1) + "px";
								chip.style.width = (cr.width + 4) + "px";
								chip.style.height = (cr.height + 2) + "px";
								chip.style.background = colors.bg;
								chip.style.borderColor = colors.border;
								chip.style.color = colors.label;
								chip.style.fontSize = Math.max(11, fontSize - 2) + "px";
								chip.appendChild(mentionIconDom(r.type, colors.icon));
								const label = document.createElement("span");
								label.className = "ccx-chip-label";
								label.textContent = baseName(r.rel);
								chip.appendChild(label);
								overlay.appendChild(chip);
							}
						}
					}

					const safeRender = () => { try { render(); } catch { /* never break the composer */ } };
					const schedule = () => {
						if (raf !== 0) return;
						raf = requestAnimationFrame(() => { raf = 0; safeRender(); });
					};
					const onInput = (ev) => {
						const ta = findComposerTextarea();
						if (ta !== null && ev.target === ta) schedule();
					};
					const onAnyScroll = () => schedule();
					const onResize = () => schedule();
					const onKeydown = (ev) => {
						if (ev.key !== "Backspace") return;
						const ta = findComposerTextarea();
						if (ta === null || ev.target !== ta) return;
						if (ta.selectionStart !== ta.selectionEnd) return;
						const range = mentionRegistry.rangeEndingAt(ta.value, ta.selectionStart);
						if (range === null) return;
						ev.preventDefault();
						ev.stopPropagation();
						const next = ta.value.slice(0, range.start) + ta.value.slice(range.end);
						setTextareaValue(ta, next, range.start);
						schedule();
					};
					document.addEventListener("input", onInput, true);
					document.addEventListener("keydown", onKeydown, true);
					window.addEventListener("resize", onResize);
					window.addEventListener("scroll", onAnyScroll, true);
					const offBus = chipsBus.on(schedule);
					let offTheme = null;
					if (typeof ctx.on === "function") offTheme = ctx.on("theme/change", schedule);
					safeRender();
					return () => {
						document.removeEventListener("input", onInput, true);
						document.removeEventListener("keydown", onKeydown, true);
						window.removeEventListener("resize", onResize);
						window.removeEventListener("scroll", onAnyScroll, true);
						offBus();
						if (offTheme) offTheme();
						if (raf !== 0) cancelAnimationFrame(raf);
						raf = 0;
						disposeNodes();
					};
				}, []);
				return null;
			};
		}
		//#endregion

		//#region AppearanceSection
		const FLAVOR_CHOICES = [
			{ id: "system", label: "跟随系统", colors: null },
			{ id: "light", label: "内置浅色", colors: null },
			{ id: "dark", label: "内置深色", colors: null },
			{ id: "latte", label: "Latte", colors: CATPPUCCIN.latte.colors },
			{ id: "frappe", label: "Frappé", colors: CATPPUCCIN.frappe.colors },
			{ id: "macchiato", label: "Macchiato", colors: CATPPUCCIN.macchiato.colors },
			{ id: "mocha", label: "Mocha", colors: CATPPUCCIN.mocha.colors },
		];
		function makeAppearanceSection(ctx, config, useConfig) {
			return function AppearanceSection() {
				const cfg = useConfig();
				const flavor = cfg.themeFlavor ?? "mocha";
				const bg = cfg.backgroundImage ?? "";
				const opacity = cfg.backgroundOpacity ?? 0.3;
				const [urlDraft, setUrlDraft] = useState("");
				const fileRef = useRef(null);
				// Initialize quickPrompts with defaults if empty (first-time setup)
				useEffect(() => {
					if (!Array.isArray(cfg.quickPrompts) || cfg.quickPrompts.length === 0) {
						config.set("quickPrompts", [...DEFAULT_PROMPTS]);
					}
				}, []); // Run only once on mount
				const uploadImage = async (file, field) => {
					try {
						const bytes = await file.arrayBuffer();
						const res = await fetch("/__codex/upload", { method: "POST", body: bytes });
						if (!res.ok) { alert("上传失败：" + res.status); return; }
						const data = await res.json();
						if (data.url) await config.set(field, data.url);
					} catch (error) {
						alert("上传失败：" + String(error));
					}
				};
				return h("div", { className: "ccx-section" },
					h("div", { className: "ccx-group" },
						h("div", { className: "ccx-group-title" }, "主题 · Catppuccin"),
						h("div", { className: "ccx-cubes" }, FLAVOR_CHOICES.map((choice) =>
							h("button", {
								key: choice.id,
								type: "button",
								className: "ccx-cube" + (flavor === choice.id ? " selected" : ""),
								onClick: () => config.set("themeFlavor", choice.id),
							},
								h("span", { className: "ccx-cube-dots" },
									choice.colors === null
										? [
											h("span", { key: "a", className: "ccx-cube-dot", style: { background: "linear-gradient(135deg,#eff1f5 50%,#1e1e2e 50%)" } }),
											h("span", { key: "b", className: "ccx-cube-dot", style: { background: "#4169e1" } }),
											h("span", { key: "c", className: "ccx-cube-dot", style: { background: "#888" } }),
										]
										: [
											h("span", { key: "a", className: "ccx-cube-dot", style: { background: choice.colors.base, border: "1px solid " + choice.colors.surface2 } }),
											h("span", { key: "b", className: "ccx-cube-dot", style: { background: choice.colors.blue } }),
											h("span", { key: "c", className: "ccx-cube-dot", style: { background: choice.colors.mauve } }),
										]),
								h("span", null, choice.label)),
						)),
					),
					h("div", { className: "ccx-group" },
						h("div", { className: "ccx-group-title" }, "背景图片"),
						h("div", { className: "ccx-group-hint" }, "设置后主界面将呈现半透明毛玻璃质感，图片透过表面显示。"),
						h("div", { className: "ccx-row" },
							bg !== "" ? h("div", { className: "ccx-bg-preview", style: { backgroundImage: "url(" + bg + ")" } }) : null,
							h("button", { type: "button", className: "ccx-btn", onClick: () => fileRef.current?.click() }, "上传图片"),
							bg !== "" ? h("button", { type: "button", className: "ccx-btn danger", onClick: () => config.set("backgroundImage", "") }, "移除") : null,
							h("input", {
								ref: fileRef, type: "file", accept: "image/png,image/jpeg,image/webp,image/gif", style: { display: "none" },
								onChange: (event) => {
									const file = event.target.files?.[0];
									if (file !== undefined) uploadImage(file, "backgroundImage");
									event.target.value = "";
								},
							}),
						),
						h("div", { className: "ccx-row" },
							h("input", {
								className: "ccx-input", style: { flex: 1, minWidth: "200px" }, placeholder: "或粘贴图片 URL / data: 链接",
								value: urlDraft, onChange: (event) => setUrlDraft(event.target.value),
							}),
							h("button", {
								type: "button", className: "ccx-btn",
								onClick: () => { if (urlDraft.trim() !== "") { config.set("backgroundImage", urlDraft.trim()); setUrlDraft(""); } },
							}, "应用"),
						),
						h("div", { className: "ccx-row" },
							h("span", { className: "ccx-note" }, "透明度"),
							h("input", {
								className: "ccx-range", type: "range", min: 5, max: 90, value: Math.round(opacity * 100),
								onChange: (event) => config.set("backgroundOpacity", Number(event.target.value) / 100),
							}),
							h("span", { className: "ccx-note" }, Math.round(opacity * 100) + "%"),
						),
					),
					h("div", { className: "ccx-group" },
						h("div", { className: "ccx-group-title" }, "首页快捷提示词"),
						h("div", { className: "ccx-group-hint" }, "新会话首页显示的豆腐块；留空时使用内置推荐。"),
						h("div", { className: "ccx-qlist" },
							(Array.isArray(cfg.quickPrompts) ? cfg.quickPrompts : []).map((item, index) =>
								h("div", { key: index, className: "ccx-qitem" },
									h("span", null, item.icon || "✨"),
									h("div", { className: "ccx-qitem-body" },
										h("div", { className: "ccx-qitem-title" }, item.title),
										h("div", { className: "ccx-qitem-prompt" }, item.prompt)),
									h("button", {
										type: "button", className: "ccx-iconbtn", title: "删除",
										onClick: () => {
											const next = [...cfg.quickPrompts];
											next.splice(index, 1);
											config.set("quickPrompts", next);
										},
									}, "✕"))),
						),
						h(QuickPromptAdder, { onAdd: (item) => config.set("quickPrompts", [...(Array.isArray(cfg.quickPrompts) ? cfg.quickPrompts : []), item]) }),
					),
					h("div", { className: "ccx-group" },
						h("div", { className: "ccx-group-title" }, "状态宠物"),
						h("div", { className: "ccx-group-hint" }, "Codex 风格右下角浮动伙伴：空闲呼吸眨眼、思考歪头、干活敲键盘冒火花、需要确认时跳跃提醒；可拖拽移动、点击固定气泡。"),
						h("div", { className: "ccx-row" },
							h("label", { style: { display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" } },
								h("input", {
									type: "checkbox",
									checked: cfg.petEnabled !== false,
									onChange: (e) => config.set("petEnabled", e.target.checked),
									style: { width: "16px", height: "16px", accentColor: "var(--dsw-alias-state-business-primary)" },
								}),
								h("span", null, "启用宠物"),
							),
						),
						cfg.petEnabled !== false ? h("div", { style: { marginTop: "8px" } },
							h("div", { style: { fontSize: "12px", color: "var(--dsw-alias-label-caption)", marginBottom: "8px" } }, "选择宠物外观："),
							h("div", { className: "ccx-cubes" }, PET_SKINS.map((skin) =>
								h("button", {
									key: skin.id,
									type: "button",
									className: "ccx-cube" + ((cfg.petSkin ?? "cat") === skin.id ? " selected" : ""),
									onClick: () => config.set("petSkin", skin.id),
									style: { minWidth: "80px" },
								},
									skin.id === "depresso"
									? h("img", { src: DEPRESSO_IMG, alt: skin.label, style: { width: "30px", height: "30px", objectFit: "contain" } })
									: h("span", { style: { fontSize: "24px" } }, skin.icon),
									h("span", null, skin.label)),
							)),
							h("div", { className: "ccx-row", style: { marginTop: "10px", alignItems: "center", gap: "10px" } },
								h("span", { style: { fontSize: "12px", color: "var(--dsw-alias-label-caption)", flex: "none" } }, "宠物大小"),
								h("input", {
									type: "range", min: "48", max: "128", step: "8",
									value: String(cfg.petSize ?? 76),
									onChange: (e) => config.set("petSize", Number(e.target.value)),
									style: { flex: "1", accentColor: "var(--dsw-alias-state-business-primary)" },
								}),
								h("span", { style: { fontSize: "12px", color: "var(--dsw-alias-label-secondary)", width: "46px", textAlign: "right" } }, (cfg.petSize ?? 76) + "px"),
							),
						) : null,
					),
					h("div", { className: "ccx-group" },
						h("div", { className: "ccx-group-title" }, "聊天区域宽度"),
						h("div", { className: "ccx-group-hint" }, "开启后聊天区域将占满整个可用宽度，而非居中窄栏。"),
						h("div", { className: "ccx-row" },
							h("label", { style: { display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" } },
								h("input", {
									type: "checkbox",
									checked: cfg.wideChat === true,
									onChange: (e) => config.set("wideChat", e.target.checked),
									style: { width: "16px", height: "16px", accentColor: "var(--dsw-alias-state-business-primary)" },
								}),
								h("span", null, "宽屏模式"),
							),
						),
					),
				);
			};
		}
		const PET_SKINS = [
			{ id: "cat", label: "猫咪", icon: "🐱" },
			{ id: "dog", label: "狗狗", icon: "🐶" },
			{ id: "robot", label: "机器人", icon: "🤖" },
			{ id: "ghost", label: "幽灵", icon: "👻" },
			{ id: "depresso", label: "瞅什魔", icon: "⛏️" },
		];
		function QuickPromptAdder({ onAdd }) {
			const [title, setTitle] = useState("");
			const [prompt, setPrompt] = useState("");
			return h("div", { className: "ccx-row", style: { marginTop: "4px" } },
				h("input", { className: "ccx-input", style: { width: "140px" }, placeholder: "标题", value: title, onChange: (e) => setTitle(e.target.value) }),
				h("input", { className: "ccx-input", style: { flex: 1, minWidth: "180px" }, placeholder: "提示词内容", value: prompt, onChange: (e) => setPrompt(e.target.value) }),
				h("button", {
					type: "button", className: "ccx-btn",
					onClick: () => {
						if (title.trim() === "" || prompt.trim() === "") return;
						onAdd({ icon: "✨", title: title.trim(), prompt: prompt.trim() });
						setTitle(""); setPrompt("");
					},
				}, "添加"),
			);
		}
		//#endregion

		//#region AgentCard
		function makeAgentCard(ctx) {
			return function AgentCard(props) {
				const sessionId = props.sessionId;
				const catalog = props.useSessions((s) => (sessionId === undefined ? undefined : s.subagentsByParent?.[sessionId]));
				const [open, setOpen] = useState(false);
				const [isTrajectoryView, setIsTrajectoryView] = useState(false);
				const rootRef = useRef(null);

				// Detect if we're in trajectory view by checking the active tab
				useEffect(() => {
					const checkView = () => {
						const allButtons = document.querySelectorAll('button, [role="tab"], [data-tab]');
						let trajectoryActive = false;
						for (const btn of allButtons) {
							const text = (btn.textContent || "").trim();
							if (text === "轨迹") {
								const isActive = btn.classList.contains("active") ||
									btn.classList.contains("on") ||
									btn.getAttribute("aria-selected") === "true" ||
									btn.getAttribute("data-active") === "true" ||
									(btn.parentElement && btn.parentElement.querySelector(".active, .on") === btn);
								if (isActive) {
									trajectoryActive = true;
									break;
								}
							}
						}
						if (!trajectoryActive) {
							for (const btn of allButtons) {
								const text = (btn.textContent || "").trim();
								if (text === "对话") {
									const isActive = btn.classList.contains("active") ||
										btn.classList.contains("on") ||
										btn.getAttribute("aria-selected") === "true" ||
										btn.getAttribute("data-active") === "true" ||
										(btn.parentElement && btn.parentElement.querySelector(".active, .on") === btn);
									if (!isActive) {
										const hasTrajectoryTab = Array.from(allButtons).some(b => (b.textContent || "").trim() === "轨迹");
										if (hasTrajectoryTab) {
											trajectoryActive = true;
										}
									}
									break;
								}
							}
						}
						setIsTrajectoryView(trajectoryActive);
					};
					checkView();
					const interval = setInterval(checkView, 300);
					return () => clearInterval(interval);
				}, []);

				useEffect(() => {
					if (!open) return;
					const onDown = (event) => {
						if (rootRef.current !== null && !rootRef.current.contains(event.target)) setOpen(false);
					};
					document.addEventListener("mousedown", onDown, true);
					return () => document.removeEventListener("mousedown", onDown, true);
				}, [open]);
				// Hide in trajectory view
				if (isTrajectoryView) return null;
				const entries = (catalog?.entries ?? []).filter((e) => e.kind === "child");
				if (entries.length === 0) return null;
				const runningCount = entries.filter((e) => e.activity === "running").length;
				const sessionsService = ctx.get("sessions");
				const openChild = (entry) => {
					if (sessionsService === undefined) return;
					try {
						sessionsService.openSubagent({ parentSessionId: sessionId, childSessionId: entry.id, mode: entry.mode });
					} catch { /* navigation is best-effort */ }
				};
				return h("div", { className: "ccx-agents", ref: rootRef },
					h("button", {
						type: "button",
						className: "ccx-agents-pill",
						title: "本会话使用的子智能体",
						onClick: () => setOpen((v) => !v),
					},
						h("span", null, "🤖"),
						h("span", { className: "ccx-agents-count" }, String(entries.length)),
						h("span", null, "智能体"),
						runningCount > 0 ? h("span", { className: "ccx-agents-run", title: runningCount + " 个运行中" }) : null,
					),
					open ? h("div", { className: "ccx-agents-pop" },
						h("div", { className: "ccx-git-pop-title" }, "子智能体 · " + entries.length + " 个" + (runningCount > 0 ? " · " + runningCount + " 运行中" : "")),
						entries.map((entry) => h("button", {
							key: entry.id,
							type: "button",
							className: "ccx-agent-row",
							onClick: () => openChild(entry),
						},
							h("span", { className: "ccx-agent-dot" + (entry.activity === "running" ? " running" : "") }),
							h("span", { className: "ccx-agent-label" }, entry.label ?? entry.id.slice(0, 8)),
							h("span", { className: "ccx-agent-mode" }, entry.mode === "continuable" ? "可续" : "单次"),
						)),
					) : null,
				);
			};
		}
		//#endregion

		//#region Pet
		/** Module-level pet state store: a session-scoped bridge writes, the root-scoped widget reads. */
		const petStore = {
			state: { kind: "idle", detail: "" },
			listeners: new Set(),
			set(kind, detail) {
				if (this.state.kind === kind && this.state.detail === detail) return;
				this.state = { kind, detail };
				for (const listener of [...this.listeners]) { try { listener(); } catch { /* listener error */ } }
			},
			get: function get() { return this.state; },
			subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
		};
		const PET_COPY = {
			idle: { text: "空闲中" },
			thinking: { text: "思考中" },
			working: { text: "干活中" },
			needs: { text: "需要你确认！" },
		};
		/** Session-scoped bridge: derives the pet state from the live session and publishes it. */
		function PetBridge(props) {
			const running = props.useSession((s) => s.running);
			const pending = props.useSession((s) => s.pendingInteraction);
			const callCount = props.useSession((s) => {
				const rc = s.runningCalls;
				if (rc === undefined || rc === null) return 0;
				if (Array.isArray(rc)) return rc.length;
				if (typeof rc.size === "number") return rc.size;
				return Object.keys(rc).length;
			});
			useEffect(() => {
				let kind = "idle";
				let detail = "";
				if (pending !== undefined && pending !== null) {
					kind = "needs";
					detail = pending === "approval" ? "有操作等待批准" : pending === "plan-review" ? "计划等待审阅" : "有问题等待回答";
				} else if (running === true) {
					if (callCount > 0) { kind = "working"; detail = "正在执行工具调用"; }
					else { kind = "thinking"; detail = "模型正在思考"; }
				}
				petStore.set(kind, detail);
			}, [running, pending, callCount]);
			return null;
		}
		/** Session-scoped component that moves the download button to bottom-right using MutationObserver. */
		function DownloadButtonMover() {
			useEffect(() => {
				if (typeof document === "undefined") return;
				const movedButtons = new WeakSet();
				const moveDownloadButton = () => {
					// Find all potential download buttons in session header utilities
					const utilities = document.querySelectorAll("[data-slot='conversation.session.header.utilities'], .conversation-session-header-utilities");
					utilities.forEach((container) => {
						const children = Array.from(container.children);
						children.forEach((child) => {
							// Skip already moved or our own components
							if (movedButtons.has(child)) return;
							if (child.classList.contains("ccx-git-block") || child.classList.contains("ccx-agents")) return;
							// Check if this looks like a download button
							const isButton = child.tagName === "BUTTON" || child.querySelector("button") !== null;
							const text = child.textContent || "";
							const hasDownloadHint = /download|下载|log|日志/i.test(text);
							const hasSvg = child.querySelector("svg") !== null;
							// Move the last non-our button or one with download hints
							if (isButton && (hasDownloadHint || (hasSvg && children.indexOf(child) === children.length - 1))) {
								child.style.position = "fixed";
								child.style.right = "20px";
								child.style.bottom = "20px";
								child.style.zIndex = "85";
								child.style.margin = "0";
								movedButtons.add(child);
							}
						});
					});
				};
				// Use MutationObserver to watch for DOM changes
				const observer = new MutationObserver(() => {
					moveDownloadButton();
				});
				observer.observe(document.body, { childList: true, subtree: true });
				// Also run immediately and after delays
				moveDownloadButton();
				const timers = [
					setTimeout(moveDownloadButton, 100),
					setTimeout(moveDownloadButton, 500),
					setTimeout(moveDownloadButton, 1000),
				];
				return () => {
					observer.disconnect();
					timers.forEach(clearTimeout);
				};
			}, []);
			return null;
		}
		/** Root-scoped floating pet widget with drag support, multiple skins, and config. */
		const PET_POS_KEY = "dsh-code:pet-position:v1";
		/** Pre-rename storage key; migrated once on first load, kept for upgrades. */
		const LEGACY_PET_POS_KEY = "dsh-codex-clone:pet-position:v1";
		function makePetWidget(ctx, useConfig) {
			return function PetWidget() {
				const cfg = useConfig();
				const petSize = Math.max(48, Math.min(160, Number(cfg.petSize) || 76));
				const state = useSyncExternalStore(
					(fn) => petStore.subscribe(fn),
					() => petStore.get(),
					() => petStore.get(),
				);
				const [pinned, setPinned] = useState(false);
				const [hover, setHover] = useState(false);
				const [pos, setPos] = useState(() => {
					try {
						// one-time upgrade from the pre-rename storage key
						if (localStorage.getItem(PET_POS_KEY) === null) {
							const legacy = localStorage.getItem(LEGACY_PET_POS_KEY);
							if (legacy !== null) {
								localStorage.setItem(PET_POS_KEY, legacy);
								localStorage.removeItem(LEGACY_PET_POS_KEY);
							}
						}
						const saved = localStorage.getItem(PET_POS_KEY);
						if (saved) return JSON.parse(saved);
					} catch { /* ignore */ }
					return { x: window.innerWidth - petSize - 20, y: window.innerHeight - petSize - 20 };
				});
				const [dragging, setDragging] = useState(false);
				const dragRef = useRef({ startX: 0, startY: 0, startPosX: 0, startPosY: 0, moved: false });
				const petRef = useRef(null);

				const showBubble = pinned || hover || state.kind === "needs";
				const copy = PET_COPY[state.kind] ?? PET_COPY.idle;
				const skin = cfg.petSkin ?? "cat";
				const enabled = cfg.petEnabled !== false;

				// Save position to localStorage when it changes
				useEffect(() => {
					try {
						localStorage.setItem(PET_POS_KEY, JSON.stringify(pos));
					} catch { /* quota */ }
				}, [pos]);

				// Drag handlers - attached to pet body only
				const onBodyMouseDown = (e) => {
					e.preventDefault();
					e.stopPropagation();
					setDragging(true);
					dragRef.current = {
						startX: e.clientX,
						startY: e.clientY,
						startPosX: pos.x,
						startPosY: pos.y,
						moved: false,
					};
				};

				useEffect(() => {
					if (!dragging) return;
					const onMouseMove = (e) => {
						const dx = e.clientX - dragRef.current.startX;
						const dy = e.clientY - dragRef.current.startY;
						if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
							dragRef.current.moved = true;
						}
						const newX = Math.max(0, Math.min(window.innerWidth - petSize, dragRef.current.startPosX + dx));
						const newY = Math.max(0, Math.min(window.innerHeight - petSize, dragRef.current.startPosY + dy));
						setPos({ x: newX, y: newY });
					};
					const onMouseUp = () => {
						setDragging(false);
					};
					document.addEventListener("mousemove", onMouseMove);
					document.addEventListener("mouseup", onMouseUp);
					return () => {
						document.removeEventListener("mousemove", onMouseMove);
						document.removeEventListener("mouseup", onMouseUp);
					};
				}, [dragging]);

				// Don't render if disabled
				if (!enabled) return null;

				return h("div", {
					ref: petRef,
					className: "ccx-pet" + (dragging ? " dragging" : ""),
					"data-state": state.kind,
					"data-skin": skin,
					style: {
						left: pos.x + "px",
						top: pos.y + "px",
						right: "auto",
						bottom: "auto",
					},
					onMouseEnter: () => setHover(true),
					onMouseLeave: () => setHover(false),
				},
					showBubble ? h("div", { className: "ccx-pet-bubble" + (state.kind === "needs" ? " needs" : "") },
						state.kind === "needs" ? "🔔 " + (state.detail || copy.text)
							: state.kind === "thinking" ? h("span", { className: "ccx-pet-dots" }, copy.text, h("span", null, "·"), h("span", null, "·"), h("span", null, "·"))
								: copy.text + (state.detail !== "" ? " · " + state.detail : ""),
					) : null,
					h("div", {
						className: "ccx-pet-body",
						style: { width: petSize + "px", height: petSize + "px" },
						title: "Codex 宠物 · 随状态动画 · 拖拽移动 · 点击固定/收起状态气泡",
						onMouseDown: onBodyMouseDown,
						onClick: (e) => {
							if (!dragRef.current.moved) setPinned((v) => !v);
						},
					},
						h("div", { className: "ccx-pet-anim" },
							renderPetSvg(skin, state.kind),
						),
					),
				);
			};
		}

		const DEPRESSO_IMG = "data:image/webp;base64,UklGRkYtAABXRUJQVlA4WAoAAAAwAAAAnQAA9AAASUNDUKACAAAAAAKgbGNtcwRAAABtbnRyUkdCIFhZWiAH6AAGAB4ACQAyABhhY3NwTVNGVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA9tYAAQAAAADTLWxjbXMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1kZXNjAAABIAAAAEBjcHJ0AAABYAAAADZ3dHB0AAABmAAAABRjaGFkAAABrAAAACxyWFlaAAAB2AAAABRiWFlaAAAB7AAAABRnWFlaAAACAAAAABRyVFJDAAACFAAAACBnVFJDAAACFAAAACBiVFJDAAACFAAAACBjaHJtAAACNAAAACRkbW5kAAACWAAAACRkbWRkAAACfAAAACRtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACQAAAAcAEcASQBNAFAAIABiAHUAaQBsAHQALQBpAG4AIABzAFIARwBCbWx1YwAAAAAAAAABAAAADGVuVVMAAAAaAAAAHABQAHUAYgBsAGkAYwAgAEQAbwBtAGEAaQBuAABYWVogAAAAAAAA9tYAAQAAAADTLXNmMzIAAAAAAAEMQgAABd7///MlAAAHkwAA/ZD///uh///9ogAAA9wAAMBuWFlaIAAAAAAAAG+gAAA49QAAA5BYWVogAAAAAAAAJJ8AAA+EAAC2xFhZWiAAAAAAAABilwAAt4cAABjZcGFyYQAAAAAAAwAAAAJmZgAA8qcAAA1ZAAAT0AAACltjaHJtAAAAAAADAAAAAKPXAABUfAAATM0AAJmaAAAmZwAAD1xtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAEcASQBNAFBtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJBTFBIQwwAAAHHp7htE6gn7D84vCMisfxAvJhw2LaNJK2cQfbz9l9w5rurIKL/E3CM79nRp9mR9nwbJFbYEEC+gjYRpZsAKeme6WZrkrQAe9iU/o/wDjvvtUt37ACyLdDJ1Jzpxo6Yc+eeiwhAMWHbPUkDdVf8Gxh5h1f0vqBhkSS/WgDsBh4wGLRtJCnmD3u/0R2BiJiAjv7dV0qXS1AcbrXgaq8MZqbJmUzWQDP0jjwF5WE/okEzjVyfvsvEMDZe0yuFC8/atquNdNvW24TmgGT6O1OVDqAX+0H0Y+klplovcq8yMzP3ZAw7wnbYYQjbIktq2CEjrZRaUzkiJsC3tW1qY9u29QeHIqQQmxnSmU5szMzM3Nppa52Ze7/LfgnMzN2WD9KW5d7k/zgiJgAaJWwFiFW9jkAM6X76Ro4Y777nPprixerR9Qd3c7SMtR2+9KzGiniKqOzh5w1Wsp8AD68ft1jp3h1zSiVFilic+By4wEr2mFSEci2QcnbNGRBqNU7s/RknANRYnOQPWAIA3EPK5FwXAMCUoRjR1y252RIwjLirSAAAUJVzjHRnAdwmKsGIGrXMFhBOIiS+SeQui5DmnTFsl2GIDzHLzK4s5+iwdzq+QwQpPrKTEHbZjsAG7WZ2F0E+wIY+D9QuWGKEjWgZ0xKOPRHISAYOSnoil7jg3cQrY9uwuAhOIl4GlkpxMRw7KO26HYEJdu/C7kFONCZkv2nK4ezUYUKlPtkjGmYEEfHcwp680ZF4YNndZh8k5wYPPAntXu7ODkGDd4+Fvf3x0kNDvKhAZvc6LFDbNPuBW3QpEuTAqQJM50IjwX/AZwWI9J4ICdE8giL9yZCigMS5rcTrXBgU6GkgK+HRMkaBu0hYJRCcj/gxERQ8047UXqR16kO1pnNXeBSIF/f8NIyMNeyHX3n/iatexEkJ0WuZikj68IzpL0o6y1mcW09yIYnKsziYnA8EXxfFlmDhREUQx1/7gtAbzaZ3n80aofIYp7BVUZonyXyZwPq/awDVWvikKgT/+FSgtXT03N393CnYX0Uu7gxdQf8UnUxCqP7ku8dUX37v0atFM6BQKWHG+FHT/czcOTAHyJ4/jnXFG+dn0yyicECurf/7dd4gB8AmiKSevObVIvUpHJjK1b8NhYMK0mnYGrKjfuIk/B9yHw7tdG5eaumGzRuZr6Emnebttx+2SBWEkIp4hze7TQJtFgXAPwdhzollO1oqRiljlgVCIDjLkjjJZKlkb7/rQ6eUyuDoLCG+57R831AOhNiEWFCKs3A96z8/XdLySLRcG3olQqUZl8SxbcE4oYQAIQSAlILRNFi8eBAzJksSJMSGdgleq8jiZa/LMs5LwNOAKpiX+XuHe26csUOpxTKjMLHtee2ek56zAy2fLxkMbfmu64Q3wWEG4wAGdwm++nybHED2U2oywA6Hg0RUxthEwPDcxo1QViRpawXzS9VIRTUMB3kNAK6tpUUweeCjFlJuuFVAtO249QCAiYa9E0+bnlMXgFqU7hLFLRf1USYrtkPz/qZEBNhmzV5teh4BKvPVlr+KWTY1LiTbRPwV2ssEkJnHo80rdMceNpCNR8EO3W8ZdCC6+2RHtog5PtLxX+S27tICQtd/zLbQRq4wkt694Lf8PJQYweiecMvIJyiJHpoSAHB9D1AqBpcWALJc4gTRPV0AkJohxS7nAoBSihSdnwcA63WBFBKcNAHyjNcUMP2cQrBhdUXlDQHRNK0rLBgaCI5iWlNAtUNIjmZpXRGtAHj/b8uspsgsoDj94R8maT1h1jLkd7/yw/6av2y7SWsEEZIAcJrd/b1e2862mxybGgHb+T8IRe0bPYetmX89VPWBEAsv53Qtue22b71PyfqgpLgAYrpWHtDopqgRjKoLoKgEsKHCrg8ijuRFL89igvrIVqHYRdUKehapXSBUjciGEfYmgEcabRq7cYqH7dTB7lKigQcnV3cjimCBh8OttxuVAgt6/fwqCuAUCTy8b1sFEIsF0dg0UWChCQoI8f09FEk0wwCLB/0rKJRzigAZ9Y8PUawCgYB0/KKDgq1TCMhGUaOojtMIIFKiYDf+vUJA446aJsXk898CAls3bx+NCqEz/m8MYO/t9rNNAZu/qoKgwPHcMKtgRQMfcOg18wLWfwg0QYLtO9F+YIwGLDpeZPb57yrXBA22nSf7sJbzAI+EDVm5ImtoQKTrLP1yq8QTmCBqnpRaPw8Z6uWwQUoUbMpQL0m37e1abZoBaiaL+3oXazZY3QDTsjvWacdD7VSpv63wer6sHyLatlmFsYD6yV3Abv3r1xsCCGVBIG4Fb38y87lNAEglN5xjwTp+K3r6yZNEWkoJkaQp9QMhPe05xqMyYLd42hkkijDG4ijMwThrm/Ol57iGI8JuASCcEUApJQSAMMpUPLYO275lNKBqR6UyE1eueb7ZODkACKmaV3uuYzCAgwBCyN7lpjTXZrM5DJTk/FqQGKv4X3EggEs4VzqOaybBvNcGcJ57B+2GZSAlaKMEUCxLeld8nxwdwUQpAClUfm1fqqOTymY5AM4Eb4WaHReWKKcsABWk1dH6uIQEZS4Ia4dCHJE89EsF62ITZlaZYxv2ygXA8ps374tNIaO4XTYAO3r2LytDZGvhlA/Y4KP/SM2wXjZRRf2R34dmOF4cVCL44sPUCPSv20YV9Pm9JYy4/paHCrZPXk6ZGY4+f1iB6SePNW0Ycfvrz7nlE5d61y2YcTE6ROmtrePDkPEwbJSObzmBKc/6Byg7j1kOU66eU7dswRkVMGU6nO6j5P6Dqwym5JPHbZSc3vmdHMacPBR22cZfeEkaY/Z000TJZdiyMKW7v++i5EU4ttwYXsdDyQvVjTwwpBS2g5JvZCP14EgKmiqUfV00PXocRB6nHGX/r+iHCo4izYKYofyeM3AMVTKbhhSlp6tUkWOQTE+GK4ry53+Yw4D5oj+gPVSQz44i/WWbk8H5gY0q9p5bQPM8OR+PNi0fldTTB2OdCZon85Np3GuiovlLY+g5zymlWRKdLzeNQ4Kq0t5ZqCUVjI83LM8oGr0GKpze3/a1lA8enxLLbdioePO+FmiZnQ2b0CBPW66eyOav/6oDc3+b1hOLfKjD9kUE9azaC68GeNYJaoo2Fq4GgrsatKbAzvIaSM5iqGvVncrqpX1TWyIdeJVjLlG1BSr5/PnXura+3AavnHejCX07nqjeVV9jticr19hraMyyUXmnCY0rZVfP0RlnpHJK6IzmTuVoRDWWZn7l4nmmL7FOe5VLB4nUVjzjduXy4TzV1vJsD5UX40ehroJB7lUP0z/Mt3rik/FlaDC+98+N0tL8GWwdYPSDpxsdrYerLrQY//N7g1A/0eToKjRJxi++depYvYTTJy2iC6DtR968ioyskeXkUcuCRsP5U3eOM+NxPdCz4dEBgVZZ0ptfzDudVAfh2bPFZWiXmsD1Hj/eVk0m8+kx2tCzHH53LquVzY/6yVULuiZf/2tUqeTZ3cUVFxo//vl5lcIHP2JNaD26P86rE4/GzIHm58Pq8Mk4bkL3ySCrTDqd9qB9OkqrotKxhP55kFdFBOsDA8ikMvyc+wZQCVMVkYm0DCCZqAqoIgZgkaafk01RbI6AN/ChWsEVsSyLvAYgBRxBtwyqiWaz1Gm2u23fdZyCmBSk/khzaipJBz/+S2A1Dm6/6cblq5c7diEyj1j92fmgmvzxj17E3HL8du/OBz74noNCaNZX9Zffn0GlbHS6wMu9t3zow+/wioB44WqPjS+jatQ6xYV08NcBRaFm1Ki98KavqpFbdhHopJ8VNdF1ly1jqFb8j5VA1E+KwZW3NzXHu0NdUb6RZdJlJIvp3O5qzixbsqJ4JcqwiKlivCv7mkvPHVRLpxRKb4lVjNPr6I1mI1NR9CwsZcEixSgFvYtBxqth43/6pfz37qFYuoj0xlMFlfLl7/4KpZvvahcjTu9O9Vb867+rTQXJ5BffnOzRdgsRZ7/8+Upv9OYb90eeKCdpsLwbdlC+86Unwwqy1T8iH5qPHn55kTgtKbEIFCTP82DwouNiR/PwDXO8nMq20/vbJrTvtdr900lihGM7lqLryemk1cPuNvjTqVOMUSiIUlKwYDIctx0YUXhB4Fvb6rTsbDG+7KHQ9U+veqHvCbpWthRZePoIHRiVwLaI5ApF/9l4gnNGNorY4FkSo+IAVlA4IDQeAAAQdwCdASqeAPUAPhkKhEGhBGJnlwQAYSxhDgAzBkL2/4nfdPzI9jawP3j+6fo38nuMosLys+Zf9R/fPyN+Xf+n/63sl/Sf/g9wf9Tf9h/cfx97rv9w9Cn9W/5H7l+6p+R3vU/qvqF/z7/Netr6qvoSftp6s3/h/cH4TP3U/bj2pf//1gH/34lL+Ifh5+znyc8Sfxn42ecvmD+K+3f7vc7frLxW/lv9R+afKzvJP6N/qPzJ5Gvpf97/0f9e/d/xwPUrvP/1X/ceu3i3eqewJ/Qv7H/vvue+mP/G/7/3H+7b6j/7f+f/ID7Bf5N/R/9L/gf3p/x////+n3h+yT9lfZL/W020vDwCiHpu+xguwkBjwFz1hBUVn8acje+I6kiRxa7WZBFlPtMS6X2PQ3oAyxakhvkKWWcEDUP8nHQyH9RoJVxpPE406LpPrgS6w/gDtjZWekrVoKnqhkolUNzSZOkvJuSXY4sKz001XjYGY6KGTjhf1usMsxhLAwFJjerivybiuq1KUTWcxsnIH2OT5lqStLZXbtbW3chUrgPnTFW3p/AY/nncZhcolYuw5/Mk+rEmMIrN3fUjFAvrOePxNtLSIONdupXVTxYovuSq0ET2k5Ku+ROHhcCxv+SQZQ9erOqIqq7PMIJMcL0NL6NudiTw1o6ThriIVTN+ZM5MZucmRMXMUddwefakPXBPa883EvdqgU7v+rnyc4bgGWfG68++PAreRa5V8zEV5F0N6xD2sbxhEI+xOq1pWXU9u6BTSIVYQo1z1VP9RJPXwv3m2ZSWHtLHe8VuGwNiWPwR9jDnH2wfaSXbqwO9dGH5pwN17NAJu54f+m+9/x1ayR+6SjfDxbYIpYkqtnfw2/W56HxHEMWTFBYio4xukySyu8q3R9fpZXiYWfl6HzXvMM8npOb6TB7zje4rKxNDJ2KUvBEAGjDlUTxsIIDuUaQneWZYLL2a9GJ1KRaEKXY8m5lxVjfjuAAcjRSGmFFTDJPhourGEo5Dafm4TcN3ly5sRgc4qeSbeM/wj3PvXud02rCRWANkLsYKgEBtk9g0gBhVxvd6/pgjKdJbDLDnFF0yHibcjUXvLw/V6dNnc+8WpKRr9ae9hXzqY+bxKNQNhXX/XclOnN28U0M0vIMdBafLWF9oCCot7Z5+WrZo7MgQxa7rv5zWuJbgV+DhyRCZ9Sb+T+crTaUicKdtSklCOb6Zc8A2CPQDsNkmTusMxNHApkyMuPg/Xw3Y18Tp0kSX97njtuWGlfl5V7XZXVpg3cjuhYx9mvBgAP761iL6jEcQ0Wd+YfiPn27v8deVO/DLUdzoBlmpYDjQ/P7vo/OaT3fpZVmJfh5oOPxjobjmt/UzXJf+OZUBq94QGfzzj5EWXj5iHzMxlcABd4q8VqiMgJfQid1gcID102PxKynUvLqIY4kSGOzVovO4muRP93qW7WytJ6QPncTKUChzFb+2nFuzMwAAodw3hargsrROLkDbr/2HEyXoz4wH1gB5ZkHOsXOzzY4CzoT3pZOejsZL/4Msdj3P7ojHFQJBKNttLFemRA0mVNQwWcyNR+wXRkE3BgRtSTk0BljRejDedtA2EM2sg40bsAW8ajRj/Hq51q/b/2KPmbnCO8bVwFGq3KYC76Gy+Le8qxoAE9zAzSCAEXimf9e4UR2zGPgZzi4WpDxhLrdz/9CcYfFsz51pCqWI92MCopsKxfjptGv44spArTVD5B/A8OCF8UmzUK3GdChW368/qS6rgWGm08ftPg//26X+OAK90P3UkMIYc3XTXXXoUX5FS3sydCUK4swLS52a6sKD4OmvPjMw0uB6ZXsLn2mJtk6hhJj/KkjkRntfFQ5hZta2jN8eoMaTDsfh2V18hO4iglFfpmdjbxGRHsbPUtOKkw0/3h2JSKJmKr5w9jMWDNhhIYqzc4+TlKTRgIAgvIixcJmIPh3KmHp3pNQDQJkRrOaUvxDCg0bvULHElE9uXhRfmS/IiAqT9xjtSgZFuSk1E9HjWsUGP/ivTdG4/JAqxynQd7v5v0KbqTzc+NmCu1Aoa50/Yy4xQFdwI5Nn0CGrRL187QYUeMXkLOrnTr7DrCRzXPjxkN6X0+eebZ/HxVuOZH+rOT7JVMSrA8gIvST8fJChh7KH9vcc3G7IczUKRGeh5WZ9lzHNHcEdYpA5yEqJGghLT34aDufgnk3In7DuX/5R/vOb6i8Jk7XK9/Z9biTi9GxXzjd0/M5/jgeC18WMYXGQCXrpITotok671WNampFm5Nb2UuLOylHvCAfkgmXAtbv+1aDtk+IFyZh2zpuvNd5eU1mO728afJy1Dxd70ZrgovpBc+/dM9EhDB6obJgjbsH6boOlVmaKfoh+fLLD3UkZ+FSJfACG5IVERNph0coDi9WIi4hXAJywLAN5C8vvmX0WoK/C/aIHQ4a42w8YJBukfgLmgGai/Ilk0d1Wn/BByfgmhYFnNGmdCmOU/TJS1XUJ7OGZo1liBgfctzCgT5WhK+sK9zeM5fruusLiJSXJm/4RrxaXIYePqKnoHEa5fFoVQbNqz2WY/RAG46b5FqpQA9dBcDozNG8W4fiK4wj5HfhTNL18yJYMnHl3NiqSF14RUIqTeL4j8L1EmD3CJnX3fR6cCkzpy+fboLYDrVcqWrogBvfVkbqUDZy8TTGAz7Oxu1bkTYg8/UPuNjbVLj6kotw/L9F/w36Sy/k6ZlstmLR2Kq0QKu8y0Ff75TBP7zndb5GPfaBLdiuhSh8scPLbcZr923vFA/ZNxCrGa7d8/G1O4QgY9Pxb+NH8dtrvIAk/0wKmqTdTYQsjK3/zCPXEfTKbJDqCsKKcghYPqft/v9HeN1NCNJ877lE15WN/2pxQJeurpB936mpUiGkIZ9A3C4xQl2X/mOnN2ZdecLiSvBTMCRsjXEPQvQ9esx1oMXOagXoz6QF5HGKHtGOBnfIqct+uGW4aNtGDaE+AUSsPJ27nR5QALpgtwcR6Qm8P2RnJJWM5o/Zs14a96bwnwtEeARluFCVdPi5q7rIb3tsGBCLv9FgI7Rji/tZvRQdJtydP/h6OzKuwOw4xDKovBGrGpDx+7WeDC0agLcQyRPdHJR3lIzeCnu5HG9caQfAMB2ax314ZEZrDfdu+5BPvYGyn9e8Sc1HZ1C/TxG+oNNy9kYT43gOrynXHd1bl3whP29IQ0qI1Rl/Y/aPut4CtQigwo9NZcq+q5B1E3D3EX8L9LU7MTiv087G/ut6qFngrnTa2KPQNhPQKM5TRx5OSWF5h/FYlFhVqx5UJlySVfaB+30xRY5LmO/t1jKRMb8gLLkIlbZLVYD+VUCMllF+OUQ34hTB4l37hHmyn+0bo1ywfqLktQlQ3RN4iT26bp9AEAXUXtub+N9LIdb9c00DgGK1oNjEw7l8w/Zow6cRUhmmOuHX3tDnhkaky1aKgsUXgFt+LxSDz2sEi827LDXgfG5Ae/sZDD0QGc1ZGJloWF3lsiZXo2H8EG9jSbjcEreIE4oXnzNIB8+nl5+6ZTQvj+edwIvGUcZsGQ/aaKNr7bFPIfqWsx0TOE430VKbNCvuWiLJIen1n9rPv24GcPNkS2iZO/Gd4XJ7p0ljs+7sZYPZJR8JTLPOwx3VwLE1hvIPrWk8oQ5NlBvivTSbVLg84chv8tskhhQvGPzlQnqZUpp0gtmHJfYSK4pJ6p2/1N8Enb91MZfT0MTDxB8thkJLcJHoI5gnKf4yxiI7V/4Y5F4o+tRL3IKE8E7JasGBWZB+yzkgDchJ58trolAUtjAc+s2siifCfb/LlxNHOBxplO/azc3Y6fHjeuiVgGWnuAEtBFlKnt5pr5qdu9+IAmA6NzieFDqyvWHGO0+8TMqzMn9FmxzlHvHtB86zt5qqOpOJmamYPystifmum6a1uDM3qja10SBZRCCKzx667YH+E/AoG1LAtT282dBUTQBavEQhOhcx/PI7r+j/PU1pHbhBehk1Ho+UWAz8L7t8ilEnRv9GnTSjlASlwiucebqPmn/QozhFVQrlAwriNXNE8uH+yPQHSLPIxrxg24W/XxTZ9/+iEFFLGqfjcTC+frTrHfqCAW7Ih6ZSXjPAZCfojjL1VNAcjRPlvAyo5oDvu3tZephzRUU4rviJZAxExDa/UPX1fbTqFLYX+7HcrMaNmbJaDpikoAUs38mkTzBungdacchsm8Xxpk0bLlvS50Vf+KWqT8t4SN78pKvVG/bo8hRnEaXHpMiyCN7gkT6v9ai98XFWnCLWm5tfJiQ9RANKoMsjT9RV2eHT5ag4Ul+LmOGzobIzh8fwNAZYc+BfzQOehI0DYKypcyUCg1GuFKdlUb9MY8M4TQgaX4KkLebrBowHYoqytEr//OvpXtgqrPFJB5fEjjJ4WIitN4iPiHq3aAOTQI1aC7gZ1mw599ETw2caYaOwl202hqBidFsl3nYHrgjZbfh7EPm6+R/teM3fF+COgUBWqM8fDcgtnFoV1+dhDjiY7FbxD5PDcDae98E8d5mZdf8pVKY17ifWV3/9/8Nn+jFym7W+Kz8RTSfOY6sn7qwKBSj7DzwTnMwE0P/fa5Bsmr3aM2HsxuZfAi46Za6Cbv/Im9EYKn0hJ6tB5cz3riCF8U1VVxSeHgFXdTsF5wF/Rdy9l51ixdYSQoXb77eUkajKSoO1F4VTZbOg5xGin3Zy4r4cmbn8vT5xM+aVekD/hrA5HqUXlglmPYhYfp9CmJ9EBLBIOu8hqyu/Iab/XIM0vYkm/mEYgPkUwrypc9/8svCcg/Nr2Ak5MU5WasoPk2lKH92AMgmMWL35iT7B+gW31sRX4kjbo7+Nz7lpxLw6zoD0DCncQf9xxkdxwlBZDe6z6dfcnds9psb1ADh96c/6PlA3ty6pll7r/km/587S9I5HhSj1az9Xvncx0XgwagM7gDHh8ulHhoYX9C/FdNMAgwLB8y+EO0wm8BBwGJJTauLpc4ZEK4YiykRCSm3RCfsevXzoxaOxtj5I4JGB0AxMnuqUU8nnAdvOj355bYRZxcfqYJuAoB9+jWLJU1S0+H43jo5ZUuRcwmmIWr0jKzXF9nqWfbI1IsQYoqtejj9t0xf/Ortv04TwqNIuTtkzST8ejsJLeHLRvuPxVrEJ2EMZejN4x96ZPxziNTGVnAlgA0kWOh5xy370+HSiUD2nV/IJsRDwY68/wuMvrYOF3FTiNk8g2wi9+WSvakg4M7gzT9FZMGbvWaz817P5tqSE9tmwQAFtiPb4MX2dOSNJy6pr5E8hh5O1A9myNc1ApbE22tznYmA00BZKZBM2fmnZY+p3NbaMtUiN8Fpv3AjCwB00uJo1iGF/AvkOq4PyiHJMVpB8Trwd1N945ptuM0NFS/fsS3bMzsDsebE4NAkyougKH9gItcSHaBWz9/PklbX8YGJOX2xWcwkd34sl7OjjFh+VzA4UDVnRCI4vMamtl2arBkI5akZaITzOHy2yOiTEgIzLbkuNE5+h5m/KdkzD/k0FKQhZ+Bmnf70sKH/jrcsdTNcNZQWb9CTh5gRN3SfozDIV0vvdy8JAmQGCGW6vDDLx2zBAobe0WxO/mIOtPwx53veAZYJ6wn8/iuQLLybJnacDES17AXnTOq3IdKyY2VNVgFmsZH57Eg7Dyd62AIYvT1r7qjVpIt+NWkj45g5cSpE0HPSqmPqX3pCE0H4oYoRS9qpYVUJw/nkX+so0kIKloBukPKGH2c4DG9iK6HMWarbaWggY3iwLhWvsFQgiSAiL9GT72gCiWVwg3MtQVVjR3vUzeXrcTCkURyil5rS8A9TwNuMsjiPjEcH7cUNynzN641QNe0sU8zloxrFSvE1sAmsk2T+Ow386XJr2DuLXz71Ce5JZXfJOXhm9ZkNMgGNclVX0C9G+bLkIdqj1I5//57IbCdRPNr4AGFQkfN13uLe1n/ITON0xBeplPWVkQ9xtzRLeKOJUr1JkHDRx+oJmlxLyZaVlQnR7znh5oBYC8Tojx3X/4OiFBFBn+6hH5HfzutV2X4C6xPGoh2CF/aLY/k9oX8ZhhSoeUZ4O6rSRM5cGJeBr4lOOzyIsxPtiApWqYvPrGL2h4i0nUItgLAiNY84IQlIWOONN66JH/fm8R/hVAQwGeOYsrQ5ZlsQXpRuvgNYRIPqd1ILpBK4ebWb8QQQTT6QmmEyegUBlyLX1OOT43JKzx+Sjtwsf9igxR7PX3F1LrB+GVMomQEI6joHtWan/2lB7q80WYUjMOIxpfSpMhO1TuJ3UZ3He126N2Cw3FzpAjgtZpcVqDnt6/p0p7Ykl27yHKXUkZxvvNpqGgeUb/cqBXnPSbchlDFGGvnR7u+9nIBvaR52Q9f54OPizpEQXmt2yvuqEUiCtJAXfnJgOvmWZwkOCjPxvHdt8Iv/lBK+psxuv9U+3lFZpU1gOmubbxWw06gRSvzeGgGuuVzOutoAlWouRcEoTI7EFTQr4Mc6KrS5vB60Jl4Qa6B18/zlRO2uTonyFIJE+T0MWTkBapa08SI7tyMHNY7/uqbUtvKRrsjbaytvANjRZFxGCFOr6hQ0434oFSZhYMT1TeIm2lMP4hJGtNd6ccmUWxZkStcCrg82ajZFfhL/VTOXJKfHXXJ/zqIlhRPtHF+QjI+a92u2ea3AsKQU/iw4tz4xYi8sSUYibMLqgeOmHnsNIYeQa6uS/1G65Oh0rFo8380h2DbrsoBCVv67qieETAgofp2R5OLsgYHOsRFOV9TMBLnIw7bnRU51x0UNehLS0EkoWzUTiXksVPN4NDH9Zr0OTFvphCI3jtxEeAwXRx675jbA0kSHe+mNYw3o6WhOhRw6jJ40knG8cCWL6bDpafVH5xzNbmAkZmos6RSaHBhm0CSHoekBKvR74Xy70KkUjLGqwcJFi47Xx+mKzhv5tpuvIFvTY+jbpt45JCZaWrsSLWpBotfvhG5VwHVJDSMqCnB6YL2kke+WJDGDeV62zC5gL/P+ecErTw7shwJPZCfsXnKJq8T+oVOTh4FoD8cgUNgwZcMD5tICpW7E9UA4aUGW+yXfM18wdwLOwxtNSdSc/JdeJ5OkLKU5b7p0Zy6aysWibJ/BqFCwfN7sp4K65t+jw2SYHJ/lLP4+RVy2zT1NEoJ+/2lGZz0bxY/gvhBtAb1zKaug9N+Mm6CvTUhniR18DB+Y0uUI7h5ODdo+9f/1bI0LhOFLNvr8mu/HYEiFcRUsp9Ytcpsgb+e4MMvwpCoSF6MLUDmTS9dNKt2gOixZa6GIM3MpQgTVEb6jdn9mi75cZcHSai4c/m59HaOUFbC+CFmDRlUXiTjM3s+7OxL9PPX88Ekfv/6V0apYObXs819UvY2wcmzobwxHSiq7uKW1NccMCgUIhaINFFS9mCzxk2xA6InlA3dwKGSDkTV8BwQmfCCIC8oJ4crslHmW+ACKPe5GlzSi5BspD5vEMR4JnXQoTy6Sv42baCl4sZaKXaDgcCVlkW6WK4u7BoyfaC0QgTzXJ/dCeZVc6K+bmc7Arw53vLxTGZMWNkfsvz/RCRCStYE2PFpke5caAzIlaljI1aWlJJUUuWrvx6FIi10P+valwCAR0++GuQ6SImARw/po4yQhomfDrAvC+Ag4PQlCm/FGUr9IgBXKoSWas+A/8qBHyd4r+K2KtrlqzbkPChV+YuRj/B8k+DZ0B+FCY3Q4HBd9wGniww6v16ADeAFo3/h0CogAnavv7sJGWDBqMTUyqyCeT6p6sHrn0aQK1GoPGh2tv7CNsmQU/vEsGrZ4Sjn0yfm/9jkZjUUoTdPKcBaYlDLknIBk2txTbhNQ8sHIDqwQZ5R6FuvYqx5GP/AUdzcb4NRcTLbioU2rfQHtKkkfVZihJvDm2z2DkNn3o5Au83/4HaaKsAgz2pjrkRGRbLRGe9iuYFt+xBD6X0z/0OeqIW86qb0/IoE/KXwmOw2P5vuzYlLyo3JeAvFvv5ydzcvKB3vnkn7Xu5Kn+h97rvEvF1QydelBykIzri3A1eOLUHuB7aaDm/UXQuAtHSIITEcMoR3noALRclDQe6ovvlkQq8EUOW16swM+ZlyEh/VIG8Fh8GxiPCjnrdPDOw+6c37tfY1GFgvjlcv9qtpNmnQiKKW0ja0/WaJOkp9EUz9M8Wdm8LLvwwALYtZqOw+yKoRNGtsusZdv775TLqTrlV0NrL4r3HVn/BttcJDOsLQVH1Zp478a1HVqqMWIy0KhtI8yWzIkgNGjVBBrF7yZVqLfOTP0+Qgkh/7Rs/QZCOYtDhgeD8AY/U68wFNjgTd/RugH89j6MF1NcS+uzOYP997iUGP5RPYBq17/5mvp43usnOt+jSMsSaAyUgve9EDdxAGBR/YTGl4YsEgevabPneFoe7/qZ6Z2OVyVL5G9TpeTpc+jDdL+svy/zhbEA/E8//fPKUbMt/YgjbOOdaP2GK678P7fhce9KGlLnZt3vk4i2wcHJ8B9IADAOE+Kca2wvmNhW+fh9boo7EJ82PKIqftKAgO8Zoq56qgEoCi9GalNZj2AAXGkPQi5oCmf2rxgf3ctx6DSTh2sy3UGKYKqwPaoqZrtinVAuywdtgwtvV8hcTujPY+XJIEBUT6WcQ2NSePBigB0el0BWkmsYg0HI2O4TGvoskA6bxNkgeYwUDrV9wjhPtrydH1u7u8WFs5hoKbqPiipLLm55hTLyEAkm93YrEAteap7xdG2VMQ1Ut1Gwy7dUyQBMg8KqV7CKIqhBXkiWjKSNJJNNlA4AAXttwQX24NqHpH5O3cwADgBaj4TCGuUnB5aS0NRfoCY/G7xZZoCk2/OyA8WMLIrNhjWEtWA1UY/tUo5qi4pPKAI1qy5Fw2fRU3yW9Ye/x5vIcQpsd9eM5n/Z3tmXPhdHSjvp/iIQmZUKWd4kctL44Cx8My6n+LrBBPcr1HGhq6N76GP7G5/ejKb8kbz1zrpKNWR7PNp7W3eWdLjPmOuJ0pPwpGN11OyCdSaipHe0qT/KHYEmk622ie3dueMyZ4IVl1UC86pijqCUZ9tsNLe1ox4eQ1xYok+3JeOiWWMMZibBRNDACdXmjaraGTkLQFu5Oq9ZnC3QTF8I6S1F1a1LhKd6aKYCZMBYtTxTbo0/iAueEqtuKJ7QO29YFB16MOR2WMKcLfskVT3tcDyxsSjoGAsoNq2Zu1/NDnGvNM0yuPsxpxvg6MT7e7zlaudPbRYOMT1SUNx1Lq0cGrp8ceFL8qvVhWeK+UnO2q5YdyUX2lqVFWcR5kFeDL/4qfre5cRGPhCQElFmQ9ty95JUE9jZHbyQppG/Gmoq86c/mZW04a30wYcucn/7K+4WIjtQH8/HaxPYgIVOzKTbRQ9YqLDpaLIb12z1QiGp7QNhBHD68HKsKveXz89himgmBHuMkqGpOknnqFanYqEvfMYppiv66+LlHW2BUoHG6qZ7kBE0iDBlLy4x51BQgjVLH59/ItImIJVEH7yJQIStIFSKGgvdl9uB/W3T6OiA0DrWqgy775/xUlTF1Oio+NlIyi2tnIP2PvBw6YVPxOYQ/BDuWoruXMk/e+/sYAFsMKvRe62QXc3Nq3lXe0JIlh3cDo0+iOgDSE5w9RuPUCDV/JqOvlJkFjdkLEhZVSbsQJdiwZ9mVay3akaK94Sfw4ry2f8/aKe6DLdodchtdclBTxH9wum71eZ/Cb6x1b3ThH+5drlkMYoDrBNB8vNfl3nqAEaGawCyHFkEpDtFclVmOXOcHYshYH+Aq8kCzkOro9CwcThty3QUH3dKpxd0hm3tAZr/TReY4+OU3rvByhG6CelzwlAj6t/GB4PHSr/NLfbi1bCcO91mLJlItCvUMeFwUSghqsk0CN/4L0TMrkIXI1TrvuZUIMhEnk8MSidn1OOonNjToqLvEFx9s4M+T6Qm8UfF0nknJglPZlgLtefBBfvAosCuhVQg0uH1R7cJ9Pdyl+lrup7mW1OfF/Rl535RzYdIu1xCQG1JTjE0qZSKCIflYxfSQtZZw+LZo/bF1dxIZAEG37A+OSV+HXH/Z6lUtwXpV48AAAkrEK62oOTkDk5hP1D2bYI7xCGCIgP4BQDEPQtKJG40Mu/g/SSJRIdHKNL6y0zBcrJgQQ+oeJ/w50CZpsgfaZFFPDoxhV7wwezquHRkmAV5stkUpcpATsxOCQREcGF1uPxGgR/5xKFRwP1hB0A5kpVpvTKOmKromvfnSoIP2yte1waBx6nIn/Eg05x2+IXRt5PHkvxn8lozc8rxFurDpgkz77gn9zKst1VxJD0Pw4aT1TSgoHyeJrU6ryyNbwjPboqsALCSeh4GWwJtv8v9wEEpjLVMw3WE6sHLBuWjoEdqLRBvQAAAA";
		/** Render pet SVG based on skin and state (Codex-style puppet). */
		function renderPetSvg(skin, st) {
			const uid = "ccxpg-" + skin;
			const G = "currentColor";
			const LINE = "var(--pp-line)";
			const DARK = "#252a38";
			const PINK = "#ff8fb3";
			const WHITE = "#ffffff";

			/* Eyes for rounded-face skins (cat / dog / ghost). */
			const roundEyes = (r, y) => {
				if (st === "working") return h(React.Fragment, null,
					h("rect", { x: "26.6", y: "25.2", width: "5.6", height: "2.6", rx: "1.3", fill: DARK }),
					h("rect", { x: "39.8", y: "25.2", width: "5.6", height: "2.6", rx: "1.3", fill: DARK }),
				);
				if (st === "needs") return h(React.Fragment, null,
					h("circle", { cx: "29.5", cy: "26.5", r: String(r + 0.7), fill: DARK }),
					h("circle", { cx: "42.5", cy: "26.5", r: String(r + 0.7), fill: DARK }),
					h("circle", { cx: "30.6", cy: "25.2", r: "1.2", fill: WHITE }),
					h("circle", { cx: "43.6", cy: "25.2", r: "1.2", fill: WHITE }),
				);
				const up = st === "thinking" ? -1.6 : 0;
				return h("g", { className: "pp-eyes-open" },
					h("circle", { cx: "29.5", cy: String(26.5 + up), r: String(r), fill: DARK }),
					h("circle", { cx: "42.5", cy: String(26.5 + up), r: String(r), fill: DARK }),
					h("circle", { cx: "30.4", cy: String(25.6 + up), r: String(r * 0.35), fill: WHITE }),
					h("circle", { cx: "43.4", cy: String(25.6 + up), r: String(r * 0.35), fill: WHITE }),
				);
			};
			const roundMouth = (y) => {
				if (st === "needs") return h(React.Fragment, null,
					h("ellipse", { cx: "36", cy: String(y + 1), rx: "2.5", ry: "3.1", fill: DARK }),
					h("ellipse", { cx: "36", cy: String(y + 2.2), rx: "1.4", ry: "1.2", fill: PINK }),
				);
				if (st === "working") return h("path", { d: "M32.4 " + y + " q1.8 2.2 3.6 0 q1.8 2.2 3.6 0", stroke: LINE, strokeWidth: "1.6", strokeLinecap: "round", fill: "none" });
				if (st === "thinking") return h("path", { d: "M34 " + (y + 0.4) + " q2 1.6 4 0", stroke: LINE, strokeWidth: "1.6", strokeLinecap: "round", fill: "none" });
				return h("path", { d: "M32 " + y + " q4 3.2 8 0", stroke: LINE, strokeWidth: "1.6", strokeLinecap: "round", fill: "none" });
			};

			/* ── shared state props ── */
			const shadow = h("ellipse", { className: "pp-shadow", cx: "36", cy: "67.5", rx: "15", ry: "3.2", fill: "rgba(0,0,0,.24)" });
			const pawsUp = st === "needs" ? h(React.Fragment, null,
				h("circle", { className: "pp-pawup-l", cx: "19.5", cy: "26", r: "3.4", fill: "var(--pp-hi)", stroke: LINE, strokeWidth: "2" }),
				h("circle", { className: "pp-pawup-r", cx: "52.5", cy: "26", r: "3.4", fill: "var(--pp-hi)", stroke: LINE, strokeWidth: "2" }),
			) : null;
			const laptop = (st === "working" && skin !== "depresso") ? h("g", { className: "pp-laptop" },
				h("rect", { x: "20.5", y: "41.5", width: "31", height: "15", rx: "3.5", fill: "var(--pp-line)" }),
				h("rect", { x: "20.5", y: "41.5", width: "31", height: "15", rx: "3.5", fill: "none", stroke: "rgba(0,0,0,.35)", strokeWidth: "1.5" }),
				h("rect", { className: "pp-glow", x: "23.5", y: "40.2", width: "25", height: "1.8", rx: ".9", fill: "var(--pp-hi)" }),
				h("circle", { className: "pp-glow", cx: "36", cy: "49.5", r: "2.4", fill: "var(--pp-hi)" }),
				h("circle", { className: "pp-paw-l", cx: "24.5", cy: "41.8", r: "2.7", fill: "var(--pp-hi)", stroke: LINE, strokeWidth: "1.5" }),
				h("circle", { className: "pp-paw-r", cx: "47.5", cy: "41.8", r: "2.7", fill: "var(--pp-hi)", stroke: LINE, strokeWidth: "1.5" }),
			) : null;
			const sparks = (st === "working" && skin !== "depresso") ? h("g", null,
				h("path", { className: "pp-spark", d: "M16 34 v6 M13 37 h6", stroke: "var(--dsw-alias-state-success-primary)", strokeWidth: "1.6", strokeLinecap: "round", fill: "none" }),
				h("circle", { className: "pp-spark", cx: "56", cy: "34", r: "1.7", fill: "var(--dsw-alias-state-warn-primary)" }),
				h("path", { className: "pp-spark", d: "M36 16 v5 M33.5 18.5 h5", stroke: "var(--pp-hi)", strokeWidth: "1.5", strokeLinecap: "round", fill: "none" }),
			) : null;
			const thought = st === "thinking" ? h("g", { className: "pp-thought" },
				h("circle", { cx: "51", cy: "13", r: "1.7", fill: "var(--dsw-alias-label-secondary)" }),
				h("circle", { cx: "55.5", cy: "9", r: "2.3", fill: "var(--dsw-alias-label-secondary)" }),
				h("circle", { cx: "60", cy: "4.5", r: "2.9", fill: "var(--dsw-alias-label-secondary)" }),
			) : null;
			const alert = st === "needs" ? h("g", { className: "pp-alert" },
				h("circle", { cx: "55", cy: "9", r: "6.5", fill: "var(--dsw-alias-state-warn-primary)", stroke: "var(--dsw-alias-bg-base)", strokeWidth: "1.5" }),
				h("rect", { x: "54.1", y: "5.4", width: "1.8", height: "5", rx: ".9", fill: WHITE }),
				h("circle", { cx: "55", cy: "12.4", r: "1.1", fill: WHITE }),
			) : null;

			const parts = [shadow];

			if (skin === "dog") {
				parts.push(
					h("g", { className: "pp-tail" },
						h("path", { d: "M48 52 C 58 50, 62 44, 57 37", stroke: "currentColor", strokeWidth: "7", strokeLinecap: "round", fill: "none" }),
						h("circle", { cx: "57", cy: "37", r: "2.8", fill: "var(--pp-hi)" }),
					),
					pawsUp,
					h("ellipse", { cx: "36", cy: "51", rx: "14", ry: "11.5", fill: G, stroke: LINE, strokeWidth: "2" }),
					h("ellipse", { cx: "36", cy: "54.5", rx: "8", ry: "6.5", fill: WHITE, opacity: ".2" }),
					h("ellipse", { cx: "28.5", cy: "61.5", rx: "4.2", ry: "2.6", fill: "var(--pp-lo)", stroke: LINE, strokeWidth: "1.5" }),
					h("ellipse", { cx: "43.5", cy: "61.5", rx: "4.2", ry: "2.6", fill: "var(--pp-lo)", stroke: LINE, strokeWidth: "1.5" }),
					h("circle", { cx: "36", cy: "27.5", r: "15.5", fill: G, stroke: LINE, strokeWidth: "2" }),
					h("path", { d: "M33 13.5 q3 -4.5 6 0", stroke: "var(--pp-lo)", strokeWidth: "2.4", strokeLinecap: "round", fill: "none" }),
					h("ellipse", { className: "pp-ear-l", cx: "19.5", cy: "14", rx: "4", ry: "7.5", fill: "var(--pp-lo)", stroke: LINE, strokeWidth: "2", transform: "rotate(28 19.5 14)" }),
					h("ellipse", { className: "pp-ear-r", cx: "52.5", cy: "14", rx: "4", ry: "7.5", fill: "var(--pp-lo)", stroke: LINE, strokeWidth: "2", transform: "rotate(-28 52.5 14)" }),
					h("ellipse", { cx: "30", cy: "20.5", rx: "5", ry: "2.8", fill: WHITE, opacity: ".22" }),
					h("ellipse", { cx: "36", cy: "32.5", rx: "6.5", ry: "4.8", fill: WHITE, opacity: ".25" }),
					h("circle", { cx: "36", cy: "30.5", r: "2.2", fill: DARK }),
					h("circle", { cx: "25.5", cy: "32.5", r: "2.1", fill: PINK, opacity: ".4" }),
					h("circle", { cx: "46.5", cy: "32.5", r: "2.1", fill: PINK, opacity: ".4" }),
					roundEyes(2.7, 26.5),
					roundMouth(34.2),
					(st === "working" || st === "needs") ? h("path", { d: "M33.5 36.5 q2.5 5 5 0", fill: PINK, stroke: LINE, strokeWidth: "1" }) : null,
					laptop, sparks, thought, alert,
				);
			} else if (skin === "robot") {
				const led = "var(--pp-hi)";
				const eyes = st === "working" ? h(React.Fragment, null,
					h("rect", { x: "27.5", y: "22.6", width: "5.5", height: "2.4", rx: "1.2", fill: led }),
					h("rect", { x: "39", y: "22.6", width: "5.5", height: "2.4", rx: "1.2", fill: led }),
				) : st === "needs" ? h(React.Fragment, null,
					h("rect", { x: "27.5", y: "20.5", width: "5.5", height: "6", rx: "2", fill: led }),
					h("rect", { x: "39", y: "20.5", width: "5.5", height: "6", rx: "2", fill: led }),
				) : h("g", { className: "pp-eyes-open" },
					h("rect", { x: "28", y: String(st === "thinking" ? 20 : 21.5), width: "4.5", height: "4.5", rx: "1.5", fill: led }),
					h("rect", { x: "39.5", y: String(st === "thinking" ? 20 : 21.5), width: "4.5", height: "4.5", rx: "1.5", fill: led }),
				);
				const mouth = st === "working" ? h("g", null,
					h("rect", { className: "pp-codeline", x: "28", y: "28.2", width: "12", height: "1.6", rx: ".8", fill: led, opacity: ".8" }),
					h("rect", { className: "pp-codeline", x: "28", y: "30.6", width: "9", height: "1.6", rx: ".8", fill: led, opacity: ".6" }),
					h("rect", { className: "pp-codeline", x: "41.5", y: "28.2", width: "3.5", height: "1.6", rx: ".8", fill: "var(--dsw-alias-state-success-primary)", opacity: ".9" }),
				) : st === "needs" ? h("rect", { x: "33", y: "27.6", width: "6", height: "4.5", rx: "1.5", fill: led })
					: h("rect", { x: "32", y: "28.8", width: "8", height: "2", rx: "1", fill: led, opacity: ".75" });
				parts.push(
					h("line", { x1: "36", y1: "6", x2: "36", y2: "12", stroke: LINE, strokeWidth: "2" }),
					h("circle", { className: "pp-antenna", cx: "36", cy: "5", r: "2.6", fill: st === "working" ? "var(--dsw-alias-state-success-primary)" : led }),
					pawsUp,
					h("rect", { x: "15.5", y: "41", width: "5", height: "12", rx: "2.5", fill: "var(--pp-lo)", stroke: LINE, strokeWidth: "1.5" }),
					h("rect", { x: "51.5", y: "41", width: "5", height: "12", rx: "2.5", fill: "var(--pp-lo)", stroke: LINE, strokeWidth: "1.5" }),
					h("rect", { x: "23", y: "39", width: "26", height: "17", rx: "6", fill: G, stroke: LINE, strokeWidth: "2" }),
					h("rect", { x: "29", y: "43", width: "14", height: "9", rx: "3", fill: WHITE, opacity: ".15" }),
					h("circle", { cx: "33", cy: "47.5", r: "1.4", fill: PINK, opacity: ".7" }),
					h("circle", { cx: "39", cy: "47.5", r: "1.4", fill: "var(--dsw-alias-state-success-primary)", opacity: ".8" }),
					h("rect", { x: "27", y: "56", width: "7.5", height: "4.5", rx: "2.2", fill: "var(--pp-lo)", stroke: LINE, strokeWidth: "1.5" }),
					h("rect", { x: "37.5", y: "56", width: "7.5", height: "4.5", rx: "2.2", fill: "var(--pp-lo)", stroke: LINE, strokeWidth: "1.5" }),
					h("rect", { x: "19", y: "12", width: "34", height: "24", rx: "7", fill: G, stroke: LINE, strokeWidth: "2" }),
					h("rect", { x: "23.5", y: "16.5", width: "25", height: "15", rx: "4", fill: "#12151f", stroke: "rgba(0,0,0,.4)", strokeWidth: "1" }),
					eyes, mouth,
					laptop, sparks, thought, alert,
				);
			} else if (skin === "ghost") {
				parts.push(
					h("ellipse", { cx: "17", cy: "35", rx: "3", ry: "4.8", fill: G, stroke: LINE, strokeWidth: "1.8", transform: "rotate(18 17 35)" }),
					h("ellipse", { cx: "55", cy: "35", rx: "3", ry: "4.8", fill: G, stroke: LINE, strokeWidth: "1.8", transform: "rotate(-18 55 35)" }),
					pawsUp,
					h("path", {
						d: "M36 10 C25 10 18.5 18.5 18.5 29.5 L18.5 47 C20.5 51 25.25 51 27.25 47 C29.25 51 34 51 36 47 C38 51 42.75 51 44.75 47 C46.75 51 51.5 51 53.5 47 L53.5 29.5 C53.5 18.5 47 10 36 10 Z",
						fill: G, stroke: LINE, strokeWidth: "2", strokeLinejoin: "round", opacity: ".96",
					}),
					h("ellipse", { cx: "29", cy: "18.5", rx: "5", ry: "2.8", fill: WHITE, opacity: ".25" }),
					h("circle", { cx: "25.5", cy: "32.5", r: "2.2", fill: PINK, opacity: ".45" }),
					h("circle", { cx: "46.5", cy: "32.5", r: "2.2", fill: PINK, opacity: ".45" }),
					roundEyes(3.1, 27),
					roundMouth(34.5),
					laptop, sparks, thought, alert,
				);
			} else if (skin === "depresso") {
				// 瞅什魔 Depresso: official Palworld render; winds up and swings a pickaxe while working.
				const mining = st === "working" || st === "thinking";
				// Pickaxe layer sits BEHIND the render so the wind-up passes behind the head.
				const pickaxe = mining ? h("g", { className: "pp-pickaxe" },
					h("line", { x1: "24", y1: "47", x2: "14", y2: "34", stroke: "#a8794f", strokeWidth: "3", strokeLinecap: "round" }),
					h("path", { d: "M17 29 C 10 31, 6 36, 5 43", stroke: "#b8c0cc", strokeWidth: "4", strokeLinecap: "round", fill: "none" }),
				) : null;
				const mineFront = mining ? h(React.Fragment, null,
					h("path", { d: "M10 63 l-3 -6.5 l-6 -2 l-5.5 4 l-1.5 4.5 z", fill: "#6a7180", stroke: "rgba(0,0,0,.4)", strokeWidth: "1.5", strokeLinejoin: "round" }),
					h("circle", { cx: "3", cy: "58.5", r: "1.1", fill: "var(--dsw-alias-state-warn-primary)" }),
					h("circle", { cx: "0", cy: "60.5", r: ".9", fill: "var(--dsw-alias-state-warn-primary)" }),
					h("circle", { cx: "24", cy: "47", r: "2.8", fill: "#8fb7e0", stroke: "#3c5a7d", strokeWidth: "1.5" }),
					h("g", null,
						h("path", { className: "pp-mine-spark", d: "M9 48 v5 M6.5 50.5 h5", stroke: "var(--dsw-alias-state-warn-primary)", strokeWidth: "1.6", strokeLinecap: "round", fill: "none" }),
						h("circle", { className: "pp-mine-spark", cx: "12", cy: "50", r: "1.6", fill: "#cfe0f4" }),
					),
				) : null;
				parts.push(
					pickaxe,
					h("image", { className: "pp-depresso-img", href: DEPRESSO_IMG, x: "17", y: "5", width: "38", height: "59" }),
					mineFront,
					alert,
				);
			} else {
				// Default: cat
				parts.push(
					h("g", { className: "pp-tail" },
						h("path", { d: "M48 52 C 59 50, 62 41, 56 34", stroke: "currentColor", strokeWidth: "7", strokeLinecap: "round", fill: "none" }),
						h("circle", { cx: "56", cy: "34", r: "3.2", fill: "var(--pp-hi)" }),
					),
					pawsUp,
					h("ellipse", { cx: "36", cy: "51", rx: "14", ry: "11.5", fill: G, stroke: LINE, strokeWidth: "2" }),
					h("ellipse", { cx: "36", cy: "54.5", rx: "8", ry: "6.5", fill: WHITE, opacity: ".2" }),
					h("ellipse", { cx: "28.5", cy: "61.5", rx: "4.2", ry: "2.6", fill: "var(--pp-lo)", stroke: LINE, strokeWidth: "1.5" }),
					h("ellipse", { cx: "43.5", cy: "61.5", rx: "4.2", ry: "2.6", fill: "var(--pp-lo)", stroke: LINE, strokeWidth: "1.5" }),
					h("g", { className: "pp-ear-l" },
						h("path", { d: "M24.5 20 L20 5.5 L34 12.5 Z", fill: G, stroke: LINE, strokeWidth: "2", strokeLinejoin: "round" }),
						h("path", { d: "M25.5 17 L23 9.5 L30.5 13.5 Z", fill: PINK, opacity: ".85" }),
					),
					h("g", { className: "pp-ear-r" },
						h("path", { d: "M47.5 20 L52 5.5 L38 12.5 Z", fill: G, stroke: LINE, strokeWidth: "2", strokeLinejoin: "round" }),
						h("path", { d: "M46.5 17 L49 9.5 L41.5 13.5 Z", fill: PINK, opacity: ".85" }),
					),
					h("circle", { cx: "36", cy: "27.5", r: "15.5", fill: G, stroke: LINE, strokeWidth: "2" }),
					h("ellipse", { cx: "30", cy: "20.5", rx: "5", ry: "2.8", fill: WHITE, opacity: ".22" }),
					h("line", { x1: "15", y1: "26", x2: "22.5", y2: "27.5", stroke: LINE, strokeWidth: "1", opacity: ".55" }),
					h("line", { x1: "15", y1: "31.5", x2: "22.5", y2: "30.5", stroke: LINE, strokeWidth: "1", opacity: ".55" }),
					h("line", { x1: "57", y1: "26", x2: "49.5", y2: "27.5", stroke: LINE, strokeWidth: "1", opacity: ".55" }),
					h("line", { x1: "57", y1: "31.5", x2: "49.5", y2: "30.5", stroke: LINE, strokeWidth: "1", opacity: ".55" }),
					h("circle", { cx: "25.5", cy: "32.5", r: "2.3", fill: PINK, opacity: ".45" }),
					h("circle", { cx: "46.5", cy: "32.5", r: "2.3", fill: PINK, opacity: ".45" }),
					h("path", { d: "M34.6 30.6 h2.8 l-1.4 1.9 z", fill: PINK }),
					roundEyes(2.7, 26.5),
					roundMouth(33.6),
					laptop, sparks, thought, alert,
				);
			}

			return h("svg", { viewBox: "0 0 72 72", fill: "none", xmlns: "http://www.w3.org/2000/svg" },
				h("defs", null,
					h("linearGradient", { id: uid, x1: "0", y1: "0", x2: "0", y2: "1" },
						h("stop", { offset: "0", stopColor: "var(--pp-hi)" }),
						h("stop", { offset: "1", stopColor: "var(--pp-lo)" }),
					),
				),
				...parts,
			);
		}
		//#endregion

		//#region FileTree (Codex-style right dock: file tree + tabbed editors)
		const FT_WIDTH_KEY = "dsh-code:file-tree-width:v1";
		const FT_EDITOR_WIDTH_KEY = "dsh-code:file-editor-width:v1";
		/** The left sidebar's fold toggle, used to align the right toggle's height. */
		const FT_LEFT_TOGGLE_SELECTOR = [
			'[aria-label="收起侧边栏"]',
			'[aria-label="打开侧边栏"]',
			'[aria-label="Collapse sidebar"]',
			'[aria-label="Open sidebar"]',
		].join(",");
		/** Restart-hint markers returned while the host half predates a route. */
		const FT_ROUTE_HINTS = new Set(["unknown codex-clone route", "missing path"]);

		/** Module-level dock state shared by the toggle button, the session bridge
		 *  and the dock panel. Session-bound like the preview: switching sessions
		 *  closes the dock and forgets its open tabs. The tree pane stays pinned to
		 *  the far right; every opened file gets a tab in the editor pane to its
		 *  left, and tabs survive sidebar close/reopen within the same session. */
		const fileTreeStore = {
			state: { open: false, sessionId: undefined, cwd: "", tabs: [], active: "", nonce: 0 },
			listeners: new Set(),
			get() { return this.state; },
			subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
			emit() { for (const fn of [...this.listeners]) { try { fn(); } catch { /* listener error */ } } },
			open() {
				if (this.state.open) return;
				// One right-hand surface at a time: the preview sidebar yields.
				try { filePreviewStore.close(); } catch { /* preview region not loaded */ }
				this.state = { ...this.state, open: true };
				this.emit();
			},
			close() {
				if (!this.state.open) return;
				this.state = { ...this.state, open: false };
				this.emit();
			},
			toggle() { if (this.state.open) this.close(); else this.open(); },
			/** Open a file tab (or activate it when it is already open). */
			openFile(path) {
				if (typeof path !== "string" || path === "") return;
				try { filePreviewStore.close(); } catch { /* preview region not loaded */ }
				const tabs = this.state.tabs.includes(path) ? this.state.tabs : [...this.state.tabs, path];
				this.state = { ...this.state, open: true, tabs, active: path, nonce: this.state.nonce + 1 };
				this.emit();
			},
			setActive(path) {
				if (path === this.state.active || !this.state.tabs.includes(path)) return;
				this.state = { ...this.state, active: path };
				this.emit();
			},
			/** Close one tab; the neighbour takes over when it was the active one. */
			closeFile(path) {
				const idx = this.state.tabs.indexOf(path);
				if (idx === -1) return;
				const tabs = this.state.tabs.filter((t) => t !== path);
				let active = this.state.active;
				if (active === path) active = tabs.length === 0 ? "" : tabs[Math.min(idx, tabs.length - 1)];
				this.state = { ...this.state, tabs, active, nonce: this.state.nonce + 1 };
				this.emit();
			},
			setSession(sessionId, cwd) {
				if (this.state.sessionId === sessionId && this.state.cwd === cwd) return;
				// The dock is session-bound: leaving for another session closes it.
				const switchingAway = this.state.open && this.state.sessionId !== undefined && sessionId !== this.state.sessionId;
				this.state = {
					...this.state,
					sessionId,
					cwd,
					open: switchingAway ? false : this.state.open,
					tabs: switchingAway ? [] : this.state.tabs,
					active: switchingAway ? "" : this.state.active,
				};
				this.emit();
			},
		};

		/** Build a nested tree from the flat workspace listing. Missing
		 *  intermediate directories (shouldn't happen) are materialised so every
		 *  file still hangs off some parent. Children sort dirs-first, then by name. */
		function ftBuildTree(entries) {
			const root = { name: "", rel: "", type: "dir", children: [] };
			const byRel = new Map();
			byRel.set("", root);
			const ensureDir = (rel) => {
				const known = byRel.get(rel);
				if (known !== undefined) return known;
				const cut = rel.lastIndexOf("/");
				const parentRel = cut === -1 ? "" : rel.slice(0, cut);
				const parent = ensureDir(parentRel);
				const node = { name: cut === -1 ? rel : rel.slice(cut + 1), rel, type: "dir", children: [] };
				parent.children.push(node);
				byRel.set(rel, node);
				return node;
			};
			for (const e of entries) {
				if (e === null || e === undefined || typeof e.rel !== "string" || e.rel === "") continue;
				if (byRel.has(e.rel)) continue; // already materialised as an intermediate dir
				const cut = e.rel.lastIndexOf("/");
				const parent = ensureDir(cut === -1 ? "" : e.rel.slice(0, cut));
				const node = { name: e.name, rel: e.rel, type: e.type === "dir" ? "dir" : "file", children: e.type === "dir" ? [] : undefined };
				parent.children.push(node);
				if (node.type === "dir") byRel.set(e.rel, node);
			}
			const sortRec = (node) => {
				if (node.children === undefined) return;
				node.children.sort((a, b) => (a.type === b.type ? (a.name < b.name ? -1 : 1) : a.type === "dir" ? -1 : 1));
				for (const child of node.children) sortRec(child);
			};
			sortRec(root);
			return root;
		}

		/** "Panel on the right" glyph mirroring the left sidebar's panel icon. */
		function ftPanelIcon() {
			return h("svg", {
				width: 16, height: 16, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor",
				strokeWidth: "1.3", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true,
			},
				h("rect", { x: "1.5", y: "2.5", width: "13", height: "11", rx: "2" }),
				h("line", { x1: "10.5", y1: "2.5", x2: "10.5", y2: "13.5" }),
			);
		}

		function makeFileTreePanel(ctx) {
			const MarkdownText = PRIM.MarkdownText;
			const ReadBlock = PRIM.ReadBlock;
			const writeClipboard = PRIM.writeClipboard;
			const samplePageBg = () => ccxSamplePageBg(ctx);

			function ftStatusPanel(icon, title, detail) {
				return h("div", { className: "ccx-ft-status" },
					h("span", { className: "ccx-ft-status-icon" }, icon),
					h("span", null, title),
					detail !== undefined && detail !== null ? detail : null,
				);
			}

			/** Track the left sidebar's fold toggle so the right toggle sits at the
			 *  exact same height in both of the left sidebar's states. */
			function useLeftToggleTop() {
				const [top, setTop] = useState(22);
				useEffect(() => {
					let timer = null;
					let tries = 0;
					let raf = 0;
					const measure = () => {
						const el = document.querySelector(FT_LEFT_TOGGLE_SELECTOR);
						if (el === null) return false;
						const rect = el.getBoundingClientRect();
						if (rect.height <= 0) return false;
						setTop((prev) => (Math.abs(prev - rect.top) < 0.5 ? prev : rect.top));
						return true;
					};
					const tick = () => {
						if (measure()) return;
						if (++tries < 60) timer = setTimeout(tick, 100);
					};
					tick();
					const scheduleMeasure = () => {
						if (raf !== 0) return;
						raf = requestAnimationFrame(() => { raf = 0; measure(); });
					};
					// The left toggle moves when the left sidebar folds/unfolds.
					const rootEl = document.getElementById("root");
					const observer = rootEl !== null ? new MutationObserver(scheduleMeasure) : null;
					if (observer !== null) observer.observe(rootEl, { attributes: true, attributeFilter: ["class", "style"], subtree: true });
					window.addEventListener("resize", scheduleMeasure);
					return () => {
						if (timer !== null) clearTimeout(timer);
						if (raf !== 0) cancelAnimationFrame(raf);
						if (observer !== null) observer.disconnect();
						window.removeEventListener("resize", scheduleMeasure);
					};
				}, []);
				return top;
			}

			/** Overlay code editor: a transparent <textarea> layered exactly over the
			 *  syntax-highlighted ReadBlock, so editing keeps the platform's colors
			 *  and line numbers. The backdrop's glyph metrics (font, line height,
			 *  gutter offset) are measured from the rendered ReadBlock and copied to
			 *  the textarea so both layers overlap character-for-character. */
			function FtCodeEditor(props) {
				const draft = props.draft;
				const lang = props.lang;
				const taRef = useRef(null);
				const backRef = useRef(null);
				const [metrics, setMetrics] = useState(null);
				// The backdrop highlight trails the draft by a short debounce so fast
				// typing never waits on the tokenizer.
				const [backDraft, setBackDraft] = useState(draft);
				useEffect(() => {
					if (draft === backDraft) return undefined;
					const timer = setTimeout(() => setBackDraft(draft), 120);
					return () => clearTimeout(timer);
				}, [draft, backDraft]);

				// Measure the backdrop's glyph metrics once its lines are rendered
				// (re-runs when the highlighted content or language changes).
				useEffect(() => {
					const measure = () => {
						const back = backRef.current;
						if (back === null) return;
						const block = back.querySelector("[data-read]");
						if (block === null) return;
						const body = block.querySelector(":scope > div:last-child");
						if (body === null) return;
						const lineEls = body.querySelectorAll(":scope > div");
						if (lineEls.length === 0) return;
						const first = lineEls[0];
						const content = first.lastElementChild;
						if (content === null) return;
						// All offsets are relative to the backdrop element: the textarea
						// layer shares that exact box (both inset:0 siblings), and this
						// also folds in any block margin/border the platform applies.
						const backRect = back.getBoundingClientRect();
						const firstRect = first.getBoundingClientRect();
						const contentRect = content.getBoundingClientRect();
						if (firstRect.height <= 0) return;
						// Line pitch from two consecutive lines when available (captures
						// margins/gaps a single line's height would miss).
						const pitch = lineEls.length > 1
							? lineEls[1].getBoundingClientRect().top - firstRect.top
							: firstRect.height;
						const cs = getComputedStyle(content);
						setMetrics({
							padLeft: Math.max(0, contentRect.left - backRect.left),
							padTop: Math.max(0, firstRect.top - backRect.top),
							lineHeight: pitch > 0 ? pitch : firstRect.height,
							fontFamily: cs.fontFamily,
							fontSize: cs.fontSize,
							letterSpacing: cs.letterSpacing,
							tabSize: cs.tabSize,
						});
					};
					measure();
					window.addEventListener("resize", measure);
					return () => window.removeEventListener("resize", measure);
				}, [backDraft, lang]);

				const onScroll = () => {
					const ta = taRef.current;
					const back = backRef.current;
					if (ta === null || back === null) return;
					back.scrollTop = ta.scrollTop;
					back.scrollLeft = ta.scrollLeft;
				};

				const all = backDraft.split("\n");
				if (all.length > 0 && all[all.length - 1] === "") all.pop();
				const lines = all.slice(0, FP_MAX_LINES).map((text, i) => ({ number: i + 1, text }));

				const inputStyle = metrics !== null ? {
					paddingLeft: metrics.padLeft + "px",
					paddingTop: metrics.padTop + "px",
					lineHeight: metrics.lineHeight + "px",
					fontFamily: metrics.fontFamily,
					fontSize: metrics.fontSize,
					letterSpacing: metrics.letterSpacing,
					tabSize: metrics.tabSize,
				} : undefined;

				return h("div", { className: "ccx-ft-codeedit" },
					h("div", { className: "ccx-ft-codeedit-back", ref: backRef, "aria-hidden": true },
						ReadBlock !== undefined ? h(ReadBlock, {
							lines,
							totalLines: all.length,
							lang,
							maxLines: Math.max(lines.length, 1),
							className: "ccx-ft-codeedit-read",
						}) : null),
					h("textarea", {
						ref: taRef,
						className: "ccx-ft-codeedit-input",
						style: inputStyle,
						value: draft,
						wrap: "off",
						spellCheck: false,
						"aria-label": baseName(props.path) || props.path,
						onChange: props.onChange,
						onKeyDown: props.onKeyDown,
						onScroll,
					}),
				);
			}

			/** Per-file viewer/editor. One instance stays mounted per open tab, so
			 *  switching tabs never loses loaded content or unsaved drafts. */
			function FtFileView(props) {
				const path = props.path;
				const cwd = props.cwd;
				const sessionId = props.sessionId;
				const [data, setData] = useState(null);
				const [mode, setMode] = useState("preview"); // preview | edit
				const [draft, setDraft] = useState("");
				const [dirty, setDirty] = useState(false);
				const [mtime, setMtime] = useState(undefined);
				const [saving, setSaving] = useState(false);
				const [flash, setFlash] = useState(false);
				const [error, setError] = useState("");
				const [copied, setCopied] = useState(false);

				// Report dirty state upward (tab dot + close guard); retract on unmount.
				useEffect(() => {
					props.onDirtyChange(path, dirty);
					return () => props.onDirtyChange(path, false);
				}, [path, dirty, props.onDirtyChange]);

				// Load content whenever the target file changes.
				useEffect(() => {
					let alive = true;
					setData(null);
					setMode("preview");
					setDirty(false);
					setError("");
					setMtime(undefined);
					const params = new URLSearchParams();
					params.set("path", path);
					if (cwd !== "") params.set("cwd", cwd);
					else if (sessionId !== undefined) params.set("session", String(sessionId));
					fetch("/__codex/file?" + params.toString()).then(async (res) => {
						const ctype = res.headers.get("content-type") ?? "";
						if (!ctype.includes("application/json")) {
							if (alive) setData({ status: "error", kind: res.status === 404 ? "route" : "http", message: "HTTP " + res.status });
							return;
						}
						const body = await res.json();
						if (!alive) return;
						if (!res.ok || body.error !== undefined) {
							const kind = FT_ROUTE_HINTS.has(body.error) ? "route" : body.error === "no such file" ? "missing" : "other";
							setData({ status: "error", kind, message: body.error });
							return;
						}
						setMtime(body.mtime);
						setData({ status: "ok", body });
						// Non-markdown text files open straight into the editor — their
						// "preview" IS the editable textarea. Only markdown keeps the
						// rendered-preview ⇄ source toggle (it starts rendered).
						const textOk = body.kind === "file" && body.encoding === "utf8" && body.binary !== true && body.tooLarge !== true;
						if (textOk && !fpIsMarkdown(body.path)) {
							setDraft(String(body.content ?? ""));
							setDirty(false);
							setMode("edit");
						}
					}).catch((err) => {
						if (alive) setData({ status: "error", kind: "network", message: String(err?.message ?? err) });
					});
					return () => { alive = false; };
				}, [path, cwd, sessionId]);

				const body = data !== null && data.status === "ok" ? data.body : null;
				const isText = body !== null && body.kind === "file" && body.encoding === "utf8" && body.binary !== true && body.tooLarge !== true;
				const isImage = body !== null && body.image === true && body.encoding === "base64";
				const isMarkdownFile = isText && fpIsMarkdown(body.path);

				const doSave = () => {
					if (!dirty || saving) return;
					setSaving(true);
					setError("");
					const payload = { path, content: draft };
					if (cwd !== "") payload.cwd = cwd;
					else if (sessionId !== undefined) payload.session = String(sessionId);
					if (mtime !== undefined) payload.mtime = mtime;
					fetch("/__codex/file", {
						method: "POST",
						headers: { "content-type": "application/json" },
						body: JSON.stringify(payload),
					}).then(async (res) => {
						const ctype = res.headers.get("content-type") ?? "";
						const out = ctype.includes("application/json") ? await res.json().catch(() => ({})) : {};
						if (!res.ok) {
							setError(FT_ROUTE_HINTS.has(out.error)
								? "保存服务未就绪：重启一次 dsh web 服务即可启用编辑保存。"
								: out.error === "file changed on disk"
									? "文件已在磁盘上被修改，请重新打开后再编辑。"
									: "保存失败：" + (out.error ?? "HTTP " + res.status));
							setSaving(false);
							return;
						}
						// Pre-restart hosts answer a POST with the READ payload.
						if (out.kind === "file" || out.mtime === undefined) {
							setError("保存服务未就绪：重启一次 dsh web 服务即可启用编辑保存。");
							setSaving(false);
							return;
						}
						setMtime(out.mtime);
						setDirty(false);
						setFlash(true);
						window.setTimeout(() => setFlash(false), 1200);
						setSaving(false);
					}).catch((err) => {
						setError("保存失败：" + String(err?.message ?? err));
						setSaving(false);
					});
				};

				const onEditorKeyDown = (event) => {
					if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
						event.preventDefault();
						doSave();
						return;
					}
					if (event.key === "Tab") {
						event.preventDefault();
						const el = event.currentTarget;
						const start = el.selectionStart ?? draft.length;
						const end = el.selectionEnd ?? start;
						const next = draft.slice(0, start) + "  " + draft.slice(end);
						setDraft(next);
						setDirty(true);
						requestAnimationFrame(() => {
							try { el.setSelectionRange(start + 2, start + 2); } catch { /* noop */ }
						});
					}
				};

				const enterEdit = () => {
					if (!isText || mode === "edit") return;
					setDraft(String(body.content ?? ""));
					setDirty(false);
					setError("");
					setMode("edit");
				};
				const backToPreview = () => {
					if (mode !== "edit") return;
					if (dirty && !window.confirm("有未保存的修改，确定放弃并返回预览吗？")) return;
					setDirty(false);
					setMode("preview");
				};
				const onCopyPath = () => {
					if (copied) return;
					const doCopy = writeClipboard !== undefined
						? writeClipboard(path)
						: (navigator.clipboard?.writeText(path).then(() => true).catch(() => false) ?? Promise.resolve(false));
					doCopy.then((ok) => {
						if (!ok) return;
						setCopied(true);
						window.setTimeout(() => setCopied(false), 1200);
					});
				};

				let contentNode;
				let flush = false;
				if (data === null) {
					contentNode = ftStatusPanel("⏳", "正在加载…", h("code", null, path));
				} else if (data.status === "error") {
					if (data.kind === "route") {
						contentNode = ftStatusPanel("🔌", "文件服务未就绪",
							h(React.Fragment, null,
								h("span", null, "宿主路由尚未加载。"),
								h("span", null, "重启一次 dsh web 服务即可查看与编辑。")));
					} else if (data.kind === "missing") {
						contentNode = ftStatusPanel("🫥", "文件不存在或已被删除", h("code", null, path));
					} else {
						contentNode = ftStatusPanel("⚠️", "加载失败", h("code", null, data.message ?? ""));
					}
				} else if (mode === "edit" && isText) {
					flush = true;
					// Overlay editor keeps syntax colors + line numbers while typing;
					// fall back to a plain textarea when ReadBlock is unavailable.
					contentNode = ReadBlock !== undefined
						? h(FtCodeEditor, {
							draft,
							path,
							lang: fpIsMarkdown(path) ? "markdown" : fpLang(path),
							onChange: (event) => { setDraft(event.target.value); setDirty(true); },
							onKeyDown: onEditorKeyDown,
						})
						: h("textarea", {
							className: "ccx-ft-editor",
							value: draft,
							spellCheck: false,
							onChange: (event) => { setDraft(event.target.value); setDirty(true); },
							onKeyDown: onEditorKeyDown,
						});
				} else if (isImage) {
					const mime = FP_IMAGE_MIME[fpExt(body.path)] ?? "image/png";
					contentNode = h("div", { className: "ccx-ft-img-wrap" },
						h("img", { className: "ccx-ft-img", src: "data:" + mime + ";base64," + body.content, alt: baseName(body.path) }));
				} else if (body.kind === "file" && body.tooLarge === true) {
					contentNode = ftStatusPanel("📦", "文件过大（" + fpFormatBytes(body.size) + "）", "超出上限，暂不支持查看与编辑。");
				} else if (body.kind === "file" && body.binary === true) {
					contentNode = ftStatusPanel("🧩", "二进制文件（" + fpFormatBytes(body.size) + "）", "内容无法以文本形式查看。");
				} else if (isText) {
					const content = String(body.content ?? "");
					if (isMarkdownFile && MarkdownText !== undefined) {
						// Workspace-relative image targets must become absolute
						// /__codex/raw URLs or the renderer degrades them to alt text.
						const rewritten = ccxRewriteMarkdownImages(content, path, cwd, sessionId);
						contentNode = h(MarkdownText, { text: rewritten });
					} else if (ReadBlock !== undefined) {
						const all = content.split("\n");
						if (all.length > 0 && all[all.length - 1] === "") all.pop();
						const lines = all.map((text, i) => ({ number: i + 1, text }));
						flush = true;
						contentNode = h(ReadBlock, {
							label: body.path,
							lines,
							totalLines: all.length,
							lang: fpIsMarkdown(body.path) ? "markdown" : fpLang(body.path),
							maxLines: Math.max(lines.length, 1),
							className: "ccx-ft-read",
						});
					} else {
						contentNode = h("pre", { style: { whiteSpace: "pre-wrap", fontSize: "12px" } }, content);
					}
				} else if (body.kind === "dir") {
					contentNode = ftStatusPanel("📁", "这是一个目录", "请在文件树中展开查看。");
				} else {
					contentNode = ftStatusPanel("⚠️", "无法显示该文件", null);
				}

				return h("div", { className: "ccx-ft-fileview" },
					h("div", { className: "ccx-ft-fileview-head" },
						h("div", { className: "ccx-ft-fileview-title" },
							h("span", { className: "ccx-ft-fileview-name" }, baseName(path) || path),
							h("span", { className: "ccx-ft-fileview-path" }, path)),
						h("div", { className: "ccx-ft-fileview-actions" },
							mode === "edit" && dirty ? h("span", { className: "ccx-ft-dirty", title: "有未保存的修改" }) : null,
							// Only markdown keeps the rendered ⇄ source toggle; every other
							// text file opens straight into the editable textarea.
							isMarkdownFile ? h("div", { className: "ccx-ft-seg" },
								h("button", { type: "button", className: mode === "preview" ? "on" : "", onClick: backToPreview }, "预览"),
								h("button", { type: "button", className: mode === "edit" ? "on" : "", onClick: enterEdit }, "编辑"),
							) : null,
							mode === "edit"
								? h("button", {
									type: "button",
									className: "ccx-ft-btn primary" + (!dirty || saving ? " disabled" : ""),
									title: "保存（Ctrl/Cmd+S）",
									onClick: doSave,
								}, saving ? "保存中…" : flash ? "已保存 ✓" : "保存")
								: h("button", { type: "button", className: "ccx-ft-btn", onClick: onCopyPath }, copied ? "已复制" : "复制路径"),
						),
					),
					error !== "" ? h("div", { className: "ccx-ft-error" }, error) : null,
					h("div", { className: "ccx-ft-fileview-body" + (flush ? " flush" : "") + (mode === "edit" ? " editing" : "") }, contentNode),
				);
			}

			return function FileTreePanel() {
				const state = useSyncExternalStore(
					(fn) => fileTreeStore.subscribe(fn),
					() => fileTreeStore.get(),
					() => fileTreeStore.get(),
				);
				const [width, setWidth] = useState(() => {
					try {
						const saved = Number(JSON.parse(localStorage.getItem(FT_WIDTH_KEY) ?? "null"));
						if (Number.isFinite(saved) && saved >= 220 && saved <= 480) return saved;
					} catch { /* storage unavailable */ }
					return 280;
				});
				const [editorWidth, setEditorWidth] = useState(() => {
					try {
						const saved = Number(JSON.parse(localStorage.getItem(FT_EDITOR_WIDTH_KEY) ?? "null"));
						if (Number.isFinite(saved) && saved >= 360 && saved <= 1200) return saved;
					} catch { /* storage unavailable */ }
					return 520;
				});
				const [treeData, setTreeData] = useState(null); // null=loading | {error} | {root,...}
				const [expanded, setExpanded] = useState(() => new Set());
				const [panelBg, setPanelBg] = useState(() => samplePageBg());
				const [dirtyMap, setDirtyMap] = useState({}); // path -> has unsaved edits
				const toggleTop = useLeftToggleTop();
				const widthRef = useRef(width);
				widthRef.current = width;
				const editorWidthRef = useRef(editorWidth);
				editorWidthRef.current = editorWidth;
				const loadIdRef = useRef(0);

				const onDirtyChange = useCallback((path, isDirty) => {
					setDirtyMap((prev) => {
						if ((prev[path] === true) === isDirty) return prev;
						const next = { ...prev };
						if (isDirty) next[path] = true;
						else delete next[path];
						return next;
					});
				}, []);

				// Push the shell left while open; clean up on close/unmount.
				useEffect(() => {
					const html = document.documentElement;
					if (state.open) html.classList.add("ccx-ft-open");
					else html.classList.remove("ccx-ft-open");
					return () => { html.classList.remove("ccx-ft-open"); };
				}, [state.open]);
				// Pane width variables; the editor pane contributes 0 while no tabs exist.
				useEffect(() => {
					const html = document.documentElement;
					if (!state.open) return undefined;
					html.style.setProperty("--ccx-ft-w", width + "px");
					html.style.setProperty("--ccx-ft-ew", state.tabs.length > 0 ? editorWidth + "px" : "0px");
					return () => {
						html.style.removeProperty("--ccx-ft-w");
						html.style.removeProperty("--ccx-ft-ew");
					};
				}, [state.open, width, editorWidth, state.tabs.length]);
				// Match the dock background to the chat page's actual painted color.
				useEffect(() => {
					if (!state.open) return undefined;
					const update = () => setPanelBg(samplePageBg());
					update();
					const off = ctx !== undefined && typeof ctx.on === "function" ? ctx.on("theme/change", update) : null;
					return () => { if (off) off(); };
				}, [state.open]);

				const loadTree = useCallback(() => {
					if (state.cwd === "" && state.sessionId === undefined) {
						setTreeData({ error: "no-session" });
						return;
					}
					const id = ++loadIdRef.current;
					setTreeData(null);
					const params = new URLSearchParams();
					if (state.cwd !== "") params.set("cwd", state.cwd);
					else params.set("session", String(state.sessionId));
					fetch("/__codex/tree?" + params.toString()).then(async (res) => {
						if (loadIdRef.current !== id) return;
						const ctype = res.headers.get("content-type") ?? "";
						if (!ctype.includes("application/json")) {
							setTreeData({ error: res.status === 404 ? "route" : "http:" + res.status });
							return;
						}
						const body = await res.json();
						if (loadIdRef.current !== id) return;
						if (!res.ok || body.error !== undefined) {
							setTreeData({ error: FT_ROUTE_HINTS.has(body.error) ? "route" : String(body.error) });
							return;
						}
						setTreeData({
							root: ftBuildTree(body.entries ?? []),
							rootPath: body.root,
							truncated: body.truncated === true,
						});
					}).catch((err) => {
						if (loadIdRef.current === id) setTreeData({ error: String(err?.message ?? err) });
					});
				}, [state.cwd, state.sessionId]);
				useEffect(() => {
					if (!state.open) return undefined;
					loadTree();
					return () => { loadIdRef.current += 1; };
				}, [state.open, loadTree]);

				const requestCloseTab = (path) => {
					if (dirtyMap[path] === true && !window.confirm("「" + baseName(path) + "」有未保存的修改，确定关闭该标签页吗？")) return;
					fileTreeStore.closeFile(path);
				};

				// Esc closes the active tab first, then the dock; typing in the editor
				// is protected by the edit-mode confirm, so Esc there falls through.
				useEffect(() => {
					if (!state.open) return undefined;
					const onKey = (event) => {
						if (event.key !== "Escape") return;
						const el = document.activeElement;
						if (el !== null && el.tagName === "TEXTAREA") return; // typing in the editor
						if (state.tabs.length > 0) requestCloseTab(state.active);
						else fileTreeStore.close();
					};
					document.addEventListener("keydown", onKey);
					return () => document.removeEventListener("keydown", onKey);
				}, [state.open, state.tabs, state.active, dirtyMap]);

				if (!state.open) {
					return h("button", {
						type: "button",
						className: "ccx-ft-toggle",
						style: { top: toggleTop + "px" },
						title: "打开文件树",
						"aria-label": "打开文件树",
						onClick: () => fileTreeStore.open(),
					}, ftPanelIcon());
				}

				const startResize = (event, getWidth, applyWidth, min, max, persistKey) => {
					event.preventDefault();
					const startX = event.clientX;
					const startW = getWidth();
					document.body.style.cursor = "col-resize";
					document.documentElement.classList.add("ccx-ft-resizing");
					const onMove = (ev) => {
						const next = Math.max(min, Math.min(max, startW + (startX - ev.clientX)));
						applyWidth(next);
					};
					const onUp = () => {
						document.body.style.cursor = "";
						document.documentElement.classList.remove("ccx-ft-resizing");
						document.removeEventListener("mousemove", onMove);
						document.removeEventListener("mouseup", onUp);
						try { localStorage.setItem(persistKey, JSON.stringify(getWidth())); } catch { /* quota */ }
					};
					document.addEventListener("mousemove", onMove);
					document.addEventListener("mouseup", onUp);
				};
				const onTreeResizeStart = (event) => startResize(event, () => widthRef.current, setWidth, 220, 480, FT_WIDTH_KEY);
				const onEditorResizeStart = (event) => startResize(event, () => editorWidthRef.current, setEditorWidth, 360, Math.round(window.innerWidth * 0.75), FT_EDITOR_WIDTH_KEY);

				const toggleExpand = (rel) => {
					setExpanded((prev) => {
						const next = new Set(prev);
						if (next.has(rel)) next.delete(rel);
						else next.add(rel);
						return next;
					});
				};
				const renderNode = (node, depth) => {
					const isDir = node.type === "dir";
					const isExpanded = expanded.has(node.rel);
					const cls = "ccx-ft-row"
						+ (state.tabs.includes(node.rel) ? " open" : "")
						+ (state.active === node.rel ? " selected" : "");
					const out = [h("div", {
						key: node.rel,
						className: cls,
						style: { paddingLeft: (6 + depth * 14) + "px" },
						title: node.rel,
						onClick: () => { if (isDir) toggleExpand(node.rel); else fileTreeStore.openFile(node.rel); },
					},
						isDir
							? h("span", { className: "ccx-ft-chev" + (isExpanded ? " open" : "") }, "›")
							: h("span", { className: "ccx-ft-chev placeholder" }, "›"),
						h("span", { className: "ccx-ft-ico" }, mentionIconReact(isDir ? "dir" : "file")),
						h("span", { className: "ccx-ft-name" }, node.name + (isDir ? "/" : "")),
					)];
					if (isDir && isExpanded && node.children !== undefined) {
						for (const child of node.children) out.push(renderNode(child, depth + 1));
					}
					return out;
				};

				let treeBody;
				if (treeData === null) {
					treeBody = ftStatusPanel("⏳", "正在加载文件树…", null);
				} else if (treeData.error !== undefined) {
					if (treeData.error === "route") {
						treeBody = ftStatusPanel("🔌", "文件树服务未就绪",
							h(React.Fragment, null,
								h("span", null, "宿主路由 /__codex/tree 尚未加载。"),
								h("span", null, "重启一次 dsh web 服务即可启用。")));
					} else if (treeData.error === "no-session") {
						treeBody = ftStatusPanel("💬", "尚无活动会话", "打开一个会话后即可查看其项目文件。");
					} else {
						treeBody = ftStatusPanel("⚠️", "加载失败", h("code", null, String(treeData.error)));
					}
				} else if (treeData.root.children.length === 0) {
					treeBody = ftStatusPanel("📂", "空的工作区", h("code", null, treeData.rootPath ?? ""));
				} else {
					treeBody = h("div", { className: "ccx-ft-tree" },
						treeData.root.children.map((child) => renderNode(child, 0)),
						treeData.truncated ? h("div", { className: "ccx-ft-note" }, "文件过多，列表已截断。") : null,
					);
				}

				return h(React.Fragment, null,
					h("button", {
						type: "button",
						className: "ccx-ft-toggle active",
						style: { top: toggleTop + "px" },
						title: "收起文件树",
						"aria-label": "收起文件树",
						onClick: () => fileTreeStore.close(),
					}, ftPanelIcon()),
					h("div", {
						className: "ccx-ft-root",
						role: "complementary",
						"aria-label": "项目文件",
						style: panelBg !== ""
							? { background: panelBg, "--ccx-ft-bg": panelBg }
							: undefined,
					},
						state.tabs.length > 0 ? h("section", { className: "ccx-ft-editors", "aria-label": "打开的文件" },
							h("div", { className: "ccx-ft-resize", onMouseDown: onEditorResizeStart, title: "拖动调整编辑区宽度" }),
							h("div", { className: "ccx-ft-tabs", role: "tablist", "aria-label": "文件标签页" },
								state.tabs.map((tab) => h("div", {
									key: tab,
									role: "tab",
									"aria-selected": tab === state.active ? "true" : "false",
									className: "ccx-ft-tab" + (tab === state.active ? " active" : ""),
									title: tab,
									onClick: () => fileTreeStore.setActive(tab),
								},
									h("span", { className: "ccx-ft-ico" }, mentionIconReact("file")),
									h("span", { className: "ccx-ft-tab-name" }, baseName(tab)),
									dirtyMap[tab] === true ? h("span", { className: "ccx-ft-tab-dirty", title: "有未保存的修改" }) : null,
									h("button", {
										type: "button",
										className: "ccx-ft-tab-close",
										title: "关闭标签页",
										onClick: (ev) => { ev.stopPropagation(); requestCloseTab(tab); },
									}, "✕")))),
							h("div", { className: "ccx-ft-tabviews" },
								state.tabs.map((tab) => h("div", {
									key: tab,
									className: "ccx-ft-tabview",
									style: tab === state.active ? undefined : { display: "none" },
								}, h(FtFileView, {
									path: tab,
									cwd: state.cwd,
									sessionId: state.sessionId,
									onDirtyChange,
								})))),
						) : null,
						h("section", { className: "ccx-ft-treepane", "aria-label": "项目文件树" },
							h("div", { className: "ccx-ft-resize", onMouseDown: onTreeResizeStart, title: "拖动调整文件树宽度" }),
							h("div", { className: "ccx-ft-head" },
								h("span", { className: "ccx-ft-head-ico" }, mentionIconReact("dir")),
								h("div", { className: "ccx-ft-head-title" },
									h("span", { className: "ccx-ft-head-name" }, baseName(treeData?.rootPath ?? state.cwd ?? "") || "工作区"),
									h("span", { className: "ccx-ft-head-path" }, treeData?.rootPath ?? state.cwd ?? "")),
								h("div", { className: "ccx-ft-head-actions" },
									h("button", { type: "button", className: "ccx-ft-btn", title: "刷新文件树", onClick: () => loadTree() }, "⟳"),
									h("button", { type: "button", className: "ccx-ft-btn", title: "全部折叠", onClick: () => setExpanded(new Set()) }, "⊟")),
							),
							h("div", { className: "ccx-ft-body" }, treeBody),
						),
					),
				);
			};
		}
		//#endregion

		//#region ProfileSection
		function toISODate(d) {
			return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
		}
		function levelColor(level) {
			if (level <= 0) return "var(--dsw-alias-interactive-bg-hover)";
			const pct = [0, 26, 46, 70, 100][Math.min(level, 4)];
			return "color-mix(in srgb, var(--dsw-alias-state-business-primary) " + pct + "%, var(--dsw-alias-bg-layer-2))";
		}
		function buildDailyCells(daily, weeks) {
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			const dayMs = 86400000;
			const dow = (today.getDay() + 6) % 7; // Monday-first index
			const end = today.getTime();
			const start = end - dow * dayMs - (weeks - 1) * 7 * dayMs;
			const cells = [];
			let max = 0;
			for (let i = 0; i < weeks * 7; i += 1) {
				const t = start + i * dayMs;
				const iso = toISODate(new Date(t));
				const entry = daily?.[iso];
				const tokens = entry?.tokens ?? 0;
				if (tokens > max) max = tokens;
				cells.push({ iso, tokens, future: t > end });
			}
			return { cells, max };
		}
		function DailyHeatmap({ daily }) {
			const weeks = 52;
			const { cells, max } = useMemo(() => buildDailyCells(daily, weeks), [daily]);
			const [tooltip, setTooltip] = useState(null); // { x, y, iso, tokens }
			const containerRef = useRef(null);
			const children = [];
			// month labels (bottom row)
			let lastMonth = -1;
			for (let w = 0; w < weeks; w += 1) {
				const cell = cells[w * 7];
				const month = new Date(cell.iso + "T00:00:00").getMonth();
				if (month !== lastMonth) {
					children.push(h("span", { key: "m" + w, className: "ccx-heat-month", style: { gridColumn: w + 1, gridRow: 8 } }, (month + 1) + "月"));
					lastMonth = month;
				}
			}
			// day cells
			for (let w = 0; w < weeks; w += 1) {
				for (let r = 0; r < 7; r += 1) {
					const cell = cells[w * 7 + r];
					const level = cell.tokens <= 0 || max <= 0 ? 0 : Math.ceil((cell.tokens / max) * 4);
					children.push(h("span", {
						key: cell.iso,
						className: "ccx-cell",
						style: {
							gridColumn: w + 1,
							gridRow: r + 1,
							background: cell.future ? "transparent" : levelColor(level),
							visibility: cell.future ? "hidden" : "visible",
						},
						onMouseEnter: (e) => {
							if (cell.future) return;
							const rect = e.currentTarget.getBoundingClientRect();
							const containerRect = containerRef.current?.getBoundingClientRect();
							if (containerRect) {
								setTooltip({
									x: rect.left - containerRect.left + rect.width / 2,
									y: rect.top - containerRect.top,
									iso: cell.iso,
									tokens: cell.tokens,
								});
							}
						},
						onMouseLeave: () => setTooltip(null),
					}));
				}
			}
			return h("div", { className: "ccx-heat ccx-tooltip-wrap", ref: containerRef },
				children,
				tooltip ? h("div", {
					className: "ccx-tooltip visible",
					style: { left: tooltip.x + "px", top: tooltip.y + "px", transform: "translate(-50%, -100%)" },
				},
					h("span", { className: "ccx-tooltip-date" }, tooltip.iso),
					" · ",
					h("span", { className: "ccx-tooltip-value" }, formatTokens(tooltip.tokens) + " Token"),
				) : null,
			);
		}
		function WeeklyBars({ daily }) {
			const weeks = 26;
			const data = useMemo(() => {
				const today = new Date();
				today.setHours(0, 0, 0, 0);
				const dayMs = 86400000;
				const dow = (today.getDay() + 6) % 7;
				const end = today.getTime() - dow * dayMs; // this week's Monday
				const out = [];
				for (let w = weeks - 1; w >= 0; w -= 1) {
					const monday = end - w * 7 * dayMs;
					let tokens = 0;
					for (let i = 0; i < 7; i += 1) {
						const iso = toISODate(new Date(monday + i * dayMs));
						tokens += daily?.[iso]?.tokens ?? 0;
					}
					out.push({ iso: toISODate(new Date(monday)), tokens });
				}
				return out;
			}, [daily]);
			const max = Math.max(1, ...data.map((d) => d.tokens));
			const [tooltip, setTooltip] = useState(null); // { x, y, iso, tokens }
			const containerRef = useRef(null);
			return h("div", { className: "ccx-weekbars ccx-tooltip-wrap", ref: containerRef },
				data.map((d) => h("div", {
					key: d.iso,
					className: "ccx-weekbar",
					style: { height: Math.max(3, (d.tokens / max) * 100) + "%", opacity: d.tokens > 0 ? 0.9 : 0.25 },
					onMouseEnter: (e) => {
						const rect = e.currentTarget.getBoundingClientRect();
						const containerRect = containerRef.current?.getBoundingClientRect();
						if (containerRect) {
							setTooltip({
								x: rect.left - containerRect.left + rect.width / 2,
								y: rect.top - containerRect.top,
								iso: d.iso,
								tokens: d.tokens,
							});
						}
					},
					onMouseLeave: () => setTooltip(null),
				})),
				tooltip ? h("div", {
					className: "ccx-tooltip visible",
					style: { left: tooltip.x + "px", top: tooltip.y + "px", transform: "translate(-50%, -100%)" },
				},
					h("span", { className: "ccx-tooltip-date" }, "周 " + tooltip.iso),
					" · ",
					h("span", { className: "ccx-tooltip-value" }, formatTokens(tooltip.tokens) + " Token"),
				) : null,
			);
		}
		function CumulativeChart({ daily }) {
			const { points, area, total } = useMemo(() => {
				const keys = Object.keys(daily ?? {}).sort();
				if (keys.length === 0) return { points: "", area: "", total: 0 };
				const recent = keys.slice(-180);
				let acc = 0;
				const values = recent.map((key) => { acc += daily[key].tokens ?? 0; return acc; });
				const max = Math.max(1, acc);
				const W = 600;
				const H = 120;
				const step = recent.length > 1 ? W / (recent.length - 1) : W;
				const coords = values.map((v, i) => [i * step, H - (v / max) * (H - 8) - 2]);
				const pts = coords.map(([x, y]) => x.toFixed(1) + "," + y.toFixed(1)).join(" ");
				const areaPath = "M0," + H + " L" + coords.map(([x, y]) => x.toFixed(1) + "," + y.toFixed(1)).join(" L") + " L" + (coords.length > 0 ? coords[coords.length - 1][0].toFixed(1) : "0") + "," + H + " Z";
				return { points: pts, area: areaPath, total: acc };
			}, [daily]);
			if (points === "") return h("div", { className: "ccx-note" }, "暂无活动数据。");
			return h(React.Fragment, null,
				h("svg", { className: "ccx-cum-svg", viewBox: "0 0 600 120", preserveAspectRatio: "none" },
					h("path", { d: area, fill: "var(--dsw-alias-state-business-primary)", opacity: 0.12, stroke: "none" }),
					h("polyline", { points, fill: "none", stroke: "var(--dsw-alias-state-business-primary)", strokeWidth: 2, vectorEffect: "non-scaling-stroke" }),
				),
				h("div", { className: "ccx-note" }, "累计曲线 · 近 " + Math.min(180, Object.keys(daily).length) + " 天 · 合计 " + formatTokens(total) + " Token"),
			);
		}
		/** Read-only row at the bottom of the native General settings section
		 *  showing the running DeepSeek Harness version (host `/__codex/version`). */
		function makeDshVersionItem(ctx) {
			return function DshVersionItem() {
				const [version, setVersion] = useState(null); // null = loading, "" = unknown
				useEffect(() => {
					let alive = true;
					(async () => {
						try {
							const res = await fetch("/__codex/version");
							if (!res.ok) { if (alive) setVersion(""); return; }
							const data = await res.json();
							if (alive) setVersion(typeof data?.version === "string" && data.version !== "" ? data.version : "");
						} catch {
							if (alive) setVersion(""); // host route not loaded yet
						}
					})();
					return () => { alive = false; };
				}, []);
				const text = version === null ? "加载中…" : (version !== "" ? version : "未知");
				return h("div", { className: "ccx-ver-group" },
					h("div", { className: "ccx-ver-title" }, "DeepSeek Harness 版本"),
					h("div", { className: "ccx-ver-value" }, text),
				);
			};
		}
		function makeProfileSection(ctx, config, useConfig) {
			return function ProfileSection() {
				const cfg = useConfig();
				const [stats, setStats] = useState(null);
				const [mode, setMode] = useState("daily");
				const [nameDraft, setNameDraft] = useState(null);
				const avatarRef = useRef(null);
				useEffect(() => {
					let alive = true;
					(async () => {
						try {
							const res = await fetch("/__codex/stats?tz=" + new Date().getTimezoneOffset());
							if (res.ok) {
								const data = await res.json();
								if (alive) setStats(data);
							}
						} catch { /* host route unavailable */ }
					})();
					return () => { alive = false; };
				}, []);
				const refresh = async () => {
					try {
						const res = await fetch("/__codex/stats?tz=" + new Date().getTimezoneOffset() + "&r=" + Date.now());
						if (res.ok) setStats(await res.json());
					} catch { /* ignore */ }
				};
				const username = cfg.username ?? "";
				const avatar = cfg.avatar ?? "";
				const daily = stats?.daily ?? {};
				const activeDays = Object.keys(daily).filter((k) => (daily[k]?.tokens ?? 0) > 0).length;
				return h("div", { className: "ccx-section" },
					h("div", { className: "ccx-profile-head" },
						h("button", { type: "button", className: "ccx-btn ccx-refresh", onClick: refresh }, "刷新"),
						h("div", { className: "ccx-avatar-wrap" },
							avatar !== ""
								? h("img", { className: "ccx-avatar", src: avatar, alt: "avatar" })
								: h("div", { className: "ccx-avatar-fallback" }, (username !== "" ? username : "D").slice(0, 1).toUpperCase()),
							h("button", { type: "button", className: "ccx-avatar-edit", title: "更换头像", onClick: () => avatarRef.current?.click() }, "✎"),
							h("input", {
								ref: avatarRef, type: "file", accept: "image/png,image/jpeg,image/webp,image/gif", style: { display: "none" },
								onChange: async (event) => {
									const file = event.target.files?.[0];
									event.target.value = "";
									if (file === undefined) return;
									try {
										const bytes = await file.arrayBuffer();
										const res = await fetch("/__codex/upload", { method: "POST", body: bytes });
										if (!res.ok) return;
										const data = await res.json();
										if (data.url) await config.set("avatar", data.url);
									} catch { /* ignore */ }
								},
							}),
						),
						h("div", { className: "ccx-profile-id" },
							h("input", {
								className: "ccx-profile-name-input",
								placeholder: "点击设置用户名",
								value: nameDraft === null ? username : nameDraft,
								onChange: (e) => setNameDraft(e.target.value),
								onBlur: () => { if (nameDraft !== null) { config.set("username", nameDraft.trim()); setNameDraft(null); } },
								onKeyDown: (e) => { if (e.key === "Enter") e.currentTarget.blur(); },
							}),
							h("div", { className: "ccx-profile-sub" },
								username !== "" ? h("span", null, "@" + username) : null,
								username !== "" ? "·" : null,
								stats?.memberSince ? "加入于 " + new Date(stats.memberSince).toLocaleDateString() + " · 活跃 " + activeDays + " 天 · " + (stats.sessionCount ?? 0) + " 个会话" : "DeepSeek Harness · Codex 风格"),
						),
					),
					h("div", { className: "ccx-statgrid" },
						h("div", { className: "ccx-stat" },
							h("div", { className: "ccx-stat-value" }, stats ? formatTokens(stats.totalTokens) : "…"),
							h("div", { className: "ccx-stat-label" }, "累计 Token 数")),
						h("div", { className: "ccx-stat" },
							h("div", { className: "ccx-stat-value" }, stats ? formatTokens(stats.peakTokens) : "…"),
							h("div", { className: "ccx-stat-label" }, "峰值 Token 数")),
						h("div", { className: "ccx-stat" },
							h("div", { className: "ccx-stat-value" }, stats ? formatDuration(stats.longestChatMs) : "…"),
							h("div", { className: "ccx-stat-label" }, "最长聊天时长")),
						h("div", { className: "ccx-stat" },
							h("div", { className: "ccx-stat-value" }, stats ? stats.currentStreak + " 天" : "…"),
							h("div", { className: "ccx-stat-label" }, "当前连续天数")),
						h("div", { className: "ccx-stat" },
							h("div", { className: "ccx-stat-value" }, stats ? stats.longestStreak + " 天" : "…"),
							h("div", { className: "ccx-stat-label" }, "最长连续天数")),
					),
					h("div", { className: "ccx-group" },
						h("div", { className: "ccx-heat-head" },
							h("div", { className: "ccx-group-title" }, "Token 活动"),
							h("div", { className: "ccx-seg" },
								h("button", { type: "button", className: mode === "daily" ? "on" : "", onClick: () => setMode("daily") }, "每日"),
								h("button", { type: "button", className: mode === "weekly" ? "on" : "", onClick: () => setMode("weekly") }, "每周"),
								h("button", { type: "button", className: mode === "total" ? "on" : "", onClick: () => setMode("total") }, "累计")),
						),
						stats === null
							? h("div", { className: "ccx-note" }, "正在加载活动数据…")
							: mode === "daily"
								? h(DailyHeatmap, { daily })
								: mode === "weekly"
									? h(WeeklyBars, { daily })
									: h(CumulativeChart, { daily }),
					),
				);
			};
		}
		//#endregion

		//#region apply
		const CONFIG_STORAGE_KEY = "dsh-code:config:v1";
		/** Pre-rename storage key; migrated once on first load, kept for upgrades. */
		const LEGACY_CONFIG_STORAGE_KEY = "dsh-codex-clone:config:v1";
		const CONFIG_DEFAULTS = {
			themeFlavor: "mocha",
			backgroundImage: "",
			backgroundOpacity: 0.3,
			username: "",
			avatar: "",
			quickPrompts: [],
			petEnabled: true,
			petSkin: "cat",
			petSize: 76,
			wideChat: false,
		};
		/**
		 * Client-side config store persisted in localStorage. The Web API only
		 * exposes a fixed allow-list of settings namespaces to the browser, so
		 * this plugin owns its persistence directly.
		 */
		/** One-time upgrade: copy the pre-rename config blob to the new key. */
		function migrateLegacyConfigKey() {
			try {
				if (localStorage.getItem(CONFIG_STORAGE_KEY) === null) {
					const legacy = localStorage.getItem(LEGACY_CONFIG_STORAGE_KEY);
					if (legacy !== null) {
						localStorage.setItem(CONFIG_STORAGE_KEY, legacy);
						localStorage.removeItem(LEGACY_CONFIG_STORAGE_KEY);
					}
				}
			} catch { /* storage unavailable */ }
		}
		function makeConfigStore() {
			migrateLegacyConfigKey();
			let value = { ...CONFIG_DEFAULTS };
			try {
				const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
				if (raw !== null && raw !== "") value = { ...value, ...JSON.parse(raw) };
			} catch { /* corrupted or unavailable storage */ }
			const listeners = new Set();
			const notify = () => { for (const listener of [...listeners]) { try { listener(); } catch { /* listener error */ } } };
			const persist = () => { try { localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(value)); } catch { /* quota */ } };
			return {
				get: () => value,
				subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
				set: async (field, fieldValue) => {
					value = { ...value, [field]: fieldValue };
					persist();
					notify();
				},
				syncFromStorage: () => {
					try {
						const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
						value = { ...CONFIG_DEFAULTS, ...(raw !== null && raw !== "" ? JSON.parse(raw) : {}) };
					} catch { /* keep current */ }
					notify();
				},
			};
		}
		const inject = ["slots", "theme", "connection", "timer"];
		function apply(ctx) {
			ctx.effect(installStyles, "dsh-code: stylesheet");
			const config = makeConfigStore();
			// cross-tab sync: another tab's write re-reads storage in place
			if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
				ctx.effect(() => {
					const onStorage = (event) => { if (event.key === CONFIG_STORAGE_KEY) config.syncFromStorage(); };
					window.addEventListener("storage", onStorage);
					return () => window.removeEventListener("storage", onStorage);
				}, "dsh-code: config cross-tab sync");
			}
			const configSubscribe = (fn) => config.subscribe(fn);
			const configGetSnapshot = () => config.get();
			const useConfig = () => useSyncExternalStore(configSubscribe, configGetSnapshot, configGetSnapshot);

			// Register the four Catppuccin flavors.
			for (const [id, flavor] of Object.entries(CATPPUCCIN)) {
				ctx.effect(() => ctx.theme.register({
					id,
					colorScheme: flavor.scheme,
					tokens: buildTokens(flavor.colors, flavor.scheme),
				}), "dsh-code: theme " + id);
			}

			// Apply the persisted flavor (default mocha) whenever config changes.
			// The ui-theme plugin re-adopts its persisted preference when its own
			// settings scope finishes its initial async load, which can land AFTER
			// our first setTheme; the backoff retries re-assert our flavor until
			// that settle window closes.
			ctx.effect(() => {
				const applyFlavor = () => {
					const flavor = config.get().themeFlavor ?? "mocha";
					try {
						ctx.theme.setTheme(flavor);
					} catch (error) {
						console.error("[dsh-code] setTheme failed", flavor, String(error));
					}
				};
				applyFlavor();
				const retries = [400, 1200, 3000].map((ms) => ctx.timeout(applyFlavor, ms));
				const offConfig = config.subscribe(applyFlavor);
				return () => {
					for (const dispose of retries) dispose();
					offConfig();
				};
			}, "dsh-code: theme flavor preference");

			// Wallpaper: fixed background on <html> + translucent surface tokens.
			let wallpaperDisposer = null;
			let wallpaperKey = null;
			ctx.effect(() => {
				const applyWallpaper = () => {
					if (typeof document === "undefined") return;
					const cfgValue = config.get();
					const img = cfgValue.backgroundImage ?? "";
					const opacity = Math.max(0.05, Math.min(0.9, Number(cfgValue.backgroundOpacity ?? 0.3)));
					const activeId = ctx.theme.getTheme().active?.id;
					// Guard: overrideTokens re-emits theme/change; skip no-op reapplications.
					const key = img + "|" + opacity + "|" + (img === "" ? "-" : activeId);
					if (key === wallpaperKey) return;
					wallpaperKey = key;
					const html = document.documentElement;
					if (wallpaperDisposer !== null) { wallpaperDisposer(); wallpaperDisposer = null; }
					if (img === "") {
						html.classList.remove("ccx-wallpaper");
						html.style.backgroundImage = "";
						html.style.backgroundAttachment = "";
						html.style.backgroundSize = "";
						html.style.backgroundPosition = "";
						return;
					}
					html.classList.add("ccx-wallpaper");
					html.style.backgroundImage = "url(" + JSON.stringify(img) + ")";
					html.style.backgroundAttachment = "fixed";
					html.style.backgroundSize = "cover";
					html.style.backgroundPosition = "center";
					const flavor = CATPPUCCIN[activeId] ?? CATPPUCCIN.mocha;
					const p = flavor.colors;
					const surfaceAlpha = Math.max(0.35, 1 - opacity);
					wallpaperDisposer = ctx.theme.overrideTokens("dsh-code-wallpaper", {
						"--dsw-alias-bg-base": {
							light: rgba(CATPPUCCIN.latte.colors.base, surfaceAlpha),
							dark: rgba(p.base, surfaceAlpha),
						},
						"--dsw-specific-sidebar-fill": {
							light: rgba(CATPPUCCIN.latte.colors.crust, Math.min(1, surfaceAlpha + 0.12)),
							dark: rgba(p.mantle, Math.min(1, surfaceAlpha + 0.12)),
						},
					});
				};
				applyWallpaper();
				const offConfig = config.subscribe(applyWallpaper);
				const offTheme = ctx.on("theme/change", applyWallpaper);
				return () => {
					offConfig();
					offTheme();
					if (wallpaperDisposer !== null) { wallpaperDisposer(); wallpaperDisposer = null; }
					wallpaperKey = null;
				};
			}, "dsh-code: wallpaper");

			// Wide chat mode: override DSH width CSS variables at the element level.
			ctx.effect(() => {
				const styledEls = new Set();
				const applyWideChat = () => {
					if (typeof document === "undefined") return;
					const wide = config.get().wideChat === true;
					const html = document.documentElement;
					if (wide) {
						html.classList.add("ccx-wide-chat");
						// Find the conversation root element (has data-phase attribute)
						// and override its CSS variables directly via inline style,
						// because the variables are defined on a child element class
						// which would otherwise override our html-level variables.
						const roots = document.querySelectorAll("[data-phase]");
						for (const el of roots) {
							el.style.setProperty("--dsh-chat-content-width", "9999px", "important");
							el.style.setProperty("--dsh-composer-card-max-width", "9999px", "important");
							styledEls.add(el);
						}
					} else {
						html.classList.remove("ccx-wide-chat");
						for (const el of styledEls) {
							el.style.removeProperty("--dsh-chat-content-width");
							el.style.removeProperty("--dsh-composer-card-max-width");
						}
						styledEls.clear();
					}
				};
				applyWideChat();
				const offConfig = config.subscribe(applyWideChat);
				// Re-scan periodically in case DOM changes (e.g. navigating sessions)
				const scanInterval = setInterval(applyWideChat, 1000);
				return () => {
					offConfig();
					clearInterval(scanInterval);
					for (const el of styledEls) {
						el.style.removeProperty("--dsh-chat-content-width");
						el.style.removeProperty("--dsh-composer-card-max-width");
					}
					styledEls.clear();
					if (typeof document !== "undefined") {
						document.documentElement.classList.remove("ccx-wide-chat");
					}
				};
			}, "dsh-code: wide chat mode");

			// Settings pages.
			const AppearanceSection = makeAppearanceSection(ctx, config, useConfig);
			const ProfileSection = makeProfileSection(ctx, config, useConfig);
			ctx.effect(() => ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "codex-appearance",
				order: 90,
				label: () => "外观设置",
			}, AppearanceSection)), "dsh-code: appearance settings");
			ctx.effect(() => ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "codex-profile",
				order: 91,
				label: () => "个人资料",
			}, ProfileSection)), "dsh-code: profile settings");

			// DeepSeek Harness version row at the bottom of the native General section.
			const DshVersionItem = makeDshVersionItem(ctx);
			ctx.effect(() => ctx.slots.inject("settings.general.item", () => ctx.slots.register({
				name: "settings.general.item",
				id: "codex-dsh-version",
				order: 100,
				label: () => "DeepSeek Harness 版本",
			}, DshVersionItem)), "dsh-code: harness version item");

			// Home quick-prompt cards above the composer (hero phase only).
			const HomeCards = makeHomeCards(ctx, config, useConfig);
			ctx.effect(() => ctx.slots.inject("conversation.input.dock", () => ctx.slots.register({
				name: "conversation.input.dock",
				id: "codex-home-cards",
				order: -10,
			}, HomeCards)), "dsh-code: home cards");

			// Git change-stats card and Agent card - in input dock but visually positioned below tab bar.
			const GitCard = makeGitCard(ctx);
			const AgentCard = makeAgentCard(ctx);
			// Wrapper component to display both cards in a horizontal row
			function CardsRow(props) {
				return h("div", { className: "ccx-cards-row" },
					h(GitCard, props),
					h(AgentCard, props),
				);
			}
			// Register in conversation.input.dock (has session props) but use CSS to position visually
			ctx.effect(() => ctx.slots.inject("conversation.input.dock", () => ctx.slots.register({
				name: "conversation.input.dock",
				id: "codex-cards-row",
				order: -20,
			}, CardsRow)), "dsh-code: cards row");

			// Pet: session-scoped state bridge + root-scoped floating widget.
			ctx.effect(() => ctx.slots.inject("conversation.input.dock", () => ctx.slots.register({
				name: "conversation.input.dock",
				id: "codex-pet-bridge",
				order: 30,
			}, PetBridge)), "dsh-code: pet state bridge");
			// Download button mover: watches DOM and moves download button to bottom-right.
			ctx.effect(() => ctx.slots.inject("conversation.input.dock", () => ctx.slots.register({
				name: "conversation.input.dock",
				id: "codex-download-mover",
				order: 31,
			}, DownloadButtonMover)), "dsh-code: download button mover");
			const PetWidget = makePetWidget(ctx, useConfig);
			ctx.effect(() => ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "codex-pet",
				order: 50,
			}, PetWidget)), "dsh-code: pet widget");

			// '$' skills menu in the composer overlay.
			const SkillDollarMenu = makeSkillDollarMenu(ctx);
			ctx.effect(() => ctx.slots.inject("conversation.input.overlay", () => ctx.slots.register({
				name: "conversation.input.overlay",
				id: "codex-skill-dollar",
				order: 10,
			}, SkillDollarMenu)), "dsh-code: dollar skill menu");

			// '@' file mention: native trigger-pipeline source (candidate menu)
			// + chip overlay that renders inserted paths as basename chips.
			const startFileMentionSource = makeFileMentionSource(ctx);
			ctx.effect(() => startFileMentionSource(), "dsh-code: @ file mention source");
			const MentionChips = makeMentionChips(ctx);
			ctx.effect(() => ctx.slots.inject("conversation.input.overlay", () => ctx.slots.register({
				name: "conversation.input.overlay",
				id: "codex-mention-chips",
				order: 11,
			}, MentionChips)), "dsh-code: mention chips overlay");

			// File preview: session context bridge, right-hand push sidebar, and the
			// click interceptor that turns file mentions / path-like inline code
			// into preview opens.
			ctx.effect(() => ctx.slots.inject("conversation.input.dock", () => ctx.slots.register({
				name: "conversation.input.dock",
				id: "codex-file-preview-bridge",
				order: 32,
			}, SessionFileBridge)), "dsh-code: file preview session bridge");
			const FilePreviewPanel = makeFilePreviewPanel(ctx);
			ctx.effect(() => ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "codex-file-preview",
				order: 55,
			}, FilePreviewPanel)), "dsh-code: file preview panel");
			const startFilePreviewInterceptor = makeFilePreviewInterceptor();
			ctx.effect(() => startFilePreviewInterceptor(), "dsh-code: file preview interceptor");

			// File tree sidebar: session context rides the same bridge (above); the
			// panel renders its own top-right fold toggle aligned with the left
			// sidebar's toggle, and closes on session switch like the preview.
			const FileTreePanel = makeFileTreePanel(ctx);
			ctx.effect(() => ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "codex-file-tree",
				order: 56,
			}, FileTreePanel)), "dsh-code: file tree sidebar");
		}
		//#endregion

		exports.inject = inject;
		exports.apply = apply;
		/** Internal hooks for unit tests / debugging. */
		exports.__filePreview = { store: filePreviewStore, buildDiffModel: fpBuildDiffModel, renderDiffBody: fpRenderDiffBody };
		exports.__fileTree = {
			store: fileTreeStore,
			buildTree: ftBuildTree,
			resolveMdImagePath: ccxResolveMdImagePath,
			rewriteMdImages: ccxRewriteMarkdownImages,
		};
		return module.exports;
	},
});

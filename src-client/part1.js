window.__ModuleLoader__.load({
	id: "dsh-codex-clone",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		const React = require("react");
		const h = React.createElement;
		const { useState, useEffect, useMemo, useRef, useCallback, useSyncExternalStore } = React;

		//#region styles
		const TAG_ID = "dsh-codex-clone/main.css";
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
`;
		function installStyles() {
			if (typeof document === "undefined") return () => {};
			if (document.querySelector("style[data-plugin-css=" + JSON.stringify(TAG_ID) + "]") !== null) return () => {};
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-codex-clone";
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

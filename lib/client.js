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
/* HomeCards and CardsRow adapt */
html.ccx-wide-chat .ccx-homecards {
	max-width: 100% !important;
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
.ccx-profile-head { display:flex; align-items:center; gap:16px; padding:8px 2px 4px; }
.ccx-avatar-wrap { position:relative; flex:none; }
.ccx-avatar { width:64px; height:64px; border-radius:50%; object-fit:cover; display:block; border:2px solid var(--dsw-alias-border-l2); }
.ccx-avatar-fallback { width:64px; height:64px; border-radius:50%; display:grid; place-items:center; font-size:26px; font-weight:600; color:#fff; background:linear-gradient(135deg, var(--dsw-alias-state-business-primary), var(--dsw-static-purple-400, #9d7cd8)); }
.ccx-avatar-edit { position:absolute; right:-2px; bottom:-2px; width:22px; height:22px; border-radius:50%; border:1px solid var(--dsw-alias-border-l2); background:var(--dsw-alias-bg-overlay); color:var(--dsw-alias-label-secondary); cursor:pointer; font-size:11px; display:grid; place-items:center; }
.ccx-profile-id { display:flex; flex-direction:column; gap:2px; min-width:0; }
.ccx-profile-name-input { font-size:18px; font-weight:600; color:var(--dsw-alias-label-primary); background:transparent; border:none; border-bottom:1px dashed transparent; outline:none; padding:0 0 2px; max-width:280px; }
.ccx-profile-name-input:hover, .ccx-profile-name-input:focus { border-bottom-color:var(--dsw-alias-border-l2); }
.ccx-profile-sub { font-size:12px; color:var(--dsw-alias-label-caption); }
.ccx-statgrid { display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:8px; }
.ccx-stat { display:flex; flex-direction:column; gap:4px; padding:12px 14px; border-radius:14px; border:1px solid var(--dsw-alias-border-l1); background:var(--dsw-alias-bg-layer-1); }
.ccx-stat-value { font-size:20px; font-weight:600; color:var(--dsw-alias-label-primary); font-variant-numeric:tabular-nums; line-height:26px; }
.ccx-stat-label { font-size:12px; color:var(--dsw-alias-label-caption); }
.ccx-heat-head { display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap; }
.ccx-seg { display:flex; border:1px solid var(--dsw-alias-border-l2); border-radius:10px; overflow:hidden; }
.ccx-seg button { border:none; background:transparent; color:var(--dsw-alias-label-secondary); font-size:12px; padding:6px 14px; cursor:pointer; }
.ccx-seg button.on { background:var(--dsw-alias-interactive-bg-hover-accent); color:var(--dsw-alias-label-primary); font-weight:500; }
/* full-width responsive contribution grid: 52 week columns stretch to the container */
.ccx-heat { display:grid; grid-template-columns:22px repeat(52, minmax(4px, 1fr)); gap:3px; width:100%; }
.ccx-heat-month { font-size:10px; color:var(--dsw-alias-label-caption); height:14px; line-height:14px; overflow:visible; white-space:nowrap; }
.ccx-heat-daylabel { font-size:9px; color:var(--dsw-alias-label-caption); text-align:right; padding-right:2px; align-self:center; }
.ccx-cell { aspect-ratio:1; width:100%; min-width:4px; border-radius:3px; position:relative; cursor:pointer; transition:transform .1s; }
.ccx-cell:hover { transform:scale(1.3); z-index:10; }
.ccx-heat-legend { display:flex; align-items:center; gap:3px; font-size:10px; color:var(--dsw-alias-label-caption); }
.ccx-heat-legend .ccx-cell { width:10px; min-width:10px; aspect-ratio:1; cursor:default; }
.ccx-heat-legend .ccx-cell:hover { transform:none; }
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
/* ── pet widget (shell overlay) — draggable floating ── */
.ccx-pet { position:fixed; z-index:90; pointer-events:auto; user-select:none; }
.ccx-pet.dragging { cursor:grabbing; }
.ccx-pet.dragging .ccx-pet-body { opacity:0.8; }
.ccx-pet-bubble { position:absolute; bottom:calc(100% + 6px); right:0; max-width:220px; padding:6px 10px; border-radius:12px 12px 2px 12px; border:1px solid var(--dsw-alias-border-l2); background:var(--dsw-alias-bg-overlay); color:var(--dsw-alias-label-primary); font-size:12px; line-height:18px; box-shadow:var(--dsw-shadow-lv2, 0 8px 24px rgba(0,0,0,.18)); white-space:nowrap; pointer-events:none; }
.ccx-pet-bubble.needs { border-color:var(--dsw-alias-state-warn-primary); color:var(--dsw-alias-state-warn-label); }
.ccx-pet-body { width:64px; height:64px; cursor:grab; color:var(--dsw-alias-state-business-primary); filter:drop-shadow(0 4px 10px rgba(0,0,0,.25)); }
.ccx-pet-body:active { cursor:grabbing; }
.ccx-pet-body svg { width:100%; height:100%; display:block; }
.ccx-pet-anim { transform-origin:50% 90%; }
/* Base animations by state */
.ccx-pet[data-state="idle"] .ccx-pet-anim { animation:ccx-pet-idle 3.2s ease-in-out infinite; }
.ccx-pet[data-state="thinking"] .ccx-pet-anim { animation:ccx-pet-think 1.6s ease-in-out infinite; }
.ccx-pet[data-state="working"] .ccx-pet-anim { animation:ccx-pet-work .7s ease-in-out infinite; }
.ccx-pet[data-state="needs"] .ccx-pet-anim { animation:ccx-pet-needs .5s ease-in-out infinite; color:var(--dsw-alias-state-warn-primary); }
/* Skin-specific idle animations */
.ccx-pet[data-skin="dog"][data-state="idle"] .ccx-pet-anim { animation:ccx-dog-idle 2.8s ease-in-out infinite; }
.ccx-pet[data-skin="robot"][data-state="idle"] .ccx-pet-anim { animation:ccx-robot-idle 4s ease-in-out infinite; }
.ccx-pet[data-skin="ghost"][data-state="idle"] .ccx-pet-anim { animation:ccx-ghost-idle 3.5s ease-in-out infinite; }
/* Skin-specific working animations */
.ccx-pet[data-skin="dog"][data-state="working"] .ccx-pet-anim { animation:ccx-dog-work .5s ease-in-out infinite; }
.ccx-pet[data-skin="robot"][data-state="working"] .ccx-pet-anim { animation:ccx-robot-work .4s steps(2) infinite; }
.ccx-pet[data-skin="ghost"][data-state="working"] .ccx-pet-anim { animation:ccx-ghost-work 1s ease-in-out infinite; }
/* Keyframes */
@keyframes ccx-pet-idle { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-2px) } }
@keyframes ccx-pet-think { 0%,100% { transform:rotate(0deg) } 30% { transform:rotate(-4deg) } 70% { transform:rotate(4deg) } }
@keyframes ccx-pet-work { 0%,100% { transform:translateY(0) scale(1) } 50% { transform:translateY(-5px) scale(1.03) } }
@keyframes ccx-pet-needs { 0%,100% { transform:translateX(0) } 25% { transform:translateX(-3px) } 75% { transform:translateX(3px) } }
@keyframes ccx-dog-idle { 0%,100% { transform:translateY(0) rotate(0deg) } 25% { transform:translateY(-1px) rotate(-2deg) } 75% { transform:translateY(-1px) rotate(2deg) } }
@keyframes ccx-dog-work { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-8px) } }
@keyframes ccx-robot-idle { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-1px) } }
@keyframes ccx-robot-work { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-3px) } }
@keyframes ccx-ghost-idle { 0%,100% { transform:translateY(0) scaleX(1) } 50% { transform:translateY(-4px) scaleX(1.02) } }
@keyframes ccx-ghost-work { 0%,100% { transform:translateY(0) rotate(0deg) } 25% { transform:translateY(-6px) rotate(-3deg) } 75% { transform:translateY(-6px) rotate(3deg) } }
.ccx-pet-dots span { animation:ccx-dot 1.2s infinite; }
.ccx-pet-dots span:nth-child(2) { animation-delay:.2s }
.ccx-pet-dots span:nth-child(3) { animation-delay:.4s }
@keyframes ccx-dot { 0%,60%,100% { opacity:.25 } 30% { opacity:1 } }
.ccx-note { font-size:12px; color:var(--dsw-alias-label-caption); }
.ccx-refresh { margin-left:auto; }
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
			if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
			if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
			if (n >= 1e4) return (n / 1e3).toFixed(1) + "K";
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
							: stats.files.map((f) => h("div", { key: f.file, className: "ccx-git-file", title: f.file },
								h("span", { className: "ccx-git-file-path" }, f.file),
								h("span", { className: "ccx-git-add" }, "+" + f.added),
								h("span", { className: "ccx-git-del" }, "−" + f.deleted))),
						stats.untracked > 0 ? h("div", { className: "ccx-git-empty" }, "另有 " + stats.untracked + " 个未跟踪文件。") : null,
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
						h("div", { className: "ccx-group-hint" }, "右下角浮动宠物，随会话状态切换动画；可拖拽移动、点击固定气泡。"),
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
									h("span", { style: { fontSize: "24px" } }, skin.icon),
									h("span", null, skin.label)),
							)),
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
		const PET_POS_KEY = "dsh-codex-clone:pet-position:v1";
		function makePetWidget(ctx, useConfig) {
			return function PetWidget() {
				const cfg = useConfig();
				const state = useSyncExternalStore(
					(fn) => petStore.subscribe(fn),
					() => petStore.get(),
					() => petStore.get(),
				);
				const [pinned, setPinned] = useState(false);
				const [hover, setHover] = useState(false);
				const [pos, setPos] = useState(() => {
					try {
						const saved = localStorage.getItem(PET_POS_KEY);
						if (saved) return JSON.parse(saved);
					} catch { /* ignore */ }
					return { x: window.innerWidth - 84, y: window.innerHeight - 84 };
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
						const newX = Math.max(0, Math.min(window.innerWidth - 64, dragRef.current.startPosX + dx));
						const newY = Math.max(0, Math.min(window.innerHeight - 64, dragRef.current.startPosY + dy));
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
						title: "Codex 宠物 · 拖拽移动 · 点击固定/收起状态气泡",
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

		/** Render pet SVG based on skin and state. */
		function renderPetSvg(skin, stateKind) {
			const eyeOpen = stateKind === "idle" || stateKind === "needs";
			const eyeSize = stateKind === "needs" ? 3 : 2;
			const mouthPath = stateKind === "working" ? "M26 31q4 3 8 0" : stateKind === "needs" ? "M27 32q3-2 6 0" : "M28 31q2 2 4 0";

			if (skin === "dog") {
				return h("svg", { viewBox: "0 0 64 64", fill: "none", xmlns: "http://www.w3.org/2000/svg" },
					h("path", { d: "M48 48c5-1 8-6 6-11", stroke: "currentColor", strokeWidth: "4", strokeLinecap: "round", opacity: ".7" }),
					h("ellipse", { cx: "32", cy: "48", rx: "16", ry: "11", fill: "currentColor", opacity: ".85" }),
					h("circle", { cx: "32", cy: "28", r: "14", fill: "currentColor" }),
					// Floppy ears
					h("path", { d: "M18 22c-4-2-6-8-4-12 2-2 6 0 8 4z", fill: "currentColor" }),
					h("path", { d: "M46 22c4-2 6-8 4-12-2-2-6 0-8 4z", fill: "currentColor" }),
					// Snout
					h("ellipse", { cx: "32", cy: "34", rx: "6", ry: "4", fill: "var(--dsw-alias-bg-base)", opacity: ".3" }),
					h("circle", { cx: "32", cy: "32", r: "2.5", fill: "var(--dsw-alias-bg-base)" }),
					// Eyes
					eyeOpen
						? h(React.Fragment, null,
							h("circle", { cx: "26", cy: "26", r: String(eyeSize), fill: "var(--dsw-alias-bg-base)" }),
							h("circle", { cx: "38", cy: "26", r: String(eyeSize), fill: "var(--dsw-alias-bg-base)" }))
						: h(React.Fragment, null,
							h("path", { d: "M23 26h6", stroke: "var(--dsw-alias-bg-base)", strokeWidth: "2", strokeLinecap: "round" }),
							h("path", { d: "M35 26h6", stroke: "var(--dsw-alias-bg-base)", strokeWidth: "2", strokeLinecap: "round" })),
					// Mouth
					h("path", { d: mouthPath, stroke: "var(--dsw-alias-bg-base)", strokeWidth: "1.5", strokeLinecap: "round", fill: "none" }),
					// Tongue when working
					stateKind === "working" ? h("path", { d: "M30 34q2 4 4 0", fill: "var(--dsw-alias-state-error-primary)", opacity: ".6" }) : null,
				);
			}

			if (skin === "robot") {
				return h("svg", { viewBox: "0 0 64 64", fill: "none", xmlns: "http://www.w3.org/2000/svg" },
					// Antenna
					h("line", { x1: "32", y1: "8", x2: "32", y2: "14", stroke: "currentColor", strokeWidth: "2" }),
					h("circle", { cx: "32", cy: "6", r: "3", fill: stateKind === "working" ? "var(--dsw-alias-state-success-primary)" : "currentColor" }),
					// Body
					h("rect", { x: "18", y: "38", width: "28", height: "18", rx: "4", fill: "currentColor", opacity: ".85" }),
					// Head
					h("rect", { x: "16", y: "14", width: "32", height: "26", rx: "6", fill: "currentColor" }),
					// Screen face
					h("rect", { x: "20", y: "18", width: "24", height: "16", rx: "3", fill: "var(--dsw-alias-bg-base)", opacity: ".2" }),
					// Eyes - LED style
					eyeOpen
						? h(React.Fragment, null,
							h("rect", { x: "24", y: "23", width: "4", height: "4", rx: "1", fill: "var(--dsw-alias-state-business-primary)" }),
							h("rect", { x: "36", y: "23", width: "4", height: "4", rx: "1", fill: "var(--dsw-alias-state-business-primary)" }))
						: h(React.Fragment, null,
							h("line", { x1: "24", y1: "25", x2: "28", y2: "25", stroke: "var(--dsw-alias-state-business-primary)", strokeWidth: "2" }),
							h("line", { x1: "36", y1: "25", x2: "40", y2: "25", stroke: "var(--dsw-alias-state-business-primary)", strokeWidth: "2" })),
					// Mouth - digital display
					h("rect", { x: "28", y: "30", width: "8", height: "2", rx: "1", fill: "var(--dsw-alias-state-business-primary)", opacity: ".6" }),
					// Arms
					h("rect", { x: "12", y: "40", width: "4", height: "12", rx: "2", fill: "currentColor", opacity: ".7" }),
					h("rect", { x: "48", y: "40", width: "4", height: "12", rx: "2", fill: "currentColor", opacity: ".7" }),
					// Working animation - blinking lights
					stateKind === "working" ? h(React.Fragment, null,
						h("circle", { cx: "22", cy: "44", r: "2", fill: "var(--dsw-alias-state-success-primary)", opacity: ".8" }),
						h("circle", { cx: "42", cy: "44", r: "2", fill: "var(--dsw-alias-state-warn-primary)", opacity: ".8" }),
					) : null,
				);
			}

			if (skin === "ghost") {
				return h("svg", { viewBox: "0 0 64 64", fill: "none", xmlns: "http://www.w3.org/2000/svg" },
					// Ghost body with wavy bottom
					h("path", {
						d: "M32 12c-10 0-16 8-16 18v16c0 2 2 4 4 2s4-2 6 0 4 2 6 0 4-2 6 0 4 2 6 0 4-2 4-2V30c0-10-6-18-16-18z",
						fill: "currentColor",
						opacity: ".9",
					}),
					// Eyes - big and round
					eyeOpen
						? h(React.Fragment, null,
							h("circle", { cx: "26", cy: "28", r: "4", fill: "var(--dsw-alias-bg-base)" }),
							h("circle", { cx: "38", cy: "28", r: "4", fill: "var(--dsw-alias-bg-base)" }),
							h("circle", { cx: "27", cy: "27", r: "1.5", fill: "currentColor" }),
							h("circle", { cx: "39", cy: "27", r: "1.5", fill: "currentColor" }))
						: h(React.Fragment, null,
							h("path", { d: "M22 28q4-2 8 0", stroke: "var(--dsw-alias-bg-base)", strokeWidth: "2", fill: "none" }),
							h("path", { d: "M34 28q4-2 8 0", stroke: "var(--dsw-alias-bg-base)", strokeWidth: "2", fill: "none" })),
					// Mouth - O shape when needs attention
					stateKind === "needs"
						? h("circle", { cx: "32", cy: "36", r: "3", fill: "var(--dsw-alias-bg-base)" })
						: h("path", { d: "M28 36q4 3 8 0", stroke: "var(--dsw-alias-bg-base)", strokeWidth: "1.5", fill: "none" }),
					// Blush
					h("circle", { cx: "22", cy: "32", r: "2", fill: "var(--dsw-alias-state-error-primary)", opacity: ".3" }),
					h("circle", { cx: "42", cy: "32", r: "2", fill: "var(--dsw-alias-state-error-primary)", opacity: ".3" }),
				);
			}

			// Default: cat
			return h("svg", { viewBox: "0 0 64 64", fill: "none", xmlns: "http://www.w3.org/2000/svg" },
				h("path", { d: "M50 46c6-2 9-8 7-13", stroke: "currentColor", strokeWidth: "4", strokeLinecap: "round", opacity: ".7" }),
				h("ellipse", { cx: "32", cy: "46", rx: "17", ry: "12", fill: "currentColor", opacity: ".85" }),
				h("circle", { cx: "30", cy: "26", r: "13", fill: "currentColor" }),
				h("path", { d: "M20 18l-3-9 9 4z", fill: "currentColor" }),
				h("path", { d: "M40 18l3-9-9 4z", fill: "currentColor" }),
				h("path", { d: "M20.5 16.5l-1.5-4.5 4.5 2z", fill: "var(--dsw-alias-bg-base)", opacity: ".6" }),
				h("path", { d: "M39.5 16.5l1.5-4.5-4.5 2z", fill: "var(--dsw-alias-bg-base)", opacity: ".6" }),
				eyeOpen
					? h(React.Fragment, null,
						h("circle", { cx: "25", cy: "26", r: String(eyeSize), fill: "var(--dsw-alias-bg-base)" }),
						h("circle", { cx: "35", cy: "26", r: String(eyeSize), fill: "var(--dsw-alias-bg-base)" }))
					: h(React.Fragment, null,
						h("path", { d: "M22 26h6", stroke: "var(--dsw-alias-bg-base)", strokeWidth: "2", strokeLinecap: "round" }),
						h("path", { d: "M32 26h6", stroke: "var(--dsw-alias-bg-base)", strokeWidth: "2", strokeLinecap: "round" })),
				h("path", { d: mouthPath, stroke: "var(--dsw-alias-bg-base)", strokeWidth: "1.5", strokeLinecap: "round", fill: "none" }),
				h("circle", { cx: "21", cy: "30", r: "2", fill: "var(--dsw-alias-state-error-primary)", opacity: ".35" }),
				h("circle", { cx: "39", cy: "30", r: "2", fill: "var(--dsw-alias-state-error-primary)", opacity: ".35" }),
				// Whiskers
				h("line", { x1: "14", y1: "28", x2: "20", y2: "29", stroke: "currentColor", strokeWidth: "1", opacity: ".5" }),
				h("line", { x1: "14", y1: "32", x2: "20", y2: "31", stroke: "currentColor", strokeWidth: "1", opacity: ".5" }),
				h("line", { x1: "50", y1: "28", x2: "44", y2: "29", stroke: "currentColor", strokeWidth: "1", opacity: ".5" }),
				h("line", { x1: "50", y1: "32", x2: "44", y2: "31", stroke: "currentColor", strokeWidth: "1", opacity: ".5" }),
			);
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
			// month labels (grid row 1)
			let lastMonth = -1;
			for (let w = 0; w < weeks; w += 1) {
				const cell = cells[w * 7];
				const month = new Date(cell.iso + "T00:00:00").getMonth();
				if (month !== lastMonth) {
					children.push(h("span", { key: "m" + w, className: "ccx-heat-month", style: { gridColumn: w + 2, gridRow: 1 } }, (month + 1) + "月"));
					lastMonth = month;
				}
			}
			// weekday labels (grid column 1)
			["一", "三", "五"].forEach((label, i) => {
				children.push(h("span", { key: "d" + label, className: "ccx-heat-daylabel", style: { gridColumn: 1, gridRow: i * 2 + 2 } }, label));
			});
			// day cells
			for (let w = 0; w < weeks; w += 1) {
				for (let r = 0; r < 7; r += 1) {
					const cell = cells[w * 7 + r];
					const level = cell.tokens <= 0 || max <= 0 ? 0 : Math.ceil((cell.tokens / max) * 4);
					children.push(h("span", {
						key: cell.iso,
						className: "ccx-cell",
						style: {
							gridColumn: w + 2,
							gridRow: r + 2,
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
					h("span", { className: "ccx-tooltip-value" }, formatTokens(tooltip.tokens) + " tokens"),
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
					h("span", { className: "ccx-tooltip-value" }, formatTokens(tooltip.tokens) + " tokens"),
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
				h("div", { className: "ccx-note" }, "累计曲线 · 近 " + Math.min(180, Object.keys(daily).length) + " 天 · 合计 " + formatTokens(total) + " tokens"),
			);
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
								stats?.memberSince ? "加入于 " + new Date(stats.memberSince).toLocaleDateString() + " · 活跃 " + activeDays + " 天 · " + (stats.sessionCount ?? 0) + " 个会话" : "DeepSeek Harness · Codex 风格"),
						),
						h("button", { type: "button", className: "ccx-btn ccx-refresh", onClick: refresh }, "刷新"),
					),
					h("div", { className: "ccx-statgrid" },
						h("div", { className: "ccx-stat" },
							h("div", { className: "ccx-stat-value" }, stats ? formatTokens(stats.totalTokens) : "…"),
							h("div", { className: "ccx-stat-label" }, "累计 Tokens")),
						h("div", { className: "ccx-stat" },
							h("div", { className: "ccx-stat-value" }, stats ? formatTokens(stats.peakTokens) : "…"),
							h("div", { className: "ccx-stat-label" }, "峰值 Tokens / 单请求")),
						h("div", { className: "ccx-stat" },
							h("div", { className: "ccx-stat-value" }, stats ? formatDuration(stats.longestChatMs) : "…"),
							h("div", { className: "ccx-stat-label" }, "最长聊天时长")),
						h("div", { className: "ccx-stat" },
							h("div", { className: "ccx-stat-value" }, stats ? stats.currentStreak + " 天" : "…"),
							h("div", { className: "ccx-stat-label" }, "当前连续")),
						h("div", { className: "ccx-stat" },
							h("div", { className: "ccx-stat-value" }, stats ? stats.longestStreak + " 天" : "…"),
							h("div", { className: "ccx-stat-label" }, "最长连续")),
					),
					h("div", { className: "ccx-group" },
						h("div", { className: "ccx-heat-head" },
							h("div", { className: "ccx-group-title" }, "活动热力图"),
							h("div", { className: "ccx-seg" },
								h("button", { type: "button", className: mode === "daily" ? "on" : "", onClick: () => setMode("daily") }, "每日"),
								h("button", { type: "button", className: mode === "weekly" ? "on" : "", onClick: () => setMode("weekly") }, "每周"),
								h("button", { type: "button", className: mode === "total" ? "on" : "", onClick: () => setMode("total") }, "累计")),
						),
						stats === null
							? h("div", { className: "ccx-note" }, "正在加载活动数据…")
							: mode === "daily"
								? h(React.Fragment, null,
									h(DailyHeatmap, { daily }),
									h("div", { className: "ccx-heat-legend" },
										h("span", null, "少"),
										[0, 1, 2, 3, 4].map((lv) => h("span", { key: lv, className: "ccx-cell", style: { background: levelColor(lv) } })),
										h("span", null, "多")))
								: mode === "weekly"
									? h(WeeklyBars, { daily })
									: h(CumulativeChart, { daily }),
					),
				);
			};
		}
		//#endregion

		//#region apply
		const CONFIG_STORAGE_KEY = "dsh-codex-clone:config:v1";
		const CONFIG_DEFAULTS = {
			themeFlavor: "mocha",
			backgroundImage: "",
			backgroundOpacity: 0.3,
			username: "",
			avatar: "",
			quickPrompts: [],
			petEnabled: true,
			petSkin: "cat",
			wideChat: false,
		};
		/**
		 * Client-side config store persisted in localStorage. The Web API only
		 * exposes a fixed allow-list of settings namespaces to the browser, so
		 * this plugin owns its persistence directly.
		 */
		function makeConfigStore() {
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
			ctx.effect(installStyles, "codex-clone: stylesheet");
			const config = makeConfigStore();
			// cross-tab sync: another tab's write re-reads storage in place
			if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
				ctx.effect(() => {
					const onStorage = (event) => { if (event.key === CONFIG_STORAGE_KEY) config.syncFromStorage(); };
					window.addEventListener("storage", onStorage);
					return () => window.removeEventListener("storage", onStorage);
				}, "codex-clone: config cross-tab sync");
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
				}), "codex-clone: theme " + id);
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
						console.error("[codex-clone] setTheme failed", flavor, String(error));
					}
				};
				applyFlavor();
				const retries = [400, 1200, 3000].map((ms) => ctx.timeout(applyFlavor, ms));
				const offConfig = config.subscribe(applyFlavor);
				return () => {
					for (const dispose of retries) dispose();
					offConfig();
				};
			}, "codex-clone: theme flavor preference");

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
					wallpaperDisposer = ctx.theme.overrideTokens("codex-clone-wallpaper", {
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
			}, "codex-clone: wallpaper");

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
			}, "codex-clone: wide chat mode");

			// Settings pages.
			const AppearanceSection = makeAppearanceSection(ctx, config, useConfig);
			const ProfileSection = makeProfileSection(ctx, config, useConfig);
			ctx.effect(() => ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "codex-appearance",
				order: 90,
				label: () => "外观设置",
			}, AppearanceSection)), "codex-clone: appearance settings");
			ctx.effect(() => ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "codex-profile",
				order: 91,
				label: () => "个人资料",
			}, ProfileSection)), "codex-clone: profile settings");

			// Home quick-prompt cards above the composer (hero phase only).
			const HomeCards = makeHomeCards(ctx, config, useConfig);
			ctx.effect(() => ctx.slots.inject("conversation.input.dock", () => ctx.slots.register({
				name: "conversation.input.dock",
				id: "codex-home-cards",
				order: -10,
			}, HomeCards)), "codex-clone: home cards");

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
			}, CardsRow)), "codex-clone: cards row");

			// Pet: session-scoped state bridge + root-scoped floating widget.
			ctx.effect(() => ctx.slots.inject("conversation.input.dock", () => ctx.slots.register({
				name: "conversation.input.dock",
				id: "codex-pet-bridge",
				order: 30,
			}, PetBridge)), "codex-clone: pet state bridge");
			// Download button mover: watches DOM and moves download button to bottom-right.
			ctx.effect(() => ctx.slots.inject("conversation.input.dock", () => ctx.slots.register({
				name: "conversation.input.dock",
				id: "codex-download-mover",
				order: 31,
			}, DownloadButtonMover)), "codex-clone: download button mover");
			const PetWidget = makePetWidget(ctx, useConfig);
			ctx.effect(() => ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "codex-pet",
				order: 50,
			}, PetWidget)), "codex-clone: pet widget");

			// '$' skills menu in the composer overlay.
			const SkillDollarMenu = makeSkillDollarMenu(ctx);
			ctx.effect(() => ctx.slots.inject("conversation.input.overlay", () => ctx.slots.register({
				name: "conversation.input.overlay",
				id: "codex-skill-dollar",
				order: 10,
			}, SkillDollarMenu)), "codex-clone: dollar skill menu");
		}
		//#endregion

		exports.inject = inject;
		exports.apply = apply;
		return module.exports;
	},
});

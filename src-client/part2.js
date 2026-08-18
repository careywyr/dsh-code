
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


		//#region GitCard
		function makeGitCard(ctx) {
			return function GitCard(props) {
				const sessionId = props.sessionId;
				const cwd = props.useSession((s) => s.cwd);
				const [stats, setStats] = useState(null);
				const [open, setOpen] = useState(false);
				const rootRef = useRef(null);
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
				if (stats === null || stats.isRepo !== true) return null;
				const dirty = stats.added > 0 || stats.deleted > 0 || stats.changed > 0 || stats.untracked > 0;
				return h("div", { className: "ccx-git", ref: rootRef },
					h("button", {
						type: "button",
						className: "ccx-git-pill",
						title: dirty ? "点击查看变更文件" : "工作区干净",
						onClick: () => setOpen((v) => !v),
					},
						h("span", { className: "ccx-git-dot" + (dirty ? "" : " clean") }),
						h("span", { className: "ccx-git-branch" }, stats.branch || "HEAD"),
						dirty
							? h(React.Fragment, null,
								h("span", { className: "ccx-git-add" }, "+" + stats.added),
								h("span", { className: "ccx-git-del" }, "−" + stats.deleted),
								h("span", { className: "ccx-git-files" }, (stats.changed + stats.untracked) + " 文件"))
							: h("span", { className: "ccx-git-files" }, "已同步"),
					),
					open ? h("div", { className: "ccx-git-pop" },
						h("div", { className: "ccx-git-pop-title" },
							"工作区变更 · " + (stats.changed + stats.untracked) + " 个文件 · +" + stats.added + " −" + stats.deleted + (stats.untracked > 0 ? " · " + stats.untracked + " 未跟踪" : "")),
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
				const cwd = props.useSession((s) => s.cwd);
				const cfg = useConfig();
				if (blank !== true) return null;
				const now = new Date();
				const name = typeof cfg.username === "string" && cfg.username !== "" ? cfg.username : "";
				const cards = Array.isArray(cfg.quickPrompts) && cfg.quickPrompts.length > 0 ? cfg.quickPrompts : DEFAULT_PROMPTS;
				const dirName = typeof cwd === "string" && cwd !== "" ? cwd.split("/").filter(Boolean).pop() : "";
				return h("div", { className: "ccx-homecards" },
					h("div", { className: "ccx-greet" },
						h("div", { className: "ccx-greet-title" }, greetingOfHour(now.getHours()) + (name !== "" ? "，" + name : "") + " 👋"),
						dirName !== "" ? h("div", { className: "ccx-greet-sub" }, "📁 " + dirName) : null,
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
				);
			};
		}
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

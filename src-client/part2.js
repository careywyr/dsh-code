
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

		//#region FileMention (@ 文件快捷引用)
		const CCX_MENTION_LS_KEY = "dsh-codex-clone:mentions:v1";

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
						console.warn("codex-clone: @ file source registration failed:", error);
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
		const PET_POS_KEY = "dsh-codex-clone:pet-position:v1";
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

		const DEPRESSO_IMG = "data:image/webp;base64,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";
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

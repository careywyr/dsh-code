
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

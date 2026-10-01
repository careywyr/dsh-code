
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
		/** Keep a chart tooltip inside its container: clamp the anchored x so the
		 *  bubble never overflows the left/right edges (right-most cells used to
		 *  render it half cut off), and flip it below the anchor when there is no
		 *  room above. Runs as a layout effect so the corrected position paints in
		 *  the very first frame. */
		function useClampedTooltip(tooltip, setTooltip, containerRef, tipRef) {
			useLayoutEffect(() => {
				if (tooltip === null || tooltip.clamped === true) return;
				const tip = tipRef.current;
				const box = containerRef.current;
				if (tip === null || box === null) return;
				const half = tip.offsetWidth / 2;
				const minX = half + 2;
				const maxX = Math.max(minX, box.clientWidth - half - 2);
				const x = Math.min(Math.max(tooltip.x, minX), maxX);
				let y = tooltip.y;
				let below = tooltip.below === true;
				if (!below && y - tip.offsetHeight < 4) {
					below = true;
					y = tooltip.anchorBottom;
				}
				setTooltip({ ...tooltip, x, y, below, clamped: true });
			}, [tooltip]);
		}
		function DailyHeatmap({ daily }) {
			const weeks = 52;
			const { cells, max } = useMemo(() => buildDailyCells(daily, weeks), [daily]);
			const [tooltip, setTooltip] = useState(null); // { x, y, anchorBottom, iso, tokens }
			const containerRef = useRef(null);
			const tooltipRef = useRef(null);
			useClampedTooltip(tooltip, setTooltip, containerRef, tooltipRef);
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
									y: rect.top - containerRect.top - 6,
									anchorBottom: rect.bottom - containerRect.top + 6,
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
					ref: tooltipRef,
					style: { left: tooltip.x + "px", top: tooltip.y + "px", transform: tooltip.below === true ? "translate(-50%, 0)" : "translate(-50%, -100%)" },
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
			const [tooltip, setTooltip] = useState(null); // { x, y, anchorBottom, iso, tokens }
			const containerRef = useRef(null);
			const tooltipRef = useRef(null);
			useClampedTooltip(tooltip, setTooltip, containerRef, tooltipRef);
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
								y: rect.top - containerRect.top - 6,
								anchorBottom: rect.bottom - containerRect.top + 6,
								iso: d.iso,
								tokens: d.tokens,
							});
						}
					},
					onMouseLeave: () => setTooltip(null),
				})),
				tooltip ? h("div", {
					className: "ccx-tooltip visible",
					ref: tooltipRef,
					style: { left: tooltip.x + "px", top: tooltip.y + "px", transform: tooltip.below === true ? "translate(-50%, 0)" : "translate(-50%, -100%)" },
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
		/* Last stats payload is kept in localStorage (keyed by timezone offset) so
		 * reopening the profile page paints real data instantly instead of "…"
		 * while the host recomputes; the fresh fetch then quietly replaces it. */
		const STATS_CACHE_KEY = "dsh-code:stats";
		function statsTz() { return new Date().getTimezoneOffset(); }
		function readStatsCache() {
			try {
				const raw = localStorage.getItem(STATS_CACHE_KEY);
				if (raw === null) return null;
				const parsed = JSON.parse(raw);
				if (parsed === null || typeof parsed !== "object" || parsed.tz !== statsTz() || parsed.data === null || typeof parsed.data !== "object") return null;
				return parsed.data;
			} catch { return null; }
		}
		function writeStatsCache(data) {
			try { localStorage.setItem(STATS_CACHE_KEY, JSON.stringify({ at: Date.now(), tz: statsTz(), data })); } catch { /* storage blocked/full */ }
		}
		function makeProfileSection(ctx, config, useConfig) {
			return function ProfileSection() {
				const cfg = useConfig();
				const [stats, setStats] = useState(readStatsCache);
				const [mode, setMode] = useState("daily");
				const [nameDraft, setNameDraft] = useState(null);
				const avatarRef = useRef(null);
				useEffect(() => {
					let alive = true;
					(async () => {
						try {
							const res = await fetch("/__codex/stats?tz=" + statsTz());
							if (res.ok) {
								const data = await res.json();
								if (alive && data !== null && data.error === undefined) {
									setStats(data);
									writeStatsCache(data);
								}
							}
						} catch { /* host route unavailable */ }
					})();
					return () => { alive = false; };
				}, []);
				const refresh = async () => {
					try {
						const res = await fetch("/__codex/stats?tz=" + statsTz() + "&r=" + Date.now());
						if (res.ok) {
							const data = await res.json();
							if (data !== null && data.error === undefined) {
								setStats(data);
								writeStatsCache(data);
							}
						}
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

		//#region FeishuSection
		const FEISHU_DEFAULT_DRAFT = {
			enabled: false,
			appId: "",
			appSecret: "",
			targets: [],
			allowedOpenIds: [],
			pushOn: { turnEnd: true, approval: true, question: true, error: true },
			pushFormat: "card",
			replyMaxChars: 2000,
		};
		const FEISHU_STATE_LABEL = {
			idle: "未启动", connecting: "连接中…", connected: "已连接",
			reconnecting: "重连中…", restarting: "重启中…", error: "连接出错", stopped: "已停止",
		};
		/** Feishu bot settings + status console (host-backed: the credentials and
		 *  the long connection live in the dsh process, not in the browser). */
		function makeFeishuSection() {
			return function FeishuSection() {
				const [draft, setDraft] = useState(null); // null = loading
				const [loadError, setLoadError] = useState("");
				const [status, setStatus] = useState(null);
				const [busy, setBusy] = useState("");
				const [notice, setNotice] = useState(null); // { ok, text }

				const loadConfig = async () => {
					try {
						const res = await fetch("/__codex/feishu/config");
						if (!res.ok) {
							setDraft(null);
							setLoadError(res.status === 404 || res.status === 503 ? "飞书服务未就绪：请重启 dsh web 后再配置" : "配置读取失败（HTTP " + res.status + "）");
							return;
						}
						const data = await res.json();
						const cfg = { ...FEISHU_DEFAULT_DRAFT, ...(data.config ?? {}) };
						cfg.targets = Array.isArray(cfg.targets) ? cfg.targets : [];
						cfg.allowedOpenIds = Array.isArray(cfg.allowedOpenIds) ? cfg.allowedOpenIds : [];
						cfg.pushOn = { ...FEISHU_DEFAULT_DRAFT.pushOn, ...(cfg.pushOn ?? {}) };
						setDraft(cfg);
						setLoadError("");
					} catch {
						setDraft(null);
						setLoadError("飞书服务未就绪：请重启 dsh web 后再配置");
					}
				};
				const loadStatus = async () => {
					try {
						const res = await fetch("/__codex/feishu/status");
						if (res.ok) setStatus(await res.json());
					} catch { /* route not up yet */ }
				};
				useEffect(() => {
					void loadConfig();
					void loadStatus();
					const timer = setInterval(loadStatus, 15000);
					return () => clearInterval(timer);
				}, []);

				const set = (patch) => setDraft((prev) => ({ ...prev, ...patch }));
				const save = async () => {
					if (draft === null) return;
					setBusy("save");
					setNotice(null);
					try {
						const payload = {
							config: {
								...draft,
								allowedOpenIds: draft.allowedOpenIds,
							},
						};
						const res = await fetch("/__codex/feishu/config", {
							method: "POST",
							headers: { "content-type": "application/json" },
							body: JSON.stringify(payload),
						});
						const data = await res.json().catch(() => ({}));
						if (res.ok) {
							setNotice({ ok: true, text: "已保存" + (draft.enabled && draft.appId && draft.appSecret ? "，机器人正在重连生效" : "") });
							if (data.config) setDraft({ ...draft, appSecret: data.config.appSecret });
							void loadStatus();
						} else {
							setNotice({ ok: false, text: data.error ?? "保存失败（HTTP " + res.status + "）" });
						}
					} catch (error) {
						setNotice({ ok: false, text: "保存失败：" + String(error?.message ?? error) });
					}
					setBusy("");
				};
				const sendTest = async () => {
					setBusy("test");
					setNotice(null);
					try {
						const res = await fetch("/__codex/feishu/test", { method: "POST" });
						const data = await res.json().catch(() => ({}));
						if (data.ok === true) {
							const failed = (data.results ?? []).filter((r) => r.ok !== true);
							setNotice(failed.length === 0
								? { ok: true, text: "测试消息已发送到全部目标" }
								: { ok: false, text: "部分目标发送失败：" + failed.map((f) => f.error).join("；") });
						} else {
							setNotice({ ok: false, text: data.error ?? "发送失败" });
						}
					} catch (error) {
						setNotice({ ok: false, text: "发送失败：" + String(error?.message ?? error) });
					}
					setBusy("");
				};

				if (draft === null) {
					return h("div", { className: "ccx-section" },
						h("div", { className: "ccx-note" }, loadError !== "" ? loadError : "正在加载飞书配置…"));
				}

				const targets = draft.targets;
				const setTarget = (index, patch) => {
					const next = targets.slice();
					next[index] = { ...next[index], ...patch };
					set({ targets: next });
				};
				const pushOnRow = (key, label) => h("label", { key, className: "ccx-note", style: { display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" } },
					h("input", {
						type: "checkbox",
						checked: draft.pushOn[key] === true,
						onChange: (e) => set({ pushOn: { ...draft.pushOn, [key]: e.target.checked } }),
					}),
					label);
				const bot = status?.bot ?? null;
				const stateLabel = FEISHU_STATE_LABEL[bot?.state] ?? "未启用";
				const conn = bot?.connection ?? null;

				return h("div", { className: "ccx-section" },
					h("div", { className: "ccx-group" },
						h("div", { className: "ccx-group-title" }, "接入凭据"),
						h("label", { className: "ccx-note", style: { display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" } },
							h("input", { type: "checkbox", checked: draft.enabled === true, onChange: (e) => set({ enabled: e.target.checked }) }),
							"启用飞书机器人"),
						h("div", { className: "ccx-row" },
							h("input", { className: "ccx-input", style: { flex: "1 1 220px" }, placeholder: "App ID（cli_ 开头）", value: draft.appId, onChange: (e) => set({ appId: e.target.value }) }),
							h("input", { className: "ccx-input", style: { flex: "1 1 260px" }, type: "password", placeholder: draft.appSecret !== "" ? "已保存（留空保持不变）" : "App Secret", value: draft.appSecret.startsWith("•") ? "" : draft.appSecret, onChange: (e) => set({ appSecret: e.target.value }) })),
						h("div", { className: "ccx-group-hint" }, "飞书开放平台 → 企业自建应用 → 凭证与基础信息；应用需开启机器人能力，事件订阅选择「使用长连接接收事件」并添加 im.message.receive_v1 事件，开通 im:message 权限。")),
					h("div", { className: "ccx-group" },
						h("div", { className: "ccx-group-title" }, "推送目标"),
						h("div", { className: "ccx-group-hint" }, "任务状态会推送到这里列出的用户或群聊。用户填 open_id，群聊填 chat_id（机器人需已加入该群）。"),
						targets.map((target, index) => h("div", { key: index, className: "ccx-row" },
							h("select", { className: "ccx-input", style: { width: "92px" }, value: target.kind === "chat" ? "chat" : "user", onChange: (e) => setTarget(index, { kind: e.target.value }) },
								h("option", { value: "user" }, "用户"),
								h("option", { value: "chat" }, "群聊")),
							h("input", { className: "ccx-input", style: { flex: "1 1 200px" }, placeholder: target.kind === "chat" ? "oc_ 开头的群 chat_id" : "ou_ 开头的 open_id", value: target.id ?? "", onChange: (e) => setTarget(index, { id: e.target.value }) }),
							h("input", { className: "ccx-input", style: { flex: "0 1 140px" }, placeholder: "备注（可选）", value: target.label ?? "", onChange: (e) => setTarget(index, { label: e.target.value }) }),
							h("button", { type: "button", className: "ccx-iconbtn", title: "删除该目标", onClick: () => set({ targets: targets.filter((_, i) => i !== index) }) }, "✕"))),
						h("div", { className: "ccx-row" },
							h("button", { type: "button", className: "ccx-btn", onClick: () => set({ targets: [...targets, { kind: "user", id: "", label: "" }] }) }, "+ 添加用户"),
							h("button", { type: "button", className: "ccx-btn", onClick: () => set({ targets: [...targets, { kind: "chat", id: "", label: "" }] }) }, "+ 添加群聊"))),
					h("div", { className: "ccx-group" },
						h("div", { className: "ccx-group-title" }, "操作白名单"),
						h("div", { className: "ccx-group-hint" }, "允许通过飞书操控 DeepSeek Harness 的用户 open_id，每行一个。白名单为空时任何人都无法操控（发 /id 给机器人可查询自己的 open_id）。"),
						h("textarea", {
							className: "ccx-input",
							style: { width: "100%", minHeight: "64px", height: "auto", padding: "8px 12px", fontFamily: "var(--ds-font-family-code, monospace)", lineHeight: "20px", resize: "vertical" },
							placeholder: "ou_xxxxxxxx（每行一个）",
							value: draft.allowedOpenIds.join("\n"),
							onChange: (e) => set({ allowedOpenIds: e.target.value.split("\n").map((s) => s.trim()).filter((s) => s !== "") }),
						})),
					h("div", { className: "ccx-group" },
						h("div", { className: "ccx-group-title" }, "推送事件"),
						h("div", { className: "ccx-row" },
							pushOnRow("turnEnd", "任务结束（最后一条回复）"),
							pushOnRow("approval", "需要权限审批"),
							pushOnRow("question", "等待回答问题"),
							pushOnRow("error", "任务出错"))),
					h("div", { className: "ccx-group" },
						h("div", { className: "ccx-group-title" }, "推送形态"),
						h("div", { className: "ccx-row" },
							h("select", { className: "ccx-input", style: { width: "180px" }, value: draft.pushFormat === "post" ? "post" : "card", onChange: (e) => set({ pushFormat: e.target.value }) },
								h("option", { value: "card" }, "Markdown 卡片（推荐）"),
								h("option", { value: "post" }, "富文本")),
						),
						h("div", { className: "ccx-group-hint" }, "Markdown 卡片可渲染代码块/列表/加粗，适合展示助手的回复；富文本为纯文本样式，兼容性最好。")),
					h("div", { className: "ccx-group" },
						h("div", { className: "ccx-group-title" }, "推送正文长度"),
						h("div", { className: "ccx-row" },
							h("input", { className: "ccx-input", style: { width: "110px" }, type: "number", min: 200, max: 20000, step: 100, value: draft.replyMaxChars, onChange: (e) => set({ replyMaxChars: Number(e.target.value) || 2000 }) }),
							h("span", { className: "ccx-note" }, "字符，超出部分截断"))),
					h("div", { className: "ccx-row" },
						h("button", { type: "button", className: "ccx-btn primary", onClick: save, disabled: busy !== "" }, busy === "save" ? "保存中…" : "保存"),
						h("button", { type: "button", className: "ccx-btn", onClick: sendTest, disabled: busy !== "" }, busy === "test" ? "发送中…" : "发送测试消息"),
						notice !== null ? h("span", { className: "ccx-note", style: notice.ok ? { color: "var(--dsw-alias-state-success-primary)" } : { color: "var(--dsw-alias-state-error-primary)" } }, notice.text) : null),
					h("div", { className: "ccx-group" },
						h("div", { className: "ccx-group-title" }, "运行状态"),
						h("div", { className: "ccx-note" },
							bot === null
								? (draft.enabled === true ? "未运行：请检查凭据是否已保存" : "未启用")
								: [
									"状态：" + stateLabel,
									conn !== null && conn.state !== undefined ? " · 长连接：" + conn.state + (conn.reconnectAttempts > 0 ? "（重连 " + conn.reconnectAttempts + " 次）" : "") : "",
									" · 已发送 " + (bot.sent ?? 0) + " 条 · 已接收 " + (bot.received ?? 0) + " 条",
									(bot.pendingApprovals ?? 0) + (bot.pendingQuestions ?? 0) > 0 ? " · 待处理审批 " + bot.pendingApprovals + " / 提问 " + bot.pendingQuestions : "",
								].join("")),
						bot !== null && bot.lastError ? h("div", { className: "ccx-note", style: { color: "var(--dsw-alias-state-error-primary)" } }, "最近错误：" + bot.lastError) : null),
					h("div", { className: "ccx-group" },
						h("div", { className: "ccx-group-title" }, "使用说明"),
						h("div", { className: "ccx-note", style: { whiteSpace: "pre-line" } },
							"配置并保存后，机器人通过飞书官方长连接接收消息（无需公网地址）。\n" +
							"单聊里直接发文字即转发给「焦点会话」（等同在界面输入），任务结束后回复会自动推送回来，形成多轮对话。\n" +
							"指令：/list 会话列表 · /use <序号> 切换焦点 · /new <内容> 新建会话 · /cancel 取消回合 · 批准/拒绝 处理审批 · 数字或选项文字 回答提问 · /id 查询 open_id · /help 帮助。\n" +
							"群聊中需要 @机器人 才会响应；直接「回复」某条通知消息可自动定位上下文。")),
				);
			};
		}
		//#endregion

		//#region FeishuStatusWidget
		/** Small paper-plane icon for the sidebar Feishu widget. */
		function FeishuIcon(props) {
			const size = props.size ?? 17;
			return h("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true },
				h("path", { d: "M22 2 11 13" }),
				h("path", { d: "M22 2 15 22l-4-9-9-4Z" }));
		}
		/** Map (enabled, bot) into a dot color + human-readable state line. */
		function feishuStateInfo(enabled, bot) {
			if (enabled !== true) return { dot: "off", text: "未启用", err: false };
			if (bot === null || bot === undefined) return { dot: "warn", text: "未运行（检查凭据）", err: false };
			switch (bot.state) {
				case "connected": return { dot: "ok", text: "已连接", err: false };
				case "connecting": return { dot: "warn", text: "连接中…", err: false };
				case "reconnecting": return { dot: "warn", text: "重连中…", err: false };
				case "restarting": return { dot: "warn", text: "重启中…", err: false };
				case "error": return { dot: "err", text: bot.lastError ? "出错：" + bot.lastError : "连接出错", err: true };
				case "stopped": return { dot: "off", text: "已停止", err: false };
				default: return { dot: "off", text: String(bot.state ?? "未知"), err: false };
			}
		}
		/** Sidebar-footer widget: connection status light + enable/disable switch.
		 *  Renders a full row when the sidebar is wide, an icon-only round button
		 *  (click to toggle) when collapsed to the rail. */
		function makeFeishuStatusWidget() {
			return function FeishuStatusWidget(props) {
				const wide = props.wide !== false;
				const [status, setStatus] = useState(null); // { enabled, bot } | null
				const [busy, setBusy] = useState(false);
				useEffect(() => {
					let alive = true;
					const load = async () => {
						try {
							const res = await fetch("/__codex/feishu/status");
							if (!res.ok) return;
							const data = await res.json();
							if (alive) setStatus({ enabled: data.enabled === true, bot: data.bot ?? null });
						} catch { /* host route not up yet */ }
					};
					void load();
					const timer = setInterval(load, 5000);
					return () => { alive = false; clearInterval(timer); };
				}, []);
				const enabled = status?.enabled === true;
				const info = feishuStateInfo(enabled, status?.bot);
				const toggle = async () => {
					if (busy) return;
					setBusy(true);
					try {
						const res = await fetch("/__codex/feishu/enabled", {
							method: "POST",
							headers: { "content-type": "application/json" },
							body: JSON.stringify({ enabled: !enabled }),
						});
						if (res.ok) setStatus((prev) => ({ enabled: !enabled, bot: prev?.bot ?? null }));
					} catch { /* ignore */ }
					setBusy(false);
				};
				if (!wide) {
					return h("button", {
						type: "button",
						className: "ccx-feishu rail",
						title: "飞书机器人：" + info.text + "（点击" + (enabled ? "关闭" : "开启") + "）",
						"aria-pressed": enabled,
						disabled: busy,
						onClick: toggle,
					},
						h("span", { className: "ccx-feishu-icon" },
							h(FeishuIcon, { size: 18 }),
							h("span", { className: "ccx-feishu-dot " + info.dot })));
				}
				return h("div", { className: "ccx-feishu", title: "飞书机器人状态" },
					h("span", { className: "ccx-feishu-icon" },
						h(FeishuIcon, { size: 17 }),
						h("span", { className: "ccx-feishu-dot " + info.dot })),
					h("span", { className: "ccx-feishu-body" },
						h("span", { className: "ccx-feishu-name" }, "飞书机器人"),
						h("span", { className: "ccx-feishu-state" + (info.err ? " err" : "") }, status === null ? "加载中…" : info.text)),
					h("button", {
						type: "button",
						className: "ccx-feishu-switch" + (enabled ? " on" : ""),
						title: enabled ? "点击关闭飞书机器人" : "点击开启飞书机器人",
						"aria-pressed": enabled,
						disabled: busy,
						onClick: toggle,
					},
						h("span", { className: "ccx-feishu-knob" })));
			};
		}
		//#endregion

		//#region apply
		const CONFIG_STORAGE_KEY = "dsh-code:config:v1";
		/** Pre-rename storage key; migrated once on first load, kept for upgrades. */
		const LEGACY_CONFIG_STORAGE_KEY = "dsh-codex-clone:config:v1";
		const CONFIG_DEFAULTS = {
			lightFlavor: "latte",
			darkFlavor: "mocha",
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
		/**
		 * Upgrade the legacy single `themeFlavor` field to per-scheme flavors
		 * (one-time; the mode itself lives in the shell's theme preference).
		 */
		function migrateThemeConfig(value) {
			if (value.themeFlavor === undefined) return value;
			const legacy = value.themeFlavor;
			const next = { ...value };
			delete next.themeFlavor;
			if (next.lightFlavor === undefined && next.darkFlavor === undefined) {
				if (legacy === "latte") { next.lightFlavor = "latte"; next.darkFlavor = "mocha"; }
				else if (legacy === "frappe" || legacy === "macchiato" || legacy === "mocha") { next.darkFlavor = legacy; next.lightFlavor = "latte"; }
				else { next.lightFlavor = "light"; next.darkFlavor = "dark"; } // system / light / dark
			}
			return next;
		}
		function makeConfigStore() {
			migrateLegacyConfigKey();
			let value = { ...CONFIG_DEFAULTS };
			try {
				const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
				if (raw !== null && raw !== "") value = migrateThemeConfig({ ...value, ...JSON.parse(raw) });
			} catch { /* corrupted or unavailable storage */ }
			try { localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(value)); } catch { /* quota */ }
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

			// Per-scheme flavor palette. The shell owns the appearance mode
			// (light / dark / follow-system — the General settings "外观" row and
			// our own mode cubes both call ctx.theme.setTheme); we only paint each
			// color scheme with its configured Catppuccin flavor, so switching the
			// mode never loses a per-scheme selection. The built-in palettes live
			// in `body{...}` / `body[data-ds-dark-theme]{...}` rules, so our rules
			// use higher-specificity selectors scoped to the matching scheme.
			ctx.effect(() => {
				if (typeof document === "undefined") return () => {};
				const tag = document.createElement("style");
				tag.dataset.plugin = "dsh-code";
				tag.dataset.pluginCss = TAG_ID + ":flavor-palette";
				document.head.appendChild(tag);
				const body = document.body;
				body.classList.add("ccx-flavor-light", "ccx-flavor-dark");
				const tokensCss = (tokens) => Object.entries(tokens).map(([name, val]) => name + ":" + val + ";").join("");
				const applyPalette = () => {
					const cfgValue = config.get();
					const light = CATPPUCCIN[cfgValue.lightFlavor ?? "latte"];
					const dark = CATPPUCCIN[cfgValue.darkFlavor ?? "mocha"];
					let css = "";
					if (light !== undefined) css += "body.ccx-flavor-light:not([data-ds-dark-theme]){" + tokensCss(buildTokens(light.colors, "light")) + "}";
					if (dark !== undefined) css += "body[data-ds-dark-theme].ccx-flavor-dark{" + tokensCss(buildTokens(dark.colors, "dark")) + "}";
					tag.textContent = css;
				};
				applyPalette();
				const offConfig = config.subscribe(applyPalette);
				return () => {
					offConfig();
					tag.remove();
					body.classList.remove("ccx-flavor-light", "ccx-flavor-dark");
				};
			}, "dsh-code: per-scheme flavor palette");

			// Wallpaper: fixed background on <html> + translucent surface tokens.
			let wallpaperDisposer = null;
			let wallpaperKey = null;
			ctx.effect(() => {
				// Translucent surface value for one scheme: the configured Catppuccin
				// flavor when set, otherwise the built-in palette's static color.
				const BUILTIN_WALLPAPER_VARS = {
					light: { base: "--dsw-static-neutral-bluish-00", sidebar: "--dsw-static-neutral-bluish-50" },
					dark: { base: "--dsw-static-neutral-bluish-950", sidebar: "--dsw-static-neutral-bluish-900" },
				};
				const wallValue = (scheme, kind, hex, a) => hex !== null
					? rgba(hex, a)
					: "color-mix(in srgb, var(" + BUILTIN_WALLPAPER_VARS[scheme][kind] + ") " + Math.round(a * 100) + "%, transparent)";
				const applyWallpaper = () => {
					if (typeof document === "undefined") return;
					const cfgValue = config.get();
					const img = cfgValue.backgroundImage ?? "";
					const opacity = Math.max(0.05, Math.min(0.9, Number(cfgValue.backgroundOpacity ?? 0.3)));
					const lightColors = CATPPUCCIN[cfgValue.lightFlavor ?? "latte"]?.colors ?? null;
					const darkColors = CATPPUCCIN[cfgValue.darkFlavor ?? "mocha"]?.colors ?? null;
					// Guard: overrideTokens re-emits theme/change; skip no-op reapplications.
					const key = img + "|" + opacity + "|" + (cfgValue.lightFlavor ?? "latte") + "|" + (cfgValue.darkFlavor ?? "mocha");
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
					const surfaceAlpha = Math.max(0.35, 1 - opacity);
					const sidebarAlpha = Math.min(1, surfaceAlpha + 0.12);
					wallpaperDisposer = ctx.theme.overrideTokens("dsh-code-wallpaper", {
						"--dsw-alias-bg-base": {
							light: wallValue("light", "base", lightColors?.base ?? null, surfaceAlpha),
							dark: wallValue("dark", "base", darkColors?.base ?? null, surfaceAlpha),
						},
						"--dsw-specific-sidebar-fill": {
							light: wallValue("light", "sidebar", lightColors?.crust ?? null, sidebarAlpha),
							dark: wallValue("dark", "sidebar", darkColors?.mantle ?? null, sidebarAlpha),
						},
					});
				};
				applyWallpaper();
				const offConfig = config.subscribe(applyWallpaper);
				return () => {
					offConfig();
					if (wallpaperDisposer !== null) { wallpaperDisposer(); wallpaperDisposer = null; }
					wallpaperKey = null;
				};
			}, "dsh-code: wallpaper");

			// Wide chat mode: <html> carries the flag, the stylesheet raises DSH's
			// width variables on whichever element declares them (see the wide-chat
			// rules in main.css). Pure CSS keeps working across re-renders, session
			// switches, and DSH versions that move the declaration, so no DOM scan
			// or polling is needed here.
			ctx.effect(() => {
				const applyWideChat = () => {
					if (typeof document === "undefined") return;
					document.documentElement.classList.toggle("ccx-wide-chat", config.get().wideChat === true);
				};
				applyWideChat();
				const offConfig = config.subscribe(applyWideChat);
				return () => {
					offConfig();
					if (typeof document !== "undefined") {
						document.documentElement.classList.remove("ccx-wide-chat");
					}
				};
			}, "dsh-code: wide chat mode");

			// Settings pages.
			const AppearanceSection = makeAppearanceSection(ctx, config, useConfig);
			const ProfileSection = makeProfileSection(ctx, config, useConfig);
			const FeishuSection = makeFeishuSection();
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
			ctx.effect(() => ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "codex-feishu",
				order: 92,
				label: () => "飞书机器人",
			}, FeishuSection)), "dsh-code: feishu bot settings");

			// Feishu bot status light + enable/disable switch at the sidebar footer.
			const FeishuStatusWidget = makeFeishuStatusWidget();
			ctx.effect(() => ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
				name: "sidebar.footer.action",
				id: "codex-feishu-status",
				order: 50,
			}, FeishuStatusWidget)), "dsh-code: feishu sidebar status widget");

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

			// Git change-stats card - in input dock but visually positioned below tab bar.
			// (The agents card was removed: the left sidebar already lists subagents.)
			const GitCard = makeGitCard(ctx);
			// Wrapper component to display cards in a horizontal row
			function CardsRow(props) {
				return h("div", { className: "ccx-cards-row" },
					h(GitCard, props),
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

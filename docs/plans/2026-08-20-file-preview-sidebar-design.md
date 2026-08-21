# 文件预览侧栏（File Preview Sidebar）

日期：2026-08-20 · 状态：已实现

## 目标

无论是对话内容中提到的文件，还是右上角 Git 变更卡片（GitCard）中列出的文件，
点击后在右侧打开推挤式侧边栏即时预览，并按文件类型做对应渲染（Markdown、
代码、图片等）。

## 组成

1. **宿主路由** `GET /__codex/file?path=<p>[&cwd=…|session=…]`（`lib/index.js`）
   - 相对路径按会话工作区（`session` → 会话 cwd，或显式 `cwd`）解析，支持 `~/` 展开；
   - 文本上限 1.5 MB、图片上限 6 MB（base64 返回，供 data URL 内联）；
   - NUL 字节嗅探判定二进制；目录返回浅层条目列表；
   - 顺带：`/__codex/git` 现在把未跟踪文件（`git ls-files --others`）并入 `files`
     列表（`untracked: true`），GitCard 因此可以列出并点开它们。
2. **点击接入**（客户端，`src-client/part2.js`）
   - document 级 capture 点击拦截：
     - 回合尾部「产出文件」芯片（`[data-produced-files-row]` 内按钮）与原生
       「生成的文件」mention 按钮（`*fileMention*` class）改为打开侧边栏，不再走
       系统 `openPath`；二者完整路径都在 `title` 属性（可见文本只是 basename）；
     - **聊天内工具卡片（read/write/edit 等）摘要里的文件链接**（`*fileLink*`
       class）同样拦截；其可见文本即会话工作区相对路径，直接作为预览路径；
     - 「在文件夹中显示」按钮保持原生；
     - 会话视图（`[data-phase]`）内形似路径的行内 `<code>`（含 `/` 或已知扩展名，
       无空格、非 URL）也可点击；hover 时加虚线下划线提示（`ccx-filehint`）；
   - GitCard 文件行整行可点击，未跟踪文件显示「未跟踪」徽标；点击打开的是
     IDEA 风格的两栏 git diff（见文末「Git 变更对比」一节），不再是普通文件预览。
   - **侧边栏与会话绑定**：切换到其它会话自动关闭（store.setSession 检测
     sessionId 变化）。
3. **侧边栏面板**（`shell.overlay` 插槽，推挤式）
   - 打开时给 `<html>` 加 `ccx-fp-open` 并设 `--ccx-fp-w`，`#root` 让出宽度，
     整个 shell 左移；左缘拖拽调宽（360px–82vw，localStorage 记忆）；`Esc`/✕ 关闭；
   - **背景取主题注册的纯色 base**（从 `ctx.theme.getTheme()` 的 themes 注册表读
     `--dsw-alias-bg-base`，即壁纸半透明覆盖层生效前的原色），保证壁纸模式下
     代码依然清晰可读；无 backdrop 模糊。内置主题回退静态色板，主题切换自动重新取色；
   - 渲染复用平台种子模块 `@deepseek-ai/dsh-client-ui-primitives`：
     - Markdown → `MarkdownText`（GFM + KaTeX），头部「渲染 / 源码」一键切换；
     - 代码 → `ReadBlock`（行号 + shiki 高亮，扩展名→语言映射对齐平台 LANG_ALIASES，
       JSON 自动美化），超过 8000 行截断并由 ReadBlock banner 标注；
     - 图片 → data URL 内联（棋盘格背景）；二进制/超大文件 → 状态说明；
     - 目录 → 条目列表，点击继续向下打开；
   - 错误态区分：宿主路由未加载（提示重启 dsh web）、文件不存在、其它失败。
4. **会话上下文桥**（`conversation.input.dock` 插槽）：把当前会话的
   `sessionId`/`cwd` 写入模块级 `filePreviewStore`，供相对路径解析。

## 激活方式

- 客户端（点击接入 + 面板 UI）：`lib/client.js` 重建后由 client-hmr 轮询自动
  推送到页面（或刷新浏览器）。
- 宿主路由 `/__codex/file`：随 dsh web 进程启动加载，**更新后需重启一次 dsh web**；
  重启前面板显示「文件预览服务未就绪」。

## 验证

- `node /tmp/test-dsh-code-file-route.mjs`：路由 11 项断言（相对/绝对/`~`/目录/二进制/404…）。
- `node /tmp/test-dsh-code-client.mjs`：工厂物化 + apply 注册 + 点击拦截
  （路径式行内代码命中、散文词不命中、inline mention 命中、产出文件芯片命中、
  工具卡片 fileLink 命中、「在文件夹中显示」保持原生）+ 面板开/关/加载态渲染 +
  背景取主题纯色 + 切换会话关闭预览。
- `sh verify.sh`：线上路由与引导图健康检查（新增第 3 步 file 路由）。

## Git 变更对比（GitCard 点击 → 两栏 diff）

后续迭代：GitCard 文件行点击不再打开普通文件预览，而是打开 IDEA / JetBrains
风格的**两栏并排对比**（复用同一右侧推挤式面板，打开时自动加宽到 ≥780px）。

1. **宿主路由** `GET /__codex/git-diff?file=<相对路径>[&cwd=…|session=…]`
   （`lib/index.js`）
   - 旧版本取 `git show HEAD:<file>`；无提交的新仓库回退索引版本 `git show :<file>`；
     新版本取工作区文件。口径与 GitCard 统计一致（`git diff HEAD`，含暂存）；
   - 单文件 numstat 给出 `+a/−d`；任一侧为 `-` 或 NUL 嗅探命中 → `binary`；
   - `kind`：`??` → untracked；无旧有新 → added；有旧无新 → deleted；其余 modified；
   - 路径必须留在工作区内（与 `/__codex/raw` 相同的越界拒绝），文本上限 1.5 MB。
2. **客户端**（`src-client/part2.js`）
   - `filePreviewStore.openDiff(path, rel)`：新增 diff 态（`state.diff`），普通
     `open()` 会清掉 diff 态；头部显示 修改/新增/删除/未跟踪 徽标与 `+a −d`，
     并提供「预览文件」一键切回普通预览；
   - 内置 Myers O(ND) 行 diff（先剥公共前后缀；`n+m>8000`、`n*m>1e6` 或
     `D>256` 时降级为整块替换，保证不卡死），删除/插入 run 逐行配对对齐；
   - 配对行再做词级 LCS 行内高亮（长度乘积守卫），对应 IDEA 的碎片差异；
   - 单表格四列（行号|旧内容|行号|新内容）天然双栏同步滚动；超过 8000 行截断提示；
   - **修改处定位/导航**：`fpBuildDiffModel` 汇总 hunk（连续 change 行的起点
     索引）。打开后自动滚动到第一处修改（`fpScrollToRow`，留 ~84px 上边距）；
     头部提供 ↑/↓ 分段按钮 + 「当前/总数」计数，在 hunk 之间平滑跳转，越界禁用。
3. **验证**：`node /tmp/test-git-diff.mjs`（服务端：修改/删除/未跟踪/二进制/
   越界拒绝/无提交仓库索引回退）、`node /tmp/test-client-diff.mjs`（diff 引擎
   25 项断言含 300 次随机往返模糊）、`node /tmp/test-route-wiring.mjs`
   （apply 注册 + handler 端到端）、`node /tmp/test-diff-nav.mjs`（hunk 模型 +
   双栏 markup + 增/删/二进制/无差异分支 + store diff 态 + 面板 diff 渲染）。
   宿主路由随 dsh web 启动加载，**更新后需重启一次 dsh web**；重启前面板显示
   「差异服务未就绪」。

# 项目文件树侧栏（File Tree Dock，Codex 风格）

日期：2026-08-20 · 状态：已实现

## 目标

在右侧增加一个 Codex 风格的 dock：展开后**文件树固定在最右侧**，点击文件在
文件树**左侧的独立编辑区**打开，多个文件即多个**标签页**。行为约束：

- 与左侧侧边栏一样支持打开/关闭，展开/收起按钮固定在右侧最顶部，且与左侧
  侧边栏顶部的折叠按钮**同一高度**（运行时测量左侧按钮的 `top` 动态对齐）；
- 与文件预览侧栏一样**只维持在当前会话**：切换会话即自动关闭并**清空标签页**
  （store.setSession 检测 sessionId 变化时置 `open:false`、`tabs:[]`）；
- 与既有文件预览侧栏**互斥**：同一时间只保留一个右侧面板，打开其一自动收起
  另一个（`filePreviewStore.open` 与 `fileTreeStore.open/openFile` 互相 close 对方）；
- 标签页在**同一会话内**侧栏收起/重开时保留（`close()` 不清 tabs），只有切换
  会话才清空。

## 组成

1. **宿主路由**（`lib/index.js`）
   - `GET /__codex/tree?cwd=…|session=…` — 复用 @mention 的 `walkWorkspace`
     递归遍历（自动剪枝 node_modules/.git 等，8s 缓存），返回扁平
     `{name, rel, type}` 列表；客户端自行组装嵌套树（目录优先、按名排序）。
   - `POST /__codex/file` — 编辑器保存：JSON `{path, cwd|session, content, mtime?}`；
     与读取路由共用路径解析，但**强制落盘在工作区内**（`path.relative` 守卫，
     `~/` 展开不参与写入），父目录按需创建；传入加载时的 `mtime` 时做磁盘冲突
     检测（409 `file changed on disk`）。GET 行为保持不变。
   - `GET /__codex/raw?path=<p>[&cwd=…|session=…]` — 返回工作区文件的**原始字节**
     （按扩展名给 MIME，20MB 上限），供渲染后的 Markdown `<img>` 引用。同样强制
     路径留在工作区内（`path.relative` 守卫，`~/` 不展开）。
2. **客户端**（`src-client/part2.js` FileTree region）
   - `fileTreeStore`：`{open, sessionId, cwd, tabs[], active, nonce}`，API：
     open/close/toggle/openFile/setActive/closeFile/setSession；
     `openFile(path)` 打开或激活标签页；`closeFile(path)` 关闭并让相邻标签接管
     active；`setSession` 切换会话时关闭并清空 tabs。
   - `SessionFileBridge`（既有）同时驱动预览与文件树两个 store，保证会话绑定一致。
   - `makeFileTreePanel(ctx)` 打开态渲染 `.ccx-ft-root`（`position:fixed` 右 dock）：
     - **布局**：`[ 编辑区 .ccx-ft-editors（仅当 tabs 非空） | 文件树 .ccx-ft-treepane ]`，
       flex 行向排列，文件树恒在最右。推挤 `#root` 的 margin-right =
       `calc(--ccx-ft-w + --ccx-ft-ew)`，无标签时 `--ccx-ft-ew` 置 0px。
     - **切换按钮**：关闭态只渲染浮动按钮；`top` 由 `useLeftToggleTop` 通过
       aria-label 选中左侧折叠按钮测量，MutationObserver + resize 跟随。
     - **编辑区**：顶部 tab 栏（basename + 脏圆点 + ✕ 关闭，点击切换 active）；
       下方每个标签一个 `FtFileView` 实例**常驻挂载**、非 active 者 `display:none`，
       因此切换 tab 不丢失已加载内容与未保存草稿。脏状态经 `onDirtyChange` 上报到
       面板级 `dirtyMap`，用于 tab 圆点与关闭前 confirm 守卫。
     - **文件视图**：复用预览的渲染基元（MarkdownText/图片内联/二进制与超大文件
       占位）。**非 Markdown 文本文件加载后直接进入可编辑的 overlay 编辑器**
       （`FtCodeEditor`：透明 `<textarea>` 精确叠加在高亮 ReadBlock 之上——字体/
       行高/行号栏偏移实时从 ReadBlock 度量复制，滚动同步，输入防抖 120ms 后重算
       高亮——因此编辑时保留语法高亮与行号）；仅 Markdown 保留「预览/编辑」分段
       （默认渲染预览，可切源码）。编辑为受控输入（Tab 插两空格、`Ctrl/Cmd+S`
       保存），脏状态圆点 + 保存按钮。
     - **调宽**：编辑区与文件树各自左缘可拖动调宽，分别记忆于
       `dsh-code:file-editor-width:v1` 与 `dsh-code:file-tree-width:v1`。
     - **Esc**：先关闭当前 active 标签（脏则 confirm），无标签时收起 dock
       （编辑输入中不触发）。
3. **样式**（`src-client/part1.js`）：`.ccx-ft-*` 一族，dock 背景同样取主题实色
   （壁纸安全，逻辑从预览面板提取为模块级 `ccxSamplePageBg(ctx)` 共用）。

## Markdown 图片渲染

平台 Markdown 渲染器只接受**完整 http(s) URL** 的图片（其余形式降级为 alt 文本），
因此工作区相对路径图片（如 README 的 `docs/screenshots/*.png`）原本不显示。修复：

- `ccxResolveMdImagePath(mdPath, src)` — 按 Markdown 文件所在目录解析图片相对路径
  （支持 `./`、`../`、`/` 工作区根；http/data/`~` 等保持原样）；
- `ccxRewriteMarkdownImages(text, mdPath, cwd, sessionId)` — 渲染前重写源码中的
  行内图片、`<spaced>` 目标与 `[label]: target` 引用定义为
  `<origin>/__codex/raw?path=…&cwd=…` 绝对 URL；**围栏代码块内保持字面文本**；
- 预览面板（`fpRenderBody`）与 dock 文件视图（`FtFileView`）的 Markdown 分支均接入。

## 重启依赖

`/__codex/tree`、`POST /__codex/file`、`/__codex/raw` 属宿主侧新增路由，
**需重启一次 dsh web**；重启前树视图显示「文件树服务未就绪」、保存显示「保存服务
未就绪」（通过 `unknown codex-clone route` / `missing path` 错误标记识别），
Markdown 图片则因 raw 路由缺失而显示为破损图标。

## 验证

- `node --check` 客户端/宿主两侧语法；
- 宿主写入逻辑单测：正常写、建父目录、`../` 与绝对路径逃逸拒绝（403）、
  过期 mtime 冲突（409）、坏 JSON（400）；
- 宿主 raw 路由单测：图片字节与 MIME 完整返回、目录/缺失/逃逸路径分别
  400/404/403、工作区内绝对路径放行；
- jsdom 集成渲染（react-dom createRoot + act）：开/关、树加载与展开、点开文件、
  编辑区出现在文件树左侧、多标签与 active 切换、脏圆点、切换 tab 保留草稿、
  保存 POST 载荷、关闭标签激活相邻、无标签时收起编辑区、与预览面板互斥、
  切换会话自动关闭并清空 tabs、**Markdown 相对图片重写为 /__codex/raw 且外部
  URL/代码块不受影响** —— 59 项全部通过。

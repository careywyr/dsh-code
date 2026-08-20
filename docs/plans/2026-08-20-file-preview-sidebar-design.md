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
   - GitCard 文件行整行可点击，未跟踪文件显示「未跟踪」徽标。
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

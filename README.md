# dsh-code

为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（`dsh`）打造的
Codex 风格体验插件：Catppuccin 主题、壁纸等各种自定义外观设置、Git 变更卡片、子智能体卡片、
`$` 技能触发、`@` 文件快捷引用、简单版的宠物、带活动热力图的个人资料页，
以及可在侧栏内查看与编辑文件的项目文件树侧栏。

![首页](docs/screenshots/home-mocha.png)

![外观设置](docs/screenshots/theme.png)

![个人资料](docs/screenshots/info.png)

## 功能

1. **Catppuccin 主题** — Latte / Frappé / Macchiato / Mocha 四种风味，也可随时切回
   内置浅色 / 深色 / 跟随系统。设置入口：设置 →「Codex 外观」。
2. **背景壁纸** — 上传图片或粘贴 URL，界面变为半透明毛玻璃透出壁纸，透明度可调。
3. **首页样式调整** — 新会话首页输入框下沉到底部，上方显示问候语与快捷提示词
   "豆腐块"（点击即填入输入框；可在「Codex 外观」中增删自定义），支持宽屏模式。
4. **Git 变更卡片** — 在 git 仓库目录下运行的会话，头部右上角显示
   `● 分支 +新增 −删除 N 文件`，点击展开逐文件变更清单。
5. **子智能体卡片** — 会话使用子智能体时，右上角显示 `🤖 n 智能体`，
   运行中绿点脉冲；展开可见每个智能体的标签与 单次/可续 徽标，点击行跳转。
6. **`$` 技能触发** — 输入框键入 `$` 唤出技能列表（`↑↓` 选择、`Enter` 插入
   `/技能名 `、`Esc` 关闭）；`/` 命令保持原生行为。
7. **`@` 文件快捷引用** — 会话输入框键入 `@` 唤出工作区文件/文件夹候选列表
   （模糊搜索、`↑↓` 选择、`Enter`/点击插入、`Esc` 关闭）。插入后输入框内以
   Codex 风格「芯片」展示：只显示最终文件（夹）名 + 图标，悬停可见完整相对
   路径，`Backspace` 在芯片末尾整块删除。
8. **状态宠物** — Codex 风格右下角浮动伙伴（猫咪 / 小狗 / 机器人 / 幽灵 /
   幻兽帕鲁「瞅什魔」五种外观）。每种状态有独立的行为动画, 悬停看气泡，点击固定，拖拽移动；大小可在设置中调节（48–128px）。目前暂只支持在当前工作区的动作变化。
9. **个人资料页** — 设置 →「个人资料」：头像（可上传）+ 用户名、累计 Tokens、
   峰值 Tokens / 单请求、最长聊天时长、当前 / 最长连续天数，以及 GitHub 风格
   活动热力图（每日 / 每周 / 累计 三种视图）。
10. **文件预览侧栏** — 点击对话中提到的文件（原生文件引用、形似路径的行内代码）
    或 Git 变更卡片中的文件，右侧推挤式侧边栏即时预览：Markdown 按 GFM/公式
    渲染（可一键切源码，**Markdown 内相对路径的图片也能正常显示**，走
    `/__codex/raw` 原始字节路由）、代码按扩展名语法高亮并带行号、图片直接内联
    显示、目录列出条目可继续点开。支持拖动调宽、`Esc` 关闭、复制路径；
    Git 卡片同时列出未跟踪文件。
11. **项目文件树侧栏（Codex 风格右侧 dock）** — 右上角与左侧侧边栏同高的
    展开/收起按钮。展开后**文件树固定在最右侧**（目录逐层展开/折叠、一键刷新
    与全部折叠）；点击文件在文件树**左侧的独立编辑区**打开，多个文件即多个
    **标签页**：点 tab 切换、✕ 关闭（有未保存修改会先确认）、脏状态在 tab 上
    以圆点提示。**非 Markdown 文本文件打开即可直接编辑，且编辑时保留语法高亮
    与行号**（透明输入层叠加在高亮层上的 overlay 编辑器）；只有 Markdown 提供
    「预览 / 编辑」切换（默认渲染预览，含行内图片），改完保存（`Ctrl/Cmd+S` 或
    保存按钮，带磁盘 mtime 冲突保护）；图片内联查看。
    切换 tab 不丢失已加载内容与未保存草稿。与文件预览侧栏一样仅维持在当前会话：
    切换会话即自动关闭并清空标签页；两个右侧面板互斥，打开其一自动收起另一个。
    文件树与编辑区宽度均可左缘拖动调节，分别记忆在本地。
12. **DeepSeek Harness 版本显示** — 设置 →「通用」分区最底部显示当前运行的
    DeepSeek Harness（`@deepseek-ai/dsh`）版本号，便于确认实际生效的版本
    （走宿主路由 `/__codex/version`，从运行进程的 dsh 安装树解析）。

![skills](docs/screenshots/dollar-skills.png)

![@文件](docs/screenshots/aite.png)

## 安装

前置条件：已安装并运行过 `dsh`（`~/.dsh` 存在，web profile 已初始化）。

```sh
git clone git@github.com:careywyr/dsh-code.git
cd dsh-code
node install.mjs   # 自动完成链接与注册（幂等，可重复执行）
# 重启 dsh web 服务，然后刷新浏览器
```

> 升级 dsh 导致 npx 缓存重建后，重跑 `node install.mjs` 即可恢复。

## 使用

- **主题 / 壁纸 / 快捷提示词**：设置 →「Codex 外观」。
- **个人资料 / 头像**：设置 →「个人资料」。
- **`$` 技能**：输入框键入 `$`，列表选择后插入 `/技能名 `。
- **`@` 文件引用**：会话输入框键入 `@`，列表选择文件/文件夹后以芯片形式插入。
  该功能在**首次安装或更新后需重启一次 dsh web** 才生效；重启前菜单会显示
  「文件搜索待启用」提示。
- **文件预览侧栏**：点击对话里的文件引用（或形似路径的行内代码）、Git 变更
  卡片中的文件，即在右侧打开预览侧栏；`Esc` 或右上角 ✕ 关闭，左缘可拖动调宽。
  内容读取走宿主路由 `/__codex/file`，因此**更新后需重启一次 dsh web**；
  重启前点击会提示「文件预览服务未就绪」。
- **项目文件树侧栏**：点击右侧最顶部（与左侧侧边栏折叠按钮同高）的方形面板
  按钮即可展开/收起。展开后**文件树固定在最右侧**；点击文件在文件树**左侧的
  独立编辑区**打开，多文件即多标签页——点 tab 切换、✕ 关闭、脏修改在 tab 上以
  圆点提示，切换 tab 不丢草稿。**非 Markdown 文本文件打开即可直接编辑，编辑时保留
  语法高亮与行号**；Markdown 默认渲染预览（**相对路径图片也能正常显示**）并可切
  「编辑」改源码，图片内联查看。改完「保存」或按 `Ctrl/Cmd+S` 写回磁盘。
  切换会话自动关闭并清空标签页，且与文件预览侧栏互斥
  （打开其一自动收起另一个）。文件树走宿主路由 `/__codex/tree`、保存走
  `POST /__codex/file`、Markdown 图片走 `/__codex/raw`，因此**更新后需重启一次
  dsh web**；重启前会分别提示「文件树服务未就绪」「保存服务未就绪」。
- **Harness 版本显示**：设置 →「通用」分区最底部一行显示当前 DeepSeek Harness
  版本。版本号走宿主路由 `/__codex/version`（从运行进程所在 dsh 安装树解析
  `@deepseek-ai/dsh` 的 `package.json`），因此**更新后需重启一次 dsh web**；
  重启前该行会显示「未知」。

## 升级 dsh（npx 版本与缓存）

`npx` 按「包@版本规格」把安装缓存到 `~/.npm/_npx/<hash>/`，**每个解析出的版本
一个独立目录**，且裸 `npx @deepseek-ai/dsh` 命中已有缓存后不会自动升到新版。
因此启动命令里的版本后缀决定了你跑哪个版本：

- `npx @deepseek-ai/dsh web` —— 用最近一次缓存的版本（不自动升级）。
- `npx @deepseek-ai/dsh@latest web` —— 解析 npm `latest` 标签（当前最新稳定）。
- `npx @deepseek-ai/dsh@next web` —— 解析 `next` 标签（rc 预发布通道）。
- `npx @deepseek-ai/dsh@0.1.0-rc.8 web` —— 固定到某个具体版本。

升级到新版本（新缓存目录）后，重跑一次 `node install.mjs` 即可把插件重新链接进
新的安装树；`install.mjs` 会自动挑选**最新安装**的 dsh 树，无需手工指定。若要
强制指向某个安装树：`DSH_INSTALL_NODE_MODULES=/path/to/node_modules node install.mjs`。

## 从旧版（dsh-codex-clone）升级

本插件由 `dsh-codex-clone` 更名为 `dsh-code`。老用户只需：

```sh
git pull
node install.mjs   # 自动清理旧的 dsh-codex-clone 注册并注册 dsh-code
# 重启 dsh web 服务，然后刷新浏览器
```

`install.mjs` 会自动完成迁移：删除旧的 `dsh-codex-clone` 符号链接、移除
`cordis.patch.yml` 中旧的 insert 块，再注册新的 `dsh-code`。
浏览器本地存储（主题 / 壁纸 / 快捷提示词 / 宠物位置等）也会在首次打开页面时
自动从旧键（`dsh-codex-clone:*`）迁移到新键（`dsh-code:*`），**配置不会丢失**。

> 如果之前是手动注册的，请先手动删除 `cordis.patch.yml` 里 `dsh-codex-clone`
> 的 insert 块和两个旧符号链接，再执行上面的步骤。

## 卸载

1. 删除 `~/.dsh/profiles/web/cordis.patch.yml` 中 `dsh-code` 的 insert 块；
2. 删除符号链接：`~/.dsh/profiles/node_modules/dsh-code` 与 dsh 安装树
   `node_modules/dsh-code`；
3. 重启 `dsh web`。

## 许可

[MIT](LICENSE)

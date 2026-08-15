# dsh-codex-clone

DeepSeek Harness 插件：复刻 Codex 客户端的核心体验。

## 功能

1. **Catppuccin 主题** — Latte / Frappé / Macchiato / Mocha 四种风味，覆盖全部
   `--dsw-alias-*` / `--dsw-specific-*` 语义色板；支持背景图片（上传或 URL），
   设置后各界面呈现半透明毛玻璃效果，透明度可调。
2. **首页重排** — 新会话首页输入框下沉到底部，上方显示问候语与快捷提示词"豆腐块"，
   点击即填入输入框（可在设置中自定义）。
3. **Git 变更卡片** — 在 git 仓库目录下运行时，会话头部右上角显示 Codex 风格卡片：
   分支名、`+新增 / −删除` 行数、变更文件数；点击展开逐文件清单。
4. **`$` 技能触发** — 输入框键入 `$` 唤出技能列表（`/` 命令保持原生行为），
   方向键选择、Enter 插入 `/技能名 `、Esc 关闭。
5. **个人资料页** — 设置 → 个人资料：头像 + 用户名、累计 Tokens、峰值 Tokens、
   最长聊天时长、当前/最长连续天数，以及 GitHub 风格活动热力图
   （每日 52 周响应式全宽 / 每周 / 累计 三种视图）。
6. **子智能体卡片** — 会话头部右上角 `🤖 n 智能体` 卡片：显示本会话使用的
   子智能体（运行中绿点脉冲），点击展开清单（标签 + 单次/可续），点击行跳转。
7. **宠物** — 右下角 Catppuccin 风格小猫，随会话状态切换动画与气泡：
   空闲中 / 思考中 / 干活中 / 需要确认（approval、plan-review、question）。
   悬停或点击固定气泡。

## 结构

| 文件 | 作用 |
|---|---|
| `lib/index.js` | Host 半：`codex-clone` settings 命名空间 + `/__codex/*` HTTP 路由（git / stats / upload / asset） |
| `lib/client.js` | Client 半：主题注册、壁纸、设置页、首页卡片、Git 卡片、`$` 菜单（由 `src-client/part1..3.js` 拼接，`node build-client.mjs` 重建） |
| `node_modules/@deepseek-ai/*` | 指向 dsh 安装的符号链接（运行时依赖解析） |

## 持久化

- 主题风味、背景图、透明度、用户名、头像、快捷提示词保存在**浏览器
  localStorage**（键 `dsh-codex-clone:config:v1`，跨标签页同步）。
  原因：Web API 对浏览器只开放固定的 settings 命名空间白名单
  （`dsh-host-apiproxy` 的 `WEB_SETTINGS_NAMESPACES`），自定义命名空间会得到
  `settings-not-exposed`，故由客户端自持。
- 上传的头像/背景图片存放在 `$DSH_HOME/codex-clone-assets/`，经
  `/__codex/asset?f=<name>` 提供。
- Host 侧仍注册了 `codex-clone` settings 命名空间（预留：白名单放开后可迁移）。

## 安装

运行安装脚本（需要写 `~/.dsh` 与 npx 安装目录的权限）：

```sh
node install.mjs
```

脚本做三件事：
1. 将本目录符号链接到 `~/.dsh/profiles/node_modules/dsh-codex-clone`
   （client-modules 从 profile 目录解析 `package.json` 用）；
2. 将本目录符号链接到 dsh npx 安装的 `node_modules/dsh-codex-clone`
   （Loader 的 `import()` 从安装树解析 bare specifier 用）；
3. 在 `~/.dsh/profiles/web/cordis.patch.yml` 追加一行
   `- insert: [{ id: dsh-codex-clone, name: 'dsh-codex-clone' }]`。

然后**重启 dsh web 服务**并刷新浏览器。

> 注意：npx 安装目录的符号链接在 `npx` 重建缓存（升级 dsh 版本）后会丢失，
> 重新执行 `node install.mjs` 即可。

## 验证

```sh
node --check lib/index.js && node --check lib/client.js   # 语法
node /tmp/host-check.mjs                                   # host 路由集成测试（如保留）
```

运行时验证：
- `curl 'http://127.0.0.1:3080/__codex/git?cwd=<repo>'`
- `curl 'http://127.0.0.1:3080/__codex/stats?tz=...'`

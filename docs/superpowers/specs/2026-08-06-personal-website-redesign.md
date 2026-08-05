# Stark Ye 个人网站重建设计

日期：2026-08-06
状态：已确认，待实施

## 1. 背景

旧站位于 `/Users/hanchenye/blog/blog/`，使用 Hexo 6、Butterfly 主题和 `hexo-deployer-git`，生成结果曾推送到 `yestark/yestark.github.io` 的 `main` 分支，并通过 GitHub Pages 使用 `starkye.com`。旧站只有少量初始内容，源目录本身没有 Git 仓库。

新版在 `/Users/hanchenye/Documents/Personal_website/` 中重新建设。旧 Hexo 目录保持不动，直到新版完成验证并成功接管线上网站。

## 2. 目标

新版是面向合作伙伴和技术同行的综合个人网站，建立三个清晰标签：

- AI 产品与实践
- 全栈开发能力
- 独立思考与个人表达

首版通过个人定位、文章入口、项目预留结构和直接联系方式建立可信度。网站必须在尚无成熟项目案例和文章时仍然完整、诚实，不展示虚构内容。

## 3. 非目标

首版不包含：

- 网页内容后台或隐藏管理入口
- 服务端 API、数据库或用户账户
- 联系表单
- 评论、站内搜索和分析系统
- 虚构项目案例或占位文章
- 对旧 Hexo `hello-world` 示例文章的迁移

这些能力只有在出现明确需求时再设计。

## 4. 品牌与视觉

### 4.1 对外身份

- 名称：`Stark Ye`
- 标识：`SY`
- 邮箱：`yehanchen714@gmail.com`
- 核心定位：AI、全栈产品、个人想法

### 4.2 视觉方向

采用已确认的 `Creative Studio` 方向：

- 浅色页面、深色文字，以蓝紫色作为主要强调色
- 大字号、紧凑字距的首屏标题
- 柔和渐变光晕与圆角卡片，但不使用装饰性过强的效果
- 项目与文章使用一致的卡片语言
- 使用 `SY` 字母标识，不依赖尚未提供的个人照片
- 整体气质现代、清晰、有产品感，同时保留个人温度

基础颜色使用浅蓝白页面 `#F5F8FF`、深色文字 `#101727` 和蓝紫强调色 `#4E5CF6`。允许为对比度、状态或渐变生成相邻色阶，但不得引入第二套竞争性的主色。

### 4.3 响应式与可访问性

- 从移动端到宽屏桌面均保持清晰的信息层级
- 支持键盘导航、可见焦点和“减少动态效果”系统偏好
- 正文、按钮和交互状态满足 WCAG AA 对比度要求
- 装饰性动画不承载必要信息

## 5. 信息架构

### 5.1 主导航

主导航固定包含：

- Home
- About
- Thoughts
- Projects
- Contact
- 中 / EN 语言切换

### 5.2 首页顺序

首页严格采用以下顺序：

1. Header
2. Hero
3. Thoughts
4. Projects
5. Contact
6. Mini About
7. Footer

Mini About 位于页面最底部，仅显示 `SY` 小标识、一句话定位和 About 链接，不占据独立大区块。

### 5.3 Hero

Hero 包含：

- `Hi, I’m Stark Ye.`
- 以“构建真正有用的 AI 体验”为核心的主标题
- 一段中文定位说明
- “开放合作”状态
- 指向 Thoughts 和 About 的主要行动入口
- 当前关注方向：AI-native products、Full-stack systems、Ideas worth keeping

具体文案在实施时可以做轻微编辑，但不得改变已确认的定位和信息层级。

## 6. 页面设计

### 6.1 Home

负责在短时间内说明 Stark Ye 是谁、关注什么、如何阅读内容和如何联系。没有文章或项目时显示正式空状态；发布内容后，首页卡片从内容集合自动生成。

### 6.2 Thoughts

包含文章列表和文章详情页。

文章使用本地 Markdown 编写，最小元数据为：

- `title`
- `description`
- `publishedAt`
- `tags`
- `language`：`zh` 或 `en`
- `draft`

可选元数据为：

- `updatedAt`
- `translationKey`，用于关联同一文章的中英文版本

列表按发布日期倒序排列，并显示语言、标签和摘要。首版不引入复杂分类体系。

### 6.3 Projects

首版显示“正在整理代表项目”的正式空状态，并提供联系入口。项目内容准备完成后，通过独立 Markdown 内容集合启用项目卡片和案例详情页，无需修改页面结构。

项目集合预留字段：

- `title`
- `summary`
- `publishedAt`
- `tags`
- `language`
- `featured`
- `draft`
- 可选外部链接

### 6.4 About

独立 About 页面包含简短经历、关注方向、技术能力、做事原则和当前状态。首页只保留最底部的 Mini About。首版使用文字和 `SY` 标识，不要求个人照片。

### 6.5 Contact

只公开 `yehanchen714@gmail.com`，提供：

- `mailto:` 发邮件入口
- 复制邮箱地址操作

不提供联系表单，以避免服务端依赖和垃圾信息。

### 6.6 404

提供符合品牌视觉的静态 404 页面，并给出返回首页、Thoughts 和 Contact 的明确入口。

## 7. 中英文策略

中文是默认语言。以下页面提供完整中英文版本：

- Home：`/` 与 `/en/`
- About：`/about/` 与 `/en/about/`
- Thoughts 列表：`/thoughts/` 与 `/en/thoughts/`
- Projects 列表：`/projects/` 与 `/en/projects/`
- Contact：`/contact/` 与 `/en/contact/`

Thoughts 和 Projects 的详情内容按实际创作语言发布，不强制翻译。若 `translationKey` 找到对应语言内容，语言切换直接打开译文；若没有译文，则回到对应语言的列表页。界面必须显示内容语言，避免用户误以为翻译缺失是错误。

## 8. 技术架构

### 8.1 技术选择

- Astro 静态站点
- TypeScript
- Astro Content Collections
- 本地 Markdown 内容
- 原生 CSS、自定义属性和 Astro 组件作用域样式
- GitHub Actions
- GitHub Pages

首版不使用 Tailwind 或前端框架岛。只有确实需要客户端状态的交互，例如复制邮箱，才加载极小的浏览器脚本。

### 8.2 模块边界

主要模块及职责：

- `site config`：姓名、邮箱、域名、导航和社交链接
- `i18n dictionaries`：共享界面文案和路由映射
- `content collections`：Thoughts 和 Projects 的结构、校验与查询
- `layouts`：站点外壳、SEO 元数据和文章排版
- `components`：Header、Hero、ThoughtCard、ProjectCard、ContactCTA、MiniAbout、Footer
- `pages`：组装模块并定义静态路由，不承载重复业务逻辑

每个组件只依赖明确的属性或集中配置，避免组件内部读取分散的全局数据。

### 8.3 内容流

文章发布流程：

1. 在 Thoughts 内容目录新增或修改 Markdown。
2. 本地预览并提交到 Git。
3. GitHub Actions 校验元数据、类型和构建结果。
4. 构建成功后生成静态 HTML、RSS、站点地图和静态资源。
5. GitHub Pages 发布构建产物。
6. `starkye.com` 指向新版本。

Projects 使用相同流程。首页只读取非草稿且符合展示条件的内容。

## 9. SEO 与基础输出

- 站点基准地址为 `https://starkye.com`
- 每个页面输出唯一标题、描述、canonical URL 和 Open Graph 元数据
- 生成 `sitemap.xml` 和 Thoughts RSS
- `public/CNAME` 保存 `starkye.com`，避免自定义域名配置在部署后丢失
- 草稿内容不生成公开路由，也不进入 RSS 或站点地图

## 10. 异常与空状态

- 内容元数据不合法时，构建直接失败并指出文件和字段
- Thoughts 为空时，显示文章创作中的说明和 Contact 入口
- Projects 为空时，显示项目整理中的说明和 Contact 入口
- 文章没有译文时，不生成不存在的译文链接
- 复制邮箱失败时，保留可点击和可手动选择的邮箱文本
- 构建失败时不发布新版本，线上站点保持上一成功版本
- 断裂的内部链接在发布前检查并阻止部署

## 11. 验证策略

实施完成的最低验证包括：

- Astro/TypeScript 静态检查
- 内容集合 schema 校验
- 生产构建
- Home、About、Thoughts、Projects、Contact、404 的中英文路由检查
- canonical、RSS、站点地图和 CNAME 输出检查
- 关键内部链接检查
- 文章草稿和缺少译文行为测试
- 桌面端和移动端的浏览器视觉检查
- 键盘导航、焦点状态和减少动态效果检查

## 12. 部署与迁移

新版首先在当前 `Personal_website` 仓库中完成实现和本地验证。部署阶段使用现有 `yestark/yestark.github.io` GitHub Pages 站点和 `starkye.com`，通过 GitHub Actions 发布 Astro 构建产物。

迁移必须保留可回退路径：

1. 不修改旧 Hexo 目录。
2. 新版在独立开发历史中完成并通过全部验证。
3. 记录现有线上站点的最后可用提交。
4. 在临时分支完成 CI 构建，下载并检查 Pages 构建产物；验证通过后再合并并发布到 `main`。
5. 线上验证失败时恢复上一成功版本。

## 13. 完成标准

首版完成必须同时满足：

- 已实现确认的 Creative Studio 视觉方向和首页顺序
- 全站使用 `Stark Ye` 与 `SY`
- Home、About、Thoughts、Projects、Contact 和 404 可访问
- 关键页面具备中英文版本
- Markdown 提交能够触发自动检查和发布
- 空内容状态诚实、完整且不破坏页面布局
- 邮箱入口可用
- 移动端和桌面端通过视觉与交互检查
- `starkye.com` 能够由 GitHub Pages 正常提供新版网站

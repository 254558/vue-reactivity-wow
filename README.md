# Vue 是怎么工作的

逐步拆解 Vue 响应式系统与渲染机制的交互式 Debugger 教学项目。

**每章一个独立的 HTML 调试页面**，代码中嵌入了 `debugger` 语句。打开 Chrome DevTools，点击按钮，即可一步步观察 Vue 核心原理的执行过程。

## 快速启动

```bash
pnpm install
pnpm dev        # 开发，浏览器打开 http://localhost:5173
```

## 使用方式

1. 打开 **Chrome 浏览器**（其他浏览器 debugger 体验不一致）
2. 按 `F12` 打开 DevTools → **Sources** 面板
3. 点「初始化」按钮 → `debugger` 触发，开始步进调试
4. 每步 `debugger` 旁都有中文注释说明当前发生了什么

## 章节列表

| 章节 | 内容 | 按钮流程 |
|------|------|---------|
| 01 | reactive 与 effect | 初始化 → +1 → -1 |
| 02 | scheduler 调度器 | 初始化 → 无调度器改3次 → 有调度器改3次 |
| 03 | computed 计算属性 | 初始化 → 读 → 再读(缓存) → 改 → 再读(重新计算) |
| 04 | watch 侦听器 | 初始化 → 创建 watch → 改 count → 改 nested |
| 05 | ref 原始值响应式 | 初始化 → 创建 ref → 读取 → 修改 → auto-unwrap |
| 06 | 嵌套 effect | 初始化 → 嵌套 effect → 覆盖问题 → 栈解决 → 修改 |
| 07 | 虚拟 DOM | 初始化 → 创建 VNode → mountElement 分步 |
| 08 | Diff 算法 | 初始化 → 执行一步 → 全部执行 → 重置 |
| 09 | 编译模板 | 初始化 → Parse → Transform → Codegen |
| 10 | 组件系统 | 初始化 → 挂载 → 父更新 → 子自更新 |

## 项目结构

```
src/
├── main.js                          # 入口
├── App.vue                          # 顶层壳
├── views/
│   ├── HomeView.vue                 # 首页：章节卡片列表
│   └── ChapterView.vue              # 章节容器：id → 映射 HTML 路径
├── components/
│   └── ChapterFrame.vue             # iframe 包装器（10 kB，每个章节通用）
├── router/
│   └── index.js
└── styles/
    └── main.css

public/
├── ch1-debugger.html                # 每章一个独立调试页面
├── ch2-debugger.html                # 每页都包含完整的响应式系统实现
├── ch3-debugger.html                # debugger 语句嵌入在实现代码中
└── ... ch10-debugger.html
```

## 设计思路

- **调试器优先**：每个 `debugger` 语句都有关键上下文注释，学生边步进边对照执行过程
- **按钮触发**：所有代码通过点击按钮触发，确保 DevTools 打开后 `debugger` 不会错过
- **独立 HTML**：`public/` 中的页面绕过 Vite 编译，源码在 Chrome Sources 中清晰可读
- **渐进学习**：从 reactive 到组件系统，每章在前一章基础上增加新概念

## 部署

```bash
pnpm build        # 输出 dist/
```

已配置 `vercel.json`，直接推送到 Vercel 即可：

```bash
vercel --prod
```

## License

MIT

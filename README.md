# Vue 是怎么工作的

逐步拆解 Vue 响应式系统与渲染机制的交互式可视化教学项目。

## 快速启动

```bash
pnpm install   # 或 npm install
pnpm dev       # 或 npm run dev
```

## 项目结构

```
src/
├── main.js                          # 入口：创建 Pinia + Router + 挂载
├── App.vue                          # 顶层壳：导航栏 + <router-view>
├── router/
│   └── index.js                     # 路由：/ → 首页，/chapter/:id → 章节
│
├── views/
│   ├── HomeView.vue                 # 首页：章节卡片列表
│   └── ChapterView.vue              # 章节容器：按路由 id 动态加载 Demo.vue
│
├── components/                      # 通用组件（所有章节共享）
│   ├── DemoLayout.vue               # 章节布局：左栏(代码+步骤说明) + 右栏(slot) + 底部控制栏
│   ├── CodePanel.vue                # 代码面板：Prism 高亮 + 行号 + 活跃行滚动
│   └── StepDesc.vue                 # 步骤说明：标题 + 描述 + 详情折叠
│
├── stores/
│   ├── useChapterBase.js            # 核心 composable：步骤管理 + 日志 + 交互权限
│   ├── chapter1.js ~ chapter10.js   # 各章 store：基于 useChapterBase + 章节特有逻辑
│
├── chapters/
│   ├── ch1-reactivity/
│   │   ├── data.js                  # sourceCode(模板字符串) + steps(步骤配置)
│   │   └── Demo.vue                 # 可视化 + 交互逻辑
│   ├── ch2-scheduler/
│   │   └── ...                      # 同上结构
│   ├── ch3-computed/
│   ├── ch4-watch/
│   ├── ch5-ref/
│   ├── ch6-nested/
│   ├── ch7-vnode/
│   ├── ch8-diff/
│   ├── ch9-compile/
│   └── ch10-component/
│
├── styles/
│   └── main.css                     # 全局样式：CSS 变量 + 布局 + 通用组件样式
│
└── utils/
    └── highlight.js                 # Prism 语法高亮配置（自定义 Vue/响应式关键字）
```

## 新增一章只需 3 个文件

### 1. `src/chapters/chN-xxx/data.js`

导出 `sourceCode` 和 `steps`：

```js
export const sourceCode = `// 你的演示源码
let activeEffect = null
// ...
`

export const steps = [
  {
    id: 1,              // 步骤序号
    title: '步骤标题',   // 显示在步骤 tab 上
    label: '简短标签',   // tab 上的文字（2-4字）
    desc: '一句话描述',  // 步骤说明主文字
    detail: '详细说明',  // 折叠展开的详情
    color: '#10b981',   // 步骤主题色
    lines: [0, 1, 2],   // 高亮的行号（0-indexed，对应 sourceCode 的行）
    highlight: {},       // 传递给 Demo.vue 的可视化状态（自定义 key）
  },
  // ...更多步骤
]
```

**`lines` 字段说明：**
- 0-indexed，对应 `sourceCode` 按换行符分割后的数组下标
- CodePanel 用 `activeLines.includes(idx)` 判断是否高亮
- 非高亮行自动变暗（`opacity: 0.3`）

### 2. `src/chapters/chN-xxx/Demo.vue`

标准模板：

```vue
<template>
  <DemoLayout
    :sourceCode="sourceCode"
    :activeLines="store.activeLines"
    filename="your-file.js"
    :steps="store.steps"
    :currentStep="store.currentStep"
    :totalSteps="store.totalSteps"
    :currentStepData="store.currentStepData"
    @prev="store.prevStep()"
    @next="store.nextStep()"
    @goTo="store.goToStep($event)"
  >
    <!-- 右栏：可视化卡片，自由发挥 -->
    <div class="viz-card">
      <div class="viz-head"><i class="fa-solid fa-xxx"></i><h4>卡片标题</h4></div>
      <!-- 你的可视化内容 -->
    </div>

    <!-- 操作区（通常放在最后） -->
    <div class="viz-card action">
      <button class="act-btn" :class="{ pulse: store.canInteract }"
        @click="store.xxx()" :disabled="!store.canInteract">
        操作按钮
      </button>
    </div>
  </DemoLayout>
</template>

<script setup>
import { onUnmounted } from 'vue'
import { useChapterNStore } from '@/stores/chapterN'
import { sourceCode } from './data'
import DemoLayout from '@/components/DemoLayout.vue'

const store = useChapterNStore()
onUnmounted(() => { store.reset() })
</script>

<style scoped>
/* 只写章节特有的样式，通用样式在 main.css */
</style>
```

### 3. `src/stores/chapterN.js`

基于 `useChapterBase` 的标准结构：

```js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { steps } from '@/chapters/chN-xxx/data'
import { useChapterBase } from './useChapterBase'

export const useChapterNStore = defineStore('chapterN', () => {
  const base = useChapterBase(steps)

  // 章节特有状态
  const myState = ref(0)

  // 如需在步骤切换时触发动画，覆盖 nextStep
  function nextStep() {
    base.nextStep()
    if (base.currentStep.value === 3) simulateSomething()
  }

  // 交互函数
  function simulateSomething() {
    if (!base.canInteract.value) return
    // ...
    base.logAction('操作', '描述')  // 写入日志
  }

  function reset() {
    base.resetBase()
    myState.value = 0
  }

  return {
    ...base,           // 暴露通用属性：currentStep, canInteract, triggerLogs 等
    myState,
    nextStep, simulateSomething, reset,
  }
})
```

### 4. 注册路由

在 `src/views/ChapterView.vue` 的 `chapterMap` 中添加：

```js
'11': {
  Demo: defineAsyncComponent(() => import('@/chapters/ch11-xxx/Demo.vue')),
  meta: { title: '你的章节标题' },
},
```

在 `src/views/HomeView.vue` 的 `chapters` 数组中添加卡片。

## useChapterBase API

由 `src/stores/useChapterBase.js` 提供，所有章节 store 共享：

| 属性/方法 | 类型 | 说明 |
|-----------|------|------|
| `currentStep` | `ref<number>` | 当前步骤（从 1 开始） |
| `totalSteps` | `number` | 总步骤数 |
| `steps` | `array` | 步骤配置数组（即 data.js 导出的 steps） |
| `currentStepData` | `computed` | 当前步骤的完整配置对象 |
| `activeLines` | `computed` | 当前步骤的高亮行号数组 |
| `canInteract` | `computed` | `currentStep >= totalSteps`，最后一步才允许交互 |
| `triggerLogs` | `ref<array>` | 操作日志（最多 20 条，最新在前） |
| `nextStep()` | `function` | 下一步 |
| `prevStep()` | `function` | 上一步 |
| `goToStep(n)` | `function` | 跳到第 n 步（只能跳到已到达的步骤） |
| `logAction(type, detail)` | `function` | 写入一条日志 |
| `resetBase()` | `function` | 重置步骤和日志 |

**自定义交互权限：** 如果章节需要在最后一步之前解锁某些交互（如 ch10 的 `canMount` 在步骤 4），自行定义 computed：

```js
const canMount = computed(() => base.currentStep.value >= 4)
const canUpdate = computed(() => base.currentStep.value >= 5)
```

## DemoLayout Props & Events

| Prop | 类型 | 说明 |
|------|------|------|
| `sourceCode` | `string` | 源码文本，传给 CodePanel |
| `activeLines` | `array` | 高亮行号，传给 CodePanel |
| `filename` | `string` | 代码面板文件名 |
| `steps` | `array` | 步骤配置，渲染 tab |
| `currentStep` | `number` | 当前步骤 |
| `totalSteps` | `number` | 总步骤 |
| `currentStepData` | `object` | 当前步骤数据，传给 StepDesc |

| Event | 参数 | 说明 |
|-------|------|------|
| `prev` | - | 点击"上一步" |
| `next` | - | 点击"下一步" |
| `goTo` | `number` | 点击步骤 tab |

默认 slot 放在右栏，用于各章节的可视化内容。

## 全局 CSS 变量 & 通用样式

定义在 `src/styles/main.css`，章节 scoped 样式中可直接使用：

**常用变量：** `--accent`, `--accent-dim`, `--muted`, `--fg`, `--border`, `--card`, `--amber`, `--crimson`, `--font-mono`, `--radius`, `--radius-sm`

**通用类名（无需在 scoped 中重写）：**
- 布局：`.demo-layout`, `.main-grid`, `.left-col`, `.right-col`
- 卡片：`.viz-card`, `.viz-head`, `.action`
- 数据展示：`.data-box`, `.d-kw`, `.d-prop`, `.d-key`, `.d-colon`, `.d-val`
- 日志：`.logs`, `.logs-head`, `.logs-list`, `.log-item`, `.l-type`, `.l-detail`, `.l-time`, `.logs-empty`
- 按钮：`.act-btn`(绿), `.inc-btn`(绿全宽), `.ctrl-btn`, `.btn-group`
- 步骤：`.step-tabs`, `.s-tab`
- 动画：`@keyframes pulse-ring`, `node-flash`, `fade-slide-up`

## 图标库

使用 Font Awesome 6 Free，通过 CDN 在 `index.html` 中引入。常用图标：
- `fa-solid fa-database` / `fa-diagram-project` / `fa-layer-group` / `fa-sitemap`
- `fa-solid fa-plus` / `fa-pen` / `fa-rotate` / `fa-rocket` / `fa-play`
- `fa-solid fa-bolt` / `fa-arrow-left` / `fa-arrow-down` / `fa-chevron-left`

## 调试技巧

**查看某章状态：** 浏览器控制台中 Pinia devtools 可直接查看 store 状态。

**行号对不上：** `lines` 是 0-indexed。在 `data.js` 中将 `sourceCode` 按换行分割，第 N 行对应 index N-1。可用以下脚本验证：

```bash
node -e "
const { sourceCode, steps } = require('./src/chapters/chN-xxx/data.js', { assert: { type: 'json' } })
"
```

或直接数模板字符串的行（注意反引号后的第一行是 index 0）。

**样式不生效：** 检查是否在 scoped CSS 中重写了全局类名（如 `.data-box`）。scoped 样式优先级更高，会覆盖全局。

## fork 后提交

```bash
git remote add upstream https://github.com/254558/vue-reactivity-demo
```

点击 `Create pull request` 提交你的代码。

## 打赏

如果觉得有用，可以请主播喝怡宝：

![alt text](IMG_3016.JPG)

// 第一章：reactive 与 effect 的步骤配置数据
export const sourceCode = `// 当前正在执行的 effect
let activeEffect = null

// 存储依赖
const bucket = new WeakMap()

// 副作用函数
function effect(fn) {
  activeEffect = fn
  fn()
}

// 依赖收集
function track(target, key) {
  if (!activeEffect) return
  let depsMap = bucket.get(target)
  if (!depsMap) { depsMap = new Map(); bucket.set(target, depsMap) }
  let deps = depsMap.get(key)
  if (!deps) { deps = new Set(); depsMap.set(key, deps) }
  deps.add(activeEffect)
}

// 触发更新
function trigger(target, key) {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)
  effects && effects.forEach(fn => fn())
}

// 响应式对象
function reactive(data) {
  return new Proxy(data, {
    get(target, key) {
      track(target, key)
      return target[key]
    },
    set(target, key, value) {
      target[key] = value
      trigger(target, key)
      return true
    }
  })
}

// 数据
const state = reactive({ count: 0 })

// 自动渲染
effect(() => {
  document.querySelector('#app').innerText =
    \`count: \${state.count}\`
})

// 修改数据
document.querySelector('#btn').onclick = () => {
  state.count++
}`

export const steps = [
  {
    id: 1, title: '定义 reactive 函数', label: 'reactive',
    desc: 'reactive() 接收普通对象，通过 Proxy 将其包装为响应式对象。Proxy 拦截属性读取（get）和设置（set）。',
    detail: '当属性被读取时 → 收集依赖 (track)\n当属性被修改时 → 触发更新 (trigger)',
    color: '#10b981',
    lines: [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43],
    highlight: { state: false, bucket: false, effect: false },
  },
  {
    id: 2, title: '创建响应式数据', label: '创建数据',
    desc: '调用 reactive({ count: 0 }) 创建响应式对象 state。此后对 state 属性的访问和修改都将被拦截。',
    detail: 'state.count → 触发 get 拦截器\nstate.count = 1 → 触发 set 拦截器',
    color: '#f59e0b',
    lines: [46],
    highlight: { state: true, bucket: false, effect: false },
  },
  {
    id: 3, title: '注册副作用函数', label: 'effect',
    desc: 'effect() 注册副作用函数并立即执行。执行期间，所有被读取的响应式属性都会被自动追踪。',
    detail: 'activeEffect = fn  → 标记当前正在执行的 effect\nfn()            → 立即执行，触发依赖收集',
    color: '#ef4444',
    lines: [7, 8, 9, 10],
    highlight: { state: true, bucket: false, effect: true },
  },
  {
    id: 4, title: '依赖收集 (track)', label: 'track',
    desc: 'effectFn 读取 state.count 时，get 拦截器调用 track()，将 activeEffect 存入 bucket 对应属性的依赖集合。',
    detail: 'bucket 结构:\n  WeakMap {\n    state → Map {\n      "count" → Set { effectFn }\n    }\n  }',
    color: '#10b981',
    lines: [0, 1, 3, 4, 13, 14, 15, 16, 17, 18, 19, 20],
    highlight: { state: true, bucket: true, effect: true },
  },
  {
    id: 5, title: '渲染结果', label: '渲染',
    desc: 'effectFn 执行完毕，页面渲染出 count 初始值 0。依赖关系已建立，等待数据变化。',
    detail: 'effectFn 读取 state.count → 值为 0\nDOM 更新: "count: 0"\n依赖收集完成，等待数据变化...',
    color: '#10b981',
    lines: [49, 50, 51, 52],
    highlight: { state: true, bucket: true, effect: true },
  },
  {
    id: 6, title: '触发更新 (trigger)', label: 'trigger',
    desc: 'state.count++ 触发 set 拦截器，调用 trigger()，从 bucket 中取出 effectFn 并执行，DOM 更新。',
    detail: 'state.count++ (0 → 1)\n  → set 拦截器触发\n  → trigger(state, "count")\n  → 从 bucket 取出 effectFn\n  → 执行 effectFn()\n  → DOM 更新为 "count: 1"',
    color: '#ef4444',
    lines: [23, 24, 25, 26, 27, 28, 55, 56, 57],
    highlight: { state: true, bucket: true, effect: true },
  },
]
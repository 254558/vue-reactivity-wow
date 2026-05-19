// 第四章：侦听器 watch 的步骤配置数据
export const sourceCode = `// 响应式系统基础 (简化)
let activeEffect = null
const bucket = new WeakMap()
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
function track(target, key) { /* ... */ }
function trigger(target, key) { /* ... */ }
// ================= watch 实现 =================
// 递归读取，建立深层次依赖
function traverse(value, seen = new Set()) {
  if (value === null || typeof value !== 'object' || seen.has(value)) return
  seen.add(value)
  for (const k in value) {
    traverse(value[k], seen) // 递归访问子属性
  }
  return value
}
function watch(source, cb) {
  let getter
  // 判断 source 类型
  if (typeof source === 'function') {
    getter = source           // 直接作为 getter
  } else if (typeof source === 'object') {
    getter = () => traverse(source) // 包装为 traverse
  }
  // 定义旧值与新值
  let oldValue, newValue
  // 使用 effect 追踪 getter
  const job = () => {
    newValue = runner()
    if (newValue !== oldValue || typeof newValue === 'object') {
      cb(newValue, oldValue) // 执行回调
      oldValue = newValue     // 更新旧值
    }
  }
  const runner = effect(getter, {
    scheduler: job            // 变化时执行 job
  })
  // 初始化旧值 (同步执行一次 runner)
  oldValue = runner()
}
// ================= 使用 watch =================
const state = reactive({ count: 0, nested: { num: 1 } })
// 侦听整个对象 (深层侦听)
watch(
  () => state,
  (newVal, oldVal) => {
    console.log('数据变化了!')
  }
)
// 侦听具体属性 (精确侦听)
watch(
  () => state.count,
  (newVal, oldVal) => {
    console.log(\`count: \${oldVal} -> \${newVal}\`)
  }
)
// 修改数据触发回调
state.count++`
export const steps = [
  {
    id: 1,
    title: 'watch 的本质',
    label: 'watch本质',
    desc: 'watch 的本质是利用 effect 追踪一个数据源（getter），当数据源变化时，通过调度器执行用户传入的回调函数。',
    detail: 'watch(source, callback)\n  ↓\n将 source 转为 getter\n  ↓\n使用 effect(getter, { scheduler })\n  ↓\n数据变化 → scheduler → callback()',
    color: '#10b981',
    lines: [28, 29, 30, 31, 32, 33, 34, 35,],
    highlight: { source: true, traverse: false, job: false, callback: false },
  },
  {
    id: 2,
    title: '数据源：判断类型',
    label: '数据源',
    desc: 'watch 接收两种数据源：如果是函数，直接作为 getter；如果是响应式对象，则包装为 traverse 递归读取函数，以建立深层依赖。',
    detail: 'watch(() => state.count, cb)  // 函数：精确侦听\nwatch(state, cb)               // 对象：深层侦听\n  ↓\n对象会被包装为 () => traverse(source)',
    color: '#f59e0b',
    lines: [30, 31, 32, 33, 34, 35],
    highlight: { source: true, traverse: false, job: false, callback: false },
  },
  {
    id: 3,
    title: '递归读取 traverse',
    label: 'traverse',
    desc: '当侦听整个对象时，traverse 会递归遍历对象的所有子属性。这会触发每个属性的 get 拦截器，从而建立完整的深层依赖关系。',
    detail: 'function traverse(value, seen) {\n  for (const k in value) {\n    traverse(value[k], seen) // 递归\n  }\n}\n\nstate.nested.num 变化也能被捕捉到',
    color: '#60a5fa',
    lines: [19, 20, 21, 22, 23, 24, 25, 26, 27],
    highlight: { source: true, traverse: true, job: false, callback: false },
  },
  {
    id: 4,
    title: '调度与回调触发',
    label: '回调触发',
    desc: '当依赖数据变化时，调度器执行 job。job 重新运行 getter 获取新值，对比新旧值，如果不同则执行用户回调，并更新旧值。',
    detail: 'const job = () => {\n  newValue = runner() // 获取新值\n  if (newValue !== oldValue) {\n    cb(newValue, oldValue) // 触发回调\n    oldValue = newValue    // 更新旧值\n  }\n}',
    color: '#10b981',
    lines: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
    highlight: { source: true, traverse: false, job: true, callback: true },
  },
  {
    id: 5,
    title: '初始化旧值',
    label: '初始化',
    desc: 'watch 创建的最后，同步执行一次 runner() 获取初始值，并将其作为 oldValue 保存。这确保了第一次数据变化时，回调能拿到正确的旧值。',
    detail: 'const runner = effect(getter, { scheduler: job })\n\n// 同步执行一次，建立依赖 & 获取初始值\noldValue = runner()  // oldValue = 0',
    color: '#f59e0b',
    lines: [49, 50],
    highlight: { source: true, traverse: false, job: false, callback: false },
  },
  {
    id: 6,
    title: '触发回调执行',
    label: '触发回调',
    desc: '修改 state.count，trigger 触发调度器 job。job 重新计算 newValue=1，与 oldValue=0 对比，不同则执行回调并更新 oldValue。',
    detail: 'state.count++ (0 -> 1)\n  → trigger 触发\n  → scheduler: job() 执行\n  → newValue = 1, oldValue = 0\n  → 1 !== 0，执行回调\n  → callback(1, 0)\n  → 更新 oldValue = 1',
    color: '#ef4444',
    lines: [68,69],
    highlight: { source: true, traverse: false, job: true, callback: true },
  },
]
// 第二章：scheduler 调度的步骤配置数据
export const sourceCode = `// 当前正在执行的 effect
let activeEffect = null
// 存储依赖
const bucket = new WeakMap()
// 副作用函数 (新增 options 参数)
function effect(fn, options = {}) {
  const effectFn = () => {
    activeEffect = effectFn
    fn()
  }
  // 挂载调度器
  effectFn.options = options
  effectFn()
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
// 触发更新 (关键修改：判断调度器)
function trigger(target, key) {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)
  effects && effects.forEach(fn => {
    // 如果有调度器，则交给调度器执行
    if (fn.options.scheduler) {
      fn.options.scheduler(fn)
    } else {
      fn()
    }
  })
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
// 无调度器：同步执行
effect(() => {
  console.log(state.count) // 同步打印
})
// 有调度器：控制执行时机
const jobQueue = new Set()
const p = Promise.resolve()
function flushJob() {
  if (jobQueue.size) {
    const jobs = [...jobQueue]
    jobQueue.clear()
    jobs.forEach(fn => fn())
  }
}
function queueJob(fn) {
  jobQueue.add(fn) // 去重
  p.then(flushJob) // 异步执行
}
effect(
  () => {
    document.querySelector('#app').innerText =
      \`count: \${state.count}\`
  },
  { scheduler: queueJob }
)
// 连续修改数据
state.count++
state.count++
state.count++`
export const steps = [
  {
    id: 1,
    title: '问题：同步执行的副作用',
    label: '同步问题',
    desc: '默认情况下，每次修改响应式数据，副作用函数都会同步且立即执行。如果在短时间内连续修改多次，会导致不必要的多次渲染，性能浪费。',
    detail: 'state.count++ → 执行 effectFn (渲染)\nstate.count++ → 执行 effectFn (渲染)\nstate.count++ → 执行 effectFn (渲染)\n\n结果：渲染了 3 次，但用户只需看到最终结果 3',
    color: '#ef4444',
    lines: [58, 59, 60],
    highlight: { scheduler: false, trigger: false, queue: false },
  },
  {
    id: 2,
    title: '给 effect 挂载 options',
    label: 'effect改造',
    desc: '改造 effect 函数，为其增加第二个参数 options。我们将调度器函数 scheduler 放在 options 中，并挂载到生成的 effectFn 上。',
    detail: 'effect(fn, options)\n  ↓\neffectFn.options = options\n  ↓\neffectFn 上携带了调度器信息',
    color: '#10b981',
    lines: [7, 8, 9, 10, 11, 12, 13, 14],
    highlight: { scheduler: true, trigger: false, queue: false },
  },
  {
    id: 3,
    title: 'trigger 中的调度判断',
    label: 'trigger改造',
    desc: '在 trigger 触发依赖时，不再直接执行 effectFn，而是判断是否存在 scheduler。如果存在，则将执行权交给调度器；否则默认同步执行。',
    detail: 'effects.forEach(fn => {\n  if (fn.options.scheduler) {\n    fn.options.scheduler(fn) // 交出控制权\n  } else {\n    fn() // 默认行为\n  }\n})',
    color: '#f59e0b',
    lines: [26, 27, 28, 29, 30, 31, 32, 33, 34],
    highlight: { scheduler: true, trigger: true, queue: false },
  },
  {
    id: 4,
    title: '实现异步任务队列',
    label: '任务队列',
    desc: '实现一个基于微任务的任务队列。利用 Set 对任务去重，利用 Promise.then 将执行推迟到微任务队列，实现异步批量执行。',
    detail: 'const jobQueue = new Set()  // 去重\nconst p = Promise.resolve() // 微任务\n\nfunction flushJob() {\n  取出所有任务 → 依次执行\n}\n\nfunction queueJob(fn) {\n  jobQueue.add(fn)   // 相同effect只存一份\n  p.then(flushJob)   // 异步执行\n}',
    color: '#60a5fa',
    lines: [64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78],
    highlight: { scheduler: true, trigger: true, queue: true },
  },
  {
    id: 5,
    title: '使用调度器执行',
    label: '挂载调度器',
    desc: '在 effect 的 options 中传入 scheduler 为 queueJob。当数据变化时，trigger 不再直接执行渲染，而是将渲染函数推入队列，等待异步批量执行。',
    detail: 'effect(renderFn, { scheduler: queueJob })\n  ↓\nstate.count 变化 → trigger\n  ↓\nqueueJob(effectFn) -> 推入队列\n  ↓\n等待微任务执行 flushJob',
    color: '#10b981',
    lines: [81, 82, 83, 84, 85, 86, 87],
    highlight: { scheduler: true, trigger: true, queue: true },
  },
  {
    id: 6,
    title: '调度结果：去重与批量',
    label: '调度结果',
    desc: '连续修改 state.count 三次，虽然触发了三次 trigger，但通过队列去重，渲染函数只被推入一次，并在微任务中执行一次。实现了性能优化。',
    detail: 'state.count++ (0→1) -> 推入队列\nstate.count++ (1→2) -> 队列已存在，跳过\nstate.count++ (2→3) -> 队列已存在，跳过\n\n微任务执行：渲染 1 次，结果为 3',
    color: '#10b981',
    lines: [90, 91, 92],
    highlight: { scheduler: true, trigger: true, queue: true },
  },
]
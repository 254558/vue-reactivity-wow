// 第三章：computed 计算属性的步骤配置数据
export const sourceCode = `// 响应式系统基础 (简化版)
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
// ================= computed 实现 =================
function computed(getter) {
  // dirty 标志，true 表示需要重新计算
  let dirty = true
  // 缓存值
  let value
  // 利用 effect 追踪 getter 中的响应式数据
  const effectFn = effect(getter, {
    // 调度器：当依赖变化时，不立即计算，只标记为脏
    scheduler() {
      dirty = true
      // 手动触发 obj.value 的读取依赖
      trigger(obj, 'value')
    }
  })
  const obj = {
    get value() {
      // 只有脏的时候才重新计算
      if (dirty) {
        value = effectFn()
        dirty = false // 计算完设为干净
      }
      // 读取时收集依赖 (让 watch 等能监听 computed)
      track(obj, 'value')
      return value
    }
  }
  return obj
}
// ================= 使用 computed =================
const state = reactive({ count: 1 })
const obj = computed(() => state.count * 2)
// 第一次读取 (计算并缓存)
console.log(obj.value) // 2, dirty: true -> false
// 第二次读取 (直接返回缓存)
console.log(obj.value) // 2, dirty: false, 无需计算
// 修改依赖数据
state.count = 3
// scheduler 执行: dirty 变为 true
// 再次读取 (重新计算并缓存)
console.log(obj.value) // 6, dirty: true -> false`
export const steps = [
  {
    id: 1,
    title: 'computed 的本质',
    label: 'computed本质',
    desc: 'computed 本质上是一个带缓存特性的懒执行 effect。它不会在声明时立即执行，而是在被读取时才计算，并缓存计算结果。',
    detail: 'const obj = computed(getter)\n  ↓\n返回一个对象 { get value() { ... } }\n  ↓\n只有读取 obj.value 时，才会触发 getter 计算',
    color: '#10b981',
    lines: [19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46],
    highlight: { lazy: true, cache: false, dirty: false },
  },
  {
    id: 2,
    title: '懒执行：变量初始化',
    label: '懒执行',
    desc: '定义 dirty 标志为 true（表示需要计算），value 初始为 undefined。此时 getter 尚未执行，不消耗性能。',
    detail: 'let dirty = true  // 脏的，需要计算\nlet value          // 缓存值，初始为 undefined\n\n声明 computed 不会触发 getter 执行',
    color: '#f59e0b',
    lines: [21,22,23],
    highlight: { lazy: true, cache: false, dirty: true },
  },
  {
    id: 3,
    title: '利用 effect 追踪依赖',
    label: '追踪依赖',
    desc: '调用 effect(getter, { scheduler })。effect 会追踪 getter 内部读取的响应式数据，但不会立即执行 getter，因为我们在 getter 外层做了控制。',
    detail: 'const effectFn = effect(getter, {\n  scheduler() { ... }\n})\n\n当 getter 中的数据变化时：\n不执行 effectFn (不重新计算)\n而是执行 scheduler (标记为脏)',
    color: '#10b981',
    lines: [25,26,27,28,29,30,31,32],
    highlight: { lazy: true, cache: false, dirty: true },
  },
  {
    id: 4,
    title: '缓存机制：Dirty Flag',
    label: '缓存机制',
    desc: '当读取 obj.value 时，检查 dirty 标志。如果为 true，执行 effectFn() 计算新值并缓存，然后置 dirty 为 false；如果为 false，直接返回缓存值。',
    detail: 'get value() {\n  if (dirty) {\n    value = effectFn()  // 执行计算\n    dirty = false        // 标记为干净\n  }\n  return value           // 返回缓存值\n}',
    color: '#f59e0b',
    lines: [21,28,36,37],
    highlight: { lazy: true, cache: true, dirty: false },
  },
  {
    id: 5,
    title: '依赖不变：命中缓存',
    label: '命中缓存',
    desc: '多次读取 obj.value，由于 dirty 已经是 false，getter 不会再次执行，直接返回之前缓存的 value。这就是 computed 的性能优势。',
    detail: 'obj.value // 计算，dirty: true -> false\nobj.value // 缓存！dirty: false，跳过计算\nobj.value // 缓存！dirty: false，跳过计算\n\n无论读取多少次，getter 只执行 1 次',
    color: '#10b981',
    lines: [40,41,42,43],
    highlight: { lazy: true, cache: true, dirty: false },
  },
  {
    id: 6,
    title: '依赖变化：重新变脏',
    label: '重新变脏',
    desc: '当 state.count 变化时，调度器 scheduler 执行，将 dirty 重新设为 true。下次读取 obj.value 时，才会重新计算并更新缓存。',
    detail: 'state.count = 3\n  → trigger 触发\n  → 执行 scheduler()\n  → dirty = true (变脏)\n\n读取 obj.value\n  → dirty 为 true，重新计算\n  → value = 6, dirty = false',
    color: '#ef4444',
    lines: [54, 55, 56, 57, 58, 59],
    highlight: { lazy: true, cache: true, dirty: true },
  },
]
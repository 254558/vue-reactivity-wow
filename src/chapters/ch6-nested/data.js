// 第六章：嵌套 effect 与作用域的步骤配置数据
export const sourceCode = `// 当前正在执行的 effect
let activeEffect = null

// ❌ 问题：没有栈记录，嵌套会错乱
// function effect(fn) {
//   activeEffect = fn
//   fn()
// }

// ✅ 解决：使用 effectStack 栈结构
const effectStack = []

function effect(fn) {
  const effectFn = () => {
    activeEffect = effectFn
    // 入栈
    effectStack.push(effectFn)
    
    // 执行副作用函数 (可能发生嵌套)
    fn()
    
    // 执行完毕，出栈
    effectStack.pop()
    
    // 还原 activeEffect 为上一层的 effect
    activeEffect = effectStack[effectStack.length - 1]
  }
  
  effectFn.deps = [] // 存储该副作用关联的依赖集合
  effectFn()         // 立即执行
}

// 依赖收集
function track(target, key) {
  if (!activeEffect) return
  let depsMap = bucket.get(target)
  if (!depsMap) { depsMap = new Map(); bucket.set(target, depsMap) }
  let deps = depsMap.get(key)
  if (!deps) { deps = new Set(); depsMap.set(key, deps) }
  deps.add(activeEffect)
  activeEffect.deps.push(deps) // 双向记录
}

// 触发更新
function trigger(target, key) {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)
  effects && effects.forEach(fn => fn())
}

// 响应式
function reactive(data) {
  return new Proxy(data, {
    get(target, key) { track(target, key); return target[key] },
    set(target, key, value) { target[key] = value; trigger(target, key); return true }
  })
}

// ================= 嵌套场景 =================
const state = reactive({ show: true, text: 'Hello' })

// 外层 effect (类似父组件)
effect(() => {
  console.log('外层 effect 1 执行')
  
  if (state.show) {
    // 内层 effect (类似子组件)
    effect(() => {
      console.log('内层 effect 2 执行', state.text)
    })
  }
})

// 修改内层依赖数据
state.text = 'World'
// 应该只触发内层 effect2`

export const steps = [
  {
    id: 1,
    title: '嵌套场景：组件树',
    label: '嵌套场景',
    desc: 'Vue 的组件渲染是树状的。父组件的 render 函数内嵌套了子组件的 render 函数，这意味着 effect 也会发生嵌套。',
    detail: 'effect(() => { // 父组件渲染\n  render(Father)\n  effect(() => { // 子组件渲染\n    render(Son)\n  })\n})\n\n嵌套是组件化的必然结果',
    color: '#10b981',
    lines: [54, 55, 56, 57, 58, 59, 60, 61],
    highlight: { stack: false, push: false, pop: false, correct: false },
  },
  {
    id: 2,
    title: '问题：变量覆盖',
    label: '变量覆盖',
    desc: '如果只用单一变量 activeEffect 记录，内层 effect 执行时会覆盖外层的值。内层执行完毕后，外层的依赖就丢失了。',
    detail: 'activeEffect = 外层effect\n  外层 fn() 执行中...\n    activeEffect = 内层effect // 覆盖!\n    内层 fn() 执行...\n    内层结束\n  外层继续读取数据\n  → 此时 activeEffect 仍是内层\n  → 依赖收集错误！',
    color: '#ef4444',
    lines: [2, 3, 4, 5, 6],
    highlight: { stack: false, push: false, pop: false, correct: false },
  },
  {
    id: 3,
    title: '解决：引入 effectStack',
    label: 'effectStack',
    desc: '引入一个栈结构 effectStack。当执行 effect 时，将当前 effectFn 压入栈顶，并设置 activeEffect 为栈顶元素。',
    detail: 'const effectStack = []\n\neffectFn 执行:\n  1. 压入栈顶 (push)\n  2. activeEffect = 栈顶元素\n  3. 执行 fn()\n  4. 弹出栈顶 (pop)',
    color: '#f59e0b',
    lines: [10, 11, 12, 13, 14, 15],
    highlight: { stack: true, push: false, pop: false, correct: false },
  },
  {
    id: 4,
    title: '入栈：保存现场',
    label: '入栈',
    desc: '每次 effect 执行前，先将自己 push 到栈中。这样即使内部发生了嵌套覆盖，外层的 effect 引用也安全保存在栈的下方。',
    detail: 'effectStack.push(effectFn)\nactiveEffect = effectFn\n\n此时栈状态:\n[ 外层effect, 内层effect(栈顶) ]\nactiveEffect -> 内层effect',
    color: '#60a5fa',
    lines: [15, 16, 17],
    highlight: { stack: true, push: true, pop: false, correct: false },
  },
  {
    id: 5,
    title: '出栈：还原现场',
    label: '出栈还原',
    desc: 'effect 执行完毕后，将自己 pop 出栈，并将 activeEffect 还原为新的栈顶元素（即外层的 effect）。保证外层后续代码依赖收集正确。',
    detail: 'fn() 执行完毕\n\neffectStack.pop() // 弹出内层\n\n还原 activeEffect:\nactiveEffect = effectStack[effectStack.length - 1]\n→ activeEffect 指向外层 effect',
    color: '#10b981',
    lines: [20, 21, 22, 23],
    highlight: { stack: true, push: false, pop: true, correct: false },
  },
  {
    id: 6,
    title: '结果：精准依赖追踪',
    label: '精准追踪',
    desc: '有了栈结构，修改内层依赖数据 state.text 时，只会触发内层 effect2，不会错误地连带触发外层 effect1。',
    detail: 'state.text = "World"\n  → trigger(state, "text")\n  → 触发内层 effect2\n  → 外层 effect1 不受影响\n\n组件树的更新得以精确隔离！',
    color: '#10b981',
    lines: [65],
    highlight: { stack: true, push: false, pop: false, correct: true },
  },
]
// 第十章：组件系统的步骤配置数据
export const sourceCode = `// ================= 1. 组件的本质 =================
// 组件就是一个返回渲染函数的 JavaScript 对象
const MyComponent = {
  name: 'MyComponent',
  props: { title: String },
  setup(props, setupContext) {
    // 响应式数据 (组合式 API)
    const count = ref(0)
    const increment = () => {
      count.value++
    }
    // 返回渲染函数
    return () => {
      return h('div', null, [
        h('h2', null, props.title),
        h('p', null, count.value),
        h('button', { onClick: increment }, 'Click')
      ])
    }
  }
}
// ================= 2. 组件实例 (核心引擎) =================
function createComponentInstance(vnode) {
  const instance = {
    vnode,          // 组件自身的 VNode
    type: vnode.type, // 组件选项对象 MyComponent
    props: {},      // 组件 props (由父级传入)
    attrs: {},      // 透传属性
    setupState: null, // setup 返回的状态
    render: null,   // 渲染函数
    subTree: null,  // 组件渲染的 VNode 树 (子树)
    isMounted: false // 是否已挂载
  }
  return instance
}
// ================= 3. 挂载组件 =================
function mountComponent(vnode, container) {
  // 1. 创建组件实例
  const instance = createComponentInstance(vnode)
  vnode.component = instance // 缓存到 VNode
  // 2. 初始化 Props (从父级 VNode 传入)
  initProps(instance, vnode.props)
  // 3. 执行 setup，获取渲染函数与状态
  const render = instance.type.setup(instance.props, {})
  instance.render = render
  instance.setupState = // 代理响应式状态
  // 4. 执行渲染函数，生成子树 VNode
  const subTree = instance.render()
  instance.subTree = subTree
  // 5. 递归挂载子树 (patch)
  patch(null, subTree, container)
  instance.isMounted = true
}
// ================= 4. 更新组件 =================
function patchComponent(n1, n2, container) {
  // 获取组件实例
  const instance = n2.component = n1.component
  // 更新 Props (引起子组件更新)
  updateProps(instance, n2.props)
  // 重新执行渲染函数，生成新子树
  const prevTree = instance.subTree
  const nextTree = instance.render()
  instance.subTree = nextTree
  // Diff 比较子树并更新
  patch(prevTree, nextTree, container)
}`
export const steps = [
  {
    id: 1,
    title: '组件的本质',
    label: '组件本质',
    desc: 'Vue 组件本质上是一个包含 setup 函数的 JavaScript 对象。它接收 props，返回一个描述 UI 的渲染函数。组件是视图的抽象，而非真实的 DOM 元素。',
    detail: 'const MyComponent = {\n  props: { title: String },\n  setup(props) {\n    return () => h(\'div\', ...)\n  }\n}\n\n对象 = 组件定义\n渲染函数 = 组件输出的 UI',
    color: '#10b981',
    lines: [0,1,2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    highlight: { instance: false, setup: false, mount: false, update: false },
  },
  {
    id: 2,
    title: '组件实例：状态容器',
    label: '组件实例',
    desc: '当组件被挂载时，渲染器会为其创建一个组件实例 instance。它是一个闭包作用域，存储了组件的 props、setup 返回的响应式状态、渲染函数和子树等核心数据。',
    detail: 'instance = {\n  props,       // 父级传参\n  setupState,  // 内部状态\n  render,      // 渲染函数\n  subTree,     // 渲染产物 VNode\n  isMounted    // 生命周期标记\n}\n\n每个组件实例独立互不干扰',
    color: '#f59e0b',
    lines: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34],
    highlight: { instance: true, setup: false, mount: false, update: false },
  },
  {
    id: 3,
    title: 'setup：建立响应式',
    label: 'setup',
    desc: '执行 setup 函数，初始化组件内部的响应式状态（如 ref, reactive），并将状态与渲染函数建立依赖关系，返回渲染函数供渲染器调用。',
    detail: 'setup(props) {\n  const count = ref(0) // 创建状态\n  \n  return () => {\n    return h(\'p\', null, count.value) // 闭包引用\n  }\n}\n\n闭包使得渲染函数能访问响应式状态',
    color: '#60a5fa',
    lines: [42,43],
    highlight: { instance: true, setup: true, mount: false, update: false },
  },
  {
    id: 4,
    title: '初次挂载：渲染子树',
    label: '初次挂载',
    desc: '执行渲染函数生成 subTree（组件输出的 VNode 树），然后递归调用 patch 将 subTree 渲染为真实 DOM。标记 isMounted = true。',
    detail: '1. const subTree = render()\n2. patch(null, subTree, container)\n3. isMounted = true\n\n组件 VNode 只是壳，subTree 才是真实的 DOM 结构',
    color: '#10b981',
    lines: [46, 47, 48, 49, 50, 51, 52],
    highlight: { instance: true, setup: false, mount: true, update: false },
  },
  {
    id: 5,
    title: '更新：Props 变更',
    label: '更新Props',
    desc: '当父组件状态变化导致子组件 props 改变时，渲染器会更新组件实例的 props，这通常会导致组件内部的副作用触发，重新执行渲染。',
    detail: '父组件 state 变化\n  → 重新执行父组件 render\n  → 生成包含新 props 的子组件 VNode\n  → patchComponent 检测到 props 变化\n  → updateProps(instance, newProps)',
    color: '#8b5cf6',
    lines: [55,56,57,58],
    highlight: { instance: true, setup: false, mount: false, update: true },
  },
  {
    id: 6,
    title: '更新：Diff 子树',
    label: 'Diff子树',
    desc: '重新执行渲染函数获取新的 subTree，通过对比新旧 subTree (Diff 算法)，最小化更新真实的 DOM 节点。至此，响应式与组件系统完美闭环。',
    detail: 'const prevTree = instance.subTree\nconst nextTree = render()\ninstance.subTree = nextTree\n\npatch(prevTree, nextTree)\n  → 只更新变化的部分 DOM\n\n数据驱动视图的完整链路闭环！',
    color: '#ef4444',
    lines: [60,61,62,63,64],
    highlight: { instance: true, setup: false, mount: false, update: true },
  },
]
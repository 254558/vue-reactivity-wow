// 第七章：虚拟 DOM 的步骤配置数据
export const sourceCode = `// ================= 问题：DOM 操作的代价 =================
// 真实 DOM 属性极多，创建和更新代价高昂
const div = document.createElement('div')
// div 身上有几百个属性：
// id, title, className, style, childNodes, 
// parentNode, offsetWidth, addEventListener...
// 大部分属性我们根本用不到！
// ================= 解决：虚拟 DOM (VNode) =================
// 用纯 JS 对象描述真实 DOM 结构
function h(tag, props, children) {
  return {
    tag,          // 标签名: 'div', 'span'
    props,        // 属性: { id: 'app', class: 'container' }
    children,     // 子节点: 字符串或 VNode 数组
    el: null      // 挂载的真实 DOM 引用 (初始为空)
  }
}
// 创建 VNode (极其轻量)
const vnode = h('div', { id: 'app' }, [
  h('p', null, 'Hello'),
  h('span', { class: 'highlight' }, 'Vue')
])
// ================= 渲染器：VNode → 真实 DOM =================
function mountElement(vnode, container) {
  // 1. 创建真实 DOM
  const el = document.createElement(vnode.tag)
  // 2. 处理 props
  if (vnode.props) {
    for (const key in vnode.props) {
      el.setAttribute(key, vnode.props[key])
    }
  }
  // 3. 处理 children
  if (Array.isArray(vnode.children)) {
    vnode.children.forEach(child => {
      mountElement(child, el) // 递归挂载子节点
    })
  } else if (typeof vnode.children === 'string') {
    el.textContent = vnode.children
  }
  // 4. 缓存真实 DOM 引用
  vnode.el = el
  // 5. 挂载到容器
  container.appendChild(el)
}
// ================= 挂载使用 =================
const app = document.querySelector('#app')
mountElement(vnode, app)`
export const steps = [
  {
    id: 1,
    title: '真实 DOM 的性能瓶颈',
    label: 'DOM瓶颈',
    desc: '真实 DOM 是由浏览器实现的庞大结构，每个元素都继承上百个属性和方法。频繁操作真实 DOM 会触发重排重绘，代价极高。',
    detail: 'document.createElement(\'div\')\n  ↓\n生成一个包含数百个属性的 DOM 对象:\n  style, classList, childNodes,\n  parentNode, addEventListener...\n\n我们只需要 3-4 个属性，却要创建整个对象',
    color: '#ef4444',
    lines: [0, 1, 2, 3, 4, 5, 6],
    highlight: { problem: true, h: false, mount: false, result: false },
  },
  {
    id: 2,
    title: 'VNode：轻量级描述',
    label: 'VNode结构',
    desc: 'VNode 是用纯 JavaScript 对象描述的 DOM 结构，只包含必要信息：标签名、属性、子节点。创建和比较 JS 对象的性能远高于操作 DOM。',
    detail: '{\n  tag: \'div\',\n  props: { id: \'app\' },\n  children: [...],\n  el: null\n}\n\n只包含 4 个关键属性，极其轻量',
    color: '#10b981',
    lines: [7,8,9,10,11,12,13,14,15,16],
    highlight: { problem: false, h: true, mount: false, result: false },
  },
  {
    id: 3,
    title: 'h 函数：创建 VNode',
    label: 'h函数',
    desc: 'h 函数（hyperscript）是创建 VNode 的工厂。它接收标签、属性和子节点，返回一个 VNode 对象。嵌套调用 h 可以描述任意深度的 DOM 树。',
    detail: 'h(\'div\', { id: \'app\' }, [\n  h(\'p\', null, \'Hello\'),\n  h(\'span\', { class: \'hl\' }, \'Vue\')\n])\n\n嵌套 h 调用 = DOM 树的深度描述',
    color: '#f59e0b',
    lines: [17,18,19,20,21],
    highlight: { problem: false, h: true, mount: false, result: false },
  },
  {
    id: 4,
    title: '渲染器：createElement',
    label: '创建DOM',
    desc: '渲染器负责将 VNode 转换为真实 DOM。第一步是根据 vnode.tag 创建真实的 DOM 元素。',
    detail: 'const el = document.createElement(vnode.tag)\n\n\'div\' → <div></div>\n\'p\'   → <p></p>\n\n此时 el 还是一个空壳，没有属性和内容',
    color: '#60a5fa',
    lines: [24,25],
    highlight: { problem: false, h: false, mount: true, result: false },
  },
  {
    id: 5,
    title: '渲染器：属性与子节点',
    label: '属性与子节点',
    desc: '遍历 vnode.props 设置 DOM 属性，递归处理 vnode.children。如果是数组则递归 mountElement，如果是字符串则设置 textContent。',
    detail: 'for (key in props) {\n  el.setAttribute(key, props[key])\n}\n\nchildren.forEach(child => {\n  mountElement(child, el) // 递归\n})\n\n文本节点: el.textContent = children',
    color: '#10b981',
    lines: [26,27,28,29,30,31,32,33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44],
    highlight: { problem: false, h: false, mount: true, result: false },
  },
  {
    id: 6,
    title: '缓存与挂载',
    label: '挂载DOM',
    desc: '将创建的真实 DOM 引用缓存在 vnode.el 上（后续更新需要），最后将 DOM 挂载到容器中，页面完成渲染。',
    detail: 'vnode.el = el       // 缓存引用\ncontainer.appendChild(el) // 挂载\n\n关键：缓存 el 使得后续 patch 时\n可以直接通过 vnode.el 访问旧 DOM',
    color: '#f59e0b',
    lines: [45,46, 47, 48, 49],
    highlight: { problem: false, h: false, mount: true, result: true },
  },
]
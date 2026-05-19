// 第八章：Diff 算法的步骤配置数据
export const sourceCode = `// ================= Patch 更新入口 =================
function patch(n1, n2, container) {
  if (n1.tag !== n2.tag) {
    replaceVNode(n1, n2, container)
  } else {
    patchElement(n1, n2, container)
  }
}
// ================= 更新子节点 (核心 Diff) =================
function patchChildren(n1, n2, container) {
  const oldChildren = n1.children
  const newChildren = n2.children
  let oldStartIdx = 0
  let oldEndIdx = oldChildren.length - 1
  let newStartIdx = 0
  let newEndIdx = newChildren.length - 1
  let oldStartVNode = oldChildren[oldStartIdx]
  let oldEndVNode = oldChildren[oldEndIdx]
  let newStartVNode = newChildren[newStartIdx]
  let newEndVNode = newChildren[newEndIdx]
  // 1. 双端比较循环
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (oldStartVNode.key === newStartVNode.key) {
      // 头-头匹配：无需移动
      patch(oldStartVNode, newStartVNode, container)
      oldStartVNode = oldChildren[++oldStartIdx]
      newStartVNode = newChildren[++newStartIdx]
    } else if (oldEndVNode.key === newEndVNode.key) {
      // 尾-尾匹配：无需移动
      patch(oldEndVNode, newEndVNode, container)
      oldEndVNode = oldChildren[--oldEndIdx]
      newEndVNode = newChildren[--newEndIdx]
    } else if (oldStartVNode.key === newEndVNode.key) {
      // 头-尾匹配：移动到尾部
      patch(oldStartVNode, newEndVNode, container)
      insert(oldStartVNode.el, container, oldEndVNode.el.nextSibling)
      oldStartVNode = oldChildren[++oldStartIdx]
      newEndVNode = newChildren[--newEndIdx]
    } else if (oldEndVNode.key === newStartVNode.key) {
      // 尾-头匹配：移动到头部
      patch(oldEndVNode, newStartVNode, container)
      insert(oldEndVNode.el, container, oldStartVNode.el)
      oldEndVNode = oldChildren[--oldEndIdx]
      newStartVNode = newChildren[++newStartIdx]
    } else {
      // 2. 都不匹配：查找旧节点索引
      const idxInOld = oldChildren.findIndex(
        node => node.key === newStartVNode.key
      )
      if (idxInOld > 0) {
        // 找到：移动到头部
        const vnodeToMove = oldChildren[idxInOld]
        patch(vnodeToMove, newStartVNode, container)
        insert(vnodeToMove.el, container, oldStartVNode.el)
        oldChildren[idxInOld] = undefined // 标记已处理
      } else {
        // 未找到：新增节点
        mountElement(newStartVNode, container, oldStartVNode.el)
      }
      newStartVNode = newChildren[++newStartIdx]
    }
  }
  // 3. 循环结束：处理新增或卸载
  if (oldEndIdx < oldStartIdx) {
    // 旧节点遍历完，新节点有剩余 → 新增
    for (let i = newStartIdx; i <= newEndIdx; i++) {
      mountElement(newChildren[i], container)
    }
  } else if (newEndIdx < newStartIdx) {
    // 新节点遍历完，旧节点有剩余 → 卸载
    for (let i = oldStartIdx; i <= oldEndIdx; i++) {
      unmount(oldChildren[i])
    }
  }
}`
export const steps = [
  {
    id: 1,
    title: '双端 Diff 的目标',
    label: 'Diff目标',
    desc: 'Diff 算法的目标是最小化 DOM 操作。通过比较新旧 VNode 子节点数组，找到最少的移动、新增和删除操作，复用已有的真实 DOM。',
    detail: '旧: [A, B, C, D, E]\n新: [A, C, D, B, F]\n\n不使用 Diff: 卸载全部 5 个 + 新增 5 个 = 10 次\n使用 Diff: 移动 1 个 + 新增 1 个 + 卸载 1 个 = 3 次',
    color: '#10b981',
    lines: [1, 2, 3, 4, 5, 6, 7],
    highlight: { head: false, tail: false, cross: false, find: false, result: false },
  },
  {
    id: 2,
    title: '头-头 & 尾-尾比较',
    label: '头尾比较',
    desc: '从新旧子节点数组的两端同时开始比较。如果头-头或尾-尾的 key 相同，说明相对位置没变，无需移动 DOM，直接 patch 深度更新。',
    detail: '旧: [A, B, C, D]\n新: [A, E, C, D]\n\n头-头: A === A → 匹配，直接更新\n尾-尾: D === D → 匹配，直接更新\n\n指针向中间收缩',
    color: '#60a5fa',
    lines: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32],
    highlight: { head: true, tail: true, cross: false, find: false, result: false },
  },
  {
    id: 3,
    title: '头-尾 & 尾-头比较',
    label: '交叉比较',
    desc: '如果两端不匹配，则交叉比较：旧头与新尾、旧尾与新头。如果匹配，说明节点发生了整体位移，需要调用 insertBefore 移动真实 DOM。',
    detail: '旧: [A, B, C, D]\n新: [D, A, B, C]\n\n旧头 A !== 新头 D\n旧尾 D === 新头 D → 匹配！\n→ 将 D 移动到最前面\n\n交叉匹配最大优势：快速定位大跨度移动',
    color: '#f59e0b',
    lines: [33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
    highlight: { head: false, tail: false, cross: true, find: false, result: false },
  },
  {
    id: 4,
    title: '处理非理想情况',
    label: '查找索引',
    desc: '如果双端都不匹配，只能拿新头节点去旧节点数组中遍历查找。找到了就移动到头部，找不到就挂载新节点。',
    detail: '旧: [A, B, C, D]\n新: [E, A, B, C]\n\n双端都不匹配\n在旧数组中查找 E → 未找到\n→ mountElement(E) 新增节点\n\n性能瓶颈：O(n) 遍历查找',
    color: '#ef4444',
    lines: [47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61],
    highlight: { head: false, tail: false, cross: false, find: true, result: false },
  },
  {
    id: 5,
    title: '添加与删除',
    label: '增删处理',
    desc: '双端循环结束后，如果旧节点数组先遍历完（新节点有剩余），则新增节点；如果新节点数组先遍历完（旧节点有剩余），则卸载多余节点。',
    detail: '新增: oldEndIdx < oldStartIdx\n卸载: newEndIdx < newStartIdx\n\n确保新旧 VNode 树完全同步',
    color: '#10b981',
    lines: [64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75],
    highlight: { head: false, tail: false, cross: false, find: false, result: true },
  },
  {
    id: 6,
    title: '优化：最长递增子序列',
    label: 'LIS优化',
    desc: 'Vue3 对非理想情况做了优化：通过求新旧节点索引映射的最长递增子序列(LIS)，只需移动不在子序列中的节点，极大减少了 DOM 移动次数。',
    detail: '新: [B, A, C, D]\n旧索引映射: [1, 0, 2, 3]\nLIS: [0, 2, 3] → 对应 A, C, D\n\n只有 B 不在 LIS 中\n→ 只需移动 B，其他保持不动！',
    color: '#8b5cf6',
    lines: [47, 48],
    highlight: { head: false, tail: false, cross: false, find: true, result: true },
  },
]
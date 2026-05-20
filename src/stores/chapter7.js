import { defineStore } from 'pinia'
import { ref } from 'vue'
import { steps } from '@/chapters/ch7-vnode/data'
import { useChapterBase } from './useChapterBase'

export const useChapter7Store = defineStore('chapter7', () => {
  const base = useChapterBase(steps)

  // 演示状态
  const domProperties = ref(0)
  const vnodeProperties = ref(0)
  const isMounting = ref(false)
  const mountPhase = ref('idle')

  // 模拟真实 DOM 属性计数
  function simulateDOMCount() {
    domProperties.value = 0
    const interval = setInterval(() => {
      domProperties.value += Math.floor(Math.random() * 30) + 10
      if (domProperties.value >= 268) {
        domProperties.value = 268
        clearInterval(interval)
      }
    }, 50)
  }

  // 模拟 VNode 属性计数
  function simulateVNodeCreate() {
    vnodeProperties.value = 0
    const target = 4
    const interval = setInterval(() => {
      vnodeProperties.value++
      if (vnodeProperties.value >= target) {
        clearInterval(interval)
      }
    }, 150)
  }

  // 模拟挂载流程
  function simulateMount() {
    if (!base.canInteract.value || isMounting.value) return
    isMounting.value = true
    const phases = ['create', 'props', 'children', 'cache', 'append']
    let i = 0
    const runPhase = () => {
      if (i >= phases.length) {
        isMounting.value = false
        mountPhase.value = 'idle'
        base.logAction('渲染完成', 'VNode 树已完整挂载为真实 DOM')
        return
      }
      mountPhase.value = phases[i]
      const labels = {
        create: '创建 <div> 元素',
        props: '设置 id="app" 属性',
        children: '递归挂载子节点 <p> 和 <span>',
        cache: '缓存 el 引用到 vnode.el',
        append: 'appendChild 到容器'
      }
      base.logAction(phases[i], labels[phases[i]])
      i++
      setTimeout(runPhase, 600)
    }
    runPhase()
  }

  function reset() {
    base.resetBase()
    domProperties.value = 0
    vnodeProperties.value = 0
    isMounting.value = false
    mountPhase.value = 'idle'
  }

  return {
    ...base,
    domProperties, vnodeProperties, isMounting, mountPhase,
    simulateDOMCount, simulateVNodeCreate, simulateMount, reset
  }
})

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { steps } from '@/chapters/ch7-vnode/data'
export const useChapter7Store = defineStore('chapter7', () => {
  const currentStep = ref(1)
  const totalSteps = steps.length
  // 演示状态
  const domProperties = ref(0)
  const vnodeProperties = ref(0)
  const isMounting = ref(false)
  const mountPhase = ref('idle') // 'idle', 'create', 'props', 'children', 'cache', 'append'
  const triggerLogs = ref([])
  const currentStepData = computed(() => steps[currentStep.value - 1])
  const activeLines = computed(() => currentStepData.value?.lines || [])
  const canInteract = computed(() => currentStep.value >= totalSteps)
  function nextStep() {
    if (currentStep.value < totalSteps) {
      currentStep.value++
      if (currentStep.value === 1) simulateDOMCount()
    }
  }
  function prevStep() { if (currentStep.value > 1) currentStep.value-- }
  function goToStep(n) { if (n >= 1 && n <= currentStep.value) currentStep.value = n }
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
  // 模拟 VNode 创建
  function simulateVNodeCreate() {
    vnodeProperties.value = 0
    const target = 4
    const interval = setInterval(() => {
      vnodeProperties.value++
      if (vnodeProperties.value >= target) clearInterval(interval)
    }, 150)
  }
  // 模拟挂载流程
  function simulateMount() {
    if (!canInteract.value || isMounting.value) return
    isMounting.value = true
    const phases = ['create', 'props', 'children', 'cache', 'append']
    let i = 0
    const runPhase = () => {
      if (i >= phases.length) {
        isMounting.value = false
        mountPhase.value = 'idle'
        logAction('渲染完成', 'VNode 树已完整挂载为真实 DOM')
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
      logAction(phases[i], labels[phases[i]])
      i++
      setTimeout(runPhase, 600)
    }
    runPhase()
  }
  function logAction(type, detail) {
    const now = new Date()
    const time = [now.getHours(), now.getMinutes(), now.getSeconds()]
      .map(v => String(v).padStart(2, '0')).join(':')
    triggerLogs.value.unshift({ type, detail, time })
    if (triggerLogs.value.length > 20) triggerLogs.value.pop()
  }
  function reset() {
    currentStep.value = 1
    domProperties.value = 0
    vnodeProperties.value = 0
    isMounting.value = false
    mountPhase.value = 'idle'
    triggerLogs.value = []
  }
  return {
    currentStep, totalSteps, steps,
    domProperties, vnodeProperties, isMounting, mountPhase, triggerLogs,
    currentStepData, activeLines, canInteract,
    nextStep, prevStep, goToStep, simulateMount, reset
  }
})
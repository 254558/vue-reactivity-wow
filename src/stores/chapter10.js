import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { steps } from '@/chapters/ch10-component/data'
export const useChapter10Store = defineStore('chapter10', () => {
  const currentStep = ref(1)
  const totalSteps = steps.length
  // 演示状态
  const parentCount = ref(0)
  const childCount = ref(0)
  const childPropTitle = ref('Initial Title')
  const isMounted = ref(false)
  const isUpdating = ref(false)
  const triggerLogs = ref([])
  const currentStepData = computed(() => steps[currentStep.value - 1])
  const activeLines = computed(() => currentStepData.value?.lines || [])
  const hasLogs = computed(() => triggerLogs.value.length > 0)
  // 核心交互权限控制
  const canInteract = computed(() => currentStep.value >= totalSteps)
  const canMount = computed(() => currentStep.value >= 4)
  function nextStep() {
    if (currentStep.value < totalSteps) currentStep.value++
  }
  function prevStep() { if (currentStep.value > 1) currentStep.value-- }
  function goToStep(n) { if (n >= 1 && n <= currentStep.value) currentStep.value = n }
  function simulateMount() {
    if (isMounted.value || !canMount.value) return
    isMounted.value = true
    logAction('mount', '创建实例，执行 setup，patch 子树')
  }
  function simulateParentUpdate() {
    if (!canInteract.value || isUpdating.value || !isMounted.value) return
    isUpdating.value = true
    parentCount.value++
    childPropTitle.value = `Title ${parentCount.value}`
    logAction('patch', `父组件更新，传递新 props: { title: "${childPropTitle.value}" }`)
    setTimeout(() => {
      logAction('diff', '重新执行 render，对比新旧 subTree，更新 DOM')
      isUpdating.value = false
    }, 600)
  }
  function simulateChildUpdate() {
    if (!canInteract.value || isUpdating.value || !isMounted.value) return
    isUpdating.value = true
    childCount.value++
    logAction('self', `子组件内部更新，setupState.count 变为 ${childCount.value}`)
    setTimeout(() => {
      logAction('diff', '重新执行 render，对比新旧 subTree，更新 DOM')
      isUpdating.value = false
    }, 600)
  }
  function logAction(type, detail) {
    const now = new Date()
    const time = [now.getHours(), now.getMinutes(), now.getSeconds()]
      .map(v => String(v).padStart(2, '0')).join(':')
    const typeMap = {
      mount: { class: 'mount', text: 'Mount' },
      patch: { class: 'patch', text: 'Patch' },
      diff:  { class: 'diff',  text: 'Diff' },
      self:  { class: 'self',  text: 'Self' }
    }
    triggerLogs.value.unshift({ 
      type: typeMap[type]?.text || type, 
      typeClass: typeMap[type]?.class || type,
      detail, 
      time 
    })
    if (triggerLogs.value.length > 20) triggerLogs.value.pop()
  }
  function reset() {
    currentStep.value = 1
    parentCount.value = 0
    childCount.value = 0
    childPropTitle.value = 'Initial Title'
    isMounted.value = false
    isUpdating.value = false
    triggerLogs.value = []
  }
  return {
    currentStep, totalSteps, steps,
    parentCount, childCount, childPropTitle, isMounted, isUpdating, triggerLogs, hasLogs,
    currentStepData, activeLines, canInteract, canMount,
    nextStep, prevStep, goToStep, simulateMount, simulateParentUpdate, simulateChildUpdate, reset
  }
})
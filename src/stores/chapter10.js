import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { steps } from '@/chapters/ch10-component/data'
export const useChapter10Store = defineStore('chapter10', () => {
  const currentStep = ref(1)
  const totalSteps = steps.length
  // 演示状态
  const parentCount = ref(0)
  const childPropTitle = ref('Initial Title')
  const isMounted = ref(false)
  const isUpdating = ref(false)
  const triggerLogs = ref([])
  const currentStepData = computed(() => steps[currentStep.value - 1])
  const activeLines = computed(() => currentStepData.value?.lines || [])
  const canInteract = computed(() => currentStep.value >= totalSteps)
  function nextStep() {
    if (currentStep.value < totalSteps) currentStep.value++
  }
  function prevStep() { if (currentStep.value > 1) currentStep.value-- }
  function goToStep(n) { if (n >= 1 && n <= currentStep.value) currentStep.value = n }
  // 模拟挂载
  function simulateMount() {
    if (isMounted.value) return
    isMounted.value = true
    logAction('mountComponent', '创建实例，执行 setup，patch 子树')
  }
  // 模拟父组件更新，传递新 Props
  function simulateParentUpdate() {
    if (!canInteract.value || isUpdating.value) return
    isUpdating.value = true
    parentCount.value++
    childPropTitle.value = `Title ${parentCount.value}`
    logAction('patchComponent', `父组件更新，传递新 props: { title: "${childPropTitle.value}" }`)
    setTimeout(() => {
      logAction('Diff 子树', '重新执行 render，对比新旧 subTree，更新 DOM')
      isUpdating.value = false
    }, 600)
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
    parentCount.value = 0
    childPropTitle.value = 'Initial Title'
    isMounted.value = false
    isUpdating.value = false
    triggerLogs.value = []
  }
  return {
    currentStep, totalSteps, steps,
    parentCount, childPropTitle, isMounted, isUpdating, triggerLogs,
    currentStepData, activeLines, canInteract,
    nextStep, prevStep, goToStep, simulateMount, simulateParentUpdate, reset
  }
})
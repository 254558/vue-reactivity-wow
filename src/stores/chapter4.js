import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { steps } from '@/chapters/ch4-watch/data'
export const useChapter4Store = defineStore('chapter4', () => {
  const currentStep = ref(1)
  const totalSteps = steps.length
  // 演示用的状态
  const count = ref(0)
  const nestedNum = ref(1)
  // watch 模拟状态
  const oldValue = ref(null)
  const newValue = ref(null)
  const isTraversing = ref(false)
  const isCallbackFiring = ref(false)
  const traverseDepth = ref(0)
  const triggerLogs = ref([])
  const currentStepData = computed(() => steps[currentStep.value - 1])
  const activeLines = computed(() => currentStepData.value?.lines || [])
  const canInteract = computed(() => currentStep.value >= totalSteps)
  function nextStep() {
    if (currentStep.value < totalSteps) {
      currentStep.value++
      // 步骤5时自动初始化旧值
      if (currentStep.value === 5 && oldValue.value === null) {
        simulateInit()
      }
    }
  }
  function prevStep() { if (currentStep.value > 1) currentStep.value-- }
  function goToStep(n) { if (n >= 1 && n <= currentStep.value) currentStep.value = n }
  // 模拟 traverse 递归
  function simulateTraverse() {
    isTraversing.value = true
    traverseDepth.value = 0
    const interval = setInterval(() => {
      traverseDepth.value++
      if (traverseDepth.value >= 3) {
        clearInterval(interval)
        isTraversing.value = false
      }
    }, 400)
  }
  // 模拟初始化
  function simulateInit() {
    oldValue.value = count.value
    logAction('初始化', `runner() 执行，获取初始值: ${oldValue.value}`)
  }
  // 模拟修改 count
  function simulateChangeCount() {
    if (!canInteract.value) return
    const prev = count.value
    count.value++
    newValue.value = count.value
    isCallbackFiring.value = true
    setTimeout(() => {
      isCallbackFiring.value = false
      logAction('回调触发', `count: ${prev} -> ${count.value}`)
      oldValue.value = count.value
      newValue.value = null
    }, 500)
  }
  // 模拟修改嵌套属性
  function simulateChangeNested() {
    if (!canInteract.value) return
    const prev = nestedNum.value
    nestedNum.value++
    newValue.value = nestedNum.value
    isCallbackFiring.value = true
    setTimeout(() => {
      isCallbackFiring.value = false
      logAction('深层回调触发', `nested.num: ${prev} -> ${nestedNum.value}`)
      oldValue.value = nestedNum.value
      newValue.value = null
    }, 500)
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
    count.value = 0
    nestedNum.value = 1
    oldValue.value = null
    newValue.value = null
    isTraversing.value = false
    isCallbackFiring.value = false
    traverseDepth.value = 0
    triggerLogs.value = []
  }
  return {
    currentStep, totalSteps, steps,
    count, nestedNum, oldValue, newValue,
    isTraversing, isCallbackFiring, traverseDepth,
    triggerLogs,
    currentStepData, activeLines, canInteract,
    nextStep, prevStep, goToStep,
    simulateTraverse, simulateInit, simulateChangeCount, simulateChangeNested, reset
  }
})
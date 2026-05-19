import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { steps } from '@/chapters/ch3-computed/data'
export const useChapter3Store = defineStore('chapter3', () => {
  const currentStep = ref(1)
  const totalSteps = steps.length
  // 演示用的状态
  const reactiveCount = ref(1)
  const dirty = ref(true)
  const cachedValue = ref(undefined)
  const getterCallCount = ref(0)
  const readCount = ref(0)
  const isComputing = ref(false)
  const triggerLogs = ref([])
  const currentStepData = computed(() => steps[currentStep.value - 1])
  const activeLines = computed(() => currentStepData.value?.lines || [])
  const canInteract = computed(() => currentStep.value >= totalSteps)
  // computed 模拟值
  const computedDisplay = computed(() => {
    if (cachedValue.value === undefined) return 'undefined'
    return cachedValue.value
  })
  function nextStep() {
    if (currentStep.value < totalSteps) currentStep.value++
    // 步骤5时，如果还没计算过，自动触发一次模拟读取
    if (currentStep.value === 5 && cachedValue.value === undefined) {
      simulateRead()
    }
  }
  function prevStep() { if (currentStep.value > 1) currentStep.value-- }
  function goToStep(n) { if (n >= 1 && n <= currentStep.value) currentStep.value = n }
  // 模拟读取 obj.value
  function simulateRead() {
    readCount.value++
    if (dirty.value) {
      // 需要计算
      isComputing.value = true
      setTimeout(() => {
        getterCallCount.value++
        cachedValue.value = reactiveCount.value * 2
        dirty.value = false
        isComputing.value = false
        logAction('读取 (计算)', `dirty: true -> false, 值: ${cachedValue.value}`)
      }, 300)
    } else {
      // 命中缓存
      logAction('读取 (缓存)', `dirty: false, 返回缓存值: ${cachedValue.value}`)
    }
  }
  // 模拟修改 state.count
  function simulateChange() {
    reactiveCount.value++
    dirty.value = true
    logAction('修改数据', `count: ${reactiveCount.value - 1} -> ${reactiveCount.value}, dirty: true`)
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
    reactiveCount.value = 1
    dirty.value = true
    cachedValue.value = undefined
    getterCallCount.value = 0
    readCount.value = 0
    isComputing.value = false
    triggerLogs.value = []
  }
  return {
    currentStep, totalSteps, steps,
    reactiveCount, dirty, cachedValue, computedDisplay, getterCallCount, readCount, isComputing,
    triggerLogs,
    currentStepData, activeLines, canInteract,
    nextStep, prevStep, goToStep, simulateRead, simulateChange, reset
  }
})
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { steps } from '@/chapters/ch2-scheduler/data'
export const useChapter2Store = defineStore('chapter2', () => {
  const currentStep = ref(1)
  const totalSteps = steps.length
  // 演示用的状态
  const syncCount = ref(0)       // 无调度器时的执行次数
  const asyncCount = ref(0)      // 有调度器时的执行次数
  const dataValue = ref(0)       // state.count 的值
  const queueSize = ref(0)       // 当前队列大小
  const isFlushing = ref(false)  // 是否正在刷新队列
  const triggerLogs = ref([])
  const currentStepData = computed(() => steps[currentStep.value - 1])
  const activeLines = computed(() => currentStepData.value?.lines || [])
  const canIncrement = computed(() => currentStep.value >= totalSteps)
  function nextStep() {
    if (currentStep.value < totalSteps) currentStep.value++
  }
  function prevStep() {
    if (currentStep.value > 1) currentStep.value--
  }
  function goToStep(n) {
    if (n >= 1 && n <= currentStep.value) currentStep.value = n
  }
  // 模拟连续触发 3 次 ++
  function simulateIncrement() {
    if (!canIncrement.value) return
    // 重置本次演示状态
    syncCount.value = 0
    asyncCount.value = 0
    queueSize.value = 0
    // 模拟 3 次同步触发
    for (let i = 0; i < 3; i++) {
      dataValue.value++
      syncCount.value++ // 无调度器：每次都执行
      // 有调度器：推入队列，利用 Set 去重，只推入一次
      if (queueSize.value === 0) {
        queueSize.value = 1 // 模拟推入队列
      }
    }
    // 模拟微任务刷新
    isFlushing.value = true
    setTimeout(() => {
      asyncCount.value = 1 // 队列刷新，只执行一次
      queueSize.value = 0
      isFlushing.value = false
      const now = new Date()
      const time = [now.getHours(), now.getMinutes(), now.getSeconds()]
        .map(v => String(v).padStart(2, '0')).join(':')
      triggerLogs.value.unshift({
        sync: syncCount.value,
        async: asyncCount.value,
        value: dataValue.value,
        time
      })
      if (triggerLogs.value.length > 20) triggerLogs.value.pop()
    }, 600)
  }
  function reset() {
    currentStep.value = 1
    syncCount.value = 0
    asyncCount.value = 0
    dataValue.value = 0
    queueSize.value = 0
    isFlushing.value = false
    triggerLogs.value = []
  }
  return {
    currentStep, totalSteps, steps,
    syncCount, asyncCount, dataValue, queueSize, isFlushing, triggerLogs,
    currentStepData, activeLines, canIncrement,
    nextStep, prevStep, goToStep, simulateIncrement, reset
  }
})
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { steps } from '@/chapters/ch2-scheduler/data'
export const useChapter2Store = defineStore('chapter2', () => {
  const currentStep = ref(1)
  const totalSteps = steps.length
  const totalSyncCount = ref(0)
  const totalAsyncCount = ref(0)
  const dataValue = ref(0)
  const queueSize = ref(0)
  const isFlushing = ref(false)
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
  function simulateIncrement() {
    if (isFlushing.value || !canIncrement.value) return
    const asyncCountBeforeThisTrigger = totalAsyncCount.value
    let currentSyncIncrement = 0
    for (let i = 0; i < 3; i++) {
      dataValue.value++
      totalSyncCount.value++
      currentSyncIncrement++
      if (queueSize.value === 0) {
        queueSize.value = 1
      }
    }
    isFlushing.value = true
    setTimeout(() => {
      totalAsyncCount.value++
      queueSize.value = 0
      isFlushing.value = false
      const now = new Date()
      const time = [now.getHours(), now.getMinutes(), now.getSeconds()]
        .map(v => String(v).padStart(2, '0')).join(':')
      triggerLogs.value.unshift({
        sync: currentSyncIncrement,
        async: totalAsyncCount.value - asyncCountBeforeThisTrigger,
        value: dataValue.value,
        time
      })
      if (triggerLogs.value.length > 20) triggerLogs.value.pop()
    }, 600)
  }
  function reset() {
    currentStep.value = 1
    totalSyncCount.value = 0
    totalAsyncCount.value = 0
    dataValue.value = 0
    queueSize.value = 0
    isFlushing.value = false
    triggerLogs.value = []
  }
  return {
    currentStep, totalSteps, steps,
    totalSyncCount, totalAsyncCount,
    dataValue, queueSize, isFlushing, triggerLogs,
    currentStepData, activeLines, canIncrement,
    nextStep, prevStep, goToStep, simulateIncrement, reset
  }
})
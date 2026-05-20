import { ref, computed } from 'vue'

export function useChapterBase(steps) {
  const currentStep = ref(1)
  const totalSteps = steps.length
  const triggerLogs = ref([])

  const currentStepData = computed(() => steps[currentStep.value - 1])
  const activeLines = computed(() => currentStepData.value?.lines || [])
  const canInteract = computed(() => currentStep.value >= totalSteps)

  function nextStep() {
    if (currentStep.value < totalSteps) currentStep.value++
  }
  function prevStep() {
    if (currentStep.value > 1) currentStep.value--
  }
  function goToStep(n) {
    if (n >= 1 && n <= currentStep.value) currentStep.value = n
  }

  function logAction(type, detail) {
    const now = new Date()
    const time = [now.getHours(), now.getMinutes(), now.getSeconds()]
      .map(v => String(v).padStart(2, '0')).join(':')
    triggerLogs.value.unshift({ type, detail, time })
    if (triggerLogs.value.length > 20) triggerLogs.value.pop()
  }

  function resetBase() {
    currentStep.value = 1
    triggerLogs.value = []
  }

  return {
    currentStep, totalSteps, steps, triggerLogs,
    currentStepData, activeLines, canInteract,
    nextStep, prevStep, goToStep,
    logAction, resetBase,
  }
}

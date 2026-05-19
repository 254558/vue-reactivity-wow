import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { steps } from '@/chapters/ch5-ref/data'

export const useChapter5Store = defineStore('chapter5', () => {
  const currentStep = ref(1)
  const totalSteps = steps.length

  // 演示用的状态
  const primitiveVal = ref(0)
  const isUnwrapped = ref(false)
  const isTracking = ref(false)
  const isTriggering = ref(false)
  const accessMode = ref('none') // 'none', 'value', 'direct'
  const triggerLogs = ref([])

  const currentStepData = computed(() => steps[currentStep.value - 1])
  const activeLines = computed(() => currentStepData.value?.lines || [])
  const canInteract = computed(() => currentStep.value >= totalSteps)

  function nextStep() {
    if (currentStep.value < totalSteps) {
      currentStep.value++
      // 步骤5开启自动脱 ref
      if (currentStep.value === 5) isUnwrapped.value = true
    }
  }
  function prevStep() {
    if (currentStep.value > 1) currentStep.value--
  }
  function goToStep(n) {
    if (n >= 1 && n <= currentStep.value) currentStep.value = n
  }

  // 模拟通过 .value 读取 (步骤4)
  function simulateReadValue() {
    accessMode.value = 'value'
    isTracking.value = true
    logAction('get (track)', `count.value → ${primitiveVal.value}`)
    setTimeout(() => { isTracking.value = false }, 500)
  }

  // 模拟通过 .value 修改
  function simulateWriteValue() {
    const old = primitiveVal.value
    primitiveVal.value++
    isTriggering.value = true
    accessMode.value = 'value'
    logAction('set (trigger)', `count.value: ${old} → ${primitiveVal.value}`)
    setTimeout(() => { isTriggering.value = false }, 500)
  }

  // 模拟直接读取 (自动脱 ref，步骤5/6)
  function simulateReadDirect() {
    if (!isUnwrapped.value) return
    accessMode.value = 'direct'
    isTracking.value = true
    logAction('get (自动脱ref)', `obj.count → 内部读取 .value → ${primitiveVal.value}`)
    setTimeout(() => { isTracking.value = false }, 500)
  }

  // 模拟直接修改 (自动脱 ref)
  function simulateWriteDirect() {
    if (!isUnwrapped.value) return
    const old = primitiveVal.value
    primitiveVal.value++
    isTriggering.value = true
    accessMode.value = 'direct'
    logAction('set (自动脱ref)', `obj.count = ${primitiveVal.value} → 内部设置 .value`)
    setTimeout(() => { isTriggering.value = false }, 500)
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
    primitiveVal.value = 0
    isUnwrapped.value = false
    isTracking.value = false
    isTriggering.value = false
    accessMode.value = 'none'
    triggerLogs.value = []
  }

  return {
    currentStep, totalSteps, steps,
    primitiveVal, isUnwrapped, isTracking, isTriggering, accessMode,
    triggerLogs,
    currentStepData, activeLines, canInteract,
    nextStep, prevStep, goToStep,
    simulateReadValue, simulateWriteValue, simulateReadDirect, simulateWriteDirect, reset
  }
})
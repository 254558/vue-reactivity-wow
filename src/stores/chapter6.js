import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { steps } from '@/chapters/ch6-nested/data'

export const useChapter6Store = defineStore('chapter6', () => {
  const currentStep = ref(1)
  const totalSteps = steps.length

  // 演示用的状态
  const showFlag = ref(true)
  const textVal = ref('Hello')
  const triggerLogs = ref([])
  const isPushing = ref(false)
  const isPopping = ref(false)
  const isTriggering = ref(false)

  // 栈状态模拟
  const effectStack = ref([])
  const activeEffectName = computed(() => {
    return effectStack.value.length > 0 ? effectStack.value[effectStack.value.length - 1] : 'null'
  })

  // 错误模式：无栈时的 activeEffect
  const wrongActiveEffect = ref('null')

  const currentStepData = computed(() => steps[currentStep.value - 1])
  const activeLines = computed(() => currentStepData.value?.lines || [])
  const canInteract = computed(() => currentStep.value >= totalSteps)

  function nextStep() {
    if (currentStep.value < totalSteps) {
      currentStep.value++
      if (currentStep.value === 3) simulateInitialRender()
    }
  }
  function prevStep() { if (currentStep.value > 1) currentStep.value-- }
  function goToStep(n) { if (n >= 1 && n <= currentStep.value) currentStep.value = n }

  // 模拟初始渲染的入栈出栈
  function simulateInitialRender() {
    effectStack.value = []
    // 外层入栈
    isPushing.value = true
    effectStack.value.push('effect1(父组件)')
    logAction('入栈', 'effect1(父组件) 压入栈顶')
    
    setTimeout(() => {
      // 内层入栈
      effectStack.value.push('effect2(子组件)')
      logAction('入栈', 'effect2(子组件) 压入栈顶')
      
      setTimeout(() => {
        // 内层出栈
        isPushing.value = false
        isPopping.value = true
        effectStack.value.pop()
        logAction('出栈', 'effect2(子组件) 弹出，还原 activeEffect 为 effect1')
        
        setTimeout(() => {
          // 外层出栈
          effectStack.value.pop()
          logAction('出栈', 'effect1(父组件) 弹出，栈清空')
          isPopping.value = false
        }, 600)
      }, 600)
    }, 600)
  }

  // 模拟修改内层依赖
  function simulateChangeText() {
    if (!canInteract.value) return
    const oldVal = textVal.value
    textVal.value = 'World'
    isTriggering.value = true
    
    logAction('触发', `state.text: "${oldVal}" → "${textVal.value}"，仅触发 effect2`)
    setTimeout(() => { isTriggering.value = false }, 600)
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
    showFlag.value = true
    textVal.value = 'Hello'
    triggerLogs.value = []
    isPushing.value = false
    isPopping.value = false
    isTriggering.value = false
    effectStack.value = []
  }

  return {
    currentStep, totalSteps, steps,
    showFlag, textVal, effectStack, activeEffectName,
    isPushing, isPopping, isTriggering, triggerLogs,
    currentStepData, activeLines, canInteract,
    nextStep, prevStep, goToStep, simulateInitialRender, simulateChangeText, reset
  }
})
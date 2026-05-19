import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { steps } from '@/chapters/ch9-compile/data'
export const useChapter9Store = defineStore('chapter9', () => {
  const currentStep = ref(1)
  const totalSteps = steps.length
  // 编译演示状态
  const templateSource = ref('<div>hello {{ name }}</div>')
  const currentPhase = ref('idle') // 'idle', 'parse', 'transform', 'codegen'
  const isCompiling = ref(false)
  const triggerLogs = ref([])
  const currentStepData = computed(() => steps[currentStep.value - 1])
  const activeLines = computed(() => currentStepData.value?.lines || [])
  const canInteract = computed(() => currentStep.value >= totalSteps)
  function nextStep() {
    if (currentStep.value < totalSteps) currentStep.value++
  }
  function prevStep() { if (currentStep.value > 1) currentStep.value-- }
  function goToStep(n) { if (n >= 1 && n <= currentStep.value) currentStep.value = n }
  // 模拟完整编译流水线
  function simulateCompile() {
    if (!canInteract.value || isCompiling.value) return
    isCompiling.value = true
    triggerLogs.value = []
    const phases = ['parse', 'transform', 'codegen']
    let i = 0
    const runPhase = () => {
      if (i >= phases.length) {
        isCompiling.value = false
        currentPhase.value = 'idle'
        logAction('完成', '渲染函数代码生成完毕')
        return
      }
      currentPhase.value = phases[i]
      const labels = {
        parse: 'Parse: 模板字符串 → AST',
        transform: 'Transform: 遍历 AST 执行优化插件',
        codegen: 'Codegen: 递归 AST 生成渲染函数'
      }
      logAction(phases[i], labels[phases[i]])
      i++
      setTimeout(runPhase, 800)
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
    currentPhase.value = 'idle'
    isCompiling.value = false
    triggerLogs.value = []
  }
  return {
    currentStep, totalSteps, steps,
    templateSource, currentPhase, isCompiling, triggerLogs,
    currentStepData, activeLines, canInteract,
    nextStep, prevStep, goToStep, simulateCompile, reset
  }
})
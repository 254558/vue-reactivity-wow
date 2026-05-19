import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { steps } from '@/chapters/ch1-reactivity/data'
export const useChapter1Store = defineStore('chapter1', () => {
  const currentStep = ref(1)
  const totalSteps = steps.length
  // 响应式数据（演示用）
  const reactiveCount = ref(0)
  const triggerLogs = ref([])
  const currentStepData = computed(() => steps[currentStep.value - 1])
  const activeLines = computed(() => currentStepData.value?.lines || [])
  const canIncrement = computed(() => currentStep.value >= totalSteps)
  // ✅ 优化：将 hasTracked 改为计算属性，彻底避免后退步骤时状态不同步
  const hasTracked = computed(() => currentStep.value >= 4)
  // ✅ 优化：抽取判空逻辑，避免在模板中直接依赖大数组的 length
  const hasLogs = computed(() => triggerLogs.value.length > 0)
  function nextStep() {
    if (currentStep.value < totalSteps) {
      currentStep.value++
      // ❌ 删除：不再需要手动维护 hasTracked.value = true
    }
  }
  function prevStep() { 
    if (currentStep.value > 1) currentStep.value-- 
  }
  function goToStep(n) { 
    if (n >= 1 && n <= currentStep.value) currentStep.value = n 
  }
  function increment() {
    if (!canIncrement.value) return
    const from = reactiveCount.value
    reactiveCount.value++
    const now = new Date()
    const time = [now.getHours(), now.getMinutes(), now.getSeconds()]
      .map(v => String(v).padStart(2, '0')).join(':')
    triggerLogs.value.unshift({ from, to: reactiveCount.value, time })
    if (triggerLogs.value.length > 20) triggerLogs.value.pop()
  }
  function reset() {
    currentStep.value = 1
    reactiveCount.value = 0
    // ❌ 删除：不再需要手动重置 hasTracked.value = false
    triggerLogs.value = []
  }
  return {
    currentStep, totalSteps, reactiveCount, hasTracked, triggerLogs, hasLogs,
    currentStepData, activeLines, canIncrement,
    nextStep, prevStep, goToStep, increment, reset, steps
  }
})
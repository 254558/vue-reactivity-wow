import { defineStore } from 'pinia'
import { ref } from 'vue'
import { steps } from '@/chapters/ch5-ref/data'
import { useChapterBase } from './useChapterBase'

export const useChapter5Store = defineStore('chapter5', () => {
  const base = useChapterBase(steps)

  // 演示用的状态
  const primitiveVal = ref(0)
  const isUnwrapped = ref(false)
  const isTracking = ref(false)
  const isTriggering = ref(false)
  const accessMode = ref('none') // 'none', 'value', 'direct'

  function nextStep() {
    base.nextStep()
    // 步骤5开启自动脱 ref
    if (base.currentStep.value === 5) isUnwrapped.value = true
  }

  // 模拟通过 .value 读取 (步骤4)
  function simulateReadValue() {
    accessMode.value = 'value'
    isTracking.value = true
    base.logAction('get (track)', `count.value → ${primitiveVal.value}`)
    setTimeout(() => { isTracking.value = false }, 500)
  }

  // 模拟通过 .value 修改
  function simulateWriteValue() {
    const old = primitiveVal.value
    primitiveVal.value++
    isTriggering.value = true
    accessMode.value = 'value'
    base.logAction('set (trigger)', `count.value: ${old} → ${primitiveVal.value}`)
    setTimeout(() => { isTriggering.value = false }, 500)
  }

  // 模拟直接读取 (自动脱 ref，步骤5/6)
  function simulateReadDirect() {
    if (!isUnwrapped.value) return
    accessMode.value = 'direct'
    isTracking.value = true
    base.logAction('get (自动脱ref)', `obj.count → 内部读取 .value → ${primitiveVal.value}`)
    setTimeout(() => { isTracking.value = false }, 500)
  }

  // 模拟直接修改 (自动脱 ref)
  function simulateWriteDirect() {
    if (!isUnwrapped.value) return
    const old = primitiveVal.value
    primitiveVal.value++
    isTriggering.value = true
    accessMode.value = 'direct'
    base.logAction('set (自动脱ref)', `obj.count = ${primitiveVal.value} → 内部设置 .value`)
    setTimeout(() => { isTriggering.value = false }, 500)
  }

  function reset() {
    base.resetBase()
    primitiveVal.value = 0
    isUnwrapped.value = false
    isTracking.value = false
    isTriggering.value = false
    accessMode.value = 'none'
  }

  return {
    ...base,
    primitiveVal, isUnwrapped, isTracking, isTriggering, accessMode,
    nextStep,
    simulateReadValue, simulateWriteValue, simulateReadDirect, simulateWriteDirect, reset
  }
})

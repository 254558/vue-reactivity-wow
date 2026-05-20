import { defineStore } from 'pinia'
import { ref } from 'vue'
import { steps } from '@/chapters/ch4-watch/data'
import { useChapterBase } from './useChapterBase'

export const useChapter4Store = defineStore('chapter4', () => {
  const base = useChapterBase(steps)

  // 演示用的状态
  const count = ref(0)
  const nestedNum = ref(1)
  // watch 模拟状态
  const oldValue = ref(null)
  const newValue = ref(null)
  const isTraversing = ref(false)
  const isCallbackFiring = ref(false)
  const traverseDepth = ref(0)

  function nextStep() {
    base.nextStep()
    // 步骤5时自动初始化旧值
    if (base.currentStep.value === 5 && oldValue.value === null) {
      simulateInit()
    }
  }

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
    base.logAction('初始化', `runner() 执行，获取初始值: ${oldValue.value}`)
  }

  // 模拟修改 count
  function simulateChangeCount() {
    if (!base.canInteract.value) return
    const prev = count.value
    count.value++
    newValue.value = count.value
    isCallbackFiring.value = true
    setTimeout(() => {
      isCallbackFiring.value = false
      base.logAction('回调触发', `count: ${prev} -> ${count.value}`)
      oldValue.value = count.value
      newValue.value = null
    }, 500)
  }

  // 模拟修改嵌套属性
  function simulateChangeNested() {
    if (!base.canInteract.value) return
    const prev = nestedNum.value
    nestedNum.value++
    newValue.value = nestedNum.value
    isCallbackFiring.value = true
    setTimeout(() => {
      isCallbackFiring.value = false
      base.logAction('深层回调触发', `nested.num: ${prev} -> ${nestedNum.value}`)
      oldValue.value = nestedNum.value
      newValue.value = null
    }, 500)
  }

  function reset() {
    base.resetBase()
    count.value = 0
    nestedNum.value = 1
    oldValue.value = null
    newValue.value = null
    isTraversing.value = false
    isCallbackFiring.value = false
    traverseDepth.value = 0
  }

  return {
    ...base,
    count, nestedNum, oldValue, newValue,
    isTraversing, isCallbackFiring, traverseDepth,
    nextStep,
    simulateTraverse, simulateInit, simulateChangeCount, simulateChangeNested, reset
  }
})

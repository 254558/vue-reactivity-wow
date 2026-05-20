import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { steps } from '@/chapters/ch3-computed/data'
import { useChapterBase } from './useChapterBase'

export const useChapter3Store = defineStore('chapter3', () => {
  const base = useChapterBase(steps)

  // 演示用的状态
  const reactiveCount = ref(1)
  const dirty = ref(true)
  const cachedValue = ref(undefined)
  const getterCallCount = ref(1)
  const readCount = ref(0)
  const isComputing = ref(false)

  // computed 模拟值
  const computedDisplay = computed(() => {
    if (cachedValue.value === undefined) return '尚未计算'
    return cachedValue.value
  })

  function nextStep() {
    base.nextStep()
    // 步骤5时，如果还没计算过，自动触发一次模拟读取
    if (base.currentStep.value === 5 && cachedValue.value === undefined) {
      simulateRead()
    }
  }

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
        base.logAction('读取 (计算)', `dirty: true -> false, 值: ${cachedValue.value}`)
      }, 300)
    } else {
      // 命中缓存
      base.logAction('读取 (缓存)', `dirty: false, 返回缓存值: ${cachedValue.value}`)
    }
  }

  // 模拟修改 state.count
  function simulateChange() {
    reactiveCount.value++
    dirty.value = true
    base.logAction('修改数据', `count: ${reactiveCount.value - 1} -> ${reactiveCount.value}, dirty: true`)
  }

  function reset() {
    base.resetBase()
    reactiveCount.value = 1
    dirty.value = true
    cachedValue.value = undefined
    getterCallCount.value = 1
    readCount.value = 0
    isComputing.value = false
  }

  return {
    ...base,
    reactiveCount, dirty, cachedValue, computedDisplay, getterCallCount, readCount, isComputing,
    nextStep, simulateRead, simulateChange, reset
  }
})

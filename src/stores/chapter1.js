import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { steps } from '@/chapters/ch1-reactivity/data'
import { useChapterBase } from './useChapterBase'

export const useChapter1Store = defineStore('chapter1', () => {
  const base = useChapterBase(steps)

  const reactiveCount = ref(0)
  const hasTracked = computed(() => base.currentStep.value >= 4)
  const hasLogs = computed(() => base.triggerLogs.value.length > 0)
  const canIncrement = base.canInteract

  function increment() {
    if (!canIncrement.value) return
    const from = reactiveCount.value
    reactiveCount.value++
    const now = new Date()
    const time = [now.getHours(), now.getMinutes(), now.getSeconds()]
      .map(v => String(v).padStart(2, '0')).join(':')
    base.triggerLogs.value.unshift({ from, to: reactiveCount.value, time })
    if (base.triggerLogs.value.length > 20) base.triggerLogs.value.pop()
  }

  function reset() {
    base.resetBase()
    reactiveCount.value = 0
  }

  return {
    ...base,
    reactiveCount, hasTracked, hasLogs, canIncrement,
    increment, reset
  }
})

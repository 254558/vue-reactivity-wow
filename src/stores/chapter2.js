import { defineStore } from 'pinia'
import { ref } from 'vue'
import { steps } from '@/chapters/ch2-scheduler/data'
import { useChapterBase } from './useChapterBase'

export const useChapter2Store = defineStore('chapter2', () => {
  const base = useChapterBase(steps)

  const totalSyncCount = ref(0)
  const totalAsyncCount = ref(0)
  const dataValue = ref(0)
  const queueSize = ref(0)
  const isFlushing = ref(false)
  const canIncrement = base.canInteract

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
      base.triggerLogs.value.unshift({
        sync: currentSyncIncrement,
        async: totalAsyncCount.value - asyncCountBeforeThisTrigger,
        value: dataValue.value,
        time
      })
      if (base.triggerLogs.value.length > 20) base.triggerLogs.value.pop()
    }, 600)
  }

  function reset() {
    base.resetBase()
    totalSyncCount.value = 0
    totalAsyncCount.value = 0
    dataValue.value = 0
    queueSize.value = 0
    isFlushing.value = false
  }

  return {
    ...base,
    totalSyncCount, totalAsyncCount,
    dataValue, queueSize, isFlushing, canIncrement,
    simulateIncrement, reset
  }
})

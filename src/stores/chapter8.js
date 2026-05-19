import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { steps } from '@/chapters/ch8-diff/data'
export const useChapter8Store = defineStore('chapter8', () => {
  const currentStep = ref(1)
  const totalSteps = steps.length
  // 演示用的 VNode 列表
  const oldChildren = ref(['A', 'B', 'C', 'D'])
  const newChildren = ref(['D', 'A', 'C', 'E', 'B'])
  // 指针状态
  const oldStartIdx = ref(0)
  const oldEndIdx = ref(3)
  const newStartIdx = ref(0)
  const newEndIdx = ref(4)
  // 操作记录
  const operations = ref([])
  const isAutoPlaying = ref(false)
  const currentStepData = computed(() => steps[currentStep.value - 1])
  const activeLines = computed(() => currentStepData.value?.lines || [])
  const canInteract = computed(() => currentStep.value >= totalSteps)
  function nextStep() {
    if (currentStep.value < totalSteps) currentStep.value++
  }
  function prevStep() { if (currentStep.value > 1) currentStep.value-- }
  function goToStep(n) { if (n >= 1 && n <= currentStep.value) currentStep.value = n }
  // 获取当前匹配类型
  function getMatchType(oldKey, newKey) {
    if (oldChildren.value[oldStartIdx.value] === newChildren.value[newStartIdx.value]) return 'head-head'
    if (oldChildren.value[oldEndIdx.value] === newChildren.value[newEndIdx.value]) return 'tail-tail'
    if (oldChildren.value[oldStartIdx.value] === newChildren.value[newEndIdx.value]) return 'head-tail'
    if (oldChildren.value[oldEndIdx.value] === newChildren.value[newStartIdx.value]) return 'tail-head'
    return 'find'
  }
  // 模拟执行一步 Diff
  function simulateStep() {
    if (!canInteract.value || isAutoPlaying.value) return
    isAutoPlaying.value = true
    const type = getMatchType()
    const osi = oldStartIdx.value
    const oei = oldEndIdx.value
    const nsi = newStartIdx.value
    const nei = newEndIdx.value
    if (type === 'head-head') {
      operations.value.push({ type: 'update', nodes: [oldChildren.value[osi]], msg: `头-头匹配: ${oldChildren.value[osi]} 无需移动` })
      oldStartIdx.value++
      newStartIdx.value++
    } else if (type === 'tail-tail') {
      operations.value.push({ type: 'update', nodes: [oldChildren.value[oei]], msg: `尾-尾匹配: ${oldChildren.value[oei]} 无需移动` })
      oldEndIdx.value--
      newEndIdx.value--
    } else if (type === 'tail-head') {
      operations.value.push({ type: 'move', nodes: [oldChildren.value[oei]], msg: `尾-头匹配: 移动 ${oldChildren.value[oei]} 到头部` })
      oldEndIdx.value--
      newStartIdx.value++
    } else if (type === 'head-tail') {
      operations.value.push({ type: 'move', nodes: [oldChildren.value[osi]], msg: `头-尾匹配: 移动 ${oldChildren.value[osi]} 到尾部` })
      oldStartIdx.value++
      newEndIdx.value--
    } else {
      const newKey = newChildren.value[nsi]
      const idxInOld = oldChildren.value.indexOf(newKey)
      if (idxInOld > -1) {
        operations.value.push({ type: 'move', nodes: [newKey], msg: `查找匹配: 移动 ${newKey} 到头部` })
      } else {
        operations.value.push({ type: 'add', nodes: [newKey], msg: `未找到: 新增节点 ${newKey}` })
      }
      newStartIdx.value++
    }
    setTimeout(() => { isAutoPlaying.value = false }, 500)
  }
  function reset() {
    currentStep.value = 1
    oldChildren.value = ['A', 'B', 'C', 'D']
    newChildren.value = ['D', 'A', 'C', 'E', 'B']
    oldStartIdx.value = 0
    oldEndIdx.value = 3
    newStartIdx.value = 0
    newEndIdx.value = 4
    operations.value = []
    isAutoPlaying.value = false
  }
  return {
    currentStep, totalSteps, steps,
    oldChildren, newChildren,
    oldStartIdx, oldEndIdx, newStartIdx, newEndIdx,
    operations, isAutoPlaying,
    currentStepData, activeLines, canInteract,
    nextStep, prevStep, goToStep, simulateStep, reset
  }
})
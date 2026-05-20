import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { steps } from '@/chapters/ch10-component/data'
import { useChapterBase } from './useChapterBase'

export const useChapter10Store = defineStore('chapter10', () => {
  const base = useChapterBase(steps)

  // 演示状态
  const parentCount = ref(0)
  const childCount = ref(0)
  const childPropTitle = ref('Initial Title')
  const isMounted = ref(false)
  const isUpdating = ref(false)

  const hasLogs = computed(() => base.triggerLogs.value.length > 0)
  // 核心交互权限控制
  const canMount = computed(() => base.currentStep.value >= 4)

  function simulateMount() {
    if (isMounted.value || !canMount.value) return
    isMounted.value = true
    logAction('mount', '创建实例，执行 setup，patch 子树')
  }

  function simulateParentUpdate() {
    if (!base.canInteract.value || isUpdating.value || !isMounted.value) return
    isUpdating.value = true
    parentCount.value++
    childPropTitle.value = `Title ${parentCount.value}`
    logAction('patch', `父组件更新，传递新 props: { title: "${childPropTitle.value}" }`)
    setTimeout(() => {
      logAction('diff', '重新执行 render，对比新旧 subTree，更新 DOM')
      isUpdating.value = false
    }, 600)
  }

  function simulateChildUpdate() {
    if (!base.canInteract.value || isUpdating.value || !isMounted.value) return
    isUpdating.value = true
    childCount.value++
    logAction('self', `子组件内部更新，setupState.count 变为 ${childCount.value}`)
    setTimeout(() => {
      logAction('diff', '重新执行 render，对比新旧 subTree，更新 DOM')
      isUpdating.value = false
    }, 600)
  }

  // Override logAction with custom typeMap format
  function logAction(type, detail) {
    const now = new Date()
    const time = [now.getHours(), now.getMinutes(), now.getSeconds()]
      .map(v => String(v).padStart(2, '0')).join(':')
    const typeMap = {
      mount: { class: 'mount', text: 'Mount' },
      patch: { class: 'patch', text: 'Patch' },
      diff:  { class: 'diff',  text: 'Diff' },
      self:  { class: 'self',  text: 'Self' }
    }
    base.triggerLogs.value.unshift({
      type: typeMap[type]?.text || type,
      typeClass: typeMap[type]?.class || type,
      detail,
      time
    })
    if (base.triggerLogs.value.length > 20) base.triggerLogs.value.pop()
  }

  function reset() {
    base.resetBase()
    parentCount.value = 0
    childCount.value = 0
    childPropTitle.value = 'Initial Title'
    isMounted.value = false
    isUpdating.value = false
  }

  return {
    ...base,
    parentCount, childCount, childPropTitle, isMounted, isUpdating,
    hasLogs, canMount,
    simulateMount, simulateParentUpdate, simulateChildUpdate, logAction, reset
  }
})

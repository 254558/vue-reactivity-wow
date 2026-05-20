import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { steps } from '@/chapters/ch6-nested/data'
import { useChapterBase } from './useChapterBase'

export const useChapter6Store = defineStore('chapter6', () => {
  const base = useChapterBase(steps)

  // 演示用的状态
  const showFlag = ref(true)
  const textVal = ref('Hello')
  const isPushing = ref(false)
  const isPopping = ref(false)
  const isTriggering = ref(false)

  // 栈状态模拟
  const effectStack = ref([])
  const activeEffectName = computed(() => {
    return effectStack.value.length > 0 ? effectStack.value[effectStack.value.length - 1] : 'null'
  })

  function nextStep() {
    base.nextStep()
    if (base.currentStep.value === 3) simulateInitialRender()
  }

  // 模拟初始渲染的入栈出栈
  function simulateInitialRender() {
    effectStack.value = []
    // 外层入栈
    isPushing.value = true
    effectStack.value.push('effect1(父组件)')
    base.logAction('入栈', 'effect1(父组件) 压入栈顶')

    setTimeout(() => {
      // 内层入栈
      effectStack.value.push('effect2(子组件)')
      base.logAction('入栈', 'effect2(子组件) 压入栈顶')

      setTimeout(() => {
        // 内层出栈
        isPushing.value = false
        isPopping.value = true
        effectStack.value.pop()
        base.logAction('出栈', 'effect2(子组件) 弹出，还原 activeEffect 为 effect1')

        setTimeout(() => {
          // 外层出栈
          effectStack.value.pop()
          base.logAction('出栈', 'effect1(父组件) 弹出，栈清空')
          isPopping.value = false
        }, 600)
      }, 600)
    }, 600)
  }

  // 模拟修改内层依赖
  function simulateChangeText() {
    if (!base.canInteract.value) return
    const oldVal = textVal.value
    textVal.value = 'World'
    isTriggering.value = true

    base.logAction('触发', `state.text: "${oldVal}" → "${textVal.value}"，仅触发 effect2`)
    setTimeout(() => { isTriggering.value = false }, 600)
  }

  function reset() {
    base.resetBase()
    showFlag.value = true
    textVal.value = 'Hello'
    isPushing.value = false
    isPopping.value = false
    isTriggering.value = false
    effectStack.value = []
  }

  return {
    ...base,
    showFlag, textVal, effectStack, activeEffectName,
    isPushing, isPopping, isTriggering,
    nextStep, simulateInitialRender, simulateChangeText, reset
  }
})

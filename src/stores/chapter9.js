import { defineStore } from 'pinia'
import { ref } from 'vue'
import { steps } from '@/chapters/ch9-compile/data'
import { useChapterBase } from './useChapterBase'

export const useChapter9Store = defineStore('chapter9', () => {
  const base = useChapterBase(steps)

  // 编译演示状态
  const templateSource = ref('<div>hello {{ name }}</div>')
  const currentPhase = ref('idle') // 'idle', 'parse', 'transform', 'codegen'
  const isCompiling = ref(false)
  const compileComplete = ref(false)

  // 模拟完整编译流水线
  function simulateCompile() {
    if (!base.canInteract.value || isCompiling.value) return
    isCompiling.value = true
    base.triggerLogs.value = []
    const phases = ['parse', 'transform', 'codegen']
    let i = 0
    const runPhase = () => {
      if (i >= phases.length) {
        isCompiling.value = false
        currentPhase.value = 'idle'
        compileComplete.value = true
        base.logAction('完成', '渲染函数代码生成完毕')
        return
      }
      currentPhase.value = phases[i]
      const labels = {
        parse: 'Parse: 模板字符串 → AST',
        transform: 'Transform: 遍历 AST 执行优化插件',
        codegen: 'Codegen: 递归 AST 生成渲染函数'
      }
      base.logAction(phases[i], labels[phases[i]])
      i++
      setTimeout(runPhase, 800)
    }
    runPhase()
  }

  function reset() {
    base.resetBase()
    currentPhase.value = 'idle'
    isCompiling.value = false
    compileComplete.value = false
  }

  return {
    ...base,
    templateSource, currentPhase, isCompiling, compileComplete,
    simulateCompile, reset
  }
})

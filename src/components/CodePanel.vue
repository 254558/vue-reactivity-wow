<template>
  <div class="code-panel">
    <div class="code-header">
      <div class="code-dots">
        <span class="dot r"></span>
        <span class="dot y"></span>
        <span class="dot g"></span>
      </div>
      <span class="code-filename">{{ filename }}</span>
      <span 
        class="lines-tag" 
        v-if="activeLines.length"
      >
        L{{ activeLines[0] + 1 }}-L{{ activeLines.at(-1) + 1 }}
      </span>
    </div>

    <div class="code-body" ref="codeBodyRef">
      <div
        v-for="(line, idx) in highlightedLines"
        :key="idx"
        class="code-line"
        :class="{
          active: activeLines.includes(idx),
          dim: activeLines.length && !activeLines.includes(idx)
        }"
        :data-line="idx"
      >
        <span class="line-no">{{ idx + 1 }}</span>
        <span v-html="line"></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import { highlightCode } from '@/utils/highlight'

const props = defineProps({
  sourceCode: String,
  activeLines: {
    type: Array,
    default: () => []
  },
  filename: {
    type: String,
    default: 'index.js'
  }
})

const codeBodyRef = ref(null)

// 代码高亮处理
const highlightedLines = computed(() => {
  if (!props.sourceCode) return []
  return highlightCode(props.sourceCode).split('\n')
})

// 自动滚动到目标行（深度监听 + 防抖防抖动）
watch(
  () => props.activeLines,
  async (newLines) => {
    if (!newLines.length) return
    await nextTick()

    const line = newLines[0]
    const activeEl = codeBodyRef.value?.querySelector(
      `.code-line[data-line="${line}"]`
    )

    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      })
    }
  },
  { deep: true }
)
</script>

<style scoped>
.code-panel {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.code-header {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border);
  gap: 10px;
  background: rgba(7, 11, 9, 0.4);
}

.code-dots {
  display: flex;
  gap: 6px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.dot.r { background: rgba(239, 68, 68, 0.7); }
.dot.y { background: rgba(245, 158, 11, 0.7); }
.dot.g { background: rgba(16, 185, 129, 0.7); }

.code-filename {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--muted);
}

.lines-tag {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: 0.62rem;
  color: var(--accent);
  background: var(--accent-dim);
  padding: 2px 8px;
  border-radius: 4px;
}

.code-body {
  padding: 14px 0;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  line-height: 1.7;
  max-height: 550px;
  overflow: auto;
  flex: 1;
  scroll-behavior: smooth;
  overscroll-behavior: contain;
}

.code-line {
  padding: 1px 0 1px 12px;
  border-left: 3px solid transparent;
  transition: all 0.3s ease;
  white-space: pre;
  display: flex;
  background-color: transparent !important;
}

.code-line.active {
  background: rgba(16, 185, 129, 0.06);
  border-left-color: var(--accent);
}

.code-line.dim {
  opacity: 0.3;
}

.line-no {
  display: inline-block;
  width: 40px;
  text-align: right;
  margin-right: 16px;
  color: #2a4a3a;
  font-size: 0.62rem;
  user-select: none;
  flex-shrink: 0;
  padding-top: 1px;
}

/* Prism 语法高亮颜色适配暗色主题 */
.code-body :deep(.token.keyword) { color: #7dd3a8; }
.code-body :deep(.token.function) { color: #fbbf24; }
.code-body :deep(.token.string) { color: #f0a85e; }
.code-body :deep(.token.number) { color: #f472b6; }
.code-body :deep(.token.comment) { color: #4a6e5e; font-style: italic; }
.code-body :deep(.token.class-name) { color: #60a5fa; }
.code-body :deep(.token.operator) { color: var(--muted); }
</style>
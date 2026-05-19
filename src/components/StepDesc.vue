<template>
  <Transition name="v" mode="out-in">
    <div class="step-desc" v-if="step" :key="step.id">
      <div class="desc-head">
        <div 
          class="desc-badge" 
          :style="{ background: step.color + '18', color: step.color }"
        >
          {{ step.id }}
        </div>
        <h3>{{ step.title }}</h3>
      </div>

      <p class="desc-text" v-if="step.desc">{{ step.desc }}</p>

      <!-- 代码详情区域（自动高亮）-->
      <div 
        class="desc-detail" 
        v-if="step.detail"
        v-html="highlightedDetail"
      />
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { highlightCode } from '@/utils/highlight'

const props = defineProps({
  step: Object
})

// 自动高亮详情里的代码
const highlightedDetail = computed(() => {
  if (!props.step?.detail) return ''
  
  // 先安全转义 HTML，防止 XSS + 渲染错乱
  let html = props.step.detail
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // 执行高亮
  return highlightCode(html)
})
</script>

<style scoped>
.step-desc { 
  background: var(--card); 
  border: 1px solid var(--border); 
  border-radius: var(--radius); 
  padding: 18px; 
  display: flex;
  flex-direction: column; 
  gap: 12px; 
}

.desc-head { 
  display: flex; 
  align-items: center; 
  gap: 10px; 
}

.desc-badge { 
  width: 26px; 
  height: 26px; 
  border-radius: 7px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-size: 0.75rem; 
  font-weight: 700; 
  font-family: var(--font-mono); 
}

.desc-head h3 { 
  font-size: 0.92rem; 
  font-weight: 700; 
  margin: 0;
}

.desc-text { 
  color: var(--muted); 
  font-size: 0.82rem; 
  line-height: 1.65; 
  margin: 0;
}

/* 代码高亮区域 */
.desc-detail {
  background: rgba(7, 11, 9, 0.6);
  border-radius: var(--radius-sm);
  padding: 12px;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  line-height: 1.6;
  overflow-x: auto;
  white-space: pre-line; 
}

/* 强行覆盖 Prism 样式，避免冲突 */
.desc-detail :deep(.pre, code) {
  background: transparent !important;
  padding: 0 !important;
  margin: 0 !important;
  font-size: inherit !important;
  line-height: inherit !important;
}

/* 过渡动画 */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.32s ease, transform 0.32s ease;
}
.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
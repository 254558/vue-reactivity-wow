<template>
  <Transition name="v" mode="out-in">
    <div class="step-desc" v-if="step" :key="step.id">
      <div class="desc-head">
        <div class="desc-badge" :style="{ background: step.color+'18', color: step.color }">{{ step.id }}</div>
        <h3>{{ step.title }}</h3>
      </div>
      <p class="desc-text">{{ step.desc }}</p>
      <div class="desc-detail" v-html="highlightedDetail"></div>
    </div>
  </Transition>
</template>
<script setup>
import { computed } from 'vue'
import { highlightCode } from '@/utils/highlight'
const props = defineProps({
  step: Object
})
// 对 detail 中的代码块进行高亮处理
const highlightedDetail = computed(() => {
  if (!props.step?.detail) return ''
  // 简单转义 HTML
  let text = props.step.detail.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  // 使用 Prism 高亮
  return highlightCode(text)
})
</script>
<style scoped>
.step-desc { 
  background: var(--card); 
  border: 1px solid var(--border); 
  border-radius: var(--radius); 
  padding: 18px; 
  display: flex; flex-direction: column; gap: 10px; 
  transition: all 0.3s;
}
.desc-head { display: flex; align-items: center; gap: 10px; }
.desc-badge { width: 26px; height: 26px; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; font-family: var(--font-mono); }
.desc-head h3 { font-size: 0.92rem; font-weight: 700; }
.desc-text { color: var(--muted); font-size: 0.82rem; line-height: 1.65; }
.desc-detail {
  background: rgba(7,11,9,0.6); border-radius: var(--radius-sm); padding: 12px;
  font-family: var(--font-mono); font-size: 0.72rem; line-height: 1.6; white-space: pre-wrap;
  /* 覆盖 Prism 默认的背景色，使其融入深色卡片 */
  background-color: transparent !important;
  padding: 0 !important;
  margin: 0 !important;
}
.desc-detail :deep(code) {
  background-color: transparent !important;
  font-size: 0.72rem;
}
/* Vue Transition */
.v-enter-active,
.v-leave-active {
  transition: all 0.3s ease;
}
.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
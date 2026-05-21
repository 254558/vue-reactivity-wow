<template>
  <div class="chapter-layout" v-if="current">
    <div class="chapter-topbar">
      <router-link to="/" class="back-link">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> 返回目录
      </router-link>
      <h2 class="chapter-heading">{{ current.title }}</h2>
    </div>
    <ChapterFrame :pageUrl="current.url" />
  </div>
  <div v-else class="not-found">
    <h2>章节建设中</h2>
    <p>该章节尚未发布，请返回主页查看其他内容。</p>
    <router-link to="/" class="back-link">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> 返回主页
    </router-link>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ChapterFrame from '@/components/ChapterFrame.vue'

const route = useRoute()

const chapters = {
  '0': { url: '/ch0-debugger.html', title: '调试入门：DevTools 基础操作' },
  '1': { url: '/ch1-debugger.html', title: '响应式系统：reactive 与 effect' },
  '2': { url: '/ch2-debugger.html', title: '调度系统：scheduler' },
  '3': { url: '/ch3-debugger.html', title: '计算属性：computed' },
  '4': { url: '/ch4-debugger.html', title: '侦听器：watch' },
  '5': { url: '/ch5-debugger.html', title: '原始值响应式：ref' },
  '6': { url: '/ch6-debugger.html', title: '嵌套 effect 与作用域' },
  '7': { url: '/ch7-debugger.html', title: '虚拟 DOM' },
  '8': { url: '/ch8-debugger.html', title: 'Diff 算法' },
  '9': { url: '/ch9-debugger.html', title: '编译模板' },
  '10': { url: '/ch10-debugger.html', title: '组件系统' },
}

const current = computed(() => chapters[route.params.id])
</script>

<style scoped>
.chapter-layout {
  max-width: 1512px;
  margin: 0 auto;
  padding: 1.5rem;
}

.chapter-topbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}

.back-link {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--muted);
  transition: color 0.2s;
  white-space: nowrap;
}

.back-link:hover {
  color: var(--accent);
}

.chapter-heading {
  font-size: 1rem;
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--fg);
}

.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1rem;
  text-align: center;
  color: var(--muted);
}
</style>

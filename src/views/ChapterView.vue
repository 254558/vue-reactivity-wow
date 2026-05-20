<template>
  <div class="chapter-layout" v-if="chapterModule">
    <!-- 返回与章节标题 -->
    <div class="chapter-topbar">
      <router-link to="/" class="back-link">
        <i class="fa-solid fa-arrow-left"></i> 返回目录
      </router-link>
      <h2 class="chapter-heading">{{ chapterModule.meta.title }}</h2>
    </div>

    <!-- 动态加载章节内容 -->
    <component :is="chapterModule.Demo" />
  </div>
  <div v-else class="not-found">
    <h2>章节建设中</h2>
    <p>该章节尚未发布，请返回主页查看其他内容。</p>
    <router-link to="/" class="back-link">
      <i class="fa-solid fa-arrow-left"></i> 返回主页
    </router-link>
  </div>
</template>

<script setup>
import { ref, watch, defineAsyncComponent, shallowRef } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const chapterModule = shallowRef(null)

// 章节映射表：后续新增章节只需在这里添加
const chapterMap = {
  '1': {
    Demo: defineAsyncComponent(() => import('@/chapters/ch1-reactivity/Demo.vue')),
    meta: { title: '响应式系统：reactive 与 effect' },
  },
  '2': {
    Demo: defineAsyncComponent(() => import('@/chapters/ch2-scheduler/Demo.vue')),
    meta: { title: '调度系统：scheduler' },
  },
  '3': {
    Demo: defineAsyncComponent(() => import('@/chapters/ch3-computed/Demo.vue')),
    meta: { title: '计算属性：computed' },
  },
  '4': {
    Demo: defineAsyncComponent(() => import('@/chapters/ch4-watch/Demo.vue')),
    meta: { title: '侦听器：watch' },
  },
  '5': {
    Demo: defineAsyncComponent(() => import('@/chapters/ch5-ref/Demo.vue')),
    meta: { title: '原始值响应式：ref' }
  },
  '6': {
    Demo: defineAsyncComponent(() => import('@/chapters/ch6-nested/Demo.vue')),
    meta: { title: '嵌套 effect 与作用域' }
  },
  '7': {
    Demo: defineAsyncComponent(() => import('@/chapters/ch7-vnode/Demo.vue')),
    meta: { title: '虚拟 DOM' }
  },
  '8': {
    Demo: defineAsyncComponent(() => import('@/chapters/ch8-diff/Demo.vue')),
    meta: { title: 'Diff 算法' }
  },
  '9': {
    Demo: defineAsyncComponent(() => import('@/chapters/ch9-compile/Demo.vue')),
    meta: { title: '编译模板' }
  },
  '10': {
    Demo: defineAsyncComponent(() => import('@/chapters/ch10-component/Demo.vue')),
    meta: { title: '组件系统' }
  },
}

// 监听路由变化加载对应章节
watch(
  () => route.params.id,
  (id) => {
    chapterModule.value = chapterMap[id] || null
  },
  { immediate: true }
)
</script>

<style scoped>
.chapter-layout {
  max-width: 1280px;
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
<template>
  <div class="app-shell">
    <!-- 顶部导航栏 -->
    <header class="top-nav">
      <div class="nav-inner">
        <router-link to="/" class="nav-brand">
          <div class="brand-icon"><i class="fa-solid fa-bolt"></i></div>
          <span class="brand-text">简化演示</span>
        </router-link>
        <div class="nav-meta">
          <span class="meta-tag" v-if="route.name === 'Chapter'">
            CHAPTER {{ route.params.id }}
          </span>
        </div>
      </div>
    </header>

    <!-- 路由视图 -->
    <main class="app-main">
      <router-view v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" :key="$route.path" />
        </Transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<style scoped>
.app-shell { min-height: 100vh; display: flex; flex-direction: column; }
.top-nav {
  position: sticky; top: 0; z-index: 100;
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(20px); background: rgba(7, 11, 9, 0.85);
}
.nav-inner {
  max-width: 1280px; margin: 0 auto; padding: 0 1.5rem;
  height: 56px; display: flex; align-items: center; justify-content: space-between;
}
.nav-brand { display: flex; align-items: center; gap: 10px; }
.brand-icon {
  width: 30px; 
  height: 30px; 
  border-radius: 8px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'%3E%3Cpath d='M0 0h128v128H0z' fill='none'/%3E%3Cpath fill='none' d='m0 8.934 49.854.158 14.167 24.47 14.432-24.47L128 8.935l-63.834 110.14zm126.98.637-24.36.02-38.476 66.053L25.691 9.592.942 9.572l63.211 107.89zm-25.149-.008-22.745.168-15.053 24.647L49.216 9.73l-22.794-.168 37.731 64.476zm-75.834-.17 23.002.009-23.002-.01z'/%3E%3Cpath fill='%2335495e' d='m25.997 9.393 23.002.009L64.035 34.36 79.018 9.404 102 9.398 64.15 75.053z'/%3E%3Cpath fill='%2341b883' d='m.91 9.569 25.067-.172 38.15 65.659L101.98 9.401l25.11.026-62.966 108.06z'/%3E%3C/svg%3E") center / 22px auto no-repeat;
  display: flex; 
  align-items: center; 
  justify-content: center; 
  color: white; 
  font-size: 13px;
}
.brand-text { font-weight: 700; font-size: 0.95rem; letter-spacing: -0.02em; }
.meta-tag {
  font-family: var(--font-mono); font-size: 0.7rem; color: var(--accent);
  background: var(--accent-dim); padding: 4px 10px; border-radius: 4px;
}
.app-main { flex: 1; }
</style>
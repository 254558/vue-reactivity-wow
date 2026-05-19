<template>
  <div class="app-shell">
    <!-- 仅首页显示导航栏 -->
    <header class="top-nav" v-if="route.path === '/'">
      <div class="nav-inner">
        <router-link to="/" class="nav-brand">
          <div class="brand-icon"><i class="fa-solid fa-bolt"></i></div>
          <span class="brand-text">核心原理</span>
        </router-link>
        <!-- GitHub 链接 -->
        <a 
          href="https://github.com/254558/vue-reactivity-demo" 
          class="github-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          <!-- 直接修改 SVG 宽高为 24px -->
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none" />
            <path fill="#fff" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2" />
          </svg>
        </a>
      </div>
    </header>

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
  height: 56px; display: flex; align-items: center;
  justify-content: space-between;
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
.app-main { flex: 1; }

/* GitHub 链接样式 */
.github-link {
  color: #fff;
  opacity: 0.9;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 6px;
}
.github-link:hover {
  opacity: 1;
  transform: scale(1.05);
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
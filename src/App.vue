<template>
  <div class="app-shell">
    <!-- 仅首页显示导航栏 -->
    <header class="top-nav" v-if="route.path === '/'">
      <div class="nav-inner">
        <router-link to="/" class="nav-brand">
          <div class="brand-icon">
            <img src="./styles/vite.svg" width="24" height="24" alt="logo" />
          </div>
          <span class="brand-text">一点一点看</span>
        </router-link>
        <!-- GitHub 链接 -->
        <a 
          href="https://github.com/254558/vue-reactivity-demo" 
          class="github-link"
          target="_blank"
          rel="noopener noreferrer"
        >
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
  display: flex;
  align-items: center;
  justify-content: center;
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
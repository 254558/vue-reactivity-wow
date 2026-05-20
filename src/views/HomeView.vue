<template>
  <div class="home-page">

    <div class="home-container">

      <!-- 浏览器兼容提示 -->
      <div class="browser-warning">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>仅支持 <strong>Chrome</strong> — 需要 DevTools Sources 面板体验 debugger 步进调试</span>
      </div>

      <!-- 英雄区 -->
      <section class="hero">
        <div class="hero-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        </div>
        <h1 class="hero-title">
          <span class="hero-sub">深入 Vue 核心原理</span>
          <span class="hero-main">一步一步 Debug 给你看</span>
        </h1>
        <p class="hero-desc">
          每一行核心代码都嵌入了 <code>debugger</code>，打开 Chrome DevTools，<br>
          点击章节，跟着按钮一步步观察响应式系统的真实运行过程。
        </p>
      </section>

      <!-- 章节网格 -->
      <section class="chapters">
        <div class="chapter-grid">
          <router-link
            v-for="ch in chapters"
            :key="ch.id"
            :to="`/chapter/${ch.id}`"
            class="chapter-card"
            :style="{ '--card-accent': ch.color }"
          >
            <div class="card-top">
              <span class="card-num">{{ String(ch.id).padStart(2, '0') }}</span>
              <span class="card-step">{{ ch.steps }} 步</span>
            </div>
            <h3 class="card-title">{{ ch.title }}</h3>
            <p class="card-desc">{{ ch.desc }}</p>
            <div class="card-footer">
              <div class="card-tags">
                <span v-for="tag in ch.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
              <span class="card-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </span>
            </div>
          </router-link>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
const chapters = [
  { id: 1, title: '响应式系统', desc: '从 Proxy 到依赖收集与触发，理解 Vue 响应式数据的底层基石。', tags: ['Proxy', 'effect', 'track', 'trigger'], steps: 3, color: '#10b981' },
  { id: 2, title: '调度系统', desc: '调度器如何控制副作用的执行时机与去重，避免无限递归。', tags: ['scheduler', 'queue', 'batch'], steps: 3, color: '#10b981' },
  { id: 3, title: '计算属性', desc: '懒执行与缓存机制，脏标记（dirty flag）的工作过程。', tags: ['computed', 'cache', 'lazy'], steps: 5, color: '#10b981' },
  { id: 4, title: '侦听器', desc: '递归遍历 getter、旧值保存与深度侦听的内部实现。', tags: ['watch', 'traverse', 'callback'], steps: 4, color: '#10b981' },
  { id: 5, title: '原始值响应式', desc: 'Proxy 无法代理原始值，ref 如何通过对象包装来解决。', tags: ['ref', 'proxy', 'unwrap'], steps: 5, color: '#10b981' },
  { id: 6, title: '嵌套 Effect', desc: 'effect 嵌套时的依赖错乱问题与 effectStack 解决方案。', tags: ['effectStack', 'nested', 'scope'], steps: 5, color: '#10b981' },
  { id: 7, title: '虚拟 DOM', desc: '从真实 DOM 的性能瓶颈到 VNode 的设计理念。', tags: ['VNode', 'h', 'mount'], steps: 3, color: '#8b5cf6' },
  { id: 8, title: 'Diff 算法', desc: '双端指针比较与最长递增子序列的节点复用策略。', tags: ['patch', 'key', 'LIS'], steps: 3, color: '#8b5cf6' },
  { id: 9, title: '模板编译', desc: '模板到渲染函数的三阶段编译流水线。', tags: ['AST', 'transform', 'codegen'], steps: 4, color: '#f59e0b' },
  { id: 10, title: '组件系统', desc: '组件渲染、更新与 setup 函数的设计。', tags: ['component', 'props', 'lifecycle'], steps: 4, color: '#f59e0b' },
]
</script>

<style scoped>
.home-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 3rem 1.5rem 6rem;
}

/* ===== 浏览器提示 ===== */
.browser-warning {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(245, 158, 11, 0.06);
  border: 1px solid rgba(245, 158, 11, 0.15);
  border-radius: 8px;
  padding: 10px 16px;
  margin-bottom: 3rem;
  font-size: 0.78rem;
  color: #f59e0b;
  line-height: 1.5;
}
.browser-warning strong { color: #d0e4da; }

/* ===== 英雄区 ===== */
.hero {
  text-align: center;
  margin-bottom: 4.5rem;
}
.hero-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 1.25rem;
  opacity: 0.5;
}
.hero-sub {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: #5e8a76;
  letter-spacing: 0.15em;
  margin-bottom: 0.5rem;
}
.hero-main {
  display: block;
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  font-weight: 900;
  line-height: 1.2;
  letter-spacing: -0.03em;
}
.hero-desc {
  color: #5e8a76;
  font-size: 0.92rem;
  max-width: 520px;
  margin: 1rem auto 0;
  line-height: 1.7;
}
.hero-desc code {
  display: inline-block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.78rem;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  padding: 0 6px;
  border-radius: 3px;
}

/* ===== 章节网格 ===== */
.chapter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 0.75rem;
}

/* ===== 章节卡片 ===== */
.chapter-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: #0d1612;
  border: 1px solid #1a2e25;
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}
.chapter-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--card-accent), transparent 60%);
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
}
.chapter-card:hover {
  border-color: var(--card-accent);
  transform: translateY(-3px);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--card-accent) 15%, transparent), 0 12px 40px rgba(0,0,0,0.3);
}
.chapter-card:hover::before {
  opacity: 0.04;
}

/* 卡片顶部 */
.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}
.card-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--card-accent);
  background: color-mix(in srgb, var(--card-accent) 12%, transparent);
  padding: 2px 8px;
  border-radius: 4px;
  line-height: 1.6;
}
.card-step {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  color: #5e8a76;
}

/* 标题 */
.card-title {
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.3;
  position: relative;
  z-index: 1;
  margin-top: 0.25rem;
}

/* 描述 */
.card-desc {
  font-size: 0.78rem;
  color: #5e8a76;
  line-height: 1.55;
  position: relative;
  z-index: 1;
  flex: 1;
}

/* 底部 */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  position: relative;
  z-index: 1;
}
.card-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  min-width: 0;
}
.tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.58rem;
  color: #5e8a76;
  background: rgba(26,46,37,0.5);
  padding: 2px 7px;
  border-radius: 4px;
  white-space: nowrap;
}
.card-arrow {
  flex-shrink: 0;
  color: #1a2e25;
  transition: color 0.2s, transform 0.2s;
  display: flex;
}
.chapter-card:hover .card-arrow {
  color: var(--card-accent);
  transform: translateX(3px);
}

/* ===== 响应式 ===== */
@media (max-width: 640px) {
  .home-container { padding: 2rem 1rem 4rem; }
  .hero { margin-bottom: 3rem; }
  .chapter-grid { grid-template-columns: 1fr; }
}
</style>

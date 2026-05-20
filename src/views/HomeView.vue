<template>
  <div class="home-page">
    <!-- 背景装饰 -->
    <div class="bg-glow glow-1"></div>
    <div class="bg-glow glow-2"></div>

    <div class="home-container">
      <!-- 浏览器兼容提示 -->
      <div class="browser-warning">
        <i class="fa-brands fa-chrome"></i>
        <span>当前页面仅支持 <strong>Chrome 浏览器</strong>（需要 DevTools debugger 功能），其他浏览器的 debugger 体验不一致。</span>
      </div>

      <!-- 英雄区 -->
      <section class="hero">
        <div class="hero-badge">INTERACTIVE LEARNING</div>
        <h1 class="hero-title">
          深入 <span class="text-accent">Vue</span> 核心原理
        </h1>
        <p class="hero-desc">
          逐步拆解 Vue 响应式系统与渲染机制，通过可交互的代码可视化演示，彻底弄懂每一个核心模块的运行原理
        </p>
      </section>

      <!-- 章节目录 -->
      <section class="chapters">
        <h2 class="section-title">课程章节</h2>
        <div class="chapter-grid">
          <router-link
            v-for="ch in chapters"
            :key="ch.id"
            :to="`/chapter/${ch.id}`"
            class="chapter-card"
          >
            <div class="card-header">
              <span class="card-number">{{ String(ch.id).padStart(2, '0') }}</span>
              <span v-if="ch.status === 'done'" class="card-status done">
                <i class="fa-solid fa-check"></i> 已完成
              </span>
              <span v-else class="card-status wip">
                <i class="fa-solid fa-wrench"></i> 敬请期待
              </span>
            </div>
            <h3 class="card-title">{{ ch.title }}</h3>
            <p class="card-desc">{{ ch.desc }}</p>
            <div class="card-tags">
              <span v-for="tag in ch.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </router-link>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const chapters = reactive([
  {
    id: 1,
    title: '响应式系统：reactive 与 effect',
    desc: '从 Proxy 到依赖收集（track）与触发（trigger），理解 Vue 响应式数据的底层基石。',
    tags: ['Proxy', 'effect', 'track', 'trigger'],
    status: 'done',
  },
  {
    id: 2,
    title: '调度系统：scheduler',
    desc: '探索 Vue 如何通过调度器控制副作用的执行时机、去重与批量更新，避免无限递归。',
    tags: ['scheduler', 'queue', 'nextTick'],
    status: 'done',
  },
  {
    id: 3,
    title: '计算属性：computed',
    desc: '深入 computed 的懒执行与缓存机制，理解脏标记（dirty flag）的工作原理。',
    tags: ['computed', 'cache', 'dirty'],
    status: 'done',
  },
  {
    id: 4,
    title: '侦听器：watch',
    desc: '解析 watch 的实现原理，包括递归遍历 getter、旧值保存与深度侦听机制。',
    tags: ['watch', 'traverse', 'oldValue'],
    status: 'done',
  },
  {
    id: 5,
    title: '原始值响应式：ref',
    desc: '为什么需要 ref？理解 Proxy 的局限与 Ref 的对象包装策略。',
    tags: ['ref', 'toRef', 'toRefs'],
    status: 'done',
  },
  {
    id: 6,
    title: '嵌套 effect 与作用域',
    desc: '解决 effect 嵌套时的依赖错乱问题，理解 effectStack 与活跃作用域管理。',
    tags: ['nested', 'effectStack', 'scope'],
    status: 'done',
  },
  {
    id: 7,
    title: '虚拟 DOM',
    desc: '从真实 DOM 的性能瓶颈出发，理解 VNode 的设计理念与 JavaScript 对象描述 UI 的优势。',
    tags: ['VNode', 'h函数', '性能'],
    status: 'done',
  },
  {
    id: 8,
    title: 'Diff 算法',
    desc: '逐行拆解 Vue3 的双端 Diff 算法，理解最长递增子序列在节点复用中的关键作用。',
    tags: ['patch', 'key', 'LIS'],
    status: 'done',
  },
  {
    id: 9,
    title: '编译模板',
    desc: '从模板字符串到渲染函数，拆解 Parse、Transform、Codegen 三阶段编译流程。',
    tags: ['AST', 'Transform', 'Codegen'],
    status: 'done',
  },
  {
    id: 10,
    title: '组件系统',
    desc: '理解组件的渲染、更新与卸载生命周期，探究 setup 函数与组件实例的内部设计。',
    tags: ['VComponent', 'props', 'emit'],
    status: 'done',
  },
])
</script>

<style scoped>
.home-page { position: relative; }
.bg-glow {
  position: fixed; border-radius: 50%; filter: blur(150px);
  pointer-events: none; z-index: 0;
}
.glow-1 { width: 600px; height: 600px; background: radial-gradient(circle, rgba(16,185,129,0.04), transparent); top: -200px; right: -100px; }
.glow-2 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(5,150,105,0.03), transparent); bottom: 0; left: -200px; }

.home-container {
  max-width: 1100px; margin: 0 auto; padding: 4rem 1.5rem 6rem;
  position: relative; z-index: 1;
}

/* 英雄区 */
.hero { text-align: center; margin-bottom: 5rem; }
.hero-badge {
  display: inline-block; font-family: var(--font-mono); font-size: 0.7rem;
  color: var(--accent); background: var(--accent-dim); padding: 6px 16px;
  border-radius: 20px; letter-spacing: 0.1em; margin-bottom: 1.5rem;
}
.hero-title {
  font-size: clamp(2rem, 5vw, 3.2rem); font-weight: 900;
  line-height: 1.2; letter-spacing: -0.03em; margin-bottom: 1.25rem;
}
.text-accent { color: var(--accent); }
.hero-desc {
  color: var(--muted); font-size: 1.05rem; max-width: 600px;
  margin: 0 auto; line-height: 1.7;
}

/* 浏览器兼容提示 */
.browser-warning {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.25);
  border-radius: var(--radius-sm);
  padding: 12px 16px;
  margin-bottom: 2.5rem;
  font-size: 0.82rem;
  color: var(--amber);
  line-height: 1.5;
}
.browser-warning i {
  font-size: 1.4rem;
  flex-shrink: 0;
  color: #4285f4;
}
.browser-warning strong {
  color: #d0e4da;
}

/* 章节列表 */
.section-title {
  font-size: 0.8rem; font-weight: 600; color: var(--muted);
  text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1.5rem;
  padding-left: 4px;
}
.chapter-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}
.chapter-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 1.5rem;
  transition: all 0.3s ease; cursor: pointer; display: flex;
  flex-direction: column; gap: 0.75rem;
}
.chapter-card:hover {
  border-color: rgba(16,185,129,0.4); background: var(--bg-elevated);
  transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.2);
}
.card-header { display: flex; align-items: center; justify-content: space-between; }
.card-number {
  font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700;
  color: var(--accent); background: var(--accent-dim); width: 32px;
  height: 24px; border-radius: 6px; display: flex; align-items: center;
  justify-content: center;
}
.card-status {
  font-size: 0.65rem; padding: 3px 8px; border-radius: 4px; font-weight: 500;
}
.card-status.done { color: var(--accent); background: var(--accent-dim); }
.card-status.wip { color: var(--muted); background: rgba(94,138,118,0.1); }
.card-title { font-size: 1rem; font-weight: 700; line-height: 1.4; }
.card-desc { color: var(--muted); font-size: 0.82rem; line-height: 1.6; flex: 1; }
.card-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px; }
.tag {
  font-family: var(--font-mono); font-size: 0.65rem; color: var(--muted);
  background: rgba(26,46,37,0.5); padding: 3px 8px; border-radius: 4px;
}

@media (max-width: 640px) {
  .home-container { padding: 2.5rem 1rem 4rem; }
  .hero { margin-bottom: 3rem; }
  .chapter-grid { grid-template-columns: 1fr; }
}
</style>
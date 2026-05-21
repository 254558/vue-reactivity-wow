<template>
  <div class="home-page">

    <div class="home-container">

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
          每一行核心代码都嵌入了 <code>debugger</code>，需要 <strong class="text-chrome">Chrome</strong> DevTools Sources 面板<br>
          打开 F12，选择章节，跟着按钮一步步步进调试。
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

      <!-- 调试指南 -->
      <section class="guide">
        <h2 class="guide-title">调试指南</h2>
        <div class="guide-grid">
          <div class="guide-card sticky-yellow">
            <h3>开始调试</h3>
            <ol>
              <li>用 <strong class="text-chrome">Chrome</strong> 打开页面，按 <kbd>F12</kbd> 打开 DevTools</li>
              <li>切换到 <strong>Sources</strong> 面板</li>
              <li>点击章节按钮，<code>debugger</code> 会自动暂停执行</li>
              <li>看注释说明当前变量值，在 <strong>Scope</strong> 面板中对照验证</li>
            </ol>
          </div>
          <div class="guide-card sticky-green">
            <h3>步进按钮</h3>
            <!-- 👇 就是这里加了 tbody -->
            <table class="key-table">
              <tbody>
                <tr><td><kbd>F10</kbd></td><td>Step Over</td><td>逐行执行，遇到函数<strong>不进入</strong>，直接拿到返回值</td></tr>
                <tr><td><kbd>F11</kbd></td><td>Step Into</td><td>逐行执行，遇到函数<strong>进入内部</strong></td></tr>
                <tr><td><kbd>Shift+F11</kbd></td><td>Step Out</td><td>从当前函数<strong>直接执行完</strong>，回到调用处</td></tr>
                <tr><td><kbd>F8</kbd></td><td>Resume</td><td>继续运行，直到下一个 <code>debugger</code> 断点</td></tr>
              </tbody>
            </table>
          </div>
          <div class="guide-card sticky-blue">
            <h3>阅读注释</h3>
            <ul>
              <li>每个 <code>debugger</code> 上方的注释格式：<code>Scope &gt; 作用域: 变量 = 当前值</code></li>
              <li>在 DevTools 的 <strong>Scope</strong> 面板中展开对应作用域，验证注释中描述的值</li>
              <li><strong>Local</strong> = 当前函数的局部变量，<strong>Script</strong> = 全局变量，<strong>Closure</strong> = 闭包变量</li>
            </ul>
          </div>
          <div class="guide-card sticky-pink">
            <h3>自定义断点</h3>
            <ul>
              <li>在 Sources 面板中<strong>点击行号</strong>即可设置/取消断点（蓝色标记）</li>
              <li>预设的 <code>debugger</code> 覆盖了关键节点，但你可以随时在任意行加断点</li>
              <li>想看两行 <code>debugger</code> 之间发生了什么？在中间的行点击行号加断点，按 <kbd>F8</kbd> 跳到那里</li>
            </ul>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
const chapters = [
  { id: 0, title: '调试入门', desc: '从零学会 Chrome DevTools 调试：Step Over、Step Into、调用栈、Resume。', tags: ['F10', 'F11', 'Scope', 'CallStack'], steps: 5, color: '#6b7280' },
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
.text-chrome {
  color: #f59e0b;
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

/* ===== 调试指南 — 便利贴 ===== */
.guide {
  margin-top: 3.5rem;
  margin-bottom: 3.5rem;
}
.guide-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #5e8a76;
  letter-spacing: 0.1em;
  margin-bottom: 1.25rem;
  text-align: center;
}
.guide-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.1rem;
}
.guide-card {
  position: relative;
  border-radius: 0;
  padding: 1.4rem 1.5rem 1.3rem;
  box-shadow:
    2px 3px 8px rgba(0,0,0,0.25),
    inset 0 -2px 4px rgba(0,0,0,0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.guide-card:hover {
  transform: translateY(-3px) rotate(0deg) !important;
  box-shadow:
    3px 6px 18px rgba(0,0,0,0.35),
    inset 0 -2px 4px rgba(0,0,0,0.06);
  z-index: 2;
}
/* 黄色便利贴 */
.sticky-yellow {
  background: #fef3c7;
  transform: rotate(-1.2deg);
  color: #4a3a1a;
}
.sticky-yellow h3 { color: #92400e; }
.sticky-yellow ol, .sticky-yellow ul { color: #6b4f20; }
.sticky-yellow strong { color: #3b2a08; }
.sticky-yellow kbd {
  color: #92400e;
  background: rgba(146,64,14,0.1);
  border-color: #d6b882;
}
.sticky-yellow code {
  color: #92400e;
  background: rgba(146,64,14,0.1);
}

/* 绿色便利贴 */
.sticky-green {
  background: #d1fae5;
  transform: rotate(0.8deg);
  color: #14332a;
}
.sticky-green h3 { color: #065f46; }
.sticky-green ol, .sticky-green ul { color: #1a5c44; }
.sticky-green strong { color: #0a3d2e; }
.sticky-green kbd {
  color: #065f46;
  background: rgba(6,95,70,0.1);
  border-color: #8dcfb2;
}
.sticky-green code {
  color: #065f46;
  background: rgba(6,95,70,0.1);
}
.sticky-green .key-table td {
  border-bottom-color: #a7f3d0;
  color: #1a5c44;
}
.sticky-green .key-table td:nth-child(2) { color: #065f46; }

/* 蓝色便利贴 */
.sticky-blue {
  background: #dbeafe;
  transform: rotate(-0.6deg);
  color: #1e2f4a;
}
.sticky-blue h3 { color: #1e40af; }
.sticky-blue ol, .sticky-blue ul { color: #2a4478; }
.sticky-blue strong { color: #162d5a; }
.sticky-blue kbd {
  color: #1e40af;
  background: rgba(30,64,175,0.1);
  border-color: #93b8f0;
}
.sticky-blue code {
  color: #1e40af;
  background: rgba(30,64,175,0.1);
}

/* 粉色便利贴 */
.sticky-pink {
  background: #fce7f3;
  transform: rotate(1deg);
  color: #4a1a2e;
}
.sticky-pink h3 { color: #9d174d; }
.sticky-pink ol, .sticky-pink ul { color: #7a2d4a; }
.sticky-pink strong { color: #5a102e; }
.sticky-pink kbd {
  color: #9d174d;
  background: rgba(157,23,77,0.1);
  border-color: #f0a0c2;
}
.sticky-pink code {
  color: #9d174d;
  background: rgba(157,23,77,0.1);
}

/* 便利贴通用排版 */
.guide-card h3 {
  font-size: 0.88rem;
  font-weight: 800;
  margin-bottom: 0.65rem;
  padding-bottom: 0.4rem;
  border-bottom: 2px dashed rgba(0,0,0,0.1);
}
.guide-card ol,
.guide-card ul {
  padding-left: 1.2em;
  font-size: 0.78rem;
  line-height: 1.8;
}
.guide-card ol { list-style: decimal; }
.guide-card ul { list-style: disc; }
.guide-card li { margin-bottom: 0.25rem; }
.guide-card kbd {
  display: inline-block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  border: 1px solid;
  padding: 1px 6px;
  border-radius: 3px;
  line-height: 1.6;
}
.guide-card code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.72rem;
  padding: 0 5px;
  border-radius: 3px;
}
.key-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.76rem;
}
.key-table td {
  padding: 0.35rem 0.5rem;
  border-bottom: 1px solid rgba(0,0,0,0.08);
  vertical-align: top;
  line-height: 1.6;
}
.key-table td:first-child {
  width: 90px;
  white-space: nowrap;
}
.key-table td:nth-child(2) {
  width: 80px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
}

/* ===== 响应式 ===== */
@media (max-width: 640px) {
  .home-container { padding: 2rem 1rem 4rem; }
  .hero { margin-bottom: 3rem; }
  .chapter-grid { grid-template-columns: 1fr; }
}
</style>
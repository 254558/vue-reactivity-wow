<template>
  <div class="demo-layout">
    <div class="main-grid">
      <!-- 左栏：代码 + 说明 -->
      <div class="left-col">
        <!-- 代码面板 -->
        <div class="code-panel">
          <div class="code-header">
            <div class="code-dots">
              <span class="dot r"></span><span class="dot y"></span><span class="dot g"></span>
            </div>
            <span class="code-filename">mini-vue.js</span>
            <span class="lines-tag" v-if="store.activeLines.length">
              L{{ store.activeLines[0] + 1 }}-L{{ store.activeLines[store.activeLines.length - 1] + 1 }}
            </span>
          </div>
          <div class="code-body" ref="codeRef">
            <div v-for="(line, idx) in highlightedLines" :key="idx"
              class="code-line"
              :class="{ active: store.activeLines.includes(idx), dim: store.activeLines.length > 0 && !store.activeLines.includes(idx) }">
              <span class="line-no">{{ idx + 1 }}</span>
              <span v-html="line"></span>
            </div>
          </div>
        </div>

        <!-- 步骤说明 -->
        <Transition name="v" mode="out-in">
          <div class="step-desc" v-if="store.currentStepData" :key="store.currentStep">
            <div class="desc-head">
              <div class="desc-badge" :style="{ background: store.currentStepData.color + '18', color: store.currentStepData.color }">
                {{ store.currentStep }}
              </div>
              <h3>{{ store.currentStepData.title }}</h3>
            </div>
            <p class="desc-text">{{ store.currentStepData.desc }}</p>
            <div class="desc-detail">{{ store.currentStepData.detail }}</div>
          </div>
        </Transition>
      </div>

      <!-- 右栏：可视化 -->
      <div class="right-col">
        <!-- 数据面板 -->
        <div class="viz-card">
          <div class="viz-head"><i class="fa-solid fa-database"></i><h4>响应式数据</h4></div>
          <div class="data-box">
            <div class="d-kw">const state = reactive({</div>
            <div class="d-prop">
              <span class="d-key">count</span><span class="d-colon">:</span>
              <Transition name="fade" mode="out-in">
                <span class="d-val" :key="store.reactiveCount">{{ store.reactiveCount }}</span>
              </Transition>
            </div>
            <div class="d-kw">})</div>
          </div>
        </div>

        <!-- 依赖图 -->
        <div class="viz-card">
          <div class="viz-head"><i class="fa-solid fa-diagram-project"></i><h4>依赖关系图</h4></div>
          <div class="graph">
            <!-- state -->
            <div class="g-node" :class="{ hl: hl.state }">
              <div class="g-dot" :class="{ on: hl.state }"></div>
              <span class="g-label">state (Proxy)</span>
              <div class="g-detail"><span class="g-prop">.count</span><span class="g-arrow">→</span><span class="dep-tag" :class="{ dim: !hl.state }">{{ store.reactiveCount }}</span></div>
            </div>
            <div class="g-conn" :class="{ active: hl.bucket }"></div>
            <!-- bucket -->
            <div class="g-node" :class="{ hl: hl.bucket }">
              <div class="g-dot" :class="{ on: hl.bucket }"></div>
              <span class="g-label">bucket (WeakMap)</span>
              <div v-if="store.hasTracked" class="g-tree">
                <div>└── state → Map</div>
                <div style="padding-left:16px">└── "count" → Set</div>
                <div style="padding-left:32px"><span class="dep-tag">effectFn</span></div>
              </div>
              <div v-else class="g-empty">空 (尚未收集依赖)</div>
            </div>
            <div class="g-conn" :class="{ active: hl.effect, trigger: store.currentStep === 6 }"></div>
            <!-- effect -->
            <div class="g-node" :class="{ hl: hl.effect }">
              <div class="g-dot" :class="{ on: hl.effect }"></div>
              <span class="g-label">effectFn</span>
              <div class="g-detail"><span class="g-fn">render() { ... }</span></div>
            </div>
          </div>
        </div>

        <!-- 操作区 -->
        <div class="viz-card action">
          <button class="inc-btn" :class="{ pulse: store.canIncrement }" @click="store.increment()" :disabled="!store.canIncrement">
            <i class="fa-solid fa-plus"></i> state.count++
          </button>
          <div v-if="store.triggerLogs.length" class="logs">
            <div class="logs-head"><i class="fa-solid fa-clock-rotate-left"></i> 触发日志</div>
            <TransitionGroup name="fade" tag="div" class="logs-list">
              <div v-for="(log, i) in store.triggerLogs" :key="log.time + i" class="log-item">
                <span class="l-idx">#{{ store.triggerLogs.length - i }}</span>
                <span class="l-key">count</span><span class="l-colon">:</span>
                <span class="l-from">{{ log.from }}</span><span class="l-arrow">→</span>
                <span class="l-to">{{ log.to }}</span>
                <span class="l-time">{{ log.time }}</span>
              </div>
            </TransitionGroup>
          </div>
          <div v-else class="logs-empty">{{ store.canIncrement ? '点击按钮触发更新' : '完成步骤 6 解锁' }}</div>
        </div>
      </div>
    </div>

    <!-- 底部控制栏 -->
    <div class="controls">
      <button class="ctrl-btn outline" @click="store.prevStep()" :disabled="store.currentStep <= 1">
        <i class="fa-solid fa-chevron-left"></i> 上一步
      </button>
      <div class="step-tabs">
        <button v-for="(s, i) in store.steps" :key="i" class="s-tab"
          :class="{ current: i + 1 === store.currentStep }"
          :disabled="i + 1 > store.currentStep"
          @click="store.goToStep(i + 1)">{{ s.label }}</button>
      </div>
      <button class="ctrl-btn primary" @click="store.nextStep()" :disabled="store.currentStep >= store.totalSteps">
        <template v-if="store.currentStep < store.totalSteps">下一步 <i class="fa-solid fa-chevron-right"></i></template>
        <template v-else>完成 <i class="fa-solid fa-check"></i></template>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import { useChapter1Store } from '@/stores/chapter1'
import { sourceCode } from './data'

const store = useChapter1Store()
const codeRef = ref(null)

// 语法高亮
const kw = ['let','const','var','function','return','if','new','true','false','null']
const types = ['WeakMap','Map','Set','Proxy']
const fns = ['effect','track','trigger','reactive','get','set','forEach','add','querySelector']

function highlight(line) {
  let h = line.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  if (h.trimStart().startsWith('//')) return `<span style="color:#4a6e5e;font-style:italic">${h}</span>`
  h = h.replace(/\$\{([^}]+)\}/g, '<span style="color:#34d399">${$1}</span>')
  h = h.replace(/(`[^`]*`)/g, '<span style="color:#f0a85e">$1</span>')
  h = h.replace(/('[^']*')/g, '<span style="color:#f0a85e">$1</span>')
  types.forEach(t => { h = h.replace(new RegExp(`\\b(${t})\\b`,'g'), '<span style="color:#60a5fa">$1</span>') })
  fns.forEach(f => { h = h.replace(new RegExp(`\\b(${f})\\b`,'g'), '<span style="color:#fbbf24">$1</span>') })
  kw.forEach(k => { h = h.replace(new RegExp(`\\b(${k})\\b`,'g'), '<span style="color:#7dd3a8">$1</span>') })
  h = h.replace(/\b(\d+)\b/g, '<span style="color:#f472b6">$1</span>')
  return h
}

const highlightedLines = computed(() => sourceCode.split('\n').map(l => highlight(l)))
const hl = computed(() => store.currentStepData?.highlight || {})

// 自动滚动
watch(() => store.activeLines, async () => {
  await nextTick()
  const el = codeRef.value?.querySelector('.code-line.active')
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
})
</script>

<style scoped>
.demo-layout { display: flex; flex-direction: column; gap: 1rem; }
.main-grid { display: grid; grid-template-columns: 1fr 380px; gap: 1.25rem; }
.left-col, .right-col { display: flex; flex-direction: column; gap: 1rem; }

/* 代码面板 */
.code-panel { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
.code-header { display: flex; align-items: center; padding: 10px 16px; border-bottom: 1px solid var(--border); gap: 10px; }
.code-dots { display: flex; gap: 6px; }
.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot.r { background: rgba(239,68,68,0.7); }
.dot.y { background: rgba(245,158,11,0.7); }
.dot.g { background: rgba(16,185,129,0.7); }
.code-filename { font-family: var(--font-mono); font-size: 0.72rem; color: var(--muted); }
.lines-tag { margin-left: auto; font-family: var(--font-mono); font-size: 0.62rem; color: var(--accent); background: var(--accent-dim); padding: 2px 8px; border-radius: 4px; }
.code-body { padding: 14px; font-family: var(--font-mono); font-size: 0.78rem; line-height: 1.7; max-height: 480px; overflow: auto; }
.code-line { padding: 1px 0 1px 12px; border-left: 3px solid transparent; transition: all 0.3s; white-space: pre; }
.code-line.active { background: rgba(16,185,129,0.06); border-left-color: var(--accent); }
.code-line.dim { opacity: 0.3; }
.line-no { display: inline-block; width: 26px; text-align: right; margin-right: 14px; color: #2a4a3a; font-size: 0.62rem; user-select: none; }

/* 说明 */
.step-desc { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px; display: flex; flex-direction: column; gap: 10px; }
.desc-head { display: flex; align-items: center; gap: 10px; }
.desc-badge { width: 26px; height: 26px; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; font-family: var(--font-mono); }
.desc-head h3 { font-size: 0.92rem; font-weight: 700; }
.desc-text { color: var(--muted); font-size: 0.82rem; line-height: 1.65; }
.desc-detail { background: rgba(7,11,9,0.6); border-radius: var(--radius-sm); padding: 12px; font-family: var(--font-mono); font-size: 0.72rem; color: rgba(16,185,129,0.75); line-height: 1.6; white-space: pre-wrap; }

/* 可视化卡片 */
.viz-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px; }
.viz-head { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
.viz-head i { color: var(--accent); font-size: 0.7rem; }
.viz-head h4 { font-size: 0.82rem; font-weight: 700; }

/* 数据面板 */
.data-box { background: rgba(7,11,9,0.6); border-radius: var(--radius-sm); padding: 14px; font-family: var(--font-mono); font-size: 0.82rem; }
.d-kw { color: var(--muted); font-size: 0.68rem; }
.d-prop { padding-left: 16px; display: flex; align-items: center; gap: 6px; margin: 6px 0; }
.d-key { color: var(--amber); }
.d-colon { color: var(--muted); }
.d-val { color: var(--crimson); font-weight: 700; font-size: 1.15rem; }

/* 依赖图 */
.graph { display: flex; flex-direction: column; gap: 0; }
.g-node { border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 12px; background: rgba(7,11,9,0.4); transition: all 0.3s; }
.g-node.hl { border-color: rgba(16,185,129,0.4); background: rgba(16,185,129,0.04); }
.g-dot { width: 7px; height: 7px; border-radius: 50%; background: rgba(94,138,118,0.35); display: inline-block; vertical-align: middle; margin-right: 6px; transition: all 0.3s; }
.g-dot.on { background: var(--accent); box-shadow: 0 0 6px rgba(16,185,129,0.4); }
.g-label { font-family: var(--font-mono); font-size: 0.72rem; font-weight: 600; color: var(--muted); }
.g-node.hl .g-label { color: var(--fg); }
.g-detail { margin-top: 6px; padding-left: 14px; display: flex; align-items: center; gap: 5px; }
.g-prop { font-family: var(--font-mono); font-size: 0.68rem; color: rgba(245,158,11,0.7); }
.g-arrow { color: rgba(94,138,118,0.3); font-size: 0.6rem; }
.g-fn { font-family: var(--font-mono); font-size: 0.68rem; color: rgba(239,68,68,0.7); }
.dep-tag { background: var(--accent-dim); border: 1px solid rgba(16,185,129,0.2); border-radius: 5px; padding: 1px 7px; font-size: 0.62rem; font-family: var(--font-mono); color: var(--accent); transition: opacity 0.3s; }
.dep-tag.dim { opacity: 0.4; }
.g-tree { margin-top: 6px; padding-left: 10px; font-family: var(--font-mono); font-size: 0.62rem; color: var(--muted); line-height: 1.8; animation: fade-slide-up 0.4s ease; }
.g-empty { margin-top: 6px; padding-left: 14px; font-size: 0.62rem; color: rgba(94,138,118,0.25); font-style: italic; }
.g-conn { display: flex; justify-content: center; padding: 2px 0; }
.g-conn::after { content: ''; width: 2px; height: 16px; border-radius: 1px; background: var(--border); transition: background 0.4s; }
.g-conn.active::after { background: var(--accent); }
.g-conn.trigger::after { background: var(--crimson); }

/* 操作区 */
.action { display: flex; flex-direction: column; gap: 10px; }
.inc-btn { width: 100%; padding: 11px; border-radius: var(--radius-sm); border: none; background: linear-gradient(135deg,#059669,#10b981); color: white; font-weight: 700; font-size: 0.82rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; transition: all 0.3s; box-shadow: 0 2px 12px rgba(16,185,129,0.2); }
.inc-btn:hover:not(:disabled) { box-shadow: 0 4px 20px rgba(16,185,129,0.35); transform: translateY(-1px); }
.inc-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.inc-btn.pulse { animation: pulse-ring 2s ease-in-out infinite; }
.logs-head { font-size: 0.68rem; font-weight: 600; color: var(--muted); display: flex; align-items: center; gap: 4px; margin-bottom: 4px; }
.logs-list { display: flex; flex-direction: column; gap: 3px; max-height: 120px; overflow-y: auto; }
.log-item { background: rgba(7,11,9,0.6); border-radius: 5px; padding: 5px 8px; font-family: var(--font-mono); font-size: 0.65rem; display: flex; align-items: center; gap: 4px; }
.l-idx { color: rgba(94,138,118,0.45); }
.l-key { color: var(--amber); }
.l-colon { color: var(--muted); }
.l-from { color: var(--crimson); }
.l-arrow { color: var(--muted); }
.l-to { color: var(--accent); }
.l-time { margin-left: auto; color: rgba(94,138,118,0.3); font-size: 0.58rem; }
.logs-empty { text-align: center; padding: 8px; font-size: 0.68rem; color: rgba(94,138,118,0.3); }

/* 控制栏 */
.controls {
  position: sticky; bottom: 0; z-index: 50; border-top: 1px solid var(--border);
  backdrop-filter: blur(20px); background: rgba(7,11,9,0.85);
  border-radius: var(--radius); padding: 12px 16px;
  display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 0.5rem;
}
.ctrl-btn { padding: 9px 18px; border-radius: var(--radius-sm); font-size: 0.82rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.3s; white-space: nowrap; }
.ctrl-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.ctrl-btn.outline { border: 1px solid var(--border); background: transparent; color: var(--fg); }
.ctrl-btn.outline:hover:not(:disabled) { border-color: var(--accent); background: var(--accent-dim); }
.ctrl-btn.primary { border: none; background: linear-gradient(135deg,#059669,#10b981); color: white; box-shadow: 0 2px 12px rgba(16,185,129,0.2); }
.ctrl-btn.primary:hover:not(:disabled) { box-shadow: 0 4px 20px rgba(16,185,129,0.35); transform: translateY(-1px); }
.step-tabs { display: flex; gap: 3px; overflow-x: auto; }
.s-tab { padding: 5px 10px; border-radius: 5px; font-size: 0.68rem; font-weight: 500; border: none; background: transparent; color: var(--muted); cursor: pointer; transition: all 0.3s; white-space: nowrap; font-family: var(--font-mono); }
.s-tab:disabled { opacity: 0.35; cursor: not-allowed; }
.s-tab.current { background: var(--accent-dim); color: var(--accent); border: 1px solid rgba(16,185,129,0.3); }

@keyframes pulse-ring { 0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,0.3)}50%{box-shadow:0 0 16px 4px rgba(16,185,129,0.12)} }

@media (max-width: 1024px) {
  .main-grid { grid-template-columns: 1fr; }
  .step-tabs { display: none; }
}
</style>
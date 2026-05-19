<template>
  <div class="demo-layout">
    <div class="main-grid">
      <!-- 左栏：代码 + 说明 -->
      <div class="left-col">
        <div class="code-panel">
          <div class="code-header">
            <div class="code-dots"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span></div>
            <span class="code-filename">computed.js</span>
            <span class="lines-tag" v-if="store.activeLines.length">L{{ store.activeLines[0]+1 }}-L{{ store.activeLines[store.activeLines.length-1]+1 }}</span>
          </div>
          <div class="code-body" ref="codeRef">
            <div v-for="(line, idx) in highlightedLines" :key="idx" class="code-line"
              :class="{ active: store.activeLines.includes(idx), dim: store.activeLines.length > 0 && !store.activeLines.includes(idx) }">
              <span class="line-no">{{ idx + 1 }}</span>
              <span v-html="line"></span>
            </div>
          </div>
        </div>
        <Transition name="v" mode="out-in">
          <div class="step-desc" v-if="store.currentStepData" :key="store.currentStep">
            <div class="desc-head">
              <div class="desc-badge" :style="{ background: store.currentStepData.color+'18', color: store.currentStepData.color }">{{ store.currentStep }}</div>
              <h3>{{ store.currentStepData.title }}</h3>
            </div>
            <p class="desc-text">{{ store.currentStepData.desc }}</p>
            <div class="desc-detail">{{ store.currentStepData.detail }}</div>
          </div>
        </Transition>
      </div>
      <!-- 右栏：可视化 -->
      <div class="right-col">
        <!-- 数据状态 -->
        <div class="viz-card">
          <div class="viz-head"><i class="fa-solid fa-database"></i><h4>响应式数据与状态</h4></div>
          <div class="state-grid">
            <div class="state-item">
              <div class="state-label">state.count</div>
              <Transition name="fade" mode="out-in">
                <div class="state-val amber" :key="store.reactiveCount">{{ store.reactiveCount }}</div>
              </Transition>
            </div>
            <div class="state-item">
              <div class="state-label">dirty 标志</div>
              <div class="state-val" :class="store.dirty ? 'crimson' : 'accent'">
                <i :class="store.dirty ? 'fa-solid fa-circle-exclamation' : 'fa-solid fa-circle-check'" style="margin-right:4px"></i>
                {{ store.dirty ? 'TRUE (脏)' : 'FALSE (干净)' }}
              </div>
            </div>
          </div>
        </div>
        <!-- Computed 流程可视化 -->
        <div class="viz-card">
          <div class="viz-head"><i class="fa-solid fa-microchip"></i><h4>Computed 运行机制</h4></div>
          <div class="mechanism">
            <!-- 依赖数据 -->
            <div class="mech-node source" :class="{ hl: store.currentStep >= 1 }">
              <div class="mech-dot"></div>
              <span class="mech-label">state.count</span>
              <span class="mech-val">{{ store.reactiveCount }}</span>
            </div>
            <div class="mech-conn"></div>
            <!-- Getter / EffectFn -->
            <div class="mech-node processor" :class="{ hl: store.currentStep >= 3, computing: store.isComputing }">
              <div class="mech-dot"></div>
              <span class="mech-label">getter (effectFn)</span>
              <span class="mech-formula">count × 2</span>
              <div class="mech-meta">
                执行次数: <strong>{{ store.getterCallCount }}</strong>
              </div>
            </div>
            <div class="mech-conn" :class="{ active: !store.dirty }"></div>
            <!-- 缓存区 -->
            <div class="mech-node cache" :class="{ hl: store.currentStep >= 4, filled: !store.dirty && store.cachedValue !== undefined }">
              <div class="mech-dot"></div>
              <span class="mech-label">Cache (value)</span>
              <Transition name="fade" mode="out-in">
                <span class="mech-val" :key="store.cachedValue">{{ store.computedDisplay }}</span>
              </Transition>
              <div class="cache-status" v-if="store.cachedValue !== undefined">
                <span v-if="store.dirty" class="tag dirty-tag">已失效</span>
                <span v-else class="tag clean-tag">有效</span>
              </div>
            </div>
            <div class="mech-conn"></div>
            <!-- 读取 -->
            <div class="mech-node output" :class="{ hl: store.readCount > 0 }">
              <div class="mech-dot"></div>
              <span class="mech-label">obj.value 读取</span>
              <span class="mech-val">共 {{ store.readCount }} 次</span>
            </div>
          </div>
        </div>
        <!-- 操作区 -->
        <div class="viz-card action">
          <div class="action-label">交互模拟 (步骤 6 解锁)</div>
          <div class="btn-group">
            <button class="act-btn read" @click="store.simulateRead()" :disabled="!store.canInteract || store.isComputing">
              <i class="fa-solid fa-eye"></i> 读取 obj.value
            </button>
            <button class="act-btn write" @click="store.simulateChange()" :disabled="!store.canInteract || store.isComputing">
              <i class="fa-solid fa-pen"></i> 修改 count++
            </button>
          </div>
          <div v-if="store.triggerLogs.length" class="logs">
            <div class="logs-head"><i class="fa-solid fa-clock-rotate-left"></i> 执行日志</div>
            <TransitionGroup name="fade" tag="div" class="logs-list">
              <div v-for="(log, i) in store.triggerLogs" :key="log.time + i" class="log-item">
                <span class="l-type" :class="{ compute: log.type.includes('计算'), cache: log.type.includes('缓存'), change: log.type.includes('修改') }">{{ log.type }}</span>
                <span class="l-detail">{{ log.detail }}</span>
                <span class="l-time">{{ log.time }}</span>
              </div>
            </TransitionGroup>
          </div>
          <div v-else class="logs-empty">完成步骤 6 后解锁交互</div>
        </div>
      </div>
    </div>
    <!-- 控制栏 -->
    <div class="controls">
      <button class="ctrl-btn outline" @click="store.prevStep()" :disabled="store.currentStep <= 1"><i class="fa-solid fa-chevron-left"></i> 上一步</button>
      <div class="step-tabs">
        <button v-for="(s, i) in store.steps" :key="i" class="s-tab" :class="{ current: i+1 === store.currentStep }" :disabled="i+1 > store.currentStep" @click="store.goToStep(i+1)">{{ s.label }}</button>
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
import { useChapter3Store } from '@/stores/chapter3'
import { sourceCode } from './data'
const store = useChapter3Store()
const codeRef = ref(null)
const kw = ['let','const','var','function','return','if','new','true','false','undefined']
const types = ['WeakMap','Map','Set','Proxy','Promise']
const fns = ['effect','track','trigger','reactive','computed','scheduler','getter']
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
.code-body { padding: 14px; font-family: var(--font-mono); font-size: 0.78rem; line-height: 1.7; max-height: 520px; overflow: auto; }
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
/* 数据状态 */
.state-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.state-item { background: rgba(7,11,9,0.6); border-radius: var(--radius-sm); padding: 12px; text-align: center; }
.state-label { font-size: 0.68rem; color: var(--muted); margin-bottom: 4px; }
.state-val { font-family: var(--font-mono); font-size: 0.85rem; font-weight: 700; }
.state-val.amber { color: var(--amber); }
.state-val.crimson { color: var(--crimson); font-size: 0.75rem; }
.state-val.accent { color: var(--accent); font-size: 0.75rem; }
/* 机制可视化 */
.mechanism { display: flex; flex-direction: column; gap: 0; align-items: stretch; }
.mech-node {
  border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 12px;
  background: rgba(7,11,9,0.4); transition: all 0.35s; display: flex; flex-wrap: wrap;
  align-items: center; gap: 6px;
}
.mech-node.hl { border-color: rgba(16,185,129,0.4); background: rgba(16,185,129,0.04); }
.mech-node.source.hl { border-color: rgba(245,158,11,0.5); background: rgba(245,158,11,0.04); }
.mech-node.processor.computing { border-color: rgba(16,185,129,0.6); background: rgba(16,185,129,0.08); animation: node-flash 0.6s ease-out; }
.mech-node.cache.filled { border-color: rgba(96,165,250,0.4); background: rgba(96,165,250,0.04); }
.mech-node.output.hl { border-color: rgba(94,138,118,0.5); }
.mech-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(94,138,118,0.3); }
.mech-node.hl .mech-dot { background: var(--accent); box-shadow: 0 0 4px rgba(16,185,129,0.4); }
.mech-node.source.hl .mech-dot { background: var(--amber); box-shadow: 0 0 4px rgba(245,158,11,0.4); }
.mech-label { font-family: var(--font-mono); font-size: 0.7rem; font-weight: 600; color: var(--muted); }
.mech-node.hl .mech-label { color: var(--fg); }
.mech-val { font-family: var(--font-mono); font-size: 0.82rem; font-weight: 700; color: var(--accent); margin-left: auto; }
.mech-formula { font-family: var(--font-mono); font-size: 0.62rem; color: rgba(245,158,11,0.7); background: rgba(245,158,11,0.1); padding: 2px 6px; border-radius: 3px; }
.mech-meta { width: 100%; font-size: 0.6rem; color: var(--muted); margin-top: 2px; padding-left: 12px; }
.mech-meta strong { color: var(--crimson); }
.cache-status { margin-left: 6px; }
.tag { font-size: 0.55rem; padding: 1px 6px; border-radius: 3px; font-weight: 600; font-family: var(--font-mono); }
.dirty-tag { background: rgba(239,68,68,0.15); color: var(--crimson); border: 1px solid rgba(239,68,68,0.3); }
.clean-tag { background: var(--accent-dim); color: var(--accent); border: 1px solid rgba(16,185,129,0.3); }
.mech-conn { display: flex; justify-content: center; padding: 3px 0; }
.mech-conn::after { content: ''; width: 2px; height: 12px; border-radius: 1px; background: var(--border); transition: background 0.4s; }
.mech-conn.active::after { background: var(--accent); }
/* 操作区 */
.action { display: flex; flex-direction: column; gap: 10px; }
.action-label { font-size: 0.68rem; color: var(--muted); }
.btn-group { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.act-btn {
  padding: 10px; border-radius: var(--radius-sm); border: none; font-weight: 700;
  font-size: 0.78rem; cursor: pointer; display: flex; align-items: center;
  justify-content: center; gap: 6px; transition: all 0.3s; font-family: var(--font-sans);
}
.act-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.act-btn.read { background: linear-gradient(135deg, #0369a1, #0ea5e9); color: white; box-shadow: 0 2px 10px rgba(14,165,233,0.2); }
.act-btn.read:hover:not(:disabled) { box-shadow: 0 4px 18px rgba(14,165,233,0.35); transform: translateY(-1px); }
.act-btn.write { background: linear-gradient(135deg, #b45309, #f59e0b); color: white; box-shadow: 0 2px 10px rgba(245,158,11,0.2); }
.act-btn.write:hover:not(:disabled) { box-shadow: 0 4px 18px rgba(245,158,11,0.35); transform: translateY(-1px); }
.logs-head { font-size: 0.68rem; font-weight: 600; color: var(--muted); display: flex; align-items: center; gap: 4px; margin-bottom: 4px; }
.logs-list { display: flex; flex-direction: column; gap: 3px; max-height: 130px; overflow-y: auto; }
.log-item { background: rgba(7,11,9,0.6); border-radius: 5px; padding: 5px 8px; font-family: var(--font-mono); font-size: 0.62rem; display: flex; align-items: center; gap: 5px; }
.l-type { padding: 1px 5px; border-radius: 3px; font-weight: 600; white-space: nowrap; }
.l-type.compute { background: rgba(16,185,129,0.1); color: var(--accent); }
.l-type.cache { background: rgba(96,165,250,0.1); color: #60a5fa; }
.l-type.change { background: rgba(245,158,11,0.1); color: var(--amber); }
.l-detail { color: var(--muted); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.l-time { color: rgba(94,138,118,0.3); font-size: 0.55rem; white-space: nowrap; }
.logs-empty { text-align: center; padding: 8px; font-size: 0.68rem; color: rgba(94,138,118,0.3); }
/* 控制栏 */
.controls { position: sticky; bottom: 0; z-index: 50; border-top: 1px solid var(--border); backdrop-filter: blur(20px); background: rgba(7,11,9,0.85); border-radius: var(--radius); padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 0.5rem; }
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
@keyframes node-flash { 0%{box-shadow:0 0 0 0 rgba(16,185,129,0.5)}50%{box-shadow:0 0 24px 6px rgba(16,185,129,0.2)}100%{box-shadow:0 0 0 0 rgba(16,185,129,0)} }
@media (max-width: 1024px) { .main-grid { grid-template-columns: 1fr; } .step-tabs { display: none; } }
</style>
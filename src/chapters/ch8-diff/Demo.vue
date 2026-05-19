<template>
  <div class="demo-layout">
    <div class="main-grid">
      <!-- 左栏：代码 -->
      <div class="left-col">
        <div class="code-panel">
          <div class="code-header">
            <div class="code-dots"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span></div>
            <span class="code-filename">diff.js</span>
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
        <!-- 双端指针可视化 -->
        <div class="viz-card">
          <div class="viz-head"><i class="fa-solid fa-arrows-left-right"></i><h4>双端指针状态</h4></div>
          <div class="diff-visual">
            <!-- 旧节点 -->
            <div class="node-list">
              <div class="list-label">旧子节点</div>
              <div class="list-row">
                <div v-for="(node, i) in store.oldChildren" :key="'old'+i" 
                  class="node-cell"
                  :class="{ 
                    active: i >= store.oldStartIdx && i <= store.oldEndIdx,
                    start: i === store.oldStartIdx,
                    end: i === store.oldEndIdx,
                    removed: i < store.oldStartIdx || i > store.oldEndIdx
                  }">
                  <span class="cell-key">{{ node }}</span>
                  <span class="cell-idx" v-if="i === store.oldStartIdx && i === store.oldEndIdx">S/E</span>
                  <span class="cell-idx" v-else-if="i === store.oldStartIdx">S</span>
                  <span class="cell-idx" v-else-if="i === store.oldEndIdx">E</span>
                </div>
              </div>
            </div>
            <!-- 连接区 -->
            <div class="connect-area">
              <div class="connect-line" v-if="store.currentStep >= 2"></div>
              <Transition name="fade">
                <div class="match-badge" v-if="matchType">
                  {{ matchType }}
                </div>
              </Transition>
            </div>
            <!-- 新节点 -->
            <div class="node-list new">
              <div class="list-label">新子节点</div>
              <div class="list-row">
                <div v-for="(node, i) in store.newChildren" :key="'new'+i" 
                  class="node-cell"
                  :class="{ 
                    active: i >= store.newStartIdx && i <= store.newEndIdx,
                    start: i === store.newStartIdx,
                    end: i === store.newEndIdx,
                    removed: i < store.newStartIdx || i > store.newEndIdx
                  }">
                  <span class="cell-key">{{ node }}</span>
                  <span class="cell-idx" v-if="i === store.newStartIdx && i === store.newEndIdx">S/E</span>
                  <span class="cell-idx" v-else-if="i === store.newStartIdx">S</span>
                  <span class="cell-idx" v-else-if="i === store.newEndIdx">E</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 操作记录 -->
        <div class="viz-card">
          <div class="viz-head"><i class="fa-solid fa-list-check"></i><h4>DOM 操作序列</h4></div>
          <div class="ops-area">
            <TransitionGroup name="fade" tag="div" class="ops-list" v-if="store.operations.length">
              <div v-for="(op, i) in store.operations" :key="op.msg + i" class="op-item" :class="op.type">
                <span class="op-icon">
                  <i :class="op.type === 'move' ? 'fa-solid fa-arrows-up-down' : op.type === 'add' ? 'fa-solid fa-plus' : op.type === 'remove' ? 'fa-solid fa-minus' : 'fa-solid fa-check'"></i>
                </span>
                <span class="op-nodes">{{ op.nodes.join(', ') }}</span>
                <span class="op-msg">{{ op.msg }}</span>
              </div>
            </TransitionGroup>
            <div v-else class="ops-empty">点击下方按钮执行 Diff 步骤</div>
          </div>
        </div>
        <!-- LIS 优化展示 (步骤6) -->
        <div class="viz-card lis-card" v-if="store.currentStep === 6">
          <div class="viz-head"><i class="fa-solid fa-chart-line"></i><h4>最长递增子序列 (LIS)</h4></div>
          <div class="lis-demo">
            <div class="lis-row">
              <span class="lis-label">新节点</span>
              <div class="lis-cells">
                <span v-for="n in ['B','A','C','D']" :key="n" class="lis-cell">{{ n }}</span>
              </div>
            </div>
            <div class="lis-row">
              <span class="lis-label">旧索引</span>
              <div class="lis-cells">
                <span v-for="(n, i) in [1,0,2,3]" :key="i" class="lis-cell" :class="{ inlis: [0,2,3].includes(n) }">{{ n }}</span>
              </div>
            </div>
            <div class="lis-row result">
              <span class="lis-label">LIS</span>
              <div class="lis-cells">
                <span class="lis-cell ghost"></span>
                <span v-for="n in [0,2,3]" :key="n" class="lis-cell highlight">{{ n }}</span>
              </div>
            </div>
            <div class="lis-conclusion">
              <i class="fa-solid fa-lightbulb"></i>
              索引 0, 2, 3 (对应 A, C, D) 保持不动，只需移动 B
            </div>
          </div>
        </div>
        <!-- 操作区 -->
        <div class="viz-card action">
          <div class="btn-group">
            <button class="act-btn step" @click="store.simulateStep()" :disabled="!store.canInteract || store.isAutoPlaying">
              <i class="fa-solid fa-forward-step"></i> 执行一步 Diff
            </button>
            <button class="act-btn reset" @click="store.reset()" :disabled="store.isAutoPlaying">
              <i class="fa-solid fa-rotate-left"></i> 重置
            </button>
          </div>
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
import { useChapter8Store } from '@/stores/chapter8'
import { sourceCode } from './data'
const store = useChapter8Store()
const codeRef = ref(null)
const kw = ['let','const','var','function','return','if','else','for','while','new','true','false','undefined']
const types = ['VNode','Array']
const fns = ['patch','patchChildren','patchElement','insert','mountElement','unmount','findIndex']
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
const matchType = computed(() => {
  if (store.currentStep < 2) return null
  const os = store.oldChildren[store.oldStartIdx]
  const oe = store.oldChildren[store.oldEndIdx]
  const ns = store.newChildren[store.newStartIdx]
  const ne = store.newChildren[store.newEndIdx]
  if (os === ns) return '头-头'
  if (oe === ne) return '尾-尾'
  if (os === ne) return '头-尾'
  if (oe === ns) return '尾-头'
  return '查找'
})
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
/* Diff 双端可视化 */
.diff-visual { display: flex; flex-direction: column; gap: 10px; }
.node-list { display: flex; flex-direction: column; gap: 6px; }
.list-label { font-size: 0.68rem; font-weight: 600; color: var(--muted); }
.list-row { display: flex; gap: 6px; }
.node-cell {
  width: 52px; height: 44px; border-radius: 8px; border: 1px solid var(--border);
  background: rgba(7,11,9,0.6); display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 2px; transition: all 0.3s; position: relative;
}
.node-cell.active { border-color: rgba(16,185,129,0.3); }
.node-cell.start { border-color: rgba(96,165,250,0.6); background: rgba(96,165,250,0.06); }
.node-cell.end { border-color: rgba(245,158,11,0.6); background: rgba(245,158,11,0.06); }
.node-cell.removed { opacity: 0.25; }
.cell-key { font-family: var(--font-mono); font-size: 0.82rem; font-weight: 700; color: var(--fg); }
.cell-idx { font-family: var(--font-mono); font-size: 0.5rem; color: var(--muted); position: absolute; top: 2px; right: 4px; }
.connect-area { display: flex; align-items: center; justify-content: center; padding: 4px 0; position: relative; }
.connect-line { width: 2px; height: 16px; background: var(--border); margin: 0 auto; }
.match-badge {
  position: absolute; right: 0; font-family: var(--font-mono); font-size: 0.6rem;
  background: rgba(139,92,246,0.12); color: #8b5cf6; padding: 2px 8px; border-radius: 4px;
  border: 1px solid rgba(139,92,246,0.3);
}
/* 操作记录 */
.ops-area { max-height: 180px; overflow-y: auto; }
.ops-list { display: flex; flex-direction: column; gap: 6px; }
.op-item {
  display: flex; align-items: center; gap: 8px; padding: 8px 10px;
  background: rgba(7,11,9,0.6); border-radius: 6px; border-left: 3px solid var(--border);
  font-size: 0.68rem; transition: all 0.3s;
}
.op-item.update { border-left-color: var(--accent); }
.op-item.move { border-left-color: #f59e0b; }
.op-item.add { border-left-color: #60a5fa; }
.op-item.remove { border-left-color: var(--crimson); }
.op-icon { width: 16px; text-align: center; }
.op-item.update .op-icon { color: var(--accent); }
.op-item.move .op-icon { color: #f59e0b; }
.op-item.add .op-icon { color: #60a5fa; }
.op-item.remove .op-icon { color: var(--crimson); }
.op-nodes { font-family: var(--font-mono); font-weight: 700; min-width: 24px; }
.op-msg { color: var(--muted); flex: 1; }
.ops-empty { text-align: center; padding: 16px; font-size: 0.68rem; color: rgba(94,138,118,0.3); }
/* LIS 展示 */
.lis-card { border-color: rgba(139,92,246,0.3); }
.lis-demo { display: flex; flex-direction: column; gap: 8px; }
.lis-row { display: flex; align-items: center; gap: 10px; }
.lis-label { font-family: var(--font-mono); font-size: 0.65rem; color: var(--muted); width: 48px; text-align: right; }
.lis-cells { display: flex; gap: 6px; }
.lis-cell {
  width: 36px; height: 30px; border-radius: 6px; border: 1px solid var(--border);
  background: rgba(7,11,9,0.6); display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono); font-size: 0.72rem; font-weight: 600; transition: all 0.3s;
}
.lis-cell.inlis { border-color: rgba(16,185,129,0.4); color: var(--accent); }
.lis-cell.highlight { border-color: rgba(139,92,246,0.5); background: rgba(139,92,246,0.08); color: #8b5cf6; }
.lis-cell.ghost { border-color: transparent; background: transparent; }
.lis-conclusion {
  margin-top: 6px; background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.2);
  border-radius: 6px; padding: 8px 10px; font-size: 0.65rem; color: #8b5cf6;
  display: flex; align-items: center; gap: 6px;
}
/* 操作区 */
.action { padding: 14px 18px; }
.btn-group { display: grid; grid-template-columns: 1fr auto; gap: 8px; }
.act-btn {
  padding: 10px; border-radius: var(--radius-sm); border: none; font-weight: 700;
  font-size: 0.78rem; cursor: pointer; display: flex; align-items: center;
  justify-content: center; gap: 6px; transition: all 0.3s; font-family: var(--font-sans); color: white;
}
.act-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.act-btn.step { background: linear-gradient(135deg, #059669, #10b981); box-shadow: 0 2px 12px rgba(16,185,129,0.2); }
.act-btn.step:hover:not(:disabled) { box-shadow: 0 4px 20px rgba(16,185,129,0.35); transform: translateY(-1px); }
.act-btn.reset { background: rgba(94,138,118,0.15); color: var(--muted); width: 48px; }
.act-btn.reset:hover:not(:disabled) { background: rgba(94,138,118,0.25); }
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
</style>
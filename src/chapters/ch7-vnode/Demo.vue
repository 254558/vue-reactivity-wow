<template>
  <div class="demo-layout">
    <div class="main-grid">
      <!-- 左栏：代码 + 说明 -->
      <div class="left-col">
        <!-- ✅ 替换为公共代码组件 -->
        <CodePanel :sourceCode="sourceCode" :activeLines="store.activeLines" filename="vnode.js" />
        <!-- ✅ 替换为公共说明组件 -->
        <StepDesc :step="store.currentStepData" />
      </div>
      <!-- 右栏：可视化 (完全保持原样) -->
      <div class="right-col">
        <!-- 性能对比 (步骤1/2) -->
        <div class="viz-card">
          <div class="viz-head"><i class="fa-solid fa-gauge-high"></i><h4>性能对比：属性数量</h4></div>
          <div class="perf-compare">
            <div class="perf-item dom">
              <div class="perf-label">真实 DOM</div>
              <div class="perf-bar-bg">
                <Transition name="bar">
                  <div class="perf-bar dom-bar" :style="{ width: (store.domProperties / 268 * 100) + '%' }"></div>
                </Transition>
              </div>
              <div class="perf-count">{{ store.domProperties }} 个属性</div>
            </div>
            <div class="perf-item vnode">
              <div class="perf-label">VNode</div>
              <div class="perf-bar-bg">
                <div class="perf-bar vnode-bar" :style="{ width: (4 / 268 * 100) + '%' }"></div>
              </div>
              <div class="perf-count">4 个属性</div>
            </div>
          </div>
          <div class="perf-ratio">
            VNode 比 DOM 轻量 <strong>{{ store.domProperties > 0 ? Math.round(store.domProperties / 4) : '...' }}</strong> 倍
          </div>
        </div>
        <!-- VNode 树可视化 -->
        <div class="viz-card">
          <div class="viz-head"><i class="fa-solid fa-code-branch"></i><h4>VNode 树结构</h4></div>
          <div class="vnode-tree">
            <!-- 根节点 div -->
            <div class="vnode-node root" :class="{ 
              highlight: store.mountPhase === 'create',
              mounted: ['props','children','cache','append','idle'].includes(store.mountPhase) && store.isMounting || (!store.isMounting && store.triggerLogs.length > 0)
            }">
              <div class="node-header">
                <span class="node-tag">&lt;div&gt;</span>
                <span class="node-props" :class="{ flash: store.mountPhase === 'props' }">id="app"</span>
                <span class="node-el" v-if="['cache','append','idle'].includes(store.mountPhase) && (store.isMounting || store.triggerLogs.length)">el: HTMLDivElement</span>
              </div>
              <!-- 子节点 -->
              <div class="node-children" :class="{ highlight: store.mountPhase === 'children' }">
                <!-- p 标签 -->
                <div class="vnode-node child">
                  <div class="node-header">
                    <span class="node-tag">&lt;p&gt;</span>
                    <span class="node-text">"Hello"</span>
                  </div>
                </div>
                <!-- span 标签 -->
                <div class="vnode-node child">
                  <div class="node-header">
                    <span class="node-tag">&lt;span&gt;</span>
                    <span class="node-props">class="highlight"</span>
                    <span class="node-text">"Vue"</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 渲染过程 -->
        <div class="viz-card" :class="{ active: store.isMounting }">
          <div class="viz-head"><i class="fa-solid fa-play"></i><h4>渲染流程</h4></div>
          <div class="mount-flow">
            <div class="flow-step" :class="{ active: store.mountPhase === 'create', done: ['props','children','cache','append'].includes(store.mountPhase) }">
              <div class="step-dot"></div>
              <span>createElement</span>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-step" :class="{ active: store.mountPhase === 'props', done: ['children','cache','append'].includes(store.mountPhase) }">
              <div class="step-dot"></div>
              <span>setAttribute</span>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-step" :class="{ active: store.mountPhase === 'children', done: ['cache','append'].includes(store.mountPhase) }">
              <div class="step-dot"></div>
              <span>递归 children</span>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-step" :class="{ active: store.mountPhase === 'cache', done: ['append'].includes(store.mountPhase) }">
              <div class="step-dot"></div>
              <span>缓存 el</span>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-step" :class="{ active: store.mountPhase === 'append', done: !store.isMounting && store.triggerLogs.length > 0 }">
              <div class="step-dot"></div>
              <span>appendChild</span>
            </div>
          </div>
        </div>
        <!-- 操作区 -->
        <div class="viz-card action">
          <button class="act-btn" :class="{ pulse: store.canInteract }" @click="store.simulateMount()" :disabled="!store.canInteract || store.isMounting">
            <i class="fa-solid fa-rocket"></i> 执行 mountElement(vnode, container)
          </button>
          <div v-if="store.triggerLogs.length" class="logs">
            <div class="logs-head"><i class="fa-solid fa-clock-rotate-left"></i> 渲染日志</div>
            <TransitionGroup name="fade" tag="div" class="logs-list">
              <div v-for="(log, i) in store.triggerLogs" :key="log.time + i" class="log-item">
                <span class="l-type" :class="getLogClass(log.type)">{{ log.type }}</span>
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
import { watch } from 'vue' // ✅ 删除了不再需要的 computed, ref, nextTick
import { useChapter7Store } from '@/stores/chapter7'
import { sourceCode } from './data'
// ✅ 引入公共组件
import CodePanel from '@/components/CodePanel.vue'
import StepDesc from '@/components/StepDesc.vue'
const store = useChapter7Store()
// ❌ 删除了原本的 kw, types 数组和 highlight 函数
// ❌ 删除了原本的 highlightedLines 计算属性
// ❌ 删除了原本的 codeRef 和 watch 滚动监听
// ✅ 保留该章节特有的逻辑
// 步骤1时自动触发DOM属性计数
watch(() => store.currentStep, (val) => {
  if (val === 1) store.simulateDOMCount()
})
function getLogClass(type) {
  if (['create','props','children','cache','append'].includes(type)) return 'mount'
  return 'done'
}
</script>
<style scoped>
.demo-layout { display: flex; flex-direction: column; gap: 1rem; }
.main-grid { display: grid; grid-template-columns: 1fr 380px; gap: 1.25rem; }
.left-col, .right-col { display: flex; flex-direction: column; gap: 1rem; }
/* ❌ 删除了所有关于 .code-panel, .code-header, .code-body, .code-line, .line-no 的样式 */
/* ❌ 删除了所有关于 .step-desc, .desc-head, .desc-badge, .desc-text, .desc-detail 的样式 */
/* ✅ 保留右侧可视化面板的样式 */
.viz-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px; transition: all 0.3s; }
.viz-card.active { border-color: rgba(16,185,129,0.4); }
.viz-head { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
.viz-head i { color: var(--accent); font-size: 0.7rem; }
.viz-head h4 { font-size: 0.82rem; font-weight: 700; }
/* 性能对比 */
.perf-compare { display: flex; flex-direction: column; gap: 12px; }
.perf-item { display: flex; flex-direction: column; gap: 4px; }
.perf-label { font-size: 0.68rem; font-weight: 600; color: var(--muted); }
.perf-bar-bg { height: 24px; background: rgba(7,11,9,0.6); border-radius: 6px; overflow: hidden; }
.perf-bar { height: 100%; border-radius: 6px; transition: width 0.5s ease; min-width: 2px; }
.dom-bar { background: linear-gradient(90deg, #b91c1c, #ef4444); }
.vnode-bar { background: linear-gradient(90deg, #059669, #10b981); }
.perf-count { font-family: var(--font-mono); font-size: 0.65rem; color: var(--muted); text-align: right; }
.perf-ratio { margin-top: 8px; font-size: 0.72rem; color: var(--muted); text-align: center; background: rgba(7,11,9,0.6); padding: 6px 10px; border-radius: 6px; }
.perf-ratio strong { color: var(--accent); font-size: 0.9rem; }
/* VNode 树 */
.vnode-tree { display: flex; flex-direction: column; }
.vnode-node {
  border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 8px 10px;
  background: rgba(7,11,9,0.4); transition: all 0.35s;
}
.vnode-node.root { border-width: 2px; }
.vnode-node.highlight { border-color: rgba(96,165,250,0.6); background: rgba(96,165,250,0.06); box-shadow: 0 0 12px rgba(96,165,250,0.15); }
.vnode-node.mounted { border-color: rgba(16,185,129,0.5); background: rgba(16,185,129,0.04); }
.node-header { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.node-tag { font-family: var(--font-mono); font-size: 0.72rem; font-weight: 700; color: var(--accent); }
.node-props { font-family: var(--font-mono); font-size: 0.6rem; color: var(--amber); background: rgba(245,158,11,0.1); padding: 1px 6px; border-radius: 3px; transition: all 0.3s; }
.node-props.flash { background: rgba(245,158,11,0.25); box-shadow: 0 0 8px rgba(245,158,11,0.2); }
.node-text { font-family: var(--font-mono); font-size: 0.6rem; color: var(--crimson); }
.node-el { font-family: var(--font-mono); font-size: 0.55rem; color: rgba(96,165,250,0.7); background: rgba(96,165,250,0.08); padding: 1px 6px; border-radius: 3px; margin-left: auto; }
.node-children {
  margin-top: 6px; padding-left: 16px; display: flex; flex-direction: column; gap: 4px;
  border-left: 2px solid var(--border); transition: all 0.3s;
}
.node-children.highlight { border-left-color: rgba(16,185,129,0.5); }
.vnode-node.child { padding: 6px 8px; border-width: 1px; }
/* 渲染流程 */
.mount-flow { display: flex; align-items: center; gap: 4px; overflow-x: auto; padding-bottom: 4px; }
.flow-step {
  display: flex; align-items: center; gap: 4px; padding: 6px 10px;
  background: rgba(7,11,9,0.6); border-radius: 6px; border: 1px solid var(--border);
  font-family: var(--font-mono); font-size: 0.6rem; color: var(--muted); white-space: nowrap; transition: all 0.3s;
}
.flow-step.active { border-color: rgba(16,185,129,0.5); color: var(--accent); background: rgba(16,185,129,0.06); }
.flow-step.done { border-color: rgba(16,185,129,0.3); color: rgba(16,185,129,0.7); }
.step-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--muted); transition: all 0.3s; }
.flow-step.active .step-dot { background: var(--accent); box-shadow: 0 0 4px rgba(16,185,129,0.4); }
.flow-step.done .step-dot { background: rgba(16,185,129,0.7); }
.flow-arrow { color: rgba(94,138,118,0.3); font-size: 0.6rem; flex-shrink: 0; }
/* 操作区 */
.action { display: flex; flex-direction: column; gap: 10px; }
.act-btn {
  width: 100%; padding: 10px; border-radius: var(--radius-sm); border: none; font-weight: 700;
  font-size: 0.78rem; cursor: pointer; display: flex; align-items: center;
  justify-content: center; gap: 6px; transition: all 0.3s; font-family: var(--font-sans); color: white;
  background: linear-gradient(135deg, #059669, #10b981); box-shadow: 0 2px 12px rgba(16,185,129,0.2);
}
.act-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.act-btn:hover:not(:disabled) { box-shadow: 0 4px 20px rgba(16,185,129,0.35); transform: translateY(-1px); }
.act-btn.pulse { animation: pulse-ring 2s ease-in-out infinite; }
.logs-head { font-size: 0.68rem; font-weight: 600; color: var(--muted); display: flex; align-items: center; gap: 4px; margin-bottom: 4px; }
.logs-list { display: flex; flex-direction: column; gap: 3px; max-height: 120px; overflow-y: auto; }
.log-item { background: rgba(7,11,9,0.6); border-radius: 5px; padding: 5px 8px; font-family: var(--font-mono); font-size: 0.6rem; display: flex; align-items: center; gap: 5px; }
.l-type { padding: 1px 4px; border-radius: 3px; font-weight: 600; white-space: nowrap; font-size: 0.55rem; }
.l-type.mount { background: rgba(96,165,250,0.1); color: #60a5fa; }
.l-type.done { background: var(--accent-dim); color: var(--accent); }
.l-detail { color: var(--muted); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.l-time { color: rgba(94,138,118,0.3); font-size: 0.5rem; white-space: nowrap; }
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
</style>
<template>
  <DemoLayout
    :sourceCode="sourceCode"
    :activeLines="store.activeLines"
    filename="vnode.js"
    :steps="store.steps"
    :currentStep="store.currentStep"
    :totalSteps="store.totalSteps"
    :currentStepData="store.currentStepData"
    @prev="store.prevStep()"
    @next="store.nextStep()"
    @goTo="store.goToStep($event)"
  >
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
            <div class="perf-bar vnode-bar" :style="{ width: (store.vnodeProperties / 268 * 100) + '%' }"></div>
          </div>
          <div class="perf-count">{{ store.vnodeProperties }} 个属性</div>
        </div>
      </div>
      <div class="perf-ratio" v-if="store.domProperties > 0 && store.vnodeProperties > 0">
        VNode 比 DOM 轻量 <strong>{{ Math.round(store.domProperties / store.vnodeProperties) }}</strong> 倍
      </div>
      <div class="perf-ratio" v-else>
        VNode 比 DOM 轻量 <strong>...</strong> 倍
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
  </DemoLayout>
</template>
<script setup>
import { watch } from 'vue'
import { useChapter7Store } from '@/stores/chapter7'
import { sourceCode } from './data'
import DemoLayout from '@/components/DemoLayout.vue'

const store = useChapter7Store()

// 步骤1时自动触发DOM属性计数
watch(() => store.currentStep, (val) => {
  if (val === 1) {
    store.simulateDOMCount()
    store.simulateVNodeCreate()
  }
}, { immediate: true })

function getLogClass(type) {
  if (['create','props','children','cache','append'].includes(type)) return 'mount'
  return 'done'
}
</script>
<style scoped>
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
/* 章节特有日志类型 */
.l-type.mount { background: rgba(96,165,250,0.1); color: #60a5fa; }
.l-type.done { background: var(--accent-dim); color: var(--accent); }
</style>

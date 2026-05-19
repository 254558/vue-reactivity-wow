<template>
  <div class="demo-layout">
    <div class="main-grid">
      <!-- 左栏：代码 + 说明 -->
      <div class="left-col">
        <!-- ✅ 替换为公共代码组件 -->
        <CodePanel :sourceCode="sourceCode" :activeLines="store.activeLines" filename="watch.js" />
        <!-- ✅ 替换为公共说明组件 -->
        <StepDesc :step="store.currentStepData" />
      </div>
      <!-- 右栏：可视化 (完全保持原样) -->
      <div class="right-col">
        <!-- 响应式数据结构 -->
        <div class="viz-card">
          <div class="viz-head"><i class="fa-solid fa-sitemap"></i><h4>响应式数据结构</h4></div>
          <div class="data-tree">
            <div class="tree-node root">
              <div class="node-dot"></div>
              <span class="node-key">state</span>
              <div class="tree-children">
                <div class="tree-node leaf" :class="{ active: store.canInteract }">
                  <div class="node-dot amber"></div>
                  <span class="node-key">count</span>
                  <span class="node-colon">:</span>
                  <Transition name="fade" mode="out-in">
                    <span class="node-val" :key="store.count">{{ store.count }}</span>
                  </Transition>
                </div>
                <div class="tree-node branch" :class="{ active: hl.traverse }">
                  <div class="node-dot" :class="{ blue: hl.traverse }"></div>
                  <span class="node-key">nested</span>
                  <div class="tree-children">
                    <div class="tree-node leaf" :class="{ active: store.canInteract }">
                      <div class="node-dot amber"></div>
                      <span class="node-key">num</span>
                      <span class="node-colon">:</span>
                      <Transition name="fade" mode="out-in">
                        <span class="node-val" :key="store.nestedNum">{{ store.nestedNum }}</span>
                      </Transition>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Watch 执行流程 -->
        <div class="viz-card">
          <div class="viz-head"><i class="fa-solid fa-eye"></i><h4>Watch 执行流程</h4></div>
          <div class="flow">
            <!-- Getter / Traverse -->
            <div class="flow-node" :class="{ hl: hl.source || hl.traverse, computing: store.isTraversing }">
              <div class="flow-dot"></div>
              <span class="flow-label">{{ hl.traverse ? 'traverse(source)' : 'getter()' }}</span>
              <div class="flow-desc" v-if="hl.traverse">递归访问所有子属性，建立深层依赖</div>
              <div class="flow-desc" v-else>获取侦听数据源的值</div>
              <!-- 递归动画 -->
              <div v-if="store.isTraversing" class="traverse-anim">
                <div class="depth-line" :class="{ active: store.traverseDepth >= 1 }">
                  <span class="depth-label">L1: state</span>
                </div>
                <div class="depth-line" :class="{ active: store.traverseDepth >= 2 }">
                  <span class="depth-label">L2: .nested</span>
                </div>
                <div class="depth-line" :class="{ active: store.traverseDepth >= 3 }">
                  <span class="depth-label">L3: .num</span>
                </div>
              </div>
            </div>
            <div class="flow-conn"></div>
            <!-- 保存旧值 -->
            <div class="flow-node cache" :class="{ hl: hl.job || store.oldValue !== null }">
              <div class="flow-dot"></div>
              <span class="flow-label">旧值 (oldValue)</span>
              <span class="flow-val">{{ store.oldValue !== null ? store.oldValue : 'undefined' }}</span>
            </div>
            <div class="flow-conn" :class="{ active: store.isCallbackFiring }"></div>
            <!-- 调度器 Job -->
            <div class="flow-node job" :class="{ hl: hl.job, firing: store.isCallbackFiring }">
              <div class="flow-dot"></div>
              <span class="flow-label">scheduler (job)</span>
              <div class="flow-desc">获取新值，对比新旧值</div>
              <div v-if="store.newValue !== null" class="compare-box">
                <span class="cmp-old">{{ store.oldValue }}</span>
                <span class="cmp-arrow">!==</span>
                <span class="cmp-new">{{ store.newValue }}</span>
              </div>
            </div>
            <div class="flow-conn" :class="{ active: store.isCallbackFiring }"></div>
            <!-- 回调 -->
            <div class="flow-node cb" :class="{ hl: hl.callback, firing: store.isCallbackFiring }">
              <div class="flow-dot"></div>
              <span class="flow-label">callback(newVal, oldVal)</span>
              <div class="flow-desc">执行用户传入的侦听回调</div>
            </div>
          </div>
        </div>
        <!-- 操作区 -->
        <div class="viz-card action">
          <div class="action-label">交互模拟 (步骤 6 解锁)</div>
          <div class="btn-group">
            <button class="act-btn count-btn" @click="store.simulateChangeCount()" :disabled="!store.canInteract || store.isCallbackFiring">
              <i class="fa-solid fa-plus"></i> state.count++
            </button>
            <button class="act-btn nested-btn" @click="store.simulateChangeNested()" :disabled="!store.canInteract || store.isCallbackFiring">
              <i class="fa-solid fa-plus"></i> nested.num++
            </button>
          </div>
          <div v-if="store.triggerLogs.length" class="logs">
            <div class="logs-head"><i class="fa-solid fa-clock-rotate-left"></i> 执行日志</div>
            <TransitionGroup name="fade" tag="div" class="logs-list">
              <div v-for="(log, i) in store.triggerLogs" :key="log.time + i" class="log-item">
                <span class="l-type" :class="{ init: log.type.includes('初始'), deep: log.type.includes('深层'), cb: log.type.includes('回调') }">{{ log.type }}</span>
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
      <button class="ctrl-btn primary" @click="handleNext" :disabled="store.currentStep >= store.totalSteps">
        <template v-if="store.currentStep < store.totalSteps">下一步 <i class="fa-solid fa-chevron-right"></i></template>
        <template v-else>完成 <i class="fa-solid fa-check"></i></template>
      </button>
    </div>
  </div>
</template>
<script setup>
import { computed, watch } from 'vue' // ✅ 删除了不再需要的 ref, nextTick
import { useChapter4Store } from '@/stores/chapter4'
import { sourceCode } from './data'
// ✅ 引入公共组件
import CodePanel from '@/components/CodePanel.vue'
import StepDesc from '@/components/StepDesc.vue'
const store = useChapter4Store()
// ❌ 删除了原本的 kw, types 数组和 highlight 函数
// ❌ 删除了原本的 highlightedLines 计算属性
// ❌ 删除了原本的 codeRef 和 watch 滚动监听
// ✅ 保留该章节特有的计算属性和交互逻辑
const hl = computed(() => store.currentStepData?.highlight || {})
// 步骤3时自动演示 traverse
watch(() => store.currentStep, (val) => {
  if (val === 3) store.simulateTraverse()
})
function handleNext() {
  store.nextStep()
}
</script>
<style scoped>
.demo-layout { display: flex; flex-direction: column; gap: 1rem; }
.main-grid { display: grid; grid-template-columns: 1fr 380px; gap: 1.25rem; }
.left-col, .right-col { display: flex; flex-direction: column; gap: 1rem; }
/* ❌ 删除了所有关于 .code-panel, .code-header, .code-body, .code-line, .line-no 的样式 */
/* ❌ 删除了所有关于 .step-desc, .desc-head, .desc-badge, .desc-text, .desc-detail 的样式 */
/* ✅ 保留右侧可视化面板的样式 */
.viz-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px; }
.viz-head { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
.viz-head i { color: var(--accent); font-size: 0.7rem; }
.viz-head h4 { font-size: 0.82rem; font-weight: 700; }
/* 数据结构树 */
.data-tree { font-family: var(--font-mono); font-size: 0.72rem; }
.tree-node { display: flex; align-items: baseline; gap: 4px; padding: 2px 0; transition: all 0.3s; }
.tree-node.leaf.active .node-val { color: var(--accent); font-weight: 700; }
.tree-node.branch.active .node-key { color: #60a5fa; }
.node-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(94,138,118,0.3); flex-shrink: 0; margin-top: 5px; }
.node-dot.amber { background: var(--amber); }
.node-dot.blue { background: #60a5fa; box-shadow: 0 0 6px rgba(96,165,250,0.4); }
.node-key { color: var(--muted); }
.node-colon { color: rgba(94,138,118,0.4); }
.node-val { color: var(--crimson); font-weight: 600; transition: all 0.3s; }
.tree-children { padding-left: 20px; display: flex; flex-direction: column; }
/* 执行流程 */
.flow { display: flex; flex-direction: column; gap: 0; }
.flow-node {
  border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 12px;
  background: rgba(7,11,9,0.4); transition: all 0.35s; display: flex; flex-wrap: wrap;
  align-items: center; gap: 6px; position: relative;
}
.flow-node.hl { border-color: rgba(16,185,129,0.4); background: rgba(16,185,129,0.04); }
.flow-node.computing { border-color: rgba(96,165,250,0.6); background: rgba(96,165,250,0.06); }
.flow-node.job.firing { border-color: rgba(245,158,11,0.6); background: rgba(245,158,11,0.06); animation: node-flash-amber 0.6s ease-out; }
.flow-node.cb.firing { border-color: rgba(16,185,129,0.6); background: rgba(16,185,129,0.08); animation: node-flash 0.6s ease-out; }
.flow-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(94,138,118,0.3); }
.flow-node.hl .flow-dot { background: var(--accent); box-shadow: 0 0 4px rgba(16,185,129,0.4); }
.flow-label { font-family: var(--font-mono); font-size: 0.7rem; font-weight: 600; color: var(--muted); }
.flow-node.hl .flow-label { color: var(--fg); }
.flow-desc { width: 100%; font-size: 0.62rem; color: var(--muted); padding-left: 12px; margin-top: 2px; }
.flow-val { margin-left: auto; font-family: var(--font-mono); font-size: 0.85rem; font-weight: 700; color: var(--accent); }
.flow-conn { display: flex; justify-content: center; padding: 3px 0; }
.flow-conn::after { content: ''; width: 2px; height: 12px; border-radius: 1px; background: var(--border); transition: background 0.4s; }
.flow-conn.active::after { background: var(--accent); }
/* Traverse 动画 */
.traverse-anim { width: 100%; padding-left: 12px; margin-top: 6px; display: flex; flex-direction: column; gap: 3px; }
.depth-line { padding: 2px 6px; border-left: 2px solid var(--border); font-size: 0.6rem; color: rgba(94,138,118,0.3); transition: all 0.3s; }
.depth-line.active { border-left-color: #60a5fa; color: #60a5fa; background: rgba(96,165,250,0.06); }
.depth-label { font-family: var(--font-mono); }
/* 新旧值对比 */
.compare-box {
  width: 100%; margin-top: 6px; padding: 6px 8px; background: rgba(7,11,9,0.6);
  border-radius: 4px; display: flex; align-items: center; justify-content: center; gap: 8px;
  font-family: var(--font-mono); font-size: 0.75rem;
}
.cmp-old { color: var(--muted); text-decoration: line-through; }
.cmp-arrow { color: var(--crimson); font-weight: 700; font-size: 0.65rem; }
.cmp-new { color: var(--accent); font-weight: 700; }
/* 操作区 */
.action { display: flex; flex-direction: column; gap: 10px; }
.action-label { font-size: 0.68rem; color: var(--muted); }
.btn-group { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.act-btn {
  padding: 10px; border-radius: var(--radius-sm); border: none; font-weight: 700;
  font-size: 0.75rem; cursor: pointer; display: flex; align-items: center;
  justify-content: center; gap: 6px; transition: all 0.3s; font-family: var(--font-sans);
}
.act-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.count-btn { background: linear-gradient(135deg, #b45309, #f59e0b); color: white; box-shadow: 0 2px 10px rgba(245,158,11,0.2); }
.count-btn:hover:not(:disabled) { box-shadow: 0 4px 18px rgba(245,158,11,0.35); transform: translateY(-1px); }
.nested-btn { background: linear-gradient(135deg, #1d4ed8, #3b82f6); color: white; box-shadow: 0 2px 10px rgba(59,130,246,0.2); }
.nested-btn:hover:not(:disabled) { box-shadow: 0 4px 18px rgba(59,130,246,0.35); transform: translateY(-1px); }
.logs-head { font-size: 0.68rem; font-weight: 600; color: var(--muted); display: flex; align-items: center; gap: 4px; margin-bottom: 4px; }
.logs-list { display: flex; flex-direction: column; gap: 3px; max-height: 130px; overflow-y: auto; }
.log-item { background: rgba(7,11,9,0.6); border-radius: 5px; padding: 5px 8px; font-family: var(--font-mono); font-size: 0.62rem; display: flex; align-items: center; gap: 5px; }
.l-type { padding: 1px 5px; border-radius: 3px; font-weight: 600; white-space: nowrap; }
.l-type.init { background: rgba(245,158,11,0.1); color: var(--amber); }
.l-type.deep { background: rgba(96,165,250,0.1); color: #60a5fa; }
.l-type.cb { background: rgba(16,185,129,0.1); color: var(--accent); }
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
@keyframes node-flash { 0%{box-shadow:0 0 0 0 rgba(16,185,129,0.5)}50%{box-shadow:0 0 24px 6px rgba(16,185,129,0.2)}100%{box-shadow:0 0 0 0 rgba(16,185,129,0)} }
@keyframes node-flash-amber { 0%{box-shadow:0 0 0 0 rgba(245,158,11,0.5)}50%{box-shadow:0 0 24px 6px rgba(245,158,11,0.2)}100%{box-shadow:0 0 0 0 rgba(245,158,11,0)} }
@keyframes pulse-ring { 0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,0.3)}50%{box-shadow:0 0 16px 4px rgba(16,185,129,0.12)} }
@media (max-width: 1024px) { .main-grid { grid-template-columns: 1fr; } .step-tabs { display: none; } }
</style>
<template>
  <DemoLayout
    :sourceCode="sourceCode"
    :activeLines="store.activeLines"
    filename="watch.js"
    :steps="store.steps"
    :currentStep="store.currentStep"
    :totalSteps="store.totalSteps"
    :currentStepData="store.currentStepData"
    @prev="store.prevStep()"
    @next="handleNext"
    @goTo="store.goToStep($event)"
  >
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
  </DemoLayout>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useChapter4Store } from '@/stores/chapter4'
import { sourceCode } from './data'
import DemoLayout from '@/components/DemoLayout.vue'

const store = useChapter4Store()
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
/* 操作区 - 章节特有按钮 */
.count-btn { background: linear-gradient(135deg, #b45309, #f59e0b); color: white; box-shadow: 0 2px 10px rgba(245,158,11,0.2); }
.count-btn:hover:not(:disabled) { box-shadow: 0 4px 18px rgba(245,158,11,0.35); transform: translateY(-1px); }
.nested-btn { background: linear-gradient(135deg, #1d4ed8, #3b82f6); color: white; box-shadow: 0 2px 10px rgba(59,130,246,0.2); }
.nested-btn:hover:not(:disabled) { box-shadow: 0 4px 18px rgba(59,130,246,0.35); transform: translateY(-1px); }
/* 日志 - 章节特有类型标签 */
.l-type.init { background: rgba(245,158,11,0.1); color: var(--amber); }
.l-type.deep { background: rgba(96,165,250,0.1); color: #60a5fa; }
.l-type.cb { background: rgba(16,185,129,0.1); color: var(--accent); }
</style>

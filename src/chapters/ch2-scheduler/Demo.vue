<template>
  <div class="demo-layout">
    <div class="main-grid">
      <!-- 左栏：代码 + 说明 -->
      <div class="left-col">
        <!-- ✅ 替换为公共代码组件，传入源码、高亮行和文件名 -->
        <CodePanel :sourceCode="sourceCode" :activeLines="store.activeLines" filename="scheduler.js" />
        <!-- ✅ 替换为公共说明组件，传入当前步骤数据 -->
        <StepDesc :step="store.currentStepData" />
      </div>
      <!-- 右栏：可视化 (完全保持原样) -->
      <div class="right-col">
        <!-- 数据状态 -->
        <div class="viz-card">
          <div class="viz-head"><i class="fa-solid fa-database"></i><h4>响应式数据</h4></div>
          <div class="data-box">
            <div class="d-kw">const state = reactive({</div>
            <div class="d-prop">
              <span class="d-key">count</span><span class="d-colon">:</span>
              <Transition name="fade" mode="out-in">
                <span class="d-val" :key="store.dataValue">{{ store.dataValue }}</span>
              </Transition>
            </div>
            <div class="d-kw">})</div>
          </div>
        </div>
        <!-- 调度流程图 -->
        <div class="viz-card">
          <div class="viz-head"><i class="fa-solid fa-diagram-project"></i><h4>调度流程图</h4></div>
          <div class="graph">
            <!-- trigger -->
            <div class="g-node" :class="{ hl: hl.trigger }">
              <div class="g-dot" :class="{ on: hl.trigger }"></div>
              <span class="g-label">trigger()</span>
              <div class="g-detail">数据变化，准备执行副作用</div>
            </div>
            <div class="g-conn" :class="{ active: hl.trigger }"></div>
            <!-- 判断 -->
            <div class="g-node diamond" :class="{ hl: hl.scheduler }">
              <div class="g-dot" :class="{ on: hl.scheduler }"></div>
              <span class="g-label">是否有 scheduler?</span>
            </div>
            <!-- 分支 -->
            <div class="g-branches">
              <div class="g-branch no" :class="{ active: hl.scheduler }">
                <div class="branch-label">No</div>
                <div class="g-conn-v"></div>
                <div class="g-node small" :class="{ hl: !hl.scheduler && hl.trigger }">
                  <span class="g-label">同步执行 fn()</span>
                  <div class="g-detail bad">连续修改 3 次 → 执行 3 次</div>
                </div>
              </div>
              <div class="g-branch yes" :class="{ active: hl.scheduler }">
                <div class="branch-label">Yes</div>
                <div class="g-conn-v"></div>
                <div class="g-node small queue-node" :class="{ hl: hl.queue }">
                  <span class="g-label">scheduler(fn)</span>
                  <div class="queue-box">
                    <div class="queue-label">JobQueue (Set)</div>
                    <div class="queue-visual">
                      <div class="queue-slot" :class="{ filled: store.queueSize >= 1, flushing: store.isFlushing }">
                        {{ store.queueSize >= 1 ? 'effectFn' : '' }}
                      </div>
                    </div>
                    <div class="queue-meta">去重：相同函数只入队一次</div>
                  </div>
                  <div class="g-conn-h"></div>
                  <div class="g-node small flush-node" :class="{ hl: store.isFlushing }">
                    <span class="g-label">Promise.then (微任务)</span>
                    <div class="g-detail good">异步批量执行 → 只渲染 1 次</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 执行对比 -->
        <div class="viz-card">
          <div class="viz-head"><i class="fa-solid fa-code-compare"></i><h4>执行次数对比</h4></div>
          <div class="compare-grid">
            <div class="compare-item bad">
              <div class="compare-label">无调度器</div>
              <div class="compare-val">{{ store.syncCount }} 次</div>
            </div>
            <div class="compare-item good">
              <div class="compare-label">有调度器</div>
              <div class="compare-val">{{ store.asyncCount }} 次</div>
            </div>
          </div>
        </div>
        <!-- 操作区 -->
        <div class="viz-card action">
          <button class="inc-btn" :class="{ pulse: store.canIncrement }" @click="store.simulateIncrement()" :disabled="!store.canIncrement || store.isFlushing">
            <i class="fa-solid fa-layer-group"></i> 连续执行 state.count++ (3次)
          </button>
          <div v-if="store.triggerLogs.length" class="logs">
            <div class="logs-head"><i class="fa-solid fa-clock-rotate-left"></i> 执行日志</div>
            <TransitionGroup name="fade" tag="div" class="logs-list">
              <div v-for="(log, i) in store.triggerLogs" :key="log.time + i" class="log-item">
                <span class="l-idx">#{{ store.triggerLogs.length - i }}</span>
                <span class="l-bad">同步{{ log.sync }}次</span>
                <span class="l-arrow">vs</span>
                <span class="l-good">调度{{ log.async }}次</span>
                <span class="l-val">= {{ log.value }}</span>
                <span class="l-time">{{ log.time }}</span>
              </div>
            </TransitionGroup>
          </div>
          <div v-else class="logs-empty">{{ store.canIncrement ? '点击按钮模拟调度执行' : '完成步骤 6 解锁' }}</div>
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
import { computed } from 'vue' 
import { useChapter2Store } from '@/stores/chapter2'
import { sourceCode } from './data'

import CodePanel from '@/components/CodePanel.vue'
import StepDesc from '@/components/StepDesc.vue'
const store = useChapter2Store()

const hl = computed(() => store.currentStepData?.highlight || {})
</script>
<style scoped>
.demo-layout { display: flex; flex-direction: column; gap: 1rem; }
.main-grid { display: grid; grid-template-columns: 1fr 380px; gap: 1.25rem; }
.left-col, .right-col { display: flex; flex-direction: column; gap: 1rem; }


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
/* 调度流程图 */
.graph { display: flex; flex-direction: column; gap: 4px; }
.g-node { border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 12px; background: rgba(7,11,9,0.4); transition: all 0.35s; }
.g-node.hl { border-color: rgba(16,185,129,0.4); background: rgba(16,185,129,0.04); }
.g-node.diamond { border-radius: 8px; border-color: rgba(245,158,11,0.3); }
.g-node.diamond.hl { border-color: rgba(245,158,11,0.6); background: rgba(245,158,11,0.04); }
.g-node.small { padding: 8px 10px; font-size: 0.82rem; }
.g-dot { width: 7px; height: 7px; border-radius: 50%; background: rgba(94,138,118,0.35); display: inline-block; vertical-align: middle; margin-right: 6px; transition: all 0.3s; }
.g-dot.on { background: var(--accent); box-shadow: 0 0 6px rgba(16,185,129,0.4); }
.g-label { font-family: var(--font-mono); font-size: 0.72rem; font-weight: 600; color: var(--muted); transition: color 0.3s; }
.g-node.hl .g-label { color: var(--fg); }
.g-detail { margin-top: 6px; font-size: 0.68rem; color: var(--muted); line-height: 1.5; }
.g-detail.bad { color: rgba(239,68,68,0.7); }
.g-detail.good { color: rgba(16,185,129,0.8); }
.g-conn { display: flex; justify-content: center; padding: 2px 0; }
.g-conn::after { content: ''; width: 2px; height: 14px; border-radius: 1px; background: var(--border); transition: background 0.4s; }
.g-conn.active::after { background: var(--accent); }
/* 分支 */
.g-branches { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 6px; }
.g-branch { display: flex; flex-direction: column; gap: 4px; opacity: 0.35; transition: opacity 0.4s; }
.g-branch.active { opacity: 1; }
.branch-label { font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700; color: var(--muted); }
.g-branch.yes .branch-label { color: var(--accent); }
.g-branch.no .branch-label { color: var(--crimson); }
.g-conn-v { width: 2px; height: 10px; background: var(--border); margin-left: 20px; border-radius: 1px; }
.g-branch.active .g-conn-v { background: var(--accent); }
.g-conn-h { width: 10px; height: 2px; background: var(--border); margin: 6px 0 6px 20px; border-radius: 1px; }
.g-node.hl .g-conn-h, .queue-node.hl .g-conn-h { background: var(--accent); }
/* 队列可视化 */
.queue-box { margin-top: 8px; background: rgba(7,11,9,0.6); border-radius: 6px; padding: 8px; }
.queue-label { font-family: var(--font-mono); font-size: 0.6rem; color: var(--muted); margin-bottom: 4px; }
.queue-visual { display: flex; gap: 4px; }
.queue-slot {
  flex: 1; height: 24px; border: 1px dashed rgba(94,138,118,0.2); border-radius: 4px;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono); font-size: 0.58rem; color: transparent; transition: all 0.3s;
}
.queue-slot.filled {
  border-style: solid; border-color: rgba(16,185,129,0.4); background: var(--accent-dim); color: var(--accent);
}
.queue-slot.flushing { animation: node-flash 0.6s ease-out; }
.queue-meta { font-size: 0.55rem; color: rgba(94,138,118,0.4); margin-top: 4px; text-align: center; }
.flush-node { margin-top: 2px; }
.flush-node.hl { border-color: rgba(96,165,250,0.5); background: rgba(96,165,250,0.04); }
.flush-node.hl .g-label { color: #60a5fa; }
/* 执行对比 */
.compare-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.compare-item { background: rgba(7,11,9,0.6); border-radius: var(--radius-sm); padding: 12px; text-align: center; }
.compare-label { font-size: 0.68rem; color: var(--muted); margin-bottom: 4px; }
.compare-val { font-family: var(--font-mono); font-size: 1.5rem; font-weight: 700; }
.compare-item.bad .compare-val { color: var(--crimson); }
.compare-item.good .compare-val { color: var(--accent); }
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
.l-bad { color: var(--crimson); }
.l-arrow { color: var(--muted); }
.l-good { color: var(--accent); }
.l-val { color: var(--amber); margin-left: 4px; }
.l-time { margin-left: auto; color: rgba(94,138,118,0.3); font-size: 0.58rem; }
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
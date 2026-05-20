<template>
  <DemoLayout
    :sourceCode="sourceCode"
    :activeLines="store.activeLines"
    filename="computed.js"
    :steps="store.steps"
    :currentStep="store.currentStep"
    :totalSteps="store.totalSteps"
    :currentStepData="store.currentStepData"
    @prev="store.prevStep()"
    @next="store.nextStep()"
    @goTo="store.goToStep($event)"
  >
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
  </DemoLayout>
</template>

<script setup>
import { useChapter3Store } from '@/stores/chapter3'
import { sourceCode } from './data'
import DemoLayout from '@/components/DemoLayout.vue'

const store = useChapter3Store()
</script>

<style scoped>
/* 数据状态 - 章节特有 */
.state-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.state-item { background: rgba(7,11,9,0.6); border-radius: var(--radius-sm); padding: 12px; text-align: center; }
.state-label { font-size: 0.68rem; color: var(--muted); margin-bottom: 4px; }
.state-val { font-family: var(--font-mono); font-size: 0.85rem; font-weight: 700; }
.state-val.amber { color: var(--amber); }
.state-val.crimson { color: var(--crimson); font-size: 0.75rem; }
.state-val.accent { color: var(--accent); font-size: 0.75rem; }

/* 机制可视化 - 章节特有 */
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

/* 操作按钮 - 章节特有 */
.act-btn.read { background: linear-gradient(135deg, #0369a1, #0ea5e9); box-shadow: 0 2px 10px rgba(14,165,233,0.2); }
.act-btn.read:hover:not(:disabled) { box-shadow: 0 4px 18px rgba(14,165,233,0.35); transform: translateY(-1px); }
.act-btn.write { background: linear-gradient(135deg, #b45309, #f59e0b); box-shadow: 0 2px 10px rgba(245,158,11,0.2); }
.act-btn.write:hover:not(:disabled) { box-shadow: 0 4px 18px rgba(245,158,11,0.35); transform: translateY(-1px); }

/* 日志 - 章节特有 */
.l-type.compute { background: rgba(16,185,129,0.1); color: var(--accent); }
.l-type.cache { background: rgba(96,165,250,0.1); color: #60a5fa; }
.l-type.change { background: rgba(245,158,11,0.1); color: var(--amber); }
</style>
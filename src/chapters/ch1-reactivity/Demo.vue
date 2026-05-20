<template>
  <DemoLayout
    :sourceCode="sourceCode"
    :activeLines="store.activeLines"
    filename="mini-vue.js"
    :steps="store.steps"
    :currentStep="store.currentStep"
    :totalSteps="store.totalSteps"
    :currentStepData="store.currentStepData"
    @prev="store.prevStep()"
    @next="store.nextStep()"
    @goTo="store.goToStep($event)"
  >
    <div class="viz-card">
      <div class="viz-head"><i class="fa-solid fa-database"></i>
        <h4>响应式数据</h4>
      </div>
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
      <div class="viz-head"><i class="fa-solid fa-diagram-project"></i>
        <h4>依赖关系图</h4>
      </div>
      <div class="graph">
        <!-- state -->
        <div class="g-node" :class="{ hl: hl.state }">
          <div class="g-dot" :class="{ on: hl.state }"></div>
          <span class="g-label">state (Proxy)</span>
          <div class="g-detail"><span class="g-prop">.count</span><span class="g-arrow">→</span><span
              class="dep-tag" :class="{ dim: !hl.state }">{{ store.reactiveCount }}</span></div>
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
      <button class="inc-btn" :class="{ pulse: store.canIncrement }" @click="store.increment()"
        :disabled="!store.canIncrement">
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
  </DemoLayout>
</template>

<script setup>
import { computed } from 'vue'
import { useChapter1Store } from '@/stores/chapter1'
import { sourceCode } from './data'
import DemoLayout from '@/components/DemoLayout.vue'
const store = useChapter1Store()
const hl = computed(() => store.currentStepData?.highlight || {})
</script>

<style scoped>
/* 依赖图 - 章节特有样式 */
.g-detail {
  padding-left: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.g-prop {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  color: rgba(245, 158, 11, 0.7);
}

.g-arrow {
  color: rgba(94, 138, 118, 0.3);
  font-size: 0.6rem;
}

.g-fn {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  color: rgba(239, 68, 68, 0.7);
}

.dep-tag {
  background: var(--accent-dim);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 5px;
  padding: 1px 7px;
  font-size: 0.62rem;
  font-family: var(--font-mono);
  color: var(--accent);
  transition: opacity 0.3s;
}

.dep-tag.dim {
  opacity: 0.4;
}

.g-tree {
  margin-top: 6px;
  padding-left: 10px;
  font-family: var(--font-mono);
  font-size: 0.62rem;
  color: var(--muted);
  line-height: 1.8;
  animation: fade-slide-up 0.4s ease;
}

.g-empty {
  margin-top: 6px;
  padding-left: 14px;
  font-size: 0.62rem;
  color: rgba(94, 138, 118, 0.25);
  font-style: italic;
}

.g-conn.trigger::after {
  background: var(--crimson);
}

/* 日志 - 章节特有样式 */
.l-idx {
  color: rgba(94, 138, 118, 0.45);
}

.l-key {
  color: var(--amber);
}

.l-colon {
  color: var(--muted);
}

.l-from {
  color: var(--crimson);
}

.l-arrow {
  color: var(--muted);
}

.l-to {
  color: var(--accent);
}

.l-time {
  margin-left: auto;
  color: rgba(94, 138, 118, 0.3);
  font-size: 0.58rem;
}
</style>
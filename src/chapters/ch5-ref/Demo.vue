<template>
  <DemoLayout
    :sourceCode="sourceCode"
    :activeLines="store.activeLines"
    filename="ref.js"
    :steps="store.steps"
    :currentStep="store.currentStep"
    :totalSteps="store.totalSteps"
    :currentStepData="store.currentStepData"
    @prev="store.prevStep()"
    @next="store.nextStep()"
    @goTo="store.goToStep($event)"
  >
    <!-- 问题演示 -->
    <div class="viz-card" v-if="hl.problem">
      <div class="viz-head"><i class="fa-solid fa-triangle-exclamation"></i><h4>Proxy 的局限</h4></div>
      <div class="problem-demo">
        <div class="code-attempt">
          <span class="code-kw">const</span> a = <span class="code-fn">reactive</span>(<span class="code-num">0</span>)
        </div>
        <div class="error-box">
          <i class="fa-solid fa-xmark"></i>
          <span>TypeError: Cannot create proxy with a non-object as target</span>
        </div>
        <div class="type-compare">
          <div class="type-col bad">
            <div class="type-label">原始值</div>
            <div class="type-list">
              <span>Number</span>
              <span>String</span>
              <span>Boolean</span>
              <span>undefined</span>
              <span>null</span>
            </div>
            <div class="type-result">无法 Proxy</div>
          </div>
          <div class="type-col good">
            <div class="type-label">引用值</div>
            <div class="type-list">
              <span>Object</span>
              <span>Array</span>
              <span>Map</span>
              <span>Set</span>
            </div>
            <div class="type-result">可以 Proxy</div>
          </div>
        </div>
      </div>
    </div>
    <!-- Ref 包装机制 -->
    <div class="viz-card">
      <div class="viz-head"><i class="fa-solid fa-box-open"></i><h4>Ref 包装机制</h4></div>
      <div class="ref-visual">
        <!-- 原始值 -->
        <div class="raw-val">
          <span class="raw-label">原始值</span>
          <div class="raw-number" :class="{ tracking: store.isTracking, triggering: store.isTriggering }">
            <Transition name="fade" mode="out-in">
              <span :key="store.primitiveVal">{{ store.primitiveVal }}</span>
            </Transition>
          </div>
        </div>
        <div class="wrap-arrow">
          <i class="fa-solid fa-arrow-down"></i>
          <span>包装为对象</span>
        </div>
        <!-- Ref Wrapper -->
        <div class="ref-wrapper" :class="{ active: hl.wrapper || hl.define }">
          <div class="wrapper-header">
            <div class="ref-badge">__v_isRef: true</div>
            <span class="wrapper-title">Ref Wrapper</span>
          </div>
          <!-- value 属性拦截 -->
          <div class="prop-intercept" :class="{ active: hl.define }">
            <div class="prop-name">.value</div>
            <div class="intercept-logic">
              <div class="getter" :class="{ flash: store.isTracking }">
                <span class="g-label">get()</span>
                <span class="g-action">→ track(wrapper, 'value')</span>
                <span class="g-return">→ return val</span>
              </div>
              <div class="setter" :class="{ flash: store.isTriggering }">
                <span class="s-label">set()</span>
                <span class="s-action">→ val = newVal</span>
                <span class="s-trigger">→ trigger(wrapper, 'value')</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 自动脱 Ref -->
    <div class="viz-card" :class="{ unlocked: store.isUnwrapped }">
      <div class="viz-head"><i class="fa-solid fa-wand-magic-sparkles"></i><h4>自动脱 Ref (proxyRefs)</h4></div>
      <div class="unwrap-visual" v-if="store.isUnwrapped">
        <div class="unwrap-flow">
          <div class="user-code">
            <div class="code-line-demo" :class="{ active: store.accessMode === 'direct' }">
              <template v-if="store.accessMode === 'direct'">
                obj.count <span class="op">=</span> <span class="val">{{ store.primitiveVal }}</span>
              </template>
              <template v-else>
                obj.count
              </template>
            </div>
          </div>
          <div class="unwrap-arrow">
            <i class="fa-solid fa-arrow-down"></i>
            <span>Proxy 拦截</span>
          </div>
          <div class="internal-code">
            <div class="code-line-demo internal" :class="{ active: store.accessMode === 'direct' }">
              <template v-if="store.accessMode === 'direct'">
                count<span class="dot-val">.value</span> <span class="op">=</span> <span class="val">{{ store.primitiveVal }}</span>
              </template>
              <template v-else>
                count<span class="dot-val">.value</span>
              </template>
            </div>
          </div>
        </div>
        <div class="unwrap-tip">
          <i class="fa-solid fa-lightbulb"></i>
          <span>在模板或 setup 返回中，无需手写 .value</span>
        </div>
      </div>
      <div class="unwrap-locked" v-else>
        <i class="fa-solid fa-lock"></i>
        <span>步骤 5 解锁自动脱 Ref 机制</span>
      </div>
    </div>
    <!-- 操作区 -->
    <div class="viz-card action">
      <div class="action-label">交互模拟 (步骤 6 解锁)</div>
      <div class="action-grid">
        <div class="action-group">
          <div class="group-label">手动 .value</div>
          <div class="btn-pair">
            <button class="act-btn read" @click="store.simulateReadValue()" :disabled="!store.canInteract"><i class="fa-solid fa-eye"></i> 读取</button>
            <button class="act-btn write" @click="store.simulateWriteValue()" :disabled="!store.canInteract"><i class="fa-solid fa-pen"></i> 修改</button>
          </div>
        </div>
        <div class="action-group" :class="{ disabled: !store.isUnwrapped }">
          <div class="group-label">自动脱 ref</div>
          <div class="btn-pair">
            <button class="act-btn direct-read" @click="store.simulateReadDirect()" :disabled="!store.canInteract || !store.isUnwrapped"><i class="fa-solid fa-eye"></i> 读取</button>
            <button class="act-btn direct-write" @click="store.simulateWriteDirect()" :disabled="!store.canInteract || !store.isUnwrapped"><i class="fa-solid fa-pen"></i> 修改</button>
          </div>
        </div>
      </div>
      <div v-if="store.triggerLogs.length" class="logs">
        <div class="logs-head"><i class="fa-solid fa-clock-rotate-left"></i> 执行日志</div>
        <TransitionGroup name="fade" tag="div" class="logs-list">
          <div v-for="(log, i) in store.triggerLogs" :key="log.time + i" class="log-item">
            <span class="l-type" :class="{ track: log.type.includes('track'), trigger: log.type.includes('trigger'), unwrap: log.type.includes('脱ref') }">{{ log.type }}</span>
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
import { computed } from 'vue'
import { useChapter5Store } from '@/stores/chapter5'
import { sourceCode } from './data'
import DemoLayout from '@/components/DemoLayout.vue'

const store = useChapter5Store()
const hl = computed(() => store.currentStepData?.highlight || {})
</script>

<style scoped>
/* viz-card 章节特有变体 */
.viz-card.unlocked { border-color: rgba(16,185,129,0.3); }
/* Proxy 局限 */
.problem-demo { display: flex; flex-direction: column; gap: 10px; }
.code-attempt { font-family: var(--font-mono); font-size: 0.72rem; background: rgba(7,11,9,0.6); padding: 8px 12px; border-radius: 6px; }
.code-kw { color: #7dd3a8; }
.code-fn { color: #fbbf24; }
.code-num { color: #f472b6; }
.error-box { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 6px; padding: 8px 12px; font-family: var(--font-mono); font-size: 0.62rem; color: var(--crimson); display: flex; align-items: center; gap: 6px; }
.type-compare { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.type-col { background: rgba(7,11,9,0.6); border-radius: 6px; padding: 8px 10px; display: flex; flex-direction: column; gap: 4px; }
.type-label { font-size: 0.65rem; font-weight: 600; margin-bottom: 2px; }
.type-col.bad .type-label { color: var(--crimson); }
.type-col.good .type-label { color: var(--accent); }
.type-list { display: flex; flex-direction: column; gap: 1px; font-family: var(--font-mono); font-size: 0.58rem; color: var(--muted); }
.type-result { font-size: 0.6rem; font-weight: 700; margin-top: 4px; text-align: center; padding: 2px 0; border-radius: 3px; }
.type-col.bad .type-result { background: rgba(239,68,68,0.1); color: var(--crimson); }
.type-col.good .type-result { background: var(--accent-dim); color: var(--accent); }
/* Ref 包装可视化 */
.ref-visual { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.raw-val { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.raw-label { font-size: 0.6rem; color: var(--muted); }
.raw-number {
  font-family: var(--font-mono); font-size: 1.5rem; font-weight: 700; color: var(--fg);
  background: rgba(7,11,9,0.6); width: 60px; height: 48px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid var(--border); transition: all 0.3s;
}
.raw-number.tracking { border-color: var(--accent); box-shadow: 0 0 12px rgba(16,185,129,0.2); }
.raw-number.triggering { border-color: var(--crimson); box-shadow: 0 0 12px rgba(239,68,68,0.2); }
.wrap-arrow { display: flex; flex-direction: column; align-items: center; gap: 2px; color: var(--muted); font-size: 0.58rem; }
.wrap-arrow i { font-size: 0.7rem; }
.ref-wrapper {
  width: 100%; border: 1px solid var(--border); border-radius: var(--radius-sm);
  background: rgba(7,11,9,0.4); padding: 10px 12px; transition: all 0.35s;
}
.ref-wrapper.active { border-color: rgba(16,185,129,0.4); background: rgba(16,185,129,0.04); }
.wrapper-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.ref-badge { font-family: var(--font-mono); font-size: 0.55rem; color: var(--accent); background: var(--accent-dim); padding: 2px 6px; border-radius: 3px; }
.wrapper-title { font-family: var(--font-mono); font-size: 0.68rem; font-weight: 600; color: var(--muted); }
.prop-intercept { background: rgba(7,11,9,0.6); border-radius: 6px; padding: 8px; border: 1px solid transparent; transition: all 0.3s; }
.prop-intercept.active { border-color: rgba(16,185,129,0.3); }
.prop-name { font-family: var(--font-mono); font-size: 0.68rem; color: var(--amber); font-weight: 600; margin-bottom: 6px; }
.intercept-logic { display: flex; flex-direction: column; gap: 6px; }
.getter, .setter { display: flex; align-items: center; gap: 4px; font-family: var(--font-mono); font-size: 0.58rem; flex-wrap: wrap; padding: 4px 6px; border-radius: 4px; background: rgba(7,11,9,0.4); transition: all 0.3s; }
.getter.flash { background: rgba(16,185,129,0.12); box-shadow: 0 0 8px rgba(16,185,129,0.15); }
.setter.flash { background: rgba(239,68,68,0.12); box-shadow: 0 0 8px rgba(239,68,68,0.15); }
.g-label, .s-label { color: var(--accent); font-weight: 600; min-width: 36px; }
.s-label { color: var(--crimson); }
.g-action, .s-action { color: var(--muted); }
.g-return { color: rgba(16,185,129,0.7); }
.s-trigger { color: rgba(239,68,68,0.7); }
/* 自动脱 Ref */
.unwrap-visual { display: flex; flex-direction: column; gap: 8px; }
.unwrap-flow { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.user-code, .internal-code { width: 100%; background: rgba(7,11,9,0.6); border-radius: 6px; padding: 8px 12px; }
.code-line-demo { font-family: var(--font-mono); font-size: 0.72rem; color: var(--muted); transition: all 0.3s; }
.code-line-demo.active { color: var(--fg); }
.code-line-demo.internal { color: rgba(16,185,129,0.7); }
.dot-val { color: var(--amber); font-weight: 700; }
.op { color: var(--crimson); }
.val { color: #60a5fa; }
.unwrap-arrow { display: flex; flex-direction: column; align-items: center; gap: 2px; color: var(--accent); font-size: 0.58rem; }
.unwrap-arrow i { font-size: 0.7rem; }
.unwrap-tip { background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.2); border-radius: 6px; padding: 6px 10px; font-size: 0.62rem; color: var(--amber); display: flex; align-items: center; gap: 6px; }
.unwrap-locked { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 16px; color: rgba(94,138,118,0.3); font-size: 0.72rem; }
/* 操作区 - 章节特有布局 */
.action-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.action-group { display: flex; flex-direction: column; gap: 6px; }
.action-group.disabled { opacity: 0.35; pointer-events: none; }
.group-label { font-size: 0.62rem; font-weight: 600; color: var(--muted); text-align: center; }
.btn-pair { display: flex; gap: 6px; }
/* 章节特有按钮变体 */
.act-btn.read { background: linear-gradient(135deg, #0369a1, #0ea5e9); }
.act-btn.write { background: linear-gradient(135deg, #b45309, #f59e0b); }
.act-btn.direct-read { background: linear-gradient(135deg, #4338ca, #6366f1); }
.act-btn.direct-write { background: linear-gradient(135deg, #059669, #10b981); }
.act-btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.1); }
/* 日志 - 章节特有类型标签 */
.l-type.track { background: rgba(16,185,129,0.1); color: var(--accent); }
.l-type.trigger { background: rgba(239,68,68,0.1); color: var(--crimson); }
.l-type.unwrap { background: rgba(245,158,11,0.1); color: var(--amber); }
</style>

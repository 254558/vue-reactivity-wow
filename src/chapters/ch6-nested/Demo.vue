<template>
  <div class="demo-layout">
    <div class="main-grid">
      <!-- 左栏：代码 -->
      <div class="left-col">
        <div class="code-panel">
          <div class="code-header">
            <div class="code-dots"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span></div>
            <span class="code-filename">nested-effect.js</span>
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
        <!-- 组件树映射 -->
        <div class="viz-card">
          <div class="viz-head"><i class="fa-solid fa-sitemap"></i><h4>组件树与 Effect</h4></div>
          <div class="component-tree">
            <div class="comp-node father" :class="{ active: store.currentStep >= 1 }">
              <div class="comp-dot"></div>
              <span class="comp-name">Father Component</span>
              <span class="comp-effect">effect1()</span>
            </div>
            <div class="tree-line"></div>
            <div class="comp-node child" :class="{ active: store.currentStep >= 1 }">
              <div class="comp-dot blue"></div>
              <span class="comp-name">Child Component</span>
              <span class="comp-effect">effect2()</span>
            </div>
          </div>
        </div>

        <!-- EffectStack 栈可视化 -->
        <div class="viz-card">
          <div class="viz-head"><i class="fa-solid fa-layer-group"></i><h4>EffectStack 栈状态</h4></div>
          <div class="stack-container">
            <div class="stack-vis">
              <!-- 空栈提示 -->
              <div v-if="store.effectStack.length === 0" class="stack-empty">
                栈为空
              </div>
              <!-- 栈帧 -->
              <TransitionGroup name="stack" tag="div" class="stack-frames">
                <div v-for="(frame, i) in store.effectStack" :key="frame + i"
                  class="stack-frame"
                  :class="{ 
                    top: i === store.effectStack.length - 1,
                    pushing: store.isPushing && i === store.effectStack.length - 1,
                    popping: store.isPopping && i === store.effectStack.length - 1
                  }">
                  <span class="frame-index">[{{ i }}]</span>
                  <span class="frame-name">{{ frame }}</span>
                  <span v-if="i === store.effectStack.length - 1" class="active-tag">
                    <i class="fa-solid fa-arrow-left"></i> activeEffect
                  </span>
                </div>
              </TransitionGroup>
            </div>
            <div class="stack-ops">
              <div class="op-item" :class="{ active: store.isPushing }">
                <span class="op-fn">push(effectFn)</span>
                <span class="op-desc">入栈，设置 activeEffect</span>
              </div>
              <div class="op-item" :class="{ active: store.isPopping }">
                <span class="op-fn">pop() + 还原</span>
                <span class="op-desc">出栈，还原 activeEffect</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 触发验证 -->
        <div class="viz-card" :class="{ verified: store.isTriggering }">
          <div class="viz-head"><i class="fa-solid fa-bullseye"></i><h4>触发验证</h4></div>
          <div class="verify-area">
            <div class="verify-state">
              <span class="v-key">state.text</span>
              <span class="v-colon">:</span>
              <Transition name="fade" mode="out-in">
                <span class="v-val" :key="store.textVal">"{{ store.textVal }}"</span>
              </Transition>
            </div>
            <div class="verify-effect">
              <div class="ve-item" :class="{ hit: store.isTriggering }">
                <span class="ve-name">effect1 (父)</span>
                <span class="ve-status" :class="store.isTriggering ? 'miss' : 'idle'">不触发</span>
              </div>
              <div class="ve-item" :class="{ hit: store.isTriggering }">
                <span class="ve-name">effect2 (子)</span>
                <span class="ve-status" :class="store.isTriggering ? 'fire' : 'idle'">
                  <template v-if="store.isTriggering"><i class="fa-solid fa-bolt"></i> 触发</template>
                  <template v-else>待命</template>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作区 -->
        <div class="viz-card action">
          <button class="act-btn" :class="{ pulse: store.canInteract }" @click="store.simulateChangeText()" :disabled="!store.canInteract">
            <i class="fa-solid fa-pen"></i> 修改 state.text = "World"
          </button>
          <div v-if="store.triggerLogs.length" class="logs">
            <div class="logs-head"><i class="fa-solid fa-clock-rotate-left"></i> 执行日志</div>
            <TransitionGroup name="fade" tag="div" class="logs-list">
              <div v-for="(log, i) in store.triggerLogs" :key="log.time + i" class="log-item">
                <span class="l-type" :class="{ push: log.type==='入栈', pop: log.type==='出栈', fire: log.type==='触发' }">{{ log.type }}</span>
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
import { useChapter6Store } from '@/stores/chapter6'
import { sourceCode } from './data'

const store = useChapter6Store()
const codeRef = ref(null)

const kw = ['let','const','var','function','return','if','new','true','false','null']
const types = ['WeakMap','Map','Set','Proxy']
const fns = ['effect','track','trigger','reactive','push','pop']

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
.viz-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px; transition: all 0.3s; }
.viz-card.verified { border-color: rgba(16,185,129,0.4); box-shadow: 0 0 20px rgba(16,185,129,0.08); }
.viz-head { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
.viz-head i { color: var(--accent); font-size: 0.7rem; }
.viz-head h4 { font-size: 0.82rem; font-weight: 700; }

/* 组件树 */
.component-tree { display: flex; flex-direction: column; align-items: center; gap: 0; }
.comp-node { display: flex; align-items: center; gap: 8px; background: rgba(7,11,9,0.6); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 16px; width: 100%; transition: all 0.3s; opacity: 0.4; }
.comp-node.active { opacity: 1; }
.comp-node.father.active { border-color: rgba(245,158,11,0.4); }
.comp-node.child.active { border-color: rgba(96,165,250,0.4); }
.comp-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--amber); }
.comp-dot.blue { background: #60a5fa; }
.comp-name { font-size: 0.78rem; font-weight: 600; flex: 1; }
.comp-effect { font-family: var(--font-mono); font-size: 0.68rem; color: var(--muted); background: rgba(7,11,9,0.6); padding: 2px 8px; border-radius: 4px; }
.tree-line { width: 2px; height: 16px; background: var(--border); }

/* EffectStack 栈 */
.stack-container { display: flex; flex-direction: column; gap: 12px; }
.stack-vis { 
  background: rgba(7,11,9,0.6); border: 1px dashed var(--border); border-radius: var(--radius-sm); 
  padding: 12px; min-height: 80px; display: flex; flex-direction: column; justify-content: flex-end;
  position: relative;
}
.stack-empty { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 0.68rem; color: rgba(94,138,118,0.3); font-style: italic; }
.stack-frames { display: flex; flex-direction: column-reverse; gap: 4px; }
.stack-frame {
  background: rgba(26,46,37,0.5); border: 1px solid var(--border); border-radius: 6px;
  padding: 8px 12px; display: flex; align-items: center; gap: 8px; transition: all 0.35s;
}
.stack-frame.top { border-color: rgba(16,185,129,0.5); background: rgba(16,185,129,0.06); }
.stack-frame.pushing { animation: slide-in 0.4s ease-out; border-color: var(--accent); box-shadow: 0 0 12px rgba(16,185,129,0.2); }
.stack-frame.popping { animation: slide-out 0.3s ease-in forwards; }
.frame-index { font-family: var(--font-mono); font-size: 0.58rem; color: rgba(94,138,118,0.4); }
.frame-name { font-family: var(--font-mono); font-size: 0.7rem; font-weight: 600; color: var(--fg); flex: 1; }
.active-tag { font-size: 0.58rem; color: var(--accent); white-space: nowrap; display: flex; align-items: center; gap: 4px; }

@keyframes slide-in { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
@keyframes slide-out { from { transform: translateX(0); opacity: 1; } to { transform: translateX(-20px); opacity: 0; } }

.stack-ops { display: flex; flex-direction: column; gap: 6px; }
.op-item { display: flex; align-items: center; gap: 8px; background: rgba(7,11,9,0.6); border-radius: 6px; padding: 6px 10px; border: 1px solid transparent; transition: all 0.3s; }
.op-item.active { border-color: rgba(16,185,129,0.4); background: rgba(16,185,129,0.06); }
.op-fn { font-family: var(--font-mono); font-size: 0.65rem; font-weight: 600; color: var(--accent); }
.op-desc { font-size: 0.6rem; color: var(--muted); }

/* 触发验证 */
.verify-area { display: flex; flex-direction: column; gap: 10px; }
.verify-state { font-family: var(--font-mono); font-size: 0.82rem; display: flex; align-items: center; gap: 6px; background: rgba(7,11,9,0.6); padding: 8px 12px; border-radius: 6px; }
.v-key { color: var(--amber); }
.v-colon { color: var(--muted); }
.v-val { color: var(--accent); font-weight: 600; }

.verify-effect { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.ve-item { 
  background: rgba(7,11,9,0.6); border: 1px solid var(--border); border-radius: 6px; padding: 8px; 
  display: flex; flex-direction: column; align-items: center; gap: 4px; transition: all 0.3s; 
}
.ve-item.hit { border-color: rgba(16,185,129,0.5); }
.ve-item:first-child.hit { border-color: rgba(94,138,118,0.3); }
.ve-name { font-size: 0.62rem; color: var(--muted); }
.ve-status { font-family: var(--font-mono); font-size: 0.72rem; font-weight: 700; }
.ve-status.idle { color: rgba(94,138,118,0.4); }
.ve-status.miss { color: var(--muted); text-decoration: line-through; }
.ve-status.fire { color: var(--accent); animation: flash-text 0.6s ease; }

@keyframes flash-text { 0%,100%{opacity:1}50%{opacity:0.3} }

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
.l-type.push { background: rgba(96,165,250,0.1); color: #60a5fa; }
.l-type.pop { background: rgba(245,158,11,0.1); color: var(--amber); }
.l-type.fire { background: rgba(16,185,129,0.1); color: var(--accent); }
.l-detail { color: var(--muted); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.l-time { color: rgba(94,138,118,0.3); font-size: 0.5rem; white-space: nowrap; }
.logs-empty { text-align: center; padding: 8px; font-size: 0.68rem; color: rgba(94,138,118,0.3); }

/* Vue TransitionGroup */
.stack-enter-active { transition: all 0.4s ease-out; }
.stack-leave-active { transition: all 0.3s ease-in; position: absolute; }
.stack-enter-from { opacity: 0; transform: translateX(20px); }
.stack-leave-to { opacity: 0; transform: translateX(-20px); }
.stack-move { transition: transform 0.3s ease; }

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

@media (max-width: 1024px) { .main-grid { grid-template-columns: 1fr; } .step-tabs { display: none; } }
</style>
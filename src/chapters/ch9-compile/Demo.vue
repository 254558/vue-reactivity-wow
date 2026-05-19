<template>
  <div class="demo-layout">
    <div class="main-grid">
      <!-- 左栏：代码 + 说明 -->
      <div class="left-col">
        <!-- ✅ 替换为公共代码组件 -->
        <CodePanel :sourceCode="sourceCode" :activeLines="store.activeLines" filename="compiler.js" />
        <!-- ✅ 替换为公共说明组件 -->
        <StepDesc :step="store.currentStepData" />
      </div>
      <!-- 右栏：可视化 -->
      <div class="right-col">
        <!-- 编译流水线 -->
        <div class="viz-card">
          <div class="viz-head"><i class="fa-solid fa-gears"></i><h4>编译流水线</h4></div>
          <div class="pipeline">
            <!-- 源码 -->
            <div class="pipe-stage" :class="{ active: store.currentStep >= 1 }">
              <div class="stage-icon src"><i class="fa-solid fa-code"></i></div>
              <div class="stage-info">
                <span class="stage-label">Template</span>
                <span class="stage-desc">模板字符串</span>
              </div>
            </div>
            <div class="pipe-arrow" :class="{ flow: store.currentPhase === 'parse' }"><i class="fa-solid fa-arrow-down"></i></div>
            <!-- Parse -->
            <div class="pipe-stage" :class="{ active: store.currentStep >= 2, processing: store.currentPhase === 'parse' }">
              <div class="stage-icon parse"><i class="fa-solid fa-magnifying-glass"></i></div>
              <div class="stage-info">
                <span class="stage-label">Parse</span>
                <span class="stage-desc">解析为 AST</span>
              </div>
            </div>
            <div class="pipe-arrow" :class="{ flow: store.currentPhase === 'transform' }"><i class="fa-solid fa-arrow-down"></i></div>
            <!-- Transform -->
            <div class="pipe-stage" :class="{ active: store.currentStep >= 4, processing: store.currentPhase === 'transform' }">
              <div class="stage-icon transform"><i class="fa-solid fa-shuffle"></i></div>
              <div class="stage-info">
                <span class="stage-label">Transform</span>
                <span class="stage-desc">转换与优化</span>
              </div>
            </div>
            <div class="pipe-arrow" :class="{ flow: store.currentPhase === 'codegen' }"><i class="fa-solid fa-arrow-down"></i></div>
            <!-- Codegen -->
            <div class="pipe-stage" :class="{ active: store.currentStep >= 5, processing: store.currentPhase === 'codegen' }">
              <div class="stage-icon codegen"><i class="fa-solid fa-file-code"></i></div>
              <div class="stage-info">
                <span class="stage-label">Codegen</span>
                <span class="stage-desc">生成渲染函数</span>
              </div>
            </div>
          </div>
        </div>
        <!-- AST 可视化 -->
        <div class="viz-card" :class="{ active: store.currentStep >= 3 }">
          <div class="viz-head"><i class="fa-solid fa-sitemap"></i><h4>AST 抽象语法树</h4></div>
          <div class="ast-vis">
            <!-- Root -->
            <div class="ast-node root" :class="{ highlight: store.currentPhase === 'parse' }">
              <div class="node-dot root-dot"></div>
              <span class="node-type">Root</span>
            </div>
            <div class="ast-branch">
              <!-- Element div -->
              <div class="ast-node" :class="{ highlight: store.currentPhase === 'transform' }">
                <div class="node-dot elem-dot"></div>
                <span class="node-type">Element</span>
                <span class="node-tag">'div'</span>
              </div>
              <div class="ast-children">
                <!-- Text -->
                <div class="ast-node child" :class="{ highlight: store.currentPhase === 'transform' }">
                  <div class="node-dot text-dot"></div>
                  <span class="node-type">Text</span>
                  <span class="node-val">'hello '</span>
                </div>
                <!-- Interpolation -->
                <div class="ast-node child" :class="{ highlight: store.currentPhase === 'codegen' }">
                  <div class="node-dot interp-dot"></div>
                  <span class="node-type">Interpolation</span>
                  <span class="node-val">name</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 渲染函数产物 -->
        <div class="viz-card" :class="{ active: store.currentStep >= 6 }">
          <div class="viz-head"><i class="fa-solid fa-wand-magic-sparkles"></i><h4>生成产物：Render Function</h4></div>
          <div class="render-result">
            <pre><code><span class="ck-kw">function</span> <span class="ck-fn">render</span>() {
  <span class="ck-kw">return</span> <span class="ck-fn">h</span>(<span class="ck-str">'div'</span>, <span class="ck-kw">null</span>, [
    <span class="ck-str">'hello '</span>,
    _ctx.name
  ])
}</code></pre>
          </div>
        </div>
        <!-- 操作区 -->
        <div class="viz-card action">
          <button class="act-btn" :class="{ pulse: store.canInteract }" @click="store.simulateCompile()" :disabled="!store.canInteract || store.isCompiling">
            <i class="fa-solid fa-rocket"></i> 执行完整编译流水线
          </button>
          <div v-if="store.triggerLogs.length" class="logs">
            <div class="logs-head"><i class="fa-solid fa-clock-rotate-left"></i> 编译日志</div>
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
import { useChapter9Store } from '@/stores/chapter9' // ✅ 删除了不再需要的 computed, ref, watch, nextTick
import { sourceCode } from './data'
// ✅ 引入公共组件
import CodePanel from '@/components/CodePanel.vue'
import StepDesc from '@/components/StepDesc.vue'
const store = useChapter9Store()
// ❌ 删除了原本的 kw, types 数组和 highlight 函数
// ❌ 删除了原本的 highlightedLines 计算属性
// ❌ 删除了原本的 codeRef 和 watch 滚动监听
// ✅ 保留该章节特有的逻辑
function getLogClass(type) {
  if (type === 'parse') return 'parse'
  if (type === 'transform') return 'transform'
  if (type === 'codegen') return 'codegen'
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
.viz-card.active { border-color: rgba(16,185,129,0.3); }
.viz-head { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
.viz-head i { color: var(--accent); font-size: 0.7rem; }
.viz-head h4 { font-size: 0.82rem; font-weight: 700; }
/* 流水线 */
.pipeline { display: flex; flex-direction: column; align-items: center; gap: 0; }
.pipe-stage { 
  width: 100%; display: flex; align-items: center; gap: 12px; padding: 10px 14px;
  background: rgba(7,11,9,0.4); border: 1px solid var(--border); border-radius: var(--radius-sm);
  transition: all 0.4s; opacity: 0.35;
}
.pipe-stage.active { opacity: 0.8; border-color: rgba(94,138,118,0.4); }
.pipe-stage.processing { opacity: 1; border-color: rgba(16,185,129,0.6); background: rgba(16,185,129,0.06); box-shadow: 0 0 16px rgba(16,185,129,0.15); }
.stage-icon { 
  width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center;
  justify-content: center; font-size: 0.75rem; flex-shrink: 0;
}
.stage-icon.src { background: rgba(94,138,118,0.15); color: var(--muted); }
.stage-icon.parse { background: rgba(96,165,250,0.12); color: #60a5fa; }
.stage-icon.transform { background: rgba(139,92,246,0.12); color: #8b5cf6; }
.stage-icon.codegen { background: rgba(239,68,68,0.12); color: var(--crimson); }
.pipe-stage.processing .stage-icon { box-shadow: 0 0 8px currentColor; }
.stage-info { display: flex; flex-direction: column; gap: 2px; }
.stage-label { font-weight: 700; font-size: 0.82rem; }
.stage-desc { font-size: 0.62rem; color: var(--muted); }
.pipe-arrow { color: rgba(94,138,118,0.2); padding: 4px 0; transition: all 0.3s; }
.pipe-arrow.flow { color: var(--accent); animation: flow-down 0.6s ease infinite; }
@keyframes flow-down { 0%,100%{transform:translateY(0)}50%{transform:translateY(2px)} }
/* AST 可视化 */
.ast-vis { display: flex; flex-direction: column; align-items: flex-start; padding-left: 12px; }
.ast-node { 
  display: flex; align-items: center; gap: 6px; padding: 6px 10px;
  background: rgba(7,11,9,0.6); border-radius: 6px; border: 1px solid var(--border);
  transition: all 0.3s; font-size: 0.72rem;
}
.ast-node.highlight { border-color: rgba(16,185,129,0.5); background: rgba(16,185,129,0.04); }
.node-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.root-dot { background: var(--accent); }
.elem-dot { background: #60a5fa; }
.text-dot { background: var(--muted); }
.interp-dot { background: #f59e0b; }
.node-type { font-family: var(--font-mono); font-weight: 600; color: var(--fg); }
.node-tag { font-family: var(--font-mono); font-size: 0.65rem; color: #60a5fa; background: rgba(96,165,250,0.1); padding: 0 4px; border-radius: 3px; }
.node-val { font-family: var(--font-mono); font-size: 0.65rem; color: var(--amber); background: rgba(245,158,11,0.1); padding: 0 4px; border-radius: 3px; }
.ast-branch { padding-left: 24px; display: flex; flex-direction: column; gap: 4px; border-left: 2px solid var(--border); margin-left: 16px; margin-top: 4px; }
.ast-children { padding-left: 24px; display: flex; flex-direction: column; gap: 4px; border-left: 2px dashed rgba(94,138,118,0.3); margin-left: 16px; }
.ast-node.child { border-width: 1px; padding: 4px 8px; }
/* 生成产物 */
.render-result { background: rgba(7,11,9,0.6); border-radius: var(--radius-sm); padding: 12px; font-family: var(--font-mono); font-size: 0.72rem; line-height: 1.6; overflow-x: auto; }
.render-result code { color: var(--fg); }
.ck-kw { color: #7dd3a8; }
.ck-fn { color: #fbbf24; }
.ck-str { color: #f0a85e; }
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
.l-type.parse { background: rgba(96,165,250,0.1); color: #60a5fa; }
.l-type.transform { background: rgba(139,92,246,0.1); color: #8b5cf6; }
.l-type.codegen { background: rgba(239,68,68,0.1); color: var(--crimson); }
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
<template>
  <div class="demo-layout">
    <div class="main-grid">
      <!-- 左栏：代码 + 说明 -->
      <div class="left-col">
        <!-- ✅ 替换为公共代码组件 -->
        <CodePanel :sourceCode="sourceCode" :activeLines="store.activeLines" filename="component.js" />
        <!-- ✅ 替换为公共说明组件 -->
        <StepDesc :step="store.currentStepData" />
      </div>
      <!-- 右栏：可视化 -->
      <div class="right-col">
        <!-- 组件层级关系 -->
        <div class="viz-card">
          <div class="viz-head"><i class="fa-solid fa-cubes"></i><h4>组件层级关系</h4></div>
          <div class="comp-tree">
            <!-- 父组件 -->
            <div class="comp-node parent" :class="{ updating: store.isUpdating }">
              <div class="comp-header">
                <div class="comp-icon parent-icon"><i class="fa-solid fa-box"></i></div>
                <span class="comp-name">ParentComponent</span>
              </div>
              <div class="comp-state">
                <span class="state-key">state.count</span>
                <span class="state-colon">:</span>
                <Transition name="fade" mode="out-in">
                  <span class="state-val" :key="store.parentCount">{{ store.parentCount }}</span>
                </Transition>
              </div>
            </div>
            <div class="tree-connector">
              <div class="connector-line"></div>
              <div class="connector-props" :class="{ flowing: store.isUpdating }">
                <i class="fa-solid fa-arrow-down"></i> props: { title: "{{ store.childPropTitle }}" }
              </div>
            </div>
            <!-- 子组件 -->
            <div class="comp-node child" :class="{ mounted: store.isMounted, updating: store.isUpdating }">
              <div class="comp-header">
                <div class="comp-icon child-icon"><i class="fa-solid fa-cube"></i></div>
                <span class="comp-name">MyComponent</span>
              </div>
              <!-- 实例可视化 -->
              <div class="instance-box" v-if="store.isMounted">
                <div class="inst-title">Component Instance</div>
                <div class="inst-grid">
                  <div class="inst-item">
                    <span class="inst-key">props</span>
                    <span class="inst-val accent">{ title: "{{ store.childPropTitle }}" }</span>
                  </div>
                  <div class="inst-item">
                    <span class="inst-key">setupState</span>
                    <span class="inst-val amber">{ count: ref(0) }</span>
                  </div>
                  <div class="inst-item">
                    <span class="inst-key">render</span>
                    <span class="inst-val muted">() => h(...)</span>
                  </div>
                  <div class="inst-item">
                    <span class="inst-key">isMounted</span>
                    <span class="inst-val green">true</span>
                  </div>
                </div>
                <div class="subtree-section">
                  <div class="subtree-label">subTree (VNode)</div>
                  <div class="subtree-tree">
                    <div class="st-node">&lt;div&gt;
                      <div class="st-children">
                        <div class="st-node leaf">&lt;h2&gt; <span class="st-bind">{{ store.childPropTitle }}</span> &lt;/h2&gt;</div>
                        <div class="st-node leaf">&lt;p&gt; <span class="st-bind">0</span> &lt;/p&gt;</div>
                        <div class="st-node leaf">&lt;button&gt; Click &lt;/button&gt;</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="instance-empty" v-else>
                <i class="fa-solid fa-lock"></i> 执行 mountComponent 后创建实例
              </div>
            </div>
          </div>
        </div>
        <!-- 操作区 -->
        <div class="viz-card action">
          <div class="action-label">交互模拟</div>
          <div class="btn-group">
            <button class="act-btn mount-btn" @click="store.simulateMount()" :disabled="store.isMounted">
              <i class="fa-solid fa-download"></i> 挂载组件
            </button>
            <button class="act-btn update-btn" @click="store.simulateParentUpdate()" :disabled="!store.canInteract || store.isUpdating || !store.isMounted">
              <i class="fa-solid fa-rotate"></i> 父组件更新
            </button>
          </div>
          <div v-if="store.triggerLogs.length" class="logs">
            <div class="logs-head"><i class="fa-solid fa-clock-rotate-left"></i> 渲染日志</div>
            <TransitionGroup name="fade" tag="div" class="logs-list">
              <div v-for="(log, i) in store.triggerLogs" :key="log.time + i" class="log-item">
                <span class="l-type" :class="{ mount: log.type.includes('mount'), patch: log.type.includes('patch'), diff: log.type.includes('Diff') }">{{ log.type }}</span>
                <span class="l-detail">{{ log.detail }}</span>
                <span class="l-time">{{ log.time }}</span>
              </div>
            </TransitionGroup>
          </div>
          <div v-else class="logs-empty">步骤 6 解锁交互</div>
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
import { useChapter10Store } from '@/stores/chapter10' // ✅ 删除了不再需要的 computed, ref, watch, nextTick
import { sourceCode } from './data'
// ✅ 引入公共组件
import CodePanel from '@/components/CodePanel.vue'
import StepDesc from '@/components/StepDesc.vue'
const store = useChapter10Store()
// ❌ 删除了原本的 kw, types 数组和 highlight 函数
// ❌ 删除了原本的 highlightedLines 计算属性
// ❌ 删除了原本的 codeRef 和 watch 滚动监听
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
/* 组件树 */
.comp-tree { display: flex; flex-direction: column; align-items: stretch; gap: 0; }
.comp-node { 
  border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 12px;
  background: rgba(7,11,9,0.4); transition: all 0.3s;
}
.comp-node.parent { border-width: 2px; border-color: rgba(245,158,11,0.4); }
.comp-node.parent.updating { border-color: rgba(245,158,11,0.7); box-shadow: 0 0 16px rgba(245,158,11,0.15); }
.comp-node.child { border-color: rgba(96,165,250,0.3); }
.comp-node.child.mounted { border-color: rgba(16,185,129,0.4); }
.comp-node.child.updating { border-color: rgba(139,92,246,0.6); box-shadow: 0 0 16px rgba(139,92,246,0.15); }
.comp-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.comp-icon { width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; }
.parent-icon { background: rgba(245,158,11,0.15); color: #f59e0b; }
.child-icon { background: rgba(96,165,250,0.15); color: #60a5fa; }
.comp-node.child.mounted .child-icon { background: rgba(16,185,129,0.15); color: var(--accent); }
.comp-name { font-family: var(--font-mono); font-size: 0.82rem; font-weight: 700; }
.comp-state { font-family: var(--font-mono); font-size: 0.72rem; display: flex; align-items: center; gap: 4px; padding-left: 32px; }
.state-key { color: var(--muted); }
.state-colon { color: rgba(94,138,118,0.4); }
.state-val { color: #f59e0b; font-weight: 700; }
/* 连接线 */
.tree-connector { display: flex; flex-direction: column; align-items: center; padding: 4px 0; position: relative; }
.connector-line { width: 2px; height: 16px; background: var(--border); }
.connector-props { 
  font-family: var(--font-mono); font-size: 0.6rem; color: var(--muted);
  background: rgba(7,11,9,0.6); padding: 3px 8px; border-radius: 4px; 
  display: flex; align-items: center; gap: 4px; transition: all 0.3s;
}
.connector-props.flowing { color: #8b5cf6; background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.3); }
.connector-props i { font-size: 0.5rem; }
/* 组件实例 */
.instance-box { 
  margin-top: 8px; background: rgba(7,11,9,0.6); border-radius: 6px; padding: 10px;
  border: 1px solid rgba(16,185,129,0.2); 
}
.inst-title { font-family: var(--font-mono); font-size: 0.6rem; font-weight: 700; color: var(--accent); margin-bottom: 8px; letter-spacing: 0.5px; }
.inst-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-bottom: 8px; }
.inst-item { 
  background: rgba(7,11,9,0.5); border-radius: 4px; padding: 4px 6px; 
  font-family: var(--font-mono); font-size: 0.58rem; display: flex; flex-direction: column; gap: 1px;
}
.inst-key { color: var(--muted); }
.inst-val { font-weight: 600; }
.inst-val.accent { color: var(--accent); }
.inst-val.amber { color: #f59e0b; }
.inst-val.muted { color: rgba(94,138,118,0.6); }
.inst-val.green { color: var(--accent); }
.subtree-section { border-top: 1px dashed rgba(94,138,118,0.3); padding-top: 6px; }
.subtree-label { font-family: var(--font-mono); font-size: 0.55rem; color: rgba(94,138,118,0.5); margin-bottom: 4px; }
.subtree-tree { font-family: var(--font-mono); font-size: 0.58rem; color: var(--muted); line-height: 1.5; padding-left: 8px; }
.st-node { color: rgba(96,165,250,0.7); }
.st-children { padding-left: 12px; display: flex; flex-direction: column; gap: 1px; }
.st-node.leaf { color: rgba(94,138,118,0.5); }
.st-bind { color: #f59e0b; font-weight: 600; }
.instance-empty { 
  margin-top: 8px; text-align: center; padding: 12px; 
  color: rgba(94,138,118,0.3); font-size: 0.68rem;
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
/* 操作区 */
.action { display: flex; flex-direction: column; gap: 10px; }
.action-label { font-size: 0.68rem; color: var(--muted); }
.btn-group { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.act-btn {
  padding: 10px; border-radius: var(--radius-sm); border: none; font-weight: 700;
  font-size: 0.75rem; cursor: pointer; display: flex; align-items: center;
  justify-content: center; gap: 6px; transition: all 0.3s; font-family: var(--font-sans); color: white;
}
.act-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.mount-btn { background: linear-gradient(135deg, #059669, #10b981); box-shadow: 0 2px 10px rgba(16,185,129,0.2); }
.mount-btn:hover:not(:disabled) { box-shadow: 0 4px 18px rgba(16,185,129,0.35); transform: translateY(-1px); }
.update-btn { background: linear-gradient(135deg, #7c3aed, #8b5cf6); box-shadow: 0 2px 10px rgba(139,92,246,0.2); }
.update-btn:hover:not(:disabled) { box-shadow: 0 4px 18px rgba(139,92,246,0.35); transform: translateY(-1px); }
.logs-head { font-size: 0.68rem; font-weight: 600; color: var(--muted); display: flex; align-items: center; gap: 4px; margin-bottom: 4px; }
.logs-list { display: flex; flex-direction: column; gap: 3px; max-height: 130px; overflow-y: auto; }
.log-item { background: rgba(7,11,9,0.6); border-radius: 5px; padding: 5px 8px; font-family: var(--font-mono); font-size: 0.6rem; display: flex; align-items: center; gap: 5px; }
.l-type { padding: 1px 4px; border-radius: 3px; font-weight: 600; white-space: nowrap; font-size: 0.55rem; }
.l-type.mount { background: rgba(16,185,129,0.1); color: var(--accent); }
.l-type.patch { background: rgba(139,92,246,0.1); color: #8b5cf6; }
.l-type.diff { background: rgba(239,68,68,0.1); color: var(--crimson); }
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
</style>
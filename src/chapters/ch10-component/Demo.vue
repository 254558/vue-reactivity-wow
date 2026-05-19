<template>
  <div class="demo-layout">
    <div class="main-grid">
      <!-- 左侧列 -->
      <div class="left-col">
        <CodePanel :sourceCode="sourceCode" :activeLines="store.activeLines" filename="mini-vue.js" />
        <StepDesc :step="store.currentStepData" />
      </div>
      <div class="right-col">
        <!-- 组件状态卡片 -->
        <div class="viz-card">
          <div class="viz-head"><i class="fa-solid fa-database"></i><h4>组件状态</h4></div>
          <div class="data-box">
            <div class="d-kw">const parentState = reactive({</div>
            <div class="d-prop">
              <span class="d-key">count</span><span class="d-colon">:</span>
              <Transition name="fade" mode="out-in">
                <span class="d-val" :key="store.parentCount">{{ store.parentCount }}</span>
              </Transition>
            </div>
            <div class="d-kw">})</div>
          </div>
        </div>
        <!-- 组件树与实例卡片 -->
        <div class="viz-card">
          <div class="viz-head"><i class="fa-solid fa-diagram-project"></i><h4>组件树与实例</h4></div>
          <div class="comp-tree">
            <div class="comp-node parent" :class="{ updating: store.isUpdating }">
              <div class="comp-header">
                <div class="comp-icon parent-icon"><i class="fa-solid fa-cube"></i></div>
                <span class="comp-name">ParentComponent</span>
              </div>
              <div class="comp-state">
                <span class="state-key">state.count</span>
                <span class="state-colon">:</span>
                <span class="state-val">{{ store.parentCount }}</span>
              </div>
            </div>
            <div class="tree-connector">
              <div class="connector-line"></div>
              <div class="connector-props" :class="{ flowing: store.isUpdating }">
                <i class="fa-solid fa-arrow-down"></i> props: { title: "{{ store.childPropTitle }}" }
              </div>
              <div class="connector-line"></div>
            </div>
            <div class="comp-node child" :class="{ mounted: store.isMounted, updating: store.isUpdating }">
              <div class="comp-header">
                <div class="comp-icon child-icon"><i class="fa-solid fa-cube"></i></div>
                <span class="comp-name">ChildComponent</span>
              </div>
              <div class="comp-state">
                <span class="state-key">props.title</span>
                <span class="state-colon">:</span>
                <span class="state-val">{{ store.childPropTitle }}</span>
              </div>
              <div class="comp-state" style="margin-top: 2px;">
                <span class="state-key">setupState.count</span>
                <span class="state-colon">:</span>
                <span class="state-val" style="color: var(--accent);">{{ store.childCount }}</span>
              </div>
              <!-- 子组件自身更新按钮 -->
              <button 
                class="child-btn" 
                @click="store.simulateChildUpdate()" 
                :disabled="!store.canInteract || store.isUpdating || !store.isMounted">
                <i class="fa-solid fa-rotate"></i> 触发子组件内部更新
              </button>
            </div>
          </div>
        </div>
        <!-- 操作区 -->
        <div class="viz-card action">
          <div class="btn-group">
            <button class="act-btn mount-btn" @click="store.simulateMount()" :disabled="!store.canMount || store.isMounted">
              <i class="fa-solid fa-play"></i> 挂载组件
            </button>
            <button class="act-btn update-btn" @click="store.simulateParentUpdate()" :disabled="!store.canInteract || store.isUpdating || !store.isMounted">
              <i class="fa-solid fa-pen"></i> 父组件更新
            </button>
          </div>
          <div v-if="store.hasLogs" class="logs">
            <div class="logs-head"><i class="fa-solid fa-clock-rotate-left"></i> 更新日志</div>
            <TransitionGroup name="fade" tag="div" class="logs-list">
              <div v-for="(log, i) in store.triggerLogs" :key="log.time + i" class="log-item">
                <span class="l-type" :class="log.typeClass">{{ log.type }}</span>
                <span class="l-detail">{{ log.detail }}</span>
                <span class="l-time">{{ log.time }}</span>
              </div>
            </TransitionGroup>
          </div>
          <div v-else class="logs-empty">
            {{ store.canMount ? (store.isMounted ? '点击更新按钮触发日志' : '点击挂载组件开始记录') : '完成前置步骤解锁挂载' }}
          </div>
        </div>
      </div>
    </div>
    <!-- 底部控制栏 -->
    <div class="controls">
      <button class="ctrl-btn outline" @click="store.prevStep()" :disabled="store.currentStep <= 1">
        <i class="fa-solid fa-chevron-left"></i> 上一步
      </button>
      <div class="step-tabs">
        <button v-for="(s, i) in store.steps" :key="i" class="s-tab"
          :class="{ current: i + 1 === store.currentStep }"
          :disabled="i + 1 > store.currentStep"
          @click="store.goToStep(i + 1)">{{ s.label }}</button>
      </div>
      <button class="ctrl-btn primary" @click="store.nextStep()" :disabled="store.currentStep >= store.totalSteps">
        <template v-if="store.currentStep < store.totalSteps">下一步 <i class="fa-solid fa-chevron-right"></i></template>
        <template v-else>完成 <i class="fa-solid fa-check"></i></template>
      </button>
    </div>
  </div>
</template>
<script setup>
import { onUnmounted } from 'vue'
import { useChapter10Store } from '@/stores/chapter10' // 确保路径指向你刚创建的 js 文件
import { sourceCode } from './data'
import CodePanel from '@/components/CodePanel.vue'
import StepDesc from '@/components/StepDesc.vue'
const store = useChapter10Store()
onUnmounted(() => {
  store.reset()
})
</script>

<style scoped>
.demo-layout { display: flex; flex-direction: column; gap: 1rem; }
.main-grid { display: grid; grid-template-columns: 1fr 380px; gap: 1.25rem; }
.left-col, .right-col { display: flex; flex-direction: column; gap: 1rem; }
/* 右栏滚动优化 */
.right-col { 
  padding-right: 4px; 
}
/* 组件状态数据展示 */
.data-box {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  padding-left: 8px;
  line-height: 1.6;
}
.d-kw {
  color: var(--muted);
}
.d-prop {
  display: flex;
  align-items: center;
  gap: 4px;
  padding-left: 16px;
}
.d-key {
  color: #60a5fa; /* 蓝色 */
}
.d-colon {
  color: rgba(94,138,118,0.4);
  margin: 0 2px;
}
.d-val {
  color: #f59e0b; /* 琥珀色 */
  font-weight: 700;
  display: inline-block;
  transition: all 0.3s;
}
.logs-list { display: flex; flex-direction: column; gap: 3px; max-height: 180px; overflow-y: auto; }
.logs-list::-webkit-scrollbar { width: 4px; }
.logs-list::-webkit-scrollbar-track { background: transparent; }
.logs-list::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.2); border-radius: 2px; }
.logs-list::-webkit-scrollbar-thumb:hover { background: rgba(16,185,129,0.4); }
/* 可视化卡片 */
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
/* 操作区 */
.action { display: flex; flex-direction: column; gap: 10px; }
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
/* ✅ 补充缺失的子组件内部更新按钮样式 */
.child-btn {
  margin-top: 10px;
  width: 100%;
  padding: 7px;
  border-radius: var(--radius-sm);
  border: 1px dashed rgba(245, 158, 11, 0.4);
  background: rgba(245, 158, 11, 0.08);
  color: #f59e0b;
  font-family: var(--font-mono);
  font-size: 0.65rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: all 0.3s;
}
.child-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.child-btn:hover:not(:disabled) {
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.7);
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.15);
}
/* 日志 */
.logs-head { font-size: 0.68rem; font-weight: 600; color: var(--muted); display: flex; align-items: center; gap: 4px; margin-bottom: 4px; }
.log-item { background: rgba(7,11,9,0.6); border-radius: 5px; padding: 5px 8px; font-family: var(--font-mono); font-size: 0.6rem; display: flex; align-items: center; gap: 5px; }
.l-type { padding: 1px 4px; border-radius: 3px; font-weight: 600; white-space: nowrap; font-size: 0.55rem; }
.l-type.mount { background: rgba(16,185,129,0.1); color: var(--accent); }
.l-type.patch { background: rgba(139,92,246,0.1); color: #8b5cf6; }
.l-type.diff { background: rgba(239,68,68,0.1); color: var(--crimson); }
.l-type.self { background: rgba(245,158,11,0.1); color: #f59e0b; }
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
/* 补充 Fade 过渡动画 */
.fade-enter-active, .fade-leave-active { transition: all 0.3s ease; }
.fade-enter-from { opacity: 0; transform: translateY(-4px); }
.fade-leave-to { opacity: 0; transform: translateY(4px); }
.fade-move { transition: transform 0.3s ease; }
</style>
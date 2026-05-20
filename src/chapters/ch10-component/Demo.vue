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
        <div class="comp-node parent" :class="{ updating: store.isParentUpdating }">
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
          <div class="connector-props" :class="{ flowing: store.isParentUpdating }">
            <i class="fa-solid fa-arrow-down"></i> props: { title: "{{ store.childPropTitle }}" }
          </div>
          <div class="connector-line"></div>
        </div>
        <div class="comp-node child" :class="{ mounted: store.isMounted, updating: store.isParentUpdating || store.isChildUpdating, selfUpdate: store.isChildUpdating }">
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
            :disabled="!store.canUpdate || store.isChildUpdating || !store.isMounted">
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
        <button class="act-btn update-btn" @click="store.simulateParentUpdate()" :disabled="!store.canUpdate || store.isParentUpdating || !store.isMounted">
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
  </DemoLayout>
</template>
<script setup>
import { onUnmounted } from 'vue'
import { useChapter10Store } from '@/stores/chapter10'
import { sourceCode } from './data'
import DemoLayout from '@/components/DemoLayout.vue'

const store = useChapter10Store()
onUnmounted(() => {
  store.reset()
})
</script>

<style scoped>
/* 组件状态数据展示 - 覆盖全局 .data-box */
.data-box {
  background: transparent;
  padding: 0;
  padding-left: 8px;
  font-size: 0.78rem;
  line-height: 1.6;
}
.d-kw { color: var(--muted); }
.d-prop { display: flex; align-items: center; gap: 4px; padding-left: 16px; }
.d-key { color: #60a5fa; }
.d-colon { color: rgba(94,138,118,0.4); margin: 0 2px; }
.d-val { color: #f59e0b; font-weight: 700; display: inline-block; transition: all 0.3s; }
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
.comp-node.child.selfUpdate { border-color: rgba(245,158,11,0.6); box-shadow: 0 0 16px rgba(245,158,11,0.15); }
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
/* 章节特有按钮变体 */
.mount-btn { background: linear-gradient(135deg, #059669, #10b981); box-shadow: 0 2px 10px rgba(16,185,129,0.2); }
.mount-btn:hover:not(:disabled) { box-shadow: 0 4px 18px rgba(16,185,129,0.35); transform: translateY(-1px); }
.update-btn { background: linear-gradient(135deg, #7c3aed, #8b5cf6); box-shadow: 0 2px 10px rgba(139,92,246,0.2); }
.update-btn:hover:not(:disabled) { box-shadow: 0 4px 18px rgba(139,92,246,0.35); transform: translateY(-1px); }
/* 子组件内部更新按钮 */
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
.child-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.child-btn:hover:not(:disabled) {
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.7);
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.15);
}
/* 章节特有日志类型 */
.l-type.mount { background: rgba(16,185,129,0.1); color: var(--accent); }
.l-type.patch { background: rgba(139,92,246,0.1); color: #8b5cf6; }
.l-type.diff { background: rgba(239,68,68,0.1); color: var(--crimson); }
.l-type.self { background: rgba(245,158,11,0.1); color: #f59e0b; }
/* 自定义 fade 过渡 */
.fade-enter-active, .fade-leave-active { transition: all 0.3s ease; }
.fade-enter-from { opacity: 0; transform: translateY(-4px); }
.fade-leave-to { opacity: 0; transform: translateY(4px); }
.fade-move { transition: transform 0.3s ease; }
</style>

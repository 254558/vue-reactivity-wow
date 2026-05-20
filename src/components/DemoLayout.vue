<template>
  <div class="demo-layout">
    <div class="main-grid">
      <div class="left-col">
        <CodePanel :sourceCode="sourceCode" :activeLines="activeLines" :filename="filename" />
        <StepDesc :step="currentStepData" />
      </div>
      <div class="right-col">
        <slot></slot>
      </div>
    </div>
    <div class="controls">
      <button class="ctrl-btn outline" @click="$emit('prev')" :disabled="currentStep <= 1">
        <i class="fa-solid fa-chevron-left"></i> 上一步
      </button>
      <div class="step-tabs">
        <button v-for="(s, i) in steps" :key="i" class="s-tab"
          :class="{ current: i + 1 === currentStep }"
          :disabled="i + 1 > currentStep"
          @click="$emit('goTo', i + 1)">
          {{ s.label }}
        </button>
      </div>
      <button class="ctrl-btn primary" @click="$emit('next')" :disabled="currentStep >= totalSteps">
        <template v-if="currentStep < totalSteps">下一步 <i class="fa-solid fa-chevron-right"></i></template>
        <template v-else>完成 <i class="fa-solid fa-check"></i></template>
      </button>
    </div>
  </div>
</template>

<script setup>
import CodePanel from '@/components/CodePanel.vue'
import StepDesc from '@/components/StepDesc.vue'

defineProps({
  sourceCode: String,
  activeLines: { type: Array, default: () => [] },
  filename: { type: String, default: 'index.js' },
  steps: { type: Array, required: true },
  currentStep: { type: Number, required: true },
  totalSteps: { type: Number, required: true },
  currentStepData: Object,
})

defineEmits(['prev', 'next', 'goTo'])
</script>

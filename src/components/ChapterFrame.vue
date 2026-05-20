<template>
  <iframe :src="pageUrl" class="debugger-frame" title="Vue 原理 Debugger"></iframe>
</template>

<script setup>
defineProps({
  pageUrl: { type: String, required: true }
})
</script>

<style scoped>
.debugger-frame {
  width: 100%;
  height: calc(100vh - 120px);
  border: none;
  border-radius: 12px;
  background: #070b09;
}
</style>

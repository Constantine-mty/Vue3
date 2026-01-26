<template>
  <div class="text-block" :class="{ multiLine: text.includes('\n') }">
    {{ text }}
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.text-block {
  font-size: 15px;
  line-height: 1.8;
  color: #606266;
  padding: 16px 20px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #667eea;
  margin: 15px 0;
}

.multiLine {
  white-space: pre-line;
}
</style>

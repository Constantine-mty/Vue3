<template>
  <div class="image-caption" :class="{ multiLine: text.includes('\n') }">
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
.image-caption {
  font-size: 12px;
  line-height: 1.6;
  color: #909399;
  margin: 10px 0;
  padding: 8px 12px;
  background-color: #fafafa;
  border-radius: 4px;
}

.multiLine {
  text-align: left !important;
  white-space: pre-line;
}
</style>

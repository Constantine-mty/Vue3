<template>
  <div class="image-gallery">
    <div
      v-for="(section, sectionIndex) in imageSections"
      :key="sectionIndex"
      class="section-block"
    >
      <h3 class="section-title">{{ section.title }}</h3>

      <!-- Section级别文本框（可选） -->
      <div v-if="section.description" class="section-description">
        {{ section.description }}
      </div>

      <el-row :gutter="20">
        <el-col
          v-for="(imageGroup, groupIndex) in section.imageGroups"
          :key="groupIndex"
          :xs="24"
          :sm="24"
          :md="12"
          :lg="12"
        >
          <el-card class="image-group-card" shadow="hover">
            <div class="image-group-header">
              {{ imageGroup.groupTitle }}
            </div>
            <div class="image-group-content">
              <el-tabs v-model="imageGroup.activeTab" type="card">
                <el-tab-pane
                  v-for="(image, imageIndex) in imageGroup.images"
                  :key="imageIndex"
                  :label="image.tabLabel"
                  :name="image.tabName"
                >
                  <div class="image-wrapper">
                    <el-image
                      :src="image.url"
                      :alt="image.title"
                      fit="contain"
                      :preview-src-list="imageGroup.images.map(img => img.url)"
                      :initial-index="imageIndex"
                    >
                      <template #error>
                        <div class="image-error">
                          <el-icon><Picture /></el-icon>
                          <span>图片加载失败</span>
                        </div>
                      </template>
                    </el-image>
                  </div>
                  <div class="image-title">{{ image.title }}</div>
                </el-tab-pane>
              </el-tabs>

              <!-- 图片组下方图注 -->
              <div v-if="imageGroup.caption" class="image-group-caption" :class="{ multiLine: imageGroup.caption.includes('\n') }">
                {{ imageGroup.caption }}
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { Picture } from '@element-plus/icons-vue'

defineProps({
  imageSections: {
    type: Array,
    required: true
  }
})
</script>

<style scoped>
.image-gallery {
  padding: 10px 0;
}

.section-block {
  margin-bottom: 40px;
}

.section-title {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #667eea;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.section-description {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f0f4ff;
  border-left: 4px solid #667eea;
  border-radius: 4px;
  font-size: 15px;
  line-height: 1.8;
  color: #606266;
}

.image-group-card {
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
}

.image-group-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 20px;
  font-size: 15px;
  font-weight: 500;
}

.image-group-content {
  padding: 10px;
}

.image-wrapper {
  width: 100%;
  height: 400px;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  margin-bottom: 10px;
}

.image-wrapper :deep(.el-image) {
  width: 100%;
  height: 100%;
}

.image-wrapper :deep(.el-image__inner) {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 15px;
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  gap: 8px;
}

.image-error span {
  font-size: 14px;
}

.image-title {
  text-align: center;
  font-size: 14px;
  color: #303133;
  font-weight: 500;
  padding: 8px;
  background-color: #f9fafc;
  border-radius: 4px;
}

/* 图片组下方图注 */
.image-group-caption {
  font-size: 12px;
  line-height: 1.6;
  color: #909399;
  margin-top: 15px;
  padding: 8px 12px;
  background-color: #fafafa;
  border-radius: 4px;
}

/* 多行图注左对齐 */
.multiLine {
  text-align: left !important;
  white-space: pre-line;
}

:deep(.el-tabs__header) {
  margin-bottom: 15px;
}

:deep(.el-tabs__content) {
  background-color: white;
}
</style>

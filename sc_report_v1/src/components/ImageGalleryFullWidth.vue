<template>
  <div class="image-gallery-fullwidth">
    <div
      v-for="(section, sectionIndex) in imageSections"
      :key="sectionIndex"
      class="section-block"
    >
      <h3 class="section-title">{{ section.title }}</h3>

      <el-row :gutter="20">
        <el-col
          v-for="(imageGroup, groupIndex) in section.imageGroups"
          :key="groupIndex"
          :xs="24"
          :sm="24"
          :md="24"
          :lg="24"
        >
          <el-card class="image-group-card" shadow="hover">
            <div class="image-group-header">
              {{ imageGroup.groupTitle }}
            </div>
            <div class="image-group-content">
              <!-- 搜索框 -->
              <div class="search-box">
                <el-input
                  v-model="imageGroup.searchText"
                  placeholder="搜索图片名称..."
                  clearable
                  @input="handleSearch(groupIndex)"
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
              </div>

              <!-- 左侧选择 + 右侧图片 -->
              <div class="image-display-container">
                <!-- 左侧选择列表 -->
                <div class="image-selector">
                  <div
                    v-for="(image, imageIndex) in getFilteredImages(imageGroup)"
                    :key="imageIndex"
                    class="image-selector-item"
                    :class="{ active: imageGroup.activeTab === image.tabName }"
                    @click="imageGroup.activeTab = image.tabName"
                  >
                    <div class="selector-icon">
                      <el-icon><Picture /></el-icon>
                    </div>
                    <span class="selector-text">{{ image.tabLabel }}</span>
                  </div>
                  <div v-if="getFilteredImages(imageGroup).length === 0" class="no-result">
                    未找到匹配的图片
                  </div>
                </div>

                <!-- 右侧图片展示 -->
                <div class="image-display-area">
                  <div class="image-wrapper">
                    <el-image
                      :src="currentImage(imageGroup)?.url"
                      :alt="currentImage(imageGroup)?.title"
                      fit="contain"
                      :preview-src-list="getFilteredImages(imageGroup).map(img => img.url)"
                      :initial-index="getFilteredImages(imageGroup).findIndex(img => img.tabName === imageGroup.activeTab)"
                    >
                      <template #error>
                        <div class="image-error">
                          <el-icon><Picture /></el-icon>
                          <span>图片加载失败</span>
                        </div>
                      </template>
                    </el-image>
                  </div>
                  <div class="image-title">{{ currentImage(imageGroup)?.title }}</div>
                </div>
              </div>

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
import { Picture, Search } from '@element-plus/icons-vue'

const props = defineProps({
  imageSections: {
    type: Array,
    required: true
  }
})

// 获取当前选中的图片
const currentImage = (imageGroup) => {
  return imageGroup.images.find(img => img.tabName === imageGroup.activeTab)
}

// 获取过滤后的图片列表
const getFilteredImages = (imageGroup) => {
  if (!imageGroup.searchText || imageGroup.searchText.trim() === '') {
    return imageGroup.images
  }

  const search = imageGroup.searchText.toLowerCase().trim()
  return imageGroup.images.filter(img =>
    img.tabLabel.toLowerCase().includes(search) ||
    img.title.toLowerCase().includes(search)
  )
}

// 搜索处理
const handleSearch = (groupIndex) => {
  const imageGroup = props.imageSections[groupIndex]
  const filtered = getFilteredImages(imageGroup)

  // 如果当前选中的不在过滤结果中,选择第一个
  if (filtered.length > 0 && !filtered.find(img => img.tabName === imageGroup.activeTab)) {
    imageGroup.activeTab = filtered[0].tabName
  }
}
</script>

<style scoped>
.image-gallery-fullwidth {
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

.image-group-card {
  margin-bottom: 20px;
  border-radius: 12px;
  overflow: hidden;
  border: none;
}

.image-group-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.image-group-content {
  padding: 20px;
}

.search-box {
  margin-bottom: 20px;
}

.search-box :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.search-box :deep(.el-input__wrapper):hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.image-display-container {
  display: flex;
  gap: 20px;
  min-height: 450px;
}

.image-selector {
  width: 220px;
  overflow-y: auto;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 10px;
  max-height: 500px;
}

.image-selector::-webkit-scrollbar {
  width: 6px;
}

.image-selector::-webkit-scrollbar-track {
  background: #e9ecef;
}

.image-selector::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
}

.image-selector-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.image-selector-item:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  transform: translateX(4px);
}

.image-selector-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.selector-icon {
  font-size: 18px;
  margin-right: 10px;
  flex-shrink: 0;
}

.selector-text {
  font-size: 14px;
  font-weight: 500;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.no-result {
  text-align: center;
  padding: 30px;
  color: #999;
  font-size: 14px;
}

.image-display-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.image-wrapper {
  width: 100%;
  height: 420px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #e8eaed;
}

.image-wrapper :deep(.el-image) {
  width: 100%;
  height: 100%;
}

.image-wrapper :deep(.el-image__inner) {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 20px;
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  gap: 12px;
}

.image-error span {
  font-size: 15px;
}

.image-title {
  text-align: center;
  font-size: 15px;
  color: #303133;
  font-weight: 600;
  padding: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 8px;
  margin-top: 15px;
  border: 1px solid #e8eaed;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .image-display-container {
    flex-direction: column;
  }

  .image-selector {
    width: 100%;
    max-height: 150px;
  }

  .image-wrapper {
    height: 300px;
  }
}
</style>

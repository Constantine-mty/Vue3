<template>
  <div class="app-container">
    <!-- 顶部标题栏 -->
    <div class="top-bar">
      <h1>单细胞转录组分析报告</h1>
    </div>

    <div class="main-content">
      <!-- 左侧导航 -->
      <SideMenu
        :menu-data="menuData"
        :active-section="activeSection"
        @menu-select="handleMenuSelect"
      />

      <!-- 右侧内容区域 - 全部显示 -->
      <div class="content-area" id="content-area">
        <!-- 01.load 模块 -->
        <section id="section-01-load" class="report-section">
          <h2>01. 数据加载</h2>
          <ImageGallery :image-sections="loadImageSections" />
        </section>

        <!-- 02.qc 模块 -->
        <section id="section-02-qc" class="report-section">
          <h2>02. 质量控制</h2>
          <ImageGallery :image-sections="qcImageSections" />
        </section>

        <!-- 03.integrate 模块 -->
        <section id="section-03-integrate" class="report-section">
          <h2>03. 数据整合</h2>
          <ImageGallery :image-sections="integrateImageSections" />
        </section>

        <!-- 04.prediction 模块 -->
        <section id="section-04-prediction" class="report-section">
          <h2>04. 细胞预测</h2>
          <ImageGallery :image-sections="predictionImageSections" />
        </section>

        <!-- 05.annotation 模块 -->
        <section id="section-05-annotation-umap" class="report-section">
          <h2>05. 细胞注释</h2>

          <!-- 图片部分 - 使用全宽组件 -->
          <div class="subsection" id="section-05-annotation-umap-content">
            <h3>5.1 UMAP可视化</h3>
            <ImageGalleryFullWidth :image-sections="annotationUMAPSections" />
          </div>

          <div class="subsection" id="section-05-annotation-cluster">
            <h3>5.2 聚类Marker分析</h3>
            <ImageGalleryFullWidth :image-sections="annotationClusterSections" />
          </div>

          <div class="subsection" id="section-05-annotation-heatmap">
            <h3>5.3 Marker基因热图</h3>
            <ImageGallery :image-sections="annotationHeatmapSections" />
          </div>

          <div class="subsection" id="section-05-annotation-other">
            <h3>5.4 其他分析</h3>
            <ImageGallery :image-sections="annotationOtherSections" />
          </div>

          <!-- 表格部分 -->
          <div class="subsection" id="section-05-annotation-table">
            <h3>5.5 Marker基因表</h3>
            <DataTable csv-path="/src/assets/05.annotation/csv/Scanpy_markers_per_cluster.csv" />
          </div>
        </section>

        <!-- 06.compositional 模块 -->
        <section id="section-06-compositional" class="report-section">
          <h2>06. 组成分析</h2>
          <ImageGallery :image-sections="compositionalSections" />
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import SideMenu from './components/SideMenu.vue'
import ImageGallery from './components/ImageGallery.vue'
import ImageGalleryFullWidth from './components/ImageGalleryFullWidth.vue'
import DataTable from './components/DataTable.vue'
import {
  loadLoadImages,
  loadQCImages,
  loadIntegrateImages,
  loadPredictionImages,
  loadAnnotationImages,
  loadCompositionalImages
} from './utils/assetLoader.js'

// 菜单数据(按01-05模块组织,包含h3子章节)
const menuData = ref([
  {
    id: '01-load',
    title: '01. 数据加载',
    items: [
      { id: 'section-01-load', title: '数据加载' }
    ]
  },
  {
    id: '02-qc',
    title: '02. 质量控制',
    items: [
      { id: 'section-02-qc', title: '质量控制' }
    ]
  },
  {
    id: '03-integrate',
    title: '03. 数据整合',
    items: [
      { id: 'section-03-integrate', title: '数据整合' }
    ]
  },
  {
    id: '04-prediction',
    title: '04. 细胞预测',
    items: [
      { id: 'section-04-prediction', title: '细胞预测' }
    ]
  },
  {
    id: '05-annotation',
    title: '05. 细胞注释',
    items: [
      { id: 'section-05-annotation-umap', title: '5.1 UMAP可视化' },
      { id: 'section-05-annotation-cluster', title: '5.2 聚类Marker分析' },
      { id: 'section-05-annotation-heatmap', title: '5.3 Marker基因热图' },
      { id: 'section-05-annotation-other', title: '5.4 其他分析' },
      { id: 'section-05-annotation-table', title: '5.5 Marker基因表' }
    ]
  },
  {
    id: '06-compositional',
    title: '06. 组成分析',
    items: [
      { id: 'section-06-compositional', title: '组成分析' }
    ]
  }
])

// 当前激活的章节
const activeSection = ref('')

// 菜单选择处理
const handleMenuSelect = (sectionId) => {
  console.log('Menu select:', sectionId)
  activeSection.value = sectionId
  const element = document.getElementById(sectionId)
  const contentArea = document.getElementById('content-area')

  if (element && contentArea) {
    // 计算元素相对于content-area的位置
    const contentAreaRect = contentArea.getBoundingClientRect()
    const elementRect = element.getBoundingClientRect()
    const relativeTop = elementRect.top - contentAreaRect.top

    contentArea.scrollTo({
      top: contentArea.scrollTop + relativeTop - 20,
      behavior: 'smooth'
    })
  } else {
    console.log('Element not found:', sectionId)
  }
}

// 监听滚动,自动更新菜单激活状态
let scrollHandler = null
let scrollTimeout = null

onMounted(() => {
  const contentArea = document.getElementById('content-area')

  scrollHandler = () => {
    // 使用防抖提高性能
    if (scrollTimeout) {
      clearTimeout(scrollTimeout)
    }

    scrollTimeout = setTimeout(() => {
      const sections = document.querySelectorAll('.report-section')
      const subsections = document.querySelectorAll('.subsection')

      let maxVisibility = 0
      let bestSection = ''

      if (contentArea) {
        const viewportHeight = contentArea.clientHeight

        // 优先检查subsection
        subsections.forEach(sub => {
          if (!sub.id) return
          const rect = sub.getBoundingClientRect()

          // 检查元素是否在视口内
          const visibleTop = Math.max(rect.top, 0)
          const visibleBottom = Math.min(rect.bottom, viewportHeight)
          const visibleHeight = Math.max(0, visibleBottom - visibleTop)

          if (visibleHeight > 50) {
            const visibility = visibleHeight / rect.height
            if (visibility > maxVisibility) {
              maxVisibility = visibility
              bestSection = sub.id
            }
          }
        })

        // 如果subsection可见性不够,检查section
        if (maxVisibility < 0.2) {
          sections.forEach(section => {
            const rect = section.getBoundingClientRect()
            const visibleTop = Math.max(rect.top, 0)
            const visibleBottom = Math.min(rect.bottom, viewportHeight)
            const visibleHeight = Math.max(0, visibleBottom - visibleTop)

            if (visibleHeight > 50) {
              const visibility = visibleHeight / rect.height
              if (visibility > maxVisibility) {
                maxVisibility = visibility
                bestSection = section.id
              }
            }
          })
        }

        if (bestSection) {
          activeSection.value = bestSection
        }
      }
    }, 30) // 30ms延迟
  }

  contentArea.addEventListener('scroll', scrollHandler, { passive: true })
})

onUnmounted(() => {
  if (scrollHandler) {
    window.removeEventListener('scroll', scrollHandler)
  }
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }
})

// ============== 动态加载图片数据 ==============
// 01.load 图片数据
const loadData = loadLoadImages()
const loadImageSections = ref(loadData.sections)

// 02.qc 图片数据
const qcData = loadQCImages()
const qcImageSections = ref(qcData.sections)

// 03.integrate 图片数据
const integrateData = loadIntegrateImages()
const integrateImageSections = ref(integrateData.sections)

// 04.prediction 图片数据 (保持静态)
const predictionData = loadPredictionImages()
const predictionImageSections = ref(predictionData.sections)

// 05.annotation 图片数据
const annotationData = loadAnnotationImages()
const annotationUMAPSections = ref(annotationData.umapSections)
const annotationClusterSections = ref(annotationData.clusterSections)

// 热图和其他分析数据已经在 assetLoader.js 中组织好了
const annotationHeatmapSections = ref(annotationData.heatmapSections)
const annotationOtherSections = ref(annotationData.otherSections)

// 06.compositional 图片数据
const compositionalData = loadCompositionalImages()
const compositionalSections = ref(compositionalData.sections)
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.top-bar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.top-bar h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 500;
}

.main-content {
  display: flex;
}

.content-area {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
  max-height: calc(100vh - 80px);
  scroll-behavior: smooth;
  position: relative;
}

.report-section {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 30px;
}

.report-section h2 {
  margin-top: 0;
  margin-bottom: 30px;
  color: #303133;
  font-size: 22px;
  font-weight: 600;
  border-bottom: 3px solid #667eea;
  padding-bottom: 15px;
}

.subsection {
  margin: 40px 0;
  padding: 20px;
  background-color: #fafafa;
  border-radius: 6px;
  border-left: 4px solid #667eea;
}

.subsection h3 {
  margin-top: 0;
  margin-bottom: 25px;
  color: #409eff;
  font-size: 18px;
  font-weight: 600;
}

.subsection > :first-child {
  margin-top: 0;
}
</style>

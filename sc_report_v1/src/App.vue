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
          <TextBlock text="此处展示数据加载阶段的可视化结果，包括各样本的原始数据分布情况。通过这些图表可以了解数据集的基本特征。" />
          <ImageGallery :image-sections="loadImageSections" />
          <TextBlock text="数据加载是单细胞分析的第一步，需要确保数据格式正确、样本信息完整。" />
        </section>

        <!-- 02.qc 模块 -->
        <section id="section-02-qc" class="report-section">
          <h2>02. 质量控制</h2>
          <TextBlock text="质量控制是单细胞分析的关键步骤，通过检测基因数、线粒体基因比例等指标，识别并过滤低质量细胞。" />
          <ImageGallery :image-sections="qcImageSections" />
          <TextBlock text="质量控制过滤后，细胞质量得到显著提升，为后续分析奠定基础。" />

          <!-- CSV 文件展示 - 分开两个独立的 subsection -->
          <div v-if="qcCSVData.csvFiles.length > 0 && qcCSVData.csvFiles[0]" class="subsection" id="section-02-qc-csv-1">
            <h3>{{ qcCSVData.csvFiles[0].title }}</h3>
            <TextBlock text="该表格展示了质量控制前后各样本的细胞数量变化情况，包括过滤前的原始细胞数和过滤后的高质量细胞数。" />
            <DataTable :csv-path="qcCSVData.csvFiles[0].url" caption="表注：QC前表示过滤前的细胞数，QC后表示过滤后的细胞数。" />
          </div>

          <div v-if="qcCSVData.csvFiles.length > 1 && qcCSVData.csvFiles[1]" class="subsection" id="section-02-qc-csv-2">
            <h3>{{ qcCSVData.csvFiles[1].title }}</h3>
            <TextBlock text="该表格展示了各样本的双细胞率检测结果，双细胞是指多个细胞被错误地识别为单个细胞的情况。" />
            <DataTable :csv-path="qcCSVData.csvFiles[1].url" caption="表注：双细胞率是检测到的双细胞数量占总细胞数的比例。" />
          </div>
        </section>

        <!-- 03.integrate 模块 -->
        <section id="section-03-integrate" class="report-section">
          <h2>03. 数据整合</h2>
          <TextBlock text="数据整合旨在消除批次效应，使不同样本的细胞能够在同一空间中正确比较和聚类。" />
          <ImageGallery :image-sections="integrateImageSections" />
          <TextBlock text="通过多种整合方法（如BBKNN、Harmony、Scanorama等），可以有效去除批次间差异，保留生物学变异。" />
        </section>

        <!-- 04.prediction 模块 -->
        <section id="section-04-prediction" class="report-section">
          <h2>04. 细胞预测</h2>
          <TextBlock text="细胞预测利用已建立的细胞类型参考数据库，自动识别每个细胞的潜在类型，为后续注释提供重要参考。" />
          <ImageGallery :image-sections="predictionImageSections" />
          <TextBlock text="CellTypist、SCimilarity、starCAT等方法各有优势，综合多种预测结果可以提高注释准确性。" />
        </section>

        <!-- 05.annotation 模块 -->
        <section id="section-05-annotation-umap" class="report-section">
          <h2>05. 细胞注释</h2>
          <TextBlock text="细胞注释是单细胞分析的核心环节，通过Marker基因表达模式为每个细胞簇赋予生物学意义。" />

          <!-- 图片部分 - 使用全宽组件 -->
          <div class="subsection" id="section-05-annotation-umap-content">
            <h3>5.1 UMAP可视化</h3>
            <TextBlock text="UMAP（Uniform Manifold Approximation and Projection）是一种非线性降维方法，能够很好地展示高维数据在低维空间中的分布。" />
            <ImageGalleryFullWidth :image-sections="annotationUMAPSections" />
            <TextBlock text="通过UMAP可视化，可以直观地观察细胞类型的空间分布和聚类效果。" />
          </div>

          <div class="subsection" id="section-05-annotation-cluster">
            <h3>5.2 聚类Marker分析</h3>
            <TextBlock text="Marker基因是在特定细胞簇中高表达且在其他簇中低表达的基因，是细胞注释的重要依据。" />
            <ImageGalleryFullWidth :image-sections="annotationClusterSections" />
            <TextBlock text="Top9 Marker展示了每个细胞簇中表达量最高的9个特征基因。" />
          </div>

          <div class="subsection" id="section-05-annotation-heatmap">
            <h3>5.3 Marker基因热图</h3>
            <TextBlock text="热图能够同时展示多个基因在多个细胞簇中的表达水平，颜色深浅代表表达量高低。" />
            <ImageGallery :image-sections="annotationHeatmapSections" />
            <TextBlock text="通过热图可以快速识别细胞类型的特异性Marker基因组合。" />
          </div>

          <div class="subsection" id="section-05-annotation-other">
            <h3>5.4 其他分析</h3>
            <TextBlock text="点图和相关分析提供了Marker基因表达分布的更多细节信息。" />
            <ImageGallery :image-sections="annotationOtherSections" />
            <TextBlock text="这些补充分析有助于验证细胞注释的可靠性。" />
          </div>

          <!-- 表格部分 -->
          <div class="subsection" id="section-05-annotation-table">
            <h3>5.5 Marker基因表</h3>
            <TextBlock text="该表格详细列出了每个细胞簇的Marker基因信息，包括基因名称、表达量、统计显著性等指标。" />
            <DataTable csv-path="/src/assets/05.annotation/csv/Scanpy_markers_per_cluster.csv" caption="表注：p_val_adj表示校正后的p值，logFC表示对数 fold change。" />
          </div>
        </section>

        <!-- 06.compositional 模块 -->
        <section id="section-06-compositional" class="report-section">
          <h2>06. 组成分析</h2>
          <TextBlock text="组成分析关注不同样本、簇或细胞类型之间的比例关系，揭示样本间或条件下的细胞组成差异。" />
          <ImageGallery :image-sections="compositionalSections" />
          <TextBlock text="通过组成分析，可以发现样本间细胞类型的富集或缺失情况，为理解生物学差异提供线索。" />
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
import TextBlock from './components/TextBlock.vue'
import {
  loadLoadImages,
  loadQCImages,
  loadQCAnnotationCSV,
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
      { id: 'section-02-qc', title: '质量控制' },
      { id: 'section-02-qc-csv-1', title: 'cell_number_before_after_QC' },
      { id: 'section-02-qc-csv-2', title: 'doublets_rate' }
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
// 02.qc CSV 数据
const qcCSVData = loadQCAnnotationCSV()

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

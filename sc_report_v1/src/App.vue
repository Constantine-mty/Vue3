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
        const scrollTop = contentArea.scrollTop
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

// ============== 01.load 图片数据 ==============
const loadImageSections = ref([
  {
    title: '数据加载',
    imageGroups: [
      {
        groupTitle: '待补充',
        activeTab: 'default',
        images: [
          { tabLabel: '图片1', tabName: 'default', title: '待补充 - 图片1', url: '/src/assets/img/test1.png' },
        ]
      }
    ]
  }
])

// ============== 02.qc 图片数据 ==============
const qcImageSections = ref([
  {
    title: '基因数分布',
    imageGroups: [
      {
        groupTitle: '各样本基因数散点图',
        activeTab: 'sample1',
        images: [
          { tabLabel: 'Sample1', tabName: 'sample1', title: 'Sample1 基因数', url: '/src/assets/02.qc/figures/sample1/sample1_scatter_genes.png' },
          { tabLabel: 'Sample2', tabName: 'sample2', title: 'Sample2 基因数', url: '/src/assets/02.qc/figures/sample2/sample2_scatter_genes.png' },
          { tabLabel: 'Sample3', tabName: 'sample3', title: 'Sample3 基因数', url: '/src/assets/02.qc/figures/sample3/sample3_scatter_genes.png' },
          { tabLabel: 'Sample4', tabName: 'sample4', title: 'Sample4 基因数', url: '/src/assets/02.qc/figures/sample4/sample4_scatter_genes.png' },
          { tabLabel: 'Sample5', tabName: 'sample5', title: 'Sample5 基因数', url: '/src/assets/02.qc/figures/sample5/sample5_scatter_genes.png' },
          { tabLabel: 'Sample6', tabName: 'sample6', title: 'Sample6 基因数', url: '/src/assets/02.qc/figures/sample6/sample6_scatter_genes.png' },
        ]
      }
    ]
  },
  {
    title: '线粒体基因比例',
    imageGroups: [
      {
        groupTitle: '各样本线粒体基因比例',
        activeTab: 'sample1_mt',
        images: [
          { tabLabel: 'Sample1', tabName: 'sample1_mt', title: 'Sample1 线粒体基因', url: '/src/assets/02.qc/figures/sample1/sample1_scatter_mt.png' },
          { tabLabel: 'Sample2', tabName: 'sample2_mt', title: 'Sample2 线粒体基因', url: '/src/assets/02.qc/figures/sample2/sample2_scatter_mt.png' },
          { tabLabel: 'Sample3', tabName: 'sample3_mt', title: 'Sample3 线粒体基因', url: '/src/assets/02.qc/figures/sample3/sample3_scatter_mt.png' },
          { tabLabel: 'Sample4', tabName: 'sample4_mt', title: 'Sample4 线粒体基因', url: '/src/assets/02.qc/figures/sample4/sample4_scatter_mt.png' },
          { tabLabel: 'Sample5', tabName: 'sample5_mt', title: 'Sample5 线粒体基因', url: '/src/assets/02.qc/figures/sample5/sample5_scatter_mt.png' },
          { tabLabel: 'Sample6', tabName: 'sample6_mt', title: 'Sample6 线粒体基因', url: '/src/assets/02.qc/figures/sample6/sample6_scatter_mt.png' },
        ]
      }
    ]
  },
  {
    title: '质量控制过滤',
    imageGroups: [
      {
        groupTitle: 'MAD方法过滤',
        activeTab: 'mad_sample1',
        images: [
          { tabLabel: 'Sample1', tabName: 'mad_sample1', title: 'Sample1 MAD过滤', url: '/src/assets/02.qc/figures/sample1/mad_sample1_scatter_Filter.png' },
          { tabLabel: 'Sample2', tabName: 'mad_sample2', title: 'Sample2 MAD过滤', url: '/src/assets/02.qc/figures/sample2/mad_sample2_scatter_Filter.png' },
          { tabLabel: 'Sample3', tabName: 'mad_sample3', title: 'Sample3 MAD过滤', url: '/src/assets/02.qc/figures/sample3/mad_sample3_scatter_Filter.png' },
        ]
      },
      {
        groupTitle: '手动过滤',
        activeTab: 'manual_sample1',
        images: [
          { tabLabel: 'Sample1', tabName: 'manual_sample1', title: 'Sample1 手动过滤', url: '/src/assets/02.qc/figures/sample1/manual_sample1_scatter_Filter.png' },
          { tabLabel: 'Sample2', tabName: 'manual_sample2', title: 'Sample2 手动过滤', url: '/src/assets/02.qc/figures/sample2/manual_sample2_scatter_Filter.png' },
          { tabLabel: 'Sample3', tabName: 'manual_sample3', title: 'Sample3 手动过滤', url: '/src/assets/02.qc/figures/sample3/manual_sample3_scatter_Filter.png' },
        ]
      }
    ]
  }
])

// ============== 03.integrate 图片数据 ==============
const integrateImageSections = ref([
  {
    title: 'HVG选择',
    imageGroups: [
      {
        groupTitle: '高变基因分析',
        activeTab: 'hvg_scatter',
        images: [
          { tabLabel: '散点图', tabName: 'hvg_scatter', title: 'HVG散点图', url: '/src/assets/03.integrate/figures/3.1.scatter_hvg.png' },
          { tabLabel: '小提琴图-基因数', tabName: 'violin_genes', title: '基因数分布', url: '/src/assets/03.integrate/figures/3.1.violin_n_genes_by_counts.png' },
          { tabLabel: '小提琴图-线粒体', tabName: 'violin_mt', title: '线粒体比例分布', url: '/src/assets/03.integrate/figures/3.1.violin_pct_counts_mt.png' },
        ]
      }
    ]
  },
  {
    title: '批次效应校正',
    imageGroups: [
      {
        groupTitle: 'UMAP整合结果',
        activeTab: 'harmony_umap',
        images: [
          { tabLabel: 'Harmony UMAP', tabName: 'harmony_umap', title: 'Harmony整合UMAP', url: '/src/assets/03.integrate/figures/3.4.umap_harmony.png' },
        ]
      },
      {
        groupTitle: '基因重叠分析',
        activeTab: 'upset',
        images: [
          { tabLabel: 'Upset图', tabName: 'upset', title: '批次间基因重叠', url: '/src/assets/03.integrate/figures/3.0.upset_gene_overlap.png' },
        ]
      }
    ]
  }
])

// ============== 04.prediction 图片数据 ==============
const predictionImageSections = ref([
  {
    title: 'CellTypist预测',
    imageGroups: [
      {
        groupTitle: 'CellTypist预测结果',
        activeTab: 'default',
        images: [
          { tabLabel: '待补充', tabName: 'default', title: 'CellTypist预测结果', url: '/src/assets/img/test1.png' },
        ]
      }
    ]
  },
  {
    title: 'SCimilarity预测',
    imageGroups: [
      {
        groupTitle: 'SCimilarity预测结果',
        activeTab: 'default',
        images: [
          { tabLabel: '待补充', tabName: 'default', title: 'SCimilarity预测结果', url: '/src/assets/img/test1.png' },
        ]
      }
    ]
  },
  {
    title: 'starCAT预测',
    imageGroups: [
      {
        groupTitle: 'starCAT预测结果',
        activeTab: 'default',
        images: [
          { tabLabel: '待补充', tabName: 'default', title: 'starCAT预测结果', url: '/src/assets/img/test1.png' },
        ]
      }
    ]
  }
])

// ============== 05.annotation 图片数据 ==============
// 5.1 UMAP可视化
const annotationUMAPSections = ref([
  {
    title: '细胞类型Marker',
    imageGroups: [
      {
        groupTitle: '各细胞类型Marker基因',
        activeTab: 'Epithelial',
        images: [
          { tabLabel: '上皮细胞', tabName: 'Epithelial', title: '上皮细胞Marker', url: '/src/assets/05.annotation/figures/umap_Epithelial_marker.png' },
          { tabLabel: '免疫细胞', tabName: 'Immune', title: '免疫细胞Marker', url: '/src/assets/05.annotation/figures/umap_Immune_marker.png' },
          { tabLabel: 'T细胞', tabName: 'T', title: 'T细胞Marker', url: '/src/assets/05.annotation/figures/umap_T_marker.png' },
          { tabLabel: 'B细胞', tabName: 'B', title: 'B细胞Marker', url: '/src/assets/05.annotation/figures/umap_B_marker.png' },
          { tabLabel: '髓系细胞', tabName: 'Myeloid', title: '髓系细胞Marker', url: '/src/assets/05.annotation/figures/umap_Myeloid_marker.png' },
          { tabLabel: 'DC细胞', tabName: 'DC', title: 'DC细胞Marker', url: '/src/assets/05.annotation/figures/umap_DC_marker.png' },
          { tabLabel: 'NK细胞', tabName: 'NK', title: 'NK细胞Marker', url: '/src/assets/05.annotation/figures/umap_NK_marker.png' },
          { tabLabel: '内皮细胞', tabName: 'Endothelial', title: '内皮细胞Marker', url: '/src/assets/05.annotation/figures/umap_Endothelial_marker.png' },
          { tabLabel: '平滑肌细胞', tabName: 'Sooth_muscle', title: '平滑肌细胞Marker', url: '/src/assets/05.annotation/figures/umap_Sooth_muscle_cell_marker.png' },
          { tabLabel: '成纤维细胞', tabName: 'Fibroblast', title: '成纤维细胞Marker', url: '/src/assets/05.annotation/figures/umap_Fibroblast_marker.png' },
          { tabLabel: '周细胞', tabName: 'Pericyte', title: '周细胞Marker', url: '/src/assets/05.annotation/figures/umap_Pericyte_marker.png' },
          { tabLabel: '肥大细胞', tabName: 'Mast', title: '肥大细胞Marker', url: '/src/assets/05.annotation/figures/umap_Mast_marker.png' },
          { tabLabel: '巨核细胞', tabName: 'Megakaryocyte', title: '巨核细胞Marker', url: '/src/assets/05.annotation/figures/umap_Megakaryocyte_marker.png' },
          { tabLabel: '浆细胞', tabName: 'Plasma', title: '浆细胞Marker', url: '/src/assets/05.annotation/figures/umap_Plasma_marker.png' },
          { tabLabel: '中性粒细胞', tabName: 'Neutrophils', title: '中性粒细胞Marker', url: '/src/assets/05.annotation/figures/umap_Neutrophils_marker.png' },
          { tabLabel: '增殖细胞', tabName: 'Prolifertive', title: '增殖细胞Marker', url: '/src/assets/05.annotation/figures/umap_Prolifertive_marker.png' },
        ]
      },
      {
        groupTitle: '注释结果',
        activeTab: 'annotation',
        images: [
          { tabLabel: '注释结果', tabName: 'annotation', title: '细胞注释结果', url: '/src/assets/05.annotation/figures/umap_annotation.png' },
          { tabLabel: '注释标签', tabName: 'annotation_label', title: '细胞注释标签', url: '/src/assets/05.annotation/figures/umap_annotation_label.png' },
          { tabLabel: 'QC检查', tabName: 'QC_Check', title: 'QC检查', url: '/src/assets/05.annotation/figures/umap_QC_Check.png' },
        ]
      }
    ]
  }
])

// 5.2 聚类Marker分析
const annotationClusterSections = ref([
  {
    title: '各簇Top9 Marker',
    imageGroups: [
      {
        groupTitle: '簇0-13 Top9 Marker',
        activeTab: 'cluster0',
        images: [
          { tabLabel: '簇0', tabName: 'cluster0', title: '簇0 Top9 Marker', url: '/src/assets/05.annotation/figures/umap_cluster_0_top9_marker.png' },
          { tabLabel: '簇1', tabName: 'cluster1', title: '簇1 Top9 Marker', url: '/src/assets/05.annotation/figures/umap_cluster_1_top9_marker.png' },
          { tabLabel: '簇2', tabName: 'cluster2', title: '簇2 Top9 Marker', url: '/src/assets/05.annotation/figures/umap_cluster_2_top9_marker.png' },
          { tabLabel: '簇3', tabName: 'cluster3', title: '簇3 Top9 Marker', url: '/src/assets/05.annotation/figures/umap_cluster_3_top9_marker.png' },
          { tabLabel: '簇4', tabName: 'cluster4', title: '簇4 Top9 Marker', url: '/src/assets/05.annotation/figures/umap_cluster_4_top9_marker.png' },
          { tabLabel: '簇5', tabName: 'cluster5', title: '簇5 Top9 Marker', url: '/src/assets/05.annotation/figures/umap_cluster_5_top9_marker.png' },
          { tabLabel: '簇6', tabName: 'cluster6', title: '簇6 Top9 Marker', url: '/src/assets/05.annotation/figures/umap_cluster_6_top9_marker.png' },
          { tabLabel: '簇7', tabName: 'cluster7', title: '簇7 Top9 Marker', url: '/src/assets/05.annotation/figures/umap_cluster_7_top9_marker.png' },
          { tabLabel: '簇8', tabName: 'cluster8', title: '簇8 Top9 Marker', url: '/src/assets/05.annotation/figures/umap_cluster_8_top9_marker.png' },
          { tabLabel: '簇9', tabName: 'cluster9', title: '簇9 Top9 Marker', url: '/src/assets/05.annotation/figures/umap_cluster_9_top9_marker.png' },
          { tabLabel: '簇10', tabName: 'cluster10', title: '簇10 Top9 Marker', url: '/src/assets/05.annotation/figures/umap_cluster_10_top9_marker.png' },
          { tabLabel: '簇11', tabName: 'cluster11', title: '簇11 Top9 Marker', url: '/src/assets/05.annotation/figures/umap_cluster_11_top9_marker.png' },
          { tabLabel: '簇12', tabName: 'cluster12', title: '簇12 Top9 Marker', url: '/src/assets/05.annotation/figures/umap_cluster_12_top9_marker.png' },
          { tabLabel: '簇13', tabName: 'cluster13', title: '簇13 Top9 Marker', url: '/src/assets/05.annotation/figures/umap_cluster_13_top9_marker.png' },
        ]
      }
    ]
  }
])

// 5.3 Marker基因热图
const annotationHeatmapSections = ref([
  {
    title: '热图可视化',
    imageGroups: [
      {
        groupTitle: '细胞类型Marker',
        activeTab: 'heatmap_scaled',
        images: [
          { tabLabel: '热图(Scaled)', tabName: 'heatmap_scaled', title: '细胞类型Marker热图', url: '/src/assets/05.annotation/figures/heatmap_celltype_marker_gene_scaled.png' },
          { tabLabel: '热图(Log1p)', tabName: 'heatmap_log1p', title: '细胞类型Marker热图', url: '/src/assets/05.annotation/figures/heatmap_celltype_marker_gene_log1p.png' },
        ]
      },
      {
        groupTitle: '矩阵图',
        activeTab: 'matrixplot_scaled',
        images: [
          { tabLabel: '矩阵图(Scaled)', tabName: 'matrixplot_scaled', title: '细胞类型Marker矩阵图', url: '/src/assets/05.annotation/figures/matrixplot_celltype_marker_gene_scaled.png' },
          { tabLabel: '矩阵图(Log1p)', tabName: 'matrixplot_log1p', title: '细胞类型Marker矩阵图', url: '/src/assets/05.annotation/figures/matrixplot_celltype_marker_gene_log1p.png' },
        ]
      },
      {
        groupTitle: '其他热图',
        activeTab: 'violin',
        images: [
          { tabLabel: '小提琴图', tabName: 'violin', title: '细胞类型Marker小提琴图', url: '/src/assets/05.annotation/figures/stacked_violin_celltype_marker_gene_log1p.png' },
          { tabLabel: '轨迹图', tabName: 'tracksplot', title: '细胞类型Marker轨迹图', url: '/src/assets/05.annotation/figures/tracksplot_celltype_marker_gene_log1p.png' },
        ]
      }
    ]
  },
  {
    title: '聚类热图',
    imageGroups: [
      {
        groupTitle: '聚类Marker热图',
        activeTab: 'cluster_heatmap',
        images: [
          { tabLabel: '聚类Top10热图', tabName: 'cluster_heatmap', title: '聚类Top10热图', url: '/src/assets/05.annotation/figures/heatmap_Cluster_top10_heatmap_scaled.png' },
          { tabLabel: 'Top25基因', tabName: 'top25', title: 'Top25 Marker基因', url: '/src/assets/05.annotation/figures/rank_genes_groups_leiden_harmony_0.4_top25_rank_genes_groups.png' },
        ]
      }
    ]
  }
])

// 5.4 其他分析
const annotationOtherSections = ref([
  {
    title: '点图与相关性',
    imageGroups: [
      {
        groupTitle: '点图',
        activeTab: 'dotplot_celltype',
        images: [
          { tabLabel: '细胞类型', tabName: 'dotplot_celltype', title: '细胞类型Marker点图', url: '/src/assets/05.annotation/figures/dotplot_celltype_marker_gene.png' },
          { tabLabel: '聚类', tabName: 'dotplot_cluster', title: '聚类Top5点图', url: '/src/assets/05.annotation/figures/dotplot_cluster_top5_marker.png' },
        ]
      },
      {
        groupTitle: '相关性分析',
        activeTab: 'correlation',
        images: [
          { tabLabel: '细胞类型相关性', tabName: 'correlation', title: '细胞类型相关性矩阵', url: '/src/assets/05.annotation/figures/correlation_matrix_celltype_correlation.png' },
        ]
      }
    ]
  }
])
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

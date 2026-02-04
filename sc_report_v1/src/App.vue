<template>
  <div class="app-container">
    <!-- 顶部标题栏 -->
    <div class="top-bar">
      <div class="top-bar-content">
        <div class="logo-area">
          <!-- <div class="logo-icon">🧬</div> -->
          <img src="/src/assets/img/logo.jpg" alt="Logo" class="logo-img" />
          <h1>单细胞转录组分析报告</h1>
        </div>
      </div>
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
          <h2>01. 数据分布情况</h2>
          <TextBlock text="展示数据质控前阶段各样本的原始数据分布情况的可视化结果，包括了检测基因数量、线粒体比例和UMI计数。通过这些图表可以了解未进行细胞质控前的数据集的基本特征。" />

          <!-- 总体跨样本分布 - 使用 ImageGalleryFullWidth -->
          <div class="subsection" id="section-01-load-overall">
            <h3>总体跨样本分布概览</h3>
            <TextBlock text="所有样本的质控前数据分布情况。" />
            <ImageGalleryFullWidth v-if="loadOverallSection" :image-sections="[loadOverallSection]" />
          </div>

          <!-- 样本分布图 - 使用 ImageGallery -->
          <div class="subsection" id="section-01-load-distribution">
            <h3>单样本数据分布1</h3>
            <TextBlock text="分布图以小提琴图形式展示各样本的质量指标分布。" />
            <ImageGalleryFullWidth v-if="loadDistributionSection" :image-sections="[loadDistributionSection]" />
          </div>

          <!-- 异常值检测 - 使用 ImageGallery -->
          <div class="subsection" id="section-01-load-outlier">
            <h3>MAD离群细胞检测</h3>
            <TextBlock text="异常值检测用于识别偏离正常分布的细胞，这些细胞可能是低质量细胞或异常数据点。" />
            <ImageGallery v-if="loadOutlierSection" :image-sections="[loadOutlierSection]" />
          </div>

          <!-- 散点图分析 - 使用 ImageGallery -->
          <div class="subsection" id="section-01-load-scatter">
            <h3>单样本数据分布2</h3>
            <TextBlock text="散点图展示了每个细胞的基因数、UMI计数等质量指标在样本中的分布情况。" />
            <ImageGallery v-if="loadScatterSection" :image-sections="[loadScatterSection]" />
          </div>


        </section>

        <!-- 02.qc 模块 -->
        <section id="section-02-qc" class="report-section">
          <h2>02. 质量控制</h2>
          <TextBlock text="质量控制是单细胞分析的关键步骤，通过检测基因数、线粒体基因比例等指标，识别并过滤低质量细胞。" />

          <!-- 基因数分布 -->
          <div class="subsection" id="section-02-qc-genes">
            <h3>基因数分布</h3>
            <TextBlock text="基因数是评估细胞质量的重要指标。基因数过低可能代表空液滴或死细胞，基因数过高可能代表双细胞。" />
            <ImageGallery v-if="qcGenesSection" :image-sections="[qcGenesSection]" />
          </div>

          <!-- 线粒体基因比例 -->
          <div class="subsection" id="section-02-qc-mt">
            <h3>线粒体基因比例</h3>
            <TextBlock text="线粒体基因比例过高通常表示细胞处于应激状态或濒死状态，需要适当过滤。" />
            <ImageGallery v-if="qcMtSection" :image-sections="[qcMtSection]" />
          </div>

          <!-- 质量控制过滤 -->
          <div class="subsection" id="section-02-qc-filter">
            <h3>质量控制过滤</h3>
            <TextBlock text="通过设置阈值或统计方法，识别并过滤低质量细胞，提高数据质量。" />
            <ImageGallery v-if="qcFilterSection" :image-sections="[qcFilterSection]" />
          </div>

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

          <!-- 基因重叠分析 -->
          <div class="subsection" id="section-03-integrate-overlap">
            <h3>基因重叠分析</h3>
            <TextBlock text="基因重叠分析展示了不同样本之间共有的基因数量，有助于评估样本间的相似性。" />
            <ImageGalleryFullWidth v-if="integrateOverlapSection" :image-sections="[integrateOverlapSection]" />
          </div>

          <!-- HVG选择 -->
          <div class="subsection" id="section-03-integrate-hvg">
            <h3>HVG选择</h3>
            <TextBlock text="HVG（高变基因）选择是降维分析的关键步骤，通过识别在不同细胞间表达差异最大的基因，保留生物学变异信息。" />
            <ImageGalleryFullWidth v-if="integrateHVGSection" :image-sections="[integrateHVGSection]" />
          </div>

          <!-- 质控整合后各样本数据分布情况 -->
          <div class="subsection" id="section-03-integrate-violin">
            <h3>质控整合后各样本数据分布情况</h3>
            <TextBlock text="在HVG选择后，展示了各样本在质控整合后的数据分布情况。" />
            <ImageGallery v-if="integrateViolinSection" :image-sections="[integrateViolinSection]" />
          </div>

          <!-- PCA分析 -->
          <div class="subsection" id="section-03-integrate-pca">
            <h3>PCA分析</h3>
            <TextBlock text="PCA（主成分分析）是一种常用的降维方法，通过正交变换将高维数据转换到低维空间，保留主要方差信息。" />
            <ImageGalleryFullWidth v-if="integratePCASection" :image-sections="[integratePCASection]" />
          </div>

          <!-- 未去批次效应降维情况 -->
          <div class="subsection" id="section-03-integrate-unintegrate">
            <h3>未去批次效应降维情况</h3>
            <TextBlock text="展示在未进行批次效应去除的情况下，细胞在降维空间中的分布情况。" />
            <ImageGallery v-if="integrateUnintegrateSection" :image-sections="[integrateUnintegrateSection]" />
          </div>

          <!-- 批次效应矫正后降维结果 -->
          <div class="subsection" id="section-03-integrate-batch">
            <h3>批次效应矫正后降维结果</h3>
            <TextBlock text="通过多种批次效应矫正方法，消除不同批次间的技术差异，使细胞能够在同一降维空间中正确聚类。" />
            <ImageGallery v-if="integrateBatchSection" :image-sections="[integrateBatchSection]" />
          </div>

          <!-- 聚类分析 -->
          <div class="subsection" id="section-03-integrate-cluster">
            <h3>聚类分析</h3>
            <TextBlock text="聚类分析将相似的细胞分组在一起，为后续细胞类型注释提供基础。" />
            <ImageGallery v-if="integrateClusterSection" :image-sections="[integrateClusterSection]" />
          </div>

          <!-- 聚类网格 -->
          <div class="subsection" id="section-03-integrate-grid">
            <h3>聚类网格</h3>
            <TextBlock text="聚类网格展示了不同聚类分辨率下的聚类效果，帮助选择最优的聚类参数。" />
            <ImageGalleryFullWidth v-if="integrateGridSection" :image-sections="[integrateGridSection]" />
          </div>

          <!-- QC特征可视化 - 细胞周期分析 -->
          <div class="subsection" id="section-03-integrate-qc-cellcycle">
            <h3>细胞周期分析</h3>
            <TextBlock text="细胞周期分析是单细胞数据质量控制的重要环节，能够识别细胞所处的周期阶段。" />
            <ImageGalleryFullWidth v-if="integrateQCCellCycleSection" :image-sections="[integrateQCCellCycleSection]" />
          </div>

          <!-- QC特征可视化 - 双细胞检测 -->
          <div class="subsection" id="section-03-integrate-qc-doublets">
            <h3>双细胞检测</h3>
            <TextBlock text="双细胞检测用于识别包含多个细胞的液滴，这些液滴会影响后续分析的准确性。" />
            <ImageGalleryFullWidth v-if="integrateQCDoubletsSection" :image-sections="[integrateQCDoubletsSection]" />
          </div>

          <!-- QC特征可视化 - 关键QC特征 -->
          <div class="subsection" id="section-03-integrate-qc-key">
            <h3>关键QC特征</h3>
            <TextBlock text="关键QC特征包括基因数、UMI计数、线粒体基因比例等重要指标，用于评估细胞质量。" />
            <ImageGalleryFullWidth v-if="integrateQCKeySection" :image-sections="[integrateQCKeySection]" />
          </div>

          <!-- 聚类树 -->
          <div class="subsection" id="section-03-integrate-tree">
            <h3>聚类树</h3>
            <TextBlock text="聚类树展示了细胞簇之间的层次关系，有助于理解细胞类型的演化路径。" />
            <ImageGallery v-if="integrateTreeSection" :image-sections="[integrateTreeSection]" />
          </div>

          <TextBlock text="通过多种整合方法（如BBKNN、Harmony、Scanorama等），可以有效去除批次间差异，保留生物学变异。" />
        </section>

        <!-- 04.prediction 模块 -->
        <section id="section-04-prediction" class="report-section">
          <h2>04. 细胞预测</h2>
          <TextBlock text="细胞预测利用已建立的细胞类型参考数据库，自动识别每个细胞的潜在类型，为后续注释提供重要参考。" />

          <!-- CellTypist预测 -->
          <div class="subsection" id="section-04-prediction-celltypist">
            <h3>CellTypist预测</h3>
            <TextBlock text="CellTypist是一种基于机器学习的细胞类型预测工具，利用预训练的免疫细胞参考数据库进行预测。" />
            <ImageGallery v-if="predictionCellTypistSection" :image-sections="[predictionCellTypistSection]" />
          </div>

          <!-- SCimilarity预测 -->
          <div class="subsection" id="section-04-prediction-scimilarity">
            <h3>SCimilarity预测</h3>
            <TextBlock text="SCimilarity基于相似性度量进行细胞类型预测，适用于未知细胞类型的快速鉴定。" />
            <ImageGallery v-if="predictionSCimilaritySection" :image-sections="[predictionSCimilaritySection]" />
          </div>

          <!-- starCAT预测 -->
          <div class="subsection" id="section-04-prediction-starcat">
            <h3>starCAT预测</h3>
            <TextBlock text="starCAT专门用于T细胞亚型的预测，利用T细胞受体（TCR）序列进行细胞类型鉴定。" />
            <ImageGallery v-if="predictionStarcatSection" :image-sections="[predictionStarcatSection]" />
          </div>

          <TextBlock text="CellTypist、SCimilarity、starCAT等方法各有优势，综合多种预测结果可以提高注释准确性。" />
        </section>

        <!-- 05.annotation 模块 -->
        <section id="section-05-annotation-umap" class="report-section">
          <h2>05. 细胞注释</h2>
          <TextBlock text="细胞注释是单细胞分析的核心环节，通过Marker基因表达模式为每个细胞簇赋予生物学意义。" />

          <!-- 图片部分 - 使用全宽组件 -->

          <!-- 表格部分 -->
          <div class="subsection" id="section-05-annotation-table">
            <h3>5.1 Marker基因表</h3>
            <TextBlock text="该表格详细列出了每个细胞簇的Marker基因信息，包括基因名称、表达量、统计显著性等指标。" />
            <DataTable csv-path="/src/assets/05.annotation/csv/Scanpy_markers_per_cluster.csv" caption="表注：p_val_adj表示校正后的p值，logFC表示对数 fold change。" />
          </div>
        </section>

          <div class="subsection" id="section-05-annotation-cluster">
            <h3>5.2 聚类Marker分析</h3>
            <TextBlock text="Marker基因是在特定细胞簇中高表达且在其他簇中低表达的基因，是细胞注释的重要依据。" />
            <ImageGalleryFullWidth :image-sections="annotationClusterSections" />
            <TextBlock text="Top9 Marker展示了每个细胞簇中表达量最高的9个特征基因。" />
          </div>


          <div class="subsection" id="section-05-annotation-umap-content">
            <h3>5.3 UMAP可视化</h3>
            <TextBlock text="UMAP（Uniform Manifold Approximation and Projection）是一种非线性降维方法，能够很好地展示高维数据在低维空间中的分布。" />
            <ImageGalleryFullWidth :image-sections="annotationUMAPSections" />
            <TextBlock text="通过UMAP可视化，可以直观地观察细胞类型的空间分布和聚类效果。" />
          </div>

          <div class="subsection" id="section-05-annotation-heatmap">
            <h3>5.3 Marker基因热图</h3>
            <TextBlock text="热图能够同时展示多个基因在多个细胞簇中的表达水平，颜色深浅代表表达量高低。" />
            <ImageGalleryFullWidth :image-sections="annotationHeatmapSections" />
            <TextBlock text="通过热图可以快速识别细胞类型的特异性Marker基因组合。" />
          </div>

          <div class="subsection" id="section-05-annotation-correlation">
            <h3>5.4 相关性分析</h3>
            <TextBlock text="相关性分析帮助理解细胞类型之间的关联性以及细胞簇与基因表达之间的关系。" />
            <ImageGalleryFullWidth :image-sections="annotationCorrelationSections" />
            <TextBlock text="这些补充分析有助于验证细胞注释的可靠性。" />
          </div>

          <div class="subsection" id="section-05-annotation-dotplot">
            <h3>5.5 点图</h3>
            <TextBlock text="点图展示了Marker基因在不同细胞簇中的表达分布情况，横轴表示细胞簇，纵轴表示基因，点的大小和颜色代表表达量。" />
            <ImageGalleryFullWidth :image-sections="annotationDotplotSections" />
            <TextBlock text="点图可以直观地比较不同Marker基因在各细胞簇中的表达水平。" />
          </div>

        <!-- 06.compositional 模块 -->
        <section id="section-06-compositional" class="report-section">
          <h2>06. 组成分析</h2>
          <TextBlock text="组成分析关注不同样本、簇或细胞类型之间的比例关系，揭示样本间或条件下的细胞组成差异。" />

          <!-- 样本在簇中的比例/数量 -->
          <div class="subsection" id="section-06-compositional-cluster">
            <h3>样本在簇中的比例/数量</h3>
            <TextBlock text="分析各样本在不同细胞簇中的分布情况，揭示样本间的细胞类型组成差异。" />
            <ImageGallery v-if="compositionalClusterSection" :image-sections="[compositionalClusterSection]" />
          </div>

          <!-- 簇在样本中的比例/数量 -->
          <div class="subsection" id="section-06-compositional-sample">
            <h3>簇在样本中的比例/数量</h3>
            <TextBlock text="分析各细胞簇在不同样本中的丰度变化，识别差异显著的细胞类型。" />
            <ImageGallery v-if="compositionalSampleSection" :image-sections="[compositionalSampleSection]" />
          </div>

          <!-- 样本在细胞类型中的比例/数量 -->
          <div class="subsection" id="section-06-compositional-celltype">
            <h3>样本在细胞类型中的比例/数量</h3>
            <TextBlock text="分析各样本在不同细胞类型中的分布情况，比较样本间的细胞类型组成。" />
            <ImageGallery v-if="compositionalCelltypeSection" :image-sections="[compositionalCelltypeSection]" />
          </div>

          <!-- 细胞类型在样本中的比例/数量 -->
          <div class="subsection" id="section-06-compositional-celltype-sample">
            <h3>细胞类型在样本中的比例/数量</h3>
            <TextBlock text="分析各细胞类型在不同样本中的丰度变化，发现富集或缺失的细胞类型。" />
            <ImageGallery v-if="compositionalCelltypeSampleSection" :image-sections="[compositionalCelltypeSampleSection]" />
          </div>

          <!-- 相关性热图 -->
          <div class="subsection" id="section-06-compositional-heatmap">
            <h3>相关性热图</h3>
            <TextBlock text="展示各细胞类型或样本之间的相关性程度，相关性越高表示越相似。" />
            <ImageGallery v-if="compositionalHeatmapSection" :image-sections="[compositionalHeatmapSection]" />
          </div>

          <!-- MiloR分析 -->
          <div class="subsection" id="section-06-compositional-milor">
            <h3>MiloR分析</h3>
            <TextBlock text="MiloR是一种检测细胞组成差异的统计方法，可以识别在不同条件间显著变化的细胞群体。" />
            <ImageGallery v-if="compositionalMilorSection" :image-sections="[compositionalMilorSection]" />
          </div>

          <!-- Odds Ratio分析 -->
          <div class="subsection" id="section-06-compositional-or">
            <h3>Odds Ratio分析</h3>
            <TextBlock text="Odds Ratio（优势比）用于衡量细胞类型在不同条件下的富集程度，OR值大于1表示富集。" />
            <ImageGallery v-if="compositionalORSection" :image-sections="[compositionalORSection]" />
          </div>

          <!-- Roe分析 -->
          <div class="subsection" id="section-06-compositional-roe">
            <h3>Roe分析</h3>
            <TextBlock text="Roe分析用于评估细胞类型的相对丰度变化，提供对细胞组成差异的定量描述。" />
            <ImageGallery v-if="compositionalRoeSection" :image-sections="[compositionalRoeSection]" />
          </div>

          <TextBlock text="通过组成分析，可以发现样本间细胞类型的富集或缺失情况，为理解生物学差异提供线索。" />
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
    title: '01. 数据分布情况',
    items: [
      { id: 'section-01-load-overall', title: '总体跨样本分布' },
      { id: 'section-01-load-distribution', title: '样本分布图' },
      { id: 'section-01-load-outlier', title: '异常值检测' },
      { id: 'section-01-load-scatter', title: '散点图分析' }
    ]
  },
  {
    id: '02-qc',
    title: '02. 质量控制',
    items: [
      { id: 'section-02-qc-genes', title: '基因数分布' },
      { id: 'section-02-qc-mt', title: '线粒体基因比例' },
      { id: 'section-02-qc-filter', title: '质量控制过滤' },
      { id: 'section-02-qc-csv-1', title: 'cell_number_before_after_QC' },
      { id: 'section-02-qc-csv-2', title: 'doublets_rate' }
    ]
  },
  {
    id: '03-integrate',
    title: '03. 数据整合',
    items: [
      { id: 'section-03-integrate-overlap', title: '基因重叠分析' },
      { id: 'section-03-integrate-hvg', title: 'HVG选择' },
      { id: 'section-03-integrate-violin', title: '质控整合后各样本数据分布情况' },
      { id: 'section-03-integrate-pca', title: 'PCA分析' },
      { id: 'section-03-integrate-unintegrate', title: '未去批次效应降维情况' },
      { id: 'section-03-integrate-batch', title: '批次效应矫正后降维结果' },
      { id: 'section-03-integrate-cluster', title: '聚类分析' },
      { id: 'section-03-integrate-grid', title: '聚类网格' },
      { id: 'section-03-integrate-qc-cellcycle', title: '细胞周期分析' },
      { id: 'section-03-integrate-qc-doublets', title: '双细胞检测' },
      { id: 'section-03-integrate-qc-key', title: '关键QC特征' },
      { id: 'section-03-integrate-tree', title: '聚类树' }
    ]
  },
  {
    id: '04-prediction',
    title: '04. 细胞预测',
    items: [
      { id: 'section-04-prediction-celltypist', title: 'CellTypist预测' },
      { id: 'section-04-prediction-scimilarity', title: 'SCimilarity预测' },
      { id: 'section-04-prediction-starcat', title: 'starCAT预测' }
    ]
  },
  {
    id: '05-annotation',
    title: '05. 细胞注释',
    items: [
      { id: 'section-05-annotation-table', title: '5.1 Marker基因表' },
      { id: 'section-05-annotation-cluster', title: '5.2 聚类Marker分析' },
      { id: 'section-05-annotation-umap-content', title: '5.3 UMAP可视化' },
      { id: 'section-05-annotation-heatmap', title: '5.4 Marker基因热图' },
      { id: 'section-05-annotation-correlation', title: '5.5 相关性分析' },
      { id: 'section-05-annotation-dotplot', title: '5.6 点图' }
    ]
  },
  {
    id: '06-compositional',
    title: '06. 组成分析',
    items: [
      { id: 'section-06-compositional-cluster', title: '样本在簇中的比例/数量' },
      { id: 'section-06-compositional-sample', title: '簇在样本中的比例/数量' },
      { id: 'section-06-compositional-celltype', title: '样本在细胞类型中的比例/数量' },
      { id: 'section-06-compositional-celltype-sample', title: '细胞类型在样本中的比例/数量' },
      { id: 'section-06-compositional-heatmap', title: '相关性热图' },
      { id: 'section-06-compositional-milor', title: 'MiloR分析' },
      { id: 'section-06-compositional-or', title: 'Odds Ratio分析' },
      { id: 'section-06-compositional-roe', title: 'Roe分析' }
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
// 01.load 图片数据 - 拆分为不同的ref以方便使用
const loadData = loadLoadImages()
const loadImageSections = ref(loadData.sections)

// 01.load 各个section的ref（用于单独显示）
const loadOverallSection = computed(() => loadImageSections.value.find(s => s.title === '总体跨样本分布'))
const loadDistributionSection = computed(() => loadImageSections.value.find(s => s.title === '样本分布图'))
const loadOutlierSection = computed(() => loadImageSections.value.find(s => s.title === '异常值检测'))
const loadScatterSection = computed(() => loadImageSections.value.find(s => s.title === '散点图分析'))

// 02.qc 图片数据
const qcData = loadQCImages()
const qcImageSections = ref(qcData.sections)

// 02.qc 各个section的ref（用于单独显示）
const qcGenesSection = computed(() => qcImageSections.value.find(s => s.title === '基因数分布'))
const qcMtSection = computed(() => qcImageSections.value.find(s => s.title === '线粒体基因比例'))
const qcFilterSection = computed(() => qcImageSections.value.find(s => s.title === '质量控制过滤'))

// 02.qc CSV 数据
const qcCSVData = loadQCAnnotationCSV()

// 03.integrate 图片数据
const integrateData = loadIntegrateImages()
const integrateImageSections = ref(integrateData.sections)

// 03.integrate 各个section的ref（用于单独显示）
const integrateOverlapSection = computed(() => integrateImageSections.value.find(s => s.title === '基因重叠分析'))
const integrateHVGSection = computed(() => integrateImageSections.value.find(s => s.title === 'HVG选择'))
const integrateViolinSection = computed(() => integrateImageSections.value.find(s => s.title === '质控整合后各样本数据分布情况'))
const integratePCASection = computed(() => integrateImageSections.value.find(s => s.title === 'PCA分析'))
const integrateUnintegrateSection = computed(() => integrateImageSections.value.find(s => s.title === '未去批次效应降维情况'))
const integrateBatchSection = computed(() => integrateImageSections.value.find(s => s.title === '批次效应矫正后降维结果'))
const integrateClusterSection = computed(() => integrateImageSections.value.find(s => s.title === '聚类分析'))
const integrateGridSection = computed(() => integrateImageSections.value.find(s => s.title === '聚类网格'))
const integrateQCCellCycleSection = computed(() => integrateImageSections.value.find(s => s.title === '细胞周期分析'))
const integrateQCDoubletsSection = computed(() => integrateImageSections.value.find(s => s.title === '双细胞检测'))
const integrateQCKeySection = computed(() => integrateImageSections.value.find(s => s.title === '关键QC特征'))
const integrateTreeSection = computed(() => integrateImageSections.value.find(s => s.title === '聚类树'))

// 04.prediction 图片数据 (保持静态)
const predictionData = loadPredictionImages()
const predictionImageSections = ref(predictionData.sections)

// 04.prediction 各个section的ref（用于单独显示）
const predictionCellTypistSection = computed(() => predictionImageSections.value.find(s => s.title === 'CellTypist预测'))
const predictionSCimilaritySection = computed(() => predictionImageSections.value.find(s => s.title === 'SCimilarity预测'))
const predictionStarcatSection = computed(() => predictionImageSections.value.find(s => s.title === 'starCAT预测'))

// 05.annotation 图片数据
const annotationData = loadAnnotationImages()
const annotationUMAPSections = ref(annotationData.umapSections)
const annotationClusterSections = ref(annotationData.clusterSections)

// 热图、相关性分析和点图数据已经在 assetLoader.js 中组织好了
const annotationHeatmapSections = ref(annotationData.heatmapSections)
const annotationCorrelationSections = ref(annotationData.correlationSections)
const annotationDotplotSections = ref(annotationData.dotplotSections)

// 06.compositional 图片数据
const compositionalData = loadCompositionalImages()
const compositionalSections = ref(compositionalData.sections)

// 06.compositional 各个section的ref（用于单独显示）
const compositionalClusterSection = computed(() => compositionalSections.value.find(s => s.title.includes('样本在簇中')))
const compositionalSampleSection = computed(() => compositionalSections.value.find(s => s.title.includes('簇在样本中')))
const compositionalCelltypeSection = computed(() => compositionalSections.value.find(s => s.title.includes('样本在细胞类型中')))
const compositionalCelltypeSampleSection = computed(() => compositionalSections.value.find(s => s.title.includes('细胞类型在样本中')))
const compositionalHeatmapSection = computed(() => compositionalSections.value.find(s => s.title === '相关性热图'))
const compositionalMilorSection = computed(() => compositionalSections.value.find(s => s.title === 'MiloR分析'))
const compositionalORSection = computed(() => compositionalSections.value.find(s => s.title === 'Odds Ratio分析'))
const compositionalRoeSection = computed(() => compositionalSections.value.find(s => s.title === 'Roe分析'))
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.top-bar {
  background: #ffffff;
  color: #333;
  padding: 16px 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid #e5e7eb;
}

.top-bar-content {
  display: flex;
  align-items: center;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 32px;
  line-height: 1;
}

.logo-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.top-bar h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  letter-spacing: -0.5px;
}

.main-content {
  display: flex;
}

.content-area {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  max-height: calc(100vh - 70px);
  scroll-behavior: smooth;
  position: relative;
}

.report-section {
  background: white;
  padding: 32px;
  border-radius: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
}

.report-section h2 {
  margin-top: 0;
  margin-bottom: 24px;
  color: #111827;
  font-size: 20px;
  font-weight: 600;
  border-bottom: 2px solid #6366f1;
  padding-bottom: 12px;
  letter-spacing: -0.3px;
}

.subsection {
  margin: 32px 0;
  padding: 20px;
  background-color: #f9fafb;
  border-radius: 0;
  border-left: 3px solid #6366f1;
}

.subsection h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #4b5563;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.2px;
}

.subsection > :first-child {
  margin-top: 0;
}
</style>

# Bug 修复说明

## 修复的问题

### 1. 02.qc 模块 - 图片分类问题

**问题描述:**
- 基因数分布中,同一样本的多个图片被合并到一起
- 例如 `sample1_scatter_genes.png` 和 `sample1_scatter_genes_outlier.png` 都显示为 "sample1"
- 线粒体基因比例同样存在此问题
- 质量控制过滤的散点图和分布图没有分开

**修复方案:**
- 将散点图和 outlier 图分开显示
- 基因数分布分为两组:
  - "各样本基因数散点图" - 显示 `scatter_genes.png`
  - "各样本基因数outlier散点图" - 显示 `scatter_genes_outlier.png`
- 线粒体基因比例分为两组:
  - "各样本线粒体基因比例" - 显示 `scatter_mt.png`
  - "各样本线粒体基因outlier散点图" - 显示 `scatter_mt_outlier.png`
- 质量控制过滤分为四组:
  - "MAD方法过滤 - 散点图"
  - "MAD方法过滤 - 分布图"
  - "手动过滤 - 散点图"
  - "手动过滤 - 分布图"

### 2. 05.annotation 模块 - 热图和其他分析不显示

**问题描述:**
- 5.3 Marker基因热图完全没有显示
- 5.4 其他分析完全没有显示

**原因:**
- App.vue 中的数据处理逻辑错误
- 尝试过滤 `annotationData.heatmapSections`,但实际上数据结构已经不同
- assetLoader.js 返回的是数组,但 App.vue 试图按 `tabLabel` 过滤

**修复方案:**
- 在 `assetLoader.js` 中完整组织数据结构
- UMAP 部分分为两组: Marker 和 注释结果
- 热图部分分为三组: 细胞类型Marker、矩阵图、其他热图
- 其他分析部分分为两组: 点图、相关性分析
- App.vue 直接使用组织好的数据,不再额外处理

## 修改的文件

### `src/utils/assetLoader.js`

**02.qc 模块修改:**
```javascript
// 基因数分布 - 分离散点图和outlier图
const scatterImages = allGenesImages.filter(img =>
  img.title.includes('scatter_genes') && !img.title.includes('outlier')
)
const outlierImages = allGenesImages.filter(img =>
  img.title.includes('scatter_genes_outlier')
)

// 分别创建分组
genesGroups.push({
  groupTitle: '各样本基因数散点图',
  images: scatterImages
})
genesGroups.push({
  groupTitle: '各样本基因数outlier散点图',
  images: outlierImages
})
```

**05.annotation 模块修改:**
```javascript
// 热图部分 - 按类型分组
const celltypeHeatmap = result.heatmapSections.filter(img =>
  img.title.includes('celltype_marker_gene') && img.title.includes('heatmap')
)
const matrixplot = result.heatmapSections.filter(img =>
  img.title.includes('matrixplot')
)
const otherHeatmap = result.heatmapSections.filter(img =>
  img.title.includes('violin') || img.title.includes('tracksplot') ||
  img.title.includes('Cluster') || img.title.includes('rank_genes')
)

// 创建完整的分组结构
result.heatmapSections = [{
  title: '热图可视化',
  imageGroups: [
    { groupTitle: '细胞类型Marker', images: celltypeHeatmap },
    { groupTitle: '矩阵图', images: matrixplot },
    { groupTitle: '其他热图', images: otherHeatmap }
  ]
}]
```

### `src/App.vue`

**简化数据处理:**
```javascript
// 05.annotation 图片数据
const annotationData = loadAnnotationImages()
const annotationUMAPSections = ref(annotationData.umapSections)
const annotationClusterSections = ref(annotationData.clusterSections)

// 热图和其他分析数据已经在 assetLoader.js 中组织好了
const annotationHeatmapSections = ref(annotationData.heatmapSections)
const annotationOtherSections = ref(annotationData.otherSections)
```

## 验证

构建测试通过:
```bash
cd sc_report_v1 && npm run build
✓ built in 8.08s
```

所有模块的图片现在都能正确显示和分类。

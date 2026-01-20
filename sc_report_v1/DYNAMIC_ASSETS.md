# 动态图片加载说明

## 概述

项目已升级为支持动态加载图片资源,无需手动编写每个图片的路径。系统会自动扫描 `src/assets` 目录下的图片文件,并根据文件命名规则自动组织数据结构。

## 工作原理

### 1. 静态导入所有图片

使用 Vite 的 `import.meta.glob` 功能在构建时静态导入所有图片:

```javascript
const loadModules = import.meta.glob('/src/assets/**/*.{png,jpg,jpeg,svg,webp}', { eager: true })
```

### 2. 按模块筛选和解析

- **01.load**: 根据 sample 子目录自动分组
- **02.qc**: 根据 genes/mt/filter 关键词分类
- **03.integrate**: 根据文件名前缀 (3.0, 3.1, ...) 分组
- **04.prediction**: 保持静态配置(暂未实现动态)
- **05.annotation**: 根据 umap/cluster/heatmap/other 关键词分类

### 3. 文件命名规则

#### 01.load 模块
```
figures/
├── n_genes_by_counts_violin.png     # 总体图片
├── pct_counts_mt_violin.png
└── sample1/                          # 样本子目录
    ├── sample1_distribution_violin.png
    └── sample1_scatter.png
```

#### 02.qc 模块
```
figures/
└── sample1/
    ├── sample1_scatter_genes.png     # 基因数相关
    ├── sample1_scatter_mt.png        # 线粒体相关
    ├── mad_sample1_scatter_Filter.png # MAD过滤
    └── manual_sample1_scatter_Filter.png # 手动过滤
```

#### 03.integrate 模块
```
figures/
├── 3.0.upset_gene_overlap.png       # 3.0 组
├── 3.1.scatter_hvg.png             # 3.1 组
├── 3.4.umap_harmony.png             # 3.4 组
└── 3.5.umap_harmony_leiden_harmony_0.1.png  # 3.5 组,按分辨率
```

#### 05.annotation 模块
```
figures/
├── umap_Epithelial_marker.png       # UMAP Marker
├── umap_annotation.png               # 注释结果
├── umap_cluster_0_top9_marker.png   # 聚类Marker
├── heatmap_celltype_marker_gene_scaled.png  # 热图
├── dotplot_celltype_marker_gene.png  # 点图
└── correlation_matrix_celltype_correlation.png  # 相关性
```

## 使用方法

### 添加新图片

只需将图片放入对应的目录,系统会自动识别:

1. **01.load**: 放入 `src/assets/01.load/figures/` 或 `figures/sampleX/`
2. **02.qc**: 放入 `src/assets/02.qc/figures/sampleX/`
3. **03.integrate**: 放入 `src/assets/03.integrate/figures/`,按 3.X 前缀命名
4. **05.annotation**: 放入 `src/assets/05.annotation/figures/`,按上述命名规则

### 代码中的使用

```vue
<script setup>
import { loadLoadImages, loadQCImages, ... } from './utils/assetLoader.js'

// 动态加载
const loadData = loadLoadImages()
const loadImageSections = ref([loadData])
</script>

<template>
  <ImageGallery :image-sections="loadImageSections" />
</template>
```

## 优势

1. **无需手动维护**: 新增图片只需放入对应目录
2. **自动适应样本数量**: sample1-sampleN 自动识别和排序
3. **动态分辨率**: 03.integrate 的分辨率 (0.1, 0.2, ...) 自动提取
4. **按需加载**: Vite 会自动进行代码分割和优化

## 注意事项

1. Vite 的 `import.meta.glob` 要求 glob 模式必须是静态字符串,不能是变量
2. 图片文件名需要遵循既定的命名规则
3. 新增图片后需要重新构建: `npm run build`
4. 04.prediction 模块暂时保持静态配置,后续可扩展为动态加载

## 文件结构

```
src/
├── utils/
│   └── assetLoader.js       # 动态加载工具
├── components/
│   ├── ImageGallery.vue
│   ├── ImageGalleryFullWidth.vue
│   └── DataTable.vue
└── App.vue                   # 主组件,使用 assetLoader
```

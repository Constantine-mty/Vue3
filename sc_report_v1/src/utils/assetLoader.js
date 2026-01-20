/**
 * 动态加载图片资源的工具函数
 * 根据文件系统自动扫描并生成图片数据结构
 */

// 静态导入所有图片文件 (Vite要求glob必须是静态字符串)
const loadModules = import.meta.glob('/src/assets/**/*.{png,jpg,jpeg,svg,webp,pdf}', { eager: true })

/**
 * 解析文件路径,提取信息
 * @param {string} path - 文件路径
 * @returns {Object} 解析结果
 */
function parseFilePath(path) {
  // /src/assets/02.qc/figures/sample1/sample1_scatter_genes.png
  const parts = path.split('/')
  const filename = parts[parts.length - 1]
  const extension = filename.split('.').pop()

  return {
    path,
    filename,
    extension,
    isImage: ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension),
    isPdf: extension === 'pdf'
  }
}

/**
 * 获取 01.load 模块的图片数据
 */
export function loadLoadImages() {
  try {
    // 筛选出 01.load 相关的图片
    const modules = Object.fromEntries(
      Object.entries(loadModules).filter(([path]) => path.includes('/01.load/'))
    )

    const result = {
      title: '数据加载',
      sections: []
    }

    // 总体图片
    const overallImages = []

    // 样本图片按类型分组
    const typeGroups = new Map()

    Object.keys(modules).forEach(path => {
      const parsed = parseFilePath(path)
      // 只处理图片文件，排除 PDF
      if (!parsed.isImage) return

      const filename = parsed.filename
      const relativePath = path.replace('/src/assets/01.load/', '')
      const parts = relativePath.split('/')

      if (parts[0] === 'figures' && parts[1]?.startsWith('sample')) {
        const sampleName = parts[1]
        const sampleFilename = parts[2]
        const imageUrl = modules[path].default

        // 提取图片类型（去掉 sample 前缀）
        const imageType = sampleFilename.replace(/^sample\d+_/, '').replace(/\.(png|jpg|jpeg|svg|webp|pdf)$/, '')

        if (!typeGroups.has(imageType)) {
          typeGroups.set(imageType, [])
        }

        typeGroups.get(imageType).push({
          tabLabel: sampleName,
          tabName: sampleName,
          title: `${sampleName} ${imageType}`,
          url: imageUrl
        })
      } else if (parts[0] === 'figures' && parts.length === 2) {
        // 总体图片: figures/xxx.png (直接在figures目录下)
        const imageUrl = modules[path].default
        const title = filename.replace(/\.(png|jpg|jpeg|svg|webp|pdf)$/, '')

        overallImages.push({
          tabLabel: title,
          tabName: title,
          title: title,
          url: imageUrl
        })
      }
    })

    // 添加总体分布
    if (overallImages.length > 0) {
      result.sections.push({
        title: '总体分布',
        imageGroups: [{
          groupTitle: '总体分布',
          activeTab: overallImages[0].tabName,
          images: overallImages
        }]
      })
    }

    // 按图片类型分组，每组下切换样本
    const sortedTypeGroups = Array.from(typeGroups.entries()).sort((a, b) => a[0].localeCompare(b[0]))

    sortedTypeGroups.forEach(([imageType, images]) => {
      // 按样本号排序
      images.sort((a, b) => {
        const aNum = parseInt(a.tabName.replace('sample', '')) || 0
        const bNum = parseInt(b.tabName.replace('sample', '')) || 0
        return aNum - bNum
      })

      result.sections.push({
        title: imageType,
        imageGroups: [{
          groupTitle: imageType,
          activeTab: images[0]?.tabName || '',
          images: images
        }]
      })
    })

    return result
  } catch (error) {
    console.error('加载 01.load 图片失败:', error)
    return { title: '数据加载', sections: [{ title: '待补充', imageGroups: [{ groupTitle: '待补充', images: [] }] }] }
  }
}

/**
 * 获取 02.qc 模块的图片数据
 */
export function loadQCImages() {
  try {
    // 筛选出 02.qc 相关的图片
    const modules = Object.fromEntries(
      Object.entries(loadModules).filter(([path]) => path.includes('/02.qc/'))
    )

    const result = {
      title: '质量控制',
      sections: []
    }

    const sampleGroups = new Map()

    Object.keys(modules).forEach(path => {
      const parsed = parseFilePath(path)
      // 只处理图片文件，排除 PDF
      if (!parsed.isImage) return

      const relativePath = path.replace('/src/assets/02.qc/', '')
      const parts = relativePath.split('/')

      if (parts[0] === 'figures' && parts[1]?.startsWith('sample')) {
        const sampleName = parts[1]
        const filename = parts[2]

        if (!sampleGroups.has(sampleName)) {
          sampleGroups.set(sampleName, {
            name: sampleName,
            genesImages: [],
            mtImages: [],
            filterImages: {
              mad: [],
              manual: []
            }
          })
        }

        const group = sampleGroups.get(sampleName)
        const imageUrl = modules[path].default
        const title = filename.replace(/\.(png|jpg|jpeg|svg|webp)$/, '')

        // 根据文件名分类
        if (filename.includes('genes')) {
          group.genesImages.push({
            tabLabel: sampleName,
            tabName: sampleName,
            title: `${sampleName} ${title}`,
            url: imageUrl
          })
        } else if (filename.includes('mt')) {
          group.mtImages.push({
            tabLabel: sampleName,
            tabName: sampleName,
            title: `${sampleName} ${title}`,
            url: imageUrl
          })
        } else if (filename.includes('mad')) {
          group.filterImages.mad.push({
            tabLabel: sampleName,
            tabName: sampleName,
            title: `${sampleName} ${title}`,
            url: imageUrl
          })
        } else if (filename.includes('manual')) {
          group.filterImages.manual.push({
            tabLabel: sampleName,
            tabName: sampleName,
            title: `${sampleName} ${title}`,
            url: imageUrl
          })
        }
      }
    })

    // 构建数据结构
    const sampleArray = Array.from(sampleGroups.values()).sort((a, b) => {
      const aNum = parseInt(a.name.replace('sample', '')) || 0
      const bNum = parseInt(b.name.replace('sample', '')) || 0
      return aNum - bNum
    })

    // 基因数分布 - 按图片类型分组
    if (sampleArray.some(s => s.genesImages.length > 0)) {
      const allGenesImages = sampleArray.map(s => s.genesImages).flat()

      // 分离散点图和outlier图
      const scatterImages = allGenesImages.filter(img => img.title.includes('scatter_genes') && !img.title.includes('outlier'))
      const outlierImages = allGenesImages.filter(img => img.title.includes('scatter_genes_outlier'))

      const genesGroups = []

      if (scatterImages.length > 0) {
        genesGroups.push({
          groupTitle: '各样本基因数散点图',
          activeTab: scatterImages[0]?.tabName || '',
          images: scatterImages
        })
      }
      if (outlierImages.length > 0) {
        genesGroups.push({
          groupTitle: '各样本基因数outlier散点图',
          activeTab: outlierImages[0]?.tabName || '',
          images: outlierImages
        })
      }

      result.sections.push({
        title: '基因数分布',
        imageGroups: genesGroups
      })
    }

    // 线粒体基因比例 - 按图片类型分组
    if (sampleArray.some(s => s.mtImages.length > 0)) {
      const allMtImages = sampleArray.map(s => s.mtImages).flat()

      // 分离散点图和outlier图
      const mtScatterImages = allMtImages.filter(img => img.title.includes('scatter_mt') && !img.title.includes('outlier'))
      const mtOutlierImages = allMtImages.filter(img => img.title.includes('scatter_mt_outlier'))

      const mtGroups = []

      if (mtScatterImages.length > 0) {
        mtGroups.push({
          groupTitle: '各样本线粒体基因比例',
          activeTab: mtScatterImages[0]?.tabName || '',
          images: mtScatterImages
        })
      }
      if (mtOutlierImages.length > 0) {
        mtGroups.push({
          groupTitle: '各样本线粒体基因outlier散点图',
          activeTab: mtOutlierImages[0]?.tabName || '',
          images: mtOutlierImages
        })
      }

      result.sections.push({
        title: '线粒体基因比例',
        imageGroups: mtGroups
      })
    }

    // 质量控制过滤 - 按图片类型和过滤方法分组
    const madScatterImages = sampleArray.map(s => s.filterImages.mad.filter(img => img.title.includes('scatter_Filter'))).flat()
      .sort((a, b) => parseInt(a.tabName.replace('sample', '')) - parseInt(b.tabName.replace('sample', '')))

    const madViolinImages = sampleArray.map(s => s.filterImages.mad.filter(img => img.title.includes('violin'))).flat()
      .sort((a, b) => parseInt(a.tabName.replace('sample', '')) - parseInt(b.tabName.replace('sample', '')))

    const manualScatterImages = sampleArray.map(s => s.filterImages.manual.filter(img => img.title.includes('scatter_Filter'))).flat()
      .sort((a, b) => parseInt(a.tabName.replace('sample', '')) - parseInt(b.tabName.replace('sample', '')))

    const manualViolinImages = sampleArray.map(s => s.filterImages.manual.filter(img => img.title.includes('violin'))).flat()
      .sort((a, b) => parseInt(a.tabName.replace('sample', '')) - parseInt(b.tabName.replace('sample', '')))

    const filterGroups = []

    if (madScatterImages.length > 0) {
      filterGroups.push({
        groupTitle: 'MAD方法过滤 - 散点图',
        activeTab: madScatterImages[0]?.tabName || '',
        images: madScatterImages
      })
    }
    if (madViolinImages.length > 0) {
      filterGroups.push({
        groupTitle: 'MAD方法过滤 - 分布图',
        activeTab: madViolinImages[0]?.tabName || '',
        images: madViolinImages
      })
    }
    if (manualScatterImages.length > 0) {
      filterGroups.push({
        groupTitle: '手动过滤 - 散点图',
        activeTab: manualScatterImages[0]?.tabName || '',
        images: manualScatterImages
      })
    }
    if (manualViolinImages.length > 0) {
      filterGroups.push({
        groupTitle: '手动过滤 - 分布图',
        activeTab: manualViolinImages[0]?.tabName || '',
        images: manualViolinImages
      })
    }

    if (filterGroups.length > 0) {
      result.sections.push({
        title: '质量控制过滤',
        imageGroups: filterGroups
      })
    }

    return result
  } catch (error) {
    console.error('加载 02.qc 图片失败:', error)
    return { title: '质量控制', sections: [] }
  }
}

/**
 * 获取 03.integrate 模块的图片数据
 */
export function loadIntegrateImages() {
  try {
    // 筛选出 03.integrate 相关的图片
    const modules = Object.fromEntries(
      Object.entries(loadModules).filter(([path]) => path.includes('/03.integrate/'))
    )

    const result = {
      title: '数据整合',
      sections: []
    }

    // 按照文件前缀分组
    const groups = new Map()

    Object.keys(modules).forEach(path => {
      const parsed = parseFilePath(path)
      // 只处理图片文件，排除 PDF
      if (!parsed.isImage) return

      const filename = parsed.filename

      // 提取文件名前缀 (如 3.1.scatter_hvg -> 3.1)
      const prefixMatch = filename.match(/^(\d+\.\d+)\./)
      if (prefixMatch) {
        const prefix = prefixMatch[1]
        const imageUrl = modules[path].default
        const title = filename.replace(/\.(png|jpg|jpeg|svg|webp)$/, '').replace(/^[\d.]+\s*/, '')

        if (!groups.has(prefix)) {
          groups.set(prefix, [])
        }

        groups.get(prefix).push({
          tabLabel: title,
          tabName: prefix + '_' + groups.get(prefix).length,
          title: title,
          url: imageUrl
        })
      }
    })

    // 定义分组标题映射
    const groupTitleMap = {
      '3.0': '基因重叠分析',
      '3.1': 'HVG选择',
      '3.2': 'PCA分析',
      '3.3': 'BBKNN整合',
      '3.4': 'Harmony整合',
      '3.5': '聚类分析',
      '3.6': '聚类网格',
      '3.7': 'QC特征可视化',
      '3.8': '聚类树',
      '3.9': 'Scanorama',
      '3.10': 'scVI整合'
    }

    // 构建数据结构
    Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0])).forEach(([prefix, images]) => {
      result.sections.push({
        title: groupTitleMap[prefix] || prefix,
        imageGroups: [{
          groupTitle: groupTitleMap[prefix] || prefix,
          activeTab: images[0]?.tabName || '',
          images: images.sort((a, b) => a.tabLabel.localeCompare(b.tabLabel))
        }]
      })
    })

    return result
  } catch (error) {
    console.error('加载 03.integrate 图片失败:', error)
    return { title: '数据整合', sections: [] }
  }
}

/**
 * 获取 04.prediction 模块的图片数据 (保持原状)
 */
export function loadPredictionImages() {
  // 04.prediction 暂时保持静态配置
  return {
    title: '细胞预测',
    sections: [
      {
        title: 'CellTypist预测',
        imageGroups: [{
          groupTitle: 'CellTypist预测结果',
          activeTab: 'default',
          images: [{ tabLabel: '待补充', tabName: 'default', title: 'CellTypist预测结果', url: '/src/assets/img/test1.png' }]
        }]
      },
      {
        title: 'SCimilarity预测',
        imageGroups: [{
          groupTitle: 'SCimilarity预测结果',
          activeTab: 'default',
          images: [{ tabLabel: '待补充', tabName: 'default', title: 'SCimilarity预测结果', url: '/src/assets/img/test1.png' }]
        }]
      },
      {
        title: 'starCAT预测',
        imageGroups: [{
          groupTitle: 'starCAT预测结果',
          activeTab: 'default',
          images: [{ tabLabel: '待补充', tabName: 'default', title: 'starCAT预测结果', url: '/src/assets/img/test1.png' }]
        }]
      }
    ]
  }
}

/**
 * 获取 05.annotation 模块的图片数据
 */
export function loadAnnotationImages() {
  try {
    // 筛选出 05.annotation 相关的图片
    const modules = Object.fromEntries(
      Object.entries(loadModules).filter(([path]) => path.includes('/05.annotation/'))
    )

    const result = {
      umapSections: [],
      clusterSections: [],
      heatmapSections: [],
      otherSections: []
    }

    Object.keys(modules).forEach(path => {
      const parsed = parseFilePath(path)
      // 只处理图片文件，排除 PDF
      if (!parsed.isImage) return

      const filename = parsed.filename
      const imageUrl = modules[path].default
      const title = filename.replace(/\.(png|jpg|jpeg|svg|webp)$/, '')

      // UMAP Marker 图片
      if (filename.includes('umap_') && filename.includes('_marker') && !filename.includes('cluster')) {
        // 提取细胞类型名称
        const cellTypeMatch = filename.match(/umap_([^_]+)_marker/)
        if (cellTypeMatch) {
          const cellType = cellTypeMatch[1]
          // 映射到中文
          const typeMap = {
            'Epithelial': '上皮细胞',
            'Immune': '免疫细胞',
            'T': 'T细胞',
            'B': 'B细胞',
            'Myeloid': '髓系细胞',
            'DC': 'DC细胞',
            'NK': 'NK细胞',
            'Endothelial': '内皮细胞',
            'Sooth_muscle_cell': '平滑肌细胞',
            'Fibroblast': '成纤维细胞',
            'Pericyte': '周细胞',
            'Mast': '肥大细胞',
            'Megakaryocyte': '巨核细胞',
            'Plasma': '浆细胞',
            'Neutrophils': '中性粒细胞',
            'Prolifertive': '增殖细胞'
          }
          const chineseName = typeMap[cellType] || cellType

          result.umapSections.push({
            tabLabel: chineseName,
            tabName: cellType,
            title: `${chineseName}Marker`,
            url: imageUrl
          })
        }
      }
      // UMAP 注释结果
      else if (filename.includes('annotation')) {
        result.umapSections.push({
          tabLabel: title,
          tabName: title,
          title: title,
          url: imageUrl
        })
      }
      // Cluster Top9 Marker
      else if (filename.includes('cluster') && filename.includes('top9_marker')) {
        const clusterNum = filename.match(/cluster_(\d+)/)?.[1] || '0'
        result.clusterSections.push({
          tabLabel: `簇${clusterNum}`,
          tabName: `cluster${clusterNum}`,
          title: `簇${clusterNum} Top9 Marker`,
          url: imageUrl
        })
      }
      // 热图相关
      else if (filename.includes('heatmap') || filename.includes('violin') || filename.includes('matrixplot') || filename.includes('tracksplot')) {
        result.heatmapSections.push({
          tabLabel: title,
          tabName: title,
          title: title,
          url: imageUrl
        })
      }
      // 其他
      else if (filename.includes('dotplot') || filename.includes('correlation')) {
        result.otherSections.push({
          tabLabel: title,
          tabName: title,
          title: title,
          url: imageUrl
        })
      }
    })

    // 整理 UMAP 部分
    if (result.umapSections.length > 0) {
      // 分离 Marker 和 注释结果
      // Marker: tabName 是细胞类型名（不带 marker 后缀），title 包含"Marker"
      // 注释结果: filename 包含"annotation"
      const markerImages = result.umapSections.filter(img =>
        img.title.includes('Marker') && !img.title.includes('annotation')
      )
      const annotationImages = result.umapSections.filter(img =>
        img.title.includes('annotation') || img.tabName.includes('annotation')
      )

      const umapGroups = []

      if (markerImages.length > 0) {
        umapGroups.push({
          groupTitle: '各细胞类型Marker基因',
          activeTab: markerImages[0]?.tabName || '',
          images: markerImages
        })
      }
      if (annotationImages.length > 0) {
        umapGroups.push({
          groupTitle: '注释结果',
          activeTab: annotationImages[0]?.tabName || '',
          images: annotationImages
        })
      }

      result.umapSections = [{
        title: '细胞类型Marker',
        imageGroups: umapGroups
      }]
    } else {
      result.umapSections = []
    }

    // 整理 Cluster 部分
    if (result.clusterSections.length > 0) {
      result.clusterSections = [{
        title: '各簇Top9 Marker',
        imageGroups: [{
          groupTitle: `簇0-${result.clusterSections.length - 1} Top9 Marker`,
          activeTab: result.clusterSections[0]?.tabName || '',
          images: result.clusterSections
        }]
      }]
    } else {
      result.clusterSections = []
    }

    // 整理热图部分
    if (result.heatmapSections.length > 0) {
      const heatmapGroups = []

      // 细胞类型Marker热图
      const celltypeHeatmap = result.heatmapSections.filter(img =>
        img.title.includes('celltype_marker_gene') && img.title.includes('heatmap')
      )
      if (celltypeHeatmap.length > 0) {
        heatmapGroups.push({
          groupTitle: '细胞类型Marker',
          activeTab: celltypeHeatmap[0]?.tabName || '',
          images: celltypeHeatmap
        })
      }

      // 矩阵图
      const matrixplot = result.heatmapSections.filter(img =>
        img.title.includes('matrixplot')
      )
      if (matrixplot.length > 0) {
        heatmapGroups.push({
          groupTitle: '矩阵图',
          activeTab: matrixplot[0]?.tabName || '',
          images: matrixplot
        })
      }

      // 其他热图(violin, tracksplot, cluster heatmap)
      const otherHeatmap = result.heatmapSections.filter(img =>
        (img.title.includes('violin') || img.title.includes('tracksplot') ||
         img.title.includes('Cluster') || img.title.includes('rank_genes'))
      )
      if (otherHeatmap.length > 0) {
        heatmapGroups.push({
          groupTitle: '其他热图',
          activeTab: otherHeatmap[0]?.tabName || '',
          images: otherHeatmap
        })
      }

      result.heatmapSections = [{
        title: '热图可视化',
        imageGroups: heatmapGroups
      }]
    } else {
      result.heatmapSections = []
    }

    // 整理其他分析部分
    if (result.otherSections.length > 0) {
      const otherGroups = []

      // 点图
      const dotplot = result.otherSections.filter(img => img.title.includes('dotplot'))
      if (dotplot.length > 0) {
        otherGroups.push({
          groupTitle: '点图',
          activeTab: dotplot[0]?.tabName || '',
          images: dotplot
        })
      }

      // 相关性分析
      const correlation = result.otherSections.filter(img => img.title.includes('correlation'))
      if (correlation.length > 0) {
        otherGroups.push({
          groupTitle: '相关性分析',
          activeTab: correlation[0]?.tabName || '',
          images: correlation
        })
      }

      result.otherSections = [{
        title: '点图与相关性',
        imageGroups: otherGroups
      }]
    } else {
      result.otherSections = []
    }

    return result
  } catch (error) {
    console.error('加载 05.annotation 图片失败:', error)
    return { umapSections: [], clusterSections: [], heatmapSections: [], otherSections: [] }
  }
}

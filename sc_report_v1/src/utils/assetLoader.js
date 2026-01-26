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
          images: images,
          caption: `图注：该图展示了各样本的${imageType}分析结果，可以通过上方标签切换不同样本进行对比。`
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
          images: scatterImages,
          caption: '图注：该散点图展示了各样本中每个细胞的基因数量分布情况，横轴表示细胞索引，纵轴表示基因数。'
        })
      }
      if (outlierImages.length > 0) {
        genesGroups.push({
          groupTitle: '各样本基因数outlier散点图',
          activeTab: outlierImages[0]?.tabName || '',
          images: outlierImages,
          caption: '图注：该图展示了基因数的异常值检测结果，红色点表示被识别为异常值（outlier）的细胞。'
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
          images: mtScatterImages,
          caption: '图注：该散点图展示了各样本中每个细胞的线粒体基因比例分布情况，横轴表示细胞索引，纵轴表示线粒体基因比例。'
        })
      }
      if (mtOutlierImages.length > 0) {
        mtGroups.push({
          groupTitle: '各样本线粒体基因outlier散点图',
          activeTab: mtOutlierImages[0]?.tabName || '',
          images: mtOutlierImages,
          caption: '图注：该图展示了线粒体基因比例的异常值检测结果，红色点表示被识别为异常值的细胞。'
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
        images: madScatterImages,
        caption: '图注：该散点图展示了基于MAD（中位数绝对偏差）方法的质量控制过滤结果，蓝色区域表示被保留的高质量细胞，红色区域表示被过滤的低质量细胞。'
      })
    }
    if (madViolinImages.length > 0) {
      filterGroups.push({
        groupTitle: 'MAD方法过滤 - 分布图',
        activeTab: madViolinImages[0]?.tabName || '',
        images: madViolinImages,
        caption: '图注：该小提琴图展示了MAD方法过滤前后各样本的基因数和线粒体基因比例分布对比。'
      })
    }
    if (manualScatterImages.length > 0) {
      filterGroups.push({
        groupTitle: '手动过滤 - 散点图',
        activeTab: manualScatterImages[0]?.tabName || '',
        images: manualScatterImages,
        caption: '图注：该散点图展示了基于手动设置阈值的质量控制过滤结果，蓝色区域表示被保留的高质量细胞，红色区域表示被过滤的低质量细胞。'
      })
    }
    if (manualViolinImages.length > 0) {
      filterGroups.push({
        groupTitle: '手动过滤 - 分布图',
        activeTab: manualViolinImages[0]?.tabName || '',
        images: manualViolinImages,
        caption: '图注：该小提琴图展示了手动阈值过滤前后各样本的基因数和线粒体基因比例分布对比。'
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
          images: images.sort((a, b) => a.tabLabel.localeCompare(b.tabLabel)),
          caption: `图注：该图展示了${groupTitleMap[prefix] || prefix}的分析结果。`
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
          images: [{ tabLabel: '待补充', tabName: 'default', title: 'CellTypist预测结果', url: '/src/assets/img/test1.png' }],
          caption: '图注：CellTypist是一种基于机器学习的细胞类型预测工具，利用预训练的免疫细胞参考数据库进行预测。'
        }]
      },
      {
        title: 'SCimilarity预测',
        imageGroups: [{
          groupTitle: 'SCimilarity预测结果',
          activeTab: 'default',
          images: [{ tabLabel: '待补充', tabName: 'default', title: 'SCimilarity预测结果', url: '/src/assets/img/test1.png' }],
          caption: '图注：SCimilarity基于相似性度量进行细胞类型预测，适用于未知细胞类型的快速鉴定。'
        }]
      },
      {
        title: 'starCAT预测',
        imageGroups: [{
          groupTitle: 'starCAT预测结果',
          activeTab: 'default',
          images: [{ tabLabel: '待补充', tabName: 'default', title: 'starCAT预测结果', url: '/src/assets/img/test1.png' }],
          caption: '图注：starCAT专门用于T细胞亚型的预测，利用T细胞受体（TCR）序列进行细胞类型鉴定。'
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
          images: markerImages,
          caption: '图注：该图展示了各细胞类型的特异性Marker基因在UMAP空间中的分布情况，不同颜色代表不同的细胞类型。'
        })
      }
      if (annotationImages.length > 0) {
        umapGroups.push({
          groupTitle: '注释结果',
          activeTab: annotationImages[0]?.tabName || '',
          images: annotationImages,
          caption: '图注：该图展示了细胞注释的整体结果，每个细胞根据Marker基因表达被标记为特定的细胞类型。'
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
          images: result.clusterSections,
          caption: '图注：该图展示了各个细胞簇中表达量最高的9个Marker基因，这些基因是定义该细胞簇的关键特征。'
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
          images: celltypeHeatmap,
          caption: '图注：该热图展示了各细胞类型的Marker基因表达水平，颜色越深表示表达量越高。'
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
          images: matrixplot,
          caption: '图注：该矩阵图以点阵形式展示了Marker基因在细胞簇中的表达情况，点的颜色和大小代表表达量。'
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
          images: otherHeatmap,
          caption: '图注：该图展示了Marker基因的多种可视化形式，包括小提琴图、轨迹图、聚类热图等。'
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
          images: dotplot,
          caption: '图注：该点图展示了Marker基因在不同细胞簇中的表达分布，横轴表示细胞簇，纵轴表示基因，点的大小和颜色代表表达量。'
        })
      }

      // 相关性分析
      const correlation = result.otherSections.filter(img => img.title.includes('correlation'))
      if (correlation.length > 0) {
        otherGroups.push({
          groupTitle: '相关性分析',
          activeTab: correlation[0]?.tabName || '',
          images: correlation,
          caption: '图注：该图展示了各细胞类型之间的相关性程度，相关性越高表示细胞类型越相似。'
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

/**
 * 获取 06.compositional 模块的图片数据
 */
export function loadCompositionalImages() {
  try {
    // 筛选出 06.compositional 相关的图片
    const modules = Object.fromEntries(
      Object.entries(loadModules).filter(([path]) => path.includes('/06.compositional/'))
    )

    const result = {
      title: '组成分析',
      sections: []
    }

    // 按文件前缀分组
    const groups = new Map()

    // 特殊图片组（条件性显示）
    const specialGroups = new Map()

    Object.keys(modules).forEach(path => {
      const parsed = parseFilePath(path)
      if (!parsed.isImage) return

      const filename = parsed.filename

      // 提取文件名前缀 (如 6.1.1.Sample_Percent_in_Cluster -> 6.1.1)
      const prefixMatch = filename.match(/^(\d+\.\d+\.\d+)\./)
      if (prefixMatch) {
        const prefix = prefixMatch[1]
        const imageUrl = modules[path].default
        const title = filename.replace(/^[\d.]+\s*/, '').replace(/\.(png|jpg|jpeg|svg|webp)$/, '')

        if (!groups.has(prefix)) {
          groups.set(prefix, [])
        }

        groups.get(prefix).push({
          tabLabel: title,
          tabName: prefix + '_' + groups.get(prefix).length,
          title: title,
          url: imageUrl
        })
      } else {
        // 特殊图片：MiloR_, OR_, Roe_ 开头
        const specialPrefixMatch = filename.match(/^(MiloR_|OR_|Roe_)/)
        if (specialPrefixMatch) {
          const prefix = specialPrefixMatch[1]
          if (!specialGroups.has(prefix)) {
            specialGroups.set(prefix, [])
          }

          const imageUrl = modules[path].default
          const title = filename.replace(/\.(png|jpg|jpeg|svg|webp)$/, '')

          specialGroups.get(prefix).push({
            tabLabel: title,
            tabName: prefix + '_' + specialGroups.get(prefix).length,
            title: title,
            url: imageUrl
          })
        }
      }
    })

    // 定义分组标题映射
    const groupTitleMap = {
      '6.1.1': '样本在簇中的比例',
      '6.1.2': '样本在簇中的数量',
      '6.2.1': '簇在样本中的比例',
      '6.2.2': '簇在样本中的数量',
      '6.3.1': '样本在细胞类型中的比例',
      '6.3.2': '样本在细胞类型中的数量',
      '6.4.1': '细胞类型在样本中的比例',
      '6.4.2': '细胞类型在样本中的数量',
      '6.5': '簇与表达相关性',
      '6.6.1': '相关性热图1',
      '6.6.2': '相关性热图2'
    }

    // 构建数据结构
    Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0])).forEach(([prefix, images]) => {
      result.sections.push({
        title: groupTitleMap[prefix] || prefix,
        imageGroups: [{
          groupTitle: groupTitleMap[prefix] || prefix,
          activeTab: images[0]?.tabName || '',
          images: images,
          caption: `图注：该图展示了${groupTitleMap[prefix] || prefix}的分析结果。`
        }]
      })
    })

    // 添加特殊图片组（条件性显示）
    if (specialGroups.has('MiloR_')) {
      const milorImages = specialGroups.get('MiloR_')
      result.sections.push({
        title: 'MiloR分析',
        imageGroups: [{
          groupTitle: 'MiloR分析',
          activeTab: milorImages[0]?.tabName || '',
          images: milorImages,
          caption: '图注：MiloR是一种检测细胞组成差异的统计方法，可以识别在不同条件间显著变化的细胞群体。'
        }]
      })
    }

    if (specialGroups.has('OR_')) {
      const orImages = specialGroups.get('OR_')
      result.sections.push({
        title: 'Odds Ratio分析',
        imageGroups: [{
          groupTitle: 'Odds Ratio分析',
          activeTab: orImages[0]?.tabName || '',
          images: orImages,
          caption: '图注：Odds Ratio（优势比）用于衡量细胞类型在不同条件下的富集程度，OR值大于1表示富集。'
        }]
      })
    }

    if (specialGroups.has('Roe_')) {
      const roeImages = specialGroups.get('Roe_')
      result.sections.push({
        title: 'Roe分析',
        imageGroups: [{
          groupTitle: 'Roe分析',
          activeTab: roeImages[0]?.tabName || '',
          images: roeImages,
          caption: '图注：Roe分析用于评估细胞类型的相对丰度变化，提供对细胞组成差异的定量描述。'
        }]
      })
    }

    return result
  } catch (error) {
    console.error('加载 06.compositional 图片失败:', error)
    return { title: '组成分析', sections: [] }
  }
}

/**
 * 获取 02.qc 章节需要的 CSV 文件（来自 05.annotation/csv）
 */
export function loadQCAnnotationCSV() {
  try {
    const result = {
      csvFiles: [
        {
          title: 'cell_number_before_after_QC',
          url: '/src/assets/05.annotation/csv/cell_number_before_after_QC.csv'
        },
        {
          title: 'doublets_rate',
          url: '/src/assets/05.annotation/csv/doublets_rate.csv'
        }
      ]
    }

    return result
  } catch (error) {
    console.error('加载 02.qc CSV 文件失败:', error)
    return { csvFiles: [] }
  }
}

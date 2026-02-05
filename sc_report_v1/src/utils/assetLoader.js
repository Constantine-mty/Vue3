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
      title: '数据分布情况',
      sections: []
    }

    // 总体图片（figures目录下的文件） - 使用 ImageGalleryFullWidth
    const overallImages = []

    // 样本图片按类型分组 - 使用 ImageGallery
    const mtOutlierImages = []
    const outlierImages = []
    const scatterImages = []
    const totalCountsDisplotImages = []
    const distributionViolinImages = []

    Object.keys(modules).forEach(path => {
      const parsed = parseFilePath(path)
      // 只处理图片文件，排除 PDF
      if (!parsed.isImage) return

      const filename = parsed.filename
      const relativePath = path.replace('/src/assets/01.load/', '')
      const parts = relativePath.split('/')

      if (parts[0] === 'figures' && parts[1]?.startsWith('sample')) {
        const sampleName = parts[1]
        const imageUrl = modules[path].default

        // 根据文件名分类 - 每种类型独立分组
        if (filename.includes('mt_outlier')) {
          mtOutlierImages.push({
            tabLabel: sampleName,
            tabName: sampleName,
            title: `${sampleName} ${filename.replace(/^sample\d+_|\.png$/, '')}`,
            url: imageUrl
          })
        } else if (filename.includes('outlier') && !filename.includes('mt')) {
          // outlier（非mt）
          outlierImages.push({
            tabLabel: sampleName,
            tabName: sampleName,
            title: `${sampleName} ${filename.replace(/^sample\d+_|\.png$/, '')}`,
            url: imageUrl
          })
        } else if (filename.includes('scatter') && !filename.includes('total_counts')) {
          // scatter（不含total_counts）
          scatterImages.push({
            tabLabel: sampleName,
            tabName: sampleName,
            title: `${sampleName} ${filename.replace(/^sample\d+_|\.png$/, '')}`,
            url: imageUrl
          })
        } else if (filename.includes('total_counts_displot')) {
          // total_counts_displot
          totalCountsDisplotImages.push({
            tabLabel: sampleName,
            tabName: sampleName,
            title: `${sampleName} ${filename.replace(/^sample\d+_|\.png$/, '')}`,
            url: imageUrl
          })
        } else if (filename.includes('distribution_violin')) {
          // distribution_violin
          distributionViolinImages.push({
            tabLabel: sampleName,
            tabName: sampleName,
            title: `${sampleName} ${filename.replace(/^sample\d+_|\.png$/, '')}`,
            url: imageUrl
          })
        }
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

    // 添加总体分布（使用 ImageGalleryFullWidth）
    if (overallImages.length > 0) {
      result.sections.push({
        title: '跨样本分布可视化',
        // description: '所有样本的质控前数据分布情况',
        imageGroups: [{
          groupTitle: 'Violin Plot 展示UMI count，Gene number，线粒体比例',
          activeTab: overallImages[0].tabName,
          images: overallImages,
          caption: '图注：该图展示了全部样本UMI count，Gene number，线粒体比例'
        }]
      })
    }

    // Outlier检测小结（使用 ImageGallery）- mt_outlier 和 outlier 各自独立
    if (mtOutlierImages.length > 0 || outlierImages.length > 0) {
      const outlierGroups = []

      if (mtOutlierImages.length > 0) {
        mtOutlierImages.sort((a, b) => {
          const aNum = parseInt(a.tabName.replace('sample', '')) || 0
          const bNum = parseInt(b.tabName.replace('sample', '')) || 0
          return aNum - bNum
        })
        outlierGroups.push({
          groupTitle: '线粒体基因outlier散点图',
          activeTab: mtOutlierImages[0]?.tabName || '',
          images: mtOutlierImages,
          caption: '图注：该图展示了线粒体基因比例的异常值检测结果，橙色点表示被识别为异常值的细胞。'
        })
      }

      if (outlierImages.length > 0) {
        outlierImages.sort((a, b) => {
          const aNum = parseInt(a.tabName.replace('sample', '')) || 0
          const bNum = parseInt(b.tabName.replace('sample', '')) || 0
          return aNum - bNum
        })
        outlierGroups.push({
          groupTitle: '基因数outlier散点图',
          activeTab: outlierImages[0]?.tabName || '',
          images: outlierImages,
          caption: '图注：该图展示了基因数与UMI计数的异常值检测结果，橙色点表示被识别为异常值（outlier）的细胞。'
        })
      }

      result.sections.push({
        title: 'MAD异常值检测',
        description: "在仅包含少量或规模较小的数据集中，QC 通常通过人工方式完成，即通过观察各类 QC 指标的分布并识别异常值进行过滤。然而，随着数据规模不断增大，这一过程会变得越来越耗时，因此可以考虑使用基于 MAD（median absolute deviation，中位数绝对偏差） 的自动阈值判定方法。MAD 是一种对异常值不敏感的稳健统计量，用于描述某一 QC 指标的变异程度，类似于 Germain 等人（2020） 的做法，我们将偏离中位数 5 个 MAD 的细胞标记为异常值。这是一种相对宽松的过滤策略。",  
        imageGroups: outlierGroups
      })
    }

    // 散点图小结（使用 ImageGallery）- scatter 和 total_counts_displot 各自独立
    if (scatterImages.length > 0 || totalCountsDisplotImages.length > 0) {
      const scatterGroups = []

      if (scatterImages.length > 0) {
        scatterImages.sort((a, b) => {
          const aNum = parseInt(a.tabName.replace('sample', '')) || 0
          const bNum = parseInt(b.tabName.replace('sample', '')) || 0
          return aNum - bNum
        })
        scatterGroups.push({
          groupTitle: '三QC特征综合散点图',
          activeTab: scatterImages[0]?.tabName || '',
          images: scatterImages,
          caption: '图注：该散点图综合展示了各样本中每个细胞的基因数，UMI计数，线粒体比例分布情况，横轴表示UMI计数，纵轴表示基因数，颜色深浅表示线粒体比例。'
        })
      }

      if (totalCountsDisplotImages.length > 0) {
        totalCountsDisplotImages.sort((a, b) => {
          const aNum = parseInt(a.tabName.replace('sample', '')) || 0
          const bNum = parseInt(b.tabName.replace('sample', '')) || 0
          return aNum - bNum
        })
        scatterGroups.push({
          groupTitle: 'UMI计数分布图',
          activeTab: totalCountsDisplotImages[0]?.tabName || '',
          images: totalCountsDisplotImages,
          caption: '图注：该图展示了各样本的UMI计数分布情况，横轴表示细胞索引，纵轴表示UMI计数。'
        })
      }

      result.sections.push({
        title: '其他统计可视化',
        // description: '散点图展示了每个细胞的基因数、UMI计数等质量指标在样本中的分布情况。',
        imageGroups: scatterGroups
      })
    }

    // 分布图小结（使用 ImageGallery）- distribution_violin 独立
    if (distributionViolinImages.length > 0) {
      distributionViolinImages.sort((a, b) => {
        const aNum = parseInt(a.tabName.replace('sample', '')) || 0
        const bNum = parseInt(b.tabName.replace('sample', '')) || 0
        return aNum - bNum
      })

      result.sections.push({
        title: '单样本分布可视化',
        // description: '分布图以小提琴图形式展示各样本的质量指标分布。',
        imageGroups: [{
          groupTitle: 'Violin Plot 展示UMI count，Gene number，线粒体比例',
          activeTab: distributionViolinImages[0]?.tabName || '',
          images: distributionViolinImages,
          caption: '图注：该小提琴图展示了各样本的质量指标分布，可以直观比较不同样本的分布特征。'
        }]
      })
    }

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
          groupTitle: '手动阈值',
          activeTab: scatterImages[0]?.tabName || '',
          images: scatterImages,
          caption: '图注：该散点图展示用于如果手动阈值过滤的数值。'
        })
      }
      if (outlierImages.length > 0) {
        genesGroups.push({
          groupTitle: 'MAD离群过滤',
          activeTab: outlierImages[0]?.tabName || '',
          images: outlierImages,
          caption: '图注：该散点图展示用于如果MAD阈值自动过滤的数值。'
        })
      }

      result.sections.push({
        title: '阈值在基因数和UMI计数中的分布',
        // description: '基因数是评估细胞质量的重要指标。基因数过低可能代表空液滴或死细胞，基因数过高可能代表双细胞。',
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
          groupTitle: '手动阈值',
          activeTab: mtScatterImages[0]?.tabName || '',
          images: mtScatterImages,
          caption: '图注：该散点图展示用于如果手动阈值过滤的数值。'
        })
      }
      if (mtOutlierImages.length > 0) {
        mtGroups.push({
          groupTitle: 'MAD离群过滤',
          activeTab: mtOutlierImages[0]?.tabName || '',
          images: mtOutlierImages,
          caption: '图注：该散点图展示用于如果MAD阈值自动过滤的数值'
        })
      }

      result.sections.push({
        title: '阈值在线粒体基因比例中的分布',
        // description: '线粒体基因比例过高通常表示细胞处于应激状态或濒死状态，需要适当过滤。',
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
        caption: '图注：该散点图展示了基于MAD（中位数绝对偏差）方法的质量控制过滤结果'
      })
    }
    if (madViolinImages.length > 0) {
      filterGroups.push({
        groupTitle: 'MAD方法过滤 - 分布图',
        activeTab: madViolinImages[0]?.tabName || '',
        images: madViolinImages,
        caption: '图注：该小提琴图展示了MAD方法过滤后各样本数据分布。'
      })
    }
    if (manualScatterImages.length > 0) {
      filterGroups.push({
        groupTitle: '手动过滤 - 散点图',
        activeTab: manualScatterImages[0]?.tabName || '',
        images: manualScatterImages,
        caption: '图注：该散点图展示了基于手动设置阈值的质量控制过滤结果'
      })
    }
    if (manualViolinImages.length > 0) {
      filterGroups.push({
        groupTitle: '手动过滤 - 分布图',
        activeTab: manualViolinImages[0]?.tabName || '',
        images: manualViolinImages,
        caption: '图注：该小提琴图展示了手动阈值过滤后各样本数据分布。'
      })
    }

    if (filterGroups.length > 0) {
      result.sections.push({
        title: '质量控制过滤后数据分布',
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

    // 特殊分组 - HVG violin图片
    const hvgViolinImages = []

    Object.keys(modules).forEach(path => {
      const parsed = parseFilePath(path)
      // 只处理图片文件，排除 PDF
      if (!parsed.isImage) return

      const filename = parsed.filename

      // 特殊处理 HVG violin 图片
      if (filename.match(/^3\.1\.violin_/)) {
        const imageUrl = modules[path].default
        const title = filename.replace(/\.(png|jpg|jpeg|svg|webp)$/, '').replace(/^[\d.]+\s*/, '')
        hvgViolinImages.push({
          tabLabel: title,
          tabName: title,
          title: title,
          url: imageUrl
        })
        return
      }

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

    // HVG选择 (3.1) - 包含 scatter_hvg 和 bar_hvg_batches
    if (groups.has('3.1')) {
      const hvgImages = groups.get('3.1')
      // 添加来自 3.2 的 bar_hvg_batches
      if (groups.has('3.2')) {
        const pcaImages = groups.get('3.2')
        const barImages = pcaImages.filter(img => img.title.includes('bar_hvg_batches'))
        hvgImages.push(...barImages)
      }
      result.sections.push({
        title: 'HVG选择',
        imageGroups: [{
          groupTitle: 'HVG选择',
          activeTab: hvgImages[0]?.tabName || '',
          images: hvgImages.sort((a, b) => a.tabLabel.localeCompare(b.tabLabel)),
          caption: '图注：HVG（高变基因）选择是降维分析的关键步骤，通过识别在不同细胞间表达差异最大的基因，保留生物学变异信息。'
        }]
      })
    }

    // 质控整合后各样本数据分布情况 (所有 3.1.violin 图片)
    if (hvgViolinImages.length > 0) {
      result.sections.push({
        title: '质控整合后各样本数据分布情况',
        // description: '在HVG选择后，展示了各样本在质控整合后的数据分布情况。',
        imageGroups: [{
          groupTitle: '分布情况',
          activeTab: hvgViolinImages[0]?.tabName || '',
          images: hvgViolinImages.sort((a, b) => a.tabLabel.localeCompare(b.tabLabel)),
          caption: '图注：该图展示了质控整合后各样本的数据分布情况，可以直观比较不同样本的分布特征。'
        }]
      })
    }

    // PCA分析 (3.2) - 移除 bar_hvg_batches 和 umap_unintegrate，只保留其他 PCA 相关图片
    if (groups.has('3.2')) {
      const pcaImages = groups.get('3.2').filter(img =>
        !img.title.includes('bar_hvg_batches') && !img.title.includes('umap_unintegrate')
      )
      if (pcaImages.length > 0) {
        result.sections.push({
          title: 'PCA分析',
          imageGroups: [{
            groupTitle: 'PCA分析',
            activeTab: pcaImages[0]?.tabName || '',
            images: pcaImages.sort((a, b) => a.tabLabel.localeCompare(b.tabLabel)),
            caption: '图注：PCA（主成分分析）是一种常用的降维方法，通过正交变换将高维数据转换到低维空间，保留主要方差信息。'
          }]
        })
      }
    }

    // 未去批次效应降维情况 (3.2.umap_unintegrate)
    const umapUnintegrateImages = groups.get('3.2')?.filter(img => img.title.includes('umap_unintegrate')) || []
    if (umapUnintegrateImages.length > 0) {
      result.sections.push({
        title: '未去批次效应降维情况',
        description: '展示在未进行批次效应去除的情况下，细胞在降维空间中的分布情况。',
        imageGroups: [{
          groupTitle: 'UMAP降维',
          activeTab: umapUnintegrateImages[0]?.tabName || '',
          images: umapUnintegrateImages,
          caption: '图注：该图展示了未去批次效应前细胞在UMAP降维空间中的分布，可以观察到批次效应对细胞聚类的影响。'
        }]
      })
    }

    // 批次效应矫正后降维结果 - 包含 BBKNN、Harmony、Scanorama、scVI
    const batchCorrectedImageGroups = []

    // BBKNN整合 (3.3)
    if (groups.has('3.3')) {
      const bbknnImages = groups.get('3.3')
      batchCorrectedImageGroups.push({
        title: 'BBKNN整合',
        imageGroups: [{
          groupTitle: 'BBKNN整合',
          activeTab: bbknnImages[0]?.tabName || '',
          images: bbknnImages.sort((a, b) => a.tabLabel.localeCompare(b.tabLabel)),
          caption: '图注：BBKNN是一种基于k近邻图的批次效应矫正方法，通过在嵌入空间中重新连接相邻批次来消除批次效应。'
        }]
      })
    }

    // Harmony整合 (3.4)
    if (groups.has('3.4')) {
      const harmonyImages = groups.get('3.4')
      batchCorrectedImageGroups.push({
        title: 'Harmony整合',
        imageGroups: [{
          groupTitle: 'Harmony整合',
          activeTab: harmonyImages[0]?.tabName || '',
          images: harmonyImages.sort((a, b) => a.tabLabel.localeCompare(b.tabLabel)),
          caption: '图注：Harmony是一种基于迭代降维的批次效应矫正方法，能够有效地整合多批次数据并保留生物学变异。'
        }]
      })
    }

    // Scanorama (3.9)
    if (groups.has('3.9')) {
      const scanoramaImages = groups.get('3.9')
      batchCorrectedImageGroups.push({
        title: 'Scanorama整合',
        imageGroups: [{
          groupTitle: 'Scanorama整合',
          activeTab: scanoramaImages[0]?.tabName || '',
          images: scanoramaImages.sort((a, b) => a.tabLabel.localeCompare(b.tabLabel)),
          caption: '图注：Scanorama是一种基于互惠最近邻的批次矫正方法，特别适用于大型数据集的整合。'
        }]
      })
    }

    // scVI整合 (3.10) - 条件性显示
    if (groups.has('3.10')) {
      const scviImages = groups.get('3.10')
      batchCorrectedImageGroups.push({
        title: 'scVI整合',
        imageGroups: [{
          groupTitle: 'scVI整合',
          activeTab: scviImages[0]?.tabName || '',
          images: scviImages.sort((a, b) => a.tabLabel.localeCompare(b.tabLabel)),
          caption: '图注：scVI是一种基于深度学习的变分自编码器方法，通过概率模型整合多批次单细胞数据。'
        }]
      })
    }

    // 如果有批次矫正方法，创建单独的section
    if (batchCorrectedImageGroups.length > 0) {
      // 将所有方法合并到一个section中
      const allImageGroups = batchCorrectedImageGroups.flatMap(item => item.imageGroups)
      result.sections.push({
        title: '批次效应矫正后降维结果',
        description: '通过多种批次效应矫正方法，消除不同批次间的技术差异，使细胞能够在同一降维空间中正确聚类。',
        imageGroups: allImageGroups
      })
    }

    // 其他分组 (3.0, 3.5, 3.6, 3.7, 3.8) - 排除已处理的分组
    Array.from(groups.entries())
      .filter(([prefix]) => !['3.1', '3.2', '3.3', '3.4', '3.9', '3.10'].includes(prefix))
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([prefix, images]) => {
        // 对于3.5和3.6，需要按方法拆分图片
        if (prefix === '3.5') {
          // 聚类分析 - 按方法拆分
          const clusterImageGroups = []

          // Harmony聚类
          const harmonyClusterImages = images.filter(img =>
            img.title.includes('harmony_leiden_harmony')
          )
          if (harmonyClusterImages.length > 0) {
            clusterImageGroups.push({
              groupTitle: 'Harmony聚类',
              activeTab: harmonyClusterImages[0]?.tabName || '',
              images: harmonyClusterImages.sort((a, b) => a.tabLabel.localeCompare(b.tabLabel)),
              caption: '图注：该图展示了基于Harmony批次矫正后的聚类分析结果，不同颜色代表不同的细胞簇。'
            })
          }

          // BBKNN聚类
          const bbknnClusterImages = images.filter(img =>
            img.title.includes('bbknn_leiden_bbknn')
          )
          if (bbknnClusterImages.length > 0) {
            clusterImageGroups.push({
              groupTitle: 'BBKNN聚类',
              activeTab: bbknnClusterImages[0]?.tabName || '',
              images: bbknnClusterImages.sort((a, b) => a.tabLabel.localeCompare(b.tabLabel)),
              caption: '图注：该图展示了基于BBKNN批次矫正后的聚类分析结果，不同颜色代表不同的细胞簇。'
            })
          }

          // Scanorama聚类
          const scanoramaClusterImages = images.filter(img =>
            img.title.includes('scanorama_leiden_scanorama')
          )
          if (scanoramaClusterImages.length > 0) {
            clusterImageGroups.push({
              groupTitle: 'Scanorama聚类',
              activeTab: scanoramaClusterImages[0]?.tabName || '',
              images: scanoramaClusterImages.sort((a, b) => a.tabLabel.localeCompare(b.tabLabel)),
              caption: '图注：该图展示了基于Scanorama批次矫正后的聚类分析结果，不同颜色代表不同的细胞簇。'
            })
          }

          // scVI聚类
          const scviClusterImages = images.filter(img =>
            img.title.includes('scVI_leiden_scVI')
          )
          if (scviClusterImages.length > 0) {
            clusterImageGroups.push({
              groupTitle: 'scVI聚类',
              activeTab: scviClusterImages[0]?.tabName || '',
              images: scviClusterImages.sort((a, b) => a.tabLabel.localeCompare(b.tabLabel)),
              caption: '图注：该图展示了基于scVI批次矫正后的聚类分析结果，不同颜色代表不同的细胞簇。'
            })
          }

          if (clusterImageGroups.length > 0) {
            result.sections.push({
              title: 'Leiden聚类分析',
              description: '使用Leiden聚类方法在不同分辨率下进行聚类计算',
              imageGroups: clusterImageGroups
            })
          }
        } else if (prefix === '3.6') {
          // 聚类网格 - 按方法拆分
          const gridImageGroups = []

          // Harmony网格
          const harmonyGridImages = images.filter(img =>
            img.title.includes('harmony_leiden_harmony_leiden_grid')
          )
          if (harmonyGridImages.length > 0) {
            gridImageGroups.push({
              groupTitle: 'Harmony聚类多分辨率汇总',
              activeTab: harmonyGridImages[0]?.tabName || '',
              images: harmonyGridImages.sort((a, b) => a.tabLabel.localeCompare(b.tabLabel)),
              caption: '图注：展示了基于Harmony方法在不同聚类分辨率下的聚类效果，帮助选择最优的聚类参数。'
            })
          }

          // BBKNN网格
          const bbknnGridImages = images.filter(img =>
            img.title.includes('bbknn_leiden_bbknn_leiden_grid')
          )
          if (bbknnGridImages.length > 0) {
            gridImageGroups.push({
              groupTitle: 'BBKNN聚类多分辨率汇总',
              activeTab: bbknnGridImages[0]?.tabName || '',
              images: bbknnGridImages.sort((a, b) => a.tabLabel.localeCompare(b.tabLabel)),
              caption: '图注：展示了基于BBKNN方法在不同聚类分辨率下的聚类效果，帮助选择最优的聚类参数。'
            })
          }

          // Scanorama网格
          const scanoramaGridImages = images.filter(img =>
            img.title.includes('scanorama_leiden_scanorama_leiden_grid')
          )
          if (scanoramaGridImages.length > 0) {
            gridImageGroups.push({
              groupTitle: 'Scanorama聚类多分辨率汇总',
              activeTab: scanoramaGridImages[0]?.tabName || '',
              images: scanoramaGridImages.sort((a, b) => a.tabLabel.localeCompare(b.tabLabel)),
              caption: '图注：展示了基于Scanorama方法在不同聚类分辨率下的聚类效果，帮助选择最优的聚类参数。'
            })
          }

          // scVI网格
          const scviGridImages = images.filter(img =>
            img.title.includes('scVI_leiden_scVI_leiden_grid')
          )
          if (scviGridImages.length > 0) {
            gridImageGroups.push({
              groupTitle: 'scVI聚类多分辨率汇总',
              activeTab: scviGridImages[0]?.tabName || '',
              images: scviGridImages.sort((a, b) => a.tabLabel.localeCompare(b.tabLabel)),
              caption: '图注：展示了基于scVI方法在不同聚类分辨率下的聚类效果，帮助选择最优的聚类参数。'
            })
          }

          if (gridImageGroups.length > 0) {
            result.sections.push({
              title: '多分辨率聚类结果汇总可视化',
              description: '多分辨率聚类结果汇总展示了不同方法/不同分辨率下的聚类效果，帮助选择最优的聚类参数。',
              imageGroups: gridImageGroups
            })
          }
        } else if (prefix === '3.7') {
          // QC特征可视化 - 按结果类型拆分（cell_Cycle, Doublets_scrublet, key_QC_features）
          const qcFeatureImageGroups = []

          // Cell Cycle
          const cellCycleImages = images.filter(img =>
            img.title.toLowerCase().includes('cell_cycle')
          )
          if (cellCycleImages.length > 0) {
            qcFeatureImageGroups.push({
              groupTitle: '细胞周期（Cell Cycle）',
              activeTab: cellCycleImages[0]?.tabName || '',
              images: cellCycleImages.sort((a, b) => a.tabLabel.localeCompare(b.tabLabel)),
              caption: '图注：该图展示了细胞周期在不同降维坐标下的分布情况，细胞周期分析有助于理解细胞的状态和活动。'
            })
          }

          // Doublets_scrublet
          const doubletsImages = images.filter(img =>
            img.title.toLowerCase().includes('doublets') || img.title.toLowerCase().includes('scrublet')
          )
          if (doubletsImages.length > 0) {
            qcFeatureImageGroups.push({
              groupTitle: '双细胞检测（Doublets）',
              activeTab: doubletsImages[0]?.tabName || '',
              images: doubletsImages.sort((a, b) => a.tabLabel.localeCompare(b.tabLabel)),
              caption: '图注：该图展示了双细胞检测结果，predict_doublet表示被预测为双细胞的细胞；doublet_score表示该细胞被判断为双细胞的分数'
            })
          }

          // key_QC_features
          const keyQCImages = images.filter(img =>
            !img.title.toLowerCase().includes('cell_cycle') &&
            !img.title.toLowerCase().includes('doublets') &&
            !img.title.toLowerCase().includes('scrublet')
          )
          if (keyQCImages.length > 0) {
            qcFeatureImageGroups.push({
              groupTitle: '关键QC特征（Key QC Features）',
              activeTab: keyQCImages[0]?.tabName || '',
              images: keyQCImages.sort((a, b) => a.tabLabel.localeCompare(b.tabLabel)),
              caption: '图注：该图展示了关键质量控制特征在不同降维坐标下的分布情况，包括基因数、UMI计数等指标。'
            })
          }

          // 为每个类型创建独立的section
          if (qcFeatureImageGroups.some(g => g.groupTitle.includes('细胞周期'))) {
            result.sections.push({
              title: '细胞周期分析',
              // description: '细胞周期分析是单细胞数据质量控制的重要环节，能够识别细胞所处的周期阶段。',
              imageGroups: qcFeatureImageGroups.filter(g => g.groupTitle.includes('细胞周期'))
            })
          }

          if (qcFeatureImageGroups.some(g => g.groupTitle.includes('双细胞'))) {
            result.sections.push({
              title: '双细胞分布',
              description: '因在测试数据中选择去除双细胞再进行整合降为分析，所以下图看不到双细胞分布',
              imageGroups: qcFeatureImageGroups.filter(g => g.groupTitle.includes('双细胞'))
            })
          }

          if (qcFeatureImageGroups.some(g => g.groupTitle.includes('关键QC'))) {
            result.sections.push({
              title: '关键QC特征',
              // description: '关键QC特征包括基因数、UMI计数、线粒体基因比例等重要指标，用于评估细胞质量。',
              imageGroups: qcFeatureImageGroups.filter(g => g.groupTitle.includes('关键QC'))
            })
          }
        } else {
          // 其他分组 (3.0, 3.8) - 不需要拆分
          result.sections.push({
            title: groupTitleMap[prefix] || prefix,
            imageGroups: [{
              groupTitle: groupTitleMap[prefix] || prefix,
              activeTab: images[0]?.tabName || '',
              images: images.sort((a, b) => a.tabLabel.localeCompare(b.tabLabel)),
              caption: `图注：该图展示了${groupTitleMap[prefix] || prefix}的分析结果。`
            }]
          })
        }
      })

    return result
  } catch (error) {
    console.error('加载 03.integrate 图片失败:', error)
    return { title: '数据整合', sections: [] }
  }
}

/**
 * 获取 04.prediction 模块的图片数据
 */
export function loadPredictionImages() {
  try {
    // 筛选出 04.prediction 相关的图片
    const modules = Object.fromEntries(
      Object.entries(loadModules).filter(([path]) => path.includes('/04.prediction/'))
    )

    const result = {
      title: '细胞预测',
      sections: []
    }

    // 按方法分组（第一个下划线前是方法名）
    const methodGroups = new Map()

    Object.keys(modules).forEach(path => {
      const parsed = parseFilePath(path)
      if (!parsed.isImage) return

      const filename = parsed.filename

      // 文件名格式: Method_Model.png/pdf
      // 例如: CellTypist_Immune_Low.png, SingleR_HPCA_Fine.png
      const match = filename.match(/^([^_]+)_(.+)\.(png|jpg|jpeg|svg|webp|pdf)$/i)

      if (!match) return

      const [, method, modelInfo] = match
      const imageUrl = modules[path].default

      // 将模型信息转换为标签（替换下划线为空格）
      const modelLabel = modelInfo.replace(/_/g, ' ')

      // 如果方法不存在，创建新的分组
      if (!methodGroups.has(method)) {
        methodGroups.set(method, [])
      }

      // 添加图片到对应方法的分组
      methodGroups.get(method).push({
        tabLabel: modelLabel,
        tabName: modelLabel,
        title: `${method} - ${modelLabel}`,
        url: imageUrl
      })
    })

    // 为每个方法创建一个section
    Array.from(methodGroups.entries()).forEach(([method, images]) => {
      // 对图片排序（按模型名称字母顺序）
      const sortedImages = images.sort((a, b) => a.tabLabel.localeCompare(b.tabLabel))

      const section = {
        title: `${method}预测`,
        imageGroups: [{
          groupTitle: `${method}预测结果`,
          activeTab: sortedImages[0]?.tabName || '',
          images: sortedImages,
          caption: `图注：${method}是一种细胞类型预测方法，用于将细胞注释到已知的细胞类型。`
        }]
      }

      result.sections.push(section)
    })

    // 按方法名称排序section
    result.sections.sort((a, b) => a.title.localeCompare(b.title))

    return result
  } catch (error) {
    console.error('加载 04.prediction 图片失败:', error)
    return { title: '细胞预测', sections: [] }
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

    // 获取06模块的6.5图片（簇与表达相关性）
    const compositionalData = loadCompositionalImages()
    const clusterCorrelationImages = compositionalData.clusterCorrelationImages || []

    const result = {
      umapSections: [],
      clusterSections: [],
      heatmapSections: [],
      correlationSections: [], // 新增：相关性分析（包含相关性和簇与表达相关性）
      dotplotSections: [], // 新增：点图
      topMarkerSections: [] // 新增：Top Cluster Marker 可视化
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
            tabLabel: cellType, //chineseName
            tabName: cellType,
            title: `${cellType} Marker`, //chineseName
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
          tabLabel: `cluster${clusterNum}`,
          tabName: `cluster${clusterNum}`,
          title: `cluster${clusterNum} Top9 Marker`,
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
      // 点图
      else if (filename.includes('dotplot')) {
        result.dotplotSections.push({
          tabLabel: title,
          tabName: title,
          title: title,
          url: imageUrl
        })
      }
      // 相关性分析
      else if (filename.includes('correlation')) {
        result.correlationSections.push({
          tabLabel: title,
          tabName: title,
          title: title,
          url: imageUrl
        })
      }
    })

    // 将06模块的6.5图片添加到correlationSections
    clusterCorrelationImages.forEach(img => {
      result.correlationSections.push(img)
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
          groupTitle: '各细胞类型标准Marker基因',
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
        title: '注释结果可视化',
        description: '通过UMAP降维可视化，可以直观地观察不同细胞类型在高维空间中的分布和聚类情况。',
        imageGroups: umapGroups
      }]
    } else {
      result.umapSections = []
    }

    // 整理 Cluster 部分
    if (result.clusterSections.length > 0) {
      // 按cluster编号排序（cluster0, cluster1, cluster2...）
      const sortedClusters = [...result.clusterSections].sort((a, b) => {
        const numA = parseInt(a.tabName.replace('cluster', ''))
        const numB = parseInt(b.tabName.replace('cluster', ''))
        return numA - numB
      })

      result.clusterSections = [{
        title: '各簇Top9 Marker UMAP',
        description: '每个细胞簇都有其独特的Marker基因组合，这些基因的高表达定义了该细胞簇的生物学特征。',
        imageGroups: [{
          groupTitle: `Cluster0-${sortedClusters.length - 1} Top9 Marker`,
          activeTab: sortedClusters[0]?.tabName || '',
          images: sortedClusters,
          caption: '图注：该图展示了各个细胞簇中表达量最高的9个Marker基因，这些基因是定义该细胞簇的关键特征。'
        }]
      }]
    } else {
      result.clusterSections = []
    }

    // 整理热图部分
    // 先提取需要移到 Top Marker 的 heatmap_Cluster_top10_heatmap_scaled
    const topClusterHeatmap = result.heatmapSections.filter(img =>
      img.title.includes('heatmap_Cluster_top10_heatmap_scaled')
    )

    // 整理点图部分
    // 先提取需要移到 Top Marker 的 dotplot_cluster_top5_marker
    const topDotplot = result.dotplotSections.filter(img =>
      img.title.includes('dotplot_cluster_top5_marker')
    )

    const remainingDotplot = result.dotplotSections.filter(img =>
      !img.title.includes('dotplot_cluster_top5_marker')
    )

    if (result.heatmapSections.length > 0) {
      const heatmapGroups = []

      // 细胞类型Marker热图
      const celltypeHeatmap = result.heatmapSections.filter(img =>
        img.title.includes('celltype_marker_gene') && img.title.includes('heatmap')
      )
      if (celltypeHeatmap.length > 0) {
        heatmapGroups.push({
          groupTitle: '热图',
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
          caption: '图注：矩阵图以点阵形式展示了Marker基因在细胞簇中的表达情况，单元格颜色代表表达量。'
        })
      }

      // 其他热图(violin, tracksplot, cluster heatmap) - 排除 heatmap_Cluster_top10_heatmap_scaled
      const otherHeatmap = result.heatmapSections.filter(img =>
        (img.title.includes('violin') || img.title.includes('tracksplot') ||
         img.title.includes('rank_genes') ||
         (img.title.includes('Cluster') && !img.title.includes('heatmap_Cluster_top10_heatmap_scaled')))
      )
      if (otherHeatmap.length > 0) {
        heatmapGroups.push({
          groupTitle: '其他图形形式',
          activeTab: otherHeatmap[0]?.tabName || '',
          images: otherHeatmap,
          caption: '图注：小提琴图、轨迹图展示Marker基因的表达情况。'
        })
      }

      // 点图 - 添加到热图可视化中
      if (remainingDotplot.length > 0) {
        heatmapGroups.push({
          groupTitle: '点图',
          activeTab: remainingDotplot[0]?.tabName || '',
          images: remainingDotplot,
          caption: '图注：该点图展示了Marker基因在不同细胞簇中的表达分布，横轴表示细胞簇，纵轴表示基因，点的大小和颜色代表表达量。'
        })
      }

      result.heatmapSections = [{
        title: '细胞类型Marker基因可视化',
        imageGroups: heatmapGroups
      }]
    } else {
      result.heatmapSections = []
    }

    // 整理相关性分析部分 - 包含细胞类型相关性和簇与表达相关性
    if (result.correlationSections.length > 0) {
      const correlationGroups = []

      // 细胞类型相关性（2026.02.04注释PCA相关性不展示）
      // const celltypeCorrelation = result.correlationSections.filter(img =>
      //   img.title.includes('celltype')
      // )
      // if (celltypeCorrelation.length > 0) {
      //   correlationGroups.push({
      //     groupTitle: '细胞类型相关性分析',
      //     activeTab: celltypeCorrelation[0]?.tabName || '',
      //     images: celltypeCorrelation,
      //     caption: '图注：该图展示了各细胞类型之间的相关性程度，相关性越高表示细胞类型越相似。'
      //   })
      // }

      // 簇与表达相关性（来自06模块的6.5）
      const clusterCorrelation = result.correlationSections.filter(img =>
        img.title.includes('Cluster_Correlation_Expression')
      )
      if (clusterCorrelation.length > 0) {
        correlationGroups.push({
          groupTitle: '簇与表达相关性',
          activeTab: clusterCorrelation[0]?.tabName || '',
          images: clusterCorrelation,
          caption: '图注：该图分析了细胞簇与基因表达水平之间的相关性关系，有助于理解不同簇的生物学功能特征。'
        })
      }

      result.correlationSections = [{
        title: '相关性分析',
        description: '相关性分析帮助理解细胞类型之间的关联性以及细胞簇与基因表达之间的关系。',
        imageGroups: correlationGroups
      }]
    } else {
      result.correlationSections = []
    }

    // 创建 Top Cluster Marker 可视化小节
    const topMarkerImages = []
    if (topClusterHeatmap.length > 0) {
      topMarkerImages.push(...topClusterHeatmap)
    }
    if (topDotplot.length > 0) {
      topMarkerImages.push(...topDotplot)
    }

    if (topMarkerImages.length > 0) {
      result.topMarkerSections = [{
        title: 'Heatmap/Dotplot可视化',
        description: 'Top Cluster Marker 的热图和点图展示了各细胞簇标志性基因的表达模式。',
        imageGroups: [{
          groupTitle: 'Top Cluster Marker',
          activeTab: topMarkerImages[0]?.tabName || '',
          images: topMarkerImages,
          caption: '图注：热图展示了各细胞簇Top10 Marker基因的表达水平，颜色越深表示表达量越高。点图展示了各细胞簇Top5 Marker基因的表达分布，点的大小和颜色代表表达量。'
        }]
      }]
    }

    return result
  } catch (error) {
    console.error('加载 05.annotation 图片失败:', error)
    return {
      umapSections: [],
      clusterSections: [],
      heatmapSections: [],
      correlationSections: [],
      dotplotSections: []
    }
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
      sections: [],
      clusterCorrelationImages: [] // 新增：传递给05模块的6.5图片
    }

    // 按文件前缀分组
    const groups = new Map()

    // 特殊图片组（条件性显示）
    const specialGroups = new Map()

    Object.keys(modules).forEach(path => {
      const parsed = parseFilePath(path)
      if (!parsed.isImage) return

      const filename = parsed.filename

      // 提取文件名前缀 (如 6.1.1.Sample_Percent_in_Cluster -> 6.1.1, 6.5.xxx -> 6.5)
      const prefixMatch = filename.match(/^(\d+\.\d+(?:\.\d+)?)\./)
      if (prefixMatch) {
        const prefix = prefixMatch[1]
        const imageUrl = modules[path].default
        const title = filename.replace(/^[\d.]+\s*/, '').replace(/\.(png|jpg|jpeg|svg|webp)$/, '')

        if (!groups.has(prefix)) {
          groups.set(prefix, [])
        }

        // 保存文件名中的原始标题，对于 6.6 使用自定义标题
        groups.get(prefix).push({
          tabLabel: title,
          tabName: prefix + '_' + groups.get(prefix).length,
          title: title,
          url: imageUrl,
          originalTitle: title // 保留原始标题
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

    // 定义分组标题映射 - 现在是二级分组映射
    const subGroupTitleMap = {
      '6.1.1': '比例',
      '6.1.2': '数量',
      '6.2.1': '比例',
      '6.2.2': '数量',
      '6.3.1': '比例',
      '6.3.2': '数量',
      '6.4.1': '比例',
      '6.4.2': '数量',
      '6.6.1': '相关性热图1',
      '6.6.2': '相关性热图2'
    }

    // 定义 6.6 的自定义图标题和图注
    const custom66Titles = {
      '6.6.1': '相关性热图样式1',
      '6.6.2': '相关性热图样式2'
    }

    const custom66Captions = {
      '6.6.1': '图注：热图展示了不同细胞类型之间在各样本中的比例分布相关性。红色表示正相关，蓝色表示负相关，颜色越深相关性越强。',
      '6.6.2': '图注：热图展示了不同细胞类型之间在各样本中的比例分布相关性。红色表示正相关，蓝色表示负相关，颜色越深相关性越强。'
    }

    // 定义一级分组标题
    const groupTitleMap = {
      '6.1': '样本在簇中',
      '6.2': '簇在样本中',
      '6.3': '样本在细胞类型中',
      '6.4': '细胞类型在样本中',
      '6.5': '簇与表达相关性',
      '6.6': '相关性热图'
    }

    // 按一级分组合并图片
    const mergedGroups = new Map()

    Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0])).forEach(([prefix, images]) => {
      // 提取一级分组 (如 6.1.1 -> 6.1, 6.6.1 -> 6.6)
      const mainPrefix = prefix.substring(0, 3) // 取前3位

      // 跳过 6.5，它单独处理
      if (prefix === '6.5') return

      if (!mergedGroups.has(mainPrefix)) {
        mergedGroups.set(mainPrefix, [])
      }

      // 对于 6.6，使用自定义的标题和图注
      if (mainPrefix === '6.6') {
        const customTitle = custom66Titles[prefix] || images[0]?.title || subGroupTitleMap[prefix] || prefix
        const customCaption = custom66Captions[prefix] || `图注：该图展示了${groupTitleMap[mainPrefix] || mainPrefix}的${subGroupTitleMap[prefix] || prefix}分析结果。`

        // 更新每个图片的title为自定义标题
        const updatedImages = images.map(img => ({
          ...img,
          title: customTitle
        }))

        mergedGroups.get(mainPrefix).push({
          prefix,
          subGroupTitle: customTitle,
          images: updatedImages,
          caption: customCaption
        })
      } else {
        mergedGroups.get(mainPrefix).push({
          prefix,
          subGroupTitle: subGroupTitleMap[prefix] || prefix,
          images: images,
          caption: `图注：该图展示了${groupTitleMap[mainPrefix] || mainPrefix}的${subGroupTitleMap[prefix] || prefix}分析结果。`
        })
      }
    })

    // 构建数据结构 - 6.1-6.4 和 6.6 合并的section
    Array.from(mergedGroups.entries()).sort((a, b) => a[0].localeCompare(b[0])).forEach(([mainPrefix, subGroups]) => {
      const imageGroups = []

      subGroups.forEach(subGroup => {
        imageGroups.push({
          groupTitle: subGroup.subGroupTitle,
          activeTab: subGroup.images[0]?.tabName || '',
          images: subGroup.images,
          caption: subGroup.caption
        })
      })

      // 对于6.6，标题特殊处理
      const sectionTitle = mainPrefix === '6.6' ? '细胞类型间相关性热图分析' : `${groupTitleMap[mainPrefix] || mainPrefix}的比例/数量`

      result.sections.push({
        title: sectionTitle,
        imageGroups: imageGroups
      })
    })

    // 单独处理6.5 (簇与表达相关性) - 传递给05模块使用
    if (groups.has('6.5')) {
      const images = groups.get('6.5')
      // 保存到 clusterCorrelationImages，传递给05模块
      result.clusterCorrelationImages = images
      // 不再在06模块中显示这个section
    }

    // 添加特殊图片组（条件性显示）
    if (specialGroups.has('MiloR_')) {
      const milorImages = specialGroups.get('MiloR_')
      result.sections.push({
        title: 'MiloR分析',
        description: 'MiloR是一种检测细胞组成差异的统计方法，可以识别在不同条件间显著变化的细胞群体。',
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
    return { title: '组成分析', sections: [], clusterCorrelationImages: [] }
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
          title: '质控前后细胞数量变化统计',
          url: '/src/assets/05.annotation/csv/cell_number_before_after_QC.csv'
        },
        {
          title: '双细胞检测比例统计',
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

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
          <h1>01. 数据分布情况</h1>
          <TextBlock text="展示数据质控前阶段各样本的原始数据分布情况的可视化结果，包括了检测基因数量、线粒体比例和UMI计数。通过这些图表可以了解未进行细胞质控前的数据集的基本特征。" />

          <!-- 总体跨样本分布 - 使用 ImageGalleryFullWidth -->
          <div class="subsection" id="section-01-load-overall">
            <h2>总体跨样本分布概览</h2>
            <TextBlock text="n_gene_by_counts表示检测到基因数;
             total_counts表示检测到UMI计数;
              pct_counts_mt表示细胞内线粒体基因counts比例。" />
            <ImageGalleryFullWidth v-if="loadOverallSection" :image-sections="[loadOverallSection]" />
          </div>

          <!-- 样本分布图 - 使用 ImageGallery -->
          <div class="subsection" id="section-01-load-distribution">
            <h2>单样本独立数据分布</h2>
            <!-- <TextBlock text="分布图以小提琴图形式展示各样本的质量指标分布。" />  -->
            <ImageGalleryFullWidth v-if="loadDistributionSection" :image-sections="[loadDistributionSection]" />
            <ImageGallery v-if="loadOutlierSection" :image-sections="[loadOutlierSection]" />
            <ImageGallery v-if="loadScatterSection" :image-sections="[loadScatterSection]" />
          </div>

          <!-- 异常值检测 - 使用 ImageGallery -->
          <!-- <div class="subsection" id="section-01-load-outlier">
            <h3>MAD离群细胞检测</h3>
            <TextBlock text="异常值检测用于识别偏离正常分布的细胞，这些细胞可能是低质量细胞或异常数据点。" />
            <ImageGallery v-if="loadOutlierSection" :image-sections="[loadOutlierSection]" />
          </div> -->

          <!-- 散点图分析 - 使用 ImageGallery -->
          <!-- <div class="subsection" id="section-01-load-scatter">
            <h3>单样本数据分布2</h3>
            <TextBlock text="散点图展示了每个细胞的基因数、UMI计数等质量指标在样本中的分布情况。" />
            <ImageGallery v-if="loadScatterSection" :image-sections="[loadScatterSection]" />
          </div> -->


        </section>

        <!-- 02.qc 模块 -->
        <section id="section-02-qc" class="report-section">
          <h1>02. 质量控制QC</h1>
          <TextBlock text="质量控制的第一步是从数据集中去除低质量细胞。当一个细胞检测到的基因数较少、测序深度（counts）较低、同时线粒体基因计数比例较高时，往往提示该细胞的细胞膜可能已经破损，这通常意味着细胞处于死亡或濒死状态。
                          由于这类细胞通常并非分析的主要目标，而且可能对下游分析结果产生干扰，因此需要在质量控制阶段将其剔除。
                          为识别这些低质量细胞，我们需要定义细胞质量控制（QC）的阈值。细胞 QC 通常基于以下三个关键的 QC 指标（covariates）：
                              •	每个 barcode 的总计数（测序深度，count depth）
                              •	每个 barcode 检测到的基因数
                              •	每个 barcode 中来自线粒体基因的计数比例
                          在细胞 QC 过程中，这些指标通常通过设定阈值进行过滤，因为它们往往对应于濒死细胞。如前所述，这类细胞可能由于细胞膜破裂导致胞质中的 mRNA 泄漏，仅剩下线粒体中的 mRNA，因此表现为总计数较低、检测到的基因数较少，同时线粒体 reads 比例偏高。
                          然而，在实际分析中必须联合考虑这三个 QC 指标，否则可能导致对细胞生物学信号的误判。
                          例如，某些细胞可能由于参与呼吸或能量代谢过程而天然具有较高的线粒体基因比例，这类细胞不应被简单地过滤掉。
                          同样地，计数较低或较高的细胞也可能分别对应静息状态的细胞群，或体积较大的细胞类型。因此，在针对单个 QC 指标做出过滤决策时，更推荐结合多个指标进行综合判断。
                          总体而言，建议在 QC 阶段尽量采取宽松（permissive）的过滤策略，避免过度过滤，从而误删具有生物学意义的细胞群或稀有亚群。" />

          <!-- 基因数分布 -->
          <div class="subsection" id="section-02-qc-genes">
            <h2>细胞质控阈值可视化</h2>
            <TextBlock text="展示用于质控的阈值对于在细胞数据中的分布位置，左侧展示如果使用手动阈值过滤，阈值在数据分布中的位置；右侧展示MAD自动阈值的确定结果以及手动阈值和自动计算离群细胞的关系。" />
            <ImageGallery v-if="qcGenesSection" :image-sections="[qcGenesSection]" />
            <ImageGallery v-if="qcMtSection" :image-sections="[qcMtSection]" />
          </div>

          <!-- 线粒体基因比例 -->
          <!-- <div class="subsection" id="section-02-qc-mt">
            <h3>线粒体基因比例</h3>
            <TextBlock text="线粒体基因比例过高通常表示细胞处于应激状态或濒死状态，需要适当过滤。" />
            <ImageGallery v-if="qcMtSection" :image-sections="[qcMtSection]" />
          </div> -->

          <!-- 质量控制过滤 -->
          <div class="subsection" id="section-02-qc-filter">
            <h2>质量控制过滤</h2>
            <TextBlock text="根据数据实际情况，选择使用手动阈值或者自动计算的MAD离群阈值进行过滤。（本测试项目使用MAD自动过滤）
                            分别展示手动阈值质控后数据分布和MAD自动阈值质控后数据分布。" />
            <ImageGallery v-if="qcFilterSection" :image-sections="[qcFilterSection]" />
          </div>

          <TextBlock text="质量控制过滤后，细胞质量得到显著提升，为后续分析奠定基础。" />

          <!-- CSV 文件展示 - 分开两个独立的 subsection -->
          <div v-if="qcCSVData.csvFiles.length > 0 && qcCSVData.csvFiles[0]" class="subsection" id="section-02-qc-csv-1">
            <h2>{{ qcCSVData.csvFiles[0].title }}</h2>
            <TextBlock text="表格展示了质量控制前后各样本的细胞数量变化情况，包括过滤前的原始细胞数和过滤后的高质量细胞数。" />
            <DataTable :csv-path="qcCSVData.csvFiles[0].url" caption="表注：cell_number_beforeQC 表示过滤前的细胞数，cell_number_afterQC表示过滤后的细胞数。" />
          </div>

          <div v-if="qcCSVData.csvFiles.length > 1 && qcCSVData.csvFiles[1]" class="subsection" id="section-02-qc-csv-2">
            <h2>{{ qcCSVData.csvFiles[1].title }}</h2>
            
            <TextBlock text="双细胞（doublet） 指的是在同一个细胞条形码（barcode）下测序到的两个细胞，例如两个细胞在建库过程中被同时捕获进了同一个液滴（droplet）。
            根据组成细胞的类型，双细胞可分为两类：
              •	同型双细胞（homotypic doublet）：由相同细胞类型组成（但可能来自不同个体）
              •	异型双细胞（heterotypic doublet）：由不同细胞类型或不同细胞状态组成
            同型双细胞通常难以仅凭表达矩阵进行识别，而且在很多情况下被认为对分析影响较小（innocuous），因为它们可以通过 cell hashing 或 SNP 信息加以区分。因此，同型双细胞并不是大多数双细胞检测方法的主要识别目标。
          相比之下，由不同细胞类型或状态构成的异型双细胞更为关键。这类双细胞极有可能被错误注释，并对下游分析产生显著干扰，因此双细胞的检测与去除通常是数据预处理阶段的关键步骤之一。" />
                  
            <TextBlock text="双细胞的识别方法
            双细胞可以通过以下两种主要方式进行识别：
              1.	基于统计特征的方法
            例如，双细胞通常具有较高的 reads 数量和较多的检测基因数，因此可以利用这些 QC 指标进行初步判断。
              2.	基于人工双细胞的方法
            通过构建人工双细胞（artificial doublets），并将其与真实细胞进行比较，从而识别潜在的双细胞。"/>

            <TextBlock text="目前已有多种计算效率高、性能稳定的软件包可用于双细胞检测。
            Xi 和 Li（2021） 对九种不同的双细胞检测方法进行了系统评测，从计算效率和检测准确性两个方面对其性能进行了比较。
            结果显示srublet方法在双细胞检测准确性方面表现优秀，同时具有良好的计算效率和稳定性。" />
            <TextBlock text="使用scrublet对每个样本进行双细胞预测，表格展示了各样本的双细胞率检测结果" />
            <DataTable :csv-path="qcCSVData.csvFiles[1].url" caption="表注：doublet_rate_expect表示根据样本实际细胞数量，先验估计双细胞比例；doublet_rate_estimated表示实际双细胞检测率。" />
          </div>
        </section>

        <!-- 03.integrate 模块 -->
        <section id="section-03-integrate" class="report-section">
          <h1>03. 数据整合与降维聚类</h1>
          <TextBlock text="数据整合旨在消除批次效应，使不同样本的细胞能够在同一空间中正确比较和聚类。" />

          <!-- 质控整合后各样本数据分布情况 -->
          <div class="subsection" id="section-03-integrate-violin">
            <h2>合并各样本数据</h2>
            <!-- <TextBlock text="合并样本数据。" /> -->
            <ImageGalleryFullWidth v-if="integrateViolinSection" :image-sections="[integrateViolinSection]" />
            <ImageGalleryFullWidth v-if="integrateOverlapSection" :image-sections="[integrateOverlapSection]" />
          </div>

          <!-- 基因重叠分析 -->
          <!-- <div class="subsection" id="section-03-integrate-overlap">
            <h3>基因重叠统计</h3>
            <TextBlock text="基因重叠统计展示了不同样本之间共有的基因数量，用于判断测序检测到基因的范围,合并样本的时候取基因的交集。" />
            <ImageGalleryFullWidth v-if="integrateOverlapSection" :image-sections="[integrateOverlapSection]" />
          </div> -->

          <!-- HVG选择 -->
          <div class="subsection" id="section-03-integrate-hvg">
            <h2>HVG选择</h2>
            <TextBlock text="HVG（高变基因）选择是降维分析的关键步骤，通过识别在不同细胞间表达差异最大的基因，保留生物学变异信息。" />
            <TextBlock text="特征选择（Feature Selection）
            通常，scRNA-seq 实验及其生成的数据集都聚焦于某一特定组织，因此在所有基因中，只有一小部分基因是真正具有生物学信息量且存在变异的。传统的分析方法和流程通常会基于以下两类指标，从全基因集合中筛选出约 500–2000 个基因，用于后续分析步骤：
              •	基于 变异系数（coefficient of variation） 的方法，即筛选高度变异基因（highly variable genes）
              •	基于 平均表达水平 的方法，即筛选高表达基因（highly expressed genes）
            这类方法对前期所采用的归一化策略高度敏感。如前所述，早期常用的预处理流程通常先进行 CPM（counts per million）归一化，随后对数据进行对数变换。由于对数变换无法处理精确为 0 的值，分析者往往会在对数变换前为所有归一化后的计数值添加一个较小的伪计数（pseudo count），例如加 1（即 log1p 变换）。
            但需要注意的是，伪计数的选择本身是任意的，并且可能在对数变换后引入系统性偏倚。这种任意性同样会影响特征选择过程，因为基因表达的表观变异程度依赖于所选的伪计数大小。尤其是，当伪计数取值非常接近 0 时，会显著放大那些在大量细胞中计数为 0 的基因的方差，从而影响变异性的评估 [Townes et al., 2019]。" />
              
            <TextBlock text="常选择基因子集进行分析，以减少噪声并缩短处理时间。当处理多组样本时同样如此，但关键在于需采用批次感知方式进行基因筛选。
            这是因为在整个数据集中变异显著的基因可能反映的是批次效应而非我们关注的生物学信号。此方法还能筛选出与罕见细胞身份相关的基因——例如当某细胞身份仅存在于单个样本时，其标记基因在其他样本中可能不具变异性，但在该样本中应呈现显著变异。
            通过在scanpy库的highly_variable_genes()函数中设置batch_key参数，即可实现批次感知的高变异性基因筛选。
            scanpy将分别计算每个批次的高变异性基因，并通过选择在最多批次中表现出高变异性的基因来整合结果。选用scanpy函数正是因为其内置了批次感知功能。" />

            <ImageGalleryFullWidth v-if="integrateHVGSection" :image-sections="[integrateHVGSection]" />
          </div>

          <!-- PCA分析 -->
          <div class="subsection" id="section-03-integrate-pca">
            <h2>PCA分析</h2>
            <TextBlock text="并非所有基因都具有信息价值，也并非所有基因都对基于表达谱的细胞类型聚类任务至关重要。已通过特征选择实现数据降维，下一步可借助降维算法进一步降低单细胞RNA测序数据的维度。这些算法在预处理过程中扮演着关键角色，既能降低数据复杂性，又便于可视化分析。目前已有多种降维技术被开发并应用于单细胞数据分析领域。" />
            <TextBlock text="PCA（主成分分析）是一种常用的降维方法，通过正交变换将高维数据转换到低维空间，保留主要方差信息。" />
            <TextBlock text="由于单细胞RNA测序（scRNA-seq）面临维度诅咒问题，并非所有特征都对理解数据集的内在动态至关重要，且其中存在固有冗余[Grün et al., 2014]。PCA通过对原始数据集进行正交变换，生成一组互不相关的变量——即主成分（PCs）。这些主成分是原始数据中特征的线性组合，并按方差递减顺序排序以定义变换。排序过程中通常首个主成分对应最大方差，而方差最低的主成分将被舍弃，从而在不丢失信息的前提下有效降低数据维度。" />
            <ImageGalleryFullWidth v-if="integratePCASection" :image-sections="[integratePCASection]" />
            <TextBlock text="根据拐点信息，选择前30个主成分进行下游分析。" />
          </div>

          <!-- 未去批次效应降维情况 -->
          <div class="subsection" id="section-03-integrate-unintegrate">
            <h2>未去批次效应降维</h2>
            <TextBlock text="t-SNE是一种基于图论的非线性降维技术，可将高维数据投影至二维或三维空间。该方法基于数据点间的高维欧几里得距离定义高斯概率分布，随后采用学生t分布在低维空间重建概率分布，并通过梯度下降法优化嵌入结果。" />
            <TextBlock text="UMAP是一种基于图的非线性降维技术，其原理与t-SNE基本相似。该方法通过构建数据集的高维图表示，并优化低维图表示使其结构尽可能接近原始图，从而实现降维目标。" />
            <ImageGallery v-if="integrateUnintegrateSection" :image-sections="[integrateUnintegrateSection]" />
          </div>

          <!-- 批次效应矫正后降维结果 -->
          <div class="subsection" id="section-03-integrate-batch">
            <h2>批次效应矫正</h2>
            <TextBlock text="批量效应去除方法在这三个步骤中的每一步都可能有所不同。它们可能使用各种线性或非线性降维方法、线性或非线性批次效应模型，也可能输出不同格式的批次校正数据。总的来说，去除批量效应的方法分为 4 类。按照发展顺序，分别是全局模型、线性嵌入模型、基于图的方法和深度学习方法。
                            全局模型源于批量转录组学，将批次效应建模为所有细胞中的一致效应（加法和/或乘法）。一个常见的例子是 ComBat [Johnson 等人，2007 年]。
                            线性嵌入模型是第一种针对单细胞的批次去除方法。这些方法通常使用奇异值分解（SVD）的一种变体来嵌入数据，然后在嵌入中寻找各批次中相似细胞的局部邻域，并利用这些邻域以局部自适应（非线性）方式校正批次效应。这些方法通常使用 SVD 负载将数据投影回基因表达空间，但也可能只输出校正后的嵌入。这是最常见的一组方法，突出的例子包括开创性的互近邻（MNN）方法[Haghverdi 等人，2018 年]（不执行任何降维）、Seurat 整合[Butler 等人，2018 年；Stuart 等人，2019 年]、Scanorama [Hie 等人，2019 年]、FastMNN [Haghverdi 等人，2018 年]和 Harmony [Korsunsky 等人，2019 年]。
                            基于图形的方法通常是运行速度最快的方法。这些方法使用近邻图来表示每个批次的数据。批次效应是通过强制连接不同批次的细胞，然后通过修剪强制边来允许细胞类型组成的差异来纠正的。这些方法中最突出的例子是批平衡 k 近邻（BBKNN）方法 [Polański 等人，2019]。
                            深度学习（DL）方法是最新、最复杂的批量效应去除方法，通常需要最多的数据才能获得良好的性能。大多数深度学习整合方法都是基于自动编码器网络，要么以条件变异自动编码器（CVAE）中的批次协变量为降维条件，要么在嵌入空间中拟合局部线性校正。DL 方法的突出例子有 scVI [Lopez 等人，2018]、scANVI [Xu 等人，2021] 和 scGen [Lotfollahi 等人，2019]。" />
            <ImageGallery v-if="integrateBatchSection" :image-sections="[integrateBatchSection]" />
          </div>

          <!-- 聚类分析 -->
          <div class="subsection" id="section-03-integrate-cluster">
            <h2>聚类分析</h2>
            <TextBlock text="细胞结构的识别与聚类分析
            通过预处理和可视化分析，我们能够对 scRNA-seq 数据集进行整体描述，并有效降低其维度。在这一阶段，主要通过嵌入和可视化来理解数据的基本特征，但此时细胞仍然是以较为抽象的形式存在。单细胞分析中的下一个关键步骤，是在数据集中识别细胞的内在结构。
            在 scRNA-seq 数据分析中，细胞结构通常通过识别与已知细胞状态或细胞周期阶段相关的细胞身份（cell identity）来描述，这一过程通常被称为细胞身份注释（cell identity annotation）。为此，我们需要将具有相似特征的细胞组织成不同的簇（cluster），以推断相似细胞的生物学身份。
            从方法角度看，聚类本身是一个典型的无监督机器学习问题。在降维后的表达空间中，通过最小化簇内细胞之间的距离，可以得到细胞聚类结果。在这一过程中，表达空间用于刻画细胞之间的基因表达相似性，通常基于降维表示进行计算。" />
            <TextBlock text="KNN 图与社区检测
            K 近邻（k-nearest neighbour, KNN）图由表示数据集中细胞的节点构成。首先，在 PCA 降维后的表达空间中计算所有细胞之间的欧氏距离矩阵，然后将每个细胞与其最相似的 K 个细胞相连。K 的取值通常介于 5 到 100 之间，具体取决于数据集的规模。
            KNN 图通过将表达空间中的高密度区域映射为图中高度连接的区域，从而反映了表达数据的内在拓扑结构 [Wolf et al., 2019]。在 KNN 图中，这些高密度区域通常通过**社区检测（community detection）**方法来识别，例如 Leiden 和 Louvain 算法 [Blondel et al., 2008]。" />
            <TextBlock text="Leiden 算法
              Leiden 算法是 Louvain 算法的改进版本，在单细胞 RNA 测序数据分析中已被证明优于多种其他聚类方法（[Du et al., 2018; Freytag et al., 2018; Weber and Robinson, 2016]）。由于 Louvain 算法目前已不再维护，因此更推荐使用 Leiden 算法。
              基于以上原因，我们建议在单细胞数据集中，在单细胞 KNN 图上应用 Leiden 算法进行聚类分析 [Traag et al., 2019]。
              Leiden 算法通过比较簇内细胞之间的连接数与在随机情况下预期的连接数来构建聚类，从而识别表达空间中紧密连接的细胞群体。" />

            <ImageGallery v-if="integrateClusterSection" :image-sections="[integrateClusterSection]" />
          </div>

          <!-- 聚类网格 -->
          <div class="subsection" id="section-03-integrate-grid">
            <h2>多分辨率聚类结果汇总</h2>
            <!-- <TextBlock text="展示了不同聚类分辨率下的聚类效果，帮助选择最优的聚类参数。" /> -->
            <ImageGallery v-if="integrateGridSection" :image-sections="[integrateGridSection]" />
          </div>

          <!-- 聚类树 -->
          <div class="subsection" id="section-03-integrate-tree">
            <h2>不同分辨率下Cluster追踪</h2>
            <TextBlock text="聚类树展示了细胞簇之间随着分辨率变化的层次关系，有助于理解细胞类型随分辨率改变的路径。" />
            <ImageGalleryFullWidth v-if="integrateTreeSection" :image-sections="[integrateTreeSection]" />
          </div>

          <!-- QC特征可视化 - 细胞周期分析 -->
          <div class="subsection" id="section-03-integrate-qc-cellcycle">
            <h2>细胞周期分析</h2>
            <TextBlock text="根据细胞对G2/M期和S期标记物的表达水平为其分配评分。这些标记物在表达水平上应呈负相关，而同时不表达这两类标记物的细胞很可能处于非周期状态且处于G1期。
                            在scanpy.tl.score_genes_cell_cycle()函数中进行评分，该函数将S期和G2/M期评分存储于对象元数据中，同时记录每个细胞预测的G2M期、S期或G1期分类。" />
            <ImageGalleryFullWidth v-if="integrateQCCellCycleSection" :image-sections="[integrateQCCellCycleSection]" />
          </div>

          <!-- QC特征可视化 - 双细胞检测 -->
          <div class="subsection" id="section-03-integrate-qc-doublets">
            <h2>双细胞分布可视化</h2>
            <TextBlock text="在质控步骤中进行的双细胞检测，如果整合步骤选择去除双细胞的样本数据进行分析，则看不到双细胞；
            如果整合步骤选择保留双细胞，则可以在分析结果中观察到双细胞的分布情况。" />
            <ImageGalleryFullWidth v-if="integrateQCDoubletsSection" :image-sections="[integrateQCDoubletsSection]" />
          </div>

          <!-- QC特征可视化 - 关键QC特征 -->
          <div class="subsection" id="section-03-integrate-qc-key">
            <h2>关键QC特征</h2>
            <TextBlock text="汇总多个关键的元数据，包括：样本、患者、组织、处理条件、批次、UMI计数、基因数、线粒体基因比例、核糖体基因比例、血红蛋白基因比比例、双细胞预测结果以及细胞周期结果，在不同降维方法下的分布情况。" />
            <ImageGalleryFullWidth v-if="integrateQCKeySection" :image-sections="[integrateQCKeySection]" />
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
          <h1>05. 细胞注释</h1>
          <TextBlock text="细胞注释是单细胞分析的核心环节，通过Marker基因表达模式为每个细胞簇赋予生物学意义。" />

          <!-- 图片部分 - 使用全宽组件 -->

          <!-- 表格部分 -->
          <div class="subsection" id="section-05-annotation-table">
            <h2>5.1 Cluster Marker基因表</h2>
            <TextBlock text="scanpy.tl.rank_genes_groups函数对每个Cluster计算特征基因；
            表格详细列出了每个细胞簇的Marker基因信息，包括基因名称、表达变化倍率、统计显著性等指标。" />
            <DataTable csv-path="/src/assets/05.annotation/csv/Scanpy_markers_per_cluster.csv" caption="表注：p_val_adj表示校正后的p值，logFC表示对数 fold change，pts表示基因在该簇的表达比例，pts_rest表示该基因在其他簇的表达比例" />
          </div>
        

          <div class="subsection" id="section-05-annotation-cluster">
            <h2>5.2 Top Cluster Marker 可视化</h2>
            <TextBlock text="Marker基因是在特定细胞簇中高表达且在其他簇中低表达的基因，作为细胞注释的重要依据。
            这里展示每个Cluster计算出的Top Marker基因。" />
            <ImageGalleryFullWidth :image-sections="annotationClusterSections" />
            <TextBlock text="Top9 Marker展示了每个细胞簇中表达量最高的9个特征基因。" />
          </div>

          <div class="subsection" id="section-05-annotation-correlation">
            <h2>5.3 Cluster 表达相关性分析</h2>
            <TextBlock text="每个基因计算在Cluster内部的均值，然后统计Cluster之间表达水平的相关性，来判断哪些Cluster具有相似的表达模式。" />
            <ImageGalleryFullWidth :image-sections="annotationCorrelationSections" />
          </div>


          <div class="subsection" id="section-05-annotation-umap-content">
            <h2>5.4 细胞类型注释</h2>
            <TextBlock text="UMAP（Uniform Manifold Approximation and Projection）是一种非线性降维方法，能够很好地展示高维数据在低维空间中的分布。" />
            <ImageGalleryFullWidth :image-sections="annotationUMAPSections" />
          </div>

          <div class="subsection" id="section-05-annotation-heatmap">
            <h2>5.5 细胞类型Marker基因展示</h2>
            <TextBlock text="同时展示多个基因在多个细胞簇中的表达水平，颜色深浅代表表达量高低。
            log1p代表用标准化后的实际表达量进行热图绘制；scale表示在热图中对每个基因进行Zscore缩放(放大差异)。" />
            <ImageGalleryFullWidth :image-sections="annotationHeatmapSections" />
          </div>

          <div class="subsection" id="section-05-annotation-dotplot">
            <h2>5.5 点图</h2>
            <TextBlock text="点图展示了Marker基因在不同细胞簇中的表达分布情况，横轴表示细胞簇，纵轴表示基因，点的大小和颜色代表表达量。" />
            <ImageGalleryFullWidth :image-sections="annotationDotplotSections" />
          </div>
        </section>
        <!-- 06.compositional 模块 -->
        <section id="section-06-compositional" class="report-section">
          <h1>06. 细胞组成统计分析</h1>
          <TextBlock text="组成分析关注不同样本、簇或细胞类型之间的数量、比例关系，揭示样本间或条件下的细胞组成差异。" />
          <TextBlock text="除了基因表达模式的变化外，细胞组成（如细胞类型的比例）在不同条件下也会发生改变。例如，特定药物可能诱导某类细胞发生转分化，这种变化将体现在细胞身份组成中。要准确确定细胞身份聚类比例及背景变异，需具备充足的细胞和样本数量。成分分析可在细胞身份聚类层面进行，其形式可为已知细胞类型或细胞状态，例如对应近期受扰动影响的细胞。" />

          <!-- 样本在簇中的比例/数量 -->
          <div class="subsection" id="section-06-compositional-cluster">
            <h2>样本在簇中的比例/数量</h2>
            <TextBlock text="分析各样本在不同细胞簇中的分布情况，揭示Cluster间样本组成差异。" />
            <ImageGallery v-if="compositionalClusterSection" :image-sections="[compositionalClusterSection]" />
          </div>

          <!-- 簇在样本中的比例/数量 -->
          <div class="subsection" id="section-06-compositional-sample">
            <h2>簇在样本中的比例/数量</h2>
            <TextBlock text="分析各细胞簇在不同样本中的丰度变化，识别差异显著的Cluster类型。" />
            <ImageGallery v-if="compositionalSampleSection" :image-sections="[compositionalSampleSection]" />
          </div>

          <!-- 样本在细胞类型中的比例/数量 -->
          <div class="subsection" id="section-06-compositional-celltype">
            <h2>样本在细胞类型中的比例/数量</h2>
            <TextBlock text="分析各样本在不同细胞类型中的分布情况，揭示细胞类型间样本组成差异。" />
            <ImageGallery v-if="compositionalCelltypeSection" :image-sections="[compositionalCelltypeSection]" />
          </div>

          <!-- 细胞类型在样本中的比例/数量 -->
          <div class="subsection" id="section-06-compositional-celltype-sample">
            <h2>细胞类型在样本中的比例/数量</h2>
            <TextBlock text="分析各细胞类型在不同样本中的丰度变化，识别差异显著的细胞类型。" />
            <ImageGallery v-if="compositionalCelltypeSampleSection" :image-sections="[compositionalCelltypeSampleSection]" />
          </div>

          <!-- 相关性热图 -->
          <div class="subsection" id="section-06-compositional-heatmap">
            <h2>细胞类型分布相关性</h2>
            <TextBlock text="热图展示各细胞类型在样本间的相关性程度，相关性越高表示比例细胞数量分布越相似。" />
            <ImageGallery v-if="compositionalHeatmapSection" :image-sections="[compositionalHeatmapSection]" />
          </div>

          <!-- MiloR分析 -->
          <div class="subsection" id="section-06-compositional-milor">
            <h2>MiloR分析</h2>
            <TextBlock text="MiloR 是一种基于 k 近邻（kNN）图邻域的单细胞差异丰度分析方法，其核心思想是在降维表达空间中构建 kNN 图，并从中定义大量重叠的局部邻域（neighborhoods），再在样本层面比较这些邻域在不同实验条件下的细胞丰度变化。
            该方法通过广义线性模型显式建模生物学重复与样本间变异，从而避免对离散聚类边界的强依赖，特别适用于刻画连续细胞状态或渐变谱系中的组成变化。
            MiloR 由英国 Wellcome Sanger Institute 的 Marioni 团队开发，发表于 Dann et al., Nature Biotechnology, 2022。" />
            <ImageGalleryFullWidth v-if="compositionalMilorSection" :image-sections="[compositionalMilorSection]" />
          </div>

          <!-- Odds Ratio分析 -->
          <div class="subsection" id="section-06-compositional-or">
            <h2>Odds Ratio分析</h2>
            <TextBlock text="Odds Ratio（优势比）用于衡量细胞类型在不同条件下的富集程度，OR值大于1表示富集。
            源自流行病学和临床统计的效应量指标，在单细胞分析中常用于评估某一细胞群在不同条件（如疾病与对照）下的相对富集程度。
            该方法基于细胞类型与实验条件构建 2×2 列联表，并通过优势比量化条件与细胞身份之间的关联强度，适用于细胞类型或聚类定义清晰的场景。
            OR 方法具有良好的可解释性，常与 Fisher 精确检验或逻辑回归结合使用，但对连续细胞状态和簇内异质性不敏感。" />
            <ImageGalleryFullWidth v-if="compositionalORSection" :image-sections="[compositionalORSection]" />
          </div>

          <!-- Roe分析 -->
          <div class="subsection" id="section-06-compositional-roe">
            <h2>Roe分析</h2>
            <TextBlock text="Ro/e 方法通过比较某一细胞群在特定条件下的实际观察比例与在无条件效应假设下的期望比例，来衡量该细胞群的相对富集或耗竭程度。
            该方法不依赖复杂统计模型，具有直观、易解释的特点，常用于单细胞组成变化的探索性分析和可视化。Ro/e 在单细胞免疫学研究中被广泛采用作为描述性比例分析策略。" />
            <ImageGalleryFullWidth v-if="compositionalRoeSection" :image-sections="[compositionalRoeSection]" />
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
      { id: 'section-01-load-distribution', title: '单样本分布可视化' }
      // { id: 'section-01-load-outlier', title: '异常值检测' },
      // { id: 'section-01-load-scatter', title: '散点图分析' }
    ]
  },
  {
    id: '02-qc',
    title: '02. 质量控制',
    items: [
      { id: 'section-02-qc-genes', title: 'QC阈值可视化' },
      // { id: 'section-02-qc-mt', title: '线粒体基因比例' },
      { id: 'section-02-qc-filter', title: '质量控制过滤' },
      { id: 'section-02-qc-csv-1', title: '质控前后细胞数量变化统计' },
      { id: 'section-02-qc-csv-2', title: '双细胞检测比例统计' }
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
      { id: 'section-05-annotation-umap-content', title: '5.3 细胞类型注释' },
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
const loadOverallSection = computed(() => loadImageSections.value.find(s => s.title === '跨样本分布可视化'))
const loadDistributionSection = computed(() => loadImageSections.value.find(s => s.title === '单样本分布可视化'))
const loadOutlierSection = computed(() => loadImageSections.value.find(s => s.title === 'MAD异常值检测'))
const loadScatterSection = computed(() => loadImageSections.value.find(s => s.title === '其他统计可视化'))

// 02.qc 图片数据
const qcData = loadQCImages()
const qcImageSections = ref(qcData.sections)

// 02.qc 各个section的ref（用于单独显示）
const qcGenesSection = computed(() => qcImageSections.value.find(s => s.title === '阈值在基因数和UMI计数中的分布'))
const qcMtSection = computed(() => qcImageSections.value.find(s => s.title === '阈值在线粒体基因比例中的分布'))
const qcFilterSection = computed(() => qcImageSections.value.find(s => s.title === '质量控制过滤后数据分布'))

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
const integrateClusterSection = computed(() => integrateImageSections.value.find(s => s.title === 'Leiden聚类分析'))
const integrateGridSection = computed(() => integrateImageSections.value.find(s => s.title === '多分辨率聚类结果汇总可视化'))
const integrateQCCellCycleSection = computed(() => integrateImageSections.value.find(s => s.title === '细胞周期分析'))
const integrateQCDoubletsSection = computed(() => integrateImageSections.value.find(s => s.title === '双细胞分布'))
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

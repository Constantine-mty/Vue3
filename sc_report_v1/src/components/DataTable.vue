<template>
  <div class="data-table">
    <!-- 搜索和筛选 -->
    <div class="table-toolbar">
      <div class="page-size-selector">
        <span class="page-size-label">entries per page show:</span>
        <el-select
          v-model="pageSize"
          @change="handleSizeChange"
          style="width: 120px"
        >
          <el-option
            v-for="size in [10, 20, 50, 100]"
            :key="size"
            :label="size + ' 条'"
            :value="size"
          />
        </el-select>
      </div>
      <el-input
        v-model="searchText"
        placeholder="输入关键字进行模糊搜索"
        clearable
        style="width: 300px"
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- 表格 -->
    <el-table
      :data="currentPageData"
      stripe
      border
      style="width: 100%"
      :default-sort="{ sortMethod: (a, b) => a.id - b.id }"
    >
      <el-table-column
        v-for="column in columns"
        :key="column.key"
        :prop="column.key"
        :label="column.label"
        :width="column.width"
        :sortable="column.sortable"
      >
        <template #default="{ row, $index }">
          {{ formatCellValue(row[column.key], column.key, row.id) }}
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-text type="info">共 {{ filteredData.length }} 条记录</el-text>
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="filteredData.length"
        layout="prev, pager, next, jumper"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 下方表注 -->
    <div v-if="caption" class="table-caption" :class="{ multiLine: caption.includes('\n') }">
      {{ caption }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Papa from 'papaparse'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  csvPath: {
    type: String,
    default: '/src/assets/Scanpy_markers_per_cluster.csv'
  },
  caption: {
    type: String,
    default: ''
  },
  searchColumns: {
    type: Array,
    default: () => null // 如果指定，则只搜索这些列；如果为null，则搜索所有列
  }
})

// 搜索
const searchText = ref('')

// 分页
const currentPage = ref(1)
const pageSize = ref(20)

// 原始数据
const tableData = ref([])

// 表格列
const columns = ref([])

// 存储原始字符串值，用于判断是否添加小数点
const originalValues = ref({})

// 过滤后的数据
const filteredData = computed(() => {
  let data = tableData.value

  // 模糊搜索
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    data = data.filter(item => {
      // 如果指定了搜索列，则只搜索这些列
      if (props.searchColumns && props.searchColumns.length > 0) {
        return props.searchColumns.some(colKey =>
          String(item[colKey]).toLowerCase().includes(search)
        )
      }
      // 否则搜索所有列
      return Object.values(item).some(val =>
        String(val).toLowerCase().includes(search)
      )
    })
  }

  return data
})

// 当前页数据
const currentPageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

// 格式化单元格值
const formatCellValue = (value, columnKey, rowIndex) => {
  if (value === null || value === undefined) return '-'

  // 数值类型需要特殊处理
  if (typeof value === 'number') {
    // 获取原始字符串值
    const originalKey = `${rowIndex}_${columnKey}`
    const originalValue = originalValues.value[rowIndex]?.[originalKey]

    // 如果原始值存在，检查是否有小数点
    if (originalValue !== undefined) {
      const originalStr = String(originalValue).trim()
      // 如果原始值有小数点，保留2位；如果是整数，不添加小数
      if (originalStr.includes('.')) {
        // 极小值用科学计数法
        if (Math.abs(value) < 0.001 && value !== 0) {
          return value.toExponential(2)
        }
        return value.toFixed(2)
      } else {
        // 整数直接返回原值，不添加.00
        return String(value)
      }
    }

    // 没有原始值时的默认处理
    if (Math.abs(value) < 0.001 && value !== 0) {
      return value.toExponential(2)
    }
    return value.toFixed(2)
  }

  return value
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
}

// 分页处理
const handlePageChange = (page) => {
  currentPage.value = page
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

// 加载CSV数据
const loadCSVData = () => {
  Papa.parse(props.csvPath, {
    header: true,
    download: true,
    complete: (results) => {
      // 获取表头作为列
      const headers = results.meta.fields || []
      columns.value = headers.map(key => ({
        key: key,
        label: key,
        sortable: true
      }))

      // 解析数据
      tableData.value = results.data.map((row, index) => {
        const rowData = { id: index }
        const rowOriginal = {}

        Object.entries(row).forEach(([k, v]) => {
          // 保存原始值
          rowOriginal[`${index}_${k}`] = v

          // 如果可以转换为数值，则转换
          if (!isNaN(parseFloat(v))) {
            rowData[k] = parseFloat(v)
          } else {
            rowData[k] = v
          }
        })

        // 保存原始值
        originalValues.value[index] = rowOriginal

        return rowData
      }).filter(row => Object.values(row).some(v => v !== null && v !== ''))
    }
  })
}

onMounted(() => {
  loadCSVData()
})
</script>

<style scoped>
.data-table {
  padding: 10px 0;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-size-label {
  font-size: 14px;
  color: #606266;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

:deep(.el-table) {
  font-size: 13px;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  color: #303133;
  font-weight: 600;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: #fafafa;
}

/* 表注样式 - 较小字体 */
.table-caption {
  font-size: 12px;
  line-height: 1.6;
  color: #909399;
  margin-top: 15px;
  padding: 8px 12px;
  background-color: #fafafa;
  border-radius: 4px;
}

/* 多行表注左对齐 */
.multiLine {
  text-align: left !important;
  white-space: pre-line;
}
</style>

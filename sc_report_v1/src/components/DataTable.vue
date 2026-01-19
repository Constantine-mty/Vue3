<template>
  <div class="data-table">
    <!-- 搜索和筛选 -->
    <div class="table-toolbar">
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
        <template #default="{ row }">
          {{ formatCellValue(row[column.key], column.key) }}
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="filteredData.length"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
      <el-text type="info">共 {{ filteredData.length }} 条记录</el-text>
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

// 过滤后的数据
const filteredData = computed(() => {
  let data = tableData.value

  // 模糊搜索
  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    data = data.filter(item => {
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
const formatCellValue = (value, key) => {
  if (value === null || value === undefined) return '-'

  // 数值类型保留2位小数
  if (typeof value === 'number') {
    // 极小值用科学计数法
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
      tableData.value = results.data.map((row, index) => ({
        id: index,
        ...row,
        // 尝试转换数值
        ...Object.fromEntries(
          Object.entries(row).map(([k, v]) => [
            k,
            !isNaN(parseFloat(v)) ? parseFloat(v) : v
          ])
        )
      })).filter(row => Object.values(row).some(v => v !== null && v !== ''))
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
  align-items: center;
  margin-bottom: 20px;
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
</style>

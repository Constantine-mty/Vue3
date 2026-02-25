import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

// CSV 文件映射配置
const csvFiles = [
  {
    source: './src/assets/05.annotation/csv/Scanpy_markers_per_cluster.csv',
    target: './src/assets/csv-bundle.js',
    varName: 'scanpyMarkersCSV'
  },
  {
    source: './src/assets/05.annotation/csv/cell_number_before_after_QC.csv',
    target: './src/assets/csv-bundle.js',
    varName: 'cellNumberQC',
    append: true
  },
  {
    source: './src/assets/05.annotation/csv/doublets_rate.csv',
    target: './src/assets/csv-bundle.js',
    varName: 'doubletsRate',
    append: true
  }
]

// 转换 CSV 为 JavaScript 字符串常量
function csvToJs(csvPath, varName) {
  const absolutePath = path.resolve(projectRoot, csvPath)
  const csvContent = fs.readFileSync(absolutePath, 'utf-8')

  // 转义特殊字符
  const escapedContent = csvContent
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\r\n/g, '\\n')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\n')

  return `export const ${varName} = \`${escapedContent}\`\n`
}

// 构建导出文件
const targetPath = path.resolve(projectRoot, './src/assets/csv-bundle.js')

// 清空或创建目标文件
if (fs.existsSync(targetPath)) {
  fs.unlinkSync(targetPath)
}

// 写入所有 CSV
let content = '/**\n * Auto-generated CSV bundle\n * Generated at: ' + new Date().toISOString() + '\n * DO NOT EDIT MANUALLY\n */\n\n'

csvFiles.forEach(file => {
  const csvJs = csvToJs(file.source, file.varName)
  content += csvJs
})

fs.writeFileSync(targetPath, content, 'utf-8')
console.log('✓ CSV bundle generated:', targetPath)

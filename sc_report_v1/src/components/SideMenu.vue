<template>
  <div class="side-menu" :class="{ collapsed: isCollapsed }">
    <div class="menu-header">
      <span v-if="!isCollapsed" class="menu-title">导航菜单</span>
      <el-button
        :icon="isCollapsed ? Expand : Fold"
        circle
        size="small"
        @click="toggleCollapse"
        class="collapse-btn"
      />
    </div>

    <el-menu
      ref="menuRef"
      :default-active="activeSection"
      class="menu-vertical"
      :collapse="isCollapsed"
      @select="handleSelect"
      :unique-opened="true"
      :default-openeds="defaultOpenMenus"
    >
      <el-sub-menu
        v-for="category in menuData"
        :key="category.id"
        :index="category.id"
      >
        <template #title>
          <el-icon><Document /></el-icon>
          <span>{{ category.title }}</span>
        </template>
        <el-menu-item
          v-for="item in category.items"
          :key="item.id"
          :index="item.id"
        >
          {{ item.title }}
        </el-menu-item>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { Document, Expand, Fold } from '@element-plus/icons-vue'

const props = defineProps({
  menuData: {
    type: Array,
    required: true
  },
  activeSection: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['menu-select'])

const isCollapsed = ref(false)

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const handleSelect = (index) => {
  emit('menu-select', index)
}

// 计算应该展开的菜单
const defaultOpenMenus = computed(() => {
  if (props.activeSection) {
    // 判断当前激活的section属于哪个主菜单
    const parentCategory = props.menuData.find(category => {
      return category.items.some(item => item.id === props.activeSection)
    })

    if (parentCategory) {
      // 返回应该展开的菜单ID
      return [parentCategory.id]
    }
  }
  return []
})

// 通过ref获取菜单实例,手动控制展开
const menuRef = ref(null)

// 监听 activeSection 变化,手动控制菜单展开状态
watch(() => props.activeSection, async (newVal) => {
  if (newVal && !isCollapsed.value && menuRef.value) {
    await nextTick()
    const parentCategory = props.menuData.find(category => {
      return category.items.some(item => item.id === newVal)
    })
    if (parentCategory) {
      // 关闭所有子菜单
      props.menuData.forEach(cat => {
        if (cat.id !== parentCategory.id) {
          const subMenu = menuRef.value?.openeds
          if (subMenu?.includes(cat.id)) {
            menuRef.value.closeMenu(cat.id)
          }
        }
      })
      // 打开目标菜单
      menuRef.value.openMenu(parentCategory.id)
    }
  }
}, { immediate: true })
</script>

<style scoped>
.side-menu {
  width: 260px;
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
  box-shadow: 3px 0 10px rgba(0, 0, 0, 0.08);
  overflow-y: auto;
  height: calc(100vh - 80px);
  position: sticky;
  top: 80px;
  transition: width 0.3s ease;
}

.side-menu.collapsed {
  width: 64px;
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e8eaed;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.menu-title {
  color: white;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.collapse-btn {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: white;
  transition: all 0.3s ease;
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.menu-vertical {
  border-right: none;
  background: transparent;
}

:deep(.el-sub-menu) {
  margin: 4px 0;
}

:deep(.el-sub-menu__title) {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  border-radius: 8px;
  margin: 0 8px;
  padding: 0 12px;
  transition: all 0.3s ease;
}

:deep(.el-sub-menu__title:hover) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  color: #667eea;
}

:deep(.el-sub-menu__title .el-icon) {
  color: #667eea;
  font-size: 18px;
}

:deep(.el-menu-item) {
  font-size: 13px;
  color: #5a6c7d;
  border-radius: 6px;
  margin: 2px 8px;
  padding: 0 12px 0 40px !important;
  transition: all 0.3s ease;
}

:deep(.el-menu-item:hover) {
  background: rgba(102, 126, 234, 0.08);
  color: #667eea;
  transform: translateX(4px);
}

:deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

:deep(.el-sub-menu.is-opened > .el-sub-menu__title) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
}

/* 滚动条美化 */
:deep(.side-menu)::-webkit-scrollbar {
  width: 6px;
}

:deep(.side-menu)::-webkit-scrollbar-track {
  background: #f1f3f5;
}

:deep(.side-menu)::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
}

:deep(.side-menu)::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #5568d3 0%, #6a4a8b 100%);
}
</style>

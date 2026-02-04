<template>
  <div class="side-menu" :class="{ collapsed: isCollapsed }">
    <div class="menu-header">
      <span v-if="!isCollapsed" class="menu-title">目录：生物信息分析章节</span>
      <!-- 原代码: :icon="isCollapsed ? Expand : Fold" -->
      <el-button
        circle
        size="small"
        @click="toggleCollapse"
        class="collapse-btn"
      >
        <template #icon>
          <!-- <component :is="isCollapsed ? Expand : Fold" /> -->
          <svg t="1770112341382" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9050" width="200" height="200"><path d="M193.422222 506.311111c85.333333 0 153.6-62.577778 167.822222-142.222222H995.555556v-56.888889H361.244444c-14.222222-79.644444-82.488889-142.222222-167.822222-142.222222-93.866667 0-170.666667 76.8-170.666666 170.666666s76.8 170.666667 170.666666 170.666667z m0-284.444444c62.577778 0 113.777778 51.2 113.777778 113.777777s-51.2 113.777778-113.777778 113.777778-113.777778-51.2-113.777778-113.777778 51.2-113.777778 113.777778-113.777777zM1001.244444 713.955556h-108.088888c-14.222222-79.644444-82.488889-142.222222-167.822223-142.222223-85.333333 0-153.6 62.577778-167.822222 142.222223H28.444444v56.888888h531.911112c14.222222 79.644444 82.488889 142.222222 167.822222 142.222223s153.6-62.577778 167.822222-142.222223h108.088889v-56.888888z m-275.911111 142.222222c-62.577778 0-113.777778-51.2-113.777777-113.777778s51.2-113.777778 113.777777-113.777778 113.777778 51.2 113.777778 113.777778-51.2 113.777778-113.777778 113.777778z" fill="#2c2c2c" p-id="9051"></path></svg>
        </template>
      </el-button>
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
          <!-- <el-icon><Document /></el-icon> -->
          <svg t="1770112454019" class="icon section-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="10953" width="200" height="200"><path d="M969.970526 850.378105l-208.545684-216.522105 4.149895-6.197895a401.434947 401.434947 0 0 0 68.473263-224.390737c0-222.261895-180.762947-403.051789-403.051789-403.051789-222.261895 0-403.024842 180.789895-403.024843 403.051789 0 107.708632 41.930105 208.896 118.029474 284.995369a400.357053 400.357053 0 0 0 284.995369 118.056421 400.545684 400.545684 0 0 0 181.248-43.169684v-7.194948l227.435789 224.175158a91.136 91.136 0 0 0 65.077895 26.974316c24.629895 0 47.696842-9.539368 65.104842-26.974316a92.510316 92.510316 0 0 0 0.107789-129.751579z m-541.426526-108.597894c-187.984842 0-340.992-152.899368-340.992-340.992 0-187.957895 153.007158-340.965053 340.992-340.965053 187.742316 0.215579 340.749474 153.114947 340.965053 340.965053 0 188.092632-153.007158 340.992-340.965053 340.992z m489.256421 205.608421a35.166316 35.166316 0 0 1-13.150316 2.613894 35.031579 35.031579 0 0 1-25.061052-10.671158l-212.48-209.461894 8.434526-6.413474c15.279158-11.695158 29.776842-24.522105 43.169684-38.103579l6.629053-6.736842 204.045473 211.806316c6.521263 6.413474 10.24 15.386947 10.132211 24.602947a34.546526 34.546526 0 0 1-21.719579 32.390737z" fill="#1296db" p-id="10954"></path><path d="M339.590737 609.360842c-61.493895-34.411789-98.142316-79.279158-126.464-154.947368l-1.913263-4.473263a24.252632 24.252632 0 0 0-22.042948-12.826948 21.638737 21.638737 0 0 0-7.194947 1.455158 24.037053 24.037053 0 0 0-15.063579 26.650947l1.913263 6.197895c31.717053 84.291368 75.210105 137.269895 145.381053 177.178948 0.107789 0.107789 9.647158 5.847579 13.258105 5.847578l3.584 0.10779h0.134737a23.956211 23.956211 0 0 0 6.844631-1.347368c12.126316-4.608 18.324211-18.324211 13.743158-30.585264a22.905263 22.905263 0 0 0-12.18021-13.258105zM176.235789 413.372632a25.869474 25.869474 0 0 0 14.740211-13.042527 25.438316 25.438316 0 0 0 1.131789-19.671579 25.707789 25.707789 0 1 0-15.872 32.714106z" fill="#1296db" p-id="10955"></path><path d="M725.234526 678.480842l-6.629052 6.736842c-13.392842 13.743158-27.890526 26.543158-43.196632 38.130527l-8.407579 6.413473 212.48 209.434948c6.521263 6.736842 15.629474 10.698105 25.061053 10.698105 4.500211 0 8.892632-0.916211 13.150316-2.586948 13.285053-5.389474 21.827368-18.108632 21.692631-32.390736 0-9.216-3.691789-18.216421-10.105263-24.602948l-204.045474-211.806316z" fill="#1296db" p-id="10956"></path></svg>
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
  background: #ffffff;
  box-shadow: 1px 0 3px rgba(0, 0, 0, 0.04);
  overflow-y: auto;
  height: calc(100vh - 70px);
  position: sticky;
  top: 70px;
  transition: width 0.3s ease;
  border-right: 1px solid #e5e7eb;
}

.side-menu.collapsed {
  width: 64px;
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.menu-title {
  color: #374151;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.collapse-btn {
  background: #e5e7eb;
  border-color: #d1d5db;
  color: #6b7280;
  transition: all 0.2s ease;
}

.collapse-btn:hover {
  background: #d1d5db;
  color: #374151;
}

.collapse-btn svg {
  width: 16px;
  height: 16px;
}

.menu-vertical {
  border-right: none;
  background: transparent;
}

:deep(.el-sub-menu) {
  margin: 0 0 2px 0;
}

:deep(.el-sub-menu__title) {
  font-size: 13px;
  font-weight: 600;
  color: #4b5563;
  border-radius: 0;
  margin: 0 8px;
  padding: 10px 12px;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

:deep(.el-sub-menu__title:hover) {
  background: #f3f4f6;
  color: #1f2937;
  border-left-color: #6366f1;
}

:deep(.el-sub-menu__title .el-icon) {
  color: #6366f1;
  font-size: 16px;
}

:deep(.el-menu-item) {
  font-size: 12px;
  color: #6b7280;
  border-radius: 0;
  margin: 0 8px;
  padding: 8px 12px 8px 32px !important;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

:deep(.el-menu-item:hover) {
  background: #f9fafb;
  color: #1f2937;
  border-left-color: #6366f1;
}

:deep(.el-menu-item.is-active) {
  background: #eef2ff;
  color: #4338ca;
  font-weight: 600;
  border-left-color: #6366f1;
}

:deep(.el-sub-menu.is-opened > .el-sub-menu__title) {
  background: #f3f4f6;
  color: #1f2937;
  border-left-color: #6366f1;
}

/* 滚动条美化 */
:deep(.side-menu)::-webkit-scrollbar {
  width: 4px;
}

:deep(.side-menu)::-webkit-scrollbar-track {
  background: #f9fafb;
}

:deep(.side-menu)::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

:deep(.side-menu)::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.section-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
  margin-right: 8px;
}
</style>

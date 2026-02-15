<script setup lang="ts">
import type { Ref } from 'vue'
import { throttle } from 'lodash-es' // lodash-es 節流
import Masonry from 'masonry-layout'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'

// 佈局參數 Props
interface MasonryWaterfallProps {
    columnWidth?: number | string // 列寬（px/選擇器）
    gutter?: number // 列/行間距
    fitWidth?: boolean // 容器寬度自適應居中
}

// 默認參數
const props = withDefaults(defineProps<MasonryWaterfallProps>(), {
    columnWidth: 120,
    gutter: 16,
    fitWidth: true,
})

// Vue Ref 管理 DOM 容器和 masonry 實例
const masonryContainer: Ref<HTMLDivElement | null> = ref(null)
const masonryInstance: Ref<Masonry | null> = ref(null)

// 初始化 masonry（僅執行一次，因卡片固定）
async function initMasonry() {
    if (!masonryContainer.value)
        return

    // 等待插槽內容（固定卡片）完全渲染
    await nextTick()

    // 初始化 masonry 實例（固定卡片無需銷燬舊實例）
    masonryInstance.value = new Masonry(masonryContainer.value, {
        itemSelector: '.masonry-container > *', // 匹配所有固定子項
        columnWidth: props.columnWidth,
        gutter: props.gutter,
        fitWidth: props.fitWidth,
        initLayout: true, // 固定卡片直接初始化佈局
    })
}

// 刷新佈局（僅用於卡片內部內容高度變化）
async function refreshLayout() {
    await nextTick()
    if (masonryInstance.value) {
        masonryInstance.value.layout?.()
    }
}

// 窗口縮放節流重排（優化性能）
const handleResize = throttle(() => {
    if (masonryInstance.value) {
        masonryInstance.value.layout?.()
    }
}, 300)

// 生命週期：掛載時初始化，卸載時清理
onMounted(async () => {
    await initMasonry()
    window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
    // 銷燬實例 + 釋放內存
    if (masonryInstance.value) {
        masonryInstance.value.destroy?.()
        masonryInstance.value = null
    }
    // 移除監聽 + 取消節流任務
    window.removeEventListener('resize', handleResize)
    handleResize.cancel()
})

// 僅暴露刷新方法（適配卡片內部內容變化）
defineExpose({ refreshLayout })
</script>

<template>
  <!-- masonry 容器：ref 綁定，接收固定插槽內容 -->
  <div ref="masonryContainer" class="masonry-container">
    <!-- 插槽：直接傳入固定的卡片/組件 -->
    <slot />
  </div>
</template>

<style scoped>
.masonry-container {
  width: 100%;
  /* max-width: 1400px; */
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
}

/* 固定卡片基礎樣式 */
.masonry-container > * {
  margin-bottom: v-bind('`${gutter}px`');
  box-sizing: border-box;
  break-inside: avoid; /* 兼容 Safari */
  min-height: 100px; /* 避免內容過矮導致佈局異常 */
}

/* 響應式適配：小屏調整列寬 */
/* @media (max-width: 768px) {
  .masonry-container {
    padding: 10px;
  }
  .masonry-container > * {
    width: calc(50% - v-bind('`${gutter}px`')) !important;
  }
} */
</style>

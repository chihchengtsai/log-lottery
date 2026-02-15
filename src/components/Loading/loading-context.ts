// src/contexts/loading-context.ts
import type { InjectionKey, Ref } from 'vue'
import { ref } from 'vue'

// 定義 Loading 配置類型
export interface LoadingOptions {
    visible: Ref<boolean>
    text: Ref<string>
    fullscreen: Ref<boolean>
    zIndex: Ref<number>
    count: Ref<number>
    show: (options?: Partial<{ text: string, fullscreen: boolean, zIndex: number }>) => void
    hide: () => void
}

// 注入密鑰（Symbol 確保唯一性）
export const loadingKey: InjectionKey<LoadingOptions> = Symbol('loading')

// 全局狀態（單例）
const visible = ref(false)
const text = ref('')
const fullscreen = ref(true)
const zIndex = ref(9999)
const count = ref(0)

// 顯示 Loading
function show(options?: Partial<{ text: string, fullscreen: boolean, zIndex: number }>) {
    count.value++
    if (count.value > 1)
        return
    visible.value = true
    if (options) {
        text.value = options.text || ''
        fullscreen.value = options.fullscreen ?? true
        zIndex.value = options.zIndex || 9999
    }
}

// 隱藏 Loading
function hide() {
    if (count.value <= 0)
        return
    count.value--
    if (count.value === 0) {
        visible.value = false
        text.value = ''
        fullscreen.value = true
        zIndex.value = 9999
    }
}

// 導出全域狀態（供根組件提供）
export const loadingState: LoadingOptions = {
    visible,
    text,
    fullscreen,
    zIndex,
    count,
    show,
    hide,
}

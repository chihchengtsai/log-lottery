// pinia
import { createPinia } from 'pinia'
// pinia持久化
import piniaPluginPersist from 'pinia-plugin-persist'
import * as THREE from 'three'
import { createApp } from 'vue'
import VueDOMPurifyHTML from 'vue-dompurify-html'
import svgIcon from '@/components/SvgIcon/index.vue'
import i18n from '@/locales/i18n'
// svg全局組件// 路由
import router from '@/router'
import App from './App.vue'
import './style.css'
import './style/markdown.css'
import './style/style.scss'
// 全局svg組件
import 'virtual:svg-icons-register'

// 在應用初始化時儘早設置主題和字體，避免頁面加載時的閃爍
(function initializeThemeAndFont() {
    try {
        // 從localStorage獲取全局配置
        const globalConfigStr = localStorage.getItem('globalConfig')

        if (globalConfigStr) {
            const storageData = JSON.parse(globalConfigStr)
            // 根據persist策略，數據存儲在globalConfig屬性下
            const globalConfig = storageData.globalConfig || storageData

            // 設置主題
            if (globalConfig.theme?.name) {
                const html = document.documentElement
                html.setAttribute('data-theme', globalConfig.theme.name)
            }

            // 設置字體
            if (globalConfig.theme?.font) {
                // 更新CSS變量
                document.documentElement.style.setProperty('--app-font-family', `"${globalConfig.theme.font}", -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`)
            }
        }
    }
    catch (e) {
        console.warn('Failed to set initial theme and font:', e)
    }
})()

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersist)

app.config.globalProperties.$THREE = THREE // 掛載到原型
app.component('svg-icon', svgIcon)
app.use(router)
app.use(VueDOMPurifyHTML)
app.use(pinia)
app.use(i18n)
app.mount('#app')

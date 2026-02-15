import { createVNode, render } from 'vue'
import ErrorModalVue from './index.vue'

// 定義彈窗調用函數
function openModal(options = {}) {
    // 默認配置
    const defaultOptions = {
        title: '提示',
        desc: '',
        // 確認按鈕回呼
        onConfirm: () => { },
        // 關閉按鈕回呼
        onClose: () => { },
    }

    // 合併配置
    const finalOptions = { ...defaultOptions, ...options }

    // 創建容器
    const container = document.createElement('div')

    // 創建虛擬節點
    const vnode = createVNode(ErrorModalVue, {
        'title': finalOptions.title,
        'desc': finalOptions.desc,
        'modelValue': true, // 預設打開
        'onUpdate:modelValue': (val: any) => {
            if (!val) {
                // 關閉時銷毀組件
                render(null, container)
                document.body.removeChild(container)
            }
        },
        'onConfirm': () => {
            finalOptions.onConfirm()
        },
        'onClose': () => {
            finalOptions.onClose()
        },
    })

    // 渲染組件到容器
    render(vnode, container)

    // 將容器添加到body
    document.body.appendChild(container)

    // 返回關閉方法（可選）
    return {
        close: () => {
            render(null, container)
            document.body.removeChild(container)
        },
    }
}

export default openModal

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import openModal from '@/components/ErrorModal'

class Request {
    private instance: AxiosInstance

    constructor(config: AxiosRequestConfig) {
        this.instance = axios.create({
            baseURL: '/api',
            timeout: 10000,
            ...config,
        })

        // 添加請求攔截器
        this.instance.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                // 在發送請求之前做些什麼
                return config
            },
            (error: any) => {
                // 對請求錯誤做些什麼
                return Promise.reject(error)
            },
        )

        // 添加響應攔截器
        this.instance.interceptors.response.use(
            (response: AxiosResponse) => {
                // 對響應數據做些什麼
                return response
            },
            (error: any) => {
                // 對響應錯誤做些什麼
                if (error.response && error.response.data) {
                    const { code, msg } = error.response.data
                    openModal({ title: code, desc: msg })
                    return Promise.reject(error.response.data)
                }
                openModal({ title: '請求錯誤', desc: error.message })
                return Promise.reject(error)
            },
        )
    }

    public async request<T>(config: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.instance.request(config)

        return response.data
    }
}

// 函數
function request<T>(config: AxiosRequestConfig): Promise<T> {
    const instance = new Request(config)

    return instance.request(config)
}

export default request

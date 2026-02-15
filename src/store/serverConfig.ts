import type { ServerType } from '@/types/storeType'
import { defineStore } from 'pinia'
import { defaultServerHostList } from './data'

export const useServerConfig = defineStore('server', {
    state() {
        return {
            serverConfig: {
                serverList: defaultServerHostList,
                currentServer: defaultServerHostList[0],
                serverStatus: false,
            },
        }
    },
    getters: {
        // 獲取服務器列表
        getServerList(state) {
            return state.serverConfig.serverList
        },
        // 獲取當前服務器
        getCurrentServer(state) {
            return state.serverConfig.currentServer
        },
        // 獲取服務器狀態
        getServerStatus(state) {
            return state.serverConfig.serverStatus
        },

    },
    actions: {
        // 設置服務器列表地址
        updateServerList(userServer: ServerType) {
            this.serverConfig.serverList.map((item) => {
                if (item.id === userServer.id) {
                    item.host = userServer.host
                }
                return item
            })
        },
        // 設置當前服務器
        setCurrentServer(userServer: ServerType) {
            this.serverConfig.currentServer = userServer
        },
        // 設置服務器狀態
        setServerStatus(status: boolean) {
            this.serverConfig.serverStatus = status
        },
        // 重設所有配置
        resetDefault() {
            this.serverConfig = {
                serverList: defaultServerHostList,
                currentServer: defaultServerHostList[0],
                serverStatus: false,
            }
        },
    },
    persist: {
        enabled: true,
        strategies: [
            {
                // 如果要存儲在localStorage中
                storage: localStorage,
                key: 'serverConfig',
            },
        ],
    },
})

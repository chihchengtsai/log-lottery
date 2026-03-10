import type { IPrizeConfig } from '@/types/storeType'
import { defineStore } from 'pinia'
import { defaultCurrentPrize, defaultPrizeList } from './data'

export const usePrizeConfig = defineStore('prize', {
    state() {
        return {
            prizeConfig: {
                prizeList: defaultPrizeList,
                currentPrize: defaultCurrentPrize,
                temporaryPrize: {
                    id: '',
                    name: '',
                    sort: 0,
                    isAll: false,
                    count: 1,
                    isUsedCount: 0,
                    picture: {
                        id: '-1',
                        name: '',
                        url: '',
                    },
                    separateCount: {
                        enable: true,
                        countList: [],
                    },
                    desc: '',
                    isShow: false,
                    isUsed: false,
                    frequency: 1,
                } as IPrizeConfig,
            },
        }
    },
    getters: {
        // 獲取全部配置
        getPrizeConfigAll(state) {
            return state.prizeConfig
        },
        // 獲取獎品列表
        getPrizeConfig(state) {
            return state.prizeConfig.prizeList
        },
        // 根據id獲取配置
        getPrizeConfigById(state) {
            return (id: number | string) => {
                return state.prizeConfig.prizeList.find(item => item.id === id)
            }
        },
        // 獲取當前獎項
        getCurrentPrize(state) {
            return state.prizeConfig.currentPrize
        },
        // 獲取臨時的獎項
        getTemporaryPrize(state) {
            return state.prizeConfig.temporaryPrize
        },

    },
    actions: {
        // 設置獎項
        setPrizeConfig(prizeList: IPrizeConfig[]) {
            this.prizeConfig.prizeList = prizeList
        },
        // 添加獎項
        addPrizeConfig(prizeConfigItem: IPrizeConfig) {
            this.prizeConfig.prizeList.push(prizeConfigItem)
        },
        // 刪除獎項
        deletePrizeConfig(prizeConfigItemId: number | string) {
            this.prizeConfig.prizeList = this.prizeConfig.prizeList.filter(item => item.id !== prizeConfigItemId)
        },
        // 更新獎項數據
        updatePrizeConfig(prizeConfigItem: IPrizeConfig) {
            const prizeListLength = this.prizeConfig.prizeList.length
            if (prizeConfigItem.isUsed && prizeListLength) {
                for (let i = 0; i < prizeListLength; i++) {
                    if (!this.prizeConfig.prizeList[i].isUsed) {
                        this.setCurrentPrize(this.prizeConfig.prizeList[i])
                        break
                    }
                }
            }
            else {
                return
            }
            this.resetTemporaryPrize()
        },
        // 刪除全部獎項
        deleteAllPrizeConfig() {
            this.prizeConfig.prizeList = [] as IPrizeConfig[]
        },
        // 設置當前獎項
        setCurrentPrize(prizeConfigItem: IPrizeConfig) {
            this.prizeConfig.currentPrize = prizeConfigItem
        },
        // 設置臨時獎項
        setTemporaryPrize(prizeItem: IPrizeConfig) {
            if (prizeItem.isShow === false) {
                for (let i = 0; i < this.prizeConfig.prizeList.length; i++) {
                    if (this.prizeConfig.prizeList[i].isUsed === false) {
                        this.setCurrentPrize(this.prizeConfig.prizeList[i])

                        break
                    }
                }
                this.resetTemporaryPrize()

                return
            }

            this.prizeConfig.temporaryPrize = prizeItem
        },
        // 重設臨時獎項
        resetTemporaryPrize() {
            this.prizeConfig.temporaryPrize = {
                id: '',
                name: '',
                sort: 0,
                isAll: false,
                count: 1,
                isUsedCount: 0,
                picture: {
                    id: '-1',
                    name: '',
                    url: '',
                },
                separateCount: {
                    enable: true,
                    countList: [],
                },
                desc: '',
                isShow: false,
                isUsed: false,
                frequency: 1,
            } as IPrizeConfig
        },
        // 重設所有配置
        resetDefault() {
            this.prizeConfig = {
                prizeList: defaultPrizeList,
                currentPrize: defaultCurrentPrize,
                temporaryPrize: {
                    id: '',
                    name: '',
                    sort: 0,
                    isAll: false,
                    count: 1,
                    isUsedCount: 0,
                    picture: {
                        id: '-1',
                        name: '',
                        url: '',
                    },
                    separateCount: {
                        enable: true,
                        countList: [],
                    },
                    desc: '',
                    isShow: false,
                    isUsed: false,
                    frequency: 1,
                } as IPrizeConfig,
            }
        },
    },
    persist: {
        enabled: true,
        strategies: [
            {
                // 如果要存儲在localStorage中
                storage: localStorage,
                key: 'prizeConfig',
            },
        ],
    },
})

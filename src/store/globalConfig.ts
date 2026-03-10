import type { IImage, IMusic } from '@/types/storeType'
import { defineStore } from 'pinia'
import i18n, { browserLanguage } from '@/locales/i18n'
import { defaultImageList, defaultMusicList, defaultPatternList } from './data'
// import { IPrizeConfig } from '@/types/storeType';
export const useGlobalConfig = defineStore('global', {
    state() {
        return {
            globalConfig: {
                rowCount: 17,
                isSHowPrizeList: true,
                isShowAvatar: false,
                topTitle: i18n.global.t('data.defaultTitle'),
                language: browserLanguage,
                definiteTime: null as number | null,
                winMusic: false,
                theme: {
                    name: 'luxury',
                    detail: { primary: '#0f5fd3' },
                    cardColor: '#ff79c6',
                    cardWidth: 140,
                    cardHeight: 200,
                    textColor: 'rgba(255, 255, 255, 1)',
                    luckyCardColor: '#0d0244ff',
                    textSize: 30,
                    patternColor: '#1b66c9',
                    patternList: defaultPatternList as number[],
                    background: {}, // 背景顏色或圖片
                    font: '微軟雅黑',
                    titleFont: '微軟雅黑',
                    titleFontSyncGlobal: true,
                },
                musicList: defaultMusicList as IMusic[],
                imageList: defaultImageList as IImage[],
            },
            currentMusic: {
                item: defaultMusicList[0] as IMusic,
                paused: true,
            },
        }
    },
    getters: {
        // 獲取全部配置
        getGlobalConfig(state) {
            return state.globalConfig
        },
        // 獲取標題
        getTopTitle(state) {
            return state.globalConfig.topTitle
        },
        // 獲取行數
        getRowCount(state) {
            return state.globalConfig.rowCount
        },
        // 獲取主題
        getTheme(state) {
            return state.globalConfig.theme
        },
        // 獲取卡片顏色
        getCardColor(state) {
            return state.globalConfig.theme.cardColor
        },
        // 獲取中獎顏色
        getLuckyColor(state) {
            return state.globalConfig.theme.luckyCardColor
        },
        // 獲取文字顏色
        getTextColor(state) {
            return state.globalConfig.theme.textColor
        },
        // 獲取卡片寬高
        getCardSize(state) {
            return {
                width: state.globalConfig.theme.cardWidth,
                height: state.globalConfig.theme.cardHeight,
            }
        },
        // 獲取文字大小
        getTextSize(state) {
            return state.globalConfig.theme.textSize
        },
        // 獲取圖案顏色
        getPatterColor(state) {
            return state.globalConfig.theme.patternColor
        },
        // 獲取圖案列表
        getPatternList(state) {
            return state.globalConfig.theme.patternList
        },
        // 獲取音樂列表
        getMusicList(state) {
            return state.globalConfig.musicList
        },
        // 獲取當前音樂
        getCurrentMusic(state) {
            return state.currentMusic
        },
        // 獲取圖片列表
        getImageList(state) {
            return state.globalConfig.imageList
        },
        // 獲取是否顯示獎品列表
        getIsShowPrizeList(state) {
            return state.globalConfig.isSHowPrizeList
        },
        // 獲取當前語言
        getLanguage(state) {
            return state.globalConfig.language
        },
        // 獲取背景圖片設置
        getBackground(state) {
            return state.globalConfig.theme.background
        },
        // 獲取字體
        getFont(state) {
            return state.globalConfig.theme.font
        },
        // 獲取標題字體
        getTitleFont(state) {
            return state.globalConfig.theme.titleFont
        },
        // 獲取標題字體同步全局
        getTitleFontSyncGlobal(state) {
            return state.globalConfig.theme.titleFontSyncGlobal
        },
        // 獲取是否顯示頭像
        getIsShowAvatar(state) {
            return state.globalConfig.isShowAvatar
        },
        // 獲取定時抽取時間
        getDefiniteTime(state) {
            return state.globalConfig.definiteTime
        },
        // 是否播放中獎音樂
        getWinMusic(state) {
            return state.globalConfig.winMusic
        },
    },
    actions: {
        // 設置全局配置
        setGlobalConfig(data: any) {
            this.globalConfig = data
        },
        // 設置rowCount
        setRowCount(rowCount: number) {
            this.globalConfig.rowCount = rowCount
        },
        // 設置標題
        setTopTitle(topTitle: string) {
            this.globalConfig.topTitle = topTitle
        },
        // 設置主題
        setTheme(theme: any) {
            const { name } = theme
            this.globalConfig.theme.name = name
        },
        // 設置卡片顏色
        setCardColor(cardColor: string) {
            this.globalConfig.theme.cardColor = cardColor
        },
        // 設置中獎顏色
        setLuckyCardColor(luckyCardColor: string) {
            this.globalConfig.theme.luckyCardColor = luckyCardColor
        },
        // 設置文字顏色
        setTextColor(textColor: string) {
            this.globalConfig.theme.textColor = textColor
        },
        // 設置卡片寬高
        setCardSize(cardSize: { width: number, height: number }) {
            this.globalConfig.theme.cardWidth = cardSize.width
            this.globalConfig.theme.cardHeight = cardSize.height
        },
        // 設置文字大小
        setTextSize(textSize: number) {
            this.globalConfig.theme.textSize = textSize
        },
        // 設置圖案顏色
        setPatterColor(patterColor: string) {
            this.globalConfig.theme.patternColor = patterColor
        },
        // 設置圖案列表
        setPatternList(patternList: number[]) {
            this.globalConfig.theme.patternList = patternList
        },
        // 重設圖案列表
        resetPatternList() {
            this.globalConfig.theme.patternList = defaultPatternList
        },
        // 添加音樂
        addMusic(music: IMusic) {
            // 驗證音樂是否已存在，看name字段
            for (let i = 0; i < this.globalConfig.musicList.length; i++) {
                if (this.globalConfig.musicList[i].name === music.name) {
                    return
                }
            }
            this.globalConfig.musicList.push(music)
        },
        // 刪除音樂
        removeMusic(musicId: string) {
            for (let i = 0; i < this.globalConfig.musicList.length; i++) {
                if (this.globalConfig.musicList[i].id === musicId) {
                    this.globalConfig.musicList.splice(i, 1)
                    break
                }
            }
        },
        // 設置當前播放音樂
        setCurrentMusic(musicItem: IMusic, paused: boolean = true) {
            this.currentMusic = {
                item: musicItem,
                paused,
            }
        },
        // 重設音樂列表
        resetMusicList() {
            this.globalConfig.musicList = JSON.parse(JSON.stringify(defaultMusicList)) as IMusic[]
        },
        // 清空音樂列表
        clearMusicList() {
            this.globalConfig.musicList = [] as IMusic[]
        },
        // 添加圖片
        addImage(image: IImage) {
            for (let i = 0; i < this.globalConfig.imageList.length; i++) {
                if (this.globalConfig.imageList[i].name === image.name) {
                    return
                }
            }
            this.globalConfig.imageList.push(image)
        },
        // 刪除圖片
        removeImage(imageId: string) {
            for (let i = 0; i < this.globalConfig.imageList.length; i++) {
                if (this.globalConfig.imageList[i].id === imageId) {
                    this.globalConfig.imageList.splice(i, 1)
                    break
                }
            }
        },
        // 重設圖片列表
        resetImageList() {
            this.globalConfig.imageList = defaultImageList as IImage[]
        },
        // 清空圖片列表
        clearImageList() {
            this.globalConfig.imageList = [] as IImage[]
        },
        // 設置是否顯示獎品列表
        setIsShowPrizeList(isShowPrizeList: boolean) {
            this.globalConfig.isSHowPrizeList = isShowPrizeList
        },
        // 設置
        setLanguage(language: string) {
            this.globalConfig.language = language
            i18n.global.locale.value = language
        },
        // 設置背景圖片
        setBackground(background: any) {
            this.globalConfig.theme.background = background
        },
        // 設置字體
        setFont(font: any) {
            this.globalConfig.theme.font = font
        },
        // 設置標題字體
        setTitleFont(titleFont: any) {
            this.globalConfig.theme.titleFont = titleFont
        },
        // 設置同步全局字體
        setTitleFontSyncGlobal(titleFontSyncGlobal: boolean) {
            this.globalConfig.theme.titleFontSyncGlobal = titleFontSyncGlobal
        },
        // 設置是否顯示頭像
        setIsShowAvatar(isShowAvatar: boolean) {
            this.globalConfig.isShowAvatar = isShowAvatar
        },
        // 設置定時抽取時間
        setDefiniteTime(definiteTime: number | null) {
            this.globalConfig.definiteTime = definiteTime
        },
        // 設置是否播放獲獎音樂
        setIsPlayWinMusic(winMusic: boolean) {
            this.globalConfig.winMusic = winMusic
        },
        // 重設所有配置
        reset() {
            this.globalConfig = {
                rowCount: 17,
                winMusic: false,
                isSHowPrizeList: true,
                isShowAvatar: false,
                topTitle: i18n.global.t('data.defaultTitle'),
                language: browserLanguage,
                definiteTime: null,
                theme: {
                    name: 'dracula',
                    detail: { primary: '#0f5fd3' },
                    cardColor: '#ff79c6',
                    cardWidth: 140,
                    cardHeight: 200,
                    textColor: '#00000000',
                    luckyCardColor: '#0d0244ff',
                    textSize: 30,
                    patternColor: '#1b66c9',
                    patternList: defaultPatternList as number[],
                    background: {}, // 背景顏色或圖片
                    font: '微軟雅黑',
                    titleFont: '微軟雅黑',
                    titleFontSyncGlobal: true,
                },
                musicList: defaultMusicList as IMusic[],
                imageList: defaultImageList as IImage[],
            }
            this.currentMusic = {
                item: defaultMusicList[0],
                paused: true,
            }
        },
    },
    persist: {
        enabled: true,
        strategies: [
            {
                // 如果要存儲在localStorage中
                storage: localStorage,
                key: 'globalConfig',
                paths: ['globalConfig'],
            },
        ],
    },
})

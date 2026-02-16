import type { Material, Object3D } from 'three'
import type { TargetType } from './type'
import type { IPersonConfig } from '@/types/storeType'
import * as TWEEN from '@tweenjs/tween.js'
import { storeToRefs } from 'pinia'
import { PerspectiveCamera, Scene } from 'three'
import { CSS3DObject, CSS3DRenderer } from 'three-css3d'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useToast } from 'vue-toast-notification'
import dongSound from '@/assets/audio/end.mp3'
import enterAudio from '@/assets/audio/enter.wav'
import worldCupAudio from '@/assets/audio/worldcup.mp3'
import { SINGLE_TIME_MAX_PERSON_COUNT } from '@/constant/config'
import { useElementPosition, useElementStyle } from '@/hooks/useElement'
import i18n from '@/locales/i18n'
import useStore from '@/store'
import { selectCard } from '@/utils'
import { rgba } from '@/utils/color'
import { LotteryStatus } from './type'
import { confettiFire, createSphereVertices, createTableVertices, getRandomElements, initTableData } from './utils'

const maxAudioLimit = 10
export function useViewModel() {
    const toast = useToast()
    // store裏面存儲的值
    const { personConfig, globalConfig, prizeConfig } = useStore()
    const {
        getAllPersonList: allPersonList,
        getNotPersonList: notPersonList,
        getNotThisPrizePersonList: notThisPrizePersonList,
    } = storeToRefs(personConfig)
    const { getCurrentPrize: currentPrize } = storeToRefs(prizeConfig)
    const {
        getCardColor: cardColor,
        getPatterColor: patternColor,
        getPatternList: patternList,
        getTextColor: textColor,
        getLuckyColor: luckyColor,
        getCardSize: cardSize,
        getTextSize: textSize,
        getRowCount: rowCount,
        getIsShowAvatar: isShowAvatar,
        getTitleFont: titleFont,
        getTitleFontSyncGlobal: titleFontSyncGlobal,
        getDefiniteTime: definiteTime,
        getWinMusic: isPlayWinMusic,
    } = storeToRefs(globalConfig)
    // three初始值
    const ballRotationY = ref(0)
    const containerRef = ref<HTMLElement>()
    const canOperate = ref(true)
    const cameraZ = ref(3000)
    const scene = ref()
    const camera = ref()
    const renderer = ref()
    const controls = ref()
    const objects = ref<any[]>([])
    const targets: TargetType = {
        grid: [],
        helix: [],
        table: [],
        sphere: [],
    }
    // 頁面數據初始值
    const currentStatus = ref<LotteryStatus>(LotteryStatus.init) // 0爲初始狀態， 1爲抽獎準備狀態，2爲抽獎中狀態，3爲抽獎結束狀態
    const tableData = ref<any[]>([])
    const luckyTargets = ref<any[]>([])
    const luckyCardList = ref<number[]>([])
    const luckyCount = ref(10)
    const personPool = ref<IPersonConfig[]>([])
    const intervalTimer = ref<any>(null)
    const isInitialDone = ref<boolean>(false)
    const animationFrameId = ref<any>(null)
    const playingAudios = ref<HTMLAudioElement[]>([])

    // 抽獎音樂相關
    const lotteryMusic = ref<HTMLAudioElement | null>(null)
    const isShowPrize = ref(false)

    function initThreeJs() {
        const felidView = 40
        const width = window.innerWidth
        const height = window.innerHeight
        const aspect = width / height
        const nearPlane = 1
        const farPlane = 10000
        const WebGLoutput = containerRef.value

        scene.value = new Scene()
        camera.value = new PerspectiveCamera(felidView, aspect, nearPlane, farPlane)
        camera.value.position.z = cameraZ.value
        renderer.value = new CSS3DRenderer()
        renderer.value.setSize(width, height * 0.9)
        renderer.value.domElement.style.position = 'absolute'
        // 垂直居中
        renderer.value.domElement.style.paddingTop = '50px'
        renderer.value.domElement.style.top = '50%'
        renderer.value.domElement.style.left = '50%'
        renderer.value.domElement.style.transform = 'translate(-50%, -50%)'
        WebGLoutput!.appendChild(renderer.value.domElement)

        controls.value = new TrackballControls(camera.value, renderer.value.domElement)
        controls.value.rotateSpeed = 1
        controls.value.staticMoving = true
        controls.value.minDistance = 500
        controls.value.maxDistance = 6000
        controls.value.addEventListener('change', render)

        const tableLen = tableData.value.length
        for (let i = 0; i < tableLen; i++) {
            let element = document.createElement('div')
            element.className = 'element-card'

            const number = document.createElement('div')
            number.className = 'card-id'
            number.textContent = tableData.value[i].uid
            if (isShowAvatar.value)
                number.style.display = 'none'
            element.appendChild(number)

            const symbol = document.createElement('div')
            symbol.className = 'card-name'
            symbol.textContent = tableData.value[i].name
            if (isShowAvatar.value)
                symbol.className = 'card-name card-avatar-name'
            element.appendChild(symbol)

            const detail = document.createElement('div')
            detail.className = 'card-detail'
            detail.innerHTML = `${tableData.value[i].clubName}<br/>${tableData.value[i].title}`
            if (isShowAvatar.value)
                detail.style.display = 'none'
            element.appendChild(detail)

            if (isShowAvatar.value) {
                const avatar = document.createElement('img')
                avatar.className = 'card-avatar'
                avatar.src = tableData.value[i].avatar
                avatar.alt = 'avatar'
                avatar.style.width = '140px'
                avatar.style.height = '140px'
                element.appendChild(avatar)
            }
            else {
                const avatarEmpty = document.createElement('div')
                avatarEmpty.style.display = 'none'
                element.appendChild(avatarEmpty)
            }

            element = useElementStyle({
                element,
                person: tableData.value[i],
                index: i,
                patternList: patternList.value,
                patternColor: patternColor.value,
                cardColor: cardColor.value,
                cardSize: cardSize.value,
                scale: 1,
                textSize: textSize.value,
                mod: 'default',
            },
            )
            const object = new CSS3DObject(element)
            object.position.x = Math.random() * 4000 - 2000
            object.position.y = Math.random() * 4000 - 2000
            object.position.z = Math.random() * 4000 - 2000
            scene.value.add(object)

            objects.value.push(object)
        }
        // 創建橫鋪的界面
        const tableVertices = createTableVertices({ tableData: tableData.value, rowCount: rowCount.value, cardSize: cardSize.value })
        targets.table = tableVertices
        // 創建球體
        const sphereVertices = createSphereVertices({ objectsLength: objects.value.length })
        targets.sphere = sphereVertices
        window.addEventListener('resize', onWindowResize, false)
        transform(targets.table, 1000)
        render()
    }
    function render() {
        if (renderer.value) {
            renderer.value.render(scene.value, camera.value)
        }
    }
    /**
     * @description: 位置變換
     * @param targets 目標位置
     * @param duration 持續時間
     */
    function transform(targets: any[], duration: number) {
        TWEEN.removeAll()
        if (intervalTimer.value) {
            clearInterval(intervalTimer.value)
            intervalTimer.value = null
            randomBallData('sphere')
        }

        return new Promise((resolve) => {
            const objLength = objects.value.length
            for (let i = 0; i < objLength; ++i) {
                const object = objects.value[i]
                const target = targets[i]
                new TWEEN.Tween(object.position)
                    .to({ x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration)
                    .easing(TWEEN.Easing.Exponential.InOut)
                    .start()

                new TWEEN.Tween(object.rotation)
                    .to({ x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration)
                    .easing(TWEEN.Easing.Exponential.InOut)
                    .start()
                    .onComplete(() => {
                        if (luckyCardList.value.length) {
                            luckyCardList.value.forEach((cardIndex: any) => {
                                const item = objects.value[cardIndex]
                                useElementStyle({
                                    element: item.element,
                                    person: {} as any,
                                    index: i,
                                    patternList: patternList.value,
                                    patternColor: patternColor.value,
                                    cardColor: cardColor.value,
                                    cardSize: cardSize.value,
                                    scale: 1,
                                    textSize: textSize.value,
                                    mod: 'sphere',
                                })
                            })
                        }
                        luckyTargets.value = []
                        luckyCardList.value = []
                        canOperate.value = true
                    })
            }

            // 這個補間用來在位置與旋轉補間同步執行，通過onUpdate在每次更新數據後渲染scene和camera
            new TWEEN.Tween({})
                .to({}, duration * 2)
                .onUpdate(render)
                .start()
                .onComplete(() => {
                    canOperate.value = true
                    resolve('')
                })
        })
    }
    /**
     * @description: 窗口大小改變時重新設置渲染器的大小
     */
    function onWindowResize() {
        camera.value.aspect = window.innerWidth / window.innerHeight
        camera.value.updateProjectionMatrix()

        renderer.value.setSize(window.innerWidth, window.innerHeight)
        render()
    }

    /**
     * [animation update all tween && controls]
     */
    function animation() {
        TWEEN.update()
        if (controls.value) {
            controls.value.update()
        }
        // 設置自動旋轉
        // 設置相機位置
        animationFrameId.value = requestAnimationFrame(animation)
    }
    /**
     * @description: 旋轉的動畫
     * @param rotateY 繞y軸旋轉圈數
     * @param duration 持續時間，單位秒
     */
    function rollBall(rotateY: number, duration: number) {
        TWEEN.removeAll()

        return new Promise((resolve) => {
            scene.value.rotation.y = 0
            ballRotationY.value = Math.PI * rotateY * 1000
            const rotateObj = new TWEEN.Tween(scene.value.rotation)
            rotateObj
                .to(
                    {
                        // x: Math.PI * rotateX * 1000,
                        x: 0,
                        y: ballRotationY.value,
                        // z: Math.PI * rotateZ * 1000
                        z: 0,
                    },
                    duration * 1000,
                )
                .onUpdate(render)
                .start()
                .onStop(() => {
                    resolve('')
                })
                .onComplete(() => {
                    resolve('')
                })
        })
    }
    /**
     * @description: 視野轉回正面
     */
    function resetCamera() {
        new TWEEN.Tween(camera.value.position)
            .to(
                {
                    x: 0,
                    y: 0,
                    z: 3000,
                },
                1000,
            )
            .onUpdate(render)
            .start()
            .onComplete(() => {
                new TWEEN.Tween(camera.value.rotation)
                    .to(
                        {
                            x: 0,
                            y: 0,
                            z: 0,
                        },
                        1000,
                    )
                    .onUpdate(render)
                    .start()
                    .onComplete(() => {
                        canOperate.value = true
                        // camera.value.lookAt(scene.value.position)
                        camera.value.position.y = 0
                        camera.value.position.x = 0
                        camera.value.position.z = 3000
                        camera.value.rotation.x = 0
                        camera.value.rotation.y = 0
                        camera.value.rotation.z = -0
                        controls.value.reset()
                    })
            })
    }

    /**
     * @description: 開始抽獎音樂
     */
    function startLotteryMusic() {
        if (!isPlayWinMusic.value) {
            return
        }
        if (lotteryMusic.value) {
            lotteryMusic.value.pause()
            lotteryMusic.value = null
        }

        lotteryMusic.value = new Audio(worldCupAudio)
        lotteryMusic.value.loop = true
        lotteryMusic.value.volume = 0.7

        lotteryMusic.value.play().catch((error) => {
            console.error('播放抽獎音樂失敗:', error)
        })
    }

    /**
     * @description: 停止抽獎音樂
     */
    function stopLotteryMusic() {
        if (!isPlayWinMusic.value) {
            return
        }
        if (lotteryMusic.value) {
            lotteryMusic.value.pause()
            lotteryMusic.value = null
        }
    }

    /**
     * @description: 播放結束音效
     */
    function playEndSound() {
        if (!isPlayWinMusic.value) {
            return
        }
        console.log('準備播放結束音效', dongSound)

        // 清理已結束的音頻
        playingAudios.value = playingAudios.value.filter(audio => !audio.ended)

        try {
            const endSound = new Audio(dongSound)
            endSound.volume = 1.0

            // 簡化播放邏輯
            const playPromise = endSound.play()

            if (playPromise) {
                playPromise
                    .then(() => {
                        console.log('結束音效播放成功')
                        playingAudios.value.push(endSound)
                    })
                    .catch((err) => {
                        console.error('播放失敗:', err.name, err.message)
                        if (err.name === 'NotAllowedError') {
                            console.warn('自動播放被阻止，需用戶交互後播放')
                        }
                    })
            }

            endSound.onended = () => {
                console.log('結束音效播放完成')
                const index = playingAudios.value.indexOf(endSound)
                if (index > -1)
                    playingAudios.value.splice(index, 1)
            }
        }
        catch (error) {
            console.error('創建音頻對象失敗:', error)
        }
    }

    /**
     * @description: 重設音頻狀態
     */
    function resetAudioState() {
        if (!isPlayWinMusic.value) {
            return
        }
        // 停止抽獎音樂
        stopLotteryMusic()

        // 清理所有正在播放的音頻
        playingAudios.value.forEach((audio) => {
            if (!audio.ended && !audio.paused) {
                audio.pause()
            }
        })
        playingAudios.value = []
    }

    /**
     * @description: 開始抽獎，由橫鋪變換爲球體（或其他圖形）
     * @returns 隨機抽取球數據
     */
    /// <IP_ADDRESS>description 進入抽獎準備狀態
    async function enterLottery() {
        if (!canOperate.value) {
            return
        }

        // 重設音頻狀態
        resetAudioState()

        // 預加載音頻資源以解決瀏覽器自動播放策略
        try {
            const audioContext = window.AudioContext || (window as any).webkitAudioContext
            if (audioContext) {
                console.log('音頻上下文可用')
            }
        }
        catch (e) {
            console.warn('音頻上下文不可用:', e)
        }

        if (!intervalTimer.value) {
            randomBallData()
        }
        if (patternList.value.length) {
            for (let i = 0; i < patternList.value.length; i++) {
                if (i < rowCount.value * 7) {
                    objects.value[patternList.value[i] - 1].element.style.backgroundColor = rgba(cardColor.value, Math.random() * 0.5 + 0.25)
                }
            }
        }
        canOperate.value = false
        await transform(targets.sphere, 1000)
        currentStatus.value = LotteryStatus.ready
        rollBall(0.1, 2000)
    }
    /**
     * @description 開始抽獎
     */
    function startLottery() {
        if (!canOperate.value) {
            return
        }
        // 驗證是否已抽完全部獎項
        if (currentPrize.value.isUsed || !currentPrize.value) {
            toast.open({
                message: i18n.global.t('error.personIsAllDone'),
                type: 'warning',
                position: 'top-right',
                duration: 10000,
            })

            return
        }
        // personPool.value = currentPrize.value.isAll ? notThisPrizePersonList.value : notPersonList.value
        personPool.value = currentPrize.value.isAll ? [...notThisPrizePersonList.value] : [...notPersonList.value]
        // 驗證抽獎人數是否還夠
        if (personPool.value.length < currentPrize.value.count - currentPrize.value.isUsedCount) {
            toast.open({
                message: i18n.global.t('error.personNotEnough'),
                type: 'warning',
                position: 'top-right',
                duration: 10000,
            })

            return
        }
        // 默認置爲單次抽獎最大個數
        luckyCount.value = SINGLE_TIME_MAX_PERSON_COUNT
        // 還剩多少人未抽
        let leftover = currentPrize.value.count - currentPrize.value.isUsedCount
        const customCount = currentPrize.value.separateCount
        if (customCount && customCount.enable && customCount.countList.length > 0) {
            for (let i = 0; i < customCount.countList.length; i++) {
                if (customCount.countList[i].isUsedCount < customCount.countList[i].count) {
                    // 根據自定義人數來抽取
                    leftover = customCount.countList[i].count - customCount.countList[i].isUsedCount
                    break
                }
            }
        }
        luckyCount.value = leftover < luckyCount.value ? leftover : luckyCount.value
        // 重構抽獎函數
        luckyTargets.value = getRandomElements(personPool.value, luckyCount.value)
        luckyTargets.value.forEach((item) => {
            const index = personPool.value.findIndex(person => person.id === item.id)
            if (index > -1) {
                personPool.value.splice(index, 1)
            }
        })

        toast.open({
            // message: `現在抽取${currentPrize.value.name} ${leftover}人`,
            message: i18n.global.t('error.startDraw', { count: currentPrize.value.name, leftover }),
            type: 'default',
            position: 'top-right',
            duration: 8000,
        })

        // 開始播放抽獎音樂
        startLotteryMusic()

        currentStatus.value = LotteryStatus.running
        isShowPrize.value = true
        rollBall(10, 3000)
        if (definiteTime.value) {
            setTimeout(() => {
                if (currentStatus.value === LotteryStatus.running) {
                    stopLottery()
                }
            }, definiteTime.value * 1000)
        }
    }
    /**
     * @description: 停止抽獎，抽出幸運人
     */
    async function stopLottery() {
        if (!canOperate.value) {
            return
        }
        isShowPrize.value = false
        // 停止抽獎音樂
        stopLotteryMusic()

        // 播放結束音效
        playEndSound()

        //   clearInterval(intervalTimer.value)
        //   intervalTimer.value = null
        canOperate.value = false
        rollBall(0, 1)

        const windowSize = { width: window.innerWidth, height: window.innerHeight }
        luckyTargets.value.forEach((person: IPersonConfig, index: number) => {
            const cardIndex = selectCard(luckyCardList.value, tableData.value.length, person.id)
            luckyCardList.value.push(cardIndex)
            const totalLuckyCount = luckyTargets.value.length
            const item = objects.value[cardIndex]
            const { xTable, yTable, scale } = useElementPosition(
                item,
                rowCount.value,
                totalLuckyCount,
                { width: cardSize.value.width, height: cardSize.value.height },
                windowSize,
                index,
            )
            new TWEEN.Tween(item.position)
                .to({
                    x: xTable,
                    y: yTable,
                    z: 1000,
                }, 1200)
                .easing(TWEEN.Easing.Exponential.InOut)
                .onStart(() => {
                    item.element = useElementStyle({
                        element: item.element,
                        person,
                        index: cardIndex,
                        patternList: patternList.value,
                        patternColor: patternColor.value,
                        cardColor: luckyColor.value,
                        cardSize: { width: cardSize.value.width, height: cardSize.value.height },
                        scale,
                        textSize: textSize.value,
                        mod: 'lucky',
                    })
                })
                .start()
                .onComplete(() => {
                    canOperate.value = true
                    currentStatus.value = LotteryStatus.end
                })
            new TWEEN.Tween(item.rotation)
                .to({
                    x: 0,
                    y: 0,
                    z: 0,
                }, 900)
                .easing(TWEEN.Easing.Exponential.InOut)
                .start()
                .onComplete(() => {
                    playWinMusic()

                    confettiFire()
                    resetCamera()
                })
        })
    }
    // 播放音頻，中將卡片越多audio對象越多，聲音越大
    function playWinMusic() {
        if (!isPlayWinMusic.value) {
            return
        }
        // 清理已結束的音頻
        playingAudios.value = playingAudios.value.filter(audio => !audio.ended && !audio.paused)

        if (playingAudios.value.length > maxAudioLimit) {
            console.log('音頻播放數量已達到上限，請勿重複播放')
            return
        }

        const enterNewAudio = new Audio(enterAudio)
        enterNewAudio.volume = 0.8

        playingAudios.value.push(enterNewAudio)
        enterNewAudio.play()
            .then(() => {
                // 當音頻播放結束後，從數組中移除
                enterNewAudio.onended = () => {
                    const index = playingAudios.value.indexOf(enterNewAudio)
                    if (index > -1) {
                        playingAudios.value.splice(index, 1)
                    }
                }
            })
            .catch((error) => {
                console.error('播放音頻失敗:', error)
                // 如果播放失敗，也從數組中移除
                const index = playingAudios.value.indexOf(enterNewAudio)
                if (index > -1) {
                    playingAudios.value.splice(index, 1)
                }
            })

        // 播放錯誤時從數組中移除
        enterNewAudio.onerror = () => {
            const index = playingAudios.value.indexOf(enterNewAudio)
            if (index > -1) {
                playingAudios.value.splice(index, 1)
            }
        }
    }
    /**
     * @description: 繼續,意味着這抽獎作數，計入數據庫
     */
    async function continueLottery() {
        if (!canOperate.value) {
            return
        }
        const customCount = currentPrize.value.separateCount
        if (customCount && customCount.enable && customCount.countList.length > 0) {
            for (let i = 0; i < customCount.countList.length; i++) {
                if (customCount.countList[i].isUsedCount < customCount.countList[i].count) {
                    customCount.countList[i].isUsedCount += luckyCount.value
                    break
                }
            }
        }
        currentPrize.value.isUsedCount += luckyCount.value
        luckyCount.value = 0
        if (currentPrize.value.isUsedCount >= currentPrize.value.count) {
            currentPrize.value.isUsed = true
            currentPrize.value.isUsedCount = currentPrize.value.count
        }
        personConfig.addAlreadyPersonList(luckyTargets.value, currentPrize.value)
        prizeConfig.updatePrizeConfig(currentPrize.value)
        await enterLottery()
    }
    /**
     * @description: 放棄本次抽獎，回到初始狀態
     */
    function quitLottery() {
        // 停止抽獎音樂
        stopLotteryMusic()

        enterLottery()
        currentStatus.value = LotteryStatus.init
    }

    /**
     * @description: 隨機替換卡片中的數據（不改變原有的值，只是顯示）
     * @param {string} mod 模式
     */
    function randomBallData(mod: 'default' | 'lucky' | 'sphere' = 'default') {
        // 兩秒執行一次
        intervalTimer.value = setInterval(() => {
            // 產生隨機數數組
            const indexLength = 4
            const cardRandomIndexArr: number[] = []
            const personRandomIndexArr: number[] = []
            for (let i = 0; i < indexLength; i++) {
                // 解決隨機元素概率過於不均等問題
                const randomCardIndex = Math.floor(Math.random() * (tableData.value.length - 1))
                const randomPersonIndex = Math.floor(Math.random() * (allPersonList.value.length - 1))
                if (luckyCardList.value.includes(randomCardIndex)) {
                    continue
                }
                cardRandomIndexArr.push(randomCardIndex)
                personRandomIndexArr.push(randomPersonIndex)
            }
            for (let i = 0; i < cardRandomIndexArr.length; i++) {
                if (!objects.value[cardRandomIndexArr[i]]) {
                    continue
                }
                objects.value[cardRandomIndexArr[i]].element = useElementStyle({
                    element: objects.value[cardRandomIndexArr[i]].element,
                    person: allPersonList.value[personRandomIndexArr[i]],
                    index: cardRandomIndexArr[i],
                    patternList: patternList.value,
                    patternColor: patternColor.value,
                    cardColor: cardColor.value,
                    cardSize: { width: cardSize.value.width, height: cardSize.value.height },
                    textSize: textSize.value,
                    scale: 1,
                    mod,
                    type: 'change',
                })
            }
        }, 200)
    }
    /**
     * @description: 鍵盤監聽，快捷鍵操作
     */
    function listenKeyboard(e: any) {
        if ((e.keyCode !== 32 || e.keyCode !== 27) && !canOperate.value) {
            return
        }
        if (e.keyCode === 27 && currentStatus.value === LotteryStatus.running) {
            quitLottery()
        }
        if (e.keyCode !== 32) {
            return
        }
        switch (currentStatus.value) {
            case LotteryStatus.init:
                enterLottery()
                break
            case LotteryStatus.ready:
                startLottery()
                break
            case LotteryStatus.running:
                stopLottery()
                break
            case LotteryStatus.end:
                continueLottery()
                break
            default:
                break
        }
    }
    /**
     * @description: 清理資源，避免內存溢出
     */
    function cleanup() {
        // 停止所有Tween動畫
        TWEEN.removeAll()

        // 清理動畫循環
        if ((window as any).cancelAnimationFrame) {
            (window as any).cancelAnimationFrame(animationFrameId.value)
        }
        clearInterval(intervalTimer.value)
        intervalTimer.value = null

        // 停止抽獎音樂
        stopLotteryMusic()

        // 清理所有音頻資源
        playingAudios.value.forEach((audio) => {
            if (!audio.ended && !audio.paused) {
                audio.pause()
            }
            // 釋放音頻資源
            audio.src = ''
            audio.load()
        })
        playingAudios.value = []

        if (scene.value) {
            scene.value.traverse((object: Object3D) => {
                if ((object as any).material) {
                    if (Array.isArray((object as any).material)) {
                        (object as any).material.forEach((material: Material) => {
                            material.dispose()
                        })
                    }
                    else {
                        (object as any).material.dispose()
                    }
                }
                if ((object as any).geometry) {
                    (object as any).geometry.dispose()
                }
                if ((object as any).texture) {
                    (object as any).texture.dispose()
                }
            })
            scene.value.clear()
        }

        if (objects.value) {
            objects.value.forEach((object) => {
                if (object.element) {
                    object.element.remove()
                }
            })
            objects.value = []
        }

        if (controls.value) {
            controls.value.removeEventListener('change')
            controls.value.dispose()
        }
        //   移除所有事件監聽
        window.removeEventListener('resize', onWindowResize)
        scene.value = null
        camera.value = null
        renderer.value = null
        controls.value = null
    }
    /**
     * @description: 設置默認人員列表
     */
    function setDefaultPersonList() {
        personConfig.setDefaultPersonList()
        // 刷新頁面
        window.location.reload()
    }
    const init = () => {
        const startTime = Date.now()
        const maxWaitTime = 2000 // 2秒

        const checkAndInit = () => {
            // 如果人員列表有數據或者等待時間超過2秒，則執行初始化
            if (allPersonList.value.length > 0 || (Date.now() - startTime) >= maxWaitTime) {
                console.log('初始化完成')
                tableData.value = initTableData({ allPersonList: allPersonList.value, rowCount: rowCount.value })
                initThreeJs()
                animation()
                containerRef.value!.style.color = `${textColor}`
                randomBallData()
                window.addEventListener('keydown', listenKeyboard)
                isInitialDone.value = true
            }
            else {
                console.log('等待人員列表數據...')
                // 繼續等待
                setTimeout(checkAndInit, 100) // 每100毫秒檢查一次
            }
        }

        checkAndInit()
    }
    onMounted(() => {
        init()
    })
    onUnmounted(() => {
        nextTick(() => {
            cleanup()
        })
        clearInterval(intervalTimer.value)
        intervalTimer.value = null
        window.removeEventListener('keydown', listenKeyboard)
    })

    return {
        setDefaultPersonList,
        startLottery,
        continueLottery,
        quitLottery,
        containerRef,
        stopLottery,
        enterLottery,
        tableData,
        currentStatus,
        isInitialDone,
        titleFont,
        titleFontSyncGlobal,
        currentPrize,
        isShowPrize,
    }
}

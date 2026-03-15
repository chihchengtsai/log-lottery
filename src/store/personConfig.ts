import type { IPersonConfig, IPrizeConfig } from '@/types/storeType'
import dayjs from 'dayjs'
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import { computed, ref, toRaw } from 'vue'
import { IndexDb } from '@/utils/dexie'
import { defaultPersonList } from './data'
import { usePrizeConfig } from './prizeConfig'
import { sendWinnerWebhook } from '@/api/webhook'


// 獲取IPersonConfig的key組成數組
export const personListKey = Object.keys(defaultPersonList[0])
export const usePersonConfig = defineStore('person', () => {
    const personDb = new IndexDb('person', ['allPersonList', 'alreadyPersonList'], 1, ['createTime'])
    // NOTE: state
    const personConfig = ref({
        allPersonList: [] as IPersonConfig[],
        alreadyPersonList: [] as IPersonConfig[],
    })
    personDb.getDataSortedByDateTime('allPersonList', 'createTime').then((data) => {
        personConfig.value.allPersonList = data
    })
    personDb.getAllData('alreadyPersonList').then((data) => {
        personConfig.value.alreadyPersonList = data
    })

    // NOTE: getter
    // 獲取全部配置
    const getPersonConfig = computed(() => personConfig.value)
    // 獲取全部人員名單
    const getAllPersonList = computed(() => personConfig.value.allPersonList)
    // 獲取未獲此獎的人員名單
    const getNotThisPrizePersonList = computed(() => {
        const currentPrize = usePrizeConfig().prizeConfig.currentPrize
        const data = personConfig.value.allPersonList.filter((item: IPersonConfig) => {
            return !item.prizeId.includes(currentPrize.id as string)
        })

        return data
    })

    // 獲取已中獎人員名單
    const getAlreadyPersonList = computed(() => {
        return personConfig.value.allPersonList.filter((item: IPersonConfig) => {
            return item.isWin === true
        })
    })
    // 獲取中獎人員詳情
    const getAlreadyPersonDetail = computed(() => personConfig.value.alreadyPersonList)
    // 獲取未中獎人員名單
    const getNotPersonList = computed(() => personConfig.value.allPersonList.filter((item: IPersonConfig) => {
        return item.isWin === false
    }))
    // NOTE: action
    // 添加全部未中獎人員
    function addNotPersonList(personList: IPersonConfig[]) {
        if (personList.length <= 0) {
            return
        }
        personList.forEach((item: IPersonConfig) => {
            personConfig.value.allPersonList.push(item)
        })
        personDb.setAllData('allPersonList', personList)
    }
    // 添加數據
    function addOnePerson(person: IPersonConfig[]) {
        if (person.length <= 0) {
            return
        }
        if (person.length > 1) {
            console.warn('只支持添加單個用戶')
            return
        }
        person.forEach((item: IPersonConfig) => {
            personConfig.value.allPersonList.push(item)
            personDb.setData('allPersonList', item)
        })
    }
    // 添加已中獎人員
    function addAlreadyPersonList(personList: IPersonConfig[], prize: IPrizeConfig | null) {
        if (personList.length <= 0) {
            return
        }
        personList.forEach((person: IPersonConfig) => {
            personConfig.value.allPersonList.map((item: IPersonConfig) => {
                if (item.id === person.id && prize != null) {
                    item.isWin = true
                    // person.isWin = true
                    item.prizeName.push(prize.name)
                    // person.prizeName += prize.name
                    item.prizeTime.push(dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'))
                    // person.prizeTime = new Date().toString()
                    item.prizeId.push(prize.id as string)
                }
                return item
            })
            personConfig.value.alreadyPersonList.push(person)
            personDb.updateData('allPersonList', toRaw(person))
            personDb.setData('alreadyPersonList', toRaw(person))
        })
        if (prize) {
            sendWinnerWebhook(personList, prize.name)
        }
    }
    // 從已中獎移動到未中獎
    function moveAlreadyToNot(person: IPersonConfig) {
        if (person.id === undefined || person.id == null) {
            return
        }

        // 先獲取當前的獎項名稱，因為後續會清空
        const prizeName = person.prizeName && person.prizeName.length > 0 ? person.prizeName[0] : '未知獎項'

        // 更新 allPersonList 中的狀態
        const allPersonIndex = personConfig.value.allPersonList.findIndex(item => item.id === person.id)
        if (allPersonIndex !== -1) {
            const target = personConfig.value.allPersonList[allPersonIndex]
            target.isWin = false
            target.prizeName = []
            target.prizeTime = []
            target.prizeId = []
            personDb.updateData('allPersonList', toRaw(target))
        }

        // 從 alreadyPersonList 中移除
        personConfig.value.alreadyPersonList = personConfig.value.alreadyPersonList.filter((item: IPersonConfig) =>
            item.id !== person.id,
        )

        personDb.deleteData('alreadyPersonList', person)

        // 發送 Webhook 取消通知
        console.log(`正在發送取消中獎通知: ${person.uid} - ${prizeName}`)
        sendWinnerWebhook([person], prizeName, true)
    }
    // 刪除指定人員
    function deletePerson(person: IPersonConfig) {
        if (person.id !== undefined || person.id != null) {
            const allPersonListRaw = toRaw(personConfig.value.allPersonList)
            const alreadyPersonListRaw = toRaw(personConfig.value.alreadyPersonList)
            personConfig.value.allPersonList = allPersonListRaw.filter((item: IPersonConfig) => item.id !== person.id)
            personConfig.value.alreadyPersonList = alreadyPersonListRaw.filter((item: IPersonConfig) => item.id !== person.id)
            personDb.deleteData('allPersonList', person)
            personDb.deleteData('alreadyPersonList', person)
        }
    }
    // 更新人員資訊
    function updatePerson(person: IPersonConfig) {
        if (!person.id) {
            return
        }
        const index = personConfig.value.allPersonList.findIndex((item: IPersonConfig) => item.id === person.id)
        if (index !== -1) {
            // 保留原有屬性，只更新傳入的屬性
            const updatedPerson = { ...personConfig.value.allPersonList[index], ...person }
            personConfig.value.allPersonList[index] = updatedPerson
            personDb.updateData('allPersonList', toRaw(updatedPerson))
        }
    }

    // 刪除所有人員
    function deleteAllPerson() {
        personConfig.value.allPersonList = []
        personConfig.value.alreadyPersonList = []
        personDb.deleteAll('allPersonList')
        personDb.deleteAll('alreadyPersonList')
    }

    // 刪除所有人員
    function resetPerson() {
        personConfig.value.allPersonList = []
        personConfig.value.alreadyPersonList = []
        personDb.deleteAll('allPersonList')
        personDb.deleteAll('alreadyPersonList')
    }
    // 重設已中獎人員
    function resetAlreadyPerson() {
        // 把已中獎人員合併到未中獎人員，要驗證是否已存在
        personConfig.value.allPersonList.forEach((item: IPersonConfig) => {
            item.isWin = false
            item.prizeName = []
            item.prizeTime = []
            item.prizeId = []
        })
        personConfig.value.alreadyPersonList = []
        const allPersonListRaw = toRaw(personConfig.value.allPersonList)
        personDb.deleteAll('allPersonList')
        personDb.setAllData('allPersonList', allPersonListRaw)
        personDb.deleteAll('alreadyPersonList')
    }
    function setDefaultPersonList() {
        personConfig.value.allPersonList = defaultPersonList.map((item: any) => {
            item.uuid = uuidv4()
            return item
        })
        personConfig.value.alreadyPersonList = []
        personDb.setAllData('allPersonList', defaultPersonList)
        personDb.deleteAll('alreadyPersonList')
    }
    // 重設所有配置
    function reset() {
        personConfig.value = {
            allPersonList: [] as IPersonConfig[],
            alreadyPersonList: [] as IPersonConfig[],
        }
        personDb.deleteAll('allPersonList')
        personDb.deleteAll('alreadyPersonList')
    }
    return {
        personConfig,
        getPersonConfig,
        getAllPersonList,
        getNotThisPrizePersonList,
        getAlreadyPersonList,
        getAlreadyPersonDetail,
        getNotPersonList,
        addNotPersonList,
        addOnePerson,
        addAlreadyPersonList,
        moveAlreadyToNot,
        deletePerson,
        deleteAllPerson,
        resetPerson,
        resetAlreadyPerson,
        setDefaultPersonList,
        reset,
        updatePerson,
    }
})

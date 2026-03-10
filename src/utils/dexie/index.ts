import type { EntityTable } from 'dexie'
import type { DbData } from './type'
import dayjs from 'dayjs'
import Dexie from 'dexie'
import { v4 as uuidv4 } from 'uuid'

class IndexDb {
    name: string
    dbStore: any
    version: number
    dbKeys: string[]
    tableNames: string[]
    constructor(name: string, tableNames: string[], version = 1, dbKeys: string[] = []) {
        this.name = name // 數據庫名稱
        this.version = version // 數據庫版本號
        this.dbKeys = dbKeys // 數據庫key
        this.tableNames = tableNames
        this.dbStore = new Dexie(name) as Dexie & { [key: string]: EntityTable<DbData, 'id'> }
        // 獲取存在的key
        const stores: Record<string, string> = {}
        for (const tableName of tableNames) {
            stores[tableName] = `id,dateTime,type,uid,${dbKeys.join(',')}` // 根據需要調整字段
        }
        this.dbStore.version(this.version).stores(stores)
    }

    setAllData(tableName: string, data: DbData[]) {
        this.dbStore[tableName].bulkAdd(data)
    }

    /**
     * @param data
     * @description 添加單條數據，併爲數據添加dataTime和type屬性
     */
    setData(tableName: string, data: Partial<DbData>) {
        if (!data.dateTime) {
            data.dateTime = dayjs().format('YYYY-MM-DD HH:mm:ss:SSS')
        }
        if (!data.type) {
            data.type = 'info'
        }
        if (!data.id) {
            data.id = uuidv4()
        }

        this.dbStore[tableName].add(data)
    }

    // 更新單條數據
    updateData(tableName: string, data: Partial<DbData>) {
        this.dbStore[tableName].update(data.id, data)
    }

    /**
     * @returns 所有數據Array
     * @description 刪除所有數據並返回被刪除的數據
     */
    deleteAll(tableName: string) {
        return this.dbStore[tableName].clear()
    }

    /**
     * @param data
     * @description 刪除單條數據
     */
    deleteData(tableName: string, data: Partial<DbData>) {
        this.dbStore[tableName].delete(data.id)
    }

    /**
     * @returns 所有數據Array
     * @description 獲取所有數據
     */
    async getAllData(tableName: string, isAsc: boolean = true) {
        const allData = await this.dbStore[tableName].toArray()
        // return allData
        return isAsc ? allData : allData.reverse()
    }

    // 按 dateTime 排序獲取所有數據
    async getDataSortedByDateTime(tableName: string, orderTimeName: string = 'dataTime') {
        const allData = await this.dbStore[tableName].orderBy(orderTimeName).toArray()
        return allData
    }

    // 分頁獲取數據
    async getPageData(tableName: string, pageNum: number, pageSize: number, isAsc: boolean = true) {
        const allData = await this.dbStore[tableName].toArray()
        const start = (pageNum - 1) * pageSize
        const end = pageNum * pageSize
        return isAsc ? allData.slice(start, end) : allData.slice(end, start).reverse()
    }

    /**
     * @returns 數據庫總長度
     * @description 獲取所有數據的列表長度
     */
    getAllLength(tableName: string) {
        return this.dbStore[tableName].count()
    }

    /**
     *
     * @param filter 根據篩選條件返回數據
     * @returns
     */
    getFilterData(tableName: string, filter: string) {
        return this.dbStore[tableName].filter((item: any) => {
            return item.content.includes(filter)
        }).toArray()
    }

    getKeys(tableName: string, key: string) {
        // keys 方法獲取所有主鍵
        return this.dbStore[tableName].orderBy(key).keys()
    }
}

export { IndexDb }

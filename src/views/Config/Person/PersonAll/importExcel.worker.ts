import * as XLSX from 'xlsx'
import { addOtherInfo } from '@/utils'

// 定義消息類型
interface WorkerMessage {
    type: 'start' | 'stop' | 'reset'
    data: any
    templateData: any
    headerMap: {
        number: string
        name: string
        nickname: string
        clubName: string
        title: string
    }
}

let allData: any[] = []

// 接收主線程消息
globalThis.onmessage = async (e: MessageEvent<WorkerMessage>) => {
    switch (e.data.type) {
        case 'start':
            {
                const fileData = e.data.data
                const headerMap = e.data.headerMap

                const workBook = XLSX.read(fileData, { type: 'binary', cellDates: true })
                const workSheet = workBook.Sheets[workBook.SheetNames[0]]
                const excelData: any[] = XLSX.utils.sheet_to_json(workSheet, { range: 1 })

                const import_data = excelData.map((row: any) => {
                    return {
                        uid: row[headerMap.number],
                        name: row[headerMap.name],
                        nickname: row[headerMap.nickname],
                        clubName: row[headerMap.clubName],
                        title: row[headerMap.title],
                        avatar: ''
                    }
                })

                allData = addOtherInfo(import_data)
                globalThis.postMessage({
                    type: 'done',
                    data: allData,
                    message: '讀取完成',
                })
                break
            }
        default:
            globalThis.postMessage({
                type: 'fail',
                data: null,
                message: '讀取失敗',
            })
            break
    }
}

import * as XLSX from 'xlsx'
import { addOtherInfo } from '@/utils'

// 定義消息類型
interface WorkerMessage {
    type: 'start' | 'stop' | 'reset'
    data: any
    templateData: any
}

let allData: any[] = []

function headersEqual(template: string[], actual: string[]): boolean {
    return template.length >= actual.length
        && actual.some(item => template.includes(item))
}
// 接收主線程消息
globalThis.onmessage = async (e: MessageEvent<WorkerMessage>) => {
    switch (e.data.type) {
        case 'start':
            {
                const fileData = e.data.data
                // const templateData = e.data.templateData

                const workBook = XLSX.read(fileData, { type: 'binary', cellDates: true })
                const workSheet = workBook.Sheets[workBook.SheetNames[0]]
                const excelData: object[] = XLSX.utils.sheet_to_json(workSheet, { range: 1 })

                // const templateWorkBook = XLSX.read(templateData, { type: 'array', cellDates: true })
                // const templateWorkSheet = templateWorkBook.Sheets[templateWorkBook.SheetNames[0]]
                // const templateExcelData: object[] = XLSX.utils.sheet_to_json(templateWorkSheet, { range: 1 })

                // const templateHeader = Object.keys(templateExcelData[0])
                // const header = Object.keys(excelData[0])

                // if (!headersEqual(templateHeader, header)) {
                //     globalThis.postMessage({
                //         type: 'error',
                //         data: null,
                //         message: 'not right template',
                //     })
                //     return
                // }

                const import_data = excelData.map((row: any) => {
                    return {
                        name: row['姓名'],
                        nickname: row['暱稱'],
                        clubName: row['扶輪社名'],
                        title: row['職稱'],
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

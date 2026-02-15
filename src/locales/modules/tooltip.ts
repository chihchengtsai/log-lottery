import { SINGLE_TIME_MAX_PERSON_COUNT } from '@/constant/config'

export const tooltipEn = {
    settingConfiguration: 'Setting/Configuration',
    nextSong: 'Right Click to Next Song',
    noSongPlay: 'No Song to Play',
    prizeList: 'Prize List',
    addActivity: 'Add Activity',
    downloadTemplateTip: 'After downloading the file, please fill in the data in Excel and save it in xlsx format',
    uploadExcelTip: 'Upload the modified Excel file',
    leftClick: 'Left Click to Slice',
    toHome: 'to Home',
    resetLayout: 'This item is time-consuming and performance intensive',
    defaultLayout: 'The default pattern setting is valid for 17 columns, please set the number of other columns yourself',
    doneCount: 'Number of winners',
    edit: 'Edit',
    delete: 'Delete',
    timedStop: 'After the lottery begins, it will stop at a scheduled time by default, set to 0, with the unit in seconds. A value of 0 disables the scheduled stopping function',
    uploadImage: 'Upload Image',
    pleaseGoto: 'Please go to',
    onceNumberMax: `The maximum quantity for a single extraction is ${SINGLE_TIME_MAX_PERSON_COUNT}. If it exceeds ${SINGLE_TIME_MAX_PERSON_COUNT}, it will be automatically extracted in batches for you`,
}

export const tooltipZhCn = {
    settingConfiguration: '設定/配置',
    nextSong: '右鍵點擊下一首',
    noSongPlay: '沒有音樂可以播放',
    prizeList: '獎項列表',
    addActivity: '添加抽獎',
    downloadTemplateTip: '下載文件後，請在excel中填寫數據，並保存爲xlsx格式',
    uploadExcelTip: '上傳修改好的excel文件',
    leftClick: '左鍵切割',
    toHome: '主頁',
    resetLayout: '該項比較耗費時間和性能',
    defaultLayout: '預設圖案設定針對17列時有效，其他列數請自行設定',
    doneCount: '已抽取',
    edit: '編輯',
    delete: '刪除',
    timedStop: '開始抽獎過後定時停止，預設爲0，單位爲秒，0爲關閉定時停止功能',
    uploadImage: '上傳圖片',
    pleaseGoto: '請先前往',
    onceNumberMax: `單次抽取數量最大爲${SINGLE_TIME_MAX_PERSON_COUNT}，若設定超過${SINGLE_TIME_MAX_PERSON_COUNT}會自動爲您分批次抽取`,
}

export const tooltip = {
    en: tooltipEn,
    zhCn: tooltipZhCn,
}

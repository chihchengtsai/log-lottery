// 提取有哪些字段
export function extractFields(data: any) {
    const item = data[0]
    // 排除id x y，其他都加入數組
    const keys = Object.keys(item).filter(key => key !== 'id' && key !== 'x' && key !== 'y')
    if (keys.length > 0) {
    // 返回數組key value
        return keys.map(key => ({ label: key, value: true }))
    }
}

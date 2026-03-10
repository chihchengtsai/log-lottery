/**
 * 瀏覽器端加密安全洗牌（無需指定抽取數量）
 * @param array 要洗牌的數組
 * @returns 洗牌後的新數組
 */
function shuffleBrowserCrypto<T>(array: T[]): T[] {
    const newArray = [...array]
    if (newArray.length <= 1)
        return newArray

    // 遍歷數組，每輪生成一個隨機索引
    for (let i = newArray.length - 1; i > 0; i--) {
        // 步驟1：生成一個 32 位無符號加密隨機數（僅需1個）
        const randomBuffer = new Uint32Array(1) // 長度1表示只生成1個隨機數
        crypto.getRandomValues(randomBuffer)

        // 步驟2：將隨機數映射到 [0, i] 範圍（核心：動態適配當前i的範圍）
        const randomIndex = randomBuffer[0] % (i + 1);

        // 步驟3：交換元素
        [newArray[i], newArray[randomIndex]] = [newArray[randomIndex], newArray[i]]
    }
    return newArray
}

/**
 * @description 從源數組中隨機獲取指定數量的元素
 * @param {Array} sourceArray 源數組
 * @param {number} count 要獲取的元素數量
 * @returns {Array} 隨機獲取的元素
 */

export function getRandomElements<T>(sourceArray: T[], count: number): T[] {
    if (count <= 0)
        return []
    if (count >= sourceArray.length) {
        return shuffleBrowserCrypto([...sourceArray])
    } // 抽全部=洗牌

    const newArray = [...sourceArray]
    const result: T[] = []

    // 抽取 count 個元素，每輪選一個隨機索引加入結果，然後從原數組移除
    for (let i = 0; i < count; i++) {
        const randomBuffer = new Uint32Array(1)
        crypto.getRandomValues(randomBuffer)
        const randomIndex = randomBuffer[0] % newArray.length

        // 添加選中的元素到結果數組
        result.push(newArray[randomIndex])
        // 從原數組中移除已選中的元素，避免重複選擇
        newArray.splice(randomIndex, 1)
    }

    return result
}

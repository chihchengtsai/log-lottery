import { describe, expect, it } from 'vitest'
import { getRandomElements } from '@/views/Home/utils/random'

describe('getRandomElements', () => {
    // 測試基本功能：從數組中獲取指定數量的元素
    it('should return specified number of elements', () => {
        const sourceArray = [1, 2, 3, 4, 5]
        const result = getRandomElements(sourceArray, 3)

        expect(result).toHaveLength(3)
        result.forEach((element: any) => {
            expect(sourceArray).toContain(element)
        })
    })

    // 測試邊界情況：count爲0
    it('should return empty array when count is 0', () => {
        const sourceArray = [1, 2, 3]
        const result = getRandomElements(sourceArray, 0)

        expect(result).toEqual([])
    })

    // 測試邊界情況：count爲負數
    it('should return empty array when count is negative', () => {
        const sourceArray = [1, 2, 3]
        const result = getRandomElements(sourceArray, -1)

        expect(result).toEqual([])
    })

    // 測試邊界情況：count大於等於數組長度
    it('should return shuffled array when count equals or exceeds array length', () => {
        const sourceArray = [1, 2, 3]
        const result1 = getRandomElements(sourceArray, 3)
        const result2 = getRandomElements(sourceArray, 5)

        expect(result1).toHaveLength(3)
        expect(result2).toHaveLength(3)

        // 驗證返回的元素與原數組相同
        expect(result1.sort()).toEqual(sourceArray.sort())
        expect(result2.sort()).toEqual(sourceArray.sort())
    })

    // 測試空數組情況
    it('should return empty array when source array is empty', () => {
        const sourceArray: number[] = []
        const result = getRandomElements(sourceArray, 3)

        expect(result).toEqual([])
    })

    // 測試單元素數組
    it('should handle single element array', () => {
        const sourceArray = [42]
        const result = getRandomElements(sourceArray, 1)

        expect(result).toEqual([42])
    })

    // 測試字符串數組
    it('should work with string arrays', () => {
        const sourceArray = ['a', 'b', 'c', 'd', 'e']
        const result = getRandomElements(sourceArray, 2)

        expect(result).toHaveLength(2)
        result.forEach((element: any) => {
            expect(sourceArray).toContain(element)
        })
    })

    // 測試對象數組
    it('should work with object arrays', () => {
        const sourceArray = [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
            { id: 3, name: 'Charlie' },
        ]
        const result = getRandomElements(sourceArray, 2)

        expect(result).toHaveLength(2)
        result.forEach((element: any) => {
            expect(sourceArray).toContain(element)
        })
    })

    // 測試多次調用應產生不同結果（概率性測試）
    it('should produce different results on multiple calls', () => {
        const sourceArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
        const results = new Set()

        // 多次調用並收集結果
        for (let i = 0; i < 10; i++) {
            const result = getRandomElements(sourceArray, 5).sort().join(',')
            results.add(result)
        }

        // 雖然有極小概率會相同，但大多數情況下應該有不同的結果
        expect(results.size).toBeGreaterThan(1)
    })
    // 多次調用，每個元素抽中的概率基本上相等
    it('should have approximately equal probabilities for each element', () => {
        const sourceArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
        const times = 200000 // 次數
        const count = 5 // 抽獎個數
        const expectedProbability = count / sourceArray.length
        const elementCounts = new Map()

        // 多次調用並統計元素出現的次數
        for (let i = 0; i < times; i++) {
            const result = getRandomElements(sourceArray, count)
            result.forEach((element: any) => {
                const count = elementCounts.get(element) || 0
                elementCounts.set(element, count + 1)
            })
        }
        elementCounts.forEach((value) => {
            // 驗證每個元素出現的概率接近相等
            const probability = value / times
            expect(probability).toBeCloseTo(expectedProbability, 2)
        })
    })
})

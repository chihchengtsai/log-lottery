// 判斷顏色是否rgb或者rgba
export function isRgbOrRgba(color: string) {
    return color.includes('rgb') || color.includes('rgba')
}

// 判斷是否hex形式
export function isHex(color: string) {
    return color.includes('#')
}

// 把hex顏色轉成rgb數值類型
export function hexToRgba(hex: string) {
    const r = Number.parseInt(hex.slice(1, 3), 16)
    const g = Number.parseInt(hex.slice(3, 5), 16)
    const b = Number.parseInt(hex.slice(5, 7), 16)

    return { r, g, b }
}
// 把rgb數組轉化成r g b 數值
export function rgbToRgba(rgb: string) {
    const rgbArr = rgb.split('(')[1].split(')')[0].split(',')

    return { r: rgbArr[0], g: rgbArr[1], b: rgbArr[2] }
}

// 組成rgb顏色添加透明度
export function rgba(color: string, opacity: number) {
    opacity = opacity || 1
    let rgbaStr = ''
    // 判斷是否是hex顏色
    if (isHex(color)) {
        const { r, g, b } = hexToRgba(color)
        rgbaStr = `rgba(${r},${g},${b},${opacity})`
    }
    else {
        const { r, g, b } = rgbToRgba(color)
        rgbaStr = `rgba(${r},${g},${b},${opacity})`
    }

    return rgbaStr
}

export function rgbToHex(color: string) {
    // 去掉字符串中的空格
    color = color.replace(/\s+/g, '')
    if (isHex(color)) {
        return color
    }
    // 匹配rgba或rgb格式的字符串
    const rgbaMatch = color.match(/^rgba?\((\d+),(\d+),(\d+)(?:,(\d+(?:\.\d+)?|\.\d+))?\)$/i)
    if (!rgbaMatch) {
        throw new Error('Invalid color format')
    }

    const r = Number.parseInt(rgbaMatch[1], 10)
    const g = Number.parseInt(rgbaMatch[2], 10)
    const b = Number.parseInt(rgbaMatch[3], 10)
    const a = rgbaMatch[4] !== undefined ? Number.parseFloat(rgbaMatch[4]) : undefined

    // 將RGB值轉換爲十六進制
    let hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`

    // 如果提供了alpha值，則將其轉換爲十六進制並附加到結果中
    if (a !== undefined) {
        let alphaHex = Math.round(a * 255).toString(16).toUpperCase()
        if (alphaHex.length === 1) {
            alphaHex = `0${alphaHex}` // 確保alpha值是兩位數
        }
        hex += alphaHex
    }

    return hex
}

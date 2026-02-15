import FingerprintJS from '@fingerprintjs/fingerprintjs'

export function getToken() {
    return window.localStorage.getItem('userToken')
}

/**
 * 獲取用戶瀏覽器唯一標識
 * @returns {Promise<string>} 唯一標識符
 */
export async function getUniqueSignature() {
    const fp = await FingerprintJS.load()
    const result = await fp.get()
    return result.visitorId
}

// 獲取origin url
export function getOriginUrl() {
    return window.location.origin
}

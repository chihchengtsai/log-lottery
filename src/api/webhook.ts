import axios from 'axios'
import type { IPersonConfig } from '@/types/storeType'

const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL
const WEBHOOK_SECRET = import.meta.env.VITE_WEBHOOK_SECRET

export interface IWebhookPayload {
    uid: string
    prize_name: string
    won_at?: string
    is_cancelled?: boolean
}

/**
 * 發送中獎資訊至 Webhook
 * @param personList 中獎人員列表
 * @param prizeName 獎項名稱
 * @param isCancelled 是否為取消中獎
 */
export async function sendWinnerWebhook(
    personList: IPersonConfig[],
    prizeName: string,
    isCancelled = false
) {
    if (!WEBHOOK_URL) {
        console.warn('Webhook URL 未設定，跳過發送')
        return
    }

    const payload: IWebhookPayload[] = personList.map((person) => ({
        uid: String(person.id),
        prize_name: prizeName,

        won_at: new Date().toISOString(),
        is_cancelled: isCancelled,
    }))

    try {
        await axios.post(WEBHOOK_URL, payload, {
            headers: {
                'Content-Type': 'application/json',
                'X-Webhook-Secret': WEBHOOK_SECRET || 'default_webhook_secret',
            },
        })
        console.log(`Webhook 發送成功 (${isCancelled ? '取消' : '登記'}):`, payload)
    } catch (error) {
        console.error('Webhook 發送失敗:', error)
    }
}

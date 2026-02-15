/* eslint-disable no-restricted-globals */
// Service Worker 最小實例

// 安裝事件
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installed', event)
    // 跳過等待，立即啟動
    self.skipWaiting()
})

// 啟動事件
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activated')
    // 立即控制所有頁面
    event.waitUntil(self.clients.claim())
})

self.currentClient = null
// 監聽頁面訊息
self.addEventListener('message', async (event) => {
    // 處理來自頁面的訊息
    self.currentClient = event.source
    if (event.data && event.data.type) {
        console.log('處理來自頁面的訊息:', event.data)
        switch (event.data.type) {
            case 'CONNECT_WS':
                console.log('連接的URL:', event.data.payload.url, self.webSocketConnection)
                if (!self.webSocketConnection || self.webSocketConnection.readyState !== WebSocket.OPEN) {
                    self.webSocketConnection = new WebSocket(event.data.payload.url)
                }
                console.log('新連接：', self.webSocketConnection)
                self.webSocketConnection.onopen = () => {
                    console.log('連接成功了，可以發送訊息')
                    if (self.currentClient) {
                        self.currentClient.postMessage({
                            type: 'WS_OPEN',
                            success: true,
                            payload: {
                                message: '連接成功',
                                data: null
                            }
                        })
                    }
                }
                // 接收到消息推送給客戶端
                self.webSocketConnection.onmessage = (message) => {
                    const formatMsg = JSON.parse(message.data)

                    console.log('服務器的訊息', formatMsg)
                    if (self.currentClient) {
                        self.currentClient.postMessage({
                            type: 'WS_MESSAGE',
                            success: true,
                            payload: formatMsg,
                        })
                    }
                    // else {
                    //     event.source.postMessage({
                    //         type: 'WS_MESSAGE',
                    //         success: true,
                    //         payload: {
                    //             data: message.data,
                    //         },
                    //     })
                    // }

                }
                // 連接錯誤
                self.webSocketConnection.onerror = (error) => {
                    console.error('WebSocket error:', error)
                    if (self.currentClient) {
                        self.currentClient.postMessage({
                            type: 'WS_ERROR',
                            success: true,
                            payload: {
                                message: '連接錯誤',
                                data: error,
                            }
                        })
                    }
                }
                // 連接關閉
                self.webSocketConnection.onclose = () => {
                    console.log('WebSocket connection closed')
                    if (self.currentClient) {
                        self.currentClient.postMessage({
                            type: 'WS_CLOSE',
                            success: true,
                            payload: {
                                message: '已斷開連接',
                                data: null
                            }
                        })
                    }
                }
                break
            case 'SEND_WS_MESSAGE':
                const user_msg = event.data.payload.message
                console.log('發送訊息:', user_msg, self.webSocketConnection)
                self.webSocketConnection.send(user_msg)
                break
            case 'DISCONNECT_WS':
                console.log('Disconnecting from WebSocket')
                self.webSocketConnection.close()
                event.source.postMessage({
                    type: 'WS_CLOSE',
                    success: true,
                    payload: {
                        message: '已斷開連接',
                        data: null
                    }
                })
                break
            case 'PING':
                console.log('Ping from page')
                self.webSocketConnection.send('PING')
                event.source.postMessage({
                    type: 'PONG',
                    success: true,
                    payload: {
                        message: 'Service Worker is alive',
                    },
                })
                break
            case 'GET_WS_STATUS':
                // 返回WebSocket連接狀態（如果有的話）
                event.source.postMessage({
                    type: 'WS_STATUS',
                    success: true,
                    payload: {
                        status: self.webSocketConnection ? self.webSocketConnection.readyState : null,
                        connected: self.webSocketConnection && self.webSocketConnection.readyState === WebSocket.OPEN,
                    }
                })
                break
            default:
                console.log('Unknown message type:', event.data.type)
                break
        }
    }
})

// 監聽通知點擊事件
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event.notification.title)

    event.notification.close()

    // 打開或聚焦到頁面
    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/'),
    )
})

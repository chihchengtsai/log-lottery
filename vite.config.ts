/// <reference types="vitest" />

import { createRequire } from 'node:module'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import { visualizer } from 'rollup-plugin-visualizer'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig, loadEnv } from 'vite'
import viteCompression from 'vite-plugin-compression'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import vueDevTools from 'vite-plugin-vue-devtools'
// https://vitejs.dev/config/

const require = createRequire(import.meta.url)
const process = require('node:process')

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, __dirname)
    const chunkName = mode === 'prebuild' ? '[name]' : 'chunk'
    return {
<<<<<<< HEAD
        base: (mode === 'file' || process.env.TAURI_ENV_PLATFORM || process.env.VERCEL) ? '/' : '/log-lottery/',
=======
        base: (mode === 'file' || process.env.TAURI_ENV_PLATFORM) ? '/' : '/log-lottery/',
>>>>>>> 903876142ce7858ee21c74b3379100f1fb3b2834
        plugins: [
            vue(),
            tailwindcss(),
            mode === 'file'
                ? legacy({
                    additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
                })
                : null,
            // vueDevTools(),
            viteCompression({
                verbose: true,
                disable: false,
                threshold: 10240,
                algorithm: 'gzip',
                ext: '.gz',
            }),
            mode === 'prebuild' ? visualizer({
                emitFile: true, // 是否被觸摸
                filename: 'test.html', // 生成分析網頁文件名
                open: true, // 在默認用戶代理中打開生成的文件
                gzipSize: true, // 從源代碼中收集 gzip 大小並將其顯示在圖表中
                brotliSize: true, // 從源代碼中收集 brotli 大小並將其顯示在圖表中
            }) : null,

            createSvgIconsPlugin({
                // 指定需要緩存的圖標文件夾
                iconDirs: [path.resolve(process.cwd(), 'src/icons')],
                // 指定symbolId格式
                symbolId: 'icon-[dir]-[name]',
            }),
            AutoImport({
                resolvers: [
                    // 自動導入圖標組件
                    IconsResolver({
                        prefix: 'Icon',
                    }),
                ],
                dts: path.resolve(path.resolve(__dirname, 'src'), 'auto-imports.d.ts'),
            }),
            Components({
                resolvers: [
                    // 自動註冊圖標組件
                    IconsResolver({
                        enabledCollections: ['ep'],
                    }),
                ],
                dts: path.resolve(path.resolve(__dirname, 'src'), 'components.d.ts'),
            }),
            Icons({
                autoInstall: true,
            }),
        ],
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: '@use "@/style/global.scss" as *;',
                },
            },
            // postcss: {
            //     plugins: [
            //         require('tailwindcss'),
            //         require('autoprefixer'),
            //     ]
            // }
        },
        clearScreen: false,
        server: {
            host: 'localhost',
            port: 6719,
            strictPort: true,
            watch: {
                // 告訴 Vite 忽略監聽 `src-tauri` 目錄
                ignored: ['**/src-tauri/**'],
            },
            proxy: {
                '/api': {
                    target: 'http://127.0.0.1:8080',
                    // 是否跨域
                    changeOrigin: true,
                    // 路徑重寫
                    rewrite: path => path.replace(/^\/api/, '/api'),
                },
            },
        },
        // 添加有關當前構建目標的額外前綴，使這些 CLI 設置的 Tauri 環境變量可以在客戶端代碼中訪問
        envPrefix: ['VITE_', 'TAURI_ENV_*'],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        build: {
            outDir: mode === 'file' ? 'dist-file' : 'dist',
            // Tauri 在 Windows 上使用 Chromium，在 macOS 和 Linux 上使用 WebKit
            // target: (process.env.TAURI_ENV_PLATFORM && mode !== 'file')
            //     ? (process.env.TAURI_ENV_PLATFORM === 'windows' ? 'chrome105' : 'safari13')
            //     : 'es2020', // 普通前端可使用更高版本 JS 支持
            minify: process.env.TAURI_ENV_PLATFORM
                ? (!process.env.TAURI_ENV_DEBUG ? 'esbuild' : false)
                : 'terser', // 普通構建推薦使用 terser 提供更強壓縮選項
            terserOptions: {
                compress: {
                    // 生產環境時移除console
                    drop_console: true,
                    drop_debugger: true,
                },
            },
            //   關閉文件計算
            reportCompressedSize: false,
            //   關閉生成map文件 可以達到縮小打包體積
            sourcemap: process.env.NODE_ENV === 'development' || !!process.env.TAURI_ENV_DEBUG, // 這個生產環境一定要關閉，不然打包的產物會很大
            rollupOptions: {
                output: {
                    chunkFileNames: `js/${chunkName}-[hash].js`, // 引入文件名的名稱
                    entryFileNames: `js/${chunkName}-[hash].js`, // 包的入口文件名稱
                    assetFileNames: `[ext]/${chunkName}-[hash].[ext]`, // 資源文件像 字體，圖片等
                    manualChunks(id: any): string {
                        if (id.includes('node_modules')) {
                            return id
                                .toString()
                                .split('node_modules/')[1]
                                .split('/')[0]
                                .toString()
                        }
                    },
                },
            },
        },
        // 使用這個必須在上面加/// <reference types="vitest" /> 不然會有類型報錯
        test: {
            globals: true, // --> 0.8.1+  請修改成globals
            environment: 'jsdom',
            // include: ['**/__tests__/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
            // passWithNoTests: true,
            testTimeout: 10000,
            transformMode: {
                web: [/\.[jt]sx$/],
            },
        },
    }
})

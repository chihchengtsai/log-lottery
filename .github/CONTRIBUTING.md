# 怎麼爲本項目做貢獻

你好！很高興你爲本項目做貢獻。在提交您的貢獻時，請務必閱讀以下指南：

## PR檢查表

- 該項目主要的工作分支有`main`、`release`和`dev`三個分支。
  - `main`分支用於生產環境，如果是修改文檔、註釋、代碼格式化等不影響主要功能的修改，可以直接發起PR到`main`分支。
  - `release`分支用於發佈新版本，爲當前網站上運行的正式版本的代碼。
  - 如要貢獻代碼，請從`release`或者`main`分支拉取代碼。
  - 你的代碼提交（添加新功能、修復bug、優化性能等）儘量發起PR到`dev`分支。
  - 請儘可能地在您的PR請求中描述清楚添加的功能或者修復的問題。
  - 在一個PR中有多個小提交是沒問題的，但請確保每個提交都包含一個清晰的提交信息。
  - 請確保您的提交信息遵循[Conventional Commits](https://www.conventionalcommits.org/)規範。

## 開發設置

推薦使用`pnpm`來進行包的管理。

開發/打包tauri應用程序需要rust環境，請自行[安裝](https://rustup.rs/)

克隆倉庫後，運行：

```bash
pnpm install  # 安裝依賴
```

## 運行腳本

### `pnpm dev`

啓動開發服務器

```bash
pnpm dev
```

啓動tauri的開發服務

```bash
pnpm tauri dev
```

### `pnpm build`

構建項目

```bash
pnpm build
```

打包tauri安裝包

```bash
pnpm tauri build
```

### `pnpm lint:fix`

修復eslint格式錯誤

```bash
pnpm lint:fix
```

## 項目結構

src目錄下基本放置了所有的代碼文件，其中最主要的是

- `views`：存放頁面代碼
- `components`：存放組件代碼
- `utils`：存放工具函數
- `layout`: 頁面佈局
- `locales`: 國際化
- `router`: 路由配置
- `store`: 狀態管理
- `types`: 類型定義

## 感謝

感謝您爲本項目做出貢獻

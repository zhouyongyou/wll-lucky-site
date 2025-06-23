# $WLL - 幸運抽獎 DApp (Lucky Lottery DApp)

這是一個使用現代化前端技術棧建立的 Web3 去中心化應用程式 (DApp)，用於追蹤幣安智能鏈 (BSC) 上的 `$WLL` 幸運抽獎活動。使用者可以連接他們的錢包，查看自己的代幣餘額，並即時確認是否符合抽獎資格。

## 📦 專案版本 (Version)

* **目前版本:** `1.0.0`
* **最後更新:** `2025-06-23`

## ✨ 主要功能

* **即時數據顯示**：自動從區塊鏈讀取並展示獎池金額、抽獎倒數區塊數。
* **錢包連接**：支援透過瀏覽器擴充功能 (如 MetaMask) 連接錢包。
* **個人化資訊**：顯示使用者個人的 `$WLL` 代幣餘額。
* **資格自動檢測**：根據持幣數量，即時判斷使用者是否符合抽獎資格。
* **現代化 UI**：使用 Tailwind CSS 打造的響應式、美觀的使用者介面。

## 🛠️ 技術棧 (Tech Stack)

本專案採用了以下先進的前端技術：

* **建構工具**: [Vite](https://vitejs.dev/)
* **核心框架**: [React](https://react.dev/)
* **程式語言**: [TypeScript](https://www.typescriptlang.org/)
* **區塊鏈互動**: [Wagmi](https://wagmi.sh/) & [Viem](https://viem.sh/)
* **CSS 框架**: [Tailwind CSS](https://tailwindcss.com/)

## 🚀 開始使用 (Getting Started)

請依照以下步驟在您的本地環境中設定並執行此專案。

### 先決條件

* [Node.js](https://nodejs.org/) (建議版本 v18 或更高)
* [pnpm](https://pnpm.io/) 或 `npm` / `yarn` 套件管理器
* 一個支援 EVM 的瀏覽器錢包擴充功能 (例如 [MetaMask](https://metamask.io/))

### 安裝步驟

1.  **複製本專案的程式碼倉庫：**
    ```bash
    git clone [https://github.com/your-username/my-wll-dapp.git](https://github.com/your-username/my-wll-dapp.git)
    ```

2.  **進入專案目錄：**
    ```bash
    cd my-wll-dapp
    ```

3.  **安裝專案依賴：**
    ```bash
    npm install
    ```
    (或者使用 `pnpm install` / `yarn`)

4.  **啟動本地開發伺服器：**
    ```bash
    npm run dev
    ```

5.  **在瀏覽器中開啟**
    終端機將會顯示一個本地網址 (通常是 `http://localhost:5173`)，在瀏覽器中打開即可看到運作中的應用程式。

## 📜 可用指令 (Available Scripts)

在專案目錄中，您可以執行以下指令：

* `npm run dev`
    在開發模式下啟動應用程式。

* `npm run build`
    將應用程式打包成適用於生產環境的靜態檔案，輸出至 `dist` 資料夾。

* `npm run preview`
    在本地預覽生產環境打包後的應用程式。

## 📄 授權條款 (License)

本專案採用 [MIT License](https://opensource.org/licenses/MIT) 授權。

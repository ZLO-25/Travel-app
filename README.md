# Ryan 旅遊助手（Travel App）

Ryan 專屬的**通用旅遊 Web App**（PWA）：多段旅程各自獨立，待辦／訂單／行程／地點／購物／打包／花費／筆記皆可編輯，並自動存到瀏覽器 `localStorage`。手機與電腦瀏覽器都能用；首次開啟後可離線使用殼層頁面。

**線上網址（GitHub Pages）：** https://zlo-25.github.io/Travel-app/

> 注意：GitHub 使用者／Pages 網址大小寫為 `zlo-25`（小寫）。

## 功能摘要

- **多旅程**：建立空白模板、切換、重新命名、封存、刪除
- **九大模組**：總覽、待辦、訂單、行程、地點、購物、打包、花費、筆記
- **自動儲存**：編輯後寫入本機 `localStorage`
- **匯出／匯入 JSON**：換手機、清快取或備份時使用
- **預設種子**：內建「2026 峴港」範例旅程（不含護照號等敏感資料）
- **PWA**：可「加入主畫面」；Service Worker 快取靜態資源
- **地點主要動線圖**：飯店／五行山／會安相對位置與車程距離（SVG，無需地圖 API）
- **密碼門**：公開 Pages 需輸入密碼才可觀看／修改（同一分頁工作階段內保持解鎖；總覽可「上鎖」）
- **Notion→App 同步**：`data/remote.json` 由排程從 Notion 更新；App 啟動時拉取並以**本機編輯優先**合併（你在網站改過的項目會保留）

## 本機開啟

此專案為**零建置**靜態站，直接開檔或用任意靜態伺服器即可：

```bash
cd Travel-app
# 任選其一
python3 -m http.server 8080
# 或：npx --yes serve -l 8080
```

瀏覽器開啟：http://localhost:8080/

也可直接用瀏覽器開 `index.html`（部分瀏覽器對 `file://` 的 Service Worker 有限制，建議用本機伺服器）。

## GitHub Pages 設定

倉庫：https://github.com/ZLO-25/Travel-app

1. 推送到 `main` 分支（站點放在**倉庫根目錄**）
2. GitHub → **Settings** → **Pages**
3. **Source**：Deploy from a branch
4. Branch：`main`／資料夾：`/ (root)`
5. 儲存後稍等建置完成，造訪 https://zlo-25.github.io/Travel-app/

倉庫內已含空白 `.nojekyll`，避免 Jekyll 略過底線檔。

## 資料與隱私

- **密碼門**為瀏覽器端雜湊比對（不明文寫在程式裡），只擋一般路人；原始碼公開，無法當成真正伺服器級資安。
- 解鎖狀態存在 `sessionStorage`（關掉分頁後需再輸入）。
- 所有旅程資料存在**你目前使用的瀏覽器**；開啟時會下載公開的 `data/remote.json` 種子／同步檔，但**不會把本機修改上傳**。
- **換裝置、換瀏覽器、清除網站資料**會讓資料消失——出發前或重大變更後請到「總覽 → 匯出 JSON」備份。
- 請勿在 App 內貼上護照號碼、完整卡號等敏感資訊；範例種子也刻意不含這類資料。

## 技術

- Vanilla HTML / CSS / JS
- `manifest.webmanifest` + `sw.js`
- 無框架、無打包步驟

## 授權

私人使用（Ryan）。

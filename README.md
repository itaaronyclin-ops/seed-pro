# Seed Event Pro+ 專業活動管理平台

一個基於 HTML/JavaScript 與 Google Apps Script (GAS) 的輕量級、高效能活動管理系統。

## 🌟 重點功能
- **動態報名表單**：支援自定義欄位的活動報名邏輯。
- **後台管理儀表板**：可視化統計數據、活動 CRUD 管理及報名名單流向。
- **帳號權限系統**：支援多級權限管理（Super Admin / Admin / Viewer）。
- **批量操作工具**：一鍵核准、標記付款及導出 CSV 名單。
- **數位識別證系統**：前台支援 QR Code 報到與電話報到功能。
- **專業 UI 設計**：玻璃擬態 (Glassmorphism) 設計風格，極致的視覺體驗。

## 🚀 快速部署
1. **後端 (GAS)**: 將專案內附的 GAS 程式碼貼入 Google Apps Script 編輯器，發布為網頁應用程式（設定為「任何人」可存取）。
2. **網址設定**: 將產生的 Web App URL 貼入 `config.js` 的 `API_URL` 欄位中。
3. **初始化**: 執行 GAS 中的 `setup()` 函式以初始化試算表欄位。
4. **部屬**: 將網頁檔案上傳至 GitHub Pages 或任何網頁空間即可使用。

## 🛠️ 技術棧
- **Frontend**: Tailwind CSS v3, AOS (Animation On Scroll), SweetAlert2, FontAwesome 6
- **Backend**: Google Apps Script, Google Sheets DB

## 📄 開源聲明
本專案由 Antigravity 輔助開發，僅供學習與交流使用。
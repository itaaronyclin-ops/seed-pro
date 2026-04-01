# TMS Pro+ 重大更新總結

## 📅 更新日期: 2026-04-02 (V2.41)
### 🆕 重點功能：SSO 驗證中心遷移與效能優化
- ✅ **SSO 端點更新**：切換至新的高效能驗證節點以提升掃碼反應速度。
- ✅ **API 穩定性強化**：優化輪詢機制，減少網路延遲造成的逾時。
- ✅ **文件同步**：更新 `V-LINK_SSO_INTEGRATION_GUIDE.md` 至最新版本。

---

## 📅 更新日期: 2026-04-01 (V2.40)
### 🆕 重點功能：V-Link SSO 跨系統認證整合
- ✅ **QR Code 登入功能**：主頁面新增「V-Link SSO 手機登入」。
- ✅ **二階段設備綁定**：支援新設備自動偵測與實名帳號綁定流程。
- ✅ **即時輪詢機制**：認證成功後自動秒速進入系統。
- ✅ **安全性強化**：採用中心化驗證，落實無密碼安全規範。
- ✅ **串接指南**：新增 `V-LINK_SSO_INTEGRATION_GUIDE.md` 給開發人員參考。

---

## 📅 更新日期: 2026-02-06 (V2.31)

---

## ✨ 新功能與改進

### 1️⃣ **人員異動審核系統** 🆕

#### 前端功能
- ✅ 新增「人員異動審核」頁面（主系統內）
- ✅ 卡片式審核介面，清楚顯示異動詳情
- ✅ 支援三種異動類型：
  - 新增人員
  - 職級/單位異動
  - 離職
- ✅ 一鍵核准/駁回功能
- ✅ 即時更新待審核數量徽章

#### 後端功能
- ✅ `getPersonnelChanges()` - 取得所有異動申請
- ✅ `approvePersonnelChange()` - 審核並執行異動
- ✅ 自動建立「人員異動申請」工作表
- ✅ 完整的審核記錄追蹤

---

### 2️⃣ **登入持久化** 🔐

#### 改進內容
- ✅ 使用 `localStorage` 儲存登入狀態
- ✅ 重新整理頁面不會登出
- ✅ 會話有效期：24 小時
- ✅ 自動檢查並恢復登入狀態

#### 使用方式
```javascript
// 登入時自動儲存
localStorage.setItem('TMS_SESSION', JSON.stringify({
    username: currentUser,
    timestamp: new Date().getTime()
}));

// 頁面載入時自動檢查
checkExistingSession();
```

---

### 3️⃣ **自動登出機制** ⏱️

#### 安全功能
- ✅ 10 分鐘無操作自動登出
- ✅ 監控所有使用者互動：
  - 滑鼠移動
  - 鍵盤輸入
  - 點擊
  - 滾動
  - 觸控
- ✅ 登出前顯示提示訊息

#### 技術實作
```javascript
const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes

function resetInactivityTimer() {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        alert('閒置時間過長，系統將自動登出');
        logout();
    }, INACTIVITY_TIMEOUT);
}
```

---

### 4️⃣ **動畫與互動增強** 🎨

#### 新增動畫效果
- ✅ 頁面切換淡入淡出動畫
- ✅ 卡片懸停效果（上浮 + 陰影）
- ✅ 按鈕點擊回饋動畫
- ✅ 徽章脈衝動畫
- ✅ 內容載入淡入動畫

#### CSS 動畫
```css
/* 頁面切換 */
.page-section {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

/* 卡片懸停 */
.card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* 淡入動畫 */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```

---

### 5️⃣ **外部頁面樣式統一** 🎯

#### 已統一的頁面
- ✅ `form.html` - 主管登錄
- ✅ `history.html` - 歷程查詢
- ✅ `personnel-change.html` - 人員異動登錄

#### 統一元素
- 相同的配色方案
- 一致的卡片樣式
- 統一的按鈕設計
- 相同的動畫效果
- 一致的表單元素

---

## 🔧 技術改進

### 前端 (index.html)
1. **會話管理**
   - `checkExistingSession()` - 檢查現有會話
   - `setupInactivityDetection()` - 設定閒置偵測
   - `resetInactivityTimer()` - 重置閒置計時器

2. **人員異動審核**
   - `refreshPersonnelReview()` - 重新載入審核列表
   - `renderPersonnelReview()` - 渲染審核卡片
   - `approvePersonnelChange(uuid)` - 核准申請
   - `rejectPersonnelChange(uuid)` - 駁回申請

3. **動畫系統**
   - 平滑的頁面切換
   - 互動式懸停效果
   - 視覺回饋動畫

### 後端 (code.gs)
1. **新增 API 端點**
   - `getPersonnelChanges` - 取得異動申請列表
   - `approvePersonnelChange` - 審核異動申請

2. **資料結構**
   ```javascript
   {
     uuid: "唯一識別碼",
     timestamp: "申請時間",
     type: "異動類型",
     agcode: "人員代碼",
     name: "姓名",
     detailsJson: "詳細資料 (JSON)",
     status: "pending/approved/rejected",
     reviewer: "審核人",
     reviewTime: "審核時間",
     note: "備註"
   }
   ```

---

## 📊 資料庫變更

### 新增工作表
- **人員異動申請** (Personnel Changes)
  - UUID
  - 申請時間
  - 異動類型
  - AGCODE
  - 姓名
  - 詳細資料 (JSON)
  - 狀態
  - 審核人
  - 審核時間
  - 備註

---

## 🚀 部署步驟

### 1. 更新 Google Apps Script
```bash
# 複製新的 code.gs 到 Google Apps Script 編輯器
~/Desktop/TMS_Pro_Package/Google_Server_Code/code.gs
```

### 2. 部署為 Web App
- 版本: 新版本
- 執行身分: 我
- 存取權限: 任何人

### 3. 更新前端
```bash
# 上傳所有 Netlify_Client 檔案到 Netlify
~/Desktop/TMS_Pro_Package/Netlify_Client/
```

---

## 📝 使用指南

### 人員異動審核流程

1. **使用者提交異動申請**
   - 點擊「人員異動登錄」
   - 輸入 AGCODE 查詢
   - 選擇異動類型並填寫資料
   - 送出申請

2. **管理員審核**
   - 登入主系統
   - 點擊「人員異動審核」
   - 查看待審核申請（紅色徽章顯示數量）
   - 點擊「核准」或「駁回」

3. **系統自動執行**
   - 核准後自動更新人員資料
   - 記錄審核歷史
   - 更新系統日誌

---

## ⚠️ 注意事項

1. **會話管理**
   - 會話有效期為 24 小時
   - 10 分鐘無操作會自動登出
   - 重新整理不會登出

2. **人員異動**
   - 離職操作會刪除人員資料，請謹慎審核
   - 所有異動都有完整記錄
   - 駁回的申請仍保留在系統中

3. **瀏覽器相容性**
   - 建議使用 Chrome、Edge、Safari 最新版本
   - 需啟用 JavaScript 和 localStorage

---

## 🐛 已知問題

無

---

## 📞 技術支援

如有問題，請檢查：
1. Google Apps Script 執行記錄
2. 瀏覽器開發者工具 Console
3. 「系統日誌」工作表

---

## 🎉 更新完成！

所有功能已測試並準備就緒。
檔案位置：`~/Desktop/TMS_Pro_Package/`

**祝使用愉快！** 🚀

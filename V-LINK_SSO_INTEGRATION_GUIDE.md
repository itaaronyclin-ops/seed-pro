# 🛡️ V-Link SSO 跨系統串接開發指南 (V6.0)

## 1. 簡介
V-Link SSO 是一套基於 QR Code 的中心化驗證系統。它允許使用者透過手機端的「V-Link」App 掃描 QR Code，將移動設備（AGCODE）與系統帳號（Account）綁定，實現無密碼、跨系統的單一登入體驗。

## 2. 串接準備
串接前，您需要取得以下資訊：
- **SSO 腳本網址 (SSO_URL)**：`https://script.google.com/macros/s/AKfycbzp5XR3Z0Pd5NA1U36v8t0kTxkXQ-rpnyMYugUWQuW7B7eRbUw48wqvUB7B4raq_KsvxQ/exec`
- **系統代碼 (SYSTEM_ID)**：建議設為 `seed_pro` (主系統) 或根據子系統需求設定。

---

## 3. 認證流程詳解 (Authentication Flow)

### 階段一：初始化 (Initialize Session)
前端向 SSO 發送請求，取得一個唯一的 `qrToken`。
- **Endpoint**: `GET SSO_URL?action=init_session`
- **Response**: `{ status: "success", qrToken: "UUID-STRING" }`

### 階段二：顯示 QR Code (Show QR Code)
使用生成的 `qrToken` 產生 QR Code 給手機掃描。
- **QR 內容網址**: `SSO_URL?action=authorize&qrToken=UUID-STRING&system=SYSTEM_ID`

### 階段三：狀態輪詢 (Polling)
前端每 3 秒向 SSO 詢問一次該 Token 的狀態。
- **Endpoint**: `GET SSO_URL?action=poll_session&qrToken=UUID-STRING&system=SYSTEM_ID`

#### 狀態回應 (Status)
| 狀態代碼 | 說明 | 後續動作 |
| :--- | :--- | :--- |
| `pending` | 等待掃描中 | 繼續輪詢 |
| `unbound` | 已掃描，但此 AGCODE 尚未與此系統綁定 | 進到 **二階段綁定流程** |
| `authorized` | 認證成功！ | 取得 `bound_username`，直接登入系統 |

---

## 4. 二階段綁定流程 (Binding Flow)
如果 `poll_session` 回傳 `status: "unbound"`，請執行以下動作：

1. **認證原帳號**：在網頁上要求使用者輸入原系統帳號密碼進行驗證。
2. **生成確認 QR**：驗證成功後，生成一個「二次掃描確認碼」。
   - **確認網址**: `SSO_URL?action=authorize&qrToken=NEW_TOKEN&agcode_ref=AGCODE&account=USERNAME&system=SYSTEM_ID`
3. **完成綁定**：使用者用相同手機掃描此二次碼，手機端會自動跳轉「確認連動」。
4. **登入**：當 SSO 收到手機確認後，`poll_session` 會回傳 `authorized`。

---

## 5. 前端實作範例 (JavaScript)

```javascript
// --- 1. 初始化 ---
const ssoUrl = "https://script.google.com/macros/s/AKfycbzp5XR3Z0Pd5NA1U36v8t0kTxkXQ-rpnyMYugUWQuW7B7eRbUw48wqvUB7B4raq_KsvxQ/exec";
const resp = await fetch(ssoUrl + "?action=init_session");
const { qrToken } = await resp.json();

// --- 2. 輪詢 ---
const timer = setInterval(async () => {
    const poll = await fetch(`${ssoUrl}?action=poll_session&qrToken=${qrToken}&system=traffic`);
    const data = await poll.json();

    if (data.status === 'authorized') {
        clearInterval(timer);
        loginUser(data.bound_username); // 執行系統登入
    } else if (data.status === 'unbound') {
        clearInterval(timer);
        showBindingForm(data.agcode); // 顯示綁定表單
    }
}, 3000);
```

---

## 💡 開發貼士 (Best Practices)
> [!TIP]
> **佈署注意事項**
> 佈署 Google Apps Script 時，請務必將「誰有權限存取」設定為 **「任何人 (Anyone)」**，否則前端 `fetch` 會因為 CORS 或是權限不足而失敗。

> [!IMPORTANT]
> **安全性建議**
> 在二階段綁定時，請務必先在您的系統後端驗證使用者的原始帳密，驗證成功後才生成二次確認 QR 碼。

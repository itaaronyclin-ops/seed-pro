# 人員異動功能 - 後端 API 需求

## 新增的 Google Apps Script 函數

為了支援「人員異動登錄」功能，需要在 `code.gs` 中新增以下兩個函數：

---

### 1. `checkPersonExists(agcode)`

**功能**: 檢查指定的 AGCODE 是否已存在於系統中

**參數**:
- `agcode` (String): 要查詢的 AGCODE

**回傳值** (Object):
```javascript
{
  found: true/false,  // 是否找到該人員
  person: {           // 如果 found = true，回傳人員資料
    id: "1001",
    name: "王小明",
    rank: "經理",
    group: "業務部",
    manager: "李主管"
  }
}
```

**實作範例**:
```javascript
function checkPersonExists(agcode) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const peopleSheet = ss.getSheetByName('People');
  const data = peopleSheet.getDataRange().getValues();
  
  // 假設第一列是標題，從第二列開始找
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == agcode) {  // 假設 AGCODE 在第一欄
      return {
        found: true,
        person: {
          id: data[i][0],
          name: data[i][1],
          rank: data[i][2],
          group: data[i][3],
          manager: data[i][4] || ''
        }
      };
    }
  }
  
  return { found: false };
}
```

---

### 2. `submitPersonnelChange(data)`

**功能**: 提交人員異動申請（新增、異動、離職）

**參數**:
- `data` (Object): 異動資料，根據 `type` 不同有不同欄位

**異動類型與資料格式**:

#### 類型 1: 新增人員 (`type: 'new'`)
```javascript
{
  type: 'new',
  id: '1001',
  name: '王小明',
  rank: '經理',
  group: '業務部',
  manager: '李主管'  // 選填
}
```

#### 類型 2: 職級/單位異動 (`type: 'transfer'`)
```javascript
{
  type: 'transfer',
  id: '1001',
  name: '王小明',
  oldRank: '專員',
  newRank: '經理',
  oldGroup: '業務一部',
  newGroup: '業務二部',
  reason: '晉升調動'  // 選填
}
```

#### 類型 3: 離職 (`type: 'resign'`)
```javascript
{
  type: 'resign',
  id: '1001',
  name: '王小明',
  rank: '經理',
  group: '業務部',
  reason: '個人因素'  // 選填
}
```

**回傳值**: 
- 成功: `{ success: true, message: '申請已送出' }`
- 失敗: 拋出錯誤

**實作範例**:
```javascript
function submitPersonnelChange(data) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const changeSheet = ss.getSheetByName('PersonnelChanges') || ss.insertSheet('PersonnelChanges');
  
  // 如果是新工作表，加入標題列
  if (changeSheet.getLastRow() === 0) {
    changeSheet.appendRow(['UUID', '時間', '類型', 'AGCODE', '姓名', '詳細資料', '狀態', '處理人', '處理時間']);
  }
  
  const uuid = Utilities.getUuid();
  const timestamp = new Date();
  const detailsJson = JSON.stringify(data);
  
  // 類型中文化
  const typeMap = {
    'new': '新增人員',
    'transfer': '異動',
    'resign': '離職'
  };
  
  changeSheet.appendRow([
    uuid,
    timestamp,
    typeMap[data.type] || data.type,
    data.id,
    data.name,
    detailsJson,
    'pending',  // 狀態: pending, approved, rejected
    '',         // 處理人
    ''          // 處理時間
  ]);
  
  return { success: true, message: '申請已送出，等待管理員審核' };
}
```

---

## 管理員審核功能（建議）

建議在主系統中新增「人員異動審核」頁面，讓管理員可以：

1. 查看所有待審核的異動申請
2. 核准或駁回申請
3. 核准後自動執行對應操作：
   - **新增**: 在 People 工作表新增一筆資料
   - **異動**: 更新 People 工作表中該人員的職級/單位
   - **離職**: 從 People 工作表刪除該人員

**審核函數範例**:
```javascript
function approvePersonnelChange(uuid, action) {
  // action: 'approve' 或 'reject'
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const changeSheet = ss.getSheetByName('PersonnelChanges');
  const peopleSheet = ss.getSheetByName('People');
  
  const data = changeSheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === uuid) {
      if (action === 'approve') {
        const details = JSON.parse(data[i][5]);
        
        if (details.type === 'new') {
          // 新增人員到 People 工作表
          peopleSheet.appendRow([details.id, details.name, details.rank, details.group, details.manager || '']);
        } else if (details.type === 'transfer') {
          // 更新人員資料
          const peopleData = peopleSheet.getDataRange().getValues();
          for (let j = 1; j < peopleData.length; j++) {
            if (peopleData[j][0] === details.id) {
              peopleSheet.getRange(j + 1, 3).setValue(details.newRank);
              peopleSheet.getRange(j + 1, 4).setValue(details.newGroup);
              break;
            }
          }
        } else if (details.type === 'resign') {
          // 刪除人員
          const peopleData = peopleSheet.getDataRange().getValues();
          for (let j = 1; j < peopleData.length; j++) {
            if (peopleData[j][0] === details.id) {
              peopleSheet.deleteRow(j + 1);
              break;
            }
          }
        }
        
        changeSheet.getRange(i + 1, 7).setValue('approved');
      } else {
        changeSheet.getRange(i + 1, 7).setValue('rejected');
      }
      
      changeSheet.getRange(i + 1, 8).setValue(Session.getActiveUser().getEmail());
      changeSheet.getRange(i + 1, 9).setValue(new Date());
      
      return { success: true };
    }
  }
  
  throw new Error('找不到該申請');
}
```

---

## 工作表結構

### PersonnelChanges 工作表
| 欄位 | 說明 |
|------|------|
| UUID | 唯一識別碼 |
| 時間 | 申請時間 |
| 類型 | 新增人員/異動/離職 |
| AGCODE | 人員代碼 |
| 姓名 | 人員姓名 |
| 詳細資料 | JSON 格式的完整資料 |
| 狀態 | pending/approved/rejected |
| 處理人 | 審核人員 |
| 處理時間 | 審核時間 |

---

## 前端使用說明

1. 使用者點擊側邊欄的「人員異動登錄」按鈕
2. 新分頁開啟 `personnel-change.html`
3. 輸入 AGCODE 查詢
4. 根據查詢結果：
   - **不存在**: 填寫新增人員表單
   - **已存在**: 選擇異動或離職
5. 送出後等待管理員審核

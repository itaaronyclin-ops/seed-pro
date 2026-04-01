/* TMS Pro+ V4.8 for Netlify API Backend */

function doGet(e) {
  const p = e.parameter;
  const action = p.action || p.function; // Support both naming conventions
  const callback = p.callback;
  
  if (action) {
    let args = [];
    try {
      if (p.args) args = JSON.parse(p.args);
    } catch (err) {}
    
    let result = null;
    try {
      result = routeAction(action, args);
    } catch (err) {
      result = { success: false, message: err.toString() };
    }
    
    const output = JSON.stringify(result);
    if (callback) {
      return ContentService.createTextOutput(callback + "(" + output + ")")
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService.createTextOutput(output)
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput("TMS Pro+ API Service is Running.");
}

function routeAction(action, args) {
  switch (action) {
    case 'checkAdminLogin': return checkAdminLogin(args[0], args[1]);
    case 'getReportData': return getReportData();
    case 'updateAdminAccount': return updateAdminAccount(args[0], args[1], args[2]);
    case 'toggleCompletion': return toggleCompletion(args[0], args[1], args[2]);
    case 'toggleExemption': return toggleExemption(args[0], args[1], args[2]);
    case 'batchRecordCompletion': return batchRecordCompletion(args[0], args[1], args[2], args[3]);
    case 'processAudit': return processAudit(args[0], args[1], args[2]);
    case 'saveCourse': return saveCourse(args[0]);
    case 'toggleCourseStatus': return toggleCourseStatus(args[0], args[1]);
    case 'addPerson': return addPerson(args[0]);
    case 'updatePerson': return updatePerson(args[0]);
    case 'getPendingCoursesForForm': return getPendingCoursesForForm(args[0]);
    case 'processFormSubmission': return processFormSubmission(args[0]);
    case 'getPersonHistory': return getPersonHistory(args[0]);
    case 'generatePDF': return generatePDF(args[0]);
    case 'checkPersonExists': return checkPersonExists(args[0]);
    case 'submitPersonnelChange': return submitPersonnelChange(args[0]);
    case 'getPersonnelChanges': return getPersonnelChanges();
    case 'approvePersonnelChange': return approvePersonnelChange(args[0], args[1], args[2], args[3]);
    case 'handleAudit': return handleAudit(args[0], args[1]);
    case 'getTrainingEvents': return getTrainingEvents(args[0]);
    case 'manageTrainingEvent': return manageTrainingEvent(args[0], args[1]);
    case 'trainingCheckin': return saveTrainingCheckin(args[0]);
    case 'getTrainingStats': return getTrainingStats(args[0], args[1]);
    case 'getPenalties': return getPenalties();
    case 'managePenalty': return managePenalty(args[0], args[1]);
    case 'getPointsStatus': return getPointsStatus(args[0]);
    case 'addPoints': return addPoints(args[0], args[1], args[2]);
    case 'getLeaderboard': return getLeaderboard();
    case 'getLiveAttendance': return getLiveAttendance(args[0]);
    case 'generateTrainingStatsPDF': return generateTrainingStatsPDF(args[0], args[1]);
    case 'setWorkshopState': return setWorkshopState(args[0]);
    case 'getWorkshopState': return getWorkshopState();
    case 'submitWorkshopUpload': return submitWorkshopUpload(args[0]);
    case 'getWorkshopUploads': return getWorkshopUploads();
    case 'ping': return { success: true, timestamp: new Date().getTime() };
    default: throw new Error("Unknown action: " + action);
  }
}

function doPost(e) {
  // CORS Handling
  // Google Apps Script Web Apps handling CORS can be tricky. 
  // We simply return the JSON with NO special headers because GAS wrappers handle some of it,
  // OR we rely on "text/plain" content type in request to avoid preflight.
  
  // Parse Request
  let body = {};
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return createJSONOutput({ error: "Invalid JSON", details: err.toString() });
  }
  
  const action = body.action;
  const args = body.args || [];
  
  let result = null;
  
  try {
    switch (action) {
      case 'checkAdminLogin':
        result = checkAdminLogin(args[0], args[1]);
        break;
      case 'getReportData':
        result = getReportData();
        break;
      case 'updateAdminAccount':
        result = updateAdminAccount(args[0], args[1], args[2]);
        break;
      case 'toggleCompletion':
        result = toggleCompletion(args[0], args[1], args[2]);
        break;
      case 'toggleExemption':
        result = toggleExemption(args[0], args[1], args[2]);
        break;
      case 'batchRecordCompletion':
        result = batchRecordCompletion(args[0], args[1], args[2], args[3]);
        break;
      case 'processAudit':
        result = processAudit(args[0], args[1], args[2]);
        break;
      case 'saveCourse':
        result = saveCourse(args[0]);
        break;
      case 'toggleCourseStatus':
        result = toggleCourseStatus(args[0], args[1]);
        break;
      case 'addPerson':
        result = addPerson(args[0]);
        break;
      case 'updatePerson':
        result = updatePerson(args[0]);
        break;
      case 'getPendingCoursesForForm':
        result = getPendingCoursesForForm(args[0]);
        break;
      case 'processFormSubmission':
        result = processFormSubmission(args[0]);
        break;
      case 'getPersonHistory':
        result = getPersonHistory(args[0]);
        break;
      case 'generatePDF':
        result = generatePDF(args[0]);
        break;
      case 'getScriptUrl':
        // For Netlify version, we don't need this, but to avoid errors:
        result = ""; 
        break;
      case 'checkPersonExists':
        result = checkPersonExists(args[0]);
        break;
      case 'submitPersonnelChange':
        result = submitPersonnelChange(args[0]);
        break;
      case 'getPersonnelChanges':
        result = getPersonnelChanges();
        break;
      case 'approvePersonnelChange':
        result = approvePersonnelChange(args[0], args[1], args[2], args[3]);
        break;
      case 'handleAudit':
        result = handleAudit(args[0], args[1]);
        break;
      case 'getTrainingEvents':
        result = getTrainingEvents(args[0]); // args[0] is activeOnly
        break;
      case 'manageTrainingEvent':
        result = manageTrainingEvent(args[0], args[1]); // operation, data
        break;
      case 'trainingCheckin':
        result = saveTrainingCheckin(args[0]); // data
        break;
      case 'getTrainingStats':
        result = getTrainingStats(args[0], args[1]); // start, end
        break;
      case 'managePenalty':
        result = managePenalty(args[0], args[1]); // operation, data
        break;
      case 'getPenalties':
        result = getPenalties();
        break;
      case 'getLiveAttendance':
        result = getLiveAttendance(args[0]); // eventId
        break;
      case 'generateTrainingStatsPDF':
        result = generateTrainingStatsPDF(args[0], args[1]);
        break;
      case 'getPointsStatus':
        result = getPointsStatus(args[0]);
        break;
      case 'addPoints':
        result = addPoints(args[0], args[1], args[2]);
        break;
      case 'getLeaderboard':
        result = getLeaderboard();
        break;
      case 'setWorkshopState':
        result = setWorkshopState(args[0]);
        break;
      case 'getWorkshopState':
        result = getWorkshopState();
        break;
      case 'submitWorkshopUpload':
        result = submitWorkshopUpload(args[0]);
        break;
      case 'getWorkshopUploads':
        result = getWorkshopUploads();
        break;
      case 'deleteWorkshopUpload':
        result = deleteWorkshopUpload(args[0]);
        break;
      case 'ping':
        result = ping();
        break;
      default:
        result = { error: "Unknown Action: " + action };
    }
  } catch (error) {
    result = { error: "Server Error", message: error.toString(), stack: error.stack };
  }
  
  return createJSONOutput(result);
}

function createJSONOutput(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// ★ 核心工具：資料清洗器 & 日誌
// ==========================================
function cleanVal(val) {
  if (val === null || val === undefined) return "";
  return String(val).trim().toUpperCase(); 
}

function writeLog(action, msg) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('系統日誌');
    if (!sheet) { 
      sheet = ss.insertSheet('系統日誌'); 
      sheet.appendRow(['時間', '動作', '訊息']);
      sheet.setColumnWidth(1, 150);
      sheet.setColumnWidth(3, 500);
    }
    sheet.appendRow([new Date(), action, msg]);
  } catch(e) {}
}

// ==========================================
// 資料讀取 (讀取不做鎖定，確保速度最快)
// ==========================================
function getReportData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. 人員
  let pSheet = ss.getSheetByName('人員名單');
  if(!pSheet) { pSheet = ss.insertSheet('人員名單'); pSheet.appendRow(['AGCODE','姓名','職級','單位','直屬主管']); }
  const pData = pSheet.getDataRange().getValues();
  const people = pData.length > 1 ? pData.slice(1).filter(r=>r[0]).map(r => ({ 
    id: cleanVal(r[0]), 
    name: r[1], rank: r[2], group: r[3], manager: r[4] 
  })) : [];

  // 2. 課程
  // 2. 課程
  let cSheet = ss.getSheetByName('訓練項目');
  if(!cSheet) { 
      cSheet = ss.insertSheet('訓練項目'); 
      cSheet.appendRow(['母代號','母課程名稱','子代號','子課程名稱','狀態']); 
  } else {
      // Auto-repair header if missing 'Status' column
      if (cSheet.getLastColumn() < 5 || cSheet.getRange(1, 5).getValue() === '') {
          cSheet.getRange(1, 5).setValue('狀態');
      }
  }
  const cData = cSheet.getDataRange().getValues();
  const courses = cData.length > 1 ? cData.slice(1).map((r, i) => ({ 
    rowIndex: i + 2, 
    pCode: cleanVal(r[0]), pName: r[1], 
    cCode: cleanVal(r[2]), cName: r[3], 
    status: r[4] === 'Closed' ? 'Closed' : 'Active',
    isActive: r[4] !== 'Closed',
    fullCode: `${cleanVal(r[0])}-${cleanVal(r[2])}` 
  })).filter(c => c.pCode) : [];

  // 3. 紀錄 (使用 Map 優化讀取速度)
  const recordMap = {};
  let rSheet = ss.getSheetByName('訓練紀錄');
  if(!rSheet) { rSheet = ss.insertSheet('訓練紀錄'); rSheet.appendRow(['AGCODE','課程/訓練代號','完訓日期','完訓方式']); }
  const rData = rSheet.getDataRange().getValues();
  if (rData.length > 1) {
    rData.slice(1).forEach(r => {
      const key = `${cleanVal(r[0])}_${cleanVal(r[1])}`;
      const dateStr = r[2] ? Utilities.formatDate(new Date(r[2]), Session.getScriptTimeZone(), "yyyy/MM/dd") : "已完成";
      const timeStr = (r[2] instanceof Date) ? Utilities.formatDate(r[2], Session.getScriptTimeZone(), "HH:mm:ss") : '';
      recordMap[key] = { date: dateStr, time: timeStr, method: r[3] || '一般' };
    });
  }

  // 4. 免訓
  const exemptSet = [];
  let eSheet = ss.getSheetByName('免訓名單');
  if(!eSheet) { eSheet = ss.insertSheet('免訓名單'); eSheet.appendRow(['AGCODE','課程/訓練代號']); }
  const eData = eSheet.getDataRange().getValues();
  if(eData.length > 1) {
    eData.slice(1).forEach(r => {
      exemptSet.push(`${cleanVal(r[0])}_${cleanVal(r[1])}`);
    });
  }

  // 5. 待確認
  let auditSheet = ss.getSheetByName('待確認放行名單');
  if(!auditSheet) { auditSheet = ss.insertSheet('待確認放行名單'); auditSheet.appendRow(['申請時間','AGCODE','姓名','課程/訓練代號','完訓日期','狀態','填表人','完訓方式']); }
  const auditData = auditSheet.getDataRange().getValues();
  const auditList = auditData.length > 1 ? auditData.slice(1).map((r, i) => ({
    rowIndex: i + 2,
    timestamp: r[0] ? Utilities.formatDate(new Date(r[0]), Session.getScriptTimeZone(), "MM/dd HH:mm") : '',
    empId: cleanVal(r[1]), empName: r[2], courseCode: cleanVal(r[3]), 
    finishDate: r[4] ? Utilities.formatDate(new Date(r[4]), Session.getScriptTimeZone(), "yyyy/MM/dd") : '',
    filler: r[6] || r[2], method: r[7] || '未指定'
  })) : [];

  const groups = [...new Set(people.map(p => p.group))].filter(String);
  const parentCourseMap = new Map();
  courses.forEach(c => parentCourseMap.set(c.pCode, c.pName));
  const parentCourses = Array.from(parentCourseMap, ([code, name]) => ({code, name}));
  const personnelChanges = getPersonnelChanges();

  return { status: 'success', people, courses, recordMap, exemptSet, groups, parentCourses, auditList, personnelChanges };
}

// ==========================================
// ★ 寫入核心 (加入 LockService 防止多人衝突)
// ==========================================

function toggleCompletion(empId, courseCode, isComplete) {
  // 鎖定：防止多人同時寫入造成資料覆蓋 (等待最多 10 秒)
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); 
  } catch (e) {
    return { success: false, message: '系統繁忙，請稍後再試' };
  }

  try {
    const targetId = cleanVal(empId);
    const targetCode = cleanVal(courseCode);
    writeLog('觸發完訓切換', `ID=[${targetId}], Code=[${targetCode}], 動作: ${isComplete ? '新增' : '撤銷'}`);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const s = ss.getSheetByName('訓練紀錄');
    
    if (isComplete) {
      // 檢查重複 (雖然前端已擋，後端再保險一次)
      const d = s.getDataRange().getValues();
      for(let i=1; i<d.length; i++) {
        if(cleanVal(d[i][0]) === targetId && cleanVal(d[i][1]) === targetCode) {
          return { success: true, message: '紀錄已存在' }; 
        }
      }
      s.getRange(s.getLastRow() + 1, 1).setNumberFormat('@');
      s.appendRow([targetId, targetCode, new Date(), '補登']);
      return { success: true };
    } else {
      const d = s.getDataRange().getValues();
      let deleted = false;
      // 倒序刪除
      for (let i = d.length - 1; i >= 1; i--) { 
        if (cleanVal(d[i][0]) === targetId && cleanVal(d[i][1]) === targetCode) { 
          s.deleteRow(i + 1); 
          deleted = true;
          break; 
        }
      }
      if (!deleted) writeLog('撤銷警告', '找不到該筆資料可刪除');
      return { success: true }; // 找不到也回傳成功，讓前端UI保持一致
    }
  } catch (e) {
    writeLog('寫入錯誤', e.toString());
    return { success: false, message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

function toggleExemption(empId, courseCode, isExempt) {
  const lock = LockService.getScriptLock();
  try { lock.waitLock(10000); } catch (e) { return { success: false, message: '系統繁忙' }; }

  try {
    const targetId = cleanVal(empId);
    const targetCode = cleanVal(courseCode);
    writeLog('觸發免訓切換', `ID=[${targetId}], Code=[${targetCode}], 動作: ${isExempt ? '新增' : '撤銷'}`);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const s = ss.getSheetByName('免訓名單');
    
    if (isExempt) {
      const d = s.getDataRange().getValues();
      for(let i=1; i<d.length; i++) {
        if(cleanVal(d[i][0]) === targetId && cleanVal(d[i][1]) === targetCode) return { success: true }; 
      }
      s.getRange(s.getLastRow() + 1, 1).setNumberFormat('@');
      s.appendRow([targetId, targetCode]);
      return { success: true };
    } else {
      const d = s.getDataRange().getValues();
      for (let i = d.length - 1; i >= 1; i--) {
        if (cleanVal(d[i][0]) === targetId && cleanVal(d[i][1]) === targetCode) { 
          s.deleteRow(i + 1); 
          break; 
        }
      }
      return { success: true };
    }
  } finally {
    lock.releaseLock();
  }
}

function batchRecordCompletion(ids, code, date, method) {
  const lock = LockService.getScriptLock();
  try { lock.waitLock(15000); } catch (e) { return { success: false, message: '系統繁忙' }; }

  try {
    const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('訓練紀錄');
    const cleanCode = cleanVal(code);
    const rows = ids.map(id => [cleanVal(id), cleanCode, new Date(date.replace(/-/g,'/')), method]);
    
    if(rows.length) {
      // 批次寫入 (一次 IO，速度最快)
      s.getRange(s.getLastRow()+1, 1, rows.length, 1).setNumberFormat('@'); 
      s.getRange(s.getLastRow()+1, 1, rows.length, 4).setValues(rows);
      writeLog('批次寫入', `成功寫入 ${rows.length} 筆資料 (課程: ${cleanCode})`);
    }
    return { success: true };
  } catch(e) {
    writeLog('批次錯誤', e.toString());
    return { success: false, message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

// ==========================================
// 其他功能 (表單、審核、編輯)
// ==========================================

function processAudit(idx, act, data) {
  const lock = LockService.getScriptLock();
  try { lock.waitLock(10000); } catch(e) { return {success:false}; }
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (act === 'approve') {
      const s = ss.getSheetByName('訓練紀錄');
      s.getRange(s.getLastRow() + 1, 1).setNumberFormat('@');
      s.appendRow([cleanVal(data.empId), cleanVal(data.courseCode), data.finishDate, data.method]);
    }
    ss.getSheetByName('待確認放行名單').deleteRow(parseInt(idx));
    return { success: true };
  } finally { lock.releaseLock(); }
}

function saveCourse(d) {
  const lock = LockService.getScriptLock();
  if(!lock.tryLock(5000)) return {success:false, message: "伺服器忙碌中"};
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let s = ss.getSheetByName('訓練項目');
    if(!s) {
       s = ss.insertSheet('訓練項目');
       s.appendRow(['母代號','母課程名稱','子代號','子課程名稱','狀態']);
    }
    
    // Explicitly handle row index
    const rIdx = (d.rowIndex && !isNaN(parseInt(d.rowIndex))) ? parseInt(d.rowIndex) : 0;
    
    // Determine status: preserve existing if updating, default to Active if new
    let status = d.status || 'Active';
    if (rIdx >= 2 && !d.status) {
       const existingStatus = s.getRange(rIdx, 5).getValue();
       if (existingStatus) status = existingStatus;
    }

    const rowData = [
      cleanVal(d.pCode), 
      d.pName ? String(d.pName).trim() : "", 
      cleanVal(d.cCode), 
      d.cName ? String(d.cName).trim() : "", 
      status
    ];

    if (rIdx >= 2) {
      s.getRange(rIdx, 1, 1, 5).setValues([rowData]);
      return { success: true, updated: true, row: rIdx };
    } else {
      s.appendRow(rowData);
      return { success: true, updated: false, row: s.getLastRow() };
    }
  } catch (e) {
    return { success: false, message: "後端錯誤: " + e.toString() };
  } finally {
    lock.releaseLock();
  }
}

function toggleCourseStatus(rowIndex, isActive) {
  const lock = LockService.getScriptLock();
  if(!lock.tryLock(5000)) return {success:false};
  try {
    const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('訓練項目');
    const rIndex = parseInt(rowIndex, 10);
    // Explicit boolean conversion
    const activeState = (String(isActive) === 'true' || isActive === true);
    const valToWrite = activeState ? 'Active' : 'Closed';
    
    s.getRange(rIndex, 5).setValue(valToWrite);
    return {
        success: true, 
        debug_row: rIndex, 
        debug_val: valToWrite,
        debug_arg: isActive
    };
  } finally { lock.releaseLock(); }
}

function addPerson(d){ 
  const lock = LockService.getScriptLock();
  if(!lock.tryLock(5000)) return {success:false};
  try {
    const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('人員名單');
    s.getRange(s.getLastRow()+1, 1).setNumberFormat('@'); 
    s.appendRow([cleanVal(d.id),d.name,d.rank,d.group,d.manager]); 
    return {success:true}; 
  } finally { lock.releaseLock(); }
}

function updatePerson(d){ 
  const lock = LockService.getScriptLock();
  if(!lock.tryLock(5000)) return {success:false};
  try {
    const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('人員名單');
    const v = s.getDataRange().getValues();
    for(let i=1;i<v.length;i++) if(cleanVal(v[i][0])===cleanVal(d.id)){ s.getRange(i+1,2,1,4).setValues([[d.name,d.rank,d.group,d.manager]]); return {success:true}; }
    return {success:false};
  } finally { lock.releaseLock(); }
}

function getPendingCoursesForForm(empId) {
  const db = getReportData(); 
  const cleanId = cleanVal(empId);
  const person = db.people.find(p => p.id === cleanId);
  if (!person) return { found: false };

  const pending = [];
  db.courses.forEach(c => {
    const key = `${person.id}_${c.fullCode}`;
    const isDone = db.recordMap[key];
    const isExempt = db.exemptSet.includes(key);
    const isAuditing = db.auditList.some(a => cleanVal(a.empId) === person.id && cleanVal(a.courseCode) === c.fullCode);

    if (!isDone && !isExempt && !isAuditing && c.status !== 'Closed') {
      pending.push({ code: c.fullCode, name: c.cName });
    }
  });
  return { found: true, name: person.name, rank: person.rank, group: person.group, pendingCourses: pending };
}

function submitRequest(empId, empName, courseCode, dateStr, filler, method) {
  const lock = LockService.getScriptLock();
  if(!lock.tryLock(10000)) return { success: false, message: '系統忙碌' };
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const cleanId = cleanVal(empId);
    const cleanCode = cleanVal(courseCode);
    
    // 檢查是否重複
    let rSheet = ss.getSheetByName('訓練紀錄');
    if (!rSheet) rSheet = ss.insertSheet('訓練紀錄');
    const rData = rSheet.getDataRange().getValues();
    for(let i=1; i<rData.length; i++) {
      if(cleanVal(rData[i][0]) === cleanId && cleanVal(rData[i][1]) === cleanCode) {
        return { success: false, message: '已有紀錄' };
      }
    }

    let targetSheet = ss.getSheetByName('待確認放行名單');
    if (!targetSheet) { targetSheet = ss.insertSheet('待確認放行名單'); targetSheet.appendRow(['申請時間','AGCODE','姓名','課程/訓練代號','完訓日期','狀態','填表人','完訓方式']); }
    
    targetSheet.getRange(targetSheet.getLastRow() + 1, 2).setNumberFormat('@'); 
    targetSheet.appendRow([new Date(), cleanId, empName, cleanCode, dateStr, '待確認放行', filler, method]);
    return { success: true, message: '已送出' };
  } catch (e) { return { success: false, message: "系統錯誤: " + e.message }; }
  finally { lock.releaseLock(); }
}

function processFormSubmission(data) {
  return submitRequest(data.empId, data.empName, data.courseCode, data.finishDate, data.filler, data.method);
}

function getPersonHistory(keyword) {
  const db = getReportData();
  const cleanKey = cleanVal(keyword);
  const p = db.people.find(x => x.id === cleanKey || x.name === keyword);
  if (!p) return { found: false };
  
  const allHistory = db.courses.map(c => {
    const key = `${p.id}_${c.fullCode}`;
    const rec = db.recordMap[key];
    const isEx = db.exemptSet.includes(key); 
    return { 
      code: c.fullCode, name: c.cName, pName: c.pName, 
      status: isEx ? '免訓' : (rec ? '已完成' : '未完成'), 
      date: rec?.date||'', method: rec?.method||'',
      statusRaw: isEx ? 'exempt' : (rec ? 'done' : 'miss')
    };
  });
  const filteredHistory = allHistory.filter(h => h.statusRaw === 'done');
  return { found: true, person: p, history: filteredHistory };
}

// ==========================================
// ★ 修正版：PDF 報表 (包含未完成/免訓資料)
// ==========================================
function generatePDF(req) {
  // 取得資料
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const pSheet = ss.getSheetByName("人員名單");
  const cSheet = ss.getSheetByName("訓練項目");
  const rSheet = ss.getSheetByName("訓練紀錄");
  const eSheet = ss.getSheetByName("免訓名單");

  if (!pSheet || !cSheet || !rSheet) {
    return { base64: "", filename: "", error: "資料庫讀取失敗，請確認工作表名稱是否正確" };
  }

  const people = pSheet.getDataRange().getValues().slice(1);
  const courses = cSheet.getDataRange().getValues().slice(1);
  const records = rSheet.getDataRange().getValues().slice(1);
  
  let exempts = [];
  if (eSheet && eSheet.getLastRow() > 1) {
    exempts = eSheet.getDataRange().getValues().slice(1).map(r => `${cleanVal(r[0])}_${cleanVal(r[1])}`);
  }

  // 建立快速查詢表
  let recMap = {};
  records.forEach(r => {
    const key = `${cleanVal(r[0])}_${cleanVal(r[1])}`; 
    recMap[key] = { date: formatDate(r[2]), method: r[3] };
  });

  // 準備 HTML 內容
  let html = HtmlService.createTemplateFromFile('PrintTemplate');
  
  if (req.type === 'individual') {
    // --- 個人歷程 ---
    const pRow = people.find(p => String(p[0]) === String(req.id));
    if(pRow) {
       const history = [];
       courses.forEach(c => {
         const fullCode = `${cleanVal(c[0])}-${cleanVal(c[2])}`;
         const key = `${req.id}_${fullCode}`;
         const rec = recMap[key];
         const isExempt = exempts.includes(key);

         // ★ 修改點：僅加入已完訓項目 (rec 存在)
         if(rec) {
            history.push({
                code: fullCode, 
                name: c[3], 
                pName: c[1], 
                date: rec.date, 
                method: rec.method, 
                status: 'Done'
            });
         }
       });
       // ★ 修改點：在個人資料中加入 rank: pRow[2]
       html.data = { type: 'individual', p: {name: pRow[1], id: pRow[0], rank: pRow[2], group: pRow[3]}, history: history };
    } else {
       html.data = { type: 'individual', p: {name: '查無資料', id: req.id, group: ''}, history: [] };
    }
  } 
  else {
    // --- 總覽報表 (Dashboard) ---
    let list = [];
    
    // 1. Determine People Scope
    let targetPeople = people;
    if (req.mode === 'group') {
      targetPeople = people.filter(p => p[3] === req.val);
    } else if (req.mode === 'rank') {
      targetPeople = people.filter(p => p[2] === req.val);
    }
    
    // 2. Keyword Search Filter (Name, ID, Manager)
    if (req.search) {
      const k = String(req.search).toLowerCase();
      targetPeople = targetPeople.filter(p => 
        String(p[0]).toLowerCase().includes(k) || // ID
        String(p[1]).toLowerCase().includes(k) || // Name
        (p[4] && String(p[4]).toLowerCase().includes(k)) // Manager
      );
    }
    
    // 3. Determine Course Scope
    let targetCourses = courses;
    if (req.mode === 'course') {
      if (req.subFilter === 'all' || !req.subFilter) {
        // All Child Courses under Parent Code (req.val)
        targetCourses = courses.filter(c => cleanVal(c[0]) === cleanVal(req.val));
      } else {
        // Specific Course Mode
        targetCourses = courses.filter(c => `${cleanVal(c[0])}-${cleanVal(c[2])}` === cleanVal(req.subFilter));
      }
    }
    // else: targetCourses remains as all courses (for group, rank, all modes)

    targetPeople.forEach(p => {
       const pId = cleanVal(p[0]);
       
       targetCourses.forEach(c => {
         const fullCode = `${cleanVal(c[0])}-${cleanVal(c[2])}`;
         const key = `${pId}_${fullCode}`;
         
         const rec = recMap[key];
         const isExempt = exempts.includes(key);
         
         let status = 'miss';
         if (isExempt) status = 'exempt';
         else if (rec) status = 'done';

         if (status === 'miss' && c[4] === 'Closed') {
            status = 'exempt';
         }

         if (req.statusFilter && req.statusFilter !== 'all') {
            if (status !== req.statusFilter) return; 
         }

         list.push({
           pId: pId, 
           pName: p[1], 
           pRank: p[2], 
           pGroup: p[3],
           cName: c[3], 
           cCode: fullCode,
           status: status,
           date: rec ? rec.date : '',
           time: rec ? rec.time : '',
           method: rec ? rec.method : ''
         });
       });
    });

    // ★ 排序：依照 ID 升冪排列，確保報表整齊
    list.sort((a, b) => (a.pId < b.pId ? -1 : 1));

    html.data = {
      type: 'dashboard',
      title: req.title,
      list: list,
      stats: req.showStats,
      sign: req.showSign,
      filterLabel: (req.statusFilter && req.statusFilter !== 'all') ? `(篩選: ${req.statusFilter})` : ''
    };
  }

  const content = html.evaluate().getContent();
  const blob = Utilities.newBlob(content, "text/html", "report.html");
  const safeTitle = (req.title || 'Report').replace(/[^a-z0-9\u4e00-\u9fa5]/gi, '_'); 
  const pdf = blob.getAs("application/pdf").setName(`${safeTitle}_${formatDate(new Date()).replace(/\//g,'')}.pdf`);
  
  return { 
    base64: Utilities.base64Encode(pdf.getBytes()),
    filename: pdf.getName()
  };
}

function formatDate(d) {
  if (!d) return '';
  if (d === '已完成') return d;
  const date = new Date(d);
  if (isNaN(date.getTime())) return String(d);
  return `${date.getFullYear()}/${(date.getMonth()+1).toString().padStart(2,'0')}/${date.getDate().toString().padStart(2,'0')}`;
}

// ==========================================
// ★ 帳號驗證與管理功能
// ==========================================

// 取得或建立帳號管理表
function getAccountSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("AdminAccounts");
  if (!sheet) {
    sheet = ss.insertSheet("AdminAccounts");
    // 預設標題與一組預設帳密 (admin / 1234)
    sheet.appendRow(["Username", "Password"]);
    sheet.appendRow(["admin", "1234"]);
  }
  return sheet;
}

// 驗證登入
function checkAdminLogin(username, password) {
  const sheet = getAccountSheet();
  const data = sheet.getDataRange().getValues(); // 讀取所有帳密
  
  // 從第2行開始比對 (跳過標題)
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === username && String(data[i][1]) === password) {
      return { success: true, username: username };
    }
  }
  return { success: false };
}

// 修改帳號密碼 (這裡簡化為修改當前登入者的密碼，或如果只有一組就改第一組)
// 實務上通常會把舊帳號傳進來比對，這裡做一個「修改指定帳號」的功能
function updateAdminAccount(oldUser, newUser, newPass) {
  const sheet = getAccountSheet();
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    // 找到原本的帳號 (oldUser)
    if (String(data[i][0]) === oldUser) {
      sheet.getRange(i + 1, 1).setValue(newUser); // 更新帳號
      sheet.getRange(i + 1, 2).setValue(newPass); // 更新密碼
      return { success: true };
    }
  }
  return { success: false, message: "找不到原始帳號" };
}

// ==========================================
// ★ 人員異動功能
// ==========================================

/**
 * 取得所有人員異動申請
 * @return {Array} 異動申請列表
 */
function getPersonnelChanges() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const changeSheet = ss.getSheetByName('人員異動申請');
  
  if (!changeSheet || changeSheet.getLastRow() <= 1) {
    return [];
  }
  
  const data = changeSheet.getDataRange().getValues();
  const changes = [];
  
  // 從第二列開始（跳過標題）
  for (let i = 1; i < data.length; i++) {
    changes.push({
      uuid: data[i][0],
      timestamp: data[i][1] ? Utilities.formatDate(new Date(data[i][1]), Session.getScriptTimeZone(), "yyyy/MM/dd HH:mm") : '',
      type: data[i][2],
      agcode: data[i][3],
      name: data[i][4],
      detailsJson: data[i][5],
      status: data[i][6],
      reviewer: data[i][7] || '',
      reviewTime: data[i][8] ? Utilities.formatDate(new Date(data[i][8]), Session.getScriptTimeZone(), "yyyy/MM/dd HH:mm") : '',
      note: data[i][9] || ''
    });
  }
  
  return changes;
}

/**
 * 檢查指定的 AGCODE 是否已存在於系統中
 * @param {string} agcode - 要查詢的 AGCODE
 * @return {Object} { found: boolean, person: {...} }
 */
function checkPersonExists(agcode) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const peopleSheet = ss.getSheetByName('人員名單');
  
  if (!peopleSheet) {
    return { found: false };
  }
  
  const data = peopleSheet.getDataRange().getValues();
  const cleanAgcode = cleanVal(agcode);
  
  // 從第二列開始找（第一列是標題）
  for (let i = 1; i < data.length; i++) {
    if (cleanVal(data[i][0]) === cleanAgcode) {
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

/**
 * 提交人員異動申請（新增、異動、離職）
 * @param {Object} data - 異動資料
 * @return {Object} { success: boolean, message: string }
 */
function submitPersonnelChange(data) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    return { success: false, message: '系統繁忙，請稍後再試' };
  }
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let changeSheet = ss.getSheetByName('人員異動申請');
    
    // 如果工作表不存在，建立它
    if (!changeSheet) {
      changeSheet = ss.insertSheet('人員異動申請');
      changeSheet.appendRow([
        'UUID', '申請時間', '異動類型', 'AGCODE', '姓名', 
        '詳細資料', '狀態', '審核人', '審核時間', '備註'
      ]);
      // 設定欄寬
      changeSheet.setColumnWidth(1, 100);  // UUID
      changeSheet.setColumnWidth(2, 150);  // 申請時間
      changeSheet.setColumnWidth(3, 100);  // 異動類型
      changeSheet.setColumnWidth(6, 300);  // 詳細資料
    }
    
    const uuid = Utilities.getUuid();
    const timestamp = new Date();
    
    // 類型中文化
    const typeMap = {
      'new': '新增人員',
      'transfer': '職級/單位異動',
      'resign': '離職'
    };
    
    const typeText = typeMap[data.type] || data.type;
    
    // 將詳細資料轉為 JSON
    const detailsJson = JSON.stringify(data);
    
    // 寫入申請記錄
    changeSheet.appendRow([
      uuid,
      timestamp,
      typeText,
      cleanVal(data.id),
      data.name,
      detailsJson,
      'pending',  // 狀態: pending, approved, rejected
      '',         // 審核人
      '',         // 審核時間
      ''          // 備註
    ]);
    
    writeLog('人員異動申請', `類型: ${typeText}, AGCODE: ${data.id}, 姓名: ${data.name}`);
    
    return { 
      success: true, 
      message: '申請已送出，等待管理員審核',
      uuid: uuid
    };
    
  } catch (e) {
    writeLog('人員異動錯誤', e.toString());
    return { 
      success: false, 
      message: '系統錯誤: ' + e.toString() 
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * 審核人員異動申請（管理員使用）
 * @param {string} uuid - 申請的唯一識別碼
 * @param {string} action - 'approve' 或 'reject'
 * @param {string} adminName - 審核人姓名
 * @param {string} note - 備註（選填）
 * @return {Object} { success: boolean, message: string }
 */
function approvePersonnelChange(uuid, action, adminName, note) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    return { success: false, message: '系統繁忙' };
  }
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const changeSheet = ss.getSheetByName('人員異動申請');
    const peopleSheet = ss.getSheetByName('人員名單');
    
    if (!changeSheet) {
      return { success: false, message: '找不到異動申請工作表' };
    }
    
    const data = changeSheet.getDataRange().getValues();
    
    // 找到對應的申請
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === uuid && data[i][6] === 'pending') {
        const details = JSON.parse(data[i][5]);
        
        if (action === 'approve') {
          // Normalize ID (handle both 'id' and 'agcode' keys from frontend)
          const personId = cleanVal(details.id || details.agcode);
          
          if (!personId) {
            return { success: false, message: '無法識別人員 ID' };
          }

          // 執行對應的操作
          if (details.type === 'new') {
            // 新增人員到人員名單
            peopleSheet.getRange(peopleSheet.getLastRow() + 1, 1).setNumberFormat('@');
            peopleSheet.appendRow([
              personId,
              details.name,
              details.rank,
              details.group,
              details.manager || ''
            ]);
            writeLog('人員異動-新增', `已新增: ${details.name} (${personId})`);
            
          } else if (details.type === 'transfer') {
            // 更新人員資料
            const peopleData = peopleSheet.getDataRange().getValues();
            let found = false;
            for (let j = 1; j < peopleData.length; j++) {
              if (cleanVal(peopleData[j][0]) === personId) {
                peopleSheet.getRange(j + 1, 3).setValue(details.newRank);
                peopleSheet.getRange(j + 1, 4).setValue(details.newGroup);
                writeLog('人員異動-異動', `已更新: ${details.name} (${personId}) - 職級: ${details.oldRank}→${details.newRank}, 單位: ${details.oldGroup}→${details.newGroup}`);
                found = true;
                break;
              }
            }
            if (!found) return { success: false, message: '在人員名單中找不到該 AGCODE' };
            
          } else if (details.type === 'resign') {
            // 刪除人員
            const peopleData = peopleSheet.getDataRange().getValues();
            let found = false;
            for (let j = 1; j < peopleData.length; j++) {
              if (cleanVal(peopleData[j][0]) === personId) {
                peopleSheet.deleteRow(j + 1);
                writeLog('人員異動-離職', `已刪除: ${details.name} (${personId})`);
                found = true;
                break;
              }
            }
            if (!found) return { success: false, message: '在人員名單中找不到該 AGCODE' };
          }
          
          // 更新申請狀態為已核准
          changeSheet.getRange(i + 1, 7).setValue('approved');
        } else {
          // 駁回申請
          changeSheet.getRange(i + 1, 7).setValue('rejected');
          writeLog('人員異動-駁回', `已駁回: ${details.name} (${details.id}) - 類型: ${details.type}`);
        }
        
        // 記錄審核人和時間
        changeSheet.getRange(i + 1, 8).setValue(adminName || Session.getActiveUser().getEmail());
        changeSheet.getRange(i + 1, 9).setValue(new Date());
        if (note) {
          changeSheet.getRange(i + 1, 10).setValue(note);
        }
        
        return { 
          success: true, 
          message: action === 'approve' ? '已核准並執行' : '已駁回'
        };
      }
    }
    
    return { success: false, message: '找不到該申請或申請已處理' };
    
  } catch (e) {
    writeLog('審核錯誤', e.toString());
    return { success: false, message: '系統錯誤: ' + e.toString() };
  } finally {
    lock.releaseLock();
  }
}


function ping() { return { success: true, serverTime: new Date().getTime() }; }

function handleAudit(action, ids) {
  // action: "approve" | "reject"
  // ids: Array of rowIndex (1-based index from getReportData)
  
  const lock = LockService.getScriptLock();
  try { lock.waitLock(10000); } catch(e) { return {success:false, message: "系統忙碌"}; }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const auditSheet = ss.getSheetByName('待確認放行名單');
    if (!auditSheet) return { success: false, message: "找不到待確認名單" };

    const rSheet = ss.getSheetByName('訓練紀錄');
    if (!rSheet) return { success: false, message: "找不到訓練紀錄表" };

    // 1. Sort IDs Descending to safely delete rows from bottom up
    const sortedIds = ids.map(Number).sort((a, b) => b - a);
    let successCount = 0;
    
    // 2. Process each ID
    sortedIds.forEach(rowIndex => {
       // Validate row exists (simple check)
       if (rowIndex <= 1 || rowIndex > auditSheet.getLastRow()) return;
       
       // Get Data BEFORE deleting
       // Sheet Row Index `rowIndex` matches `getValues` index? 
       // `getRange(row, col)` uses 1-based index.
       
       if (action === 'approve') {
          const rowValues = auditSheet.getRange(rowIndex, 1, 1, 8).getValues()[0];
          // Col 1: Time, 2: AGCODE, 3: Name, 4: Code, 5: Date, 6: Status, 7: Filler, 8: Method
          // Array Index: 0..7
          
          rSheet.getRange(rSheet.getLastRow() + 1, 1).setNumberFormat('@');
          rSheet.appendRow([
             cleanVal(rowValues[1]), // AGCODE
             cleanVal(rowValues[3]), // CourseCode
             rowValues[4],           // FinishDate
             rowValues[7]            // Method
          ]);
       }
       
    // 3. Delete Row
       auditSheet.deleteRow(rowIndex);
       successCount++;
    });

    return { success: true, count: successCount, msg: `已${action==='approve'?'放行':'駁回'} ${successCount} 筆資料` };

  } catch (e) {
    return { success: false, msg: "處理失敗: " + e.toString() };
  } finally {
    lock.releaseLock();
  }
}

// ==========================================
// ★ 訓練簽到系統 (Training Attendance)
// ==========================================

function getTrainingSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === '訓練活動') {
      sheet.appendRow(['ID', '標題', '開始時間', '結束時間', '經度', '緯度', '半徑', '開啟GPS限制', '建立時間', '開啟狀態']);
    } else if (name === '訓練簽到紀錄') {
      sheet.appendRow(['時間', '活動ID', '活動標題', 'AGCODE', '姓名', '單位', '緯度', '經度', '狀態']);
    } else if (name === '違規處分') {
      sheet.appendRow(['AGCODE', '原因', '處分方式', '建立時間']);
    }
  }
  return sheet;
}

function getTrainingEvents(activeOnly) {
  try {
    const sheet = getTrainingSheet('訓練活動');
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { success: true, events: [] };

    const now = new Date();
    const events = data.slice(1).map(r => ({
      id: r[0],
      title: r[1],
      startTime: r[2],
      endTime: r[3],
      location: { latitude: r[5], longitude: r[4], radius: r[6] },
      checkLocation: r[7] === true || r[7] === 'TRUE',
      createdAt: r[8],
      manualOpen: r[9] === true || r[9] === 'TRUE' || r[9] === undefined || r[9] === '' // Default to true if not set
    }));

    if (activeOnly) {
      return { 
        success: true, 
        events: events.filter(e => {
          const isTimeMatch = new Date(e.startTime) <= now && new Date(e.endTime) >= now;
          return e.manualOpen && isTimeMatch;
        }) 
      };
    }
    return { success: true, events: events.reverse() };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

function manageTrainingEvent(operation, data) {
  const lock = LockService.getScriptLock();
  try { lock.waitLock(10000); } catch (e) { return { success: false, message: '系統繁忙' }; }

  try {
    const sheet = getTrainingSheet('訓練活動');
    if (operation === 'create') {
      const id = 'TR-' + Utilities.getUuid().substring(0, 8);
      sheet.getRange(sheet.getLastRow() + 1, 1).setNumberFormat('@');
      sheet.appendRow([
        id, data.title, new Date(data.startTime), new Date(data.endTime),
        data.location.longitude, data.location.latitude, data.location.radius,
        data.checkLocation, new Date(), true // New events default to open
      ]);
      return { success: true, message: '已建立訓練活動' };
    } else if (operation === 'toggle') {
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] === data.id) {
          // Column 10 is index 9 (Status)
          sheet.getRange(i + 1, 10).setValue(data.open);
          return { success: true, message: data.open ? '已開啟活動簽到' : '已關閉活動簽到' };
        }
      }
      return { success: false, message: '找不到該活動' };
    } else if (operation === 'delete') {
      const rows = sheet.getDataRange().getValues();
      for (let i = rows.length - 1; i >= 1; i--) {
        if (rows[i][0] === data.id) {
          sheet.deleteRow(i + 1);
          return { success: true, message: '已刪除活動' };
        }
      }
      return { success: false, message: '找不到該活動' };
    }
  } catch (e) {
    return { success: false, message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

function saveTrainingCheckin(data) {
  const lock = LockService.getScriptLock();
  try { lock.waitLock(10000); } catch (e) { return { success: false, message: '系統繁忙' }; }

  try {
    const eventSheet = getTrainingSheet('訓練活動');
    const events = eventSheet.getDataRange().getValues();
    const event = events.find(e => e[0] === data.eventId);

    if (!event) return { success: false, message: '活動不存在' };

    // Check manual status
    const manualOpen = event[9] === true || event[9] === 'TRUE' || event[9] === undefined || event[9] === '';
    if (!manualOpen) return { success: false, message: '此活動簽到功能目前已關閉' };

    const now = new Date();
    if (now < new Date(event[2]) || now > new Date(event[3])) {
      return { success: false, message: '目前不在簽到時間內' };
    }

    // 檢查 GPS
    if (event[7] === true || event[7] === 'TRUE') {
      if (!data.location) return { success: false, message: '此活動需要開啟 GPS 定位才能簽到' };
      const dist = getDistance(data.location.latitude, data.location.longitude, event[5], event[4]);
      if (dist > event[6]) {
        return { success: false, message: `距離太遠！您距離中心點約 ${Math.round(dist)} 公尺，限制為 ${event[6]} 公尺` };
      }
    }

    const checkinSheet = getTrainingSheet('訓練簽到紀錄');
    const logs = checkinSheet.getDataRange().getValues();
    const already = logs.some(l => l[1] === data.eventId && cleanVal(l[3]) === cleanVal(data.agcode));
    if (already) return { success: false, message: '您已經簽到過了' };

    checkinSheet.getRange(checkinSheet.getLastRow() + 1, 4).setNumberFormat('@');
    checkinSheet.appendRow([
      now, data.eventId, event[1], data.agcode, data.name, data.department,
      data.location ? data.location.latitude : '', data.location ? data.location.longitude : '', '成功'
    ]);

    // Check for penalties
    const penaltySheet = getTrainingSheet('違規處分');
    const pData = penaltySheet.getDataRange().getValues();
    const penalty = pData.slice(1).find(r => 
      cleanVal(r[0]) === cleanVal(data.agcode) && 
      (r[6] === 'Active' || !r[6])
    );

    let penaltyInfo = null;
    if (penalty) {
      penaltyInfo = {
        reason: penalty[1],
        method: penalty[2]
      };
    }

    return { 
      success: true, 
      message: `簽到成功！內容：${event[1]}`, 
      penalty: penaltyInfo 
    };
  } catch (e) {
    return { success: false, message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

function getTrainingStats(start, end) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const checkinSheet = getTrainingSheet('訓練簽到紀錄');
    const eventSheet = getTrainingSheet('訓練活動');
    const peopleSheet = ss.getSheetByName('人員名單');
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    // 1. Get all events in range
    const allEvents = eventSheet.getDataRange().getValues().slice(1).filter(r => {
      const d = new Date(r[2]);
      return d >= startDate && d <= endDate;
    });
    const totalEventsInRange = allEvents.length;
    const eventIdsInRange = new Set(allEvents.map(r => cleanVal(r[0])));

    // 2. Get all checkins in range and for those events
    const checkins = checkinSheet.getDataRange().getValues().slice(1).filter(r => {
      const eventId = cleanVal(r[1]);
      return eventIdsInRange.has(eventId);
    });

    // 3. Get all people
    const pData = peopleSheet.getDataRange().getValues();
    const allPeopleMap = {};
    pData.slice(1).forEach(r => {
      if (r[0]) {
        const agcode = cleanVal(r[0]);
        allPeopleMap[agcode] = { 
          agcode, 
          name: r[1], 
          department: r[3], 
          count: 0, 
          details: [] 
        };
      }
    });

    // 4. Map checkins to people
    checkins.forEach(r => {
      const agcode = cleanVal(r[3]);
      if (allPeopleMap[agcode]) {
        allPeopleMap[agcode].count++;
        allPeopleMap[agcode].details.push({ 
          timestamp: r[0], 
          eventTitle: r[2] 
        });
      }
    });

    const stats = Object.values(allPeopleMap).map(s => {
      s.rate = totalEventsInRange > 0 ? Math.round((s.count / totalEventsInRange) * 100) : 0;
      return s;
    }).sort((a, b) => b.rate - a.rate);

    return { success: true, stats, totalEvents: totalEventsInRange };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

function generateTrainingStatsPDF(start, end) {
  try {
    const res = getTrainingStats(start, end);
    if (!res.success) return res;

    const stats = res.stats;
    const totalEvents = res.totalEvents;

    let rowsHtml = stats.map(s => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${s.agcode}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${s.name}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${s.department}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${s.count} / ${totalEvents}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold;">${s.rate}%</td>
      </tr>
    `).join('');

    let detailRowsHtml = stats.map(s => {
      return (s.details || []).map(d => `
        <tr>
          <td style="border: 1px solid #ddd; padding: 6px;">${s.agcode}</td>
          <td style="border: 1px solid #ddd; padding: 6px;">${s.name}</td>
          <td style="border: 1px solid #ddd; padding: 6px;">${s.department}</td>
          <td style="border: 1px solid #ddd; padding: 6px;">${d.eventTitle}</td>
          <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${d.timestamp ? Utilities.formatDate(new Date(d.timestamp), Session.getScriptTimeZone(), "yyyy/MM/dd HH:mm:ss") : ''}</td>
        </tr>
      `).join('');
    }).join('');

    const html = `
      <html>
        <body style="font-family: 'Noto Sans TC', sans-serif; padding: 20px;">
          <h2 style="text-align: center;">訓練簽到出席率統計表</h2>
          <p style="text-align: center; color: #666;">統計區間: ${start} ~ ${end} | 總計場次: ${totalEvents}</p>
          
          <h3 style="margin-top: 30px; border-left: 5px solid #000; padding-left: 10px;">1. 出席率總覽 (Summary)</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="background-color: #f2f2f2; font-size: 0.9rem;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">AGCODE</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">姓名</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">單位</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">出席次數</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">出席率</th>
              </tr>
            </thead>
            <tbody style="font-size: 0.85rem;">
              ${rowsHtml}
            </tbody>
          </table>

          <h3 style="margin-top: 50px; border-left: 5px solid #000; padding-left: 10px;">2. 簽到明細錄 (Sign-in Details)</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="background-color: #f2f2f2; font-size: 0.9rem;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">AGCODE</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">姓名</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">單位</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">活動名稱</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">簽到時間</th>
              </tr>
            </thead>
            <tbody style="font-size: 0.8rem;">
              ${detailRowsHtml || '<tr><td colspan="5" style="text-align:center; padding:20px;">無明細紀錄</td></tr>'}
            </tbody>
          </table>
          <p style="text-align: right; margin-top: 30px; font-size: 0.8rem; color: #888;">製表日期: ${new Date().toLocaleString()}</p>
        </body>
      </html>
    `;

    const blob = Utilities.newBlob(html, 'text/html', 'report.html');
    const pdf = blob.getAs('application/pdf').setName(`Training_Attendance_${start}_${end}.pdf`);
    return { 
      success: true, 
      pdfData: Utilities.base64Encode(pdf.getBytes()),
      fileName: pdf.getName()
    };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const p1 = lat1 * Math.PI / 180;
  const p2 = lat2 * Math.PI / 180;
  const dp = (lat2 - lat1) * Math.PI / 180;
  const dl = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(dp / 2) * Math.sin(dp / 2) +
    Math.cos(p1) * Math.cos(p2) *
    Math.sin(dl / 2) * Math.sin(dl / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function getPenalties() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getTrainingSheet('違規處分');
    const rows = sheet.getDataRange().getValues();
    
    // Get People Map for names
    const peopleSheet = ss.getSheetByName('人員名單');
    const pRows = peopleSheet.getDataRange().getValues();
    const nameMap = {};
    for (let i = 1; i < pRows.length; i++) {
       nameMap[cleanVal(pRows[i][0])] = pRows[i][1];
    }
    
    const data = [];
    for (let i = 1; i < rows.length; i++) {
      const agcode = cleanVal(rows[i][0]);
      data.push({
        agcode: agcode,
        name: nameMap[agcode] || '未知人員',
        reason: rows[i][1],
        method: rows[i][2],
        createdAt: rows[i][3] instanceof Date ? rows[i][3].getTime() : rows[i][3],
        date: rows[i][4],
        category: rows[i][5],
        status: rows[i][6] || 'Active',
        opAgcode: rows[i][7],
        opName: rows[i][8],
        opRank: rows[i][9],
        opDate: rows[i][10]
      });
    }
    return { success: true, penalties: data };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

function managePenalty(operation, data) {
  const lock = LockService.getScriptLock();
  try { lock.waitLock(10000); } catch (e) { return { success: false, message: '系統繁忙' }; }
  try {
    const sheet = getTrainingSheet('違規處分');
    if (operation === 'create') {
      const row = [
        data.agcode,
        data.reason,
        data.method,
        new Date(), // System Record Time
        data.date || '', // Violation Date
        data.category || '其它', // Category
        'Active' // [NEW] Status
      ];
      sheet.getRange(sheet.getLastRow() + 1, 1).setNumberFormat('@');
      sheet.appendRow(row);
      return { success: true, message: '已發布正式處分命令' };
    } else if (operation === 'delete') {
      // "撤銷" operation - remove from record with audit info
      const rows = sheet.getDataRange().getValues();
      const agcode = cleanVal(data.agcode);
      const createdAt = data.createdAt;
      
      for (let i = rows.length - 1; i >= 1; i--) {
        const rowAgcode = cleanVal(rows[i][0]);
        const rowTs = rows[i][3] instanceof Date ? rows[i][3].getTime() : rows[i][3];
        
        if (rowAgcode === agcode && (!createdAt || rowTs == createdAt)) {
           // We keep the row but change status and add operator info instead of deleting?
           // Actually user says "撤銷處罰按鈕", usually this means logically deleted but we might want to keep the audit.
           // For now, let's mark it as 'Revoked' to keep the record/audit.
           sheet.getRange(i + 1, 7, 1, 5).setValues([[
             'Revoked', 
             data.opAgcode || '', 
             data.opName || '', 
             data.opRank || '', 
             new Date()
           ]]);
           return { success: true, message: '處分命令已撤銷' };
        }
      }
      return { success: false, message: '找不到相關紀錄' };
    } else if (operation === 'complete') {
      // "完成" operation - mark as Completed with audit info
      const rows = sheet.getDataRange().getValues();
      const agcode = cleanVal(data.agcode);
      const createdAt = data.createdAt;
      
      for (let i = rows.length - 1; i >= 1; i--) {
        const rowAgcode = cleanVal(rows[i][0]);
        const rowTs = rows[i][3] instanceof Date ? rows[i][3].getTime() : rows[i][3];
        
        if (rowAgcode === agcode && (!createdAt || rowTs == createdAt)) {
           sheet.getRange(i + 1, 7, 1, 5).setValues([[
             'Completed', 
             data.opAgcode || '', 
             data.opName || '', 
             data.opRank || '', 
             new Date()
           ]]);
           return { success: true, message: '處分已標記為完成' };
        }
      }
      return { success: false, message: '找不到相關紀錄' };
    }
  } catch (e) {
    return { success: false, message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

function getLiveAttendance(eventId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const eventSheet = getTrainingSheet('訓練活動');
    const checkinSheet = getTrainingSheet('訓練簽到紀錄');
    const peopleSheet = ss.getSheetByName('人員名單');
    
    // 1. Get Event Details
    const eventData = eventSheet.getDataRange().getValues();
    let event = null;
    for (let i = 1; i < eventData.length; i++) {
      if (cleanVal(eventData[i][0]) === cleanVal(eventId)) {
        event = {
          id: eventData[i][0],
          title: eventData[i][1],
          start: eventData[i][2],
          end: eventData[i][3]
        };
        break;
      }
    }
    if (!event) return { success: false, message: '找不到該活動' };

    // 2. Get All Personnel
    const pData = peopleSheet.getDataRange().getValues();
    const allPeople = pData.slice(1).filter(r => r[0]).map(r => ({
      agcode: cleanVal(r[0]),
      name: r[1],
      dept: r[3]
    }));

    // 3. Get Checked-in Personnel for this event
    const cData = checkinSheet.getDataRange().getValues();
    const checkedInMap = {};
    const checkedInList = [];
    cData.slice(1).forEach(r => {
      if (cleanVal(r[1]) === cleanVal(eventId)) {
        const agcode = cleanVal(r[3]);
        checkedInMap[agcode] = {
          name: r[4],
          time: r[0] instanceof Date ? Utilities.formatDate(r[0], Session.getScriptTimeZone(), "HH:mm:ss") : r[0]
        };
        checkedInList.push({
          agcode: agcode,
          name: r[4],
          dept: r[5],
          time: checkedInMap[agcode].time
        });
      }
    });

    // 4. Calculate Missing
    const missingList = allPeople.filter(p => !checkedInMap[p.agcode]);

    return {
      success: true,
      event: event,
      stats: {
        total: allPeople.length,
        checkedIn: checkedInList.length,
        missing: missingList.length
      },
      checkedInList: checkedInList,
      missingList: missingList
    };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

// ==========================================
// ★ 積分與榮譽系統 (Points & Honor)
// ==========================================

function getPointsStatus(empId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Get User Details
  const pSheet = ss.getSheetByName('人員名單');
  const pData = pSheet.getDataRange().getValues();
  const cleanId = cleanVal(empId);
  let userName = '未知人員';
  let userGroup = '未知單位';
  
  if (pData.length > 1) {
    const row = pData.slice(1).find(r => cleanVal(r[0]) === cleanId);
    if (row) {
      userName = row[1];
      userGroup = row[3];
    }
  }

  // 2. Get Points
  let s = ss.getSheetByName('積分紀錄');
  if(!s) {
    s = ss.insertSheet('積分紀錄');
    s.appendRow(['時間', 'AGCODE', '積分變動', '原因']);
  }
  
  const data = s.getDataRange().getValues();
  let total = 0;
  const history = [];
  
  if (data.length > 1) {
    data.slice(1).forEach(r => {
      if (cleanVal(r[1]) === cleanId) {
        const pts = parseFloat(r[2]) || 0;
        total += pts;
        history.push({
          time: Utilities.formatDate(new Date(r[0]), Session.getScriptTimeZone(), "MM/dd HH:mm"),
          points: pts,
          reason: r[3]
        });
      }
    });
  }
  
  return { success: true, total, name: userName, group: userGroup, agcode: cleanId, history: history.reverse().slice(0, 10) };
}

function addPoints(empId, points, reason) {
  const lock = LockService.getScriptLock();
  try { lock.waitLock(10000); } catch(e) { return {success:false, message: '系統忙碌'}; }
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let s = ss.getSheetByName('積分紀錄');
    if(!s) {
      s = ss.insertSheet('積分紀錄');
      s.appendRow(['時間', 'AGCODE', '積分變動', '原因']);
    }
    
    s.appendRow([new Date(), cleanVal(empId), points, reason]);
    writeLog('積分變動', `ID=[${empId}], 點數=[${points}], 原因=[${reason}]`);
    return { success: true, newPoints: points };
  } catch(e) {
    return { success: false, message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

function getLeaderboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const pSheet = ss.getSheetByName('人員名單');
  const ptsSheet = ss.getSheetByName('積分紀錄');
  
  if (!pSheet) return { success: false, message: '查無人員名單' };
  
  const people = pSheet.getDataRange().getValues().slice(1).map(r => ({
    id: cleanVal(r[0]),
    name: r[1],
    group: r[3]
  }));
  
  const pointsMap = {};
  if (ptsSheet) {
    const ptsData = ptsSheet.getDataRange().getValues().slice(1);
    ptsData.forEach(r => {
      const id = cleanVal(r[1]);
      pointsMap[id] = (pointsMap[id] || 0) + (parseFloat(r[2]) || 0);
    });
  }
  
  const leaderboard = people.map(p => ({
    ...p,
    points: pointsMap[p.id] || 0
  })).sort((a, b) => b.points - a.points).filter(p => p.points > 0).slice(0, 20);
  
  return { success: true, leaderboard };
}

// ==========================================
// ★ A&H 工作坊 後端邏輯
// ==========================================

/**
 * 儲存工作坊狀態 (PropertiesService 適合這種頻繁讀取的緩存資料)
 * data: { active, startTime, limit, teams, members }
 */
function setWorkshopState(data) {
  const props = PropertiesService.getScriptProperties();
  if (!data) {
    props.deleteProperty('WORKSHOP_ACTIVE_STATE');
    // 清除本次上傳紀錄
    const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('工作坊繳交紀錄');
    if (s) s.clearContents().appendRow(['時間', '隊伍', '檔案內容']);
    return { success: true, message: '工作坊已重置' };
  }
  props.setProperty('WORKSHOP_ACTIVE_STATE', JSON.stringify(data));
  return { success: true };
}

function getWorkshopState() {
  const props = PropertiesService.getScriptProperties();
  const raw = props.getProperty('WORKSHOP_ACTIVE_STATE');
  return { success: true, state: raw ? JSON.parse(raw) : null };
}

/**
 * 學員繳交檔案
 * upload: { team, data }
 */
function submitWorkshopUpload(upload) {
  const lock = LockService.getScriptLock();
  try { lock.waitLock(10000); } catch(e) { return { success: false, message: '伺服器忙碌' }; }
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let s = ss.getSheetByName('工作坊繳交紀錄');
    if (!s) {
      s = ss.insertSheet('工作坊繳交紀錄');
      s.appendRow(['時間', '隊伍', '檔案內容']);
    }
    
    // 檢查該隊伍是否已繳交
    const data = s.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === upload.team) return { success: false, message: '該隊伍已經繳交過囉！' };
    }
    
    s.appendRow([new Date(), upload.team, upload.data]);
    return { success: true };
  } catch(e) {
    return { success: false, message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

function getWorkshopUploads() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const s = ss.getSheetByName('工作坊繳交紀錄');
  if (!s) return { success: true, uploads: [] };
  
  const data = s.getDataRange().getValues().slice(1);
  const uploads = data.map(r => ({ timestamp: r[0], team: r[1], data: r[2] }));
  return { success: true, uploads };
}

function deleteWorkshopUpload(team) {
  const lock = LockService.getScriptLock();
  try { lock.waitLock(10000); } catch(e) { return { success: false, message: '伺服器忙碌' }; }
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let s = ss.getSheetByName('工作坊繳交紀錄');
    if (!s) return { success: true };
    
    const data = s.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === team) {
        s.deleteRow(i + 1);
        return { success: true, message: '已刪除繳交紀錄' };
      }
    }
    return { success: true };
  } catch(e) {
    return { success: false, message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}


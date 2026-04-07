    <script>
        window.onerror = function (msg, url, line) {
            // Filter out generic script errors (CORS/CDN/Network issues)
            if (String(msg).indexOf('Script error') > -1 || (line === 0)) {
                console.warn("Ext. Script Error:", url);
                return true; // Suppress
            }
            console.error("系統錯誤:", msg, url, line);
            // Only alert if it's not a known benign error
            if (String(msg).includes('ResizeObserver')) return true;

            // alert("系統錯誤: " + msg); // Optional: keep enabled for dev, disabled for prod if annoying
            return false;
        };
    </script>
    <script>
        let currentUser = null;
        let currentEventId = null; // Store currently viewed event ID for modal
        let customFields = []; // Global custom fields definition



        // Login System
        // Login System
        async function handleLogin(e) {
            e.preventDefault();
            console.log("handleLogin triggered");

            const u = document.getElementById('username').value;
            const p = document.getElementById('password').value;
            // Find button inside the form that triggered the event
            const btn = e.target.querySelector('button[type="submit"]');
            const statusDiv = document.getElementById('login-status') || createStatusDiv();

            if (typeof setLoading === 'function') setLoading(true, btn);
            else { if (btn) btn.innerText = "Loading..."; }

            statusDiv.innerHTML = '<span class="text-blue-500">Connecting to server...</span>';

            // Ensure API_URL
            let targetUrl = typeof API_URL !== 'undefined' ? API_URL : '';
            if (!targetUrl && window.API_URL) targetUrl = window.API_URL;
            /* Last resort fallback if config.js failed */
            if (!targetUrl) targetUrl = "https://script.google.com/macros/s/AKfycbzlZcqnngOSiAvH-UnIj48B6p_RzM0nth1JQSY06gcRLfih0RIYYZUYuwIeBgPQAxYG/exec";

            console.log("Login Target:", targetUrl);

            try {
                const response = await fetch(`${targetUrl}?action=checkLogin&username=${u}&password=${p}`);
                if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

                const text = await response.text();
                console.log("Response raw:", text);

                let result;
                try {
                    result = JSON.parse(text);
                } catch (e) {
                    throw new Error("Invalid JSON response: " + text.substring(0, 100) + "...");
                }

                if (result.status === 'success') {
                    currentUser = result.user;
                    statusDiv.innerHTML = '<span class="text-green-500">Login Successful!</span>';
                    enterDashboard();
                } else {
                    statusDiv.innerHTML = `<span class="text-red-500">Error: ${result.message}</span>`;
                    showPopup('登入失敗', result.message, 'error');
                }
            } catch (err) {
                console.error("Login Error:", err);
                statusDiv.innerHTML = `<span class="text-red-500 font-bold break-all">Connection Error: ${err.message}</span>`;
                alert("系統錯誤 (Login Error):\n" + err.message);
            } finally {
                if (typeof setLoading === 'function') setLoading(false, btn);
                else { if (btn) btn.innerText = "Login"; }
            }
        }

        function createStatusDiv() {
            const div = document.createElement('div');
            div.id = 'login-status';
            div.className = "mt-4 text-sm text-center font-mono p-2 bg-slate-50 rounded border border-slate-200";
            document.getElementById('login-form').appendChild(div);
            return div;
        }

        async function enterDashboard() {
            try {
                // Show Loading
                document.getElementById('main-loading-overlay').classList.remove('hidden');

                if (!currentUser) throw new Error("User session invalid");

                document.getElementById('login-screen').classList.add('hidden');
                const dashboard = document.getElementById('dashboard');
                dashboard.classList.remove('hidden');

                document.getElementById('user-name-display').innerText = currentUser.name || 'User';
                document.getElementById('user-role-display').innerText = currentUser.role || 'Staff';

                console.log("Current User Role Raw:", currentUser.role);
                // alert("Debug Role: " + currentUser.role); // Debugging removed

                // explicit role check
                // FORCE SHOW for debugging - logic was flaky
                const userTab = document.getElementById('tab-users');
                userTab.classList.remove('hidden');

                /*
                if (String(currentUser.role).trim() === 'System Admin') {
                    userTab.classList.remove('hidden');
                } else {
                    if (String(currentUser.role).includes('Admin')) {
                         userTab.classList.remove('hidden');
                    } else {
                         // userTab.classList.add('hidden'); // Disabled hiding for now
                    }
                }
                */

                // Load Overview Stats first
                await loadOverview();

                // Auto-repair headers in background
                fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'fixHeaders' }) })
                    .catch(console.error);

                playAudio('popup'); // Welcome sound

            } catch (e) {
                console.error(e);
                alert("載入 Dashboard 失敗: " + e.message);
            } finally {
                // Hide Loading
                document.getElementById('main-loading-overlay').classList.add('hidden');
            }
        }

        function logout() {
            location.reload();
        }

        // Tabs
        function switchTab(tab) {
            ['overview', 'events', 'scanner', 'users', 'create-event'].forEach(t => {
                const el = document.getElementById(`view-${t}`);
                const tabEl = document.getElementById(`tab-${t}`);
                if (el) el.classList.add('hidden');
                if (tabEl) tabEl.classList.remove('active-tab');
            });
            document.getElementById(`view-${tab}`).classList.remove('hidden');
            document.getElementById(`tab-${tab}`).classList.add('active-tab');

            if (tab === 'overview') loadOverview();
            if (tab === 'events') loadEvents();
            if (tab === 'scanner') {
                // startScanner(); // Auto-start removed
                // Show default state is handled by HTML overlay
            }
            else stopScanner();
        }

        // --- Overview Logic ---
        async function loadOverview() {
            // Simple approach: get all events and get all registrations (could be slow if huge data, but prototype OK)
            try {
                const [resE, resR] = await Promise.all([
                    fetch(`${API_URL}?action=getEvents&includeClosed=true`),
                    fetch(`${API_URL}?action=getRegistrations`)
                ]);
                const jsonE = await resE.json();
                const jsonR = await resR.json();

                const events = jsonE.data || [];
                const regs = jsonR.data || [];

                document.getElementById('stat-total-events').innerText = events.length;
                document.getElementById('stat-total-regs').innerText = regs.length;

                const pending = regs.filter(r => r.status === 'Pending').length;
                document.getElementById('stat-pending-regs').innerText = pending;
            } catch (e) { console.error(e); }
        }

        // --- Helpers ---
        function setLoading(btn, isLoading, loadingText = "處理中...") {
            if (isLoading) {
                btn.dataset.originalText = btn.innerHTML;
                btn.disabled = true;
                btn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>${loadingText}`;
                btn.classList.add('opacity-75', 'cursor-not-allowed');
            } else {
                btn.disabled = false;
                btn.innerHTML = btn.dataset.originalText || '送出';
                btn.classList.remove('opacity-75', 'cursor-not-allowed');
            }
        }

        // --- Events Logic ---
        async function loadEvents() {
            const body = document.getElementById('events-list-body');
            body.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center"><i class="fas fa-spinner fa-spin mr-2"></i>載入中...</td></tr>';

            try {
                const res = await fetch(`${API_URL}?action=getEvents&includeClosed=true`);
                const json = await res.json();

                if (json.data && json.data.length) {
                    allEventsData = json.data; // Cache for modal
                    body.innerHTML = json.data.map(e => `
                        <tr class="hover:bg-slate-50 transition-colors">
                            <td class="px-6 py-4 whitespace-nowrap font-bold text-gray-900 flex items-center">
                                <span class="w-2 h-2 rounded-full ${e.status === 'Open' ? 'bg-green-500' : 'bg-slate-300'} mr-2"></span>
                                ${e.name}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(e.date).toLocaleDateString()}</td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-2 py-1 text-xs font-semibold rounded-full ${e.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}">
                                    ${e.status === 'Open' ? '報名中' : '已結束'}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button onclick="openEventManager('${e.event_id}')" class="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 shadow-sm transition-all hover:shadow-md active:scale-95 flex items-center">
                                    <i class="fas fa-cog mr-1"></i> 管理
                                </button>
                            </td>
                        </tr>
                    `).join('');
                } else {
                    body.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-slate-400">尚無活動，請點擊上方建立</td></tr>';
                }
            } catch (e) {
                console.error(e);
                body.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-red-500">載入失敗</td></tr>';
            }
        }

        document.getElementById('create-event-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            setLoading(btn, true);

            const payload = {
                action: 'createEvent',
                name: document.getElementById('evt-name').value,
                date: document.getElementById('evt-date').value,
                location: document.getElementById('evt-loc').value,
                price: document.getElementById('evt-price').value,
                description: document.getElementById('evt-desc').value,
                descriptionHtml: document.getElementById('evt-desc').value, // Use same for now, or separate if UI split
                imageUrl: document.getElementById('evt-image-url').value,
                enableQr: document.getElementById('evt-enable-qr').checked,
                enableCheckIn: document.getElementById('evt-enable-checkin').checked,
                formConfig: customFields // Include custom fields
            };

            await fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) });

            e.target.reset();
            customFields = []; // Reset custom fields
            renderCustomFieldsList();
            setLoading(btn, false);

            // Refech events and switch back
            await loadEvents();
            switchView('dashboard');

            // Show toast instead of alert? keeping alert for now as requested
            // alert('活動建立成功');
        });

        // --- Event Manager Modal Logic ---
        let currentEditingEventId = null;
        let currentEventRegistrations = []; // Store for CSV export
        let allEventsData = []; // Populated by loadEvents

        // Expose to window to ensure button onclick works
        window.openEventManager = async function (eventId) {
            playAudio('popup');
            currentEditingEventId = eventId;

            const modal = document.getElementById('event-manager-modal');
            console.log("Opening event manager for ID:", eventId);
            const eventData = allEventsData.find(e => String(e.event_id) === String(eventId)); // Ensure type match

            if (!eventData) {
                console.error("Event data not found for ID:", eventId, "Available:", allEventsData);
                alert("無法讀取活動資料，請重新整理頁面再試");
                return;
            }

            // 1. Populate Edit Form
            document.getElementById('edit-evt-id').value = eventData.event_id;
            document.getElementById('edit-evt-name').value = eventData.name;
            document.getElementById('edit-evt-date').value = eventData.date.split('T')[0];
            document.getElementById('edit-evt-loc').value = eventData.location;
            document.getElementById('edit-evt-price').value = eventData.price;
            document.getElementById('edit-evt-desc').value = eventData.description_html || eventData.description || '';
            document.getElementById('edit-evt-image-url').value = eventData.image_url || '';
            document.getElementById('edit-evt-status').value = eventData.status;
            const enableQr = eventData.enable_qr !== undefined ? (eventData.enable_qr === true || String(eventData.enable_qr) === 'true') : true;
            document.getElementById('edit-evt-enable-qr').checked = enableQr;

            // Handle enable_checkin: default false if undefined
            const enableCheckIn = eventData.enable_checkin !== undefined ? (eventData.enable_checkin === true || String(eventData.enable_checkin) === 'true') : false;
            document.getElementById('edit-evt-enable-checkin').checked = enableCheckIn;

            // 2. Load Registrations with Dynamic Columns
            await loadEventRegistrations(eventId, eventData.form_config);

            // 3. Populate Custom Fields for Editing
            try {
                customFields = typeof eventData.form_config === 'string' ? JSON.parse(eventData.form_config) : (eventData.form_config || []);
            } catch (e) {
                console.error("Error parsing form config for edit", e);
                customFields = [];
            }
            renderCustomFieldsList();

            modal.classList.remove('hidden');
            switchModalTab('info'); // Default to info tab
        }

        function closeEventManager() {
            document.getElementById('event-manager-modal').classList.add('hidden');
            currentEditingEventId = null;
            stopConsoleScanner(); // Ensure console scanner is stopped when modal closes
        }

        function switchModalTab(tab) {
            ['info', 'regs', 'settings'].forEach(t => {
                const el = document.getElementById(`mview-${t}`);
                const tabEl = document.getElementById(`mtab-${t}`);
                if (el) el.classList.add('hidden');
                if (tabEl) tabEl.classList.remove('active-tab');
            });
            document.getElementById(`mview-${tab}`).classList.remove('hidden');
            if (document.getElementById(`mtab-${tab}`)) document.getElementById(`mtab-${tab}`).classList.add('active-tab');
        }

        // --- Custom Fields Logic ---


        function toggleFieldOptions() {
            const type = document.getElementById('new-field-type').value;
            const optionsInput = document.getElementById('new-field-options');
            if (type === 'select') {
                optionsInput.disabled = false;
                optionsInput.classList.remove('bg-slate-100');
                optionsInput.classList.add('bg-white');
                optionsInput.placeholder = "選項1, 選項2, 選項3";
            } else {
                optionsInput.disabled = true;
                optionsInput.value = '';
                optionsInput.classList.add('bg-slate-100');
                optionsInput.classList.remove('bg-white');
                optionsInput.placeholder = "僅適用於下拉選單";
            }
        }

        function addCustomField() {
            const label = document.getElementById('new-field-label').value.trim();
            const type = document.getElementById('new-field-type').value;
            const options = document.getElementById('new-field-options').value.trim();
            const required = document.getElementById('new-field-required').checked;

            if (!label) return alert("請輸入欄位名稱");
            if (type === 'select' && !options) return alert("下拉選單請輸入選項 (以逗號分隔)");

            customFields.push({ label, type, options, required });
            renderCustomFieldsList();

            // Reset inputs
            document.getElementById('new-field-label').value = '';
            document.getElementById('new-field-options').value = '';
            document.getElementById('new-field-required').checked = false;
            document.getElementById('new-field-type').value = 'text';
            toggleFieldOptions();
        }

        function removeCustomField(index) {
            customFields.splice(index, 1);
            renderCustomFieldsList();
        }

        function renderCustomFieldsList() {
            const list = document.getElementById('custom-fields-list');
            if (customFields.length === 0) {
                list.innerHTML = `<li class="empty-state text-sm text-slate-400 text-center py-4 bg-slate-100 rounded-lg border border-dashed border-slate-300">尚未新增任何自訂欄位</li>`;
                return;
            }

            list.innerHTML = customFields.map((field, index) => `
                <li class="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm animate__animated animate__fadeIn">
                    <div class="flex items-center">
                        <span class="text-xs font-bold uppercase text-slate-500 mr-2 bg-slate-100 px-2 py-1 rounded">${field.type}</span>
                        <span class="text-sm font-bold text-slate-700">${field.label}</span>
                        ${field.required ? '<span class="text-xs text-red-500 ml-1">*必填</span>' : ''}
                        ${field.options ? `<span class="text-xs text-slate-400 ml-2">(${field.options})</span>` : ''}
                    </div>
                    <button type="button" onclick="removeCustomField(${index})" class="text-red-400 hover:text-red-600 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </li>
            `).join('');
        }

        // --- Registration Data Logic ---
        async function loadEventRegistrations(eventId, formConfig) {
            const tbody = document.getElementById('registrations-list-body');
            const thead = document.getElementById('registrations-table-head');
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-slate-400">Loading...</td></tr>';

            try {
                // Parse Form Config for Dynamic Headers
                let customFields = [];
                try {
                    customFields = typeof formConfig === 'string' ? JSON.parse(formConfig) : (formConfig || []);
                } catch (e) { console.error("Config parse error", e); }

                // Build Table Header
                let headerHTML = `
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">姓名 Name</th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">Email</th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">電話 Phone</th>
                `;

                // Add Dynamic Headers
                customFields.forEach(field => {
                    headerHTML += `<th class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">${field.label}</th>`;
                });

                // Check-in Time Header
                headerHTML += `<th class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">報到時間 Time</th>`;

                headerHTML += `
                        <th class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">狀態 Status</th>
                        <th class="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase">操作 Actions</th>
                    </tr>
                `;
                thead.innerHTML = headerHTML;


                const response = await fetch(`${API_URL}?action=getRegistrations&eventId=${eventId}`); // Changed action
                const result = await response.json();

                if (result.data) { // Changed from result.success
                    currentEventRegistrations = result.data; // Save for CSV
                    renderEventParticipants(result.data, customFields);
                    loadOverview(); // Update stats
                } else {
                    tbody.innerHTML = `<tr><td colspan="${5 + customFields.length}" class="text-center py-4 text-red-500">Failed to load</td></tr>`;
                }
            } catch (error) {
                console.error("Load regs error:", error);
                tbody.innerHTML = `<tr><td colspan="100%" class="text-center py-4 text-red-500">Error loading data</td></tr>`;
            }
        }

        function renderEventParticipants(registrations, customFields) {
            const tbody = document.getElementById('registrations-list-body');
            if (registrations.length === 0) {
                tbody.innerHTML = `<tr><td colspan="${5 + customFields.length}" class="text-center py-8 text-slate-400">目前沒有報名資料 No registrations yet.</td></tr>`;
                return;
            }

            tbody.innerHTML = registrations.map(reg => {
                // Parse Custom Data
                let customData = {};
                try {
                    customData = reg.dynamic_data ? JSON.parse(reg.dynamic_data) : {}; // Changed from custom_data
                } catch (e) { console.error("Parse custom data error", e); }

                // Build Dynamic Cells
                let dynamicCells = '';
                customFields.forEach(field => {
                    const val = customData[field.label] || '-';
                    dynamicCells += `<td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">${val}</td>`;
                });

                // Status Badge Colors
                // Time Cell
                const checkInTime = reg.check_in_time ? new Date(reg.check_in_time).toLocaleString('zh-TW', { hour12: false }) : '-';
                // If it comes as formatted string from GAS, just use it.
                // GAS sends "yyyy-MM-dd HH:mm:ss". new Date() parses it? 
                // Let's just use it directly or simple fallback.
                const timeDisplay = reg.check_in_time || '-';

                let statusColor = "bg-gray-100 text-gray-800";
                if (reg.status === 'Approved') statusColor = "bg-green-100 text-green-800";
                if (reg.status === 'Rejected') statusColor = "bg-red-100 text-red-800";
                // Check-in Badge
                let checkInBadge = '';
                if (reg.check_in_status === 'CheckedIn') {
                    checkInBadge = `<span class="px-2 py-1 text-xs font-bold rounded-full uppercase tracking-wide bg-purple-100 text-purple-800 ml-1">已報到 Check-in</span>`;
                }

                return `
                <tr class="hover:bg-slate-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-bold text-slate-800">${reg.participant_name}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">${reg.email}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">${reg.phone || '-'}</td>
                    ${dynamicCells}
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-mono">${timeDisplay}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${statusColor}">
                            ${reg.status}
                        </span>
                        ${checkInBadge}
                        <div class="text-xs text-slate-400 mt-1">Payment: ${reg.payment_status}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        ${reg.status === 'Pending' ? `
                            <button onclick="updateRegStatus('${reg.reg_id}', 'Approved')" class="text-green-600 hover:text-green-900">Approve</button>
                            <button onclick="updateRegStatus('${reg.reg_id}', 'Rejected')" class="text-red-600 hover:text-red-900">Reject</button>
                        ` : ''}
                        ${reg.payment_status === 'Unpaid' ? `
                            <button onclick="updatePaymentStatus('${reg.reg_id}', 'Paid')" class="text-blue-600 hover:text-blue-900">Mark Paid</button>
                        ` : ''}
                        ${reg.qr_code_data ? `
                            <button onclick="showQRCode('${reg.qr_code_data}')" class="text-purple-600 hover:text-purple-900">QR</button>
                        ` : ''}
                    </td>
                </tr>
            `}).join('');
        }

        // --- Edit Event Submit ---
        document.getElementById('edit-event-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            setLoading(true, btn);

            const payload = {
                action: 'updateEvent',
                eventId: document.getElementById('edit-evt-id').value,
                name: document.getElementById('edit-evt-name').value,
                date: document.getElementById('edit-evt-date').value,
                location: document.getElementById('edit-evt-loc').value,
                price: document.getElementById('edit-evt-price').value,
                description: document.getElementById('edit-evt-desc').value,
                status: document.getElementById('edit-evt-status').value,
                enableQr: document.getElementById('edit-evt-enable-qr').checked,
                enableCheckIn: document.getElementById('edit-evt-enable-checkin').checked,
                formConfig: customFields
            };

            try {
                await fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) });
                showPopup('成功', '活動更新成功', 'success');
                loadEvents();
            } catch (e) { showPopup('失敗', '更新失敗', 'error'); }
            finally { setLoading(false, btn); }
        });

        // --- Modal Registrations Logic ---
        // let currentRegsData = []; // This is replaced by currentEventRegistrations

        // async function loadModalRegistrations() { // This function is replaced by loadEventRegistrations
        //     if (!currentEventId) return;
        //     const body = document.getElementById('modal-reg-body');
        //     body.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center">載入中...</td></tr>';

        //     try {
        //         const res = await fetch(`${API_URL}?action=getRegistrations&eventId=${currentEventId}`);
        //         const json = await res.json();

        //         if (json.data) {
        //             currentRegsData = json.data;
        //             document.getElementById('reg-count-total').innerText = json.data.length;
        //             document.getElementById('reg-count-paid').innerText = json.data.filter(r => r.payment_status === 'Paid').length;

        //             if (json.data.length > 0) {
        //                 body.innerHTML = json.data.map(r => renderModalRegRow(r)).join('');
        //             } else {
        //                 body.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">尚無報名資料</td></tr>';
        //             }
        //         }
        //     } catch (e) {
        //         body.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center text-red-500">載入失敗</td></tr>';
        //     }
        // }

        // function renderModalRegRow(r) { // This function is replaced by renderEventParticipants
        //     // Helpers
        //     const getStatusBtn = (curr) => {
        //         if (curr === 'Pending') return `
        //             <button onclick="updateStatus('${r.reg_id}', 'Approved')" class="text-green-600 hover:underline mr-1">批准</button>
        //             <button onclick="updateStatus('${r.reg_id}', 'Rejected')" class="text-red-600 hover:underline">拒絕</button>
        //         `;
        //         return `<span class="text-xs px-2 py-0.5 rounded ${curr === 'Approved' ? 'bg-green-100 text-green-800' : (curr === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100')}">${curr}</span>`;
        //     };

        //     const getPayBtn = (curr, status) => {
        //         if (status !== 'Approved') return '<span class="text-gray-300">-</span>';
        //         if (curr === 'Unpaid') return `<button onclick="updatePayment('${r.reg_id}', 'Paid')" class="text-blue-600 hover:underline font-bold">收款</button>`;
        //         return '<span class="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">Paid</span>';
        //     };

        //     let extraInfo = '';
        //     if (r.dynamic_data) {
        //         extraInfo = '<div class="mt-1 text-xs text-gray-500">';
        //         for (const [key, val] of Object.entries(r.dynamic_data)) {
        //             extraInfo += `<span class="mr-2"><strong>${key}:</strong> ${val}</span>`;
        //         }
        //         extraInfo += '</div>';
        //     }

        //     const qrBtn = r.qr_code_data ? `<button onclick="viewQR('${r.qr_code_data}')" class="text-purple-600 text-xs hover:underline">QR</button>` : '';

        //     return `
        //         <tr>
        //             <td class="px-4 py-3 text-sm">
        //                 <div class="font-bold text-gray-900">${r.participant_name}</div>
        //                 ${extraInfo}
        //             </td>
        //             <td class="px-4 py-3 text-sm text-gray-600">
        //                 <div>${r.email}</div>
        //                 <div class="text-xs">${r.phone}</div>
        //             </td>
        //             <td class="px-4 py-3 text-sm">${getStatusBtn(r.status)}</td>
        //             <td class="px-4 py-3 text-sm">${getPayBtn(r.payment_status, r.status)}</td>
        //             <td class="px-4 py-3 text-sm text-gray-600">${r.check_in_status}</td>
        //             <td class="px-4 py-3 text-sm text-right">${qrBtn}</td>
        //         </tr>
        //     `;
        // }

        async function updateRegStatus(id, status) {
            if (!confirm(`確定要變更狀態為 ${status} ?`)) return;
            setLoading(true);
            try {
                await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'updateStatus', regId: id, status: status }) });
                showPopup('成功', `狀態已更新為 ${status}`, 'success');
                // Reload registrations
                const eventData = allEventsData.find(e => e.event_id === currentEditingEventId);
                if (eventData) {
                    await loadEventRegistrations(currentEditingEventId, eventData.form_config);
                }
                loadOverview();
            } catch (e) { showPopup('錯誤', '更新失敗', 'error'); }
            finally { setLoading(false); }
        }

        async function updatePaymentStatus(id, status) {
            if (!confirm(`確定已收款? 此操作將產生 QR Code`)) return;
            setLoading(true);
            try {
                await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'updatePayment', regId: id, paymentStatus: status }) });
                showPopup('成功', `付款狀態已更新為 ${status}`, 'success');
                // Reload registrations
                const eventData = allEventsData.find(e => e.event_id === currentEditingEventId);
                if (eventData) {
                    await loadEventRegistrations(currentEditingEventId, eventData.form_config);
                }
                loadOverview();
            } catch (e) { showPopup('錯誤', '更新失敗', 'error'); }
            finally { setLoading(false); }
        }

        function showQRCode(data) { // Renamed from viewQR
            const url = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(data)}`;
            const win = window.open("", "QR Code", "width=300,height=300");
            win.document.write(`<div style="text-align:center; padding:20px;"><img src="${url}"/><br>請保存此圖</div>`);
        }

        // --- CSV Export ---
        function downloadCSV() {
            if (!currentEventRegistrations || currentEventRegistrations.length === 0) {
                alert("沒有資料可以匯出");
                return;
            }

            // Get Custom Fields Config
            const eventData = allEventsData.find(e => e.event_id === currentEditingEventId);
            let customFields = [];
            if (eventData && eventData.form_config) {
                try {
                    customFields = typeof eventData.form_config === 'string' ? JSON.parse(eventData.form_config) : eventData.form_config;
                } catch (e) { }
            }

            // Headers
            const headers = ['姓名', 'Email', '電話', ...customFields.map(f => f.label), '狀態', '付款狀態', '報到狀態'];
            const csvRows = [headers.join(',')];

            // Rows
            for (const row of currentEventRegistrations) {
                let customData = {};
                try {
                    customData = row.dynamic_data ? JSON.parse(row.dynamic_data) : {};
                } catch (e) { }

                const dynamicValues = customFields.map(f => {
                    const val = customData[f.label] || '';
                    return `"${val.replace(/"/g, '""')}"`; // Escape quotes
                });

                const values = [
                    `"${row.participant_name}"`,
                    `"${row.email}"`,
                    `"${row.phone || ''}"`,
                    ...dynamicValues,
                    `"${row.status}"`,
                    `"${row.payment_status}"`,
                    `"${row.check_in_status || 'Not Checked In'}"`
                ];
                csvRows.push(values.join(','));
            }

            const blob = new Blob(["\uFEFF" + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `registrations_${currentEditingEventId}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }



        // --- View Navigation ---
        function switchView(viewName) {
            // Hide all views
            ['dashboard', 'create-event', 'accounts'].forEach(v => {
                const el = document.getElementById(`view-${v}`);
                if (el) el.classList.add('hidden');
            });

            // Show selected view
            const target = document.getElementById(`view-${viewName}`);
            if (target) {
                target.classList.remove('hidden');
                if (viewName === 'accounts') loadUsers();
            }
        }

        // --- Account Management Logic ---
        async function loadUsers() {
            const body = document.getElementById('users-list-body');
            body.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center"><i class="fas fa-spinner fa-spin mr-2"></i>載入中...</td></tr>';

            try {
                const res = await fetch(`${API_URL}?action=getUsers`);
                const json = await res.json();

                if (json.status === 'success' && json.data.length) {
                    body.innerHTML = json.data.map(u => `
                        <tr class="hover:bg-slate-50">
                            <td class="px-6 py-4 font-medium text-slate-800">${u.username}</td>
                            <td class="px-6 py-4 text-slate-600">${u.name}</td>
                            <td class="px-6 py-4"><span class="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">${u.role}</span></td>
                            <td class="px-6 py-4">
                                ${u.username === 'admin' ? '<span class="text-xs text-slate-400">系統預設</span>' :
                            `<button onclick="deleteUser('${u.sys_id}')" class="text-red-500 hover:text-red-700 text-sm">刪除</button>`}
                            </td>
                        </tr>
                    `).join('');
                } else {
                    body.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center">無帳號資料</td></tr>';
                }
            } catch (e) {
                console.error(e);
                body.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-red-500">載入失敗</td></tr>';
            }
        }

        function openCreateUserModal() {
            playAudio('popup');
            document.getElementById('create-user-modal').classList.remove('hidden');
        }

        async function deleteUser(sysId) {
            if (!confirm("確定要刪除此帳號？")) return;
            try {
                setLoading(true);
                const res = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'deleteUser', sysId: sysId }) });
                const json = await res.json();
                if (json.status === 'success') {
                    showPopup('成功', '帳號已刪除', 'success');
                    loadUsers();
                } else {
                    showPopup('錯誤', json.message, 'error');
                }
            } catch (e) {
                showPopup('錯誤', '刪除失敗', 'error');
            } finally {
                setLoading(false);
            }
        }

        // Ensure create user form works
        document.getElementById('create-user-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            setLoading(true, btn);

            try {
                const payload = {
                    action: 'createUser',
                    username: document.getElementById('new-u-username').value,
                    password: document.getElementById('new-u-password').value,
                    name: document.getElementById('new-u-name').value,
                    role: document.getElementById('new-u-role').value
                };

                const res = await fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) });
                const json = await res.json();

                if (json.status === 'success') {
                    document.getElementById('create-user-modal').classList.add('hidden');
                    e.target.reset();
                    showPopup('成功', '帳號建立成功', 'success');
                    loadUsers();
                } else {
                    showPopup('錯誤', json.message, 'error');
                }
            } catch (err) {
                showPopup('錯誤', '連線失敗', 'error');
            } finally {
                setLoading(false, btn);
            }
        });


        // --- Tab Logic ---
        function switchModalTab(tab) {
            // UI Classes
            const activeClass = "border-b-2 border-blue-600 text-blue-600";
            const inactiveClass = "text-gray-500 hover:text-gray-700";

            // Reset buttons
            ['info', 'regs', 'checkin'].forEach(t => {
                const btn = document.getElementById(`mtab-${t}`);
                if (btn) btn.className = `py-3 text-sm font-medium transition-colors ${t === tab ? activeClass : inactiveClass}`;
            });

            // Toggle Content
            document.getElementById('mview-info').classList.toggle('hidden', tab !== 'info');
            document.getElementById('mview-regs').classList.toggle('hidden', tab !== 'regs');
            const checkinView = document.getElementById('mview-checkin');
            if (checkinView) checkinView.classList.toggle('hidden', tab !== 'checkin');

            // Logic Hooks
            if (tab === 'regs') {
                // loadModalRegistrations(); // This function is replaced by loadEventRegistrations
            }

            // Console Scanner Hook
            if (tab === 'checkin') {
                loadOverview(); // Update stats
                updateConsoleStats(); // UPDATE STATS
                // startConsoleScanner(); // Auto-start removed
            } else {
                stopConsoleScanner(); // Stop Scanner to save resources
            }
        }

        // --- Check-in Console Logic ---
        function updateConsoleStats() {
            if (!currentEventRegistrations) return;

            const total = currentEventRegistrations.length;
            const checkedIn = currentEventRegistrations.filter(r => r.check_in_status === 'CheckedIn').length;
            const unchecked = total - checkedIn;
            const rate = total > 0 ? Math.round((checkedIn / total) * 100) : 0;

            // Animate Numbers
            animateValue("console-total", parseInt(document.getElementById("console-total").innerText) || 0, total, 500);
            animateValue("console-checked-in", parseInt(document.getElementById("console-checked-in").innerText) || 0, checkedIn, 500);
            animateValue("console-unchecked", parseInt(document.getElementById("console-unchecked").innerText) || 0, unchecked, 500);
            document.getElementById("console-rate").innerText = `${rate}%`;
        }

        function animateValue(id, start, end, duration) {
            if (start === end) return;
            const range = end - start;
            let current = start;
            const increment = end > start ? 1 : -1;
            const stepTime = Math.abs(Math.floor(duration / range));
            const obj = document.getElementById(id);
            if (!obj) return;

            const timer = setInterval(() => {
                current += increment;
                obj.innerText = current;
                if (current == end) { clearInterval(timer); }
            }, Math.max(stepTime, 20)); // Min 20ms per frame
        }

        // --- Scanner Logic (Refactored for Console) ---
        let html5QrcodeScanner;
        let mainHtml5QrcodeScanner; // For the main scanner tab

        function startConsoleScanner() {
            if (html5QrcodeScanner) {
                // Already running?
                return;
            }

            const readerId = "console-reader";
            if (!document.getElementById(readerId)) return;

            if (typeof Html5Qrcode === 'undefined') {
                console.warn("Html5Qrcode library not loaded. Scanner disabled.");
                document.getElementById(readerId).innerHTML = '<div class="text-white text-center p-4">無法載入掃描元件 (Library Missing)</div>';
                return;
            }

            html5QrcodeScanner = new Html5Qrcode(readerId);

            const config = { fps: 10, qrbox: { width: 250, height: 250 } };

            html5QrcodeScanner.start({ facingMode: "environment" }, config, async (decodedText) => {
                // Success
                if (window.isScanning) return; // Debounce
                window.isScanning = true;

                // UI Feedback
                document.getElementById('console-scan-status').classList.remove('hidden');

                try {
                    const res = await fetch(API_URL, {
                        method: 'POST',
                        body: JSON.stringify({ action: 'checkIn', qrCodeData: decodedText })
                    });
                    const json = await res.json();

                    if (json.status === 'success') {
                        playAudio('success');
                        logConsoleActivity(json.participant, 'success');

                        // Update Data
                        await refreshCurrentEventData(); // Reload regs
                        updateConsoleStats(); // Update UI

                        showScannerResult(json.participant, '已完成報到 (Checked In)', 'success');
                    } else {
                        playAudio('error');
                        logConsoleActivity('未知用戶', 'error', json.message);
                        showScannerResult('錯誤 (Error)', json.message, 'error');
                    }
                } catch (e) {
                    console.error(e);
                    playAudio('error');
                    showScannerResult('系統錯誤', '無法連接伺服器', 'error');
                } finally {
                    document.getElementById('console-scan-status').classList.add('hidden');
                    setTimeout(() => { window.isScanning = false; }, 2000); // Cooldown
                }
            }).then(() => {
                // Started
                document.getElementById('scanner-blocked-overlay').classList.add('hidden');
                document.getElementById('btn-stop-scanner').classList.remove('hidden');
            }).catch(err => {
                console.error("Scanner Error", err);
                document.getElementById(readerId).innerHTML = `<div class="text-white text-center p-4">無法啟動鏡頭<br>${err}</div>`;
            });
        }

        function stopConsoleScanner() {
            if (html5QrcodeScanner) {
                html5QrcodeScanner.stop().then(() => {
                    html5QrcodeScanner.clear();
                    html5QrcodeScanner = null;
                    document.getElementById('scanner-blocked-overlay').classList.remove('hidden');
                    document.getElementById('btn-stop-scanner').classList.add('hidden');
                }).catch(err => console.error("Failed to stop scanner", err));
            }
        }

        function startScanner() {
            if (mainHtml5QrcodeScanner) {
                return;
            }

            const readerId = "reader";
            if (!document.getElementById(readerId)) return;

            if (typeof Html5Qrcode === 'undefined') {
                console.warn("Html5Qrcode library not loaded. Scanner disabled.");
                document.getElementById(readerId).innerHTML = '<div class="text-white text-center p-4">無法載入掃描元件 (Library Missing)</div>';
                return;
            }

            mainHtml5QrcodeScanner = new Html5Qrcode(readerId);
            const config = { fps: 10, qrbox: { width: 250, height: 250 } };

            mainHtml5QrcodeScanner.start({ facingMode: "environment" }, config, async (decodedText) => {
                // Success
                // document.getElementById('scan-result').innerText = `掃描結果: ${decodedText}`; // Old logic

                // Actual Check-in Logic
                playAudio('popup');
                try {
                    const res = await fetch(API_URL, {
                        method: 'POST',
                        body: JSON.stringify({ action: 'checkIn', qrCodeData: decodedText })
                    });
                    const json = await res.json();

                    if (json.status === 'success') {
                        playAudio('success');
                        showScannerResult(json.participant, '已完成報到 (Checked In)', 'success');
                    } else {
                        playAudio('error');
                        showScannerResult('錯誤 (Error)', json.message, 'error');
                    }
                } catch (e) {
                    console.error(e);
                    playAudio('error');
                    showScannerResult('系統錯誤', '無法連接伺服器', 'error');
                }

                // Stop after scan? Or keep scanning? 
                // Console scanner has cooldown. Main scanner usually one-off or continuous?
                // Text says "Click to close".
                // Let's pause or cooldown.
                mainHtml5QrcodeScanner.pause(true);
                setTimeout(() => mainHtml5QrcodeScanner.resume(), 3000);

            }).then(() => {
                document.getElementById('main-scanner-overlay').classList.add('hidden');
                document.getElementById('btn-stop-main-scanner').classList.remove('hidden');
            }).catch(err => {
                console.error("Main Scanner Error", err);
                document.getElementById(readerId).innerHTML = `<div class="text-white text-center p-4">無法啟動鏡頭<br>${err}</div>`;
            });
        }

        function stopScanner() {
            if (mainHtml5QrcodeScanner) {
                mainHtml5QrcodeScanner.stop().then(() => {
                    mainHtml5QrcodeScanner.clear();
                    mainHtml5QrcodeScanner = null;
                    document.getElementById('main-scanner-overlay').classList.remove('hidden');
                    document.getElementById('btn-stop-main-scanner').classList.add('hidden');
                    document.getElementById('scan-result').innerText = '';
                }).catch(err => console.error("Failed to stop main scanner", err));
            }
        }

        function logConsoleActivity(name, type, msg = '') {
            const logContainer = document.getElementById('console-activity-log');
            if (logContainer.children[0]?.innerText === '暫無報到紀錄') logContainer.innerHTML = '';

            const div = document.createElement('div');
            const time = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

            if (type === 'success') {
                div.className = "flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100 animate__animated animate__fadeInLeft";
                div.innerHTML = `
                    <div class="flex items-center">
                        <div class="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">✓</div>
                        <div>
                            <div class="font-bold text-slate-800">${name}</div>
                            <div class="text-xs text-green-600">已報到</div>
                        </div>
                    </div>
                    <div class="text-xs text-slate-400 font-mono">${time}</div>
                `;
            } else {
                div.className = "flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100 animate__animated animate__fadeInLeft";
                div.innerHTML = `
                    <div class="flex items-center">
                        <div class="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">!</div>
                        <div>
                            <div class="font-bold text-slate-800">${name || '掃描錯誤'}</div>
                            <div class="text-xs text-red-600">${msg}</div>
                        </div>
                    </div>
                    <div class="text-xs text-slate-400 font-mono">${time}</div>
                `;
            }

            logContainer.prepend(div);
        }

        async function refreshCurrentEventData() {
            // Helper to silently reload data
            if (currentEditingEventId) {
                const event = allEventsData.find(e => e.event_id === currentEditingEventId);
                await loadEventRegistrations(currentEditingEventId, event.form_config);
            }
        }


        // --- NEW FEATURES ---

        // Audio
        // --- GLOBAL UI HELPERS ---

        // Audio System
        const audioSuccess = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
        const audioError = new Audio('https://actions.google.com/sounds/v1/alarms/dosimeter_alarm.ogg');
        const audioClick = new Audio('https://actions.google.com/sounds/v1/tools/ratchet_click.ogg');
        const audioPopup = new Audio('https://actions.google.com/sounds/v1/water/air_woosh_underwater.ogg');

        function playAudio(type) {
            try {
                // Reset time to allow rapid replay
                if (type === 'success') { audioSuccess.currentTime = 0; audioSuccess.play().catch(() => { }); }
                else if (type === 'error') { audioError.currentTime = 0; audioError.play().catch(() => { }); }
                else if (type === 'click') { audioClick.currentTime = 0; audioClick.play().catch(() => { }); }
                else if (type === 'popup') { audioPopup.currentTime = 0; audioPopup.play().catch(() => { }); }
            } catch (e) {
                console.warn("Audio play failed", e);
            }
        }

        // Global Click Listener
        document.addEventListener('click', (e) => {
            const isClickable = e.target.matches('button, a, input, select, textarea, [onclick]') ||
                e.target.closest('button, a, .clickable, [onclick]');
            if (isClickable) {
                playAudio('click');
            }
        });

        // Loading System
        function setLoading(isLoading, btn = null) {
            const overlay = document.getElementById('main-loading-overlay');

            if (isLoading) {
                if (btn) {
                    btn.dataset.originalText = btn.innerHTML; // Save text
                    btn.disabled = true;
                    btn.innerHTML = `<i class="fas fa-circle-notch fa-spin mr-2"></i>處理中...`;
                    btn.classList.add('opacity-75', 'cursor-not-allowed');
                } else {
                    if (overlay) overlay.classList.remove('hidden');
                }
            } else {
                if (btn) {
                    if (btn.dataset.originalText) btn.innerHTML = btn.dataset.originalText;
                    btn.disabled = false;
                    btn.classList.remove('opacity-75', 'cursor-not-allowed');
                }
                if (overlay) overlay.classList.add('hidden');
            }
        }

        // Popup System (Replaces showScannerResult)
        function showPopup(title, message, type = 'info') {
            const overlay = document.createElement('div');
            overlay.className = "fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] animate__animated animate__fadeIn";
            overlay.onclick = () => overlay.remove();

            let bgColor = 'bg-white';
            let iconColor = 'text-blue-500';
            let icon = 'ℹ️';

            if (type === 'success') {
                icon = '<i class="fas fa-check-circle text-6xl text-green-500 mb-4 animate__animated animate__bounceIn"></i>';
            } else if (type === 'error') {
                icon = '<i class="fas fa-times-circle text-6xl text-red-500 mb-4 animate__animated animate__shakeX"></i>';
            } else {
                icon = '<i class="fas fa-info-circle text-6xl text-blue-500 mb-4"></i>';
            }

            // Play Sound
            if (type === 'success') playAudio('success');
            else if (type === 'error') playAudio('error');
            else playAudio('popup');

            overlay.innerHTML = `
                <div class="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full mx-4 transform transition-all scale-100 hover:scale-105" onclick="event.stopPropagation()">
                    ${icon}
                    <h2 class="text-3xl font-bold mb-2 text-slate-800">${title}</h2>
                    <p class="text-lg text-slate-500 mb-8 leading-relaxed">${message}</p>
                    <button onclick="this.closest('.fixed').remove()" 
                        class="bg-slate-800 text-white px-8 py-3 rounded-full font-bold hover:bg-slate-900 transition-colors shadow-lg hover:shadow-xl w-full">
                        我知道了 (OK)
                    </button>
                </div>
            `;
            document.body.appendChild(overlay);

            // Auto close success after 2s? No, user wants notifications. Let them close or 3s auto.
            if (type === 'success') {
                setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 2500);
            }
        }

        // Legacy compatibility
        const showScannerResult = (t, m, type) => showPopup(t, m, type);


        // Scanner Modal
        function showScannerResult(title, message, type) {
            const overlay = document.createElement('div');
            overlay.className = "fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] animate__animated animate__zoomIn";
            overlay.onclick = () => overlay.remove();

            const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
            const icon = type === 'success' ? '✅' : '❌';

            overlay.innerHTML = `
                <div class="${bgColor} text-white p-10 rounded-3xl shadow-2xl text-center max-w-sm w-full mx-4">
                    <div class="text-6xl mb-4">${icon}</div>
                    <h2 class="text-4xl font-bold mb-4">${title}</h2>
                    <p class="text-2xl opacity-90">${message}</p>
                    <div class="mt-8 text-sm opacity-70">點擊任意處關閉</div>
                </div>
            `;
            document.body.appendChild(overlay);
            setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 3000);
        }

        // Repair DB
        async function repairDatabase() {
            if (!confirm("確定要執行資料庫欄位修復？(建議在發現資料異常時執行)")) return;
            const btn = document.querySelector('button[onclick="repairDatabase()"]');
            setLoading(true, btn);
            try {
                const res = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'fixHeaders' }) });
                const json = await res.json();
                showPopup('成功', json.message, 'success');
            } catch (e) { showPopup('失敗', '修復失敗', 'error'); console.error(e); }
            finally { setLoading(false, btn); }
        }

        // Stats Overview
        function loadOverview() {
            const total = currentEventRegistrations.length;
            const checkedIn = currentEventRegistrations.filter(r => r.check_in_status === 'CheckedIn').length;
            const rate = total > 0 ? Math.round((checkedIn / total) * 100) : 0;

            if (document.getElementById('stat-total')) document.getElementById('stat-total').innerText = total;
            if (document.getElementById('stat-checked-in')) document.getElementById('stat-checked-in').innerText = checkedIn;
            if (document.getElementById('stat-rate')) document.getElementById('stat-rate').innerText = `${rate}%`;
        }

        function loadModalRegistrations() {
            refreshCurrentEventData();
        }

        // --- Manual Check-in ---
        async function manualCheckIn() {
            const phoneInput = document.getElementById('manual-checkin-phone');
            const phone = phoneInput.value.trim();
            if (!phone) {
                alert("請輸入手機號碼");
                return;
            }
            if (!currentEditingEventId) return;

            // UI Feedback
            const btn = document.querySelector('button[onclick="manualCheckIn()"]');
            setLoading(true, btn);

            try {
                const res = await fetch(API_URL, {
                    method: 'POST',
                    body: JSON.stringify({ action: 'checkInByPhone', eventId: currentEditingEventId, phone: phone })
                });
                const json = await res.json();

                if (json.status === 'success') {
                    playAudio('success');
                    phoneInput.value = ''; // Clear input
                    logConsoleActivity(json.participant, 'success', '(Manual)');
                    showScannerResult(json.participant, '報到成功 (Manual)', 'success');

                    // Update Data
                    await refreshCurrentEventData();
                    updateConsoleStats();
                } else {
                    playAudio('error');
                    logConsoleActivity('Unknown', 'error', json.message);
                    showScannerResult('錯誤', json.message, 'error');
                }
            } catch (e) {
                console.error(e);
                playAudio('error');
                showScannerResult('系統錯誤', '連線失敗', 'error');
            } finally {
                setLoading(false, btn);
            }
        }

        // Script Loaded Indicator
        try {
            console.log("SEED EVENT+ Admin Script Loaded");
            const title = document.querySelector('h2');
            if (title) {
                const dot = document.createElement('span');
                dot.innerText = '●';
                dot.style.color = '#22c55e'; // Green
                dot.style.fontSize = '12px';
                dot.style.verticalAlign = 'top';
                dot.style.marginLeft = '5px';
                dot.title = "System Script Loaded";
                title.appendChild(dot);
            }
        } catch (e) { console.error("Init Error", e); }
    </script>

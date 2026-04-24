/**
 * customers-ui.js - واجهة المستخدم
 */

export const UI = {
    // قالب الهيكل الرئيسي
    renderMainLayout: () => `
        <div class="stats-grid">
            <div class="stat-card"><h3>إجمالي العملاء</h3><p id="stat-total">0</p></div>
            <div class="stat-card success"><h3>بيانات مكتملة</h3><p id="stat-complete">0</p></div>
            <div class="stat-card warning"><h3>بيانات ناقصة</h3><p id="stat-incomplete">0</p></div>
            <div class="stat-card danger"><h3>ملاحظات</h3><p id="stat-flagged">0</p></div>
        </div>

        <div class="toolbar">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" id="customer-search" placeholder="بحث بالاسم، الجوال...">
            </div>
            <div class="action-buttons">
                <button onclick="exportToExcel()" class="btn-alt"><i class="fas fa-file-excel"></i> تصدير</button>
                <button id="add-customer-btn" class="btn-primary-tera"><i class="fas fa-plus"></i> إضافة عميل</button>
            </div>
        </div>
        
        <div class="table-container">
            <table class="tera-table">
                <thead>
                    <tr>
                        <th>العميل</th>
                        <th>الاتصال</th>
                        <th>العنوان</th>
                        <th>التصنيف</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody id="customers-list"></tbody>
            </table>
        </div>
    `,

    // قالب سطر العميل في الجدول
    renderCustomerRow: (id, data) => `
        <tr class="customer-row">
            <td>
                <div class="user-cell">
                    <div class="avatar-text" style="background:#1e293b; color:white; width:35px; height:35px; display:flex; align-items:center; justify-content:center; border-radius:8px;">
                        ${(data.name || 'C').charAt(0)}
                    </div>
                    <div class="info">
                        <span class="name" style="font-weight:700;">${data.name || 'بدون اسم'}</span><br>
                        <small style="color:#64748b;">${data.email || '-'}</small>
                    </div>
                </div>
            </td>
            <td dir="ltr"><b>${data.countryCode || '+966'}</b> ${data.phone}</td>
            <td>${data.city || '-'} - ${data.district || '-'}</td>
            <td><span class="status-badge ${data.tag === 'مميز' ? 'vip' : ''}">${data.tag || 'عادي'}</span></td>
            <td>
                <div class="actions">
                    <button onclick="previewPrint('${id}')" class="act-btn print" title="طباعة وترجمة">
                        <i class="fas fa-print"></i>
                    </button>
                </div>
            </td>
        </tr>
    `,

    injectStyles: () => {
        if (document.getElementById('tera-ui-styles')) return;
        const s = document.createElement('style');
        s.id = 'tera-ui-styles';
        s.innerHTML = `
            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px; }
            .stat-card { background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); text-align: center; }
            .status-badge { padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: bold; background: #f1f5f9; }
            .status-badge.vip { background: #fef3c7; color: #92400e; }
            .act-btn { border: none; padding: 8px; border-radius: 6px; cursor: pointer; transition: 0.2s; }
            .act-btn.print:hover { background: #1e293b; color: #fff; }
        `;
        document.head.appendChild(s);
    }
};

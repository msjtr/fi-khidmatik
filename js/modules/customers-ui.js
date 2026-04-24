/**
 * customers-ui.js - واجهة المستخدم المتطورة لـ Tera Gateway
 */

export const UI = {
    // قالب الهيكل الرئيسي مع تحسين الأدوات والإحصائيات
    renderMainLayout: () => `
        <div class="module-fade-in">
            <div class="stats-grid">
                <div class="stat-card modern-shadow">
                    <div class="stat-icon primary"><i class="fas fa-user-group"></i></div>
                    <div class="stat-content">
                        <h3>إجمالي العملاء</h3>
                        <p id="stat-total">0</p>
                    </div>
                </div>
                <div class="stat-card modern-shadow success">
                    <div class="stat-icon"><i class="fas fa-check-double"></i></div>
                    <div class="stat-content">
                        <h3>بيانات مكتملة</h3>
                        <p id="stat-complete">0</p>
                    </div>
                </div>
                <div class="stat-card modern-shadow warning">
                    <div class="stat-icon"><i class="fas fa-file-signature"></i></div>
                    <div class="stat-content">
                        <h3>بيانات ناقصة</h3>
                        <p id="stat-incomplete">0</p>
                    </div>
                </div>
                <div class="stat-card modern-shadow danger">
                    <div class="stat-icon"><i class="fas fa-bell"></i></div>
                    <div class="stat-content">
                        <h3>ملاحظات</h3>
                        <p id="stat-flagged">0</p>
                    </div>
                </div>
            </div>

            <div class="toolbar-modern">
                <div class="search-wrapper">
                    <i class="fas fa-magnifying-glass"></i>
                    <input type="text" id="customer-search" placeholder="بحث بالاسم، الجوال، أو رقم الهوية...">
                </div>
                <div class="action-group">
                    <button onclick="exportToExcel()" class="btn-secondary-tera">
                        <i class="fas fa-file-export"></i> <span>تصدير Excel</span>
                    </button>
                    <button id="add-customer-btn" class="btn-primary-tera">
                        <i class="fas fa-plus"></i> <span>إضافة عميل جديد</span>
                    </button>
                </div>
            </div>
            
            <div class="table-card-wrapper">
                <table class="tera-table-modern">
                    <thead>
                        <tr>
                            <th>العميل</th>
                            <th>معلومات الاتصال</th>
                            <th>العنوان والسكن</th>
                            <th>الحالة</th>
                            <th style="text-align: center;">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-list">
                        </tbody>
                </table>
            </div>
        </div>
    `,

    // قالب سطر العميل مع تصميم بطاقة مصغرة داخل الصف
    renderCustomerRow: (id, data) => `
        <tr class="customer-row-fade">
            <td>
                <div class="user-profile-cell">
                    <div class="avatar-box">
                        ${(data.name || 'C').charAt(0)}
                    </div>
                    <div class="user-meta">
                        <span class="user-name">${data.name || 'عميل غير معروف'}</span>
                        <span class="user-subtext">${data.idNumber || 'لم يتم إدخال الهوية'}</span>
                    </div>
                </div>
            </td>
            <td>
                <div class="contact-info">
                    <div class="phone-link" dir="ltr">
                        <i class="fas fa-phone-flip"></i>
                        <span><b>${data.countryCode || '+966'}</b> ${data.phone}</span>
                    </div>
                    <small class="email-text">${data.email || 'لا يوجد بريد إلكتروني'}</small>
                </div>
            </td>
            <td>
                <div class="location-box">
                    <i class="fas fa-location-dot"></i>
                    <span>${data.city || '-'} ، ${data.district || '-'}</span>
                </div>
            </td>
            <td>
                <span class="badge-tera ${data.tag === 'مميز' ? 'vip' : 'standard'}">
                    <i class="fas ${data.tag === 'مميز' ? 'fa-crown' : 'fa-user'}"></i>
                    ${data.tag || 'عادي'}
                </span>
            </td>
            <td>
                <div class="action-dock">
                    <button onclick="previewPrint('${id}')" class="btn-icon print" title="طباعة العقد">
                        <i class="fas fa-print"></i>
                    </button>
                    <button onclick="editCustomer('${id}')" class="btn-icon edit" title="تعديل البيانات">
                        <i class="fas fa-pen-to-square"></i>
                    </button>
                </div>
            </td>
        </tr>
    `,

    // حقن الأنماط لضمان الاتساق مع Tera Gateway
    injectStyles: () => {
        if (document.getElementById('tera-ui-styles')) return;
        const s = document.createElement('style');
        s.id = 'tera-ui-styles';
        s.innerHTML = `
            .module-fade-in { animation: fadeIn 0.4s ease-out; }
            
            /* Stats Grid */
            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 30px; }
            .stat-card { background: #fff; padding: 20px; border-radius: 18px; display: flex; align-items: center; gap: 15px; border: 1px solid #f1f5f9; transition: 0.3s; }
            .stat-card:hover { transform: translateY(-5px); box-shadow: 0 12px 25px rgba(0,0,0,0.05); }
            .stat-icon { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; background: #f8fafc; }
            .stat-icon.primary { color: #e67e22; background: #fff7ed; }
            .success .stat-icon { color: #10b981; background: #f0fdf4; }
            .warning .stat-icon { color: #f59e0b; background: #fffbeb; }
            .danger .stat-icon { color: #ef4444; background: #fef2f2; }
            .stat-content h3 { font-size: 0.85rem; color: #64748b; margin: 0; }
            .stat-content p { font-size: 1.5rem; font-weight: 800; color: #1e293b; margin: 0; }

            /* Toolbar */
            .toolbar-modern { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; gap: 15px; flex-wrap: wrap; }
            .search-wrapper { position: relative; flex: 1; min-width: 300px; }
            .search-wrapper i { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
            .search-wrapper input { width: 100%; padding: 12px 45px 12px 15px; border-radius: 14px; border: 1px solid #e2e8f0; outline: none; transition: 0.2s; font-family: inherit; }
            .search-wrapper input:focus { border-color: #e67e22; box-shadow: 0 0 0 4px rgba(230,126,34,0.1); }

            /* Buttons */
            .btn-primary-tera { background: #e67e22; color: #fff; border: none; padding: 12px 25px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; box-shadow: 0 4px 12px rgba(230,126,34,0.2); }
            .btn-secondary-tera { background: #fff; color: #64748b; border: 1px solid #e2e8f0; padding: 12px 20px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: 0.2s; }
            .btn-primary-tera:hover { background: #d35400; transform: translateY(-2px); }

            /* Table */
            .table-card-wrapper { background: #fff; border-radius: 20px; border: 1px solid #f1f5f9; overflow: hidden; }
            .tera-table-modern { width: 100%; border-collapse: collapse; text-align: right; }
            .tera-table-modern th { background: #f8fafc; padding: 18px 25px; color: #64748b; font-size: 0.8rem; font-weight: 800; border-bottom: 1px solid #f1f5f9; }
            .tera-table-modern td { padding: 16px 25px; border-bottom: 1px solid #f8fafc; vertical-align: middle; }
            
            /* User Cell */
            .user-profile-cell { display: flex; align-items: center; gap: 12px; }
            .avatar-box { width: 42px; height: 42px; background: #1e293b; color: #fff; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; }
            .user-name { display: block; font-weight: 700; color: #1e293b; }
            .user-subtext { font-size: 0.75rem; color: #94a3b8; }

            /* Badge */
            .badge-tera { padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; }
            .badge-tera.vip { background: #fff7ed; color: #e67e22; }
            .badge-tera.standard { background: #f1f5f9; color: #64748b; }

            /* Actions */
            .action-dock { display: flex; gap: 8px; justify-content: center; }
            .btn-icon { border: none; width: 36px; height: 36px; border-radius: 10px; cursor: pointer; transition: 0.2s; background: #f8fafc; color: #64748b; }
            .btn-icon.print:hover { background: #1e293b; color: #fff; }
            .btn-icon.edit:hover { background: #e67e22; color: #fff; }

            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        `;
        document.head.appendChild(s);
    }
};

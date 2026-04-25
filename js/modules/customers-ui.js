/**
 * order-form-ui.js
 * واجهة إنشاء الطلبات والعمليات لعمليات الأقساط - Tera Gateway
 */

export const OrderUI = {
    /**
     * رسم نموذج طلب جديد
     * @param {Object} customerData - بيانات العميل المختارة من قاعدة البيانات
     */
    renderOrderForm: (customerData = {}) => `
        <div class="module-fade-in">
            <div class="order-header" style="margin-bottom: 25px;">
                <h2 style="color: var(--tera-dark); font-weight: 800;">
                    <i class="fas fa-file-invoice-dollar" style="color: var(--tera-primary);"></i> 
                    إنشاء طلب تقسيط جديد
                </h2>
                <p style="color: var(--tera-text-muted); font-size: 0.9rem;">
                    العميل الحالي: <strong>${customerData.name || 'لم يتم اختيار عميل'}</strong>
                </p>
            </div>

            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 25px;">
                <div class="table-card-wrapper" style="padding: 25px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div class="input-group">
                            <label style="font-weight: 700; margin-bottom: 8px; display: block;">فئة بطاقة سوا (STC)</label>
                            <select id="card-amount" class="tera-input" onchange="calculateInstallments()">
                                <option value="500">سوا 500</option>
                                <option value="1000">سوا 1000</option>
                                <option value="1500">سوا 1500</option>
                                <option value="2000">سوا 2000</option>
                                <option value="2500" selected>سوا 2500</option>
                            </select>
                        </div>
                        
                        <div class="input-group">
                            <label style="font-weight: 700; margin-bottom: 8px; display: block;">نظام التقسيط</label>
                            <select id="installment-plan" class="tera-input" onchange="calculateInstallments()">
                                <option value="monthly">شهري</option>
                                <option value="weekly">أسبوعي</option>
                                <option value="deferred">آجل (دفعة واحدة)</option>
                            </select>
                        </div>

                        <div class="input-group">
                            <label style="font-weight: 700; margin-bottom: 8px; display: block;">المبلغ الإجمالي (مع الفائدة)</label>
                            <input type="number" id="total-amount" class="tera-input" placeholder="0.00">
                        </div>

                        <div class="input-group">
                            <label style="font-weight: 700; margin-bottom: 8px; display: block;">قسط الفترة</label>
                            <input type="number" id="period-amount" class="tera-input" readonly style="background: #f1f5f9;">
                        </div>
                    </div>

                    <div style="margin-top: 25px;">
                        <label style="font-weight: 700; margin-bottom: 8px; display: block;">ملاحظات العقد</label>
                        <textarea id="order-notes" class="tera-input" rows="3" placeholder="أي شروط إضافية أو ملاحظات عن الضمان..."></textarea>
                    </div>
                </div>

                <div class="table-card-wrapper" style="padding: 20px; background: #f8fafc; border: 1px dashed #cbd5e1;">
                    <h3 style="font-size: 1rem; margin-top: 0; color: var(--tera-dark); border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">
                        بيانات المستلم
                    </h3>
                    <div style="font-size: 0.85rem; line-height: 1.8;">
                        <div><i class="fas fa-user-tag"></i> <strong>الاسم:</strong> ${customerData.name || '-'}</div>
                        <div><i class="fas fa-id-card"></i> <strong>الهوية:</strong> ${customerData.idNumber || '-'}</div>
                        <div><i class="fas fa-location-dot"></i> <strong>المدينة:</strong> ${customerData.city || 'حائل'}</div>
                        <div><i class="fas fa-map-marker-alt"></i> <strong>الحي:</strong> ${customerData.district || '-'}</div>
                        <div><i class="fas fa-road"></i> <strong>الشارع:</strong> ${customerData.street || '-'}</div>
                        <div style="margin-top: 10px; color: var(--tera-primary); font-weight: 700;">
                            <i class="fas fa-phone-flip"></i> ${customerData.phone || '-'}
                        </div>
                    </div>
                    
                    <button onclick="confirmOrder('${customerData.id}')" class="btn-primary-tera" style="width: 100%; margin-top: 20px; justify-content: center;">
                        <i class="fas fa-check-double"></i> اعتماد الطلب وإصدار العقد
                    </button>
                </div>
            </div>
        </div>
    `,

    /**
     * قالب جدول سجل الطلبات (Orders List)
     */
    renderOrdersTable: () => `
        <div class="table-card-wrapper">
            <table class="tera-table-modern">
                <thead>
                    <tr>
                        <th>رقم الطلب</th>
                        <th>العميل</th>
                        <th>البطاقة</th>
                        <th>الإجمالي</th>
                        <th>الحالة</th>
                        <th style="text-align: center;">الإجراءات</th>
                    </tr>
                </thead>
                <tbody id="orders-list-body">
                    </tbody>
            </table>
        </div>
    `,

    /**
     * قالب سطر الطلب الواحد
     */
    renderOrderRow: (id, data) => `
        <tr>
            <td><strong>#${id.slice(-6).toUpperCase()}</strong></td>
            <td>
                <div class="user-meta">
                    <span class="user-name">${data.customerName}</span>
                    <span class="user-subtext">${data.district || 'حائل'}</span>
                </div>
            </td>
            <td><span class="badge-tera standard">سوا ${data.cardType}</span></td>
            <td><strong style="color: var(--tera-primary);">${data.totalAmount} ريال</strong></td>
            <td>
                <span class="badge-tera ${data.status === 'paid' ? 'success' : 'warning'}">
                    ${data.status === 'paid' ? 'مسدد' : 'قيد الانتظار'}
                </span>
            </td>
            <td>
                <div class="action-dock">
                    <button onclick="printOrderInvoice('${id}')" class="btn-icon"><i class="fas fa-print"></i></button>
                    <button onclick="viewOrderDetails('${id}')" class="btn-icon"><i class="fas fa-eye"></i></button>
                </div>
            </td>
        </tr>
    `
};

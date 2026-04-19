/**
 * js/modules/settings.js
 * موديول إعدادات النظام
 */

export async function initSettings(container) {
    if (!container) return;
    
    container.innerHTML = `
        <div style="padding: 25px; font-family: 'Tajawal', sans-serif;">
            <h2 style="color: #2c3e50; margin-bottom: 25px;">
                <i class="fas fa-cog" style="color: #e67e22;"></i> إعدادات النظام
            </h2>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 25px;">
                
                <!-- الإعدادات العامة -->
                <div style="background: white; border-radius: 12px; padding: 20px;">
                    <h3 style="margin: 0 0 15px 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">
                        <i class="fas fa-globe"></i> الإعدادات العامة
                    </h3>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px;">اسم الشركة</label>
                        <input type="text" id="company-name" value="تيرا جيتواي" 
                               style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px;">نسبة الضريبة (%)</label>
                        <input type="number" id="tax-rate" value="15" step="0.5"
                               style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px;">العملة</label>
                        <select id="currency" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                            <option value="SAR">ريال سعودي (SAR)</option>
                            <option value="USD">دولار أمريكي (USD)</option>
                        </select>
                    </div>
                    <button id="save-general" style="background: #e67e22; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">
                        <i class="fas fa-save"></i> حفظ الإعدادات
                    </button>
                </div>
                
                <!-- إعدادات الإشعارات -->
                <div style="background: white; border-radius: 12px; padding: 20px;">
                    <h3 style="margin: 0 0 15px 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">
                        <i class="fas fa-bell"></i> الإشعارات
                    </h3>
                    <div style="margin-bottom: 15px;">
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                            <input type="checkbox" id="notify-low-stock" checked>
                            <span>تنبيه عند نفاد المخزون</span>
                        </label>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                            <input type="checkbox" id="notify-new-order" checked>
                            <span>تنبيه عند طلب جديد</span>
                        </label>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px;">حد التنبيه (الكمية)</label>
                        <input type="number" id="low-stock-threshold" value="5"
                               style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                    </div>
                    <button id="save-notifications" style="background: #e67e22; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">
                        <i class="fas fa-save"></i> حفظ الإعدادات
                    </button>
                </div>
                
                <!-- النسخ الاحتياطي -->
                <div style="background: white; border-radius: 12px; padding: 20px;">
                    <h3 style="margin: 0 0 15px 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">
                        <i class="fas fa-database"></i> النسخ الاحتياطي
                    </h3>
                    <p style="color: #7f8c8d; margin-bottom: 15px;">قم بعمل نسخة احتياطية من بيانات النظام</p>
                    <button id="backup-btn" style="background: #27ae60; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; width: 100%; margin-bottom: 10px;">
                        <i class="fas fa-download"></i> تصدير النسخة الاحتياطية
                    </button>
                    <input type="file" id="restore-file" accept=".json" style="display: none;">
                    <button id="restore-btn" style="background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; width: 100%;">
                        <i class="fas fa-upload"></i> استعادة النسخة الاحتياطية
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // ربط الأحداث
    const saveGeneral = document.getElementById('save-general');
    if (saveGeneral) {
        saveGeneral.addEventListener('click', () => {
            const companyName = document.getElementById('company-name')?.value || '';
            const taxRate = document.getElementById('tax-rate')?.value || 15;
            const currency = document.getElementById('currency')?.value || 'SAR';
            alert(`تم حفظ الإعدادات العامة:\nالشركة: ${companyName}\nالضريبة: ${taxRate}%\nالعملة: ${currency}`);
        });
    }
    
    const saveNotifications = document.getElementById('save-notifications');
    if (saveNotifications) {
        saveNotifications.addEventListener('click', () => {
            const notifyLowStock = document.getElementById('notify-low-stock')?.checked || false;
            const notifyNewOrder = document.getElementById('notify-new-order')?.checked || false;
            const threshold = document.getElementById('low-stock-threshold')?.value || 5;
            alert(`تم حفظ إعدادات الإشعارات:\nتنبيه المخزون: ${notifyLowStock}\nتنبيه الطلبات: ${notifyNewOrder}\nالحد: ${threshold}`);
        });
    }
    
    const backupBtn = document.getElementById('backup-btn');
    if (backupBtn) {
        backupBtn.addEventListener('click', () => {
            const backup = {
                date: new Date().toISOString(),
                settings: {
                    companyName: document.getElementById('company-name')?.value,
                    taxRate: document.getElementById('tax-rate')?.value,
                    currency: document.getElementById('currency')?.value
                }
            };
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            alert('تم تصدير النسخة الاحتياطية');
        });
    }
    
    const restoreBtn = document.getElementById('restore-btn');
    const restoreFile = document.getElementById('restore-file');
    if (restoreBtn && restoreFile) {
        restoreBtn.addEventListener('click', () => restoreFile.click());
        restoreFile.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const backup = JSON.parse(e.target.result);
                        alert('تم استعادة النسخة الاحتياطية بنجاح');
                        console.log('Backup data:', backup);
                    } catch (error) {
                        alert('ملف النسخة الاحتياطية غير صالح');
                    }
                };
                reader.readAsText(file);
            }
        });
    }
}

// تصدير افتراضي للمكتبة
export default { initSettings };

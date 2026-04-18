// js/modules/products.js

export async function initProducts(container) {
    console.log("تحميل نظام إدارة المنتجات المطور...");

    container.innerHTML = `
        <div class="products-wrapper" style="animation: fadeIn 0.4s ease;">
            
            <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
                <div>
                    <h2 style="font-weight:800; color:#1a202c; font-size:1.8rem;">إدارة المخزون والمنتجات</h2>
                    <p style="color:#64748b;">إضافة وتعديل باقات ومنتجات منصة تيرا</p>
                </div>
                <button onclick="document.getElementById('product-form-section').scrollIntoView({behavior:'smooth'})" 
                        class="btn-main" style="background:#e67e22; color:white; border:none; padding:12px 25px; border-radius:12px; font-weight:800; cursor:pointer;">
                    <i class="fas fa-plus-circle"></i> إضافة منتج جديد
                </button>
            </div>

            <div id="products-list-grid" class="orders-grid">
                </div>

            <hr style="margin:50px 0; border:0; border-top:2px dashed #e2e8f0;">

            <section id="product-form-section" class="order-card" style="padding:30px; background:#fff; border-radius:20px;">
                <h3 style="font-weight:800; color:#1a202c; margin-bottom:25px; border-right:4px solid #e67e22; padding-right:15px;">بيانات المنتج الجديد</h3>
                
                <form id="product-main-form">
                    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:20px; margin-bottom:20px;">
                        <div>
                            <label style="display:block; margin-bottom:8px; font-weight:700;">اسم المنتج</label>
                            <input type="text" id="p-name" placeholder="مثلاً: بطاقة سوا 100 ريال" style="width:100%; padding:12px; border-radius:10px; border:1px solid #e2e8f0;">
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:8px; font-weight:700;">كود المنتج (SKU)</label>
                            <input type="text" id="p-code" placeholder="SAWA-100" style="width:100%; padding:12px; border-radius:10px; border:1px solid #e2e8f0;">
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:20px; margin-bottom:20px;">
                        <div>
                            <label style="display:block; margin-bottom:8px; font-weight:700;">سعر البيع</label>
                            <input type="number" id="p-price" placeholder="0.00" style="width:100%; padding:12px; border-radius:10px; border:1px solid #e2e8f0;">
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:8px; font-weight:700;">الكمية في المخزون</label>
                            <input type="number" id="p-stock" placeholder="100" style="width:100%; padding:12px; border-radius:10px; border:1px solid #e2e8f0;">
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:8px; font-weight:700;">رابط فيديو (اختياري)</label>
                            <input type="url" id="p-video" placeholder="YouTube link" style="width:100%; padding:12px; border-radius:10px; border:1px solid #e2e8f0;">
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-bottom:20px;">
                        <div>
                            <label style="display:block; margin-bottom:8px; font-weight:700;">الصورة الرئيسية</label>
                            <input type="file" id="p-mainImage" accept="image/*" style="width:100%;">
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:8px; font-weight:700;">صور إضافية (المعرض)</label>
                            <input type="file" id="p-gallery" accept="image/*" multiple style="width:100%;">
                        </div>
                    </div>

                    <div style="margin-bottom:25px;">
                        <label style="display:block; margin-bottom:10px; font-weight:700;">وصف المنتج التفصيلي</label>
                        <textarea id="p-description"></textarea>
                    </div>

                    <div style="display:flex; justify-content:flex-end; gap:15px;">
                        <button type="reset" class="btn-action">إلغاء</button>
                        <button type="submit" class="btn-main" style="background:#1a202c; color:#fff; padding:15px 40px; border:none; border-radius:12px; cursor:pointer; font-weight:800;">حفظ المنتج في تيرا</button>
                    </div>
                </form>
            </section>
        </div>
    `;

    // تهيئة الوظائف
    setTimeout(() => {
        initFullEditor('p-description');
        renderProductsList();
    }, 100);
}

// دالة عرض المنتجات (تحاكي السحب من قاعدة البيانات)
function renderProductsList() {
    const grid = document.getElementById('products-list-grid');
    if (!grid) return;

    // بيانات تجريبية تحتوي على الحقول الجديدة
    const products = [
        { id: 'TR-501', name: 'سوا 100 - تقسيط', price: '115', stock: '45', code: 'STC-100', date: '2026-04-18' },
        { id: 'TR-502', name: 'سوا 50 - فوري', price: '57.5', stock: '12', code: 'STC-50', date: '2026-04-17' }
    ];

    grid.innerHTML = products.map(p => `
        <div class="order-card">
            <div class="order-header">
                <div class="order-id">#${p.code}</div>
                <span class="order-status ${p.stock > 10 ? 'status-completed' : 'status-pending'}">
                    ${p.stock > 10 ? 'متوفر' : 'كمية منخفضة'}
                </span>
            </div>
            <div class="order-body">
                <div style="font-weight:800; font-size:1.1rem; color:#1a202c; margin-bottom:10px;">${p.name}</div>
                <div class="info-row">
                    <span class="info-label">المخزون:</span>
                    <span class="info-value" style="color:${p.stock < 10 ? '#e74c3c' : '#27ae60'}">${p.stock} قطعة</span>
                </div>
                <div class="order-finance">
                    <span class="finance-label">السعر</span>
                    <span class="finance-value">${p.price} <small>ريال</small></span>
                </div>
            </div>
            <div class="order-footer">
                <button class="btn-action"><i class="fas fa-edit"></i></button>
                <button class="btn-action" style="color:#e74c3c;"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

// دالة تهيئة المحرر
async function initFullEditor(elementId) {
    try {
        if (typeof ClassicEditor !== 'undefined') {
            await ClassicEditor.create(document.getElementById(elementId), {
                language: 'ar',
                direction: 'rtl'
            });
        }
    } catch (error) { console.error("Editor Error:", error); }
}

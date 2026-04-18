// js/modules/products.js

// مصفوفة المنتجات (ستعمل كقاعدة بيانات مؤقتة لحين ربط Firebase)
let productsData = [
    { id: Date.now(), name: 'سوا 100 - تقسيط', price: '115', stock: '45', code: 'STC-100', createdAt: '2026-04-18' },
    { id: Date.now() + 1, name: 'سوا 50 - فوري', price: '57.5', stock: '12', code: 'STC-50', createdAt: '2026-04-17' }
];

export async function initProducts(container) {
    console.log("استدعاء نظام المنتجات...");

    container.innerHTML = `
        <div class="products-wrapper" style="animation: fadeIn 0.4s ease;">
            
            <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
                <div>
                    <h2 style="font-weight:800; color:#1a202c; font-size:1.8rem;">إدارة المخزون والمنتجات</h2>
                    <p style="color:#64748b;">إدارة باقات منصة تيرا جيتواي</p>
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
                            <input type="text" id="p-name" required placeholder="مثلاً: بطاقة سوا 100 ريال" style="width:100%; padding:12px; border-radius:10px; border:1px solid #e2e8f0;">
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:8px; font-weight:700;">كود المنتج (SKU)</label>
                            <input type="text" id="p-code" required placeholder="SAWA-100" style="width:100%; padding:12px; border-radius:10px; border:1px solid #e2e8f0;">
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:20px; margin-bottom:20px;">
                        <div>
                            <label style="display:block; margin-bottom:8px; font-weight:700;">سعر البيع</label>
                            <input type="number" id="p-price" required placeholder="0.00" style="width:100%; padding:12px; border-radius:10px; border:1px solid #e2e8f0;">
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:8px; font-weight:700;">الكمية في المخزون</label>
                            <input type="number" id="p-stock" required placeholder="100" style="width:100%; padding:12px; border-radius:10px; border:1px solid #e2e8f0;">
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:8px; font-weight:700;">رابط فيديو (اختياري)</label>
                            <input type="url" id="p-video" placeholder="YouTube link" style="width:100%; padding:12px; border-radius:10px; border:1px solid #e2e8f0;">
                        </div>
                    </div>

                    <div style="margin-bottom:25px;">
                        <label style="display:block; margin-bottom:10px; font-weight:700;">وصف المنتج التفصيلي</label>
                        <textarea id="p-description"></textarea>
                    </div>

                    <div style="display:flex; justify-content:flex-end; gap:15px;">
                        <button type="reset" class="btn-action">تفريغ الحقول</button>
                        <button type="submit" class="btn-main" style="background:#1a202c; color:#fff; padding:15px 40px; border:none; border-radius:12px; cursor:pointer; font-weight:800;">حفظ المنتج ونشره</button>
                    </div>
                </form>
            </section>
        </div>
    `;

    // تهيئة الوظائف والمستمعات
    setTimeout(() => {
        initFullEditor('p-description');
        renderProductsList();
        setupFormHandler(); // تفعيل معالج النموذج
    }, 100);
}

// دالة عرض المنتجات من المصفوفة
function renderProductsList() {
    const grid = document.getElementById('products-list-grid');
    if (!grid) return;

    if (productsData.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:50px; color:#94a3b8;">لا توجد منتجات حالياً.</div>`;
        return;
    }

    grid.innerHTML = productsData.map(p => `
        <div class="order-card" id="card-${p.id}">
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
                    <span class="finance-label">السعر الإجمالي</span>
                    <span class="finance-value">${p.price} <small>ريال</small></span>
                </div>
            </div>
            <div class="order-footer">
                <button class="btn-action" onclick="alert('تعديل المنتج: ${p.id}')"><i class="fas fa-edit"></i></button>
                <button class="btn-action" style="color:#e74c3c;" onclick="deleteProduct(${p.id})"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

// دالة معالجة إرسال النموذج (الحفظ)
function setupFormHandler() {
    const form = document.getElementById('product-main-form');
    if (!form) return;

    form.onsubmit = (e) => {
        e.preventDefault();
        
        const newProduct = {
            id: Date.now(),
            name: document.getElementById('p-name').value,
            code: document.getElementById('p-code').value,
            price: document.getElementById('p-price').value,
            stock: document.getElementById('p-stock').value,
            createdAt: new Date().toLocaleDateString('en-GB')
        };

        // إضافة المنتج للمصفوفة
        productsData.unshift(newProduct);
        
        // تحديث القائمة فوراً
        renderProductsList();
        
        // تصفير النموذج
        form.reset();
        alert("تم حفظ المنتج بنجاح في منصة تيرا!");
    };
}

// دالة الحذف
window.deleteProduct = (id) => {
    if(confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
        productsData = productsData.filter(p => p.id !== id);
        renderProductsList();
    }
};

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

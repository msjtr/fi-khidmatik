// js/modules/products.js

export async function initProducts(container) {
    console.log("بدء تحميل واجهة إدارة المنتجات...");

    // هيكل الصفحة: يجمع بين نموذج الإضافة وعرض المنتجات
    container.innerHTML = `
        <div class="products-container" style="animation: fadeIn 0.4s ease-out;">
            
            <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">
                <div>
                    <h2 style="font-weight:800; color:#1a202c; font-size:1.6rem; margin:0;">إدارة المنتجات</h2>
                    <p style="color:#64748b; font-size:0.9rem; margin-top:5px;">إضافة وتعديل باقات ومنتجات منصة تيرا</p>
                </div>
                <button onclick="document.getElementById('add-product-form').scrollIntoView({behavior:'smooth'})" 
                        style="background:#e67e22; color:white; border:none; padding:12px 20px; border-radius:12px; font-weight:800; cursor:pointer; display:flex; align-items:center; gap:8px; box-shadow: 0 4px 12px rgba(230,126,34,0.15);">
                    <i class="fas fa-plus-circle"></i> إضافة منتج
                </button>
            </div>

            <div id="products-list-grid" class="orders-grid">
                <div style="grid-column: 1/-1; text-align:center; padding:40px; color:#94a3b8;">
                    <i class="fas fa-box-open fa-3x" style="display:block; margin-bottom:10px;"></i>
                    جاري جلب قائمة المنتجات...
                </div>
            </div>

            <hr style="margin:40px 0; border:0; border-top:2px dashed #e2e8f0;">

            <div id="add-product-form" class="editor-container" style="background:white; padding:30px; border-radius:20px; border:1px solid #f0f2f5; box-shadow: 0 10px 25px rgba(0,0,0,0.03);">
                <h3 style="font-weight:800; color:#1a202c; margin-bottom:20px; display:flex; align-items:center; gap:10px;">
                    <i class="fas fa-pen-nib" style="color:#e67e22;"></i> تفاصيل المنتج الجديد
                </h3>
                
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-bottom:20px;">
                    <div>
                        <label style="display:block; margin-bottom:8px; font-weight:700; color:#4a5568;">اسم المنتج / الباقة</label>
                        <input type="text" placeholder="مثلاً: باقة سوا 100" style="width:100%; padding:12px; border-radius:10px; border:1px solid #e2e8f0; font-family:inherit;">
                    </div>
                    <div>
                        <label style="display:block; margin-bottom:8px; font-weight:700; color:#4a5568;">السعر (ريال)</label>
                        <input type="number" placeholder="0.00" style="width:100%; padding:12px; border-radius:10px; border:1px solid #e2e8f0; font-family:inherit;">
                    </div>
                </div>

                <label style="display:block; margin-bottom:10px; font-weight:800; color:#4a5568;">وصف المنتج (يظهر للعميل):</label>
                <div id="editor-wrapper" style="min-height:300px;">
                    <textarea id="product-editor-target"></textarea>
                </div>
                
                <div style="margin-top:25px; display:flex; justify-content:flex-end;">
                    <button class="btn-main" style="padding:15px 40px; border-radius:12px; cursor:pointer;">حفظ المنتج ونشره</button>
                </div>
            </div>
        </div>
    `;

    // استدعاء المحرر وعرض قائمة تجريبية
    setTimeout(() => {
        initFullEditor('product-editor-target');
        renderDummyProducts(); // دالة لعرض منتجات تجريبية فوراً
    }, 100);
}

// دالة لعرض منتجات تجريبية للتأكد من ظهورها
function renderDummyProducts() {
    const grid = document.getElementById('products-list-grid');
    if (!grid) return;

    const dummyData = [
        { id: '101', name: 'باقة سوا 100', price: '115', status: 'نشط' },
        { id: '102', name: 'باقة سوا 50', price: '57.5', status: 'نشط' }
    ];

    grid.innerHTML = dummyData.map(item => `
        <div class="order-card" style="padding:0;">
            <div class="order-header">
                <div class="order-id"><i class="fas fa-tag"></i> ${item.id}</div>
                <span class="order-status status-completed">${item.status}</span>
            </div>
            <div class="order-body">
                <div class="customer-name" style="font-size:1.1rem; margin-bottom:15px;">${item.name}</div>
                <div class="order-finance">
                    <span class="finance-label">السعر الإجمالي</span>
                    <span class="finance-value">${item.price} <small>ريال</small></span>
                </div>
            </div>
            <div class="order-footer">
                <button class="btn-action"><i class="fas fa-edit"></i> تعديل</button>
                <button class="btn-action" style="color:#e74c3c;"><i class="fas fa-trash"></i> حذف</button>
            </div>
        </div>
    `).join('');
}

async function initFullEditor(elementId) {
    try {
        const editorElement = document.getElementById(elementId);
        if (!editorElement) return;

        if (typeof ClassicEditor !== 'undefined') {
            await ClassicEditor.create(editorElement, {
                language: 'ar',
                direction: 'rtl',
                toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'insertTable', 'undo', 'redo']
            });
            console.log("✅ CKEditor 5 جاهز");
        } else {
            console.warn("⚠️ لم يتم العثور على ClassicEditor");
        }
    } catch (error) {
        console.error("خطأ المحرر:", error);
    }
}

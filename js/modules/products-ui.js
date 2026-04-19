/**
 * js/modules/products-ui.js
 * دوال واجهة المستخدم للمنتجات
 */

export function showProductModal(mode = 'add', productData = null) {
    const modal = document.getElementById('product-modal');
    if (!modal) return;
    
    const title = document.getElementById('modal-title');
    const form = document.getElementById('product-form');
    
    if (!form) return;
    
    if (mode === 'add') {
        title.innerText = 'إضافة منتج جديد';
        form.reset();
        document.getElementById('edit-id').value = '';
    } else if (mode === 'edit' && productData) {
        title.innerText = 'تعديل المنتج';
        document.getElementById('edit-id').value = productData.id;
        document.getElementById('p-name').value = productData.name || '';
        document.getElementById('p-cost').value = productData.cost || 0;
        document.getElementById('p-price').value = productData.price || 0;
        document.getElementById('p-stock').value = productData.stock || 0;
    }
    
    modal.style.display = 'flex';
}

export function closeProductModal() {
    const modal = document.getElementById('product-modal');
    if (modal) modal.style.display = 'none';
}

export function renderProductsGrid(products) {
    const grid = document.getElementById('products-list-grid');
    if (!grid) return;
    
    if (!products || products.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 50px;">لا توجد منتجات</div>`;
        return;
    }
    
    grid.innerHTML = products.map(product => `
        <div class="product-card" style="background: white; border-radius: 12px; padding: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <h4>${product.name}</h4>
            <div>السعر: ${product.price} ر.س</div>
            <div>المخزون: ${product.stock}</div>
            <button class="edit-product" data-id="${product.id}" style="background: #f39c12; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">
                تعديل
            </button>
            <button class="delete-product" data-id="${product.id}" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">
                حذف
            </button>
        </div>
    `).join('');
}

// ===================== الدالة الرئيسية المطلوبة في main.js =====================

/**
 * تهيئة موديول المنتجات - الدالة الرئيسية
 */
export async function initProducts(container) {
    if (!container) return;
    
    // عرض واجهة المنتجات
    container.innerHTML = `
        <div style="padding: 25px; font-family: 'Tajawal', sans-serif;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-wrap: wrap; gap: 15px;">
                <h2 style="color: #2c3e50; margin: 0;">
                    <i class="fas fa-box" style="color: #e67e22;"></i> إدارة المنتجات
                </h2>
                <button id="add-product-btn" style="background: #e67e22; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">
                    <i class="fas fa-plus"></i> إضافة منتج
                </button>
            </div>
            
            <div style="margin-bottom: 20px;">
                <input type="text" id="search-products" placeholder="بحث عن منتج..." 
                       style="width: 100%; max-width: 300px; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
            </div>
            
            <div id="products-list-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
                <div style="grid-column: 1/-1; text-align: center; padding: 50px;">
                    <i class="fas fa-spinner fa-spin fa-2x" style="color: #e67e22;"></i>
                    <p>جاري تحميل المنتجات...</p>
                </div>
            </div>
        </div>
        
        <!-- مودال إضافة/تعديل منتج -->
        <div id="product-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center;">
            <div style="background: white; width: 90%; max-width: 500px; padding: 25px; border-radius: 12px;">
                <h3 id="modal-title" style="margin: 0 0 20px 0;">إضافة منتج جديد</h3>
                <form id="product-form">
                    <input type="hidden" id="edit-id">
                    <div style="margin-bottom: 15px;">
                        <label>اسم المنتج</label>
                        <input type="text" id="p-name" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                        <div>
                            <label>سعر التكلفة</label>
                            <input type="number" id="p-cost" step="0.01" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                        </div>
                        <div>
                            <label>سعر البيع</label>
                            <input type="number" id="p-price" step="0.01" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                        </div>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label>الكمية</label>
                        <input type="number" id="p-stock" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button type="submit" style="flex: 2; background: #27ae60; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer;">حفظ</button>
                        <button type="button" id="close-modal-btn" style="flex: 1; background: #95a5a6; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer;">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // ربط الأحداث
    const addBtn = document.getElementById('add-product-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => showProductModal());
    }
    
    const closeBtn = document.getElementById('close-modal-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeProductModal());
    }
    
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeProductModal();
        });
    }
    
    // عرض منتجات تجريبية
    const demoProducts = [
        { id: '1', name: 'منتج تجريبي 1', price: 100, stock: 10, cost: 80 },
        { id: '2', name: 'منتج تجريبي 2', price: 200, stock: 5, cost: 150 },
        { id: '3', name: 'منتج تجريبي 3', price: 50, stock: 20, cost: 40 }
    ];
    
    renderProductsGrid(demoProducts);
    
    // ربط أحداث التعديل والحذف
    document.querySelectorAll('.edit-product').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const product = demoProducts.find(p => p.id === id);
            if (product) showProductModal('edit', product);
        });
    });
    
    document.querySelectorAll('.delete-product').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
                btn.closest('.product-card')?.remove();
            }
        });
    });
    
    // البحث
    const searchInput = document.getElementById('search-products');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('.product-card');
            cards.forEach(card => {
                const title = card.querySelector('h4')?.innerText.toLowerCase() || '';
                card.style.display = title.includes(term) ? 'block' : 'none';
            });
        });
    }
}

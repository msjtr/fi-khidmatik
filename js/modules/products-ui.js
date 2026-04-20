/**
 * js/modules/products-ui.js
 * دوال واجهة المستخدم للمنتجات - تيرا جيتواي
 * @version 2.1.0
 */

// ===================== دوال مساعدة =====================

/**
 * منع هجمات XSS
 */
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * عرض إشعار منبثق
 */
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#2ecc71' : '#e74c3c'};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 10001;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        direction: rtl;
        font-family: 'Tajawal', sans-serif;
    `;
    notification.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i> ${message}`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

/**
 * تنسيق العملة
 */
function formatCurrency(amount) {
    var num = Number(amount) || 0;
    return num.toFixed(2) + ' ر.س';
}

/**
 * تحديد حالة المخزون
 */
function getStockStatus(stock) {
    var qty = Number(stock) || 0;
    if (qty <= 0) {
        return { label: 'نفد', color: '#e74c3c', icon: 'fa-times-circle' };
    } else if (qty <= 5) {
        return { label: 'قليل', color: '#e67e22', icon: 'fa-exclamation-triangle' };
    } else {
        return { label: 'متوفر', color: '#27ae60', icon: 'fa-check-circle' };
    }
}

// ===================== فتح وإغلاق المودال =====================

/**
 * فتح نافذة إضافة/تعديل منتج
 */
export function showProductModal(mode = 'add', productData = null) {
    const modal = document.getElementById('product-modal');
    if (!modal) return;
    
    const title = document.getElementById('modal-title');
    const form = document.getElementById('product-form');
    
    if (!form) return;
    
    if (mode === 'add') {
        title.innerText = '➕ إضافة منتج جديد';
        form.reset();
        document.getElementById('edit-id').value = '';
        document.getElementById('product-code').value = 'PROD-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    } else if (mode === 'edit' && productData) {
        title.innerText = '✏️ تعديل المنتج';
        document.getElementById('edit-id').value = productData.id || '';
        document.getElementById('product-code').value = productData.code || '';
        document.getElementById('product-name').value = productData.name || '';
        document.getElementById('product-price').value = productData.price || 0;
        document.getElementById('product-stock').value = productData.stock || 0;
        document.getElementById('product-description').value = productData.description || '';
        document.getElementById('product-image').value = productData.mainImage || '';
    }
    
    modal.style.display = 'flex';
}

/**
 * إغلاق نافذة المنتج
 */
export function closeProductModal() {
    const modal = document.getElementById('product-modal');
    if (modal) modal.style.display = 'none';
    
    const form = document.getElementById('product-form');
    if (form) form.reset();
    document.getElementById('edit-id').value = '';
}

// ===================== عرض المنتجات =====================

/**
 * عرض المنتجات في شبكة (Grid)
 * @param {Array} products - مصفوفة المنتجات
 */
export function renderProductsGrid(products) {
    const grid = document.getElementById('products-list-grid');
    if (!grid) return;
    
    if (!products || products.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #95a5a6;">
                <i class="fas fa-box-open fa-3x" style="margin-bottom: 15px; display: block;"></i>
                لا توجد منتجات مسجلة حالياً
                <button id="add-first-product" style="display: block; margin: 20px auto; background: #e67e22; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">
                    <i class="fas fa-plus"></i> إضافة أول منتج
                </button>
            </div>
        `;
        
        const addBtn = document.getElementById('add-first-product');
        if (addBtn) {
            addBtn.addEventListener('click', () => showProductModal());
        }
        return;
    }
    
    grid.innerHTML = products.map(product => {
        const status = getStockStatus(product.stock);
        const shortDescription = product.description ? product.description.replace(/<[^>]*>/g, '').substring(0, 100) : '';
        
        return `
            <div class="product-card" data-id="${product.id}" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: transform 0.2s, box-shadow 0.2s; border-right: 4px solid ${status.color};">
                ${product.mainImage ? `
                <div style="height: 160px; overflow: hidden; background: #f8f9fa;">
                    <img src="${escapeHtml(product.mainImage)}" alt="${escapeHtml(product.name)}" 
                         style="width: 100%; height: 100%; object-fit: cover;"
                         onerror="this.src='https://via.placeholder.com/300x160/e67e22/ffffff?text=Tera'">
                </div>
                ` : `
                <div style="height: 160px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-box fa-3x" style="color: white; opacity: 0.7;"></i>
                </div>
                `}
                
                <div style="padding: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                        <h4 style="margin: 0; color: #2c3e50; font-size: 1rem;">${escapeHtml(product.name)}</h4>
                        <span style="background: ${status.color}20; color: ${status.color}; padding: 2px 8px; border-radius: 12px; font-size: 0.7rem;">
                            <i class="fas ${status.icon}"></i> ${status.label}
                        </span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px;">
                        <span style="font-size: 1.2rem; font-weight: bold; color: #e67e22;">${formatCurrency(product.price)}</span>
                        <span style="color: #7f8c8d; font-size: 0.8rem;">
                            <i class="fas fa-warehouse"></i> المخزون: ${product.stock || 0}
                        </span>
                    </div>
                    
                    ${product.code ? `
                    <div style="margin-bottom: 10px;">
                        <span style="background: #f8f9fa; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; color: #95a5a6;">
                            <i class="fas fa-barcode"></i> ${escapeHtml(product.code)}
                        </span>
                    </div>
                    ` : ''}
                    
                    ${shortDescription ? `
                    <div style="margin-bottom: 15px;">
                        <p style="color: #7f8c8d; font-size: 0.8rem; margin: 0; line-height: 1.4;">${escapeHtml(shortDescription)}...</p>
                    </div>
                    ` : ''}
                    
                    <div style="display: flex; gap: 10px; margin-top: 10px; padding-top: 10px; border-top: 1px solid #f1f5f9;">
                        <button class="edit-product-btn" data-id="${product.id}" 
                                style="flex: 1; background: #f39c12; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; transition: 0.3s;">
                            <i class="fas fa-edit"></i> تعديل
                        </button>
                        <button class="delete-product-btn" data-id="${product.id}" 
                                style="flex: 1; background: #e74c3c; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; transition: 0.3s;">
                            <i class="fas fa-trash-alt"></i> حذف
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // ربط أحداث التعديل والحذف
    document.querySelectorAll('.edit-product-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const product = products.find(p => p.id === id);
            if (product) showProductModal('edit', product);
        });
    });
    
    document.querySelectorAll('.delete-product-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('⚠️ هل أنت متأكد من حذف هذا المنتج؟\nلا يمكن التراجع عن هذا الإجراء.')) {
                const id = btn.dataset.id;
                const index = products.findIndex(p => p.id === id);
                if (index !== -1) {
                    products.splice(index, 1);
                    renderProductsGrid(products);
                    showNotification('تم حذف المنتج بنجاح', 'success');
                }
            }
        });
    });
}

// ===================== الدالة الرئيسية لتهيئة الموديول =====================

/**
 * تهيئة موديول المنتجات - الدالة الرئيسية
 */
export async function initProducts(container) {
    if (!container) return;
    
    // عرض واجهة المنتجات
    container.innerHTML = `
        <div style="padding: 25px; font-family: 'Tajawal', sans-serif;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-wrap: wrap; gap: 15px;">
                <div>
                    <h2 style="color: #2c3e50; margin: 0;">
                        <i class="fas fa-box" style="color: #e67e22;"></i> 
                        إدارة المنتجات
                    </h2>
                    <p style="color: #7f8c8d; margin: 5px 0 0 0; font-size: 0.85rem;">
                        <i class="fas fa-warehouse"></i> إدارة المخزون والمنتجات
                    </p>
                </div>
                <button id="add-product-btn" style="background: #e67e22; color: white; border: none; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 10px rgba(230,126,34,0.3); transition: 0.3s;">
                    <i class="fas fa-plus"></i> إضافة منتج جديد
                </button>
            </div>
            
            <div style="margin-bottom: 20px; display: flex; gap: 15px; flex-wrap: wrap; align-items: center;">
                <div style="position: relative; flex: 1; max-width: 300px;">
                    <i class="fas fa-search" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #95a5a6;"></i>
                    <input type="text" id="search-products" placeholder="بحث عن منتج..." 
                           style="width: 100%; padding: 10px 35px 10px 12px; border: 1px solid #ddd; border-radius: 8px; font-family: 'Tajawal', sans-serif;">
                </div>
                <button id="refresh-products-btn" style="background: #3498db; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer;">
                    <i class="fas fa-sync-alt"></i> تحديث
                </button>
            </div>
            
            <div id="products-list-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
                <div style="grid-column: 1/-1; text-align: center; padding: 60px;">
                    <i class="fas fa-spinner fa-spin fa-2x" style="color: #e67e22;"></i>
                    <p style="margin-top: 10px;">جاري تحميل المنتجات...</p>
                </div>
            </div>
        </div>
        
        <!-- مودال إضافة/تعديل منتج -->
        <div id="product-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(4px);">
            <div style="background: white; width: 90%; max-width: 600px; padding: 25px; border-radius: 16px; box-shadow: 0 20px 35px rgba(0,0,0,0.2); max-height: 90vh; overflow-y: auto;">
                <h3 id="modal-title" style="margin: 0 0 20px 0; color: #2c3e50; border-bottom: 2px solid #e67e22; padding-bottom: 10px;">إضافة منتج جديد</h3>
                <form id="product-form">
                    <input type="hidden" id="edit-id">
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">رمز المنتج</label>
                        <input type="text" id="product-code" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">اسم المنتج *</label>
                        <input type="text" id="product-name" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">السعر *</label>
                            <input type="number" id="product-price" step="0.01" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: bold;">الكمية *</label>
                            <input type="number" id="product-stock" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">وصف المنتج</label>
                        <textarea id="product-description" rows="4" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-family: 'Tajawal', sans-serif;"></textarea>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">رابط الصورة</label>
                        <input type="url" id="product-image" placeholder="https://..." style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                        <div id="image-preview" style="margin-top: 10px; display: none;">
                            <img id="preview-img" style="max-width: 100px; max-height: 100px; border-radius: 8px;">
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 15px; margin-top: 25px;">
                        <button type="submit" style="flex: 2; background: #27ae60; color: white; border: none; padding: 12px; border-radius: 10px; cursor: pointer; font-weight: bold;">
                            <i class="fas fa-save"></i> حفظ المنتج
                        </button>
                        <button type="button" id="close-product-modal" style="flex: 1; background: #95a5a6; color: white; border: none; padding: 12px; border-radius: 10px; cursor: pointer; font-weight: bold;">
                            <i class="fas fa-times"></i> إلغاء
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // منتجات تجريبية (سيتم استبدالها ببيانات حقيقية من Firebase)
    const demoProducts = [
        {
            id: '1',
            code: 'PROD-KQ1136QX',
            name: 'الباقة المتقدمه فى تصميم المتاجر الإلكترونية',
            price: 1990,
            stock: 1993,
            description: 'تصميم وتطوير متجر إلكتروني احترافي متكامل يشمل إعداد المنتجات وربط بوابات الدفع وخيارات الشحن',
            mainImage: 'https://cdn.salla.sa/mQyBOY/cabff3f8-98a5-42f7-847c-2d2fcd863133-500x500-UizsmGhKsLFS1wm7UpSLrOtycvS9iwhf8ciHqkgV.jpg'
        },
        {
            id: '2',
            code: 'PROD-XY123456',
            name: 'باقة سوا 100',
            price: 100,
            stock: 50,
            description: 'باقة سوا 100 ريال للمكالمات والإنترنت',
            mainImage: ''
        }
    ];
    
    renderProductsGrid(demoProducts);
    
    // ربط الأحداث
    const addBtn = document.getElementById('add-product-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => showProductModal());
    }
    
    const closeBtn = document.getElementById('close-product-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeProductModal());
    }
    
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeProductModal();
        });
    }
    
    // معاينة الصورة
    const imageInput = document.getElementById('product-image');
    if (imageInput) {
        imageInput.addEventListener('input', (e) => {
            const preview = document.getElementById('image-preview');
            const previewImg = document.getElementById('preview-img');
            if (e.target.value && preview && previewImg) {
                previewImg.src = e.target.value;
                preview.style.display = 'block';
            } else if (preview) {
                preview.style.display = 'none';
            }
        });
    }
    
    // زر تحديث
    const refreshBtn = document.getElementById('refresh-products-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            renderProductsGrid(demoProducts);
            showNotification('تم تحديث القائمة', 'success');
        });
    }
    
    // البحث
    const searchInput = document.getElementById('search-products');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('.product-card');
            cards.forEach(card => {
                const name = card.querySelector('h4')?.innerText.toLowerCase() || '';
                if (name.includes(term)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
    
    // معالجة إرسال النموذج
    const form = document.getElementById('product-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-id').value;
            
            const productData = {
                code: document.getElementById('product-code').value,
                name: document.getElementById('product-name').value,
                price: parseFloat(document.getElementById('product-price').value),
                stock: parseInt(document.getElementById('product-stock').value),
                description: document.getElementById('product-description').value,
                mainImage: document.getElementById('product-image').value
            };
            
            if (id) {
                // تعديل منتج موجود
                const index = demoProducts.findIndex(p => p.id === id);
                if (index !== -1) {
                    demoProducts[index] = { ...demoProducts[index], ...productData };
                    showNotification('تم تحديث المنتج بنجاح', 'success');
                }
            } else {
                // إضافة منتج جديد
                const newProduct = { id: Date.now().toString(), ...productData };
                demoProducts.push(newProduct);
                showNotification('تم إضافة المنتج بنجاح', 'success');
            }
            
            closeProductModal();
            renderProductsGrid(demoProducts);
        });
    }
}

// ===================== تصدير الدوال =====================
export default {
    showProductModal,
    closeProductModal,
    renderProductsGrid,
    initProducts
};

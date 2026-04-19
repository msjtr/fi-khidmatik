/**
 * js/modules/products.js
 * موديول إدارة المنتجات والمخزون - تيرا جيتواي
 * الإصدار: 2.3 - دعم التعديل الشامل وتحسين الأداء
 */

import { db } from '../core/firebase.js';
import { 
    collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc,
    serverTimestamp, query, orderBy, where 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { calculateProductProfit, getStockStatus } from '../utils/calculations.js';
import { formatCurrency } from '../utils/formatter.js';

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
        bottom: 20px;
        right: 20px;
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
    
    setTimeout(() => {
        if (notification.parentNode) notification.remove();
    }, 3000);
}

/**
 * التحقق من صحة بيانات المنتج
 */
function validateProduct(product) {
    const errors = [];
    
    if (!product.name || product.name.trim().length < 3) {
        errors.push('اسم المنتج مطلوب (3 أحرف على الأقل)');
    }
    
    if (product.cost < 0) {
        errors.push('سعر التكلفة لا يمكن أن يكون سالباً');
    }
    
    if (product.price < 0) {
        errors.push('سعر البيع لا يمكن أن يكون سالباً');
    }
    
    if (product.price < product.cost) {
        errors.push('سعر البيع يجب أن يكون أكبر من أو يساوي سعر التكلفة');
    }
    
    if (product.stock < 0) {
        errors.push('الكمية لا يمكن أن تكون سالبة');
    }
    
    return errors;
}

// ===================== إدارة المنتجات =====================

/**
 * تحميل وعرض قائمة المنتجات
 */
async function fetchProducts() {
    const grid = document.getElementById('products-list-grid');
    const searchInput = document.getElementById('p-search');
    const searchVal = searchInput ? searchInput.value.toLowerCase() : "";
    
    if (!grid) return;
    
    // إظهار مؤشر تحميل
    grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding:50px;">
            <i class="fas fa-spinner fa-spin fa-2x" style="color:#e67e22;"></i>
            <p style="margin-top: 10px; color:#64748b;">جاري تحميل المنتجات...</p>
        </div>
    `;
    
    try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        
        if (snap.empty) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align:center; padding:50px;">
                    <i class="fas fa-box-open fa-3x" style="color:#cbd5e1; margin-bottom:15px; display:block;"></i>
                    <p style="color:#94a3b8;">لا يوجد منتجات في المستودع حالياً.</p>
                    <button onclick="window.openProductModal()" style="margin-top:15px; background:#e67e22; color:white; border:none; padding:10px 20px; border-radius:10px; cursor:pointer;">
                        <i class="fas fa-plus"></i> إضافة أول منتج
                    </button>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = "";
        
        snap.forEach(docSnap => {
            const product = docSnap.data();
            const productId = docSnap.id;
            
            // تطبيق البحث
            if (searchVal && !product.name.toLowerCase().includes(searchVal)) {
                return;
            }
            
            const profit = calculateProductProfit(product.cost, product.price);
            const status = getStockStatus(product.stock);
            
            const card = document.createElement('div');
            card.className = 'product-card';
            card.style.cssText = `
                background: white;
                border-radius: 18px;
                box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
                border-right: 5px solid ${status.color};
                overflow: hidden;
                transition: transform 0.3s ease, box-shadow 0.3s ease;
                cursor: pointer;
            `;
            
            card.innerHTML = `
                <div style="padding: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                        <div>
                            <h4 style="font-weight: 800; margin: 0; color: #1e293b; font-size: 1.1rem;">${escapeHtml(product.name)}</h4>
                            <span style="font-size: 0.75rem; color: ${status.color}; margin-top: 5px; display: inline-block;">
                                <i class="fas ${status.icon}"></i> ${status.text}
                            </span>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="edit-product-btn" data-id="${productId}" 
                                    style="background: #fef3c7; color: #d97706; border: none; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; transition: 0.3s;">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-product-btn" data-id="${productId}" 
                                    style="background: #fee2e2; color: #dc2626; border: none; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; transition: 0.3s;">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div style="margin: 15px 0; padding: 10px 0; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: #64748b;">سعر التكلفة:</span>
                            <span style="font-weight: 600; color: #475569;">${formatCurrency(product.cost)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: #64748b;">سعر البيع:</span>
                            <span style="font-weight: 700; color: #e67e22;">${formatCurrency(product.price)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #64748b;">الربح:</span>
                            <span style="font-weight: 600; color: ${profit >= 0 ? '#10b981' : '#ef4444'};">${formatCurrency(profit)}</span>
                        </div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <span style="font-size: 0.7rem; color: #94a3b8;">الكمية</span>
                            <div style="font-size: 1.2rem; font-weight: 800; color: ${status.color};">${product.stock}</div>
                        </div>
                        <div style="width: 60px; height: 60px; background: #f8fafc; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-tag" style="color: #e67e22; font-size: 1.5rem;"></i>
                        </div>
                    </div>
                </div>
            `;
            
            grid.appendChild(card);
        });
        
        // ربط الأحداث بعد إنشاء البطاقات
        attachProductEvents();
        
        // عرض رسالة إذا لم تكن هناك نتائج للبحث
        if (grid.children.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align:center; padding:50px;">
                    <i class="fas fa-search fa-3x" style="color:#cbd5e1; margin-bottom:15px; display:block;"></i>
                    <p style="color:#94a3b8;">لا توجد منتجات تطابق "${escapeHtml(searchVal)}"</p>
                </div>
            `;
        }
        
    } catch (error) {
        console.error("❌ Error fetching products:", error);
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding:50px; color:#dc2626;">
                <i class="fas fa-exclamation-triangle fa-2x" style="margin-bottom:10px; display:block;"></i>
                <p>حدث خطأ في تحميل المنتجات: ${error.message}</p>
                <button onclick="window.fetchProducts()" style="margin-top:10px; background:#e67e22; color:white; border:none; padding:8px 16px; border-radius:8px; cursor:pointer;">
                    <i class="fas fa-sync-alt"></i> إعادة المحاولة
                </button>
            </div>
        `;
        showNotification('فشل تحميل المنتجات', 'error');
    }
}

/**
 * ربط أحداث أزرار التعديل والحذف
 */
function attachProductEvents() {
    // أزرار التعديل
    document.querySelectorAll('.edit-product-btn').forEach(btn => {
        btn.removeEventListener('click', btn._editHandler);
        const handler = () => editProduct(btn.dataset.id);
        btn.addEventListener('click', handler);
        btn._editHandler = handler;
    });
    
    // أزرار الحذف
    document.querySelectorAll('.delete-product-btn').forEach(btn => {
        btn.removeEventListener('click', btn._deleteHandler);
        const handler = () => deleteProduct(btn.dataset.id);
        btn.addEventListener('click', handler);
        btn._deleteHandler = handler;
    });
}

// ===================== عمليات CRUD =====================

/**
 * حفظ المنتج (إضافة أو تعديل)
 */
async function saveProduct(productData, id = null) {
    const submitBtn = document.getElementById('save-btn');
    const originalText = submitBtn?.innerHTML;
    
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
    }
    
    try {
        const data = {
            name: productData.name.trim(),
            cost: parseFloat(productData.cost) || 0,
            price: parseFloat(productData.price) || 0,
            stock: parseInt(productData.stock) || 0,
            updatedAt: serverTimestamp()
        };
        
        // التحقق من صحة البيانات
        const errors = validateProduct(data);
        if (errors.length > 0) {
            showNotification(errors.join('\n'), 'error');
            return false;
        }
        
        if (id) {
            // تعديل منتج موجود
            await updateDoc(doc(db, "products", id), data);
            showNotification('تم تحديث المنتج بنجاح', 'success');
        } else {
            // إضافة منتج جديد
            data.createdAt = serverTimestamp();
            await addDoc(collection(db, "products"), data);
            showNotification('تم إضافة المنتج بنجاح', 'success');
        }
        
        closeProductModal();
        await fetchProducts();
        return true;
        
    } catch (error) {
        console.error("❌ Error saving product:", error);
        showNotification('حدث خطأ أثناء الحفظ: ' + error.message, 'error');
        return false;
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
}

/**
 * تعديل منتج
 */
async function editProduct(id) {
    if (!id) return;
    
    try {
        const snap = await getDoc(doc(db, "products", id));
        if (!snap.exists()) {
            showNotification('المنتج غير موجود', 'error');
            return;
        }
        
        const product = snap.data();
        
        // تعبئة الحقول
        document.getElementById('edit-id').value = id;
        document.getElementById('p-name').value = product.name || '';
        document.getElementById('p-cost').value = product.cost || 0;
        document.getElementById('p-price').value = product.price || 0;
        document.getElementById('p-stock').value = product.stock || 0;
        
        const titleEl = document.getElementById('modal-title');
        if (titleEl) titleEl.innerText = "✏️ تعديل المنتج";
        
        const modal = document.getElementById('product-modal');
        if (modal) modal.style.display = 'flex';
        
    } catch (error) {
        console.error("❌ Error loading product for edit:", error);
        showNotification('حدث خطأ في تحميل بيانات المنتج', 'error');
    }
}

/**
 * حذف منتج
 */
async function deleteProduct(id) {
    if (!confirm("⚠️ هل أنت متأكد من حذف هذا المنتج؟\nلا يمكن التراجع عن هذا الإجراء.")) {
        return;
    }
    
    try {
        await deleteDoc(doc(db, "products", id));
        showNotification('تم حذف المنتج بنجاح', 'success');
        await fetchProducts();
    } catch (error) {
        console.error("❌ Error deleting product:", error);
        showNotification('حدث خطأ أثناء الحذف: ' + error.message, 'error');
    }
}

// ===================== إدارة النافذة المنبثقة =====================

/**
 * فتح نافذة إضافة منتج جديد
 */
function openProductModal() {
    const form = document.getElementById('product-form');
    if (form) form.reset();
    
    document.getElementById('edit-id').value = '';
    document.getElementById('modal-title').innerText = "➕ إضافة منتج جديد";
    
    // تعبئة القيم الافتراضية
    document.getElementById('p-stock').value = 0;
    
    const modal = document.getElementById('product-modal');
    if (modal) modal.style.display = 'flex';
}

/**
 * إغلاق نافذة المنتج
 */
function closeProductModal() {
    const modal = document.getElementById('product-modal');
    if (modal) modal.style.display = 'none';
    
    // تنظيف النموذج
    const form = document.getElementById('product-form');
    if (form) form.reset();
    document.getElementById('edit-id').value = '';
}

/**
 * إعداد منطق النموذج
 */
function setupForm() {
    const form = document.getElementById('product-form');
    const modal = document.getElementById('product-modal');
    const searchInput = document.getElementById('p-search');
    
    if (!form) return;
    
    // حفظ المنتج
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('edit-id').value;
        const productData = {
            name: document.getElementById('p-name').value,
            cost: document.getElementById('p-cost').value,
            price: document.getElementById('p-price').value,
            stock: document.getElementById('p-stock').value
        };
        
        await saveProduct(productData, id || null);
    };
    
    // إغلاق المودال عند النقر خارج المحتوى
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeProductModal();
        });
    }
    
    // إغلاق بالضغط على ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal?.style.display === 'flex') {
            closeProductModal();
        }
    });
    
    // بحث مع تأخير (debounce)
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => fetchProducts(), 300);
        });
    }
}

// ===================== الدالة الرئيسية =====================

/**
 * تهيئة موديول المنتجات
 */
export async function initProducts(container) {
    if (!container) {
        console.error("❌ container غير موجود");
        return;
    }
    
    container.innerHTML = `
        <div class="products-container" style="padding:20px; font-family: 'Tajawal', sans-serif;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-wrap: wrap; gap: 15px;">
                <div>
                    <h2 style="font-weight: 800; color: #1a202c; margin: 0;">
                        <i class="fas fa-boxes" style="color: #e67e22;"></i> إدارة المستودع والمنتجات
                    </h2>
                    <p style="color: #64748b; margin: 5px 0 0 0;">نظام إدارة المنتجات والمخزون</p>
                </div>
                <button id="open-product-modal-btn" style="background: #e67e22; color: white; border: none; padding: 12px 25px; border-radius: 12px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 12px rgba(230,126,34,0.3); transition: 0.3s;">
                    <i class="fas fa-plus"></i> إضافة منتج جديد
                </button>
            </div>

            <div style="margin-bottom: 20px;">
                <div style="position: relative; max-width: 400px;">
                    <i class="fas fa-search" style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: #94a3b8;"></i>
                    <input type="text" id="p-search" placeholder="بحث باسم المنتج..." 
                        style="width: 100%; padding: 12px 40px 12px 15px; border-radius: 12px; border: 1px solid #e2e8f0; outline: none; transition: 0.3s; font-family: 'Tajawal', sans-serif;">
                </div>
            </div>

            <div id="products-list-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
                <div style="grid-column: 1/-1; text-align:center; padding:50px;">
                    <i class="fas fa-spinner fa-spin fa-2x" style="color:#e67e22;"></i>
                    <p style="margin-top:10px;">جاري تحميل المنتجات...</p>
                </div>
            </div>
        </div>

        <!-- مودال إضافة/تعديل منتج -->
        <div id="product-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(5px);">
            <div style="background: white; width: 90%; max-width: 550px; padding: 30px; border-radius: 24px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
                <h3 id="modal-title" style="margin-top: 0; margin-bottom: 25px; font-weight: 800; color: #1e293b;">بيانات المنتج</h3>
                <form id="product-form">
                    <input type="hidden" id="edit-id">
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #475569;">اسم المنتج *</label>
                        <input type="text" id="p-name" placeholder="مثال: سوا 100 ريال" required 
                            style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; box-sizing: border-box; font-family: 'Tajawal', sans-serif;">
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #475569;">سعر التكلفة</label>
                            <input type="number" id="p-cost" step="0.01" placeholder="0.00" required 
                                style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; box-sizing: border-box;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #475569;">سعر البيع</label>
                            <input type="number" id="p-price" step="0.01" placeholder="0.00" required 
                                style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; box-sizing: border-box;">
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 25px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #475569;">الكمية المتوفرة</label>
                        <input type="number" id="p-stock" placeholder="0" required 
                            style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; box-sizing: border-box;">
                    </div>
                    
                    <div style="display: flex; gap: 12px;">
                        <button type="submit" id="save-btn" 
                            style="flex: 2; padding: 15px; background: #1e293b; color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: bold; transition: 0.3s;">
                            <i class="fas fa-save"></i> حفظ البيانات
                        </button>
                        <button type="button" id="close-modal-btn" 
                            style="flex: 1; padding: 15px; background: #f1f5f9; color: #475569; border: none; border-radius: 12px; cursor: pointer; font-weight: 600;">
                            <i class="fas fa-times"></i> إلغاء
                        </button>
                    </div>
                </form>
            </div>
        </div>
        
        <style>
            .product-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
            }
            .edit-product-btn:hover, .delete-product-btn:hover {
                transform: scale(1.05);
            }
        </style>
    `;
    
    // ربط الأحداث
    const openBtn = document.getElementById('open-product-modal-btn');
    if (openBtn) {
        openBtn.onclick = openProductModal;
    }
    
    const closeBtn = document.getElementById('close-modal-btn');
    if (closeBtn) {
        closeBtn.onclick = closeProductModal;
    }
    
    setupForm();
    await fetchProducts();
}

// ===================== تصدير الدوال للاستخدام الخارجي =====================
export { fetchProducts, saveProduct, deleteProduct, editProduct, openProductModal, closeProductModal };

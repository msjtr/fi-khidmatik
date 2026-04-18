/**
 * js/modules/products.js
 * موديول إدارة المنتجات - منصة تيرا
 */

// استيراد قاعدة البيانات من المسار الصحيح حسب هيكل مشروعك
import { db } from '../core/firebase.js';

import { 
    collection, addDoc, getDocs, deleteDoc, doc, 
    serverTimestamp, query, orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// متغير لمحرر النصوص (CKEditor) إذا كنت تستخدمه في واجهة المنتجات
let editorInstance; 

/**
 * دالة تشغيل موديول المنتجات
 * @param {HTMLElement} container - الحاوية التي سيتم حقن الواجهة داخلها
 */
export async function initProducts(container) {
    // تحميل واجهة المنتجات من مجلد admin/modules/products.html
    try {
        const response = await fetch('./admin/modules/products.html');
        const html = await response.text();
        container.innerHTML = html;

        // بعد تحميل الواجهة، نبدأ بجلب البيانات وربط الأزرار
        console.log("تم تحميل واجهة المنتجات بنجاح.");
        
        fetchProducts(); 
        setupFormHandler(); 
        
    } catch (error) {
        console.error("خطأ في تحميل واجهة المنتجات:", error);
        container.innerHTML = `<p style="color:red; padding:20px;">حدث خطأ أثناء تحميل واجهة المنتجات.</p>`;
    }
}

/**
 * جلب المنتجات من Firestore وعرضها في الجدول أو الشبكة
 */
async function fetchProducts() {
    const grid = document.getElementById('products-list-grid'); // تأكد أن هذا ID موجود في products.html
    if (!grid) return;

    try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        
        grid.innerHTML = ""; // تنظيف الحاوية

        if (snapshot.empty) {
            grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:20px;">لا توجد باقات مضافة حالياً.</div>`;
            return;
        }

        snapshot.forEach((docSnap) => {
            const p = docSnap.data();
            const pId = docSnap.id;
            
            // بناء بطاقة المنتج بأسلوب تيرا النظيف
            grid.innerHTML += `
                <div class="order-card" style="border-top: 4px solid #e67e22;">
                    <div class="order-body" style="padding:15px;">
                        <h4 style="font-weight:800; margin-bottom:10px;">${p.name}</h4>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="color:#e67e22; font-weight:700;">${p.price} ريال</span>
                            <span style="font-size:0.85rem; color:#64748b;">المخزون: ${p.stock}</span>
                        </div>
                    </div>
                    <div class="order-footer" style="padding:10px; background:#f8fafc; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end;">
                        <button onclick="deleteProduct('${pId}')" style="color:#ef4444; background:none; border:none; cursor:pointer; font-size:0.9rem;">
                            <i class="fas fa-trash-alt"></i> حذف
                        </button>
                    </div>
                </div>`;
        });
    } catch (err) {
        console.error("خطأ في جلب البيانات:", err);
    }
}

/**
 * معالج إرسال النموذج لإضافة منتج جديد
 */
function setupFormHandler() {
    const form = document.getElementById('product-main-form');
    if (!form) return;

    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const saveBtn = document.getElementById('save-btn');
        if(saveBtn) saveBtn.disabled = true;

        try {
            await addDoc(collection(db, "products"), {
                name: document.getElementById('p-name').value,
                price: Number(document.getElementById('p-price').value),
                stock: Number(document.getElementById('p-stock').value),
                createdAt: serverTimestamp()
            });

            form.reset();
            fetchProducts();
            alert("تمت إضافة الباقة بنجاح إلى منصة تيرا.");
        } catch (err) {
            console.error("خطأ في الحفظ:", err);
            alert("فشل الحفظ، تأكد من إعدادات Firestore.");
        } finally {
            if(saveBtn) saveBtn.disabled = false;
        }
    };
}

/**
 * حذف منتج (متاحة عالمياً ليتم استدعاؤها من الـ HTML)
 */
window.deleteProduct = async (id) => {
    if (confirm("هل أنت متأكد من حذف هذه الباقة؟")) {
        try {
            await deleteDoc(doc(db, "products", id));
            fetchProducts();
        } catch (err) {
            console.error("خطأ في الحذف:", err);
        }
    }
};

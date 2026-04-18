// js/modules/products.js
import { db } from '../firebase-config.js'; 
import { 
    collection, addDoc, getDocs, deleteDoc, doc, 
    serverTimestamp, query, orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let editorInstance; 

export async function initProducts(container) {
    console.log("products.js: تم استدعاء وحدة المنتجات بنجاح.");

    container.innerHTML = `
        <div class="products-wrapper" style="animation: fadeIn 0.4s ease;">
            <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
                <div>
                    <h2 style="font-weight:800; color:#1a202c; font-size:1.8rem;">إدارة منتجات تيرا</h2>
                    <p style="color:#64748b;">التحكم في باقات سوا والمخزون المباشر</p>
                </div>
                <button onclick="document.getElementById('product-form-section').scrollIntoView({behavior:'smooth'})" 
                        class="btn-main" style="background:#e67e22; color:white; border:none; padding:12px 25px; border-radius:12px; font-weight:800; cursor:pointer;">
                    <i class="fas fa-plus-circle"></i> إضافة منتج جديد
                </button>
            </div>

            <div id="products-list-grid" class="orders-grid">
                <div style="grid-column: 1/-1; text-align:center; padding:50px;">
                    <i class="fas fa-circle-notch fa-spin fa-2x" style="color:#e67e22;"></i>
                    <p style="margin-top:15px; color:#64748b;">جاري تحديث قائمة المنتجات...</p>
                </div>
            </div>

            <hr style="margin:50px 0; border:0; border-top:2px dashed #e2e8f0;">

            <section id="product-form-section" class="order-card" style="padding:30px; background:#fff; border-radius:20px; border:1px solid #f1f5f9;">
                <h3 style="font-weight:800; color:#1a202c; margin-bottom:25px; border-right:4px solid #e67e22; padding-right:15px;">بيانات المنتج الجديد</h3>
                
                <form id="product-main-form">
                    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:20px; margin-bottom:20px;">
                        <div>
                            <label style="font-weight:700; display:block; margin-bottom:8px;">اسم المنتج</label>
                            <input type="text" id="p-name" required placeholder="مثلاً: باقة سوا 100 ريال" style="width:100%; padding:12px; border-radius:10px; border:1px solid #e2e8f0;">
                        </div>
                        <div>
                            <label style="font-weight:700; display:block; margin-bottom:8px;">كود المنتج (SKU)</label>
                            <input type="text" id="p-code" required placeholder="STC-100" style="width:100%; padding:12px; border-radius:10px; border:1px solid #e2e8f0;">
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:20px; margin-bottom:20px;">
                        <div>
                            <label style="font-weight:700; display:block; margin-bottom:8px;">السعر الإجمالي</label>
                            <input type="number" id="p-price" required placeholder="115" style="width:100%; padding:12px; border-radius:10px; border:1px solid #e2e8f0;">
                        </div>
                        <div>
                            <label style="font-weight:700; display:block; margin-bottom:8px;">الكمية المتوفرة</label>
                            <input type="number" id="p-stock" required placeholder="100" style="width:100%; padding:12px; border-radius:10px; border:1px solid #e2e8f0;">
                        </div>
                        <div>
                            <label style="font-weight:700; display:block; margin-bottom:8px;">رابط الصورة</label>
                            <input type="url" id="p-img" placeholder="https://..." style="width:100%; padding:12px; border-radius:10px; border:1px solid #e2e8f0;">
                        </div>
                    </div>

                    <div style="margin-bottom:25px;">
                        <label style="font-weight:700; display:block; margin-bottom:10px;">وصف المنتج التفصيلي</label>
                        <textarea id="p-description"></textarea>
                    </div>

                    <div style="display:flex; justify-content:flex-end; gap:15px;">
                        <button type="submit" id="save-btn" class="btn-main" style="background:#1a202c; color:#fff; padding:15px 45px; border-radius:12px; cursor:pointer; font-weight:800; border:none;">
                            حفظ المنتج ونشره
                        </button>
                    </div>
                </form>
            </section>
        </div>
    `;

    setTimeout(() => {
        initFullEditor('p-description');
        fetchProducts(); 
        setupFormHandler(); 
    }, 100);
}

async function fetchProducts() {
    const grid = document.getElementById('products-list-grid');
    if (!grid) return;

    try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:#94a3b8;">لا توجد منتجات مسجلة حالياً.</div>`;
            return;
        }

        grid.innerHTML = "";
        snapshot.forEach((docSnap) => {
            const p = docSnap.data();
            grid.innerHTML += `
                <div class="order-card">
                    <div style="height:150px; background:#f8fafc; overflow:hidden; display:flex; align-items:center; justify-content:center;">
                        ${p.mainImage ? `<img src="${p.mainImage}" style="width:100%; height:100%; object-fit:cover;">` : `<i class="fas fa-image fa-2x" style="color:#cbd5e1;"></i>`}
                    </div>
                    <div class="order-body" style="padding:15px;">
                        <div style="display:flex; justify-content:space-between;">
                            <span style="font-size:0.7rem; font-weight:800; color:#e67e22;">#${p.code}</span>
                            <span class="order-status ${p.stock > 0 ? 'status-completed' : 'status-cancelled'}">
                                ${p.stock > 0 ? 'متوفر' : 'منتهي'}
                            </span>
                        </div>
                        <h4 style="margin:10px 0; font-weight:800;">${p.name}</h4>
                        <div class="order-finance">
                            <span class="finance-label">السعر</span>
                            <span class="finance-value">${p.price} <small>SAR</small></span>
                        </div>
                    </div>
                    <div class="order-footer" style="padding:10px;">
                        <button class="btn-action" style="flex:1;" onclick="deleteProduct('${docSnap.id}')">
                            <i class="fas fa-trash-alt" style="color:#e74c3c;"></i> حذف
                        </button>
                    </div>
                </div>`;
        });
    } catch (err) {
        console.error("Fetch Error:", err);
    }
}

function setupFormHandler() {
    const form = document.getElementById('product-main-form');
    if (!form) return;

    form.onsubmit = async (e) => {
        e.preventDefault();
        const btn = document.getElementById('save-btn');
        btn.disabled = true;

        try {
            await addDoc(collection(db, "products"), {
                name: document.getElementById('p-name').value,
                code: document.getElementById('p-code').value,
                price: Number(document.getElementById('p-price').value),
                stock: Number(document.getElementById('p-stock').value),
                mainImage: document.getElementById('p-img').value || "",
                description: editorInstance ? editorInstance.getData() : "",
                createdAt: serverTimestamp()
            });

            form.reset();
            if(editorInstance) editorInstance.setData('');
            fetchProducts();
            alert("تم الحفظ!");
        } catch (err) {
            console.error(err);
        } finally {
            btn.disabled = false;
        }
    };
}

window.deleteProduct = async (id) => {
    if (confirm("هل تريد حذف المنتج؟")) {
        try {
            await deleteDoc(doc(db, "products", id));
            fetchProducts();
        } catch (err) { console.error(err); }
    }
};

async function initFullEditor(elementId) {
    if (typeof ClassicEditor !== 'undefined') {
        ClassicEditor.create(document.getElementById(elementId), { language: 'ar', direction: 'rtl' })
            .then(editor => { editorInstance = editor; });
    }
}

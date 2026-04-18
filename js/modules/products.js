// js/modules/products.js
// تعديل المسار ليناسب GitHub Pages وتجنب خطأ 404
import { db } from '/fi-khidmatik/js/firebase-config.js'; 

import { 
    collection, addDoc, getDocs, deleteDoc, doc, 
    serverTimestamp, query, orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let editorInstance; 

export async function initProducts(container) {
    console.log("products.js: جاري محاولة الربط بالقاعدة...");

    container.innerHTML = `
        <div class="products-wrapper" style="animation: fadeIn 0.4s ease;">
            <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
                <div>
                    <h2 style="font-weight:800; color:#1a202c; font-size:1.8rem;">إدارة المنتجات</h2>
                    <p style="color:#64748b;">منصة تيرا - الربط المباشر بـ Firestore</p>
                </div>
                <button onclick="document.getElementById('product-form-section').scrollIntoView({behavior:'smooth'})" 
                        class="btn-main" style="background:#e67e22; color:white; border:none; padding:12px 25px; border-radius:12px; font-weight:800; cursor:pointer;">
                    <i class="fas fa-plus-circle"></i> إضافة منتج جديد
                </button>
            </div>

            <div id="products-list-grid" class="orders-grid">
                <div style="grid-column: 1/-1; text-align:center; padding:50px;">
                    <i class="fas fa-circle-notch fa-spin fa-2x" style="color:#e67e22;"></i>
                    <p style="margin-top:15px; color:#64748b;">جاري استدعاء البيانات...</p>
                </div>
            </div>

            <hr style="margin:50px 0; border:0; border-top:2px dashed #e2e8f0;">

            <section id="product-form-section" class="order-card" style="padding:30px; background:#fff; border-radius:20px; border:1px solid #f1f5f9;">
                <h3 style="font-weight:800; color:#1a202c; margin-bottom:25px; border-right:4px solid #e67e22; padding-right:15px;">إدخال منتج جديد</h3>
                <form id="product-main-form">
                    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:20px; margin-bottom:20px;">
                        <div>
                            <label style="font-weight:700;">اسم المنتج</label>
                            <input type="text" id="p-name" required class="form-input" style="width:100%; padding:12px; border:1px solid #e2e8f0; border-radius:10px;">
                        </div>
                        <div>
                            <label style="font-weight:700;">كود SKU</label>
                            <input type="text" id="p-code" required class="form-input" style="width:100%; padding:12px; border:1px solid #e2e8f0; border-radius:10px;">
                        </div>
                    </div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:20px; margin-bottom:20px;">
                        <div>
                            <label style="font-weight:700;">السعر</label>
                            <input type="number" id="p-price" required style="width:100%; padding:12px; border:1px solid #e2e8f0; border-radius:10px;">
                        </div>
                        <div>
                            <label style="font-weight:700;">الكمية</label>
                            <input type="number" id="p-stock" required style="width:100%; padding:12px; border:1px solid #e2e8f0; border-radius:10px;">
                        </div>
                        <div>
                            <label style="font-weight:700;">رابط الصورة</label>
                            <input type="url" id="p-img" style="width:100%; padding:12px; border:1px solid #e2e8f0; border-radius:10px;">
                        </div>
                    </div>
                    <div style="margin-bottom:25px;">
                        <label style="font-weight:700;">الوصف</label>
                        <textarea id="p-description"></textarea>
                    </div>
                    <div style="display:flex; justify-content:flex-end;">
                        <button type="submit" id="save-btn" class="btn-main" style="background:#1a202c; color:#fff; padding:15px 45px; border-radius:12px; border:none; cursor:pointer;">حفظ المنتج</button>
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
        grid.innerHTML = "";
        if (snapshot.empty) {
            grid.innerHTML = `<p style="grid-column:1/-1; text-align:center;">لا يوجد منتجات.</p>`;
            return;
        }
        snapshot.forEach((docSnap) => {
            const p = docSnap.data();
            grid.innerHTML += `
                <div class="order-card">
                    <div class="order-body" style="padding:15px;">
                        <h4 style="font-weight:800;">${p.name}</h4>
                        <p style="color:#e67e22; font-weight:700;">${p.price} SAR</p>
                        <p style="font-size:0.8rem;">المخزون: ${p.stock}</p>
                    </div>
                    <div class="order-footer">
                        <button onclick="deleteProduct('${docSnap.id}')" style="color:red; border:none; background:none; cursor:pointer;">حذف</button>
                    </div>
                </div>`;
        });
    } catch (err) { console.error("Error:", err); }
}

function setupFormHandler() {
    const form = document.getElementById('product-main-form');
    if (!form) return;
    form.onsubmit = async (e) => {
        e.preventDefault();
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
            fetchProducts();
            alert("تم الحفظ!");
        } catch (err) { alert("خطأ في الحفظ"); }
    };
}

window.deleteProduct = async (id) => {
    if (confirm("حذف؟")) {
        await deleteDoc(doc(db, "products", id));
        fetchProducts();
    }
};

async function initFullEditor(elementId) {
    if (typeof ClassicEditor !== 'undefined') {
        ClassicEditor.create(document.getElementById(elementId), { language: 'ar', direction: 'rtl' })
            .then(editor => { editorInstance = editor; });
    }
}

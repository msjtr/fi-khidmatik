import { db } from '../core/firebase.js';
import { 
    collection, addDoc, getDocs, doc, updateDoc, deleteDoc, 
    query, orderBy, serverTimestamp, getDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * موديول إدارة المنتجات المتطور - تيرا جيتواي
 * يدعم المعرض، الفيديو، والوصف التفصيلي
 */

export async function initProducts(container) {
    container.innerHTML = `
        <div class="products-mgmt" dir="rtl" style="font-family: 'Tajawal', sans-serif; padding:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">
                <h2 style="color:#2c3e50; margin:0;"><i class="fas fa-boxes" style="color:#e67e22; margin-left:10px;"></i> إدارة المنتجات والمخزون</h2>
                <button id="btn-add-product" style="background:#e67e22; color:white; border:none; padding:12px 25px; border-radius:10px; cursor:pointer; font-weight:bold; box-shadow:0 4px 12px rgba(230,126,34,0.2);">
                    <i class="fas fa-plus-circle"></i> إضافة منتج جديد
                </button>
            </div>

            <div id="products-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:20px;">
                <div style="grid-column:1/-1; text-align:center; padding:50px; color:#95a5a6;">جاري تحميل المستودع...</div>
            </div>
        </div>

        <div id="product-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; overflow-y:auto; padding:20px;">
            <div style="background:white; max-width:900px; margin:10px auto; border-radius:15px; padding:30px; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
                <h3 id="modal-title" style="color:#e67e22; margin-top:0; border-bottom:2px solid #f1f2f6; padding-bottom:15px;">بيانات المنتج التقنية</h3>
                
                <form id="product-form">
                    <input type="hidden" id="edit-id">
                    
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-top:20px;">
                        <div style="grid-column: span 2; display:grid; grid-template-columns: 2fr 1fr; gap:15px;">
                            <div>
                                <label style="display:block; margin-bottom:5px; font-weight:bold;">اسم المنتج</label>
                                <input type="text" id="p-name" required style="width:100%; padding:12px; border:1px solid #ddd; border-radius:8px;">
                            </div>
                            <div>
                                <label style="display:block; margin-bottom:5px; font-weight:bold;">كود SKU</label>
                                <input type="text" id="p-code" placeholder="TR-XXXX" style="width:100%; padding:12px; border:1px solid #ddd; border-radius:8px;">
                            </div>
                        </div>

                        <div>
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">سعر البيع (ريال)</label>
                            <input type="number" id="p-price" step="0.01" required style="width:100%; padding:12px; border:1px solid #ddd; border-radius:8px;">
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">الكمية المتوفرة</label>
                            <input type="number" id="p-stock" required style="width:100%; padding:12px; border:1px solid #ddd; border-radius:8px;">
                        </div>

                        <div style="grid-column: span 2;">
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">رابط الصورة الرئيسية</label>
                            <input type="url" id="p-main-image" placeholder="https://..." style="width:100%; padding:12px; border:1px solid #ddd; border-radius:8px;">
                        </div>
                        
                        <div>
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">صور المعرض (روابط مفصولة بفاصلة)</label>
                            <textarea id="p-gallery" rows="2" style="width:100%; padding:12px; border:1px solid #ddd; border-radius:8px; font-family:sans-serif;"></textarea>
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">رابط الفيديو (YouTube/MP4)</label>
                            <input type="url" id="p-video" style="width:100%; padding:12px; border:1px solid #ddd; border-radius:8px;">
                        </div>

                        <div style="grid-column: span 2;">
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">وصف المنتج (HTML يدوي)</label>
                            <textarea id="p-desc" rows="4" style="width:100%; padding:12px; border:1px solid #ddd; border-radius:8px;"></textarea>
                        </div>
                    </div>

                    <div style="margin-top:30px; display:flex; gap:15px;">
                        <button type="submit" style="flex:2; background:#2ecc71; color:white; padding:15px; border:none; border-radius:10px; cursor:pointer; font-weight:bold; font-size:1.1rem;">حفظ المنتج في المخزن</button>
                        <button type="button" id="close-modal" style="flex:1; background:#95a5a6; color:white; border:none; border-radius:10px; cursor:pointer;">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    setupProductLogic();
    await loadProducts();
}

async function loadProducts() {
    const grid = document.getElementById('products-grid');
    const snap = await getDocs(query(collection(db, "products"), orderBy("createdAt", "desc")));
    
    if (snap.empty) {
        grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:50px;">لا توجد منتجات معروضة حالياً.</div>`;
        return;
    }

    grid.innerHTML = snap.docs.map(doc => {
        const p = doc.data();
        const stockStatus = p.stock > 0 ? 
            `<span style="color:#27ae60;"><i class="fas fa-check-circle"></i> متوفر (${p.stock})</span>` : 
            `<span style="color:#e74c3c;"><i class="fas fa-times-circle"></i> نافد</span>`;

        return `
            <div class="product-card" style="background:white; border-radius:15px; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.05); border:1px solid #eee; display:flex; flex-direction:column;">
                <div style="height:180px; background:#f8f9fa; background-image:url('${p.mainImage || 'https://via.placeholder.com/300x180?text=No+Image'}'); background-size:cover; background-position:center;"></div>
                <div style="padding:15px; flex-grow:1;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <span style="font-size:0.8rem; color:#95a5a6;">${p.code || 'بدون كود'}</span>
                        <div style="display:flex; gap:5px;">
                            <button onclick="window.editProduct('${doc.id}')" style="background:none; border:none; color:#f39c12; cursor:pointer;"><i class="fas fa-edit"></i></button>
                            <button onclick="window.deleteProduct('${doc.id}')" style="background:none; border:none; color:#e74c3c; cursor:pointer;"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                    <h3 style="margin:10px 0; color:#2c3e50; font-size:1.1rem;">${p.name}</h3>
                    <div style="font-size:1.2rem; font-weight:bold; color:#e67e22; margin-bottom:10px;">${parseFloat(p.price).toFixed(2)} ريال</div>
                    <div style="font-size:0.9rem; margin-top:auto;">${stockStatus}</div>
                </div>
            </div>
        `;
    }).join('');
}

function setupProductLogic() {
    const modal = document.getElementById('product-modal');
    
    document.getElementById('btn-add-product').onclick = () => {
        document.getElementById('product-form').reset();
        document.getElementById('edit-id').value = '';
        document.getElementById('modal-title').innerText = "إضافة منتج جديد للمخزن";
        modal.style.display = 'block';
    };

    document.getElementById('close-modal').onclick = () => modal.style.display = 'none';

    document.getElementById('product-form').onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-id').value;
        
        // تحويل روابط الصور من نص إلى مصفوفة
        const galleryRaw = document.getElementById('p-gallery').value;
        const galleryArray = galleryRaw ? galleryRaw.split(',').map(item => item.trim()) : [];

        const data = {
            name: document.getElementById('p-name').value,
            code: document.getElementById('p-code').value,
            price: parseFloat(document.getElementById('p-price').value),
            stock: parseInt(document.getElementById('p-stock').value),
            mainImage: document.getElementById('p-main-image').value,
            galleryImages: galleryArray,
            video: document.getElementById('p-video').value,
            description: document.getElementById('p-desc').value,
            updatedAt: serverTimestamp()
        };

        try {
            if (id) {
                await updateDoc(doc(db, "products", id), data);
            } else {
                data.createdAt = serverTimestamp();
                await addDoc(collection(db, "products"), data);
            }
            modal.style.display = 'none';
            loadProducts();
        } catch (err) {
            console.error("Error saving product:", err);
            alert("حدث خطأ أثناء حفظ المنتج");
        }
    };
}

// الوظائف العالمية للتعامل مع الـ DOM
window.editProduct = async (id) => {
    const snap = await getDoc(doc(db, "products", id));
    if (snap.exists()) {
        const p = snap.data();
        document.getElementById('edit-id').value = id;
        document.getElementById('p-name').value = p.name || '';
        document.getElementById('p-code').value = p.code || '';
        document.getElementById('p-price').value = p.price || 0;
        document.getElementById('p-stock').value = p.stock || 0;
        document.getElementById('p-main-image').value = p.mainImage || '';
        document.getElementById('p-gallery').value = (p.galleryImages || []).join(', ');
        document.getElementById('p-video').value = p.video || '';
        document.getElementById('p-desc').value = p.description || '';
        
        document.getElementById('modal-title').innerText = "تعديل بيانات المنتج";
        document.getElementById('product-modal').style.display = 'block';
    }
};

window.deleteProduct = async (id) => {
    if (confirm("سيتم حذف المنتج نهائياً من المستودع، هل أنت متأكد؟")) {
        await deleteDoc(doc(db, "products", id));
        loadProducts();
    }
};

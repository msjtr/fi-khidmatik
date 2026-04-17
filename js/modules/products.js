import { db } from '../core/firebase.js';
import { 
    collection, addDoc, getDocs, doc, updateDoc, deleteDoc, 
    query, orderBy, serverTimestamp, getDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let productEditor; // متغير محرر CKEditor

export async function initProducts(container) {
    container.innerHTML = `
        <div class="products-mgmt" dir="rtl" style="font-family: 'Tajawal', sans-serif; padding:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">
                <h2 style="color:#2c3e50; margin:0;"><i class="fas fa-boxes" style="color:#e67e22; margin-left:10px;"></i> مستودع تيرا جيتواي</h2>
                <button id="btn-add-product" style="background:#e67e22; color:white; border:none; padding:12px 25px; border-radius:10px; cursor:pointer; font-weight:bold; box-shadow:0 4px 12px rgba(230,126,34,0.2);">
                    <i class="fas fa-plus-circle"></i> إضافة منتج جديد
                </button>
            </div>

            <div id="products-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:20px;">
                <div style="grid-column:1/-1; text-align:center; padding:50px; color:#95a5a6;">جاري جلب بيانات المستودع...</div>
            </div>
        </div>

        <div id="product-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; overflow-y:auto; padding:20px;">
            <div style="background:white; max-width:900px; margin:10px auto; border-radius:15px; padding:30px; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
                <h3 id="modal-title" style="color:#e67e22; border-bottom:2px solid #f1f2f6; padding-bottom:15px;">بيانات المنتج</h3>
                
                <form id="product-form">
                    <input type="hidden" id="edit-id">
                    
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-top:20px;">
                        <input type="text" id="p-name" placeholder="اسم المنتج" required style="grid-column: span 2; padding:12px; border:1px solid #ddd; border-radius:8px;">
                        <input type="text" id="p-code" placeholder="كود SKU" style="padding:12px; border:1px solid #ddd; border-radius:8px;">
                        <input type="number" id="p-price" placeholder="سعر البيع" step="0.01" required style="padding:12px; border:1px solid #ddd; border-radius:8px;">
                        <input type="number" id="p-stock" placeholder="الكمية المتوفرة" required style="padding:12px; border:1px solid #ddd; border-radius:8px;">
                        <input type="url" id="p-main-image" placeholder="رابط الصورة الرئيسية" style="grid-column: span 2; padding:12px; border:1px solid #ddd; border-radius:8px;">
                        
                        <div style="grid-column: span 2; margin-top:10px;">
                            <label style="font-weight:bold; display:block; margin-bottom:10px;">وصف المنتج:</label>
                            <div id="p-desc-editor"></div>
                        </div>
                    </div>

                    <div style="margin-top:25px; display:flex; gap:15px;">
                        <button type="submit" style="flex:2; background:#2ecc71; color:white; padding:15px; border:none; border-radius:10px; font-weight:bold; cursor:pointer;">حفظ المنتج</button>
                        <button type="button" id="close-modal" style="flex:1; background:#95a5a6; color:white; border:none; border-radius:10px; cursor:pointer;">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // تهيئة محرر CKEditor
    await initCKEditor();
    setupProductLogic();
    await loadProducts();
}

async function initCKEditor() {
    try {
        productEditor = await ClassicEditor.create(document.querySelector('#p-desc-editor'), {
            language: 'ar',
            toolbar: ['bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'insertTable', 'undo', 'redo'],
            contentDirection: 'rtl'
        });
    } catch (error) {
        console.error("خطأ في تشغيل المحرر:", error);
    }
}

async function loadProducts() {
    const grid = document.getElementById('products-grid');
    const snap = await getDocs(query(collection(db, "products"), orderBy("createdAt", "desc")));
    
    // صورة احتياطية في حال تعطل الرابط
    const defaultImg = "https://placehold.jp/24/e67e22/ffffff/300x180.png?text=Tera+Gateway";

    grid.innerHTML = snap.docs.map(doc => {
        const p = doc.data();
        return `
            <div class="product-card" style="background:white; border-radius:12px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.05); border:1px solid #eee;">
                <div style="height:160px; background:url('${p.mainImage || defaultImg}') center/cover;"></div>
                <div style="padding:15px;">
                    <h4 style="margin:0; color:#2c3e50;">${p.name}</h4>
                    <div style="color:#e67e22; font-weight:bold; margin-top:5px;">${parseFloat(p.price).toFixed(2)} ريال</div>
                    <div style="margin-top:15px; display:flex; gap:10px;">
                        <button onclick="window.editProduct('${doc.id}')" style="flex:1; background:#f1f2f6; border:none; padding:8px; border-radius:5px; cursor:pointer;"><i class="fas fa-edit"></i></button>
                        <button onclick="window.deleteProduct('${doc.id}')" style="flex:1; background:#fff5f5; border:none; color:#e74c3c; padding:8px; border-radius:5px; cursor:pointer;"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>`;
    }).join('');
}

function setupProductLogic() {
    const modal = document.getElementById('product-modal');
    
    document.getElementById('btn-add-product').onclick = () => {
        document.getElementById('product-form').reset();
        if (productEditor) productEditor.setData('');
        document.getElementById('edit-id').value = '';
        modal.style.display = 'block';
    };

    document.getElementById('close-modal').onclick = () => modal.style.display = 'none';

    document.getElementById('product-form').onsubmit = async (e) => {
        e.preventDefault();
        
        // جلب البيانات من محرر CKEditor
        const descriptionHtml = productEditor ? productEditor.getData() : '';

        const data = {
            name: document.getElementById('p-name').value,
            code: document.getElementById('p-code').value,
            price: parseFloat(document.getElementById('p-price').value),
            stock: parseInt(document.getElementById('p-stock').value),
            mainImage: document.getElementById('p-main-image').value,
            description: descriptionHtml,
            updatedAt: serverTimestamp()
        };

        const id = document.getElementById('edit-id').value;
        try {
            if (id) {
                await updateDoc(doc(db, "products", id), data);
            } else {
                data.createdAt = serverTimestamp();
                await addDoc(collection(db, "products"), data);
            }
            modal.style.display = 'none';
            loadProducts();
        } catch (error) {
            console.error("Error saving:", error);
            alert("حدث خطأ أثناء الحفظ");
        }
    };
}

window.editProduct = async (id) => {
    const snap = await getDoc(doc(db, "products", id));
    if (snap.exists()) {
        const p = snap.data();
        document.getElementById('edit-id').value = id;
        document.getElementById('p-name').value = p.name;
        document.getElementById('p-code').value = p.code || '';
        document.getElementById('p-price').value = p.price;
        document.getElementById('p-stock').value = p.stock;
        document.getElementById('p-main-image').value = p.mainImage || '';
        
        if (productEditor) productEditor.setData(p.description || '');
        
        document.getElementById('product-modal').style.display = 'block';
    }
};

window.deleteProduct = async (id) => {
    if (confirm("هل أنت متأكد من حذف المنتج؟")) {
        await deleteDoc(doc(db, "products", id));
        loadProducts();
    }
};

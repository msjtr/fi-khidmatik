import { db } from '../core/firebase.js';
import { 
    collection, addDoc, getDocs, doc, updateDoc, deleteDoc, 
    query, orderBy, serverTimestamp, getDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let productEditor; 

export async function initProducts(container) {
    container.innerHTML = `
        <div class="products-mgmt" dir="rtl" style="font-family: 'Tajawal', sans-serif; padding:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">
                <h2 style="color:#2c3e50; margin:0;"><i class="fas fa-boxes" style="color:#e67e22; margin-left:10px;"></i> إدارة مخزن تيرا</h2>
                <button id="btn-add-product" class="btn-primary">
                    <i class="fas fa-plus-circle"></i> إضافة منتج جديد
                </button>
            </div>
            <div id="products-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:20px;">
                <p style="grid-column:1/-1; text-align:center; padding:50px;">جاري تحميل البيانات...</p>
            </div>
        </div>

        <div id="product-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; overflow-y:auto; padding:20px;">
            <div style="background:white; max-width:950px; margin:10px auto; border-radius:15px; padding:30px; position:relative;">
                <h3 id="modal-title" style="color:#e67e22;">بيانات المنتج</h3>
                <form id="product-form">
                    <input type="hidden" id="edit-id">
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-top:20px;">
                        <div style="grid-column: span 2;"><label>اسم المنتج</label><input type="text" id="p-name" required></div>
                        <div><label>كود المنتج (SKU)</label><input type="text" id="p-code"></div>
                        <div><label>سعر البيع</label><input type="number" id="p-price" step="0.01" required></div>
                        <div><label>الكمية</label><input type="number" id="p-stock" required></div>
                        <div><label>رابط فيديو</label><input type="url" id="p-video"></div>
                        <div style="grid-column: span 2;"><label>الصورة الرئيسية</label><input type="url" id="p-main-image" required></div>
                        <div style="grid-column: span 2;"><label>وصف المنتج:</label><div id="p-desc-editor"></div></div>
                    </div>
                    <div style="margin-top:30px; display:flex; gap:15px;">
                        <button type="submit" class="btn-success" style="flex:2;">حفظ</button>
                        <button type="button" id="close-modal" class="btn-secondary" style="flex:1;">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    await initFullEditor();
    setupProductLogic();
    await loadProducts();
}

async function initFullEditor() {
    try {
        if (productEditor) { await productEditor.destroy(); productEditor = null; }
        productEditor = await CKEDITOR.ClassicEditor.create(document.querySelector('#p-desc-editor'), {
            removePlugins: [
                'SlashCommand', 'Mention', 'DocumentOutline', 'ExportPdf', 'ExportWord', 'CKBox', 'CKFinder', 'EasyImage', 
                'RealTimeCollaborativeComments', 'RealTimeCollaborativeTrackChanges', 'RealTimeCollaborativeRevisionHistory', 
                'PresenceList', 'Comments', 'TrackChanges', 'TrackChangesData', 'RevisionHistory', 'Pagination', 'WProofreader', 'MathType'
            ],
            toolbar: ['heading', '|', 'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|', 'bold', 'italic', 'underline', 'alignment', '|', 'link', 'insertTable', 'undo', 'redo'],
            language: 'ar', contentsLangDirection: 'rtl'
        });
    } catch (e) { console.error("Editor Error:", e); }
}

async function loadProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    const snap = await getDocs(query(collection(db, "products"), orderBy("createdAt", "desc")));
    grid.innerHTML = snap.docs.map(doc => {
        const p = doc.data();
        return `
            <div class="product-card" style="background:white; border-radius:12px; padding:15px; border:1px solid #eee;">
                <div style="height:150px; background:url('${p.mainImage}') center/cover; border-radius:8px;"></div>
                <h4 style="margin:10px 0 5px 0;">${p.name}</h4>
                <div style="color:#e67e22; font-weight:bold;">${p.price} ريال</div>
                <div style="margin-top:10px; display:flex; gap:5px;">
                    <button onclick="window.editProductGlobal('${doc.id}')" class="btn-secondary" style="padding:5px 10px;"><i class="fas fa-edit"></i></button>
                    <button onclick="window.deleteProductGlobal('${doc.id}')" class="btn-secondary" style="padding:5px 10px; color:red;"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
    }).join('');
}

function setupProductLogic() {
    const modal = document.getElementById('product-modal');
    document.getElementById('btn-add-product').onclick = () => {
        document.getElementById('product-form').reset();
        if(productEditor) productEditor.setData('');
        document.getElementById('edit-id').value = '';
        modal.style.display = 'block';
    };
    document.getElementById('close-modal').onclick = () => modal.style.display = 'none';

    document.getElementById('product-form').onsubmit = async (e) => {
        e.preventDefault();
        const data = {
            name: document.getElementById('p-name').value,
            price: parseFloat(document.getElementById('p-price').value),
            stock: parseInt(document.getElementById('p-stock').value),
            mainImage: document.getElementById('p-main-image').value,
            description: productEditor ? productEditor.getData() : '',
            updatedAt: serverTimestamp()
        };
        const id = document.getElementById('edit-id').value;
        id ? await updateDoc(doc(db, "products", id), data) : (data.createdAt = serverTimestamp(), await addDoc(collection(db, "products"), data));
        modal.style.display = 'none';
        loadProducts();
    };
}

window.editProductGlobal = async (id) => {
    const snap = await getDoc(doc(db, "products", id));
    if (snap.exists()) {
        const p = snap.data();
        document.getElementById('edit-id').value = id;
        document.getElementById('p-name').value = p.name;
        document.getElementById('p-price').value = p.price;
        document.getElementById('p-stock').value = p.stock;
        document.getElementById('p-main-image').value = p.mainImage;
        if(productEditor) productEditor.setData(p.description || '');
        document.getElementById('product-modal').style.display = 'block';
    }
};

window.deleteProductGlobal = async (id) => {
    if (confirm("حذف؟")) { await deleteDoc(doc(db, "products", id)); loadProducts(); }
};

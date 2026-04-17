import { db } from '../core/firebase.js';
import { 
    collection, getDocs, addDoc, doc, updateDoc, deleteDoc, 
    query, orderBy, serverTimestamp, getDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function initOrdersDashboard(container) {
    container.innerHTML = `
        <div class="orders-mgmt" dir="rtl" style="font-family: 'Tajawal', sans-serif; padding:20px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:25px;">
                <h2 style="color:#2c3e50;"><i class="fas fa-file-invoice"></i> نظام فواتير تيرا جيتواي</h2>
                <button id="btn-create-order" style="background:#27ae60; color:white; border:none; padding:12px 25px; border-radius:10px; cursor:pointer; font-weight:bold;">
                    <i class="fas fa-plus-circle"></i> إنشاء طلب جديد
                </button>
            </div>

            <div id="orders-list" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap:20px;">
                <p style="text-align:center; grid-column:1/-1;">جاري جلب البيانات...</p>
            </div>
        </div>

        <div id="order-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:9999; overflow-y:auto; padding:20px;">
            <div style="background:white; max-width:1000px; margin:auto; border-radius:15px; padding:30px;">
                <h3 id="modal-title" style="color:#3498db; margin-top:0;">فاتورة مبيعات جديدة</h3>
                <form id="order-form">
                    <input type="hidden" id="edit-id">
                    
                    <div style="background:#f9fbff; padding:15px; border-radius:10px; margin-bottom:20px; display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                        <div style="grid-column: span 2;">
                            <label>اختيار عميل مسجل</label>
                            <select id="sel-customer" style="width:100%; padding:10px; border-radius:5px; border:1px solid #ddd;"></select>
                        </div>
                        <input type="text" id="c-name" placeholder="اسم العميل" required style="padding:10px; border-radius:5px; border:1px solid #ddd;">
                        <input type="text" id="c-phone" placeholder="رقم الجوال" required style="padding:10px; border-radius:5px; border:1px solid #ddd;">
                    </div>

                    <div style="margin-bottom:20px;">
                        <h4 style="color:#e67e22;">المنتجات والخدمات</h4>
                        <table style="width:100%; border-collapse:collapse;" id="items-table">
                            <thead><tr style="background:#eee;"><th>المنتج</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th><th></th></tr></thead>
                            <tbody id="items-body"></tbody>
                        </table>
                        <button type="button" id="add-item-btn" style="margin-top:10px; background:#3498db; color:white; border:none; padding:5px 15px; border-radius:5px; cursor:pointer;">+ إضافة منتج</button>
                    </div>

                    <div style="background:#f1f2f6; padding:15px; border-radius:10px; text-align:left;">
                        <div>المجموع: <span id="val-subtotal">0</span> ريال</div>
                        <div>الضريبة (15%): <span id="val-tax">0</span> ريال</div>
                        <div style="font-size:1.3rem; font-weight:bold;">الإجمالي النهائي: <span id="val-total">0</span> ريال</div>
                    </div>

                    <div style="margin-top:20px; display:flex; gap:10px;">
                        <button type="submit" style="flex:2; background:#2ecc71; color:white; padding:12px; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">حفظ الطلب</button>
                        <button type="button" id="close-modal" style="flex:1; background:#95a5a6; color:white; border:none; border-radius:8px; cursor:pointer;">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    setupLogic();
    await loadOrders();
    await loadCustomerOptions();
}

// دالة جلب العملاء للقائمة
async function loadCustomerOptions() {
    const sel = document.getElementById('sel-customer');
    const snap = await getDocs(collection(db, "customers"));
    sel.innerHTML = '<option value="">-- عميل جديد --</option>';
    snap.forEach(d => {
        const c = d.data();
        sel.innerHTML += `<option value="${d.id}" data-json='${JSON.stringify(c)}'>${c.name} (${c.phone})</option>`;
    });
    sel.onchange = (e) => {
        if(!e.target.value) return;
        const c = JSON.parse(e.target.options[e.target.selectedIndex].dataset.json);
        document.getElementById('c-name').value = c.name;
        document.getElementById('c-phone').value = c.phone;
    };
}

async function loadOrders() {
    const list = document.getElementById('orders-list');
    const snap = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")));
    list.innerHTML = snap.docs.map(doc => {
        const o = doc.data();
        return `
            <div class="order-card" style="background:white; padding:20px; border-radius:12px; box-shadow:0 4px 10px rgba(0,0,0,0.05); border-right:5px solid #3498db;">
                <div style="display:flex; justify-content:space-between;">
                    <strong># ${o.orderNumber}</strong>
                    <div>
                        <button onclick="window.editOrder('${doc.id}')" style="color:#f39c12; background:none; border:none; cursor:pointer;"><i class="fas fa-edit"></i></button>
                        <button onclick="window.deleteOrder('${doc.id}')" style="color:#e74c3c; background:none; border:none; cursor:pointer;"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
                <h4>${o.customerName}</h4>
                <div style="color:#27ae60; font-weight:bold;">${o.total} ريال</div>
                <button onclick="window.printInvoice('${doc.id}')" style="width:100%; margin-top:10px; background:#f8f9fa; border:1px solid #ddd; padding:5px; border-radius:5px; cursor:pointer;">طباعة</button>
            </div>
        `;
    }).join('');
}

function setupLogic() {
    const modal = document.getElementById('order-modal');
    document.getElementById('btn-create-order').onclick = () => {
        document.getElementById('order-form').reset();
        document.getElementById('items-body').innerHTML = '';
        modal.style.display = 'block';
    };
    document.getElementById('close-modal').onclick = () => modal.style.display = 'none';

    document.getElementById('add-item-btn').onclick = () => addItemRow();

    document.getElementById('order-form').onsubmit = async (e) => {
        e.preventDefault();
        const items = [];
        document.querySelectorAll('#items-body tr').forEach(tr => {
            items.push({
                name: tr.querySelector('.p-name').value,
                quantity: parseFloat(tr.querySelector('.p-qty').value),
                price: parseFloat(tr.querySelector('.p-price').value)
            });
        });

        const data = {
            orderNumber: "TR-" + Math.floor(1000 + Math.random()*9000),
            customerName: document.getElementById('c-name').value,
            phone: document.getElementById('c-phone').value,
            items: items,
            subtotal: parseFloat(document.getElementById('val-subtotal').textContent),
            tax: parseFloat(document.getElementById('val-tax').textContent),
            total: parseFloat(document.getElementById('val-total').textContent),
            createdAt: serverTimestamp()
        };

        await addDoc(collection(db, "orders"), data);
        modal.style.display = 'none';
        location.reload();
    };
}

function addItemRow() {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="text" class="p-name" style="width:100%;"></td>
        <td><input type="number" class="p-qty" value="1" style="width:50px;"></td>
        <td><input type="number" class="p-price" style="width:80px;"></td>
        <td class="p-row-total">0</td>
        <td><button type="button" onclick="this.parentElement.parentElement.remove(); window.calc();">&times;</button></td>
    `;
    document.getElementById('items-body').appendChild(row);
    row.querySelectorAll('input').forEach(i => i.oninput = window.calc);
}

window.calc = () => {
    let sub = 0;
    document.querySelectorAll('#items-body tr').forEach(tr => {
        const q = tr.querySelector('.p-qty').value || 0;
        const p = tr.querySelector('.p-price').value || 0;
        const total = q * p;
        tr.querySelector('.p-row-total').textContent = total;
        sub += total;
    });
    const tax = sub * 0.15;
    document.getElementById('val-subtotal').textContent = sub.toFixed(2);
    document.getElementById('val-tax').textContent = tax.toFixed(2);
    document.getElementById('val-total').textContent = (sub + tax).toFixed(2);
};

window.printInvoice = (id) => window.print();
window.deleteOrder = async (id) => { if(confirm("حذف؟")) { await deleteDoc(doc(db, "orders", id)); location.reload(); } };

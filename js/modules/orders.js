import { db } from '../core/firebase.js';
import { 
    collection, getDocs, addDoc, doc, updateDoc, deleteDoc, 
    query, orderBy, serverTimestamp, getDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * موديول لوحة الطلبات والفواتير - تيرا جيتواي
 */

export async function initOrdersDashboard(container) {
    container.innerHTML = `
        <div class="orders-mgmt" dir="rtl" style="font-family: 'Tajawal', sans-serif; padding:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">
                <h2 style="color:#2c3e50; margin:0;"><i class="fas fa-file-invoice" style="color:#3498db; margin-left:10px;"></i> نظام فواتير تيرا جيتواي</h2>
                <button id="btn-create-order" style="background:#27ae60; color:white; border:none; padding:12px 25px; border-radius:10px; cursor:pointer; font-weight:bold; box-shadow:0 4px 10px rgba(39,174,96,0.2);">
                    <i class="fas fa-plus-circle"></i> إنشاء طلب جديد
                </button>
            </div>

            <div id="orders-list" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap:20px;">
                <div style="grid-column:1/-1; text-align:center; padding:50px;">
                    <i class="fas fa-spinner fa-spin fa-2x" style="color:#3498db;"></i>
                    <p>جاري مزامنة الفواتير...</p>
                </div>
            </div>
        </div>

        <div id="order-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:9999; overflow-y:auto; padding:20px;">
            <div style="background:white; max-width:900px; margin:20px auto; border-radius:15px; padding:30px; box-shadow:0 10px 30px rgba(0,0,0,0.3);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:2px solid #f1f2f6; padding-bottom:15px;">
                    <h3 id="modal-title" style="color:#3498db; margin:0;">تفاصيل الفاتورة</h3>
                    <button type="button" id="close-modal" style="background:none; border:none; font-size:1.5rem; cursor:pointer; color:#95a5a6;">&times;</button>
                </div>
                
                <form id="order-form">
                    <input type="hidden" id="edit-id">
                    
                    <div style="background:#f9fbff; padding:20px; border-radius:12px; margin-bottom:25px; display:grid; grid-template-columns: 1fr 1fr; gap:15px; border:1px solid #e3f2fd;">
                        <div style="grid-column: span 2;">
                            <label style="display:block; margin-bottom:8px; font-weight:bold; color:#34495e;">اختيار عميل مسجل (تيرا)</label>
                            <select id="sel-customer" style="width:100%; padding:12px; border-radius:8px; border:1px solid #ddd;"></select>
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:8px; font-weight:bold;">اسم العميل</label>
                            <input type="text" id="c-name" placeholder="الاسم الكامل" required style="width:100%; padding:12px; border-radius:8px; border:1px solid #ddd;">
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:8px; font-weight:bold;">رقم الجوال</label>
                            <input type="text" id="c-phone" placeholder="05xxxxxxxx" required style="width:100%; padding:12px; border-radius:8px; border:1px solid #ddd;">
                        </div>
                    </div>

                    <div style="margin-bottom:25px;">
                        <h4 style="color:#e67e22; border-right:4px solid #e67e22; padding-right:10px; margin-bottom:15px;">المنتجات والخدمات</h4>
                        <table style="width:100%; border-collapse:collapse;" id="items-table">
                            <thead>
                                <tr style="background:#f8f9fa;">
                                    <th style="padding:12px; text-align:right;">المنتج</th>
                                    <th style="padding:12px; text-align:center; width:80px;">الكمية</th>
                                    <th style="padding:12px; text-align:center; width:120px;">السعر</th>
                                    <th style="padding:12px; text-align:center; width:120px;">الإجمالي</th>
                                    <th style="padding:12px; width:50px;"></th>
                                </tr>
                            </thead>
                            <tbody id="items-body"></tbody>
                        </table>
                        <button type="button" id="add-item-btn" style="margin-top:15px; background:#3498db; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold;">
                            <i class="fas fa-plus"></i> إضافة بند جديد
                        </button>
                    </div>

                    <div style="background:#2c3e50; padding:20px; border-radius:12px; color:white; text-align:left;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>المجموع الفرعي:</span> <span><span id="val-subtotal">0</span> ريال</span></div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:10px; color:#bdc3c7;"><span>الضريبة (15%):</span> <span><span id="val-tax">0</span> ريال</span></div>
                        <div style="display:flex; justify-content:space-between; font-size:1.4rem; font-weight:bold; border-top:1px solid #455a64; pt-10; margin-top:10px; padding-top:10px; color:#2ecc71;">
                            <span>الإجمالي النهائي:</span> 
                            <span><span id="val-total">0</span> ريال</span>
                        </div>
                    </div>

                    <div style="margin-top:25px; display:flex; gap:15px;">
                        <button type="submit" style="flex:2; background:#2ecc71; color:white; padding:15px; border:none; border-radius:10px; font-size:1.1rem; font-weight:bold; cursor:pointer; box-shadow:0 4px 12px rgba(46,204,113,0.2);">
                            <i class="fas fa-save"></i> اعتماد وحفظ الفاتورة
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    setupLogic();
    await loadOrders();
    await loadCustomerOptions();
}

// دالة جلب العملاء
async function loadCustomerOptions() {
    const sel = document.getElementById('sel-customer');
    if (!sel) return;
    const snap = await getDocs(collection(db, "customers"));
    sel.innerHTML = '<option value="">-- اختيار عميل من القاعدة أو إضافة جديد --</option>';
    snap.forEach(d => {
        const c = d.data();
        const dataStr = JSON.stringify({name: c.name, phone: c.phone}).replace(/'/g, "&apos;");
        sel.innerHTML += `<option value="${d.id}" data-info='${dataStr}'>${c.name} (${c.phone})</option>`;
    });
    
    sel.onchange = (e) => {
        const opt = e.target.options[e.target.selectedIndex];
        if(!opt.value) {
            document.getElementById('c-name').value = '';
            document.getElementById('c-phone').value = '';
            return;
        }
        const info = JSON.parse(opt.getAttribute('data-info'));
        document.getElementById('c-name').value = info.name;
        document.getElementById('c-phone').value = info.phone;
    };
}

async function loadOrders() {
    const list = document.getElementById('orders-list');
    const snap = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")));
    
    if (snap.empty) {
        list.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:#95a5a6;">لا توجد طلبات مسجلة حالياً.</div>`;
        return;
    }

    list.innerHTML = snap.docs.map(doc => {
        const o = doc.data();
        const date = o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString('ar-SA') : '---';
        return `
            <div class="order-card" style="background:white; padding:20px; border-radius:15px; box-shadow:0 4px 15px rgba(0,0,0,0.05); border-right:6px solid #3498db; transition:0.3s;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:15px;">
                    <div>
                        <span style="background:#e3f2fd; color:#1976d2; padding:4px 10px; border-radius:6px; font-size:0.8rem; font-weight:bold;"># ${o.orderNumber || '000'}</span>
                        <div style="font-size:0.75rem; color:#95a5a6; margin-top:5px;"><i class="far fa-calendar-alt"></i> ${date}</div>
                    </div>
                    <div style="display:flex; gap:8px;">
                        <button onclick="window.editOrder('${doc.id}')" title="تعديل" style="color:#f39c12; background:#fff9f0; border:1px solid #ffeeba; width:35px; height:35px; border-radius:8px; cursor:pointer;"><i class="fas fa-edit"></i></button>
                        <button onclick="window.deleteOrder('${doc.id}')" title="حذف" style="color:#e74c3c; background:#fff5f5; border:1px solid #fab1a0; width:35px; height:35px; border-radius:8px; cursor:pointer;"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
                <h4 style="margin:0 0 10px 0; color:#2c3e50;">${o.customerName}</h4>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:15px; padding-top:15px; border-top:1px solid #f1f2f6;">
                    <div style="color:#27ae60; font-size:1.2rem; font-weight:800;">${o.total} <small style="font-size:0.7rem;">ريال</small></div>
                    <button onclick="window.printInvoice('${doc.id}')" style="background:#34495e; color:white; border:none; padding:8px 15px; border-radius:6px; cursor:pointer; font-size:0.85rem;">
                        <i class="fas fa-print"></i> طباعة
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function setupLogic() {
    const modal = document.getElementById('order-modal');
    
    document.getElementById('btn-create-order').onclick = () => {
        document.getElementById('order-form').reset();
        document.getElementById('edit-id').value = '';
        document.getElementById('items-body').innerHTML = '';
        document.getElementById('modal-title').innerText = "فاتورة مبيعات جديدة";
        addItemRow(); // إضافة سطر أول تلقائياً
        modal.style.display = 'block';
    };

    document.getElementById('close-modal').onclick = () => modal.style.display = 'none';

    document.getElementById('add-item-btn').onclick = () => addItemRow();

    document.getElementById('order-form').onsubmit = async (e) => {
        e.preventDefault();
        const items = [];
        document.querySelectorAll('#items-body tr').forEach(tr => {
            const name = tr.querySelector('.p-name').value;
            if(name) {
                items.push({
                    name: name,
                    quantity: parseFloat(tr.querySelector('.p-qty').value) || 0,
                    price: parseFloat(tr.querySelector('.p-price').value) || 0
                });
            }
        });

        if(items.length === 0) return alert("الرجاء إضافة منتج واحد على الأقل");

        const data = {
            orderNumber: document.getElementById('edit-id').value ? undefined : "TR-" + Math.floor(10000 + Math.random()*90000),
            customerName: document.getElementById('c-name').value,
            phone: document.getElementById('c-phone').value,
            items: items,
            subtotal: parseFloat(document.getElementById('val-subtotal').textContent),
            tax: parseFloat(document.getElementById('val-tax').textContent),
            total: parseFloat(document.getElementById('val-total').textContent),
            updatedAt: serverTimestamp()
        };

        const eid = document.getElementById('edit-id').value;
        if(eid) {
            await updateDoc(doc(db, "orders", eid), data);
        } else {
            data.createdAt = serverTimestamp();
            await addDoc(collection(db, "orders"), data);
        }
        
        modal.style.display = 'none';
        location.reload();
    };
}

function addItemRow(data = {}) {
    const row = document.createElement('tr');
    row.style.borderBottom = "1px solid #f1f2f6";
    row.innerHTML = `
        <td style="padding:10px;"><input type="text" class="p-name" value="${data.name || ''}" placeholder="اسم المنتج/الخدمة" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:5px;"></td>
        <td style="padding:10px;"><input type="number" class="p-qty" value="${data.quantity || 1}" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:5px; text-align:center;"></td>
        <td style="padding:10px;"><input type="number" class="p-price" value="${data.price || 0}" step="0.01" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:5px; text-align:center;"></td>
        <td style="padding:10px; text-align:center; font-weight:bold; color:#34495e;" class="p-row-total">0</td>
        <td style="padding:10px; text-align:center;"><button type="button" class="del-row-btn" style="background:none; border:none; color:#e74c3c; cursor:pointer; font-size:1.2rem;">&times;</button></td>
    `;
    document.getElementById('items-body').appendChild(row);
    
    row.querySelector('.del-row-btn').onclick = () => {
        row.remove();
        window.calc();
    };
    
    row.querySelectorAll('input').forEach(i => i.oninput = window.calc);
    window.calc();
}

// الوظائف العالمية
window.calc = () => {
    let sub = 0;
    document.querySelectorAll('#items-body tr').forEach(tr => {
        const q = parseFloat(tr.querySelector('.p-qty').value) || 0;
        const p = parseFloat(tr.querySelector('.p-price').value) || 0;
        const rowTotal = q * p;
        tr.querySelector('.p-row-total').textContent = rowTotal.toFixed(2);
        sub += rowTotal;
    });
    const tax = sub * 0.15;
    document.getElementById('val-subtotal').textContent = sub.toFixed(2);
    document.getElementById('val-tax').textContent = tax.toFixed(2);
    document.getElementById('val-total').textContent = (sub + tax).toFixed(2);
};

window.editOrder = async (id) => {
    const snap = await getDoc(doc(db, "orders", id));
    if(snap.exists()) {
        const o = snap.data();
        document.getElementById('edit-id').value = id;
        document.getElementById('c-name').value = o.customerName;
        document.getElementById('c-phone').value = o.phone || '';
        document.getElementById('items-body').innerHTML = '';
        o.items.forEach(item => addItemRow(item));
        document.getElementById('modal-title').innerText = "تعديل طلب: " + (o.orderNumber || '');
        document.getElementById('order-modal').style.display = 'block';
    }
};

window.deleteOrder = async (id) => {
    if(confirm("هل أنت متأكد من حذف هذه الفاتورة نهائياً؟")) {
        await deleteDoc(doc(db, "orders", id));
        location.reload();
    }
};

window.printInvoice = (id) => window.print();

/**
 * js/modules/customers-core.js
 * نظام إدارة العملاء المتكامل - Tera Gateway (نسخة حائل المطورة)
 */

import { db } from '../core/config.js';
import { 
    collection, getDocs, query, orderBy, addDoc, 
    updateDoc, deleteDoc, doc, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let allCustomers = []; // لتخزين البيانات محلياً للفلترة السريعة

export async function initCustomers(container) {
    if (!container) return;
    showLoader(container);

    try {
        const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        allCustomers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        renderInterface(container);
        updateStats();
        attachEventListeners(container);
    } catch (error) {
        console.error("Firestore Error:", error);
        container.innerHTML = `<div class="error-box">خطأ في تحميل البيانات: ${error.message}</div>`;
    }
}

function showLoader(container) {
    container.innerHTML = `
        <div class="loader-container">
            <i class="fas fa-spinner fa-spin fa-3x"></i>
            <p>جاري مزامنة بيانات عملاء حائل...</p>
        </div>`;
}

/**
 * رسم الواجهة الرئيسية (الأدوات + الإحصائيات + القائمة)
 */
function renderInterface(container) {
    container.innerHTML = `
        <div class="customers-dashboard">
            <div class="toolbar">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" id="customerSearch" placeholder="بحث باسم العميل أو رقم الجوال...">
                </div>
                <div class="actions">
                    <button class="btn btn-primary" id="btnAddCustomer"><i class="fas fa-plus"></i> إضافة عميل</button>
                    <button class="btn btn-secondary" id="btnPrintAll"><i class="fas fa-print"></i> طباعة التقرير</button>
                </div>
            </div>

            <div class="stats-panel">
                <div class="stat-card">
                    <label>إجمالي العملاء</label>
                    <span id="stat-total">0</span>
                </div>
                <div class="stat-card">
                    <label>عملاء حائل</label>
                    <span id="stat-local">0</span>
                </div>
                <div class="stat-card highlight">
                    <label>أحدث إضافة</label>
                    <span id="stat-last" style="font-size: 0.8rem; white-space: nowrap;">-</span>
                </div>
            </div>

            <div id="customersList" class="customers-list-container">
                ${renderCards(allCustomers)}
            </div>
        </div>

        <style>
            .customers-dashboard { padding: 20px; font-family: 'Tajawal', sans-serif; direction: rtl; }
            .toolbar { display: flex; justify-content: space-between; gap: 20px; margin-bottom: 20px; flex-wrap: wrap; }
            .search-box { flex: 1; position: relative; min-width: 300px; }
            .search-box input { width: 100%; padding: 12px 40px 12px 12px; border-radius: 10px; border: 1px solid #ddd; outline: none; transition: 0.3s; }
            .search-box input:focus { border-color: #e67e22; box-shadow: 0 0 8px rgba(230,126,34,0.2); }
            .search-box i { position: absolute; right: 15px; top: 15px; color: #999; }
            
            .stats-panel { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 25px; }
            .stat-card { background: white; padding: 15px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); text-align: center; }
            .stat-card label { display: block; color: #7f8c8d; font-size: 0.85rem; margin-bottom: 5px; }
            .stat-card span { font-weight: 800; font-size: 1.5rem; color: #2c3e50; }
            .stat-card.highlight span { color: #e67e22; }

            .customers-list-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 20px; }
            
            /* تصميم بطاقة العميل */
            .c-card { background: white; border-radius: 15px; border: 1px solid #eee; overflow: hidden; transition: 0.3s; position: relative; }
            .c-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
            .c-header { background: #f8fafc; padding: 15px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; gap: 12px; }
            .c-icon { width: 45px; height: 45px; background: #e67e22; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
            
            .card-actions { position: absolute; left: 10px; top: 15px; display: flex; gap: 5px; }
            .btn-mini { border: none; background: white; width: 30px; height: 30px; border-radius: 5px; cursor: pointer; color: #666; transition: 0.2s; }
            .btn-mini:hover { color: #e67e22; background: #fff5eb; }
            .btn-mini.delete:hover { color: #e74c3c; background: #fdf2f2; }

            .data-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 15px; }
            .address-block { grid-column: span 2; background: #fffaf5; padding: 10px; border-radius: 8px; border: 1px solid #ffe8d1; margin-top: 5px; }
            .badge { background: #e2e8f0; padding: 2px 8px; border-radius: 4px; font-family: monospace; color: #e67e22; font-size: 0.8rem; }
            
            .btn { padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer; font-weight: bold; transition: 0.3s; display: inline-flex; align-items: center; gap: 8px; }
            .btn-primary { background: #e67e22; color: white; }
            .btn-secondary { background: #2c3e50; color: white; }
            
            @media print { .toolbar, .btn-mini, .stats-panel { display: none !important; } .customers-list-container { display: block; } .c-card { break-inside: avoid; border: 1px solid #000; margin-bottom: 20px; } }
        </style>
    `;
}

/**
 * رسم البطاقات بناءً على مصفوفة معينة
 */
function renderCards(customers) {
    return customers.map(d => `
        <div class="c-card" data-id="${d.id}">
            <div class="card-actions">
                <button class="btn-mini btn-edit" title="تعديل"><i class="fas fa-edit"></i></button>
                <button class="btn-mini btn-print-card" title="طباعة العميل"><i class="fas fa-print"></i></button>
                <button class="btn-mini delete btn-delete" title="حذف"><i class="fas fa-trash-alt"></i></button>
            </div>
            <div class="c-header">
                <div class="c-icon"><i class="fas fa-user-check"></i></div>
                <div>
                    <div style="font-weight:800; color:#2c3e50;">${d.name || 'غير مسمى'}</div>
                    <small>${d.phone || '-'}</small>
                </div>
            </div>
            <div class="c-body">
                <div class="data-grid">
                    <div class="data-item"><label style="display:block; font-size:0.7rem; color:#999;">البريد</label><span>${d.email || '-'}</span></div>
                    <div class="data-item"><label style="display:block; font-size:0.7rem; color:#999;">المدينة</label><span>${d.city || 'حائل'}</span></div>
                    
                    <div class="address-block">
                        <small style="font-weight:800; color:#e67e22; margin-bottom:5px; display:block;">العنوان الوطني</small>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:5px; font-size:0.85rem;">
                            <span>الحي: ${d.district || '-'}</span>
                            <span>الشارع: ${d.street || '-'}</span>
                            <span>المبنى: <b class="badge">${d.buildingNo || '-'}</b></span>
                            <span>الإضافي: <b class="badge">${d.additionalNo || '-'}</b></span>
                            <span>الرمز: <b class="badge">${d.postalCode || '-'}</b></span>
                            <span>ص.ب: ${d.poBox || '-'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * تحديث لوحة الإحصائيات
 */
function updateStats() {
    document.getElementById('stat-total').innerText = allCustomers.length;
    document.getElementById('stat-local').innerText = allCustomers.filter(c => c.city === "حائل").length;
    if (allCustomers.length > 0) {
        document.getElementById('stat-last').innerText = allCustomers[0].name.split(' ')[0];
    }
}

/**
 * إدارة جميع الأحداث ( delegation )
 */
function attachEventListeners(container) {
    // 1. الفلترة والبحث اللحظي
    const searchInput = document.getElementById('customerSearch');
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allCustomers.filter(c => 
            c.name.toLowerCase().includes(term) || 
            c.phone.includes(term)
        );
        document.getElementById('customersList').innerHTML = renderCards(filtered);
    });

    // 2. إضافة عميل جديد (عرض Form)
    document.getElementById('btnAddCustomer').addEventListener('click', () => {
        const name = prompt("أدخل اسم العميل بالكامل:");
        const phone = prompt("أدخل رقم الجوال:");
        if (name && phone) {
            addNewCustomer({ name, phone, city: "حائل", createdAt: new Date().toISOString() });
        }
    });

    // 3. طباعة الكل
    document.getElementById('btnPrintAll').addEventListener('click', () => window.print());

    // 4. أحداث البطاقات (تعديل، حذف، طباعة فردية)
    container.addEventListener('click', async (e) => {
        const card = e.target.closest('.c-card');
        if (!card) return;
        const id = card.dataset.id;

        // حذف
        if (e.target.closest('.btn-delete')) {
            if (confirm("هل أنت متأكد من حذف هذا العميل نهائياً؟")) {
                await deleteDoc(doc(db, "customers", id));
                allCustomers = allCustomers.filter(c => c.id !== id);
                initCustomers(container); // إعادة التحميل
            }
        }

        // تعديل
        if (e.target.closest('.btn-edit')) {
            const newName = prompt("تعديل الاسم:", allCustomers.find(c => c.id === id).name);
            if (newName) {
                await updateDoc(doc(db, "customers", id), { name: newName });
                initCustomers(container);
            }
        }

        // طباعة فردية
        if (e.target.closest('.btn-print-card')) {
            const printContent = card.innerHTML;
            const win = window.open('', '', 'height=700,width=900');
            win.document.write('<html><head><title>طباعة عميل</title>');
            win.document.write('<style>body{direction:rtl; font-family:sans-serif;} .card-actions{display:none;} .badge{border:1px solid #ccc; padding:2px;}</style></head><body>');
            win.document.write(printContent);
            win.document.write('</body></html>');
            win.document.close();
            win.print();
        }
    });
}

/**
 * وظيفة الإضافة الفعليه في Firestore
 */
async function addNewCustomer(data) {
    try {
        await addDoc(collection(db, "customers"), {
            ...data,
            createdAt: serverTimestamp()
        });
        alert("تمت إضافة العميل بنجاح");
        location.reload(); // أو إعادة استدعاء initCustomers
    } catch (e) {
        alert("خطأ أثناء الإضافة: " + e.message);
    }
}

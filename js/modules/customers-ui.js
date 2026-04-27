/**
 * customers-ui.js - المحرك المطور والكامل لمجموعة العملاء
 * المسار: js/modules/customers-ui.js
 */
import { db } from '../core/firebase.js'; 
import { 
    collection, getDocs, query, orderBy, deleteDoc, doc, getDoc, updateDoc, addDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * الدالة الرئيسية لتشغيل واجهة العملاء
 */
export async function initCustomersUI(container) {
    const tableBody = document.getElementById('customers-data-rows');
    if (!tableBody) return;

    // 1. حالة التحميل
    tableBody.innerHTML = `
        <tr>
            <td colspan="17" style="text-align:center; padding:50px;">
                <i class="fas fa-spinner fa-spin fa-2x" style="color: #2563eb;"></i>
                <p style="margin-top:10px;">جاري جلب بيانات "customers" من قاعدة البيانات...</p>
            </td>
        </tr>`;

    try {
        const customersRef = collection(db, "customers");
        const q = query(customersRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        tableBody.innerHTML = ''; // تنظيف الحاوية

        if (querySnapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="17" style="text-align:center; padding:30px;">لا يوجد عملاء في مجموعة customers.</td></tr>';
            return;
        }

        // 2. تحديث الإحصائيات (العد الفعلي)
        updateCustomersStats(querySnapshot.docs);

        let index = 1;
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const tr = document.createElement('tr');
            tr.className = "customer-row";

            // تحديد الصورة (افتراضية إذا لم توجد)
            const photoURL = data.photoURL || 'assets/images/default-avatar.png';

            // 3. بناء الـ 17 عموداً بالترتيب الدقيق ومطابقة حقول Firestore
            tr.innerHTML = `
                <td>${index++}</td>
                <td>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <img src="${photoURL}" style="width:30px; height:30px; border-radius:50%; object-fit:cover;">
                        <strong>${data.name || '---'}</strong>
                    </div>
                </td>
                <td>${data.phone || '---'}</td>
                <td>${data.countryCode || '+966'}</td>
                <td>${data.email || '---'}</td>
                <td>${data.country || 'المملكة العربية السعودية'}</td>
                <td>${data.city || '---'}</td>
                <td>${data.district || '---'}</td>
                <td>${data.street || '---'}</td>
                <td>${data.buildingNo || '---'}</td>
                <td>${data.additionalNo || '---'}</td>
                <td>${data.postalCode || '---'}</td>
                <td>${data.poBox || '---'}</td>
                <td>${formatDate(data.createdAt)}</td>
                <td><span class="status-pill ${getStatusClass(data.tag)}">${data.status || 'نشط'}</span></td>
                <td>${data.tag || 'عادي'}</td>
                <td class="sticky-actions">
                    <div class="action-btns">
                        <button onclick="window.openCustomerEditModal('${docSnap.id}')" class="btn-sm btn-edit" title="تعديل"><i class="fas fa-edit"></i></button>
                        <button onclick="window.printCust('${docSnap.id}')" class="btn-sm btn-print" title="طباعة"><i class="fas fa-print"></i></button>
                        <button onclick="window.deleteCust('${docSnap.id}')" class="btn-sm btn-delete" title="حذف"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
        });

    } catch (error) {
        console.error("Firestore Error:", error);
        tableBody.innerHTML = `<tr><td colspan="17" style="text-align:center; color:red; padding:20px;">خطأ في جلب البيانات.</td></tr>`;
    }
}

/**
 * تحديث الإحصائيات الشاملة
 */
function updateCustomersStats(docs) {
    const stats = {
        total: docs.length,
        vip: 0,
        active: 0,
        incomplete: 0
    };

    docs.forEach(d => {
        const data = d.data();
        if (data.tag?.toLowerCase() === 'vip') stats.vip++;
        if (data.status === 'نشط' || !data.status) stats.active++;
        if (!data.phone || !data.email || !data.postalCode) stats.incomplete++;
    });

    // تحديث العناصر في واجهة المستخدم (تأكد من وجود هذه الـ IDs في HTML)
    if(document.getElementById('stat-total')) document.getElementById('stat-total').innerText = stats.total;
    if(document.getElementById('stat-vip')) document.getElementById('stat-vip').innerText = stats.vip;
    if(document.getElementById('stat-active')) document.getElementById('stat-active').innerText = stats.active;
}

/**
 * نافذة التعديل (فتح وجلب البيانات كاملة)
 */
window.openCustomerEditModal = async function(id) {
    try {
        const docRef = doc(db, "customers", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            
            // تعبئة الحقول في الـ Modal (تأكد من مطابقة الـ ID في الـ HTML)
            if(document.getElementById('edit-cust-id')) document.getElementById('edit-cust-id').value = id;
            if(document.getElementById('cust-name')) document.getElementById('cust-name').value = data.name || '';
            if(document.getElementById('cust-phone')) document.getElementById('cust-phone').value = data.phone || '';
            if(document.getElementById('cust-additionalNo')) document.getElementById('cust-additionalNo').value = data.additionalNo || '';
            if(document.getElementById('cust-postalCode')) document.getElementById('cust-postalCode').value = data.postalCode || '';
            
            // تهيئة محرر النصوص (Quill) إذا كان موجوداً للملاحظات
            if (window.quillEditor) {
                window.quillEditor.root.innerHTML = data.notes || '';
            }

            // إظهار نافذة التعديل
            const modal = document.getElementById('customerEditModal');
            if(modal) modal.style.display = 'block';
        }
    } catch (error) {
        console.error("Error fetching doc:", error);
    }
};

/**
 * الحفظ الفعلي للتعديلات
 */
window.saveCustomerChanges = async function() {
    const id = document.getElementById('edit-cust-id').value;
    const notesContent = window.quillEditor ? window.quillEditor.root.innerHTML : "";

    const updatedData = {
        name: document.getElementById('cust-name').value,
        phone: document.getElementById('cust-phone').value,
        additionalNo: document.getElementById('cust-additionalNo').value,
        postalCode: document.getElementById('cust-postalCode').value,
        notes: notesContent,
        updatedAt: new Date().toISOString()
    };

    try {
        await updateDoc(doc(db, "customers", id), updatedData);
        alert("تم التعديل بنجاح في قاعدة البيانات.");
        closeModal(); // دالة إغلاق المودال
        initCustomersUI(); // تحديث الجدول
    } catch (error) {
        alert("فشل التعديل.");
    }
};

window.deleteCust = async function(id) {
    if (confirm("هل أنت متأكد من حذف هذا العميل؟")) {
        await deleteDoc(doc(db, "customers", id));
        initCustomersUI();
    }
};

window.printCust = function(id) { window.print(); };

function formatDate(dateStr) {
    if (!dateStr) return '---';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB'); // تنسيق 123
}

function getStatusClass(tag) {
    return tag?.toLowerCase() === 'vip' ? 'status-vip' : 'status-active';
}

/**
 * customers-ui.js - المحرك المطور والمتوافق مع نظام 17 حقل
 * المسار: js/modules/customers-ui.js
 */
import { db } from '../core/firebase.js'; 
import { 
    collection, getDocs, query, orderBy, deleteDoc, doc, getDoc, updateDoc, addDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * 1. تشغيل واجهة العملاء وجلب البيانات
 */
export async function initCustomersUI() {
    const tableBody = document.getElementById('customers-data-rows');
    if (!tableBody) return;

    try {
        const customersRef = collection(db, "customers");
        const q = query(customersRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        tableBody.innerHTML = ''; // تنظيف الجدول

        if (querySnapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="17" style="text-align:center; padding:30px;">لا يوجد بيانات في مجموعة العملاء.</td></tr>';
            return;
        }

        // تحديث الإحصائيات في الأعلى
        updateCustomersStats(querySnapshot.docs);

        let index = 1;
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const tr = document.createElement('tr');
            tr.className = "customer-row";

            // بناء الـ 17 عموداً بدقة (مطابقة تماماً للـ HTML)
            tr.innerHTML = `
                <td class="sticky-col">${index++}</td>
                <td class="sticky-col-name"><strong>${data.name || '---'}</strong></td>
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
                <td><span class="status-pill ${data.status === 'نشط' ? 'active' : 'inactive'}">${data.status || 'غير محدد'}</span></td>
                <td><span class="tag-pill ${data.tag === 'VIP' ? 'vip' : 'normal'}">${data.tag || 'عادي'}</span></td>
                <td class="sticky-actions">
                    <div class="action-btns" style="display:flex; gap:5px;">
                        <button onclick="window.openCustomerModal('edit', '${docSnap.id}')" class="btn-sm btn-edit"><i class="fas fa-edit"></i></button>
                        <button onclick="window.deleteCust('${docSnap.id}')" class="btn-sm btn-delete"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
        });

    } catch (error) {
        console.error("Firestore Error:", error);
        tableBody.innerHTML = `<tr><td colspan="17" style="text-align:center; color:red; padding:20px;">خطأ في الاتصال بقاعدة البيانات.</td></tr>`;
    }
}

/**
 * 2. دالة معالجة الإضافة والتعديل (Handle Submit)
 * هذه الدالة تضمن حفظ الـ 17 عنصراً بالكامل
 */
window.handleCustomerSubmit = async function(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const customerId = form.dataset.editId; // سنستخدم هذا في حال التعديل

    // تجميع الكائن المكون من 17 عنصر
    const customerData = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        countryCode: formData.get('countryCode'),
        email: formData.get('email'),
        country: formData.get('country'),
        city: formData.get('city'),
        district: formData.get('district'),
        street: formData.get('street'),
        buildingNo: formData.get('buildingNo'),
        additionalNo: formData.get('additionalNo'),
        postalCode: formData.get('postalCode'),
        poBox: formData.get('poBox'),
        status: formData.get('status'),
        tag: formData.get('tag'),
        notes: window.quillEditor ? window.quillEditor.root.innerHTML : "",
        updatedAt: new Date().toISOString()
    };

    try {
        if (customerId) {
            // تحديث عميل موجود
            await updateDoc(doc(db, "customers", customerId), customerData);
            alert("تم تحديث بيانات العميل بنجاح.");
        } else {
            // إضافة عميل جديد
            customerData.createdAt = new Date().toISOString();
            await addDoc(collection(db, "customers"), customerData);
            alert("تمت إضافة العميل الجديد بنجاح.");
        }
        window.closeCustomerModal();
        initCustomersUI(); // تحديث الجدول فوراً
    } catch (error) {
        console.error("Save Error:", error);
        alert("فشل الحفظ في قاعدة البيانات.");
    }
};

/**
 * 3. فتح النافذة المنبثقة (إضافة أو تعديل)
 */
window.openCustomerModal = async function(mode, id = null) {
    const modal = document.getElementById('customer-modal');
    const form = document.getElementById('customer-form');
    if (!modal || !form) return;

    form.reset(); // تنظيف الحقول
    if (window.quillEditor) window.quillEditor.root.innerHTML = '';
    delete form.dataset.editId;

    if (mode === 'edit' && id) {
        document.getElementById('modal-title').innerText = "تعديل بيانات العميل";
        form.dataset.editId = id;

        // جلب البيانات من Firestore لتعبئتها في النموذج
        const docSnap = await getDoc(doc(db, "customers", id));
        if (docSnap.exists()) {
            const data = docSnap.data();
            // تعبئة كل حقل بالاسم (Name) الخاص به
            Object.keys(data).forEach(key => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) input.value = data[key];
            });
            if (window.quillEditor) window.quillEditor.root.innerHTML = data.notes || '';
        }
    } else {
        document.getElementById('modal-title').innerText = "إضافة بيانات العميل الكاملة";
    }

    modal.style.display = 'flex';
};

window.closeCustomerModal = function() {
    const modal = document.getElementById('customer-modal');
    if (modal) modal.style.display = 'none';
};

/**
 * 4. الحذف وتنسيق التاريخ
 */
window.deleteCust = async function(id) {
    if (confirm("هل أنت متأكد من حذف هذا العميل؟")) {
        await deleteDoc(doc(db, "customers", id));
        initCustomersUI();
    }
};

function formatDate(dateInput) {
    if (!dateInput) return '---';
    const date = new Date(dateInput);
    return date.toLocaleDateString('ar-SA', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function updateCustomersStats(docs) {
    const total = docs.length;
    const active = docs.filter(d => d.data().status === 'نشط').length;
    const vip = docs.filter(d => d.data().tag === 'VIP').length;
    
    // ربط الإحصائيات بالـ IDs الموجودة في HTML
    if (document.getElementById('stat-total-customers')) document.getElementById('stat-total-customers').innerText = total;
    if (document.getElementById('stat-active-customers')) document.getElementById('stat-active-customers').innerText = active;
    if (document.getElementById('stat-vip-count')) document.getElementById('stat-vip-count').innerText = vip;
}

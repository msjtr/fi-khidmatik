import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-storage.js";
import { db, storage } from '../js/firebase.js';

const currentEmployee = "Mohammad Al-Shammari"; // الموظف المسؤول
let customersDataList = [];
let quill;

// تهيئة محرر النصوص المتقدم
function initQuill() {
    if (!quill) { quill = new Quill('#editor', { theme: 'snow' }); }
}

// تحميل الجدول بالـ 18 عموداً
async function loadCustomers() {
    const tbody = document.getElementById('customers-tbody');
    try {
        const querySnapshot = await getDocs(collection(db, "customers"));
        tbody.innerHTML = ''; customersDataList = [];
        
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data(); data.id = docSnap.id;
            customersDataList.push(data);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${tbody.children.length + 1}</td> <!-- التسلسل -->
                <td class="sticky-col"><strong>${data.name || '-'}</strong></td> <!-- اسم العميل -->
                <td>${data.phone || '-'}</td> <!-- الجوال -->
                <td>${data.countryCode || '-'}</td> <!-- مفتاح الدولة -->
                <td>${data.email || '-'}</td> <!-- البريد الإلكتروني -->
                <td>${data.country || '-'}</td> <!-- الدولة -->
                <td>${data.city || '-'}</td> <!-- المدينة -->
                <td>${data.district || '-'}</td> <!-- الحي -->
                <td>${data.street || '-'}</td> <!-- الشارع -->
                <td>${data.buildingNo || '-'}</td> <!-- المبنى -->
                <td>${data.additionalNo || '-'}</td> <!-- الإضافي -->
                <td>${data.postalCode || '-'}</td> <!-- الرمز البريدي -->
                <td>${data.poBox || '-'}</td> <!-- صندوق البريد -->
                <td>${data.createdAt ? new Date(data.createdAt).toLocaleDateString('ar-SA') : '-'}</td> <!-- تاريخ الإضافة -->
                <td>${data.accountStatus || 'جديد'}</td> <!-- الحالة -->
                <td>${data.customerCategory || 'عادي'}</td> <!-- التصنيف -->
                <td>${data.quickNote || '-'}</td> <!-- الملاحظات السريعة -->
                <td class="sticky-actions"> <!-- الإجراءات -->
                    <span class="action-link edit-btn" onclick="openEditModal('${data.id}')">تعديل</span> |
                    <span class="action-link view-btn" onclick="viewCustomerDetails('${data.id}')">عرض</span> |
                    <span class="action-link print-btn" onclick="window.print()">طباعة</span> |
                    <span class="action-link delete-btn" onclick="deleteCustomer('${data.id}')">حذف</span>
                </td>
            `;
            tbody.appendChild(row);
        });
        document.getElementById('customers-count').innerText = customersDataList.length;
    } catch (e) { console.error("خطأ في التحميل:", e); }
}

// دالة الرفع وسجل العمليات[cite: 1]
async function handleUpload(id) {
    const fileInput = document.getElementById('new-file-input');
    const nameInput = document.getElementById('new-file-name');
    const uploadBtn = document.getElementById('upload-btn');
    if(!fileInput.files[0] || !nameInput.value) return alert("أكمل بيانات المرفق");

    uploadBtn.innerText = "جاري الرفع..."; uploadBtn.disabled = true;
    try {
        const fileRef = ref(storage, `docs/${id}/${Date.now()}_${fileInput.files[0].name}`);
        const snap = await uploadBytes(fileRef, fileInput.files[0]);
        const url = await getDownloadURL(snap.ref);

        const cDoc = await getDoc(doc(db, "customers", id));
        const oldAttachments = cDoc.data().attachments || [];
        const newEntry = { 
            fileId: Date.now().toString(), 
            fileName: nameInput.value, 
            fileUrl: url, 
            addedBy: currentEmployee, 
            addedAt: new Date().toISOString(), 
            status: 'active', 
            deletedAt: null 
        };

        const updated = [...oldAttachments, newEntry];
        await updateDoc(doc(db, "customers", id), { attachments: updated });
        renderFilesLog(updated, id);
        alert("تم الرفع بنجاح");
        nameInput.value = ''; fileInput.value = '';
    } catch(e) { alert("فشل الرفع"); }
    finally { uploadBtn.innerText = "رفع المرفق"; uploadBtn.disabled = false; }
}

// سجل المرفقات (إضافة وحذف)[cite: 1]
function renderFilesLog(files, id) {
    const list = document.getElementById('files-log-list');
    list.innerHTML = files.map(f => `
        <tr style="${f.status === 'deleted' ? 'background:#fff1f0; color:red;' : ''}">
            <td>${f.status === 'active' ? `<a href="${f.fileUrl}" target="_blank">${f.fileName}</a>` : `<s>${f.fileName}</s>`}</td>
            <td>${f.addedBy}</td>
            <td>${new Date(f.addedAt).toLocaleDateString('ar-SA')}</td>
            <td>${f.deletedAt ? new Date(f.deletedAt).toLocaleDateString('ar-SA') : '-'}</td>
            <td>${f.status === 'active' ? `<button type="button" onclick="deleteAttachment('${id}', '${f.fileId}')">🗑️</button>` : 'محذوف'}</td>
        </tr>
    `).join('') || '<tr><td colspan="5">لا يوجد مرفقات</td></tr>';
}

// حذف المرفق من السجل[cite: 1]
window.deleteAttachment = async (customerId, fId) => {
    if(!confirm("حذف المرفق من السجل؟")) return;
    try {
        const cDoc = await getDoc(doc(db, "customers", customerId));
        const list = cDoc.data().attachments || [];
        const updated = list.map(f => f.fileId === fId ? { ...f, status: 'deleted', deletedAt: new Date().toISOString() } : f);
        await updateDoc(doc(db, "customers", customerId), { attachments: updated });
        renderFilesLog(updated, customerId);
    } catch(e) { console.error(e); }
};

// عرض تفاصيل العميل الشاملة[cite: 2]
window.viewCustomerDetails = (id) => {
    const c = customersDataList.find(i => i.id === id);
    const body = document.getElementById('view-details-body');
    body.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <p><strong>الاسم:</strong> ${c.name}</p><p><strong>الجوال:</strong> ${c.phone}</p>
            <p><strong>البريد:</strong> ${c.email || '-'}</p><p><strong>العنوان:</strong> ${c.city} / ${c.district}</p>
            <p><strong>الحالة:</strong> ${c.accountStatus}</p><p><strong>التصنيف:</strong> ${c.customerCategory}</p>
        </div>
        <hr>
        <strong>الملاحظات التفصيلية:</strong>
        <div style="background:#f9f9f9; padding:10px; border-radius:5px; margin-top:5px;">${c.detailedNotes || 'لا توجد'}</div>
    `;
    document.getElementById('view-customer-modal').classList.add('active');
};

// فتح مودال التعديل وتعبئة كافة الحقول[cite: 2]
window.openEditModal = (id) => {
    const c = customersDataList.find(i => i.id === id);
    initQuill();
    document.getElementById('edit-doc-id').value = id;
    document.getElementById('edit-name').value = c.name || '';
    document.getElementById('edit-phone').value = c.phone || '';
    document.getElementById('edit-countryCode').value = c.countryCode || '';
    document.getElementById('edit-email').value = c.email || '';
    document.getElementById('edit-country').value = c.country || '';
    document.getElementById('edit-city').value = c.city || '';
    document.getElementById('edit-district').value = c.district || '';
    document.getElementById('edit-street').value = c.street || '';
    document.getElementById('edit-buildingNo').value = c.buildingNo || '';
    document.getElementById('edit-additionalNo').value = c.additionalNo || '';
    document.getElementById('edit-postalCode').value = c.postalCode || '';
    document.getElementById('edit-poBox').value = c.poBox || '';
    document.getElementById('edit-accountStatus').value = c.accountStatus || 'جديد';
    document.getElementById('edit-customerCategory').value = c.customerCategory || 'عادي';
    document.getElementById('edit-quickNote').value = c.quickNote || '';
    
    quill.root.innerHTML = c.detailedNotes || '';
    renderFilesLog(c.attachments || [], id);
    document.getElementById('upload-btn').onclick = () => handleUpload(id);
    document.getElementById('edit-customer-modal').classList.add('active');
};

// حفظ كافة الحقول الـ 18
document.getElementById('edit-customer-form').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-doc-id').value;
    try {
        await updateDoc(doc(db, "customers", id), {
            name: document.getElementById('edit-name').value,
            phone: document.getElementById('edit-phone').value,
            countryCode: document.getElementById('edit-countryCode').value,
            email: document.getElementById('edit-email').value,
            country: document.getElementById('edit-country').value,
            city: document.getElementById('edit-city').value,
            district: document.getElementById('edit-district').value,
            street: document.getElementById('edit-street').value,
            buildingNo: document.getElementById('edit-buildingNo').value,
            additionalNo: document.getElementById('edit-additionalNo').value,
            postalCode: document.getElementById('edit-postalCode').value,
            poBox: document.getElementById('edit-poBox').value,
            accountStatus: document.getElementById('edit-accountStatus').value,
            customerCategory: document.getElementById('edit-customerCategory').value,
            quickNote: document.getElementById('edit-quickNote').value,
            detailedNotes: quill.root.innerHTML,
            updatedAt: new Date().toISOString()
        });
        alert("تم تحديث كافة البيانات بنجاح");
        window.closeEditModal(); loadCustomers();
    } catch(e) { console.error(e); }
};

window.closeEditModal = () => document.getElementById('edit-customer-modal').classList.remove('active');

window.deleteCustomer = async (id) => {
    if(confirm("حذف العميل نهائياً؟")) {
        try { await deleteDoc(doc(db, "customers", id)); loadCustomers(); } catch(e) { console.error(e); }
    }
};

document.addEventListener('DOMContentLoaded', loadCustomers);

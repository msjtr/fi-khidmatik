import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-storage.js";
import { db, storage } from '../js/firebase.js';

const currentEmployee = "Mohammad Al-Shammari"; // اسم الموظف الحالي
let customersDataList = [];
let quill;

function initQuill() {
    if (!quill) { quill = new Quill('#editor', { theme: 'snow' }); }
}

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
                <td>${tbody.children.length + 1}</td>
                <td><strong>${data.name || '-'}</strong></td>
                <td>${data.phone || '-'}</td>
                <td>${data.accountStatus || 'جديد'}</td>
                <td>${data.customerCategory || 'عادي'}</td>
                <td>${data.quickNote || '-'}</td>
                <td class="actions-cell">
                    <span class="action-link edit-btn" onclick="openEditModal('${data.id}')">تعديل</span>
                    <span class="action-divider">|</span>
                    <span class="action-link view-btn" onclick="viewCustomerDetails('${data.id}')">عرض</span>
                    <span class="action-divider">|</span>
                    <span class="action-link print-btn" onclick="window.print()">طباعة</span>
                    <span class="action-divider">|</span>
                    <span class="action-link delete-btn" onclick="deleteCustomer('${data.id}')">حذف</span>
                </td>
            `;
            tbody.appendChild(row);
        });
        document.getElementById('customers-count').innerText = customersDataList.length;
    } catch (e) { console.error(e); }
}

// دالة الرفع المصححة
async function handleUpload(id) {
    const fileInput = document.getElementById('new-file-input');
    const nameInput = document.getElementById('new-file-name');
    const file = fileInput.files[0];
    const uploadBtn = document.getElementById('upload-btn');

    if(!file || !nameInput.value) return alert("اختر ملفاً واسمه");

    uploadBtn.innerText = "جاري الرفع...";
    uploadBtn.disabled = true;

    try {
        const fileRef = ref(storage, `docs/${id}/${Date.now()}_${file.name}`);
        const snap = await uploadBytes(fileRef, file);
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
    } catch(e) { console.error(e); alert("فشل الرفع"); }
    finally { uploadBtn.innerText = "رفع المرفق"; uploadBtn.disabled = false; }
}

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

function renderFilesLog(files, id) {
    const list = document.getElementById('files-log-list');
    list.innerHTML = files.map(f => `
        <tr style="${f.status === 'deleted' ? 'background:#fff1f0; color:red;' : ''}">
            <td>${f.status === 'active' ? `<a href="${f.fileUrl}" target="_blank">${f.fileName}</a>` : `<s>${f.fileName}</s>`}</td>
            <td>${f.addedBy}</td>
            <td>${new Date(f.addedAt).toLocaleDateString('ar-SA')}</td>
            <td>${f.deletedAt ? new Date(f.deletedAt).toLocaleDateString('ar-SA') : '-'}</td>
            <td>${f.status === 'active' ? `<button onclick="deleteAttachment('${id}', '${f.fileId}')">🗑️</button>` : 'محذوف'}</td>
        </tr>
    `).join('') || '<tr><td colspan="5">لا يوجد مرفقات</td></tr>';
}

window.viewCustomerDetails = (id) => {
    const c = customersDataList.find(i => i.id === id);
    const body = document.getElementById('view-details-body');
    body.innerHTML = `
        <p><strong>الاسم:</strong> ${c.name}</p>
        <p><strong>الجوال:</strong> ${c.phone}</p>
        <p><strong>الحالة:</strong> ${c.accountStatus}</p>
        <hr>
        <strong>الملاحظات:</strong>
        <div style="background:#f9f9f9; padding:10px; border-radius:5px;">${c.detailedNotes || 'لا يوجد'}</div>
    `;
    document.getElementById('view-customer-modal').classList.add('active');
};

window.openEditModal = (id) => {
    const c = customersDataList.find(i => i.id === id);
    initQuill();
    document.getElementById('edit-doc-id').value = id;
    document.getElementById('edit-name').value = c.name || '';
    document.getElementById('edit-phone').value = c.phone || '';
    quill.root.innerHTML = c.detailedNotes || '';
    renderFilesLog(c.attachments || [], id);
    document.getElementById('upload-btn').onclick = () => handleUpload(id);
    document.getElementById('edit-customer-modal').classList.add('active');
};

window.closeEditModal = () => document.getElementById('edit-customer-modal').classList.remove('active');

document.addEventListener('DOMContentLoaded', loadCustomers);

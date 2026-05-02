import { collection, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { db } from '../js/firebase.js';

const customersRef = collection(db, "customers");
let customersDataList = [];
let quill; // متغير المحرر

// تهيئة محرر Quill
function initQuill() {
    if (!quill) {
        quill = new Quill('#editor', {
            theme: 'snow',
            placeholder: 'اكتب الملاحظات التفصيلية هنا...',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'color': [] }, { 'background': [] }],
                    ['clean']
                ]
            }
        });
    }
}

async function loadCustomers() {
    const tbody = document.getElementById('customers-tbody');
    try {
        const querySnapshot = await getDocs(customersRef);
        tbody.innerHTML = '';
        customersDataList = [];

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            data.id = docSnap.id;
            customersDataList.push(data);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${tbody.children.length + 1}</td>
                <td class="sticky-col"><strong>${data.name || '-'}</strong></td>
                <td>${data.phone || '-'}</td>
                <td>${data.city || 'حائل'}</td>
                <td><span class="status-badge">${data.accountStatus || 'جديد'}</span></td>
                <td><span class="category-badge">${data.customerCategory || 'عادي'}</span></td>
                <td>${data.quickNote || '-'}</td>
                <td>${data.createdAt ? new Date(data.createdAt).toLocaleDateString('ar-SA') : '-'}</td>
                <td class="sticky-col-right">
                    <button class="action-btn edit" onclick="openEditModal('${data.id}')">✏️</button>
                    <button class="action-btn print" onclick="window.print()">🖨️</button>
                    <button class="action-btn delete" onclick="deleteCustomer('${data.id}')">🗑️</button>
                </td>`;
            tbody.appendChild(row);
        });
        document.getElementById('customers-count').innerText = customersDataList.length;
    } catch (e) { console.error(e); }
}

window.openEditModal = (id) => {
    const c = customersDataList.find(item => item.id === id);
    if (!c) return;
    
    initQuill(); // تشغيل المحرر عند الفتح
    
    document.getElementById('edit-doc-id').value = id;
    document.getElementById('edit-name').value = c.name || '';
    document.getElementById('edit-phone').value = c.phone || '';
    document.getElementById('edit-accountStatus').value = c.accountStatus || 'جديد';
    document.getElementById('edit-customerCategory').value = c.customerCategory || 'عادي';
    document.getElementById('edit-quickNote').value = c.quickNote || 'سريع التجاوب';
    
    // تحميل المحتوى للمحرر المتقدم
    quill.root.innerHTML = c.detailedNotes || '';
    
    document.getElementById('edit-customer-modal').classList.add('active');
};

document.getElementById('edit-customer-form').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-doc-id').value;
    
    // سحب المحتوى من محرر Quill
    const detailedNotes = quill.root.innerHTML;

    try {
        await updateDoc(doc(db, "customers", id), {
            name: document.getElementById('edit-name').value,
            accountStatus: document.getElementById('edit-accountStatus').value,
            customerCategory: document.getElementById('edit-customerCategory').value,
            quickNote: document.getElementById('edit-quickNote').value,
            detailedNotes: detailedNotes, // حفظ الملاحظات المنسقة
            updatedAt: new Date().toISOString()
        });
        alert("تم تحديث ملف العميل بنجاح");
        window.closeEditModal();
        loadCustomers();
    } catch (err) { console.error(err); }
};

window.deleteCustomer = async (id) => {
    if (confirm("حذف العميل؟")) {
        await deleteDoc(doc(db, "customers", id));
        loadCustomers();
    }
};

window.closeEditModal = () => document.getElementById('edit-customer-modal').classList.remove('active');

document.addEventListener('DOMContentLoaded', loadCustomers);

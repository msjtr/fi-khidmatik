import { collection, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { db } from '../js/firebase.js';

const customersRef = collection(db, "customers");
let customersDataList = [];
let quill;

function initQuill() {
    if (!quill) {
        quill = new Quill('#editor', {
            theme: 'snow',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
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
                <td>${data.countryCode || '+966'}</td>
                <td>${data.email || '-'}</td>
                <td>${data.country || '-'}</td>
                <td>${data.city || '-'}</td>
                <td>${data.district || '-'}</td>
                <td>${data.street || '-'}</td>
                <td>${data.buildingNo || '-'}</td>
                <td>${data.additionalNo || '-'}</td>
                <td>${data.postalCode || '-'}</td>
                <td>${data.poBox || '-'}</td>
                <td>${data.createdAt ? new Date(data.createdAt).toLocaleDateString('ar-SA') : '-'}</td>
                <td><span class="badge-status">${data.accountStatus || 'جديد'}</span></td>
                <td><span class="badge-cat">${data.customerCategory || 'عادي'}</span></td>
                <td>${data.quickNote || '-'}</td>
                <td class="sticky-col-right">
                    <button class="btn-action edit" onclick="openEditModal('${data.id}')" title="تعديل">✏️</button>
                    <button class="btn-action print" onclick="window.print()" title="طباعة">🖨️</button>
                    <button class="btn-action account" onclick="openEditModal('${data.id}')" title="إجراء على الحساب">⚙️</button>
                    <button class="btn-action delete" onclick="deleteCustomer('${data.id}')" title="حذف">🗑️</button>
                </td>`;
            tbody.appendChild(row);
        });
        document.getElementById('customers-count').innerText = customersDataList.length;
    } catch (e) { console.error(e); }
}

window.openEditModal = (id) => {
    const c = customersDataList.find(item => item.id === id);
    if (!c) return;
    
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
    document.getElementById('edit-quickNote').value = c.quickNote || 'سريع التجاوب';
    
    quill.root.innerHTML = c.detailedNotes || '';
    
    document.getElementById('edit-customer-modal').classList.add('active');
};

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
        alert("تم تحديث الحساب والبيانات");
        window.closeEditModal();
        loadCustomers();
    } catch (err) { console.error(err); }
};

window.deleteCustomer = async (id) => {
    if (confirm("هل تريد حذف العميل نهائياً؟")) {
        await deleteDoc(doc(db, "customers", id));
        loadCustomers();
    }
};

window.closeEditModal = () => document.getElementById('edit-customer-modal').classList.remove('active');

document.addEventListener('DOMContentLoaded', loadCustomers);

import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-storage.js";
import { db, storage } from '../js/firebase.js';

const currentEmployee = "Mohammad Al-Shammari"; 
let customersDataList = [];
let quill;

function initQuill() {
    if (!quill) { quill = new Quill('#editor', { theme: 'snow' }); }
}

// عرض الـ 18 عموداً في الجدول[cite: 2]
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
                <td class="sticky-col"><strong>${data.name || '-'}</strong></td>
                <td>${data.phone || '-'}</td>
                <td>${data.countryCode || '-'}</td>
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
                <td>${data.accountStatus || 'جديد'}</td>
                <td>${data.customerCategory || 'عادي'}</td>
                <td>${data.quickNote || '-'}</td>
                <td class="sticky-actions actions-cell">
                    <span class="action-link edit-btn" onclick="openEditModal('${data.id}')">تعديل</span> |
                    <span class="action-link view-btn" onclick="viewCustomerDetails('${data.id}')">عرض</span> |
                    <span class="action-link print-btn" onclick="window.print()">طباعة</span> |
                    <span class="action-link delete-btn" onclick="deleteCustomer('${data.id}')">حذف</span>
                </td>
            `;
            tbody.appendChild(row);
        });
        document.getElementById('customers-count').innerText = customersDataList.length;
    } catch (e) { console.error("فشل الاتصال بالقاعدة الجديدة:", e); }
}

// نظام رفع المرفقات وسجل العمليات
async function handleUpload(id) {
    const fileInput = document.getElementById('new-file-input');
    const nameInput = document.getElementById('new-file-name');
    const btn = document.getElementById('upload-btn');
    if(!fileInput.files[0] || !nameInput.value) return alert("أكمل بيانات المرفق");

    btn.innerText = "جاري الرفع..."; btn.disabled = true;
    try {
        const fileRef = ref(storage, `docs/${id}/${Date.now()}_${fileInput.files[0].name}`);
        const snap = await uploadBytes(fileRef, fileInput.files[0]);
        const url = await getDownloadURL(snap.ref);

        const cDoc = await getDoc(doc(db, "customers", id));
        const list = cDoc.data().attachments || [];
        const newEntry = { 
            fileId: Date.now().toString(), 
            fileName: nameInput.value, 
            fileUrl: url, 
            addedBy: currentEmployee, 
            addedAt: new Date().toISOString(), 
            status: 'active', 
            deletedAt: null 
        };
        
        await updateDoc(doc(db, "customers", id), { attachments: [...list, newEntry] });
        renderFilesLog([...list, newEntry], id);
        alert("تم الرفع بنجاح للقاعدة الجديدة");
        nameInput.value = ''; fileInput.value = '';
    } catch(e) { alert("خطأ في الرفع"); console.error(e); }
    finally { btn.innerText = "رفع"; btn.disabled = false; }
}

// حفظ البيانات في القاعدة الجديدة[cite: 1]
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
        alert("تم تحديث البيانات بنجاح");
        window.closeEditModal(); loadCustomers();
    } catch(e) { console.error("فشل التحديث:", e); }
};

// باقي الدوال البرمجية المساعدة (سجل العمليات، العرض، الحذف) تبقى كما هي
// ...
document.addEventListener('DOMContentLoaded', loadCustomers);

import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-storage.js";
import { db, storage } from '../js/firebase.js';

const customersRef = collection(db, "customers");
let customersDataList = [];
let quill;

// 1. تهيئة محرر Quill المتقدم (بتنسيق Word)
function initQuill() {
    if (!quill) {
        quill = new Quill('#editor', {
            theme: 'snow',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline'],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['clean']
                ]
            }
        });
    }
}

// 2. تحميل الجدول بكافة الأعمدة الـ 18 المطلوبة
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
            // الترتيب الدقيق للأعمدة الـ 18 المطلوبة
            row.innerHTML = `
                <td>${tbody.children.length + 1}</td> <!-- 1. التسلسل -->
                <td class="sticky-col"><strong>${data.name || '-'}</strong></td> <!-- 2. اسم العميل -->
                <td>${data.phone || '-'}</td> <!-- 3. الجوال -->
                <td>${data.countryCode || '+966'}</td> <!-- 4. مفتاح الدولة -->
                <td>${data.email || '-'}</td> <!-- 5. البريد الإلكتروني -->
                <td>${data.country || '-'}</td> <!-- 6. الدولة -->
                <td>${data.city || '-'}</td> <!-- 7. المدينة -->
                <td>${data.district || '-'}</td> <!-- 8. الحي -->
                <td>${data.street || '-'}</td> <!-- 9. الشارع -->
                <td>${data.buildingNo || '-'}</td> <!-- 10. المبنى -->
                <td>${data.additionalNo || '-'}</td> <!-- 11. الإضافي -->
                <td>${data.postalCode || '-'}</td> <!-- 12. الرمز البريدي -->
                <td>${data.poBox || '-'}</td> <!-- 13. صندوق البريد -->
                <td>${data.createdAt ? new Date(data.createdAt).toLocaleDateString('ar-SA') : '-'}</td> <!-- 14. تاريخ الإضافة -->
                <td><span class="badge ${getStatusClass(data.accountStatus)}">${data.accountStatus || 'جديد'}</span></td> <!-- 15. حالة الحساب -->
                <td>${data.customerCategory || 'عادي'}</td> <!-- 16. تصنيف العميل -->
                <td>${data.quickNote || '-'}</td> <!-- 17. الملاحظات (سلوك العميل) -->
                <td class="sticky-col-right"> <!-- 18. الإجراءات -->
                    <button class="action-btn edit" onclick="openEditModal('${data.id}')" title="تعديل">✏️</button>
                    <button class="action-btn attach" onclick="viewOnlyAttachments('${data.id}')" title="عرض المرفقات">📎</button>
                    <button class="action-btn print" onclick="window.print()" title="طباعة">🖨️</button>
                    <button class="action-btn delete" onclick="deleteCustomer('${data.id}')" title="حذف">🗑️</button>
                </td>
            `;
            tbody.appendChild(row);
        });
        document.getElementById('customers-count').innerText = customersDataList.length;
    } catch (e) { console.error("خطأ في جلب البيانات:", e); }
}

// 3. تصنيف ألوان الحالة (للتوافق مع CSS المحدث)
function getStatusClass(status) {
    if(status === 'نشط') return 'status-active';
    if(status === 'موقوف') return 'status-paused';
    if(status === 'محظور') return 'status-blocked';
    return '';
}

// 4. فتح نافذة التعديل وتحميل كافة بيانات الحقول[cite: 2]
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
    
    quill.root.innerHTML = c.detailedNotes || ''; // محرر النصوص المنسقة
    renderFilesList(c.attachments || [], 'files-list', id); // عرض المرفقات
    
    document.getElementById('upload-btn').onclick = () => handleUpload(id);
    document.getElementById('edit-customer-modal').classList.add('active');
};

// 5. رفع الملفات السحابية (Firebase Storage)
async function handleUpload(customerId) {
    const fileInput = document.getElementById('new-file-input');
    const nameInput = document.getElementById('new-file-name');
    const file = fileInput.files[0];
    
    if(!file || !nameInput.value) return alert("يرجى اختيار ملف وكتابة اسم الوثيقة");
    
    const filePath = `customers/${customerId}/${Date.now()}_${file.name}`;
    const fileRef = ref(storage, filePath);
    try {
        const snap = await uploadBytes(fileRef, file);
        const url = await getDownloadURL(snap.ref);
        
        const cDoc = await getDoc(doc(db, "customers", customerId));
        const oldFiles = cDoc.data().attachments || [];
        
        const newFile = { 
            name: nameInput.value, 
            url: url, 
            path: filePath, // حفظ المسار للحذف لاحقاً
            type: file.type, 
            date: new Date().toISOString() 
        };
        const updatedFiles = [...oldFiles, newFile];
        
        await updateDoc(doc(db, "customers", customerId), { attachments: updatedFiles });
        
        renderFilesList(updatedFiles, 'files-list', customerId);
        nameInput.value = ''; fileInput.value = '';
        alert("تم رفع المرفق بنجاح");
        loadCustomers(); 
    } catch(e) { console.error("خطأ في الرفع:", e); }
}

// 6. عرض قائمة الملفات مع ميزة الحذف الفردي[cite: 1]
function renderFilesList(files, containerId, customerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = files.map((f, index) => `
        <div class="attachment-item">
            <span><strong>${f.name}</strong></span>
            <div>
                <a href="${f.url}" target="_blank" style="color:#3498db; text-decoration:none; margin-left:10px;">👁️ عرض</a>
                <button type="button" onclick="deleteSingleFile('${customerId}', ${index})" style="color:#e74c3c; border:none; background:none; cursor:pointer;">🗑️ حذف</button>
            </div>
        </div>
    `).join('') || '<p style="color:gray; font-size:0.9em;">لا توجد مرفقات حالياً</p>';
}

// ميزة جديدة: حذف مرفق واحد فقط من القائمة
window.deleteSingleFile = async (customerId, index) => {
    if(!confirm("هل تود حذف هذا المرفق نهائياً؟")) return;
    try {
        const cDoc = await getDoc(doc(db, "customers", customerId));
        let files = cDoc.data().attachments || [];
        const fileToDelete = files[index];

        // 1. حذف الملف من Storage
        if(fileToDelete.path) {
            const fileRef = ref(storage, fileToDelete.path);
            await deleteObject(fileRef);
        }

        // 2. تحديث قائمة Firestore
        files.splice(index, 1);
        await updateDoc(doc(db, "customers", customerId), { attachments: files });
        
        renderFilesList(files, 'files-list', customerId);
        alert("تم حذف المرفق");
        loadCustomers();
    } catch(e) { console.error("خطأ في حذف المرفق:", e); }
};

// 7. عرض المرفقات السريع من الجدول (أيقونة المشبك 📎)[cite: 1]
window.viewOnlyAttachments = (id) => {
    const c = customersDataList.find(item => item.id === id);
    renderFilesList(c.attachments || [], 'only-files-list', id);
    document.getElementById('view-files-modal').classList.add('active');
};

// 8. حفظ التعديلات الشاملة لجميع الحقول[cite: 2]
document.getElementById('edit-customer-form').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-doc-id').value;
    const saveBtn = e.target.querySelector('button[type="submit"]');
    saveBtn.disabled = true;
    saveBtn.innerText = "جارِ الحفظ...";

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
            detailedNotes: quill.root.innerHTML, // محتوى Word المنسق
            updatedAt: new Date().toISOString()
        });
        alert("تم تحديث كافة البيانات بنجاح");
        window.closeEditModal();
        loadCustomers();
    } catch(e) { 
        console.error("خطأ في التحديث:", e);
        alert("فشل التحديث، يرجى المحاولة لاحقاً");
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerText = "حفظ كافة البيانات";
    }
};

// 9. حذف العميل بالكامل
window.deleteCustomer = async (id) => {
    if(confirm("تحذير: سيتم حذف العميل وكافة بياناته نهائياً. هل أنت متأكد؟")) {
        try {
            await deleteDoc(doc(db, "customers", id));
            loadCustomers();
        } catch(e) { console.error("خطأ في الحذف:", e); }
    }
};

window.closeEditModal = () => document.getElementById('edit-customer-modal').classList.remove('active');

document.addEventListener('DOMContentLoaded', loadCustomers);

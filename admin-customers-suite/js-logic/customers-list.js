import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-storage.js";
import { db, storage } from '../js/firebase.js';

const currentEmployee = "محمد بن صالح الشمري"; // الموظف المسؤول للرقابة الإدارية
let customersDataList = [];
let quill;

/**
 * تهيئة محرر Quill بتنسيقات Word المتقدمة ودعم الاتجاه العربي
 */
function initQuill() {
    if (!quill) { 
        quill = new Quill('#editor', { 
            theme: 'snow',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, false] }],
                    ['bold', 'italic', 'underline'],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'direction': 'rtl' }, { 'align': [] }],
                    ['clean']
                ]
            }
        }); 
        quill.format('direction', 'rtl'); 
    }
}

/**
 * 1. تحميل البيانات وتحديث الملخص الإحصائي المطور (Dashboard)
 */
async function loadCustomers() {
    const tbody = document.getElementById('customers-tbody');
    try {
        const querySnapshot = await getDocs(query(collection(db, "customers"), orderBy("createdAt", "desc")));
        customersDataList = [];
        
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data(); 
            data.id = docSnap.id;
            customersDataList.push(data);
        });

        updateDashboard(customersDataList);
        renderTable(customersDataList);
        
    } catch (e) { console.error("خطأ في مزامنة بيانات القاعدة:", e); }
}

/**
 * 2. تحديث لوحة الإحصائيات (Dashboard) مقسمة على السطرين
 */
function updateDashboard(data) {
    const now = new Date();
    const stats = {
        total: data.length,
        completeAddress: data.filter(c => c.city && c.district && c.street && c.buildingNo).length,
        thisMonth: data.filter(c => {
            if(!c.createdAt) return false;
            const d = new Date(c.createdAt);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length,
        new: data.filter(c => c.accountStatus === 'جديد').length,
        active: data.filter(c => c.accountStatus === 'نشط').length,
        suspended: data.filter(c => c.accountStatus === 'موقوف').length,
        blocked: data.filter(c => c.accountStatus === 'محظور').length,
        vip: data.filter(c => c.customerCategory === 'VIP').length,
        premium: data.filter(c => c.customerCategory === 'مميز').length,
        normal: data.filter(c => c.customerCategory === 'عادي').length,
        potential: data.filter(c => c.customerCategory === 'محتمل').length,
        quickResp: data.filter(c => c.quickNote === 'سريع التجاوب').length,
        lateResp: data.filter(c => c.quickNote === 'يتاخر في الرد' || c.quickNote === 'يتأخر في الرد').length,
        highOrders: data.filter(c => c.quickNote === 'كثير الطلبات').length,
        needFollow: data.filter(c => c.quickNote === 'حاجة لمتابعة').length
    };

    document.getElementById('stat-total').innerText = stats.total;
    document.getElementById('stat-complete').innerText = stats.completeAddress;
    document.getElementById('stat-month').innerText = stats.thisMonth;
    document.getElementById('count-new').innerText = stats.new;
    document.getElementById('count-active').innerText = stats.active;
    document.getElementById('count-suspended').innerText = stats.suspended;
    document.getElementById('count-blocked').innerText = stats.blocked;
    document.getElementById('count-vip').innerText = stats.vip;
    document.getElementById('count-premium').innerText = stats.premium;
    document.getElementById('count-normal').innerText = stats.normal;
    document.getElementById('count-potential').innerText = stats.potential;
    document.getElementById('count-quickResp').innerText = stats.quickResp;
    document.getElementById('count-lateResp').innerText = stats.lateResp;
    document.getElementById('count-highOrders').innerText = stats.highOrders;
    document.getElementById('count-needFollow').innerText = stats.needFollow;
}

/**
 * 3. نظام الفلترة المتقدم والبحث الذكي بالمنطقة
 */
window.filterCustomers = () => {
    const statusVal = document.getElementById('filter-status').value;
    const categoryVal = document.getElementById('filter-category').value;
    const noteVal = document.getElementById('filter-note').value;
    const regionVal = document.getElementById('filter-region').value.toLowerCase();

    const filtered = customersDataList.filter(c => {
        return (statusVal === '' || c.accountStatus === statusVal) &&
               (categoryVal === '' || c.customerCategory === categoryVal) &&
               (noteVal === '' || c.quickNote === noteVal) &&
               (regionVal === '' || 
                    (c.city && c.city.toLowerCase().includes(regionVal)) || 
                    (c.district && c.district.toLowerCase().includes(regionVal)));
    });

    renderTable(filtered);
    updateDashboard(filtered); 
};

/**
 * 4. رسم الجدول بالـ 18 عموداً وسجل العمليات
 */
function renderTable(data) {
    const tbody = document.getElementById('customers-tbody');
    tbody.innerHTML = '';

    data.forEach((c, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td class="sticky-col"><strong>${c.name || '-'}</strong></td>
            <td>${c.phone || '-'}</td>
            <td>${c.countryCode || '-'}</td>
            <td>${c.email || '-'}</td>
            <td>${c.country || '-'}</td>
            <td>${c.city || '-'}</td>
            <td>${c.district || '-'}</td>
            <td>${c.street || '-'}</td>
            <td>${c.buildingNo || '-'}</td>
            <td>${c.additionalNo || '-'}</td>
            <td>${c.postalCode || '-'}</td>
            <td>${c.poBox || '-'}</td>
            <td>${c.createdAt ? new Date(c.createdAt).toLocaleDateString('ar-SA') : '-'}</td>
            <td><span class="status-tag">${c.accountStatus || 'جديد'}</span></td>
            <td>${c.customerCategory || 'عادي'}</td>
            <td>${c.quickNote || '-'}</td>
            <td class="sticky-actions">
                <span class="action-btn" title="تعديل" onclick="openEditModal('${c.id}')">⚙️</span>
                <span class="action-btn" title="عرض" onclick="viewCustomerDetails('${c.id}')">👁️</span>
                <span class="action-btn" title="حذف" onclick="deleteCustomer('${c.id}')">🗑️</span>
            </td>
        `;
        tbody.appendChild(row);
    });
}

document.addEventListener('DOMContentLoaded', loadCustomers);

/* ==============================================================
   5. دوال التحكم بالعملاء (تعديل، حفظ، عرض، حذف) والمرفقات
============================================================== */

window.closeEditModal = () => document.getElementById('edit-customer-modal').classList.remove('active');

// دالة فتح التعديل وتعبئة كافة الحقول
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
    document.getElementById('edit-quickNote').value = c.quickNote || 'سريع التجاوب';
    
    quill.root.innerHTML = c.detailedNotes || '';
    
    renderFilesLog(c.attachments || [], id); // تحميل سجل المرفقات
    document.getElementById('edit-customer-modal').classList.add('active');
};

// دالة حفظ التعديلات
document.getElementById('edit-customer-form').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-doc-id').value;
    const btn = e.target.querySelector('.save-btn');
    
    btn.innerText = "جاري الحفظ..."; 
    btn.disabled = true;

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
            updatedAt: new Date().toISOString(),
            updatedBy: currentEmployee
        });
        alert("تم تحديث بيانات العميل بنجاح");
        window.closeEditModal();
        loadCustomers();
    } catch(err) {
        console.error(err);
        alert("حدث خطأ أثناء الحفظ، يرجى المحاولة مرة أخرى.");
    } finally {
        btn.innerText = "حفظ كافة التعديلات"; 
        btn.disabled = false;
    }
};

// دالة العرض الشامل
window.viewCustomerDetails = (id) => {
    const c = customersDataList.find(i => i.id === id);
    const body = document.getElementById('view-details-body');
    body.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:20px;">
            <p><strong>الاسم:</strong> ${c.name || '-'}</p>
            <p><strong>الجوال:</strong> <span dir="ltr">${c.countryCode || ''} ${c.phone || '-'}</span></p>
            <p><strong>البريد:</strong> ${c.email || '-'}</p>
            <p><strong>العنوان:</strong> ${c.city || '-'} - ${c.district || '-'}</p>
            <p><strong>الحالة:</strong> <span class="status-tag">${c.accountStatus || '-'}</span></p>
            <p><strong>التصنيف:</strong> ${c.customerCategory || '-'}</p>
        </div>
        <hr style="border:0; border-top:1px solid #eee; margin:15px 0;">
        <div style="background:#f8fafc; padding:15px; border-radius:8px; margin-top:10px;">
            <strong>الملاحظات التفصيلية:</strong><br><br>
            ${c.detailedNotes || 'لا توجد ملاحظات مسجلة.'}
        </div>
    `;
    document.getElementById('view-customer-modal').classList.add('active');
};

// دالة الحذف
window.deleteCustomer = async (id) => {
    if(confirm("هل أنت متأكد من حذف هذا العميل نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.")) {
        try {
            await deleteDoc(doc(db, "customers", id));
            alert("تم حذف العميل بنجاح من النظام");
            loadCustomers();
        } catch (e) { console.error(e); alert("خطأ في عملية الحذف"); }
    }
};

/* ==============================================================
   6. نظام رفع وإدارة المرفقات (سجل رقابي)
============================================================== */

document.getElementById('upload-btn').onclick = async () => {
    const id = document.getElementById('edit-doc-id').value;
    const fileInput = document.getElementById('new-file-input');
    const nameInput = document.getElementById('new-file-name');
    const uploadBtn = document.getElementById('upload-btn');

    if(!fileInput.files[0] || !nameInput.value) return alert("الرجاء إدخال اسم الملف واختياره أولاً.");

    uploadBtn.innerText = "جاري الرفع..."; 
    uploadBtn.disabled = true;
    
    try {
        const fileRef = ref(storage, `customers_docs/${id}/${Date.now()}_${fileInput.files[0].name}`);
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
        alert("تم رفع المرفق وتوثيقه في السجل بنجاح");
        
        nameInput.value = ''; fileInput.value = '';
    } catch(e) { 
        alert("فشل الرفع، تأكد من الاتصال بالإنترنت."); 
        console.error(e); 
    } finally { 
        uploadBtn.innerText = "رفع المرفق"; 
        uploadBtn.disabled = false; 
    }
};

function renderFilesLog(files, id) {
    const list = document.getElementById('files-log-list');
    list.innerHTML = files.map(f => `
        <tr style="${f.status === 'deleted' ? 'background:#fff1f0; color:#e74c3c;' : ''}">
            <td>${f.status === 'active' ? `<a href="${f.fileUrl}" target="_blank" style="color:#3498db;">${f.fileName}</a>` : `<s style="color:#e74c3c;">${f.fileName}</s>`}</td>
            <td>${f.addedBy}</td>
            <td>${new Date(f.addedAt).toLocaleDateString('ar-SA')}</td>
            <td>${f.deletedAt ? new Date(f.deletedAt).toLocaleDateString('ar-SA') : '-'}</td>
            <td>
                ${f.status === 'active' ? `<button type="button" class="action-btn" style="color:#e74c3c; font-size:1.1rem;" onclick="deleteAttachment('${id}', '${f.fileId}')" title="حذف">🗑️</button>` : 'محذوف'}
            </td>
        </tr>
    `).join('') || '<tr><td colspan="5" style="text-align:center; padding:15px;">لا يوجد مرفقات مسجلة لهذا العميل</td></tr>';
}

window.deleteAttachment = async (customerId, fId) => {
    if(!confirm("هل تريد حذف المرفق من السجل؟ (سيتم تعليمه كمحذوف للرقابة الإدارية ولن يُحذف نهائياً)")) return;
    try {
        const cDoc = await getDoc(doc(db, "customers", customerId));
        const list = cDoc.data().attachments || [];
        // تحديث حالة الملف إلى محذوف ليبقى في السجل
        const updated = list.map(f => f.fileId === fId ? { ...f, status: 'deleted', deletedAt: new Date().toISOString() } : f);
        await updateDoc(doc(db, "customers", customerId), { attachments: updated });
        renderFilesLog(updated, customerId);
    } catch(e) { console.error(e); }
};

// 1. استيراد المكتبات (تم تثبيت الإصدار 12.12.1 لضمان التوافق مع ملف firebase.js الخاص بك)
import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-storage.js";
import { db, storage } from '../js/firebase.js';

const currentEmployee = "محمد بن صالح الشمري"; 
let customersDataList = [];
let quill;

/**
 * تهيئة محرر Quill بتنسيقات متقدمة ودعم الاتجاه العربي
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
 * 1. تحميل البيانات وتحديث لوحة الإحصائيات (Dashboard)
 */
async function loadCustomers() {
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
        
    } catch (e) { 
        console.error("خطأ في مزامنة بيانات القاعدة:", e); 
    }
}

/**
 * 2. تحديث لوحة الإحصائيات (Dashboard)
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

    // تعبئة الأرقام في الواجهة
    const elements = {
        'stat-total': stats.total, 'stat-complete': stats.completeAddress, 'stat-month': stats.thisMonth,
        'count-new': stats.new, 'count-active': stats.active, 'count-suspended': stats.suspended,
        'count-blocked': stats.blocked, 'count-vip': stats.vip, 'count-premium': stats.premium,
        'count-normal': stats.normal, 'count-potential': stats.potential, 'count-quickResp': stats.quickResp,
        'count-lateResp': stats.lateResp, 'count-highOrders': stats.highOrders, 'count-needFollow': stats.needFollow
    };

    Object.keys(elements).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = elements[id];
    });
}

/**
 * 3. نظام الفلترة المتقدم والبحث الذكي
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
 * 4. رسم الجدول بالتنسيق الصحيح
 */
function renderTable(data) {
    const tbody = document.getElementById('customers-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    data.forEach((c, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="sticky-col">
                <span style="color:#6A7B9C; font-weight:bold; margin-left:8px;">${index + 1} -</span>
                <strong>${c.name || '-'}</strong>
            </td>
            <td><span dir="ltr" style="font-weight:bold; color:#2D3748;">${c.phone || '-'}</span></td>
            <td><span dir="ltr" style="font-weight:bold; color:#6A7B9C;">${c.countryCode || '-'}</span></td>
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
                <div class="actions-wrapper">
                    <button class="action-link view" onclick="viewCustomerDetails('${c.id}')">عرض</button>
                    <span class="action-divider"></span>
                    <button class="action-link edit" onclick="openEditModal('${c.id}')">تعديل</button>
                    <span class="action-divider"></span>
                    <button class="action-link print" onclick="printCustomer('${c.id}')">طباعة</button>
                    <span class="action-divider"></span>
                    <button class="action-link delete" onclick="deleteCustomer('${c.id}')">حذف</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

document.addEventListener('DOMContentLoaded', loadCustomers);

/* ==============================================================
   5. دوال التحكم بالعملاء
============================================================== */

window.closeEditModal = () => document.getElementById('edit-customer-modal').classList.remove('active');

window.openEditModal = (id) => {
    const c = customersDataList.find(i => i.id === id);
    initQuill();
    
    const fields = [
        'name', 'phone', 'countryCode', 'email', 'country', 'city', 'district', 
        'street', 'buildingNo', 'additionalNo', 'postalCode', 'poBox', 
        'accountStatus', 'customerCategory', 'quickNote'
    ];

    document.getElementById('edit-doc-id').value = id;
    fields.forEach(field => {
        const el = document.getElementById(`edit-${field}`);
        if (el) el.value = c[field] || (field === 'accountStatus' ? 'جديد' : (field === 'customerCategory' ? 'عادي' : ''));
    });
    
    quill.root.innerHTML = c.detailedNotes || '';
    renderFilesLog(c.attachments || [], id);
    document.getElementById('edit-customer-modal').classList.add('active');
};

document.getElementById('edit-customer-form').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-doc-id').value;
    const btn = e.target.querySelector('.save-btn');
    
    btn.innerText = "جاري الحفظ..."; 
    btn.disabled = true;

    try {
        const updateData = {
            detailedNotes: quill.root.innerHTML,
            updatedAt: new Date().toISOString(),
            updatedBy: currentEmployee
        };

        const fields = [
            'name', 'phone', 'countryCode', 'email', 'country', 'city', 'district', 
            'street', 'buildingNo', 'additionalNo', 'postalCode', 'poBox', 
            'accountStatus', 'customerCategory', 'quickNote'
        ];

        fields.forEach(field => {
            updateData[field] = document.getElementById(`edit-${field}`).value;
        });

        await updateDoc(doc(db, "customers", id), updateData);
        alert("تم تحديث بيانات العميل بنجاح");
        window.closeEditModal();
        loadCustomers();
    } catch(err) {
        console.error(err);
        alert("حدث خطأ أثناء الحفظ.");
    } finally {
        btn.innerText = "حفظ كافة التعديلات"; 
        btn.disabled = false;
    }
};

/**
 * 🌟 نظام الطباعة الذكي
 */
window.printCustomer = (id) => {
    const isGitHub = window.location.hostname.includes("github.io");
    const printPageUrl = isGitHub 
        ? `https://msjtr.github.io/Fi-Khidmatik-by-Al-Itqan-Plus/admin-customers-suite/print-customer./print.html?id=${id}`
        : `/Fi-Khidmatik-by-Al-Itqan-Plus/admin-customers-suite/print-customer/print.html?id=${id}`;
    
    window.open(printPageUrl, '_blank');
};

window.deleteCustomer = async (id) => {
    if(confirm("هل أنت متأكد من حذف هذا العميل نهائياً؟")) {
        try {
            await deleteDoc(doc(db, "customers", id));
            alert("تم حذف العميل بنجاح");
            loadCustomers();
        } catch (e) { alert("خطأ في عملية الحذف"); }
    }
};

/* ==============================================================
   6. إدارة المرفقات
============================================================== */

document.getElementById('upload-btn').onclick = async () => {
    const id = document.getElementById('edit-doc-id').value;
    const fileInput = document.getElementById('new-file-input');
    const nameInput = document.getElementById('new-file-name');
    const uploadBtn = document.getElementById('upload-btn');

    if(!fileInput.files[0] || !nameInput.value) return alert("الرجاء إدخال اسم الملف واختياره.");

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
            status: 'active' 
        };

        await updateDoc(doc(db, "customers", id), { attachments: [...oldAttachments, newEntry] });
        renderFilesLog([...oldAttachments, newEntry], id);
        alert("تم الرفع بنجاح");
        nameInput.value = ''; fileInput.value = '';
    } catch(e) { alert("فشل الرفع."); } finally {
        uploadBtn.innerText = "رفع المرفق"; 
        uploadBtn.disabled = false; 
    }
};

function renderFilesLog(files, id) {
    const list = document.getElementById('files-log-list');
    if (!list) return;
    list.innerHTML = files.map(f => `
        <tr style="${f.status === 'deleted' ? 'background:#fff1f0; color:#e74c3c;' : ''}">
            <td>${f.status === 'active' ? `<a href="${f.fileUrl}" target="_blank" style="color:#3498db;">${f.fileName}</a>` : `<s style="color:#e74c3c;">${f.fileName}</s>`}</td>
            <td>${f.addedBy}</td>
            <td>${new Date(f.addedAt).toLocaleDateString('ar-SA')}</td>
            <td>${f.deletedAt ? new Date(f.deletedAt).toLocaleDateString('ar-SA') : '-'}</td>
            <td>
                ${f.status === 'active' ? `<button type="button" class="action-btn" onclick="deleteAttachment('${id}', '${f.fileId}')">🗑️</button>` : 'محذوف'}
            </td>
        </tr>
    `).join('') || '<tr><td colspan="5" style="text-align:center;">لا يوجد مرفقات</td></tr>';
}

window.deleteAttachment = async (customerId, fId) => {
    if(!confirm("هل تريد حذف المرفق؟")) return;
    try {
        const cDoc = await getDoc(doc(db, "customers", customerId));
        const list = cDoc.data().attachments || [];
        const updated = list.map(f => f.fileId === fId ? { ...f, status: 'deleted', deletedAt: new Date().toISOString() } : f);
        await updateDoc(doc(db, "customers", customerId), { attachments: updated });
        renderFilesLog(updated, customerId);
    } catch(e) { console.error(e); }
};

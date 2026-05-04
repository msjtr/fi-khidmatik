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

        // تحديث لوحة الإحصائيات (السطرين) والجدول
        updateDashboard(customersDataList);
        renderTable(customersDataList);
        
    } catch (e) { console.error("خطأ في مزامنة بيانات حائل:", e); }
}

/**
 * 2. تحديث لوحة الإحصائيات (Dashboard) مقسمة على السطرين المعتمدين
 */
function updateDashboard(data) {
    const now = new Date();
    const stats = {
        total: data.length,
        completeAddress: data.filter(c => c.city && c.district && c.street && c.buildingNo).length,
        thisMonth: data.filter(c => {
            const d = new Date(c.createdAt);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length,
        // الحالات الـ 4 المعتمدة
        new: data.filter(c => c.accountStatus === 'جديد').length,
        active: data.filter(c => c.accountStatus === 'نشط').length,
        suspended: data.filter(c => c.accountStatus === 'موقوف').length,
        blocked: data.filter(c => c.accountStatus === 'محظور').length,
        // التصنيفات الـ 4 المعتمدة
        vip: data.filter(c => c.customerCategory === 'VIP').length,
        premium: data.filter(c => c.customerCategory === 'مميز').length,
        normal: data.filter(c => c.customerCategory === 'عادي').length,
        potential: data.filter(c => c.customerCategory === 'محتمل').length,
        // الملاحظات السريعة الـ 4 المعتمدة
        quickResp: data.filter(c => c.quickNote === 'سريع التجاوب').length,
        lateResp: data.filter(c => c.quickNote === 'يتاخر في الرد').length,
        highOrders: data.filter(c => c.quickNote === 'كثير الطلبات').length,
        needFollow: data.filter(c => c.quickNote === 'حاجة لمتابعة').length
    };

    // تحديث الأرقام المرتبطة بأيقونات الـ 3D والملخص ذو السطرين
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
    updateDashboard(filtered); // الملخص يرتبط بالجدول فورياً لضمان دقة الرقابة
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

// تصدير الدوال للنافذة العالمية لضمان عمل أزرار onclick
window.closeEditModal = () => document.getElementById('edit-customer-modal').classList.remove('active');

window.openEditModal = (id) => {
    const c = customersDataList.find(i => i.id === id);
    initQuill();
    document.getElementById('edit-doc-id').value = id;
    document.getElementById('edit-name').value = c.name || '';
    quill.root.innerHTML = c.detailedNotes || '';
    document.getElementById('edit-customer-modal').classList.add('active');
};

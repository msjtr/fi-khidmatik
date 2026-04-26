/**
 * customers-ui.js - Fi-Khidmatik Professional Edition
 * موديول إدارة واجهة العملاء - الربط الكامل مع مجموعة customers
 */

import { db } from '../core/firebase.js';
import { 
    collection, 
    getDocs, 
    addDoc, 
    deleteDoc, 
    doc, 
    getDoc,
    updateDoc,
    serverTimestamp,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let editingId = null;
let quill = null; // لمحرر النصوص الاحترافي

// 1. دالة التشغيل الرئيسية
export async function initCustomersUI(container) {
    if (!container) return;
    
    // بناء الهيكل مع الأزرار والترجمة الواضحة
    container.innerHTML = `
        <div class="cust-ui-wrapper">
            <div class="action-bar card-glass">
                <div class="search-container">
                    <i class="fas fa-search"></i>
                    <input type="text" id="cust-filter" placeholder="بحث بالاسم، الجوال، أو المدينة...">
                </div>
                <div class="button-group">
                    <button class="btn-tera" onclick="openAddCustomer()" title="إضافة عميل جديد">
                        <i class="fas fa-user-plus"></i> <span>إضافة عميل</span>
                    </button>
                    <button class="btn-tera secondary" onclick="downloadExcelTemplate()" title="تحميل نموذج Excel">
                        <i class="fas fa-file-download"></i> <span>نموذج Excel</span>
                    </button>
                    <button class="btn-tera secondary" onclick="triggerImport()" title="استيراد عملاء">
                        <i class="fas fa-file-import"></i> <span>استيراد</span>
                    </button>
                </div>
            </div>

            <div class="table-responsive">
                <table class="tera-table">
                    <thead>
                        <tr>
                            <th>العميل</th>
                            <th>الاتصال</th>
                            <th>العنوان</th>
                            <th>تاريخ الإضافة</th>
                            <th class="sticky-actions">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-table-body">
                        <tr><td colspan="5" style="text-align:center; padding:50px;"><i class="fas fa-sync fa-spin"></i> جاري مزامنة بيانات تيرا...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // تهيئة محرر النصوص (Quill) إذا كان موجوداً في الـ HTML الرئيسي
    initRichTextEditor();
    
    // ربط الدوال بنافذة المتصفح لتعمل الأزرار (onclick)
    setupWindowBridge();
    
    await renderCustomerTable();
}

// 2. دالة عرض الجدول
export async function renderCustomerTable() {
    const tableBody = document.querySelector('#customers-table-body');
    if (!tableBody) return;

    try {
        const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        tableBody.innerHTML = '';

        if (querySnapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px;">لا يوجد عملاء حالياً في قاعدة بيانات تيra.</td></tr>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const d = doc.data();
            const dateStr = d.createdAt ? new Date(d.createdAt.seconds * 1000).toLocaleDateString('en-GB') : '---';
            
            tableBody.innerHTML += `
                <tr class="customer-row">
                    <td>
                        <div class="user-info">
                            <div class="user-avatar">${(d.name || '?').charAt(0)}</div>
                            <div>
                                <div class="user-name">${d.name || '---'}</div>
                                <div class="user-tag ${d.tag}">${d.tag || 'فرد'}</div>
                            </div>
                        </div>
                    </td>
                    <td dir="ltr"><b>${d.countryCode || ''} ${d.phone || ''}</b><br><small>${d.email || '-'}</small></td>
                    <td><small>${d.city || '-'} - ${d.district || '-'}</small></td>
                    <td>${dateStr}</td>
                    <td class="sticky-actions">
                        <button class="btn-action edit" onclick="editCustomer('${doc.id}')" title="تعديل"><i class="fas fa-pen"></i></button>
                        <button class="btn-action print" onclick="printCustomer('${doc.id}')" title="طباعة"><i class="fas fa-print"></i></button>
                        <button class="btn-action delete" onclick="deleteCustomer('${doc.id}')" title="حذف"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
        });
    } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
    }
}

// 3. الدوال الأساسية (إضافة، تعديل، حذف)
export async function openAddCustomer() {
    editingId = null;
    const form = document.getElementById('customer-form');
    if (form) form.reset();
    if (quill) quill.setContents([]);
    
    setModalTitle("➕ إضافة عميل جديد لتيرا");
    showModal(true);
}

export async function editCustomer(id) {
    editingId = id;
    try {
        const docRef = doc(db, "customers", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const d = docSnap.data();
            // تعبئة الحقول المستقلة
            fillFormField('cust-name', d.name);
            fillFormField('cust-phone', d.phone);
            fillFormField('cust-countryCode', d.countryCode);
            fillFormField('cust-email', d.email);
            fillFormField('cust-country', d.country);
            fillFormField('cust-city', d.city);
            fillFormField('cust-district', d.district);
            fillFormField('cust-street', d.street);
            fillFormField('cust-buildingNo', d.buildingNo);
            fillFormField('cust-additionalNo', d.additionalNo);
            fillFormField('cust-postalCode', d.postalCode);
            fillFormField('cust-poBox', d.poBox);
            fillFormField('cust-tag', d.tag);
            
            if (quill) quill.root.innerHTML = d.notes || '';

            setModalTitle("✏ تعديل بيانات العميل");
            showModal(true);
        }
    } catch (e) {
        console.error("خطأ في جلب بيانات التعديل:", e);
    }
}

export async function saveCustomer() {
    const data = {
        name: getVal('cust-name'),
        phone: getVal('cust-phone'),
        countryCode: getVal('cust-countryCode'),
        email: getVal('cust-email'),
        country: getVal('cust-country'),
        city: getVal('cust-city'),
        district: getVal('cust-district'),
        street: getVal('cust-street'),
        buildingNo: getVal('cust-buildingNo'),
        additionalNo: getVal('cust-additionalNo'),
        postalCode: getVal('cust-postalCode'),
        poBox: getVal('cust-poBox'),
        tag: getVal('cust-tag'),
        notes: quill ? quill.root.innerHTML : "",
        updatedAt: serverTimestamp()
    };

    try {
        if (editingId) {
            await updateDoc(doc(db, "customers", editingId), data);
        } else {
            data.createdAt = serverTimestamp();
            await addDoc(collection(db, "customers"), data);
        }
        closeCustomerModal();
        await renderCustomerTable();
    } catch (e) {
        alert("فشل الحفظ في قاعدة بيانات تيرا: " + e.message);
    }
}

export async function deleteCustomer(id) {
    if (confirm("⚠️ هل أنت متأكد من حذف هذا العميل نهائياً من مجموعة customers؟")) {
        try {
            await deleteDoc(doc(db, "customers", id));
            await renderCustomerTable();
        } catch (e) {
            console.error("خطأ أثناء الحذف:", e);
        }
    }
}

// 4. الدوال المساعدة (Helpers)
function initRichTextEditor() {
    const editorEl = document.getElementById('editor-container');
    if (editorEl && typeof Quill !== 'undefined') {
        quill = new Quill('#editor-container', {
            theme: 'snow',
            modules: { toolbar: true }
        });
    }
}

function setupWindowBridge() {
    window.openAddCustomer = openAddCustomer;
    window.editCustomer = editCustomer;
    window.deleteCustomer = deleteCustomer;
    window.saveCustomer = saveCustomer;
    window.closeCustomerModal = closeCustomerModal;
    window.printCustomer = (id) => window.open(`admin/modules/customer-print.html?id=${id}`, '_blank');
}

function showModal(show) {
    const modal = document.getElementById('customer-modal');
    if (modal) modal.style.display = show ? 'flex' : 'none';
}

function closeCustomerModal() { showModal(false); }
function setModalTitle(txt) { const t = document.getElementById('modal-title'); if(t) t.innerText = txt; }
function getVal(id) { const el = document.getElementById(id); return el ? el.value : ''; }
function fillFormField(id, val) { const el = document.getElementById(id); if(el) el.value = val || ''; }

// القوس النهائي لضمان سلامة الملف

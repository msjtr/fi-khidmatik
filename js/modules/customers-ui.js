/**
 * js/modules/customers-ui.js
 * نظام إدارة العملاء المتكامل - الإصدار V12.12.12
 * المطور: محمد بن صالح الشمري
 */

import { db } from '../core/firebase.js';
import { 
    collection, getDocs, addDoc, updateDoc, deleteDoc, doc, 
    query, orderBy, serverTimestamp, getDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// مصفوفة أسماء الحقول كما طلبت بدقة
const CUSTOMER_FIELDS = [
    "name", "phone", "countryCode", "email", "country", "city", 
    "district", "street", "buildingNo", "additionalNo", 
    "postalCode", "poBox", "tag", "notes"
];

export async function initCustomers(container) {
    if (!container) return;

    // 1. رسم الهيكل العام (الإحصائيات + أدوات التحكم + الجدول)
    container.innerHTML = `
        <div style="padding: 20px; font-family: 'Tajawal', sans-serif; direction: rtl;">
            <!-- قسم الإحصائيات -->
            <div id="customers-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 25px;">
                <div class="stat-card">جاري حساب الإحصائيات...</div>
            </div>

            <!-- أدوات التحكم -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background: #fff; padding: 15px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                <div style="display: flex; gap: 10px; align-items: center;">
                    <input type="text" id="main-search" placeholder="بحث باسم العميل أو الجوال..." style="padding: 10px; width: 300px; border: 1px solid #ddd; border-radius: 5px;">
                </div>
                <div style="display: flex; gap: 8px;">
                    <button id="btn-add-new" class="btn-primary" style="background:#e67e22; color:white; border:none; padding:10px 20px; border-radius:5px; cursor:pointer;"><i class="fas fa-plus"></i> إضافة عميل جديد</button>
                    <button id="btn-export" style="background:#27ae60; color:white; border:none; padding:10px 15px; border-radius:5px; cursor:pointer;"><i class="fas fa-file-export"></i> تصدير</button>
                    <button id="btn-import" style="background:#3498db; color:white; border:none; padding:10px 15px; border-radius:5px; cursor:pointer;"><i class="fas fa-file-import"></i> استيراد</button>
                </div>
            </div>

            <!-- الجدول التفصيلي -->
            <div style="background: white; border-radius: 10px; overflow-x: auto; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <table style="width: 100%; border-collapse: collapse; min-width: 1500px;">
                    <thead style="background: #f8f9fa; border-bottom: 2px solid #eee;">
                        <tr>
                            <th style="padding: 12px; text-align: center;">التسلسل</th>
                            <th style="padding: 12px;">اسم العميل</th>
                            <th style="padding: 12px;">الجوال</th>
                            <th style="padding: 12px;">مفتاح الدولة</th>
                            <th style="padding: 12px;">البريد الإلكتروني</th>
                            <th style="padding: 12px;">الدولة</th>
                            <th style="padding: 12px;">المدينة</th>
                            <th style="padding: 12px;">الحي</th>
                            <th style="padding: 12px;">الشارع</th>
                            <th style="padding: 12px;">المبنى</th>
                            <th style="padding: 12px;">الإضافي</th>
                            <th style="padding: 12px;">الرمز البريدي</th>
                            <th style="padding: 12px;">صندوق البريد</th>
                            <th style="padding: 12px;">تاريخ الإضافة</th>
                            <th style="padding: 12px;">الحالة</th>
                            <th style="padding: 12px;">التصنيف</th>
                            <th style="padding: 12px; text-align: center;">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-list-body">
                        <tr><td colspan="17" style="text-align:center; padding:30px;">جاري تحميل البيانات...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- النافذة المنبثقة (Modal) للإضافة والتعديل -->
        <div id="customer-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; justify-content:center; align-items:center;">
            <div style="background:white; width:90%; max-width:800px; padding:25px; border-radius:15px; max-height:90vh; overflow-y:auto;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; margin-bottom:20px; padding-bottom:10px;">
                    <h3 id="modal-title">إضافة عميل جديد</h3>
                    <button id="modal-close" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">&times;</button>
                </div>
                <form id="customer-form">
                    <input type="hidden" id="edit-id">
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;" id="fields-container">
                        <!-- الحقول ستنشأ برمجياً هنا -->
                    </div>
                    <div style="margin-top:20px; display:flex; justify-content:flex-end; gap:10px; border-top:1px solid #eee; padding-top:20px;">
                        <button type="button" id="btn-cancel" style="padding:10px 25px; border-radius:5px; border:1px solid #ccc; background:#fff; cursor:pointer;">إغلاق</button>
                        <button type="submit" style="padding:10px 35px; border-radius:5px; border:none; background:#e67e22; color:white; cursor:pointer; font-weight:bold;">حفظ البيانات</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // استدعاء الدوال التشغيلية
    setupEventListeners();
    loadAndRenderData();
}

/**
 * دالة تحميل البيانات والإحصائيات
 */
async function loadAndRenderData() {
    const tbody = document.getElementById('customers-list-body');
    const statsContainer = document.getElementById('customers-stats');

    try {
        const snap = await getDocs(query(collection(db, "customers"), orderBy("name", "asc")));
        let html = "";
        let count = 1;
        
        // إحصائيات أولية
        let stats = { total: snap.size, vip: 0, hail: 0 };

        snap.forEach(docSnap => {
            const c = docSnap.data();
            if (c.tag === 'vip') stats.vip++;
            if (c.city === 'حائل') stats.hail++;

            html += `
                <tr style="border-bottom:1px solid #eee; font-size:0.9rem;">
                    <td style="text-align:center; padding:12px;">${count++}</td>
                    <td style="padding:12px;"><strong>${c.name}</strong></td>
                    <td style="padding:12px;">${c.phone}</td>
                    <td style="padding:12px;">${c.countryCode || '+966'}</td>
                    <td style="padding:12px;">${c.email}</td>
                    <td style="padding:12px;">${c.country}</td>
                    <td style="padding:12px;">${c.city}</td>
                    <td style="padding:12px;">${c.district}</td>
                    <td style="padding:12px;">${c.street}</td>
                    <td style="padding:12px;">${c.buildingNo}</td>
                    <td style="padding:12px;">${c.additionalNo}</td>
                    <td style="padding:12px;">${c.postalCode}</td>
                    <td style="padding:12px;">${c.poBox}</td>
                    <td style="padding:12px;">${c.createdAt?.split('T')[0] || '---'}</td>
                    <td style="padding:12px;"><span style="color:green;">نشط</span></td>
                    <td style="padding:12px;"><span style="background:#eee; padding:2px 6px; border-radius:4px;">${c.tag || 'أفراد'}</span></td>
                    <td style="padding:12px; text-align:center; min-width:120px;">
                        <button onclick="window.editCustomer('${docSnap.id}')" style="color:#3498db; border:none; background:none; cursor:pointer; margin-left:8px;"><i class="fas fa-edit"></i></button>
                        <button onclick="window.printCustomer('${docSnap.id}')" style="color:#7f8c8d; border:none; background:none; cursor:pointer; margin-left:8px;"><i class="fas fa-print"></i></button>
                        <button onclick="window.deleteCustomer('${docSnap.id}')" style="color:#e74c3c; border:none; background:none; cursor:pointer;"><i class="fas fa-trash-alt"></i></button>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html || '<tr><td colspan="17">لا توجد بيانات</td></tr>';
        
        // تحديث واجهة الإحصائيات
        statsContainer.innerHTML = `
            <div style="background:#fff; padding:15px; border-radius:10px; border-right:5px solid #e67e22; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                <small style="color:#7f8c8d;">إجمالي العملاء</small><h3 style="margin:5px 0;">${stats.total}</h3>
            </div>
            <div style="background:#fff; padding:15px; border-radius:10px; border-right:5px solid #3498db; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                <small style="color:#7f8c8d;">عملاء VIP</small><h3 style="margin:5px 0;">${stats.vip}</h3>
            </div>
            <div style="background:#fff; padding:15px; border-radius:10px; border-right:5px solid #27ae60; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                <small style="color:#7f8c8d;">منطقة حائل</small><h3 style="margin:5px 0;">${stats.hail}</h3>
            </div>
        `;

    } catch (error) {
        console.error("Load Error:", error);
        tbody.innerHTML = '<tr><td colspan="17" style="color:red;">فشل جلب البيانات من السحابة</td></tr>';
    }
}

/**
 * إعداد الأزرار والعمليات
 */
function setupEventListeners() {
    const modal = document.getElementById('customer-modal');
    const form = document.getElementById('customer-form');
    const fieldsContainer = document.getElementById('fields-container');

    // توليد الحقول تلقائياً لضمان المطابقة
    fieldsContainer.innerHTML = CUSTOMER_FIELDS.map(field => `
        <div>
            <label style="display:block; font-size:0.8rem; margin-bottom:5px; color:#555;">${getLabelAr(field)}</label>
            <input type="text" id="f-${field}" name="${field}" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
        </div>
    `).join('');

    // زر إضافة جديد
    document.getElementById('btn-add-new').onclick = () => {
        form.reset();
        document.getElementById('edit-id').value = "";
        document.getElementById('modal-title').innerText = "إضافة عميل جديد لتيرا";
        modal.style.display = 'flex';
    };

    // إغلاق المودال
    document.getElementById('modal-close').onclick = () => modal.style.display = 'none';
    document.getElementById('btn-cancel').onclick = () => modal.style.display = 'none';

    // حفظ البيانات (حفظ حقيقي في Firestore)
    form.onsubmit = async (e) => {
        e.preventDefault();
        const editId = document.getElementById('edit-id').value;
        const formData = {};
        
        CUSTOMER_FIELDS.forEach(f => {
            formData[f] = document.getElementById(`f-${f}`).value;
        });

        try {
            if (editId) {
                await updateDoc(doc(db, "customers", editId), { ...formData, updatedAt: new Date().toISOString() });
                alert("تم تحديث بيانات العميل بنجاح");
            } else {
                await addDoc(collection(db, "customers"), { 
                    ...formData, 
                    createdAt: new Date().toISOString(),
                    status: "نشط"
                });
                alert("تمت إضافة العميل الجديد بنجاح");
            }
            modal.style.display = 'none';
            loadAndRenderData();
        } catch (error) {
            alert("خطأ في الحفظ: " + error.message);
        }
    };

    // وظائف عالمية للأزرار داخل الجدول
    window.deleteCustomer = async (id) => {
        if (confirm("هل أنت متأكد من حذف هذا العميل نهائياً؟")) {
            await deleteDoc(doc(db, "customers", id));
            loadAndRenderData();
        }
    };

    window.editCustomer = async (id) => {
        const docSnap = await getDoc(doc(db, "customers", id));
        if (docSnap.exists()) {
            const data = docSnap.data();
            document.getElementById('edit-id').value = id;
            document.getElementById('modal-title').innerText = "تعديل بيانات العميل";
            CUSTOMER_FIELDS.forEach(f => {
                document.getElementById(`f-${f}`).value = data[f] || "";
            });
            modal.style.display = 'flex';
        }
    };
    
    window.printCustomer = (id) => alert("جاري تجهيز تقرير العميل رقم: " + id);
}

function getLabelAr(key) {
    const labels = {
        name: "اسم العميل الكامل", phone: "رقم الجوال", countryCode: "مفتاح الدولة",
        email: "البريد الإلكتروني", country: "اسم الدولة", city: "المدينة",
        district: "الحي", street: "اسم الشارع", buildingNo: "رقم المبنى",
        additionalNo: "الرقم الإضافي", postalCode: "الرمز البريدي",
        poBox: "صندوق البريد", tag: "تصنيف العميل (VIP/أفراد)", notes: "ملاحظات إضافية"
    };
    return labels[key] || key;
}

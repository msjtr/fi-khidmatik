import { collection, addDoc, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { db } from '../js/firebase.js'; 

// الموظف المسؤول عن العمليات حالياً (تقييد إداري)
const currentEmployee = "محمد بن صالح الشمري"; 

/**
 * 1. تهيئة محرر Quill ليدعم كافة خصائص Word (جداول، ألوان، تنسيق عربي)
 */
const quill = new Quill('#editor-container', {
    theme: 'snow',
    placeholder: 'اكتب ملاحظات العميل هنا بخصائص Word المتقدمة...',
    modules: {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            [{ 'font': [] }],
            ['bold', 'italic', 'underline', 'strike'],        
            [{ 'color': [] }, { 'background': [] }],          
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'direction': 'rtl' }, { 'align': [] }],        
            ['link', 'image', 'video', 'blockquote'],
            ['clean']                                         
        ]
    }
});

// ضبط اتجاه المحرر للغة العربية افتراضياً
quill.format('direction', 'rtl');
quill.format('align', 'right');

/**
 * 2. دالة تحميل سجل العمليات في أسفل الصفحة (الرقابة الإدارية)
 */
async function loadOperationsLog() {
    const tbody = document.getElementById('operations-log-tbody');
    if (!tbody) return;

    try {
        // جلب آخر 10 عمليات إضافة مسجلة في القاعدة
        const q = query(collection(db, "customers"), orderBy("createdAt", "desc"), limit(10));
        const querySnapshot = await getDocs(q);
        tbody.innerHTML = '';

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const dateObj = new Date(data.createdAt);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${dateObj.toLocaleDateString('ar-SA')} | ${dateObj.toLocaleTimeString('ar-SA')}</td>
                <td><strong>${data.createdBy || 'محمد بن صالح'}</strong></td>
                <td>${data.name || '-'}</td>
                <td>${data.accountStatus || 'جديد'}</td>
                <td style="color: #27ae60; font-weight: bold;">إضافة عميل</td>
            `;
            tbody.appendChild(row);
        });
    } catch (e) {
        console.error("خطأ في تحميل سجل العمليات:", e);
    }
}

/**
 * 3. معالجة إرسال النموذج وحفظ البيانات
 */
const addForm = document.getElementById('add-customer-form');

addForm.onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submit-btn');
    
    // التحقق من رقم الجوال (يجب أن يبدأ بـ 5)
    const phoneInput = document.getElementById('cust-phone').value;
    if (!phoneInput.startsWith('5')) {
        alert("تنبيه يا أبا صالح: يجب أن يبدأ رقم الجوال بالرقم 5");
        return; 
    }

    btn.innerText = "جاري الحفظ والتقييد...";
    btn.disabled = true;

    try {
        // جمع كافة البيانات الـ 16 المطلوبة لضمان دقة السجل
        const customerData = {
            name: document.getElementById('cust-name').value,
            phone: phoneInput,
            countryCode: document.getElementById('cust-countryCode').value, // القيمة من قائمة البحث
            email: document.getElementById('cust-email').value,
            country: document.getElementById('cust-country').value,
            city: document.getElementById('cust-city').value,
            district: document.getElementById('cust-district').value,
            street: document.getElementById('cust-street').value,
            buildingNo: document.getElementById('cust-buildingNo').value,
            additionalNo: document.getElementById('cust-additionalNo').value,
            postalCode: document.getElementById('cust-postalCode').value,
            poBox: document.getElementById('cust-poBox').value,
            accountStatus: document.getElementById('cust-accountStatus').value,
            customerCategory: document.getElementById('cust-customerCategory').value,
            detailedNotes: quill.root.innerHTML, // الملاحظات المنسقة
            createdAt: new Date().toISOString(), // تاريخ الوقت بدقة
            createdBy: currentEmployee, // تقييد العملية باسم الموظف
            attachments: [] // مصفوفة المرفقات فارغة عند التأسيس
        };

        // الحفظ في قاعدة بيانات المشروع الجديد
        await addDoc(collection(db, "customers"), customerData);

        alert("تمت الإضافة بنجاح وتقييد الإجراء في السجل الإداري");

        // تفريغ الحقول وتحديث السجل فوراً
        addForm.reset(); 
        quill.setContents([]); 
        loadOperationsLog(); 

    } catch (error) {
        console.error("خطأ في الإضافة:", error);
        alert("حدث خطأ، تأكد من استقرار الإنترنت في مكتب حائل");
    } finally {
        btn.innerText = "حفظ وإضافة العميل";
        btn.disabled = false;
    }
};

// تشغيل السجل فور تحميل الصفحة
document.addEventListener('DOMContentLoaded', loadOperationsLog);

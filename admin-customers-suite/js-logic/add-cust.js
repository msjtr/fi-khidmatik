import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { db } from '../../js/firebase.js'; // التأكد من المسار لملف firebase.js المحدث

// تهيئة محرر Quill
const quill = new Quill('#editor-container', {
    theme: 'snow',
    placeholder: 'اكتب ملاحظات العميل هنا بخصائص Word...',
    modules: {
        toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            ['clean']
        ]
    }
});

const addForm = document.getElementById('add-customer-form');

addForm.onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submit-btn');
    btn.innerText = "جاري الحفظ...";
    btn.disabled = true;

    try {
        // جمع البيانات من الحقول الـ 16 المطلوبة
        const customerData = {
            name: document.getElementById('cust-name').value,
            phone: document.getElementById('cust-phone').value,
            countryCode: document.getElementById('cust-countryCode').value,
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
            detailedNotes: quill.root.innerHTML, // الملاحظات من محرر النصوص
            createdAt: new Date().toISOString(), // تاريخ الإضافة التلقائي
            attachments: [] // مصفوفة فارغة للمرفقات المستقبلية
        };

        // إضافة العميل لقاعدة البيانات (fi-khidmatik-admin)[cite: 1]
        await addDoc(collection(db, "customers"), customerData);

        alert("تم إضافة العميل بنجاح وسوف يظهر في قائمة العملاء فوراً");
        window.location.href = "customers-list.html"; // العودة للقائمة بعد الإضافة
    } catch (error) {
        console.error("خطأ في الإضافة:", error);
        alert("فشلت عملية الإضافة، يرجى المحاولة مرة أخرى");
    } finally {
        btn.innerText = "إضافة العميل للقاعدة";
        btn.disabled = false;
    }
};

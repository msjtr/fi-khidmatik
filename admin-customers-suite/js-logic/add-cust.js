import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { db } from '../js/firebase.js'; 

/**
 * تهيئة محرر Quill المتقدم لدعم العربية والجداول والألوان
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
            [{ 'script': 'sub'}, { 'script': 'super' }],      
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'direction': 'rtl' }, { 'align': [] }],        
            ['link', 'image', 'video', 'blockquote', 'code-block'],
            ['clean']                                         
        ]
    }
});

// تعيين الاتجاه الافتراضي للمحرر ليكون من اليمين لليسار (عربي)
quill.format('direction', 'rtl');
quill.format('align', 'right');

/**
 * معالجة إرسال النموذج
 */
const addForm = document.getElementById('add-customer-form');

addForm.onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submit-btn');
    
    // التحقق من رقم الجوال (يجب أن يبدأ بـ 5)
    const phoneInput = document.getElementById('cust-phone').value;
    if (!phoneInput.startsWith('5')) {
        alert("تنبيه أبا صالح: يجب أن يبدأ رقم الجوال بالرقم 5 (مثال: 5xxxxxxxx)");
        return; 
    }

    btn.innerText = "جاري الحفظ...";
    btn.disabled = true;

    try {
        const customerData = {
            name: document.getElementById('cust-name').value,
            phone: phoneInput,
            countryCode: document.getElementById('cust-countryCode').value, // القيمة المختارة من قائمة البحث[cite: 1]
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
            detailedNotes: quill.root.innerHTML, 
            createdAt: new Date().toISOString(), 
            attachments: [] 
        };

        await addDoc(collection(db, "customers"), customerData);

        alert("تم إضافة العميل بنجاح للقاعدة");

        addForm.reset(); 
        quill.setContents([]); 
        window.location.href = "customers-list.html"; 

    } catch (error) {
        console.error("خطأ في الإضافة:", error);
        alert("فشلت عملية الإضافة، يرجى التأكد من استقرار الإنترنت");
    } finally {
        btn.innerText = "إضافة العميل للقاعدة";
        btn.disabled = false;
    }
};

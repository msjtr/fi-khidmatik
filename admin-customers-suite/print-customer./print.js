// 1. استيراد مكتبات Firebase Firestore
import { doc, getDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

// 2. مسار قاعدة البيانات
import { db } from '../js/firebase.js'; 

// 🌟 إضافة أيقونة التبويبة (Favicon) برمجياً لتجنب خطأ 404
const setFavicon = () => {
    const icon = document.createElement('link');
    icon.rel = 'icon';
    icon.type = 'image/svg+xml';
    icon.href = '/Fi-Khidmatik-by-Al-Itqan-Plus/images/logo.svg';
    document.head.appendChild(icon);

    const shortcutIcon = document.createElement('link');
    shortcutIcon.rel = 'shortcut icon';
    shortcutIcon.href = '/Fi-Khidmatik-by-Al-Itqan-Plus/images/logo.svg';
    document.head.appendChild(shortcutIcon);
};
setFavicon(); // تشغيل الدالة فوراً
// 🌟 --------------------------------------------------

const currentEmployee = "محمد بن صالح الشمري";

// استخراج ID العميل من الرابط
const urlParams = new URLSearchParams(window.location.search);
const customerId = urlParams.get('id');
let customerNameForFile = "Client";

// دالة توليد كود تحقق سريع
function generateVerificationCode(id) {
    const raw = id + Date.now().toString() + "TeraV12Secret";
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
        const char = raw.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; 
    }
    return Math.abs(hash).toString(16).toUpperCase().substring(0, 8);
}

// جلب بيانات العميل من Firebase
async function loadCustomerData() {
    if (!customerId) return;

    try {
        const docRef = doc(db, "customers", customerId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const c = docSnap.data();
            customerNameForFile = c.name || "Client";
            const now = new Date();
            const vCode = generateVerificationCode(customerId);
            
            // دالة آمنة لتعبئة النصوص
            const safeSetText = (id, value) => {
                const el = document.getElementById(id);
                if (el) el.innerText = value || '-';
            };

            // 1. المعلومات الشخصية
            safeSetText('c-name', c.name);
            safeSetText('c-countryCode', c.countryCode);
            safeSetText('c-phone', c.phone);
            safeSetText('c-email', c.email);
            
            // 2. العنوان
            safeSetText('c-country', c.country);
            safeSetText('c-city', c.city);
            safeSetText('c-district', c.district);
            safeSetText('c-street', c.street);
            safeSetText('c-buildingNo', c.buildingNo);
            safeSetText('c-additionalNo', c.additionalNo);
            safeSetText('c-postalCode', c.postalCode);
            safeSetText('c-poBox', c.poBox);

            // 3. حول العميل
            const joinDate = c.createdAt ? new Date(c.createdAt).toLocaleDateString('ar-SA') : '-';
            safeSetText('c-joinDate', joinDate);
            safeSetText('c-status', c.accountStatus);
            safeSetText('c-category', c.customerCategory);
            safeSetText('c-quickNote', c.quickNote);

            // 4. الملاحظات العامة
            const notesEl = document.getElementById('c-notes');
            if (notesEl) notesEl.innerHTML = c.detailedNotes || '<i>لا توجد ملاحظات عامة مسجلة.</i>';
            
            // 5. التذييل والتوثيق
            safeSetText('print-user', currentEmployee);
            safeSetText('verify-code', vCode);

            const watermarkEl = document.getElementById('watermark-text');
            if (watermarkEl) watermarkEl.innerText = `Printed by: ${currentEmployee} | ${now.toLocaleDateString('en-US')}`;

            // 6. توليد الـ QR Code
            const qrContainer = document.getElementById("qr-code");
            if (qrContainer && typeof QRCode !== 'undefined') {
                qrContainer.innerHTML = ""; 
                new QRCode(qrContainer, {
                    text: `Verify: ${vCode} | ID: ${customerId}`,
                    width: 75, height: 75,
                    colorDark: "#0A192F", colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.M
                });
            }
        }
    } catch (e) { 
        console.error("خطأ في جلب البيانات:", e);
    }
}

// أزرار التحكم
document.getElementById('btn-print')?.addEventListener('click', async () => {
    await logPrintAction('Print');
    window.print();
});

// 🌟 التعديل الجذري لحل مشاكل الـ PDF 🌟
document.getElementById('btn-pdf')?.addEventListener('click', async () => {
    const element = document.getElementById('document-content');
    const pdfBtn = document.getElementById('btn-pdf');
    if (!element || !pdfBtn) return;

    pdfBtn.innerText = "جاري التصدير (عالي الدقة)...";
    pdfBtn.disabled = true;

    // إعدادات تصدير احترافية
    const opt = {
        margin: [15, 10, 15, 10], // هوامش متناسقة تمنع القص
        filename: `Profile_${customerNameForFile.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 1.0 }, // دقة الصورة 100%
        html2canvas: { 
            scale: 4, // دقة تصوير 4K لنصوص حادة
            useCORS: true, 
            letterRendering: true, // 🌟 يمنع تفكك الحروف العربية
            scrollY: 0,
            logging: false
        }, 
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
        await logPrintAction('PDF Export');
        
        // تأخير بسيط لضمان اكتمال تحميل الخطوط وتنسيقات CSS قبل التصوير
        setTimeout(async () => {
            await html2pdf().set(opt).from(element).save();
            pdfBtn.innerText = "📥 تصدير PDF";
            pdfBtn.disabled = false;
        }, 500);

    } catch (err) {
        console.error("خطأ PDF:", err);
        pdfBtn.innerText = "📥 تصدير PDF";
        pdfBtn.disabled = false;
    }
});

// سجل الأرشفة
async function logPrintAction(actionType) {
    try {
        await addDoc(collection(db, "print_logs"), {
            user_name: currentEmployee,
            client_id: customerId,
            client_name: customerNameForFile,
            action_type: actionType,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('en-US', { hour12: false }),
            timestamp: new Date().getTime()
        });
    } catch (e) {}
}

document.addEventListener('DOMContentLoaded', loadCustomerData);

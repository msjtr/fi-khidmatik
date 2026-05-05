// 1. استيراد مكتبات Firebase Firestore بإصدار ثابت
import { doc, getDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

// 2. استخدام المسار المطلق لضمان الوصول لملف الإعدادات من أي مجلد فرعي في المشروع
import { db } from '/Fi-Khidmatik-by-Al-Itqan-Plus/js/firebase.js'; 

const currentEmployee = "محمد بن صالح الشمري";

// استخراج ID العميل من الرابط
const urlParams = new URLSearchParams(window.location.search);
const customerId = urlParams.get('id');
let customerNameForFile = "Client";

/**
 * دالة توليد كود تحقق سريع لزيادة موثوقية المستند
 */
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

/**
 * جلب بيانات العميل من Firebase
 */
async function loadCustomerData() {
    if (!customerId) {
        console.error("ID العميل مفقود في الرابط");
        return;
    }

    try {
        if (!db) {
            throw new Error("قاعدة البيانات غير متصلة");
        }

        const docRef = doc(db, "customers", customerId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const c = docSnap.data();
            customerNameForFile = c.name || "Client";
            const now = new Date();
            const vCode = generateVerificationCode(customerId);
            
            const safeSetText = (id, value) => {
                const el = document.getElementById(id);
                if (el) el.innerText = value || '-';
            };

            safeSetText('c-name', c.name);
            safeSetText('c-phone', `${c.countryCode || ''} ${c.phone || ''}`);
            safeSetText('c-email', c.email);
            safeSetText('c-status', c.accountStatus);
            safeSetText('c-category', c.customerCategory);
            
            const fullAddress = `${c.country || ''} - ${c.city || ''} (${c.district || '-'} / الشارع: ${c.street || '-'})`;
            safeSetText('c-address', fullAddress);

            const notesEl = document.getElementById('c-notes');
            if (notesEl) notesEl.innerHTML = c.detailedNotes || '<i>لا توجد ملاحظات.</i>';
            
            safeSetText('print-date', now.toLocaleString('ar-SA'));
            safeSetText('print-user', currentEmployee);
            safeSetText('verify-code', vCode);

            const watermarkEl = document.getElementById('watermark-text');
            if (watermarkEl) watermarkEl.innerText = `Printed by: ${currentEmployee} | ${now.toLocaleDateString('en-US')}`;

            // توليد الـ QR Code للتحقق
            const qrContainer = document.getElementById("qr-code");
            if (qrContainer && typeof QRCode !== 'undefined') {
                qrContainer.innerHTML = ""; 
                new QRCode(qrContainer, {
                    text: `Verify: ${vCode} | ID: ${customerId}`,
                    width: 80,
                    height: 80,
                    colorDark: "#0A192F",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.M
                });
            }

        } else {
            alert("تنبيه: لم يتم العثور على بيانات العميل.");
        }
    } catch (e) { 
        console.error("خطأ تقني في جلب البيانات:", e);
    }
}

/**
 * نظام الأرشفة الرقابي
 */
async function logPrintAction(actionType) {
    try {
        await addDoc(collection(db, "print_logs"), {
            user_name: currentEmployee,
            client_id: customerId,
            client_name: customerNameForFile,
            action_type: actionType,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('en-US', { hour12: false }),
            timestamp: new Date().getTime(),
            platform: "Tera V12 - Admin Suite"
        });
    } catch (e) { 
        console.error("فشل تسجيل العملية:", e); 
    }
}

// أزرار التحكم
document.getElementById('btn-print')?.addEventListener('click', async () => {
    await logPrintAction('Print');
    window.print();
});

document.getElementById('btn-pdf')?.addEventListener('click', async () => {
    const element = document.getElementById('document-content');
    const pdfBtn = document.getElementById('btn-pdf');
    if (!element || !pdfBtn) return;

    pdfBtn.innerText = "جاري التصدير...";
    pdfBtn.disabled = true;

    const opt = {
        margin: [10, 10],
        filename: `Profile_${customerNameForFile.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 }, 
        html2canvas: { scale: 2, useCORS: true }, 
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
        await logPrintAction('PDF Export');
        await html2pdf().set(opt).from(element).save();
    } catch (err) {
        alert("فشل تصدير ملف PDF.");
    } finally {
        pdfBtn.innerText = "📥 تصدير PDF";
        pdfBtn.disabled = false;
    }
});

// بدء التشغيل
document.addEventListener('DOMContentLoaded', loadCustomerData);

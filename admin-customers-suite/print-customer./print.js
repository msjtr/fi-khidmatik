import { doc, getDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
// المسار الدقيق للرجوع خطوتين للخلف للوصول لـ js
import { db } from '../../js/firebase.js'; 

const currentEmployee = "محمد بن صالح الشمري";

// 1. استخراج ID العميل من الرابط
const urlParams = new URLSearchParams(window.location.search);
const customerId = urlParams.get('id');
let customerNameForFile = "Client";

/**
 * دالة توليد كود تحقق سريع لزيادة موثوقية المستند المطبوع
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
 * 2. جلب بيانات العميل من Firebase وتهيئتها في الصفحة
 */
async function loadCustomerData() {
    // التأكد من وجود ID العميل
    if (!customerId) {
        alert("خطأ: لم يتم تمرير رقم العميل. الرجاء فتح الصفحة من قائمة العملاء.");
        window.close();
        return;
    }

    try {
        const docRef = doc(db, "customers", customerId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const c = docSnap.data();
            customerNameForFile = c.name || "Client";
            const now = new Date();
            const vCode = generateVerificationCode(customerId);
            
            // تعبئة البيانات في صفحة الـ HTML مع حماية ضد القيم الفارغة
            const safeSetText = (id, value) => {
                const el = document.getElementById(id);
                if (el) el.innerText = value || '-';
            };

            safeSetText('c-name', c.name);
            safeSetText('c-phone', `${c.countryCode || ''} ${c.phone || ''}`);
            safeSetText('c-email', c.email);
            safeSetText('c-status', c.accountStatus);
            safeSetText('c-category', c.customerCategory);
            
            // بناء العنوان بشكل تفصيلي
            const fullAddress = `${c.country || ''} - ${c.city || ''} (${c.district || '-'} / الشارع: ${c.street || '-'})`;
            safeSetText('c-address', fullAddress);

            // الملاحظات (تستخدم innerHTML لأنها تأتي من محرر Quill)
            const notesEl = document.getElementById('c-notes');
            if (notesEl) notesEl.innerHTML = c.detailedNotes || '<i>لا توجد ملاحظات.</i>';
            
            // تعبئة بيانات التذييل والتحقق
            safeSetText('print-date', now.toLocaleString('ar-SA'));
            safeSetText('print-user', currentEmployee);
            safeSetText('verify-code', vCode);

            // توليد العلامة المائية
            const watermarkEl = document.getElementById('watermark-text');
            if (watermarkEl) watermarkEl.innerText = `Printed by: ${currentEmployee} | ${now.toLocaleDateString('en-US')}`;

            // توليد الـ QR Code للتحقق
            const qrContainer = document.getElementById("qr-code");
            if (qrContainer) {
                qrContainer.innerHTML = ""; // تنظيف الحاوية قبل التوليد
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
            alert("لا توجد بيانات لهذا العميل في قاعدة البيانات.");
            window.close();
        }
    } catch (e) { 
        console.error("خطأ في الاتصال بقاعدة البيانات:", e); 
        alert("حدث خطأ أثناء جلب البيانات، يرجى التأكد من الاتصال بالإنترنت.");
    }
}

/**
 * 3. نظام الأرشفة الرقابي (تسجيل عمليات الطباعة)
 */
async function logPrintAction(actionType) {
    try {
        await addDoc(collection(db, "print_logs"), {
            user_name: currentEmployee,
            client_id: customerId,
            client_name: customerNameForFile,
            action_type: actionType, // 'Print' أو 'PDF Export'
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('en-US', { hour12: false }),
            timestamp: new Date().getTime(),
            platform: "Tera V12 - Admin Suite"
        });
    } catch (e) { 
        console.error("فشل تسجيل العملية في سجلات الرقابة:", e); 
    }
}

// 4. تفعيل أزرار التحكم
const printBtn = document.getElementById('btn-print');
if (printBtn) {
    printBtn.addEventListener('click', async () => {
        await logPrintAction('Print');
        window.print();
    });
}

const pdfBtn = document.getElementById('btn-pdf');
if (pdfBtn) {
    pdfBtn.addEventListener('click', async () => {
        const element = document.getElementById('document-content');
        pdfBtn.innerText = "جاري التصدير...";
        pdfBtn.disabled = true;

        const opt = {
            margin: [10, 10], // إضافة هوامش بسيطة لـ PDF
            filename: `Profile_${customerNameForFile.replace(/\s+/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 }, 
            html2canvas: { scale: 2, useCORS: true, letterRendering: true }, 
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        try {
            await logPrintAction('PDF Export');
            await html2pdf().set(opt).from(element).save();
        } catch (err) {
            console.error("PDF Export Error:", err);
            alert("فشل تصدير ملف PDF.");
        } finally {
            pdfBtn.innerText = "📥 تصدير PDF";
            pdfBtn.disabled = false;
        }
    });
}

// 5. بدء التشغيل
document.addEventListener('DOMContentLoaded', loadCustomerData);

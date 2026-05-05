import { doc, getDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { db } from '../js/firebase.js'; // تأكد من مسار الفايربيس

const currentEmployee = "محمد بن صالح الشمري";

// 1. استخراج ID العميل من الرابط
const urlParams = new URLSearchParams(window.location.search);
const customerId = urlParams.get('id');
let customerNameForFile = "Client";

// دالة توليد كود تحقق سريع وآمن (SHA-256 مبسط)
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

// 2. جلب البيانات وتهيئتها
async function loadCustomerData() {
    if (!customerId) {
        alert("خطأ: لم يتم تمرير رقم العميل.");
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
            
            // تعبئة البيانات
            document.getElementById('c-name').innerText = c.name || '-';
            document.getElementById('c-phone').innerText = `${c.countryCode || ''} ${c.phone || '-'}`;
            document.getElementById('c-email').innerText = c.email || '-';
            document.getElementById('c-status').innerText = c.accountStatus || '-';
            document.getElementById('c-category').innerText = c.customerCategory || '-';
            document.getElementById('c-address').innerText = `${c.country || ''} - ${c.city || ''} (${c.district || '-'} / الشارع: ${c.street || '-'})`;
            document.getElementById('c-notes').innerHTML = c.detailedNotes || '<i>لا توجد ملاحظات.</i>';
            
            // تعبئة التذييل
            document.getElementById('print-date').innerText = now.toLocaleString('ar-SA');
            document.getElementById('print-user').innerText = currentEmployee;
            document.getElementById('verify-code').innerText = vCode;

            // توليد العلامة المائية
            document.getElementById('watermark-text').innerText = `Printed by: ${currentEmployee} | ${now.toLocaleDateString('en-US')}`;

            // توليد QR Code
            const qrData = `Verify: ${vCode} | ID: ${customerId}`;
            new QRCode(document.getElementById("qr-code"), {
                text: qrData,
                width: 70, height: 70,
                colorDark: "#0A192F", colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.L
            });

        } else {
            alert("لا يوجد بيانات لهذا العميل.");
            window.close();
        }
    } catch (e) { console.error("خطأ:", e); }
}

// 3. نظام الأرشفة (Audit Log)
async function logPrintAction(actionType) {
    try {
        await addDoc(collection(db, "print_logs"), {
            user_name: currentEmployee,
            client_id: customerId,
            client_name: customerNameForFile,
            action_type: actionType, // 'Print' or 'PDF'
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('en-US', { hour12: false }),
            timestamp: new Date().getTime()
        });
    } catch (e) { console.error("فشل تسجيل العملية:", e); }
}

// 4. تفعيل أزرار الطباعة والتصدير
document.getElementById('btn-print').addEventListener('click', async () => {
    await logPrintAction('Print');
    window.print();
});

document.getElementById('btn-pdf').addEventListener('click', async () => {
    const element = document.getElementById('document-content');
    const btn = document.getElementById('btn-pdf');
    btn.innerText = "جاري التصدير...";
    btn.disabled = true;

    // إعدادات الـ PDF (جودة عالية مع حجم صغير)
    const opt = {
        margin: 0, // الهوامش مضبوطة مسبقاً في الـ CSS
        filename: `${customerNameForFile.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.75 }, // quality مقلل لتقليل الحجم دون فقدان الجودة بشكل ملحوظ
        html2canvas: { scale: 3, useCORS: true }, // scale 3 كافي جداً ويوفر حجم الملف
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    await logPrintAction('PDF Export');
    
    html2pdf().set(opt).from(element).save().then(() => {
        btn.innerText = "📥 تصدير PDF";
        btn.disabled = false;
    });
});

// تشغيل جلب البيانات عند فتح الصفحة
document.addEventListener('DOMContentLoaded', loadCustomerData);

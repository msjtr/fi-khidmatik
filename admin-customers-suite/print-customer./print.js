import { doc, getDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { db } from '../js/firebase.js'; 

const setFavicon = () => {
    const icon = document.createElement('link');
    icon.rel = 'icon'; icon.type = 'image/svg+xml'; icon.href = '/Fi-Khidmatik-by-Al-Itqan-Plus/images/logo.svg';
    document.head.appendChild(icon);
};
setFavicon();

const currentEmployee = "محمد بن صالح الشمري";
const urlParams = new URLSearchParams(window.location.search);
const customerId = urlParams.get('id');
let customerNameForFile = "Client";

// 🌟 قواميس الترجمة الديناميكية 🌟
const translations = {
    status: { 'جديد': 'New', 'نشط': 'Active', 'موقوف': 'Suspended', 'محظور': 'Blocked' },
    category: { 'عادي': 'Normal', 'VIP': 'VIP', 'مميز': 'Premium', 'محتمل': 'Potential' },
    notes: { 'سريع التجاوب': 'Responsive', 'يتأخر في الرد': 'Slow Reply', 'كثير الطلبات': 'Many Orders', 'حاجة لمتابعة': 'Needs Follow-up' }
};

// 🌟 دالة التحويل للأرقام الإنجليزية 🌟
function toEnglishNumbers(str) {
    if(!str) return '';
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    return str.toString().replace(/[٠-٩]/g, w => englishNumbers[arabicNumbers.indexOf(w)]);
}

// 🌟 دالة إعداد التاريخ والوقت 🌟
function setupDateTime() {
    const now = new Date();
    // هجري: الشهر نص، الأيام والسنوات إنجليزية
    let hijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' }).format(now);
    hijri = toEnglishNumbers(hijri); 
    // ميلادي: أرقام إنجليزية فقط
    let greg = new Intl.DateTimeFormat('en-GB').format(now);
    greg = toEnglishNumbers(greg);
    document.getElementById('print-date').innerText = `${hijri} هـ / ${greg}`;

    // الوقت
    let timeStr = now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    document.getElementById('print-time').innerText = toEnglishNumbers(timeStr);
}

function generateVerificationCode(id) {
    const raw = id + Date.now().toString() + "TeraSecret";
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
        hash = ((hash << 5) - hash) + raw.charCodeAt(i);
        hash = hash & hash; 
    }
    return Math.abs(hash).toString(16).toUpperCase().substring(0, 8);
}

async function loadCustomerData() {
    setupDateTime();
    if (!customerId) return;
    try {
        const docRef = doc(db, "customers", customerId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const c = docSnap.data();
            customerNameForFile = c.name || "Client";
            const vCode = generateVerificationCode(customerId);
            
            const safeSetText = (id, value) => {
                const el = document.getElementById(id);
                if (el) el.innerText = toEnglishNumbers(value) || '-';
            };

            // البيانات المباشرة (الاسم والعنوان لا تترجم تلقائياً بدون API)
            safeSetText('c-name', c.name);
            safeSetText('c-countryCode', c.countryCode);
            safeSetText('c-phone', c.phone);
            document.getElementById('c-email').innerText = c.email || '-'; 
            
            safeSetText('c-country', c.country);
            safeSetText('c-city', c.city);
            safeSetText('c-district', c.district);
            safeSetText('c-street', c.street);
            safeSetText('c-buildingNo', c.buildingNo);
            safeSetText('c-additionalNo', c.additionalNo);
            safeSetText('c-postalCode', c.postalCode);
            safeSetText('c-poBox', c.poBox);

            let joinDateStr = '-';
            if(c.createdAt) {
                let d = new Date(c.createdAt).toLocaleDateString('en-GB');
                joinDateStr = toEnglishNumbers(d);
            }
            safeSetText('c-joinDate', joinDateStr);

            // 🌟 تطبيق الترجمة المزدوجة (عربي | إنجليزي) 🌟
            const statusEn = translations.status[c.accountStatus] || '';
            const catEn = translations.category[c.customerCategory] || '';
            const noteEn = translations.notes[c.quickNote] || '';
            
            document.getElementById('c-status').innerText = c.accountStatus ? `${c.accountStatus} | ${statusEn}` : '-';
            document.getElementById('c-category').innerText = c.customerCategory ? `${c.customerCategory} | ${catEn}` : '-';
            document.getElementById('c-quickNote').innerText = c.quickNote ? `${c.quickNote} | ${noteEn}` : '-';

            const notesEl = document.getElementById('c-notes');
            if (notesEl) notesEl.innerHTML = toEnglishNumbers(c.detailedNotes) || '<i>لا توجد ملاحظات عامة.</i>';
            
            const watermarkEl = document.getElementById('watermark-text');
            if (watermarkEl) {
                watermarkEl.innerHTML = `<div style="font-size: 1.8rem; color: #94a3b8; margin-bottom: 5px;">طُبع بواسطة | Printed By</div>
                                         <div style="font-size: 3rem; color: #0A192F;">${currentEmployee}</div>`;
            }

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
            document.getElementById('verify-code').innerText = toEnglishNumbers(vCode);
        }
    } catch (e) { console.error("Error:", e); }
}

document.getElementById('btn-print')?.addEventListener('click', async () => {
    await logPrintAction('Print');
    window.print();
});

// 🌟 الحل الجذري للـ PDF (يمنع الصفحات الفارغة ويضبط الجودة) 🌟
document.getElementById('btn-pdf')?.addEventListener('click', async () => {
    const element = document.getElementById('document-content');
    const pdfBtn = document.getElementById('btn-pdf');
    if (!element || !pdfBtn) return;

    pdfBtn.innerText = "جاري التصدير (جودة عالية)...";
    pdfBtn.disabled = true;

    const opt = {
        margin: [10, 10, 10, 10], // هوامش متساوية
        filename: `Profile_${toEnglishNumbers(customerNameForFile).replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { 
            scale: 2, // 👈 تم تقليله لـ 2 لمنع خطأ الصفحات الفارغة مع الحفاظ على دقة ممتازة
            useCORS: true, 
            letterRendering: true,
            scrollY: 0
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: 'avoid-all' } // 👈 يمنع تقطيع العناصر
    };

    try {
        await logPrintAction('PDF Export');
        setTimeout(async () => {
            await html2pdf().set(opt).from(element).save();
            pdfBtn.innerText = "📥 تصدير PDF";
            pdfBtn.disabled = false;
        }, 500);
    } catch (err) {
        console.error("PDF Error:", err);
        pdfBtn.innerText = "📥 تصدير PDF";
        pdfBtn.disabled = false;
    }
});

async function logPrintAction(actionType) {
    try {
        await addDoc(collection(db, "print_logs"), {
            user_name: currentEmployee,
            client_id: customerId,
            action_type: actionType,
            date: toEnglishNumbers(new Date().toISOString().split('T')[0]),
            timestamp: new Date().getTime()
        });
    } catch (e) {}
}

document.addEventListener('DOMContentLoaded', loadCustomerData);

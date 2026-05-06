import { doc, getDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { db } from '../js/firebase.js'; 

const currentEmployee = "محمد بن صالح الشمري";
const urlParams = new URLSearchParams(window.location.search);
const customerId = urlParams.get('id');
let customerNameForFile = "Client";

const dict = {
    'المملكة العربية السعودية': 'Saudi Arabia', 'السعودية': 'Saudi Arabia',
    'حائل': 'Hail', 'الرياض': 'Riyadh', 'النقرة': 'Al Naqra', 'سعد المشاط': 'Saad Al Mashat',
    'نشط': 'Active', 'جديد': 'New', 'موقوف': 'Suspended', 'محظور': 'Blocked',
    'عادي': 'Normal', 'VIP': 'VIP', 'مميز': 'Premium', 'محتمل': 'Potential',
    'سريع التجاوب': 'Responsive', 'يتأخر في الرد': 'Slow Reply', 'كثير الطلبات': 'Many Orders', 'حاجة لمتابعة': 'Needs Followup'
};

const arMap = {'ا':'a','أ':'a','إ':'e','آ':'a','ب':'b','ت':'t','ث':'th','ج':'j','ح':'h','خ':'kh','د':'d','ذ':'dh','ر':'r','ز':'z','س':'s','ش':'sh','ص':'s','ض':'d','ط':'t','ظ':'z','ع':'a','غ':'gh','ف':'f','ق':'q','ك':'k','ل':'l','م':'m','ن':'n','ه':'h','و':'w','ي':'y','ى':'a','ة':'a','ؤ':'o','ئ':'e'};

// ترتيب الترجمة (عربي يمين | إنجليزي يسار) في الخلية الوسطى
function translateData(text) {
    if (!text || text === '-' || text.trim() === '') return '-';
    let cleanText = text.trim();
    
    let enText = dict[cleanText];
    if (!enText) {
        let words = cleanText.split(' ');
        let enWords = words.map(w => {
            if (dict[w]) return dict[w];
            if (w.startsWith('ال')) w = w.replace('ال', 'Al ');
            let res = '';
            for(let i=0; i<w.length; i++) res += arMap[w[i]] || w[i];
            return res.charAt(0).toUpperCase() + res.slice(1);
        });
        enText = enWords.join(' ');
    }
    
    // إخراج العربي يمين والإنجليزي يسار باستخدام الاتجاهات
    return `<span dir="rtl">${cleanText}</span> <span style="color:#94a3b8; margin:0 8px;">|</span> <span dir="ltr">${enText}</span>`;
}

function toEnglishNumbers(str) {
    if(!str) return '';
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    return str.toString().replace(/[٠-٩]/g, w => englishNumbers[arabicNumbers.indexOf(w)]);
}

// توليد التاريخ بالصيغة: 1447-05-19 هـ / 06-05-2026 م
function setupDates() {
    const now = new Date();
    
    const dG = String(now.getDate()).padStart(2, '0');
    const mG = String(now.getMonth() + 1).padStart(2, '0');
    const yG = now.getFullYear();
    const gregStr = `${dG}-${mG}-${yG}`;

    const hijriFormatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const hParts = hijriFormatter.formatToParts(now);
    const hY = hParts.find(p => p.type === 'year').value;
    const hM = hParts.find(p => p.type === 'month').value;
    const hD = hParts.find(p => p.type === 'day').value;
    const hijriStr = `${hY}-${hM}-${hD}`;

    document.getElementById('print-date').innerText = toEnglishNumbers(`${hijriStr} هـ / ${gregStr} م`);
    document.getElementById('print-time').innerText = toEnglishNumbers(now.toLocaleTimeString('en-US', { hour12: false }));
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
    setupDates();
    if (!customerId) return;
    try {
        const docRef = doc(db, "customers", customerId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const c = docSnap.data();
            customerNameForFile = c.name || "Client";
            const vCode = generateVerificationCode(customerId);
            
            document.getElementById('c-name').innerHTML = translateData(c.name);
            document.getElementById('c-countryCode').innerText = toEnglishNumbers(c.countryCode || '-');
            document.getElementById('c-phone').innerText = toEnglishNumbers(c.phone || '-');
            document.getElementById('c-email').innerText = c.email || '-'; 
            
            document.getElementById('c-country').innerHTML = translateData(c.country);
            document.getElementById('c-city').innerHTML = translateData(c.city);
            document.getElementById('c-district').innerHTML = translateData(c.district);
            document.getElementById('c-street').innerHTML = translateData(c.street);
            
            document.getElementById('c-buildingNo').innerText = toEnglishNumbers(c.buildingNo || '-');
            document.getElementById('c-additionalNo').innerText = toEnglishNumbers(c.additionalNo || '-');
            document.getElementById('c-postalCode').innerText = toEnglishNumbers(c.postalCode || '-');
            document.getElementById('c-poBox').innerText = toEnglishNumbers(c.poBox || '-');

            let joinDateStr = '-';
            if(c.createdAt) {
                let d = new Date(c.createdAt);
                const dJ = String(d.getDate()).padStart(2, '0');
                const mJ = String(d.getMonth() + 1).padStart(2, '0');
                const yJ = d.getFullYear();
                joinDateStr = `${dJ}-${mJ}-${yJ}`;
            }
            document.getElementById('c-joinDate').innerText = toEnglishNumbers(joinDateStr);

            document.getElementById('c-status').innerHTML = translateData(c.accountStatus);
            document.getElementById('c-category').innerHTML = translateData(c.customerCategory);
            document.getElementById('c-quickNote').innerHTML = translateData(c.quickNote);

            document.getElementById('c-notes').innerHTML = toEnglishNumbers(c.detailedNotes) || '<i>لا توجد ملاحظات عامة.</i>';
            
            const watermarkEl = document.getElementById('watermark-text');
            if (watermarkEl) {
                watermarkEl.innerHTML = `<div style="font-size: 1.5rem; color: #cbd5e1; margin-bottom: 5px;">طُبع بواسطة | Printed By</div>
                                         <div style="font-size: 2.5rem; color: #94a3b8;">${currentEmployee}</div>`;
            }

            const qrContainer = document.getElementById("qr-code");
            if (qrContainer && typeof QRCode !== 'undefined') {
                new QRCode(qrContainer, { text: `Verify: ${vCode} | ID: ${customerId}`, width: 75, height: 75, colorDark: "#0A192F", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.M });
            }
            document.getElementById('verify-code').innerText = toEnglishNumbers(vCode);
        }
    } catch (e) {}
}

document.getElementById('btn-print')?.addEventListener('click', async () => {
    window.print();
});

// 🌟 تصدير PDF مع إلغاء الأوامر التي تشوه اللغة العربية 🌟
document.getElementById('btn-pdf')?.addEventListener('click', async () => {
    const element = document.getElementById('document-content');
    const pdfBtn = document.getElementById('btn-pdf');
    if (!element || !pdfBtn) return;

    pdfBtn.innerText = "جاري التصدير (جودة عالية)...";
    pdfBtn.disabled = true;

    const opt = {
        margin: 10, // هوامش متساوية 10mm من جميع الجهات تمنع ظهور صفحات فارغة
        filename: `Profile_${toEnglishNumbers(customerNameForFile).replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { 
            scale: 2, // دقة ممتازة وآمنة
            useCORS: true, 
            // 🚨 تم إزالة letterRendering لأنها السبب الأول في تكسير اللغة العربية في المكتبة!
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
        setTimeout(async () => {
            await html2pdf().set(opt).from(element).save();
            pdfBtn.innerText = "📥 تصدير PDF";
            pdfBtn.disabled = false;
        }, 500);
    } catch (err) {
        pdfBtn.innerText = "📥 تصدير PDF";
        pdfBtn.disabled = false;
    }
});

document.addEventListener('DOMContentLoaded', loadCustomerData);

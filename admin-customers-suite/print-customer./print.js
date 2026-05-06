import { doc, getDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { db } from '../js/firebase.js'; 

const currentEmployee = "محمد بن صالح الشمري";
const urlParams = new URLSearchParams(window.location.search);
const customerId = urlParams.get('id');

// متغير لحفظ اسم العميل لاستخدامه في اسم ملف الـ PDF
let customerNameForFile = "Client";

// القاموس الذكي للترجمة
const dict = {
    'المملكة العربية السعودية': 'Saudi Arabia', 'السعودية': 'Saudi Arabia',
    'حائل': 'Hail', 'الرياض': 'Riyadh', 'النقرة': 'Al Naqra', 'سعد المشاط': 'Saad Al Mashat',
    'نشط': 'Active', 'جديد': 'New', 'موقوف': 'Suspended', 'محظور': 'Blocked',
    'عادي': 'Normal', 'VIP': 'VIP', 'مميز': 'Premium', 'محتمل': 'Potential',
    'سريع التجاوب': 'Responsive', 'يتأخر في الرد': 'Slow Reply', 'كثير الطلبات': 'Many Orders', 'حاجة لمتابعة': 'Needs Followup'
};

const arMap = {'ا':'a','أ':'a','إ':'e','آ':'a','ب':'b','ت':'t','ث':'th','ج':'j','ح':'h','خ':'kh','د':'d','ذ':'dh','ر':'r','ز':'z','س':'s','ش':'sh','ص':'s','ض':'d','ط':'t','ظ':'z','ع':'a','غ':'gh','ف':'f','ق':'q','ك':'k','ل':'l','م':'m','ن':'n','ه':'h','و':'w','ي':'y','ى':'a','ة':'a','ؤ':'o','ئ':'e'};

// 🌟 دالة الترجمة الكاملة (عربي يمين | إنجليزي يسار) 🌟
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
    return `<div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <span style="flex: 1; text-align: right;" dir="rtl">${cleanText}</span> 
                <span style="color:#94a3b8; margin:0 10px;">|</span> 
                <span style="flex: 1; text-align: left;" dir="ltr">${enText}</span>
            </div>`;
}

function toEnglishNumbers(str) {
    if(!str) return '';
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    return str.toString().replace(/[٠-٩]/g, w => englishNumbers[arabicNumbers.indexOf(w)]);
}

// 🌟 ضبط التاريخ والوقت بالصيغة الدقيقة (19-11-1447 هـ / 06-05-2026 م) 🌟
function setupDates() {
    const now = new Date();
    
    // ميلادي: DD-MM-YYYY
    const dG = String(now.getDate()).padStart(2, '0');
    const mG = String(now.getMonth() + 1).padStart(2, '0');
    const yG = now.getFullYear();
    const gregStr = `${dG}-${mG}-${yG}`;

    // هجري: DD-MM-YYYY
    const hijriFormatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const hParts = hijriFormatter.formatToParts(now);
    const hY = hParts.find(p => p.type === 'year').value;
    const hM = hParts.find(p => p.type === 'month').value;
    const hD = hParts.find(p => p.type === 'day').value;
    const hijriStr = `${hD}-${hM}-${hY}`; // ترتيب: يوم - شهر - سنة

    const finalDate = toEnglishNumbers(hijriStr) + ' هـ / ' + toEnglishNumbers(gregStr) + ' م';
    document.getElementById('print-date').innerText = finalDate;
    document.getElementById('print-time').innerText = toEnglishNumbers(now.toLocaleTimeString('en-US', {hour12: true}));
}

function generateVerificationCode(id) {
    const raw = id + Date.now().toString() + "TeraSecret";
    let hash = 0;
    for (let i = 0; i < raw.length; i++) { hash = ((hash << 5) - hash) + raw.charCodeAt(i); hash = hash & hash; }
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
            customerNameForFile = c.name || "Client"; // تعيين الاسم لملف الـ PDF
            const vCode = generateVerificationCode(customerId);
            
            // 🌟 تعبئة البيانات بالترجمة 🌟
            document.getElementById('c-name').innerHTML = translateData(c.name);
            document.getElementById('c-countryCode').innerText = toEnglishNumbers(c.countryCode || '+966');
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
                joinDateStr = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
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
                qrContainer.innerHTML = "";
                new QRCode(qrContainer, { text: `Verify: ${customerId}`, width: 75, height: 75, colorDark: "#0A192F", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.M });
            }
            document.getElementById('verify-code').innerText = toEnglishNumbers(vCode);
        }
    } catch (e) { console.error(e); }
}

async function logAction(type) {
    try {
        await addDoc(collection(db, "print_logs"), {
            user_name: currentEmployee, client_id: customerId, action_type: type,
            date: new Date().toISOString().split('T')[0], timestamp: new Date().getTime()
        });
    } catch (e) {}
}

document.getElementById('btn-print')?.addEventListener('click', async () => {
    await logAction('Print');
    window.print();
});

// 🌟 زر التحميل المباشر للـ PDF (يتطلب وجود مكتبة html2pdf في ملف HTML) 🌟
document.getElementById('btn-pdf')?.addEventListener('click', async () => {
    await logAction('PDF Export');
    const element = document.getElementById('document-content');
    const btn = document.getElementById('btn-pdf');
    
    // تغيير نص الزر أثناء التحميل
    btn.innerText = "جاري التحميل...";
    btn.disabled = true;

    // إعدادات التصدير
    const opt = {
        margin: [5, 5, 5, 5],
        filename: `Profile_${toEnglishNumbers(customerNameForFile).replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
        await html2pdf().set(opt).from(element).save();
    } catch (err) {
        console.error("خطأ أثناء التصدير: ", err);
    } finally {
        // إعادة الزر لحالته الأصلية
        btn.innerText = "📥 تحميل PDF مباشر";
        btn.disabled = false;
    }
});

document.addEventListener('DOMContentLoaded', loadCustomerData);

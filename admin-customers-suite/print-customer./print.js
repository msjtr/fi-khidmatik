import { doc, getDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { db } from '../js/firebase.js'; 

const currentEmployee = "محمد بن صالح الشمري";
const urlParams = new URLSearchParams(window.location.search);
const customerId = urlParams.get('id');
let customerNameForFile = "Client";
let isDataLoaded = false; // 🌟 علم للتأكد من تحميل البيانات

const setFavicon = () => {
    const icon = document.createElement('link');
    icon.rel = 'icon';
    icon.type = 'image/svg+xml';
    icon.href = '/Fi-Khidmatik-by-Al-Itqan-Plus/images/logo.svg';
    document.head.appendChild(icon);
};
setFavicon();

function toEnglishNumbers(str) {
    if(!str) return '';
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    return str.toString().replace(/[٠-٩]/g, w => englishNumbers[arabicNumbers.indexOf(w)]);
}

function setupDates() {
    const now = new Date();
    const dG = String(now.getDate()).padStart(2, '0');
    const mG = String(now.getMonth() + 1).padStart(2, '0');
    const yG = now.getFullYear();
    const gregStrRaw = `${dG}-${mG}-${yG}`;

    const hijriFormatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const hParts = hijriFormatter.formatToParts(now);
    const hY = hParts.find(p => p.type === 'year').value;
    const hM = hParts.find(p => p.type === 'month').value;
    const hD = hParts.find(p => p.type === 'day').value;
    const hijriStrRaw = `${hD}-${hM}-${hY}`;

    const finalDateRaw = toEnglishNumbers(hijriStrRaw) + ' / ' + toEnglishNumbers(gregStrRaw);
    document.getElementById('print-date-raw').innerText = finalDateRaw;
    document.getElementById('print-time').innerText = toEnglishNumbers(now.toLocaleTimeString('en-US', { hour12: false }));
}

const dict = {
    'المملكة العربية السعودية': 'Saudi Arabia', 'السعودية': 'Saudi Arabia',
    'حائل': 'Hail', 'الرياض': 'Riyadh', 'النقرة': 'Al Naqra', 'سعد المشاط': 'Saad Al Mashat',
    'نشط': 'Active', 'جديد': 'New', 'موقوف': 'Suspended', 'محظور': 'Blocked',
    'عادي': 'Normal', 'VIP': 'VIP', 'مميز': 'Premium', 'محتمل': 'Potential',
    'سريع التجاوب': 'Responsive', 'يتأخر في الرد': 'Slow Reply', 'كثير الطلبات': 'Many Orders', 'حاجة لمتابعة': 'Needs Followup'
};

const arMap = {'ا':'a','أ':'a','إ':'e','آ':'a','ب':'b','ت':'t','ث':'th','ج':'j','ح':'h','خ':'kh','د':'d','ذ':'dh','ر':'r','ز':'z','س':'s','ش':'sh','ص':'s','ض':'d','ط':'t','ظ':'z','ع':'a','غ':'gh','ف':'f','ق':'q','ك':'k','ل':'l','م':'m','ن':'n','ه':'h','و':'w','ي':'y','ى':'a','ة':'a','ؤ':'o','ئ':'e'};

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
                <span style="flex: 1; text-align: right; color:#000;" dir="rtl">${cleanText}</span> 
                <span style="color:#000; margin:0 10px;">|</span> 
                <span style="flex: 1; text-align: left; color:#000;" dir="ltr">${enText}</span>
            </div>`;
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
            document.getElementById('c-notes').innerHTML = toEnglishNumbers(c.detailedNotes) || '-';
            
            const watermarkEl = document.getElementById('watermark-text');
            if (watermarkEl) {
                watermarkEl.innerHTML = `<div style="font-size: 1.5rem; color: #000; opacity: 0.1; margin-bottom: 5px;">طُبع بواسطة | Printed By</div>
                                         <div style="font-size: 2.5rem; color: #000; opacity: 0.1;">${currentEmployee}</div>`;
            }

            const vCode = generateVerificationCode(customerId);
            const qrContainer = document.getElementById("qr-code");
            if (qrContainer && typeof QRCode !== 'undefined') {
                qrContainer.innerHTML = "";
                new QRCode(qrContainer, { text: `Verify: ${customerId}`, width: 65, height: 65, colorDark: "#000000", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.M });
            }
            document.getElementById('verify-code').innerText = toEnglishNumbers(vCode);
            isDataLoaded = true; // 🌟 اكتمل التحميل
        }
    } catch (e) { console.error(e); }
}

function generateVerificationCode(id) {
    const raw = id + Date.now().toString() + "TeraSecret";
    let hash = 0;
    for (let i = 0; i < raw.length; i++) { hash = ((hash << 5) - hash) + raw.charCodeAt(i); hash = hash & hash; }
    return Math.abs(hash).toString(16).toUpperCase().substring(0, 8);
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

// 🌟 تصدير PDF مع نظام "الانتظار الذكي" لضمان التحميل السليم 🌟
document.getElementById('btn-pdf')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-pdf');
    const element = document.getElementById('document-content');

    // 1. تغيير حالة الزر للتنبيه
    btn.innerText = "جاري تحضير الصفحة...";
    btn.disabled = true;

    // 2. التحقق من جاهزية البيانات (إذا لم تكن جاهزة انتظر قليلاً)
    if (!isDataLoaded) {
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // 3. انتظار إضافي لضمان رسم الباركود والخطوط (مهم جداً للتحميل السليم)
    await new Promise(resolve => setTimeout(resolve, 1000));

    await logAction('PDF Export');

    const originalMargin = element.style.margin;
    const originalHeight = element.style.height;
    element.style.margin = '0';
    element.style.height = 'auto'; 
    element.style.maxHeight = 'none';

    const opt = {
        margin: [5, 5, 5, 5], 
        filename: `Profile_${toEnglishNumbers(customerNameForFile).replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { 
            scale: 4, 
            useCORS: true, 
            letterRendering: true, 
            windowWidth: 800,
            onclone: (clonedDoc) => {
                // التأكد من تحميل العناصر في النسخة المستنسخة للـ PDF
                return new Promise(resolve => setTimeout(resolve, 500));
            }
        }, 
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
        btn.innerText = "جاري تحميل الملف...";
        await html2pdf().set(opt).from(element).save();
    } catch (err) {
        console.error(err);
        alert("حدث خطأ أثناء التحميل، يرجى المحاولة مرة أخرى.");
    } finally {
        element.style.margin = originalMargin;
        element.style.height = originalHeight;
        element.style.maxHeight = '';
        btn.innerText = "📥 تحميل PDF مباشر";
        btn.disabled = false;
    }
});

document.addEventListener('DOMContentLoaded', loadCustomerData);

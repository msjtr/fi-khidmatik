/**
 * js/utils/formatter.js
 * وظيفة الملف: تنسيق الأرقام، العملات، والتواريخ لصيغة احترافية
 * @version 2.0.0
 */

// ===================== تنسيق الأرقام =====================

/**
 * تنسيق العملة (ريال سعودي)
 * @param {number|string} amount - المبلغ المراد تنسيقه
 * @param {boolean} showSymbol - عرض رمز العملة
 * @param {boolean} showFraction - عرض الكسور (هللات)
 * @returns {string} المبلغ المنسق
 */
export const formatCurrency = (amount, showSymbol = true, showFraction = true) => {
    const num = Number(amount) || 0;
    
    return new Intl.NumberFormat('en-US', {
        style: showSymbol ? 'currency' : 'decimal',
        currency: 'SAR',
        minimumFractionDigits: showFraction ? 2 : 0,
        maximumFractionDigits: showFraction ? 2 : 0
    }).format(num);
};

/**
 * تنسيق رقم عادي مع فواصل الآلاف
 * @param {number|string} number - الرقم المراد تنسيقه
 * @param {number} decimals - عدد الخانات العشرية
 * @returns {string} الرقم المنسق
 */
export const formatNumber = (number, decimals = 0) => {
    const num = Number(number) || 0;
    
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(num);
};

/**
 * تنسيق رقم عربي مع فواصل الآلاف (للعرض للمستخدم)
 * @param {number|string} number - الرقم المراد تنسيقه
 * @returns {string} الرقم المنسق بالأرقام العربية
 */
export const formatArabicNumber = (number) => {
    const num = Number(number) || 0;
    const formatted = num.toLocaleString('ar-EG');
    return formatted;
};

/**
 * تحويل الأرقام العربية (الهندية) إلى إنجليزية
 * ضروري جداً عند استلام مدخلات من المستخدمين الذين يكتبون بلوحة مفاتيح عربية
 * @param {string|number} str - النص المراد تحويله
 * @returns {string} النص مع أرقام إنجليزية
 */
export const toEnglishDigits = (str) => {
    if (str === undefined || str === null) return '';
    if (typeof str === 'number') return str.toString();
    
    // خريطة تحويل الأرقام العربية إلى إنجليزية
    const arabicDigits = {
        '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
        '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
    };
    
    return str.toString().replace(/[٠-٩]/g, (digit) => arabicDigits[digit] || digit);
};

/**
 * تحويل الأرقام الإنجليزية إلى عربية (هندية)
 * @param {string|number} str - النص المراد تحويله
 * @returns {string} النص مع أرقام عربية
 */
export const toArabicDigits = (str) => {
    if (str === undefined || str === null) return '';
    if (typeof str === 'number') str = str.toString();
    
    const englishDigits = {
        '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤',
        '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩'
    };
    
    return str.toString().replace(/[0-9]/g, (digit) => englishDigits[digit] || digit);
};

/**
 * تنظيف الأرقام من أي أحرف غير رقمية
 * @param {string} str - النص المراد تنظيفه
 * @returns {string} الأرقام فقط
 */
export const cleanNumber = (str) => {
    if (!str) return '';
    const cleaned = str.toString().replace(/[^\d.-]/g, '');
    return toEnglishDigits(cleaned);
};

// ===================== تنسيق التواريخ =====================

/**
 * تنسيق التاريخ بصيغ مختلفة
 * @param {Date|Object|string} date - التاريخ (يدعم Firebase Timestamp)
 * @param {string} format - صيغة التاريخ ('short', 'long', 'full', 'iso', 'ar')
 * @returns {string} التاريخ المنسق
 */
export const formatDate = (date, format = 'short') => {
    if (!date) return '---';
    
    // التعامل مع Firebase Timestamp
    let d;
    if (typeof date === 'object' && date !== null) {
        d = date.toDate ? date.toDate() : new Date(date);
    } else {
        d = new Date(date);
    }
    
    // التحقق من صحة التاريخ
    if (isNaN(d.getTime())) return '---';
    
    const formats = {
        'short': () => d.toLocaleDateString('en-GB'), // 19/04/2026
        'long': () => d.toLocaleDateString('en-US', { // April 19, 2026
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        'full': () => d.toLocaleDateString('ar-SA', { // ١٩ أبريل، ٢٠٢٦
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        }),
        'iso': () => d.toISOString().split('T')[0], // 2026-04-19
        'ar': () => d.toLocaleDateString('ar-EG'), // ١٩/٤/٢٠٢٦
        'time': () => d.toLocaleTimeString('en-US', { // 14:30:45
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }),
        'datetime': () => `${d.toLocaleDateString('en-GB')} ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`
    };
    
    return formats[format] ? formats[format]() : formats.short();
};

/**
 * تنسيق الوقت فقط
 * @param {Date|Object|string} date - التاريخ
 * @param {boolean} withSeconds - عرض الثواني
 * @returns {string} الوقت المنسق
 */
export const formatTime = (date, withSeconds = false) => {
    if (!date) return '---';
    
    let d;
    if (typeof date === 'object' && date !== null) {
        d = date.toDate ? date.toDate() : new Date(date);
    } else {
        d = new Date(date);
    }
    
    if (isNaN(d.getTime())) return '---';
    
    return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: withSeconds ? '2-digit' : undefined,
        hour12: false
    });
};

/**
 * حساب الفرق بين تاريخين (للأقساط)
 * @param {Date|string} startDate - تاريخ البداية
 * @param {Date|string} endDate - تاريخ النهاية
 * @returns {Object} الفرق بالأيام والأشهر والسنوات
 */
export const dateDifference = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return { days: 0, months: 0, years: 0, totalDays: 0 };
    }
    
    const diffTime = Math.abs(end - start);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(totalDays / 365);
    const months = Math.floor((totalDays % 365) / 30);
    const days = totalDays % 30;
    
    return {
        days,
        months,
        years,
        totalDays,
        formatted: `${years} سنة, ${months} شهر, ${days} يوم`
    };
};

// ===================== تنسيق النسب المئوية =====================

/**
 * تنسيق النسبة المئوية
 * @param {number|string} value - القيمة (مثلاً: 15.5 تعني 15.5%)
 * @param {number} decimals - عدد الخانات العشرية
 * @returns {string} النسبة المئوية المنسقة
 */
export const formatPercent = (value, decimals = 1) => {
    const num = Number(value) || 0;
    
    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(num / 100);
};

/**
 * تنسيق النسبة المئوية العربية
 * @param {number|string} value - القيمة
 * @returns {string} النسبة المئوية بالأرقام العربية
 */
export const formatPercentArabic = (value) => {
    const num = Number(value) || 0;
    const percent = (num / 100).toFixed(1);
    return toArabicDigits(`${percent}%`);
};

// ===================== تنسيق النصوص =====================

/**
 * اختصار النص الطويل
 * @param {string} text - النص المراد اختصاره
 * @param {number} maxLength - الحد الأقصى للطول
 * @returns {string} النص المختصر
 */
export const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * تحويل النص إلى تنسيق عنوان (Capitalize)
 * @param {string} text - النص المراد تحويله
 * @returns {string} النص مع أول حرف كبير
 */
export const capitalizeText = (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * تنسيق رقم الجوال السعودي
 * @param {string} phone - رقم الجوال
 * @returns {string} رقم الجوال المنسق (05X XXX XXXX)
 */
export const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    
    let cleaned = cleanNumber(phone);
    if (cleaned.length === 10 && cleaned.startsWith('05')) {
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 10)}`;
    }
    if (cleaned.length === 9 && cleaned.startsWith('5')) {
        return `0${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 9)}`;
    }
    
    return phone;
};

/**
 * إخفاء جزء من النص (لأرقام الحسابات أو البطاقات)
 * @param {string} text - النص الأصلي
 * @param {number} visibleStart - عدد الأحرف المرئية في البداية
 * @param {number} visibleEnd - عدد الأحرف المرئية في النهاية
 * @param {string} maskChar - حرف الإخفاء
 * @returns {string} النص المخفي
 */
export const maskText = (text, visibleStart = 4, visibleEnd = 4, maskChar = '*') => {
    if (!text) return '';
    if (text.length <= visibleStart + visibleEnd) return text;
    
    const start = text.slice(0, visibleStart);
    const end = text.slice(-visibleEnd);
    const maskedLength = text.length - visibleStart - visibleEnd;
    const masked = maskChar.repeat(maskedLength);
    
    return start + masked + end;
};

// ===================== تنسيق الملفات والحجم =====================

/**
 * تنسيق حجم الملف
 * @param {number} bytes - الحجم بالبايت
 * @returns {string} الحجم المنسق (KB, MB, GB)
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// ===================== تنسيق العناوين =====================

/**
 * تنسيق العنوان الكامل
 * @param {Object} address - كائن العنوان
 * @returns {string} العنوان المنسق
 */
export const formatAddress = (address) => {
    const parts = [];
    
    if (address.buildingNo) parts.push(`مبنى ${address.buildingNo}`);
    if (address.street) parts.push(`شارع ${address.street}`);
    if (address.district) parts.push(`حي ${address.district}`);
    if (address.city) parts.push(`مدينة ${address.city}`);
    if (address.country) parts.push(address.country);
    if (address.poBox) parts.push(`ص.ب ${address.poBox}`);
    
    return parts.join('، ');
};

// ===================== تصدير افتراضي =====================

// تصدير كل الدوال ككائن واحد
export default {
    formatCurrency,
    formatNumber,
    formatArabicNumber,
    toEnglishDigits,
    toArabicDigits,
    cleanNumber,
    formatDate,
    formatTime,
    dateDifference,
    formatPercent,
    formatPercentArabic,
    truncateText,
    capitalizeText,
    formatPhoneNumber,
    maskText,
    formatFileSize,
    formatAddress
};

/**
 * نظام Tera V12 - محرك الساعة الذكي
 * مؤسسة الإتقان بلس - حائل
 */

function updateClock() {
    // 1. محاولة الوصول للعناصر
    const clockElement = document.getElementById('h-clock');
    const dateElement = document.getElementById('h-date');

    // 2. الحماية: إذا لم تجد العناصر، توقف فوراً ولا تظهر خطأ
    if (!clockElement || !dateElement) {
        return; 
    }

    // 3. التحديث فقط في حال وجود العناصر
    const now = new Date();
    
    // تنسيق الوقت (مثال: 08:30:15)
    clockElement.innerText = now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    // تنسيق التاريخ (مثال: 2026/05/01)
    dateElement.innerText = now.toLocaleDateString('en-GB');
}

// 4. تشغيل الساعة بأمان
// ننتظر حتى يكتمل تحميل الصفحة تماماً قبل البدء
document.addEventListener('DOMContentLoaded', () => {
    // تحديث فوري عند التحميل
    updateClock();
    
    // التحديث المستمر كل ثانية
    setInterval(updateClock, 1000);
});

// في حال كنت تستخدم نظام الحقن (Dynamic Injection) للهيدر
document.addEventListener('TeraLayoutReady', updateClock);

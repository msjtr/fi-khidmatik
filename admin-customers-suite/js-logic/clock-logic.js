/**
 * محرك الساعة الرقمية لمنصة الإتقان بلس
 * التحديث: ثانية بثانية
 */
function updateClock() {
    const now = new Date();
    
    // تنسيق الوقت (ساعة:دقيقة:ثانية)
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    document.getElementById('digital-clock').innerText = now.toLocaleTimeString('ar-SA', timeOptions);
    
    // تنسيق التاريخ (اليوم، الشهر، السنة)
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('digital-date').innerText = now.toLocaleDateString('ar-SA', dateOptions);
}

// تشغيل المحرك فوراً وكل ثانية
setInterval(updateClock, 1000);
updateClock();

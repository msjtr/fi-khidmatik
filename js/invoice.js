/**
 * إعدادات الفاتورة والهوية البصرية - منصة في خدمتك
 * الإصدار المحدث: أبريل 2026
 */

window.invoiceSettings = {
    // بيانات الهوية التجارية
    name: "منصة في خدمتك",
    slogan: "خيارك الأمثل للخدمات الرقمية",
    logo: "images/logo.svg",
    
    // البيانات القانونية (حسب طلبك الأخير)
    licenseNumber: "FL-765735204", // رقم شهادة العمل الحر
    taxNumber: "312495447600003",    // الرقم الضريبي
    
    // بيانات العنوان والاتصال
    address: "حائل : حي النقرة : شارع :سعد المشاط",
    buildingNumber: "3085",
    additionalNumber: "7718",
    postalCode: "55431",
    country: "المملكة العربية السعودية",
    
    // أرقام التواصل والروابط
    phone: "+966534051317",
    whatsapp: "+966545312021",
    email: "info@fi-khidmatik.com",
    website: "www.khidmatik.com",
    
    // إعدادات العرض
    currency: "ريال",
    taxRate: 0.15, // ضريبة 15%
};

/**
 * دوال مساعدة عالمية تستخدم في كافة أجزاء نظام الفواتير
 */

// تحويل كود الدفع إلى نص مفهوم
window.getPaymentName = function(method) {
    const methods = {
        'tamara': 'تمارا (تقسيط)',
        'tabby': 'تابي (تقسيط)',
        'emkan': 'إمكان (تقسيط)',
        'stcpay': 'STC Pay',
        'mada': 'بطاقة مدي (Mada)',
        'visa': 'فيزا / ماستركارد',
        'bank': 'تحويل بنكي',
        'cash': 'دفع نقدي'
    };
    return methods[method] || 'دفع إلكتروني';
};

// تحويل حالة الطلب إلى نص مفهوم باللغة العربية
window.getStatusText = function(status) {
    const statuses = {
        'completed': 'تم التنفيذ',
        'processing': 'جاري المعالجة',
        'pending': 'قيد الانتظار',
        'cancelled': 'ملغي',
        'refunded': 'مسترجع'
    };
    return statuses[status] || 'تحت المراجعة';
};

// دالة لتنسيق الأرقام بصيغة العملة السعودية
window.formatCurrency = function(amount) {
    return new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'SAR',
        minimumFractionDigits: 2
    }).format(amount).replace('ر.س', 'ريال');
};

console.log("Invoice Settings Loaded Successfully ✅");

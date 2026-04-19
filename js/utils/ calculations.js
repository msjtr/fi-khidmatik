/**
 * المسار الحالي: js/utils/calculations.js
 */

// 1. حساب الربح الصافي (سعر البيع - التكلفة)
export const calculateProductProfit = (cost, price) => {
    const result = (Number(price) || 0) - (Number(cost) || 0);
    return result.toFixed(2); // يعيد القيمة كصيغة نصية بكسرين عشريين (مثلاً: 15.00)
};

// 2. حساب نسبة الربح المئوية (اختياري - مفيد للتقارير)
export const calculateProfitMargin = (cost, price) => {
    if (!cost || cost <= 0) return 0;
    const profit = (Number(price) || 0) - (Number(cost) || 0);
    return ((profit / cost) * 100).toFixed(1); // يعطيك نسبة مثل 15.5%
};

// 3. تحديد حالة المخزون بناءً على الكمية
export const getStockStatus = (stock) => {
    const qty = Number(stock) || 0;
    
    if (qty <= 0) {
        return { label: "منتهي", color: "#e74c3c", icon: "fa-times-circle" };
    }
    if (qty <= 5) {
        return { label: "قرب ينفد", color: "#e67e22", icon: "fa-exclamation-triangle" };
    }
    return { label: "متوفر", color: "#27ae60", icon: "fa-check-circle" };
};

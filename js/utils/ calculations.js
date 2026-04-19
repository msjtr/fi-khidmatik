/**
 * utils/calculations.js
 * المكتبة الحسابية لمنصة تيرا - إدارة العمليات المالية والأرباح
 */

/**
 * 1. حساب صافي الربح للمنتج الواحد
 * @param {number} cost - سعر التكلفة
 * @param {number} price - سعر البيع
 * @returns {number}
 */
export const calculateProductProfit = (cost, price) => {
    if (!cost || !price) return 0;
    return Number(price) - Number(cost);
};

/**
 * 2. حساب نسبة الربح المئوية (Margin)
 * مفيد جداً لمحمد لمعرفة أي الباقات أكثر ربحية
 */
export const calculateProfitMargin = (cost, price) => {
    const profit = calculateProductProfit(cost, price);
    if (cost === 0) return 0;
    return ((profit / cost) * 100).toFixed(2);
};

/**
 * 3. حساب الأرباح الشهرية المتوقعة
 * @param {Array} orders - مصفوفة الطلبات المكتملة
 * @returns {object} - يحتوي على (إجمالي المبيعات، إجمالي التكلفة، صافي الربح)
 */
export const calculateMonthlyReport = (orders) => {
    let totalSales = 0;
    let totalCost = 0;

    orders.forEach(order => {
        totalSales += Number(order.price || 0);
        totalCost += Number(order.cost || 0); // نأخذ التكلفة وقت البيع
    });

    return {
        sales: totalSales,
        costs: totalCost,
        profit: totalSales - totalCost
    };
};

/**
 * 4. حساب نظام الأقساط (Tera Installment Engine)
 * يساعدك في إعطاء العميل حسبة دقيقة قبل الاعتماد
 * @param {number} totalAmount - المبلغ الإجمالي
 * @param {number} months - عدد الأشهر
 */
export const calculateInstallments = (totalAmount, months) => {
    if (!months || months <= 0) return totalAmount;
    const monthlyPayment = totalAmount / months;
    return {
        monthly: monthlyPayment.toFixed(2),
        total: Number(totalAmount).toFixed(2)
    };
};

/**
 * 5. مراقبة جرد المخزون (Inventory Health)
 * يعطيك مؤشر إذا كان المنتج يحتاج إعادة طلب
 */
export const getStockStatus = (currentStock) => {
    if (currentStock <= 0) return { label: "منتهي", color: "#e74c3c" };
    if (currentStock <= 5) return { label: "قرب ينفد", color: "#e67e22" };
    return { label: "متوفر", color: "#27ae60" };
};

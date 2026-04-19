/**
 * js/utils/validation.js
 * دوال التحقق من صحة البيانات
 */

/**
 * التحقق من صحة رقم الجوال السعودي
 */
export const isValidPhone = (phone) => {
    const cleaned = phone.toString().replace(/\s/g, '');
    const phoneRegex = /^(05|5)[0-9]{8}$/;
    return phoneRegex.test(cleaned);
};

/**
 * التحقق من صحة البريد الإلكتروني
 */
export const isValidEmail = (email) => {
    if (!email) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * التحقق من صحة الاسم (3 أحرف على الأقل)
 */
export const isValidName = (name) => {
    return name && name.trim().length >= 3;
};

/**
 * التحقق من صحة السعر
 */
export const isValidPrice = (price) => {
    const num = Number(price);
    return !isNaN(num) && num >= 0;
};

/**
 * التحقق من صحة الكمية
 */
export const isValidQuantity = (quantity) => {
    const num = Number(quantity);
    return !isNaN(num) && num >= 0 && Number.isInteger(num);
};

/**
 * التحقق من صحة المنتج
 */
export const validateProduct = (product) => {
    const errors = [];
    if (!isValidName(product.name)) errors.push('اسم المنتج مطلوب (3 أحرف على الأقل)');
    if (!isValidPrice(product.cost)) errors.push('سعر التكلفة غير صحيح');
    if (!isValidPrice(product.price)) errors.push('سعر البيع غير صحيح');
    if (product.price < product.cost) errors.push('سعر البيع يجب أن يكون أكبر من سعر التكلفة');
    if (!isValidQuantity(product.stock)) errors.push('الكمية غير صحيحة');
    return errors;
};

/**
 * التحقق من صحة العميل
 */
export const validateCustomer = (customer) => {
    const errors = [];
    if (!isValidName(customer.name)) errors.push('اسم العميل مطلوب (3 أحرف على الأقل)');
    if (!isValidPhone(customer.phone)) errors.push('رقم الجوال غير صحيح (يجب أن يبدأ بـ 05)');
    if (!isValidEmail(customer.email)) errors.push('البريد الإلكتروني غير صحيح');
    return errors;
};

export default {
    isValidPhone,
    isValidEmail,
    isValidName,
    isValidPrice,
    isValidQuantity,
    validateProduct,
    validateCustomer
};

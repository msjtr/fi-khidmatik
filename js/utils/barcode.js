/**
 * js/utils/barcode.js
 * دوال إنشاء وإدارة الباركود
 */

/**
 * إنشاء رقم باركود عشوائي
 */
export const generateBarcode = (prefix = 'TR') => {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${timestamp}-${random}`;
};

/**
 * التحقق من صحة الباركود
 */
export const validateBarcode = (barcode) => {
    const barcodeRegex = /^[A-Z0-9]{2,}-\d{8}-\d{4}$/;
    return barcodeRegex.test(barcode);
};

/**
 * فك تشفير الباركود
 */
export const decodeBarcode = (barcode) => {
    if (!validateBarcode(barcode)) return null;
    const parts = barcode.split('-');
    return {
        prefix: parts[0],
        timestamp: parts[1],
        random: parts[2],
        date: new Date(parseInt(parts[1].slice(-8)))
    };
};

export default {
    generateBarcode,
    validateBarcode,
    decodeBarcode
};

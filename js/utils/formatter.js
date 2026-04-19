/**
 * المسار الحالي: js/utils/formatter.js
 */

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'SAR',
    }).format(amount);
};

export const formatCurrency = (amount, currency = 'ريال') => {
    return `${Number(amount).toFixed(2)} ${currency}`;
};

export const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ar-EG');
};

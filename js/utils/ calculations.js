export const calculateTotals = (items, taxPercent = 0) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = (subtotal * taxPercent) / 100;
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
};

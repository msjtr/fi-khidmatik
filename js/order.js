window.orderTools = {
    processItems: (items) => (items || []).map(i => ({
        ...i,
        rowTotal: (parseFloat(i.price) * parseInt(i.qty || 1)).toFixed(2)
    })),
    translateStatus: (s) => ({ 'completed': 'تم التنفيذ', 'pending': 'معلق' }[s] || s)
};

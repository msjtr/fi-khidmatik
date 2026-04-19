export const calculateProductProfit = (cost, price) => {
    return (Number(price) || 0) - (Number(cost) || 0);
};

export const getStockStatus = (stock) => {
    if (stock <= 0) return { label: "منتهي", color: "#e74c3c" };
    if (stock <= 5) return { label: "قرب ينفد", color: "#e67e22" };
    return { label: "متوفر", color: "#27ae60" };
};

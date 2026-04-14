import { db } from './firebase.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 1. توليد رقم طلب احترافي
export const generateOrderID = () => {
    const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return `KF-${datePart}-${randomPart}`;
};

// 2. المحرك المالي (حساب الضرائب والإجمالي)
export const calculateFinalOrder = (items, discount = 0, shipping = 0) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const taxableAmount = subtotal - discount;
    const tax = taxableAmount * 0.15; // ضريبة 15%
    const total = taxableAmount + tax + parseFloat(shipping);

    return {
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2)
    };
};

// 3. حفظ الطلب مع الـ Snapshot
export const saveOrder = async (orderData) => {
    try {
        const docRef = await addDoc(collection(db, "orders"), {
            ...orderData,
            createdAt: serverTimestamp(),
            status: "جديد"
        });
        return docRef.id;
    } catch (e) {
        console.error("خطأ في الحفظ: ", e);
        throw e;
    }
};

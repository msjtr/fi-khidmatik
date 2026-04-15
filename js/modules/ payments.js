// Simplified for demo - integrated within order details modal
import { db } from '../core/firebase.js';
import { doc, updateDoc, getDoc } from "firebase/firestore";

export async function addPayment(orderId, amount) {
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);
    const order = orderSnap.data();
    const newPaid = (order.paidAmount || 0) + amount;
    if(newPaid > order.total) throw new Error('المبلغ أكبر من إجمالي الطلب');
    await updateDoc(orderRef, { paidAmount: newPaid, status: newPaid >= order.total ? 'completed' : 'pending' });
    return true;
}

import { db } from '../core/firebase.js';
import { collection, addDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function initCustomers(container) {
    container.innerHTML = `
        <div style="padding:20px;">
            <h3><i class="fas fa-users"></i> قاعدة بيانات العملاء</h3>
            <form id="cust-form" style="background:white; padding:20px; border-radius:10px; display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <input type="text" id="c-name" placeholder="الاسم الكامل" required>
                <input type="text" id="c-phone" placeholder="الجوال" required>
                <input type="text" id="c-city" placeholder="المدينة">
                <input type="text" id="c-district" placeholder="الحي">
                <button type="submit" style="grid-column: span 2; background:#3498db; color:white; border:none; padding:10px; border-radius:5px;">حفظ عميل جديد</button>
            </form>
            <div id="cust-list" style="margin-top:20px;"></div>
        </div>
    `;

    document.getElementById('cust-form').onsubmit = async (e) => {
        e.preventDefault();
        await addDoc(collection(db, "customers"), {
            name: document.getElementById('c-name').value,
            phone: document.getElementById('c-phone').value,
            city: document.getElementById('c-city').value,
            district: document.getElementById('c-district').value,
            createdAt: serverTimestamp()
        });
        alert("تم الحفظ");
        location.reload();
    };
}

import { collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { db } from '../js/firebase.js'; 

const currentEmployee = "محمد بن صالح الشمري"; // الموظف المسؤول
let quill;

// تهيئة المحرر
function initQuill() {
    if (!quill) {
        quill = new Quill('#editor-container', { theme: 'snow' });
    }
}

// 1. وظيفة تحميل سجل العمليات في الصفحة
async function loadOperationsLog() {
    const tbody = document.getElementById('operations-log-tbody');
    try {
        const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        tbody.innerHTML = '';

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const dateObj = new Date(data.createdAt);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${dateObj.toLocaleDateString('ar-SA')} - ${dateObj.toLocaleTimeString('ar-SA')}</td>
                <td><strong>${data.createdBy || 'النظام'}</strong></td>
                <td>${data.name}</td>
                <td><span class="status-badge" style="background:#3498db">${data.accountStatus}</span></td>
                <td style="color: green;">إضافة عميل</td>
            `;
            tbody.appendChild(row);
        });
    } catch (e) { console.error(e); }
}

// التحكم في النافذة المنبثقة
document.getElementById('open-add-modal').onclick = () => {
    document.getElementById('add-cust-modal').classList.add('active');
    initQuill();
};

document.getElementById('close-modal').onclick = () => {
    document.getElementById('add-cust-modal').classList.remove('active');
};

// 2. معالجة الإضافة مع تقييد اسم الموظف
document.getElementById('add-customer-form').onsubmit = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    
    // التحقق من الجوال
    const phone = document.getElementById('cust-phone').value;
    if (!phone.startsWith('5')) return alert("يجب أن يبدأ بـ 5");

    btn.innerText = "جاري التقييد...";
    btn.disabled = true;

    try {
        const customerData = {
            name: document.getElementById('cust-name').value,
            phone: phone,
            accountStatus: document.getElementById('cust-accountStatus').value,
            detailedNotes: quill.root.innerHTML,
            createdAt: new Date().toISOString(),
            createdBy: currentEmployee, // تقييد العملية باسم الموظف
            attachments: []
        };

        await addDoc(collection(db, "customers"), customerData);
        alert("تمت الإضافة وتقييد العملية في السجل بنجاح");
        
        document.getElementById('add-cust-modal').classList.remove('active');
        e.target.reset();
        quill.setContents([]);
        loadOperationsLog(); // تحديث السجل فوراً في الصفحة
    } catch (error) {
        alert("خطأ في الاتصال");
    } finally {
        btn.innerText = "تأكيد الإضافة";
        btn.disabled = false;
    }
};

document.addEventListener('DOMContentLoaded', loadOperationsLog);

import { db } from '../firebase-config.js'; 
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    updateDoc, 
    deleteDoc, 
    serverTimestamp,
    query,
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function initCustomers(container) {
    // --- تعريف العناصر من داخل الـ Container ---
    const customersTable = container.querySelector('#customers-list');
    const customerForm = container.querySelector('#customer-form');
    const customerModal = container.querySelector('#customer-modal');
    const statTotal = container.querySelector('#stat-total');
    
    // الأزرار
    const btnAddNew = container.querySelector('button[onclick="openCustomerModal()"]') || container.querySelector('.btn-primary-tera');
    const btnCloseModal = container.querySelectorAll('button[onclick="closeCustomerModal()"]');
    const btnDelete = container.querySelector('#delete-btn');

    // مصفوفة محلية لتخزين البيانات مؤقتاً (لتحسين سرعة التعديل)
    let localCustomers = [];

    // --- 1. الدوال الأساسية ---

    const openModal = (isEdit = false) => {
        if (!isEdit) {
            customerForm.reset();
            container.querySelector('#edit-customer-id').value = '';
            container.querySelector('#modal-title').innerText = 'إضافة عميل جديد';
            if (btnDelete) btnDelete.style.display = 'none';
        }
        customerModal.style.display = 'flex';
    };

    const closeModal = () => {
        customerModal.style.display = 'none';
    };

    // --- 2. ربط الأحداث برمجياً (حل مشكلة CSP Eval) ---

    if (btnAddNew) {
        btnAddNew.removeAttribute('onclick'); // إزالة الربط القديم
        btnAddNew.addEventListener('click', () => openModal(false));
    }

    btnCloseModal.forEach(btn => {
        btn.removeAttribute('onclick');
        btn.addEventListener('click', closeModal);
    });

    if (btnDelete) {
        btnDelete.removeAttribute('onclick');
        btnDelete.addEventListener('click', async () => {
            const id = container.querySelector('#edit-customer-id').value;
            if (id && confirm('هل أنت متأكد من حذف هذا العميل نهائياً؟')) {
                try {
                    await deleteDoc(doc(db, "customers", id));
                    closeModal();
                    loadCustomers();
                } catch (e) { alert("خطأ في الحذف"); }
            }
        });
    }

    // --- 3. جلب البيانات وعرضها ---

    async function loadCustomers() {
        if (!customersTable) return;
        customersTable.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px;"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</td></tr>';
        
        try {
            const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            customersTable.innerHTML = '';
            localCustomers = []; // تصفير المصفوفة المحلية

            if (statTotal) statTotal.innerText = querySnapshot.size;

            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                const id = docSnap.id;
                localCustomers.push({ id, ...data });

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="padding: 15px;"><div style="font-weight:700;">${data.name}</div></td>
                    <td style="padding: 15px;">${data.countryCode} ${data.phone}</td>
                    <td style="padding: 15px;">${data.city || '-'}</td>
                    <td style="padding: 15px;">
                        <span style="padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; background: ${getTagBg(data.tag)}">
                            ${translateTag(data.tag)}
                        </span>
                    </td>
                    <td style="padding: 15px; text-align: center;">
                        <button class="edit-action-btn" data-id="${id}" style="background:none; border:none; color:#e67e22; cursor:pointer;">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                `;
                customersTable.appendChild(tr);
            });

            // ربط أزرار التعديل داخل الجدول
            container.querySelectorAll('.edit-action-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const customerId = btn.getAttribute('data-id');
                    renderEditModal(customerId);
                });
            });

        } catch (error) {
            console.error(error);
            customersTable.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">خطأ في الاتصال بالقاعدة</td></tr>';
        }
    }

    // --- 4. معالجة التعديل ---

    function renderEditModal(id) {
        const data = localCustomers.find(c => c.id === id);
        if (!data) return;

        container.querySelector('#edit-customer-id').value = id;
        container.querySelector('#cust-name').value = data.name || '';
        container.querySelector('#cust-email').value = data.email || '';
        container.querySelector('#cust-countryCode').value = data.countryCode || '+966';
        container.querySelector('#cust-phone').value = data.phone || '';
        container.querySelector('#cust-tag').value = data.tag || 'normal';
        container.querySelector('#cust-city').value = data.city || '';
        container.querySelector('#cust-district').value = data.district || '';
        container.querySelector('#cust-notes').value = data.notes || '';

        container.querySelector('#modal-title').innerText = 'تعديل بيانات العميل';
        if (btnDelete) btnDelete.style.display = 'block';
        openModal(true);
    }

    // --- 5. حفظ البيانات (Submit) ---

    customerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = container.querySelector('#edit-customer-id').value;
        
        const payload = {
            name: container.querySelector('#cust-name').value,
            email: container.querySelector('#cust-email').value,
            countryCode: container.querySelector('#cust-countryCode').value,
            phone: container.querySelector('#cust-phone').value,
            tag: container.querySelector('#cust-tag').value,
            city: container.querySelector('#cust-city').value,
            district: container.querySelector('#cust-district').value,
            notes: container.querySelector('#cust-notes').value,
            updatedAt: serverTimestamp()
        };

        try {
            if (id) {
                await updateDoc(doc(db, "customers", id), payload);
            } else {
                payload.createdAt = serverTimestamp();
                await addDoc(collection(db, "customers"), payload);
            }
            closeModal();
            loadCustomers();
        } catch (error) {
            alert("فشلت عملية الحفظ، تحقق من الاتصال");
        }
    });

    // دوال مساعدة
    function translateTag(tag) {
        const mapping = { 'normal': 'عادي', 'vip': 'مميز ⭐', 'fraud': 'محتال ⚠️' };
        return mapping[tag] || 'أخرى';
    }

    function getTagBg(tag) {
        if (tag === 'vip') return '#fef3c7';
        if (tag === 'fraud') return '#fee2e2';
        return '#f1f5f9';
    }

    // التشغيل الأول
    loadCustomers();
}

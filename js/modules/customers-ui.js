/**
 * js/modules/customers-ui.js
 * موديول واجهة مستخدم العملاء - النسخة المطابقة لبيانات Firestore
 */

export async function initCustomersUI(container) {
    console.log("تنشيط واجهة العملاء...");
    // التأكد من وجود العنصر قبل البدء
    if (container.querySelector('#customers-tbody')) {
        await renderCustomersTable(container);
    } else {
        // انتظار بسيط لضمان حقن الـ HTML
        setTimeout(() => renderCustomersTable(document), 100);
    }
}

export async function renderCustomersTable(context = document) {
    const tableBody = context.querySelector('#customers-tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="9" style="text-align:center;">جاري جلب بيانات عملاء تيرا...</td></tr>';

    try {
        // جلب البيانات من مجموعة "customers"
        const querySnapshot = await window.db.collection("customers").orderBy("name").get();
        
        if (querySnapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="9" style="text-align:center;">لا يوجد عملاء مسجلين.</td></tr>';
            return;
        }

        let rows = '';
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const id = doc.id;

            // مطابقة المسميات مع بياناتك: buildingNo, additionalNo, postalCode, tag
            rows += `
                <tr>
                    <td>
                        <div style="display:flex; align-items:center; gap:10px;">
                            <div style="width:30px; height:30px; background:#2563eb; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px;">
                                ${(data.name || 'C').charAt(0)}
                            </div>
                            <span>${data.name || '---'}</span>
                        </div>
                    </td>
                    <td dir="ltr">${data.countryCode || ''} ${data.phone || '---'}</td>
                    <td>${data.city || '---'}</td>
                    <td>
                        <span class="badge ${data.tag === 'vip' ? 'vip' : 'regular'}">
                            ${(data.tag || 'عادي').toUpperCase()}
                        </span>
                    </td>
                    <td>${data.buildingNo || '---'}</td>
                    <td>${data.additionalNo || '---'}</td>
                    <td>${data.postalCode || '---'}</td>
                    <td>${data.poBox || '---'}</td>
                    <td>
                        <div class="table-actions">
                            <button onclick="window.editCustomer('${id}')" style="color: #2563eb; background:none; border:none; cursor:pointer;"><i class="fas fa-edit"></i></button>
                            <button onclick="window.deleteCustomer('${id}')" style="color: #ef4444; background:none; border:none; cursor:pointer; margin-right:10px;"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });
        tableBody.innerHTML = rows;

    } catch (error) {
        console.error("Firestore Error:", error);
        tableBody.innerHTML = `<tr><td colspan="9" style="color:red; text-align:center;">خطأ: ${error.message}</td></tr>`;
    }
}

// دالة فتح النافذة المنبثقة وتعبئتها بالبيانات الصحيحة عند التعديل
window.editCustomer = async (id) => {
    const modal = document.getElementById('customer-modal');
    const form = document.getElementById('customer-form');
    if (!modal || !form) return;

    try {
        const doc = await window.db.collection("customers").doc(id).get();
        if (doc.exists) {
            const data = doc.data();
            const f = form.elements;

            // تعبئة النموذج بالمسميات الصحيحة من Firestore
            f['name'].value = data.name || '';
            f['phone'].value = data.phone || '';
            f['city'].value = data.city || '';
            f['tag'].value = data.tag || 'عادي';
            f['buildingNo'].value = data.buildingNo || '';
            f['additionalNo'].value = data.additionalNo || '';
            f['postalCode'].value = data.postalCode || '';
            f['poBox'].value = data.poBox || '';
            f['district'].value = data.district || '';
            f['street'].value = data.street || '';
            f['email'].value = data.email || '';

            form.dataset.mode = 'edit';
            form.dataset.editId = id;
            document.getElementById('modal-title').innerText = 'تعديل بيانات العميل';
            modal.style.display = 'flex';
        }
    } catch (error) {
        alert("خطأ في تحميل البيانات");
    }
};

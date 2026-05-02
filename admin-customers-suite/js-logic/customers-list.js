/**
 * نظام Tera V12 - محرك قائمة العملاء
 * مؤسسة الإتقان بلس - حائل
 */

// 1. استيراد دوال فايربيس اللازمة (تم التحديث للإصدار 12.12.1 الموحد)
import { collection, getDocs, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

// 2. استيراد الاتصال الجاهز بقاعدة البيانات من ملف الإعدادات المركزي
import { db } from './firebase.js'; 

// 3. تحديد مسار مجموعة العملاء في قاعدة البيانات
const customersRef = collection(db, "customers");

// متغير عالمي لحفظ بيانات العملاء لتسهيل التعديل والبحث
let customersDataList = [];

// ----------------------------------------------------
// الدالة الأولى: جلب وعرض بيانات العملاء في الجدول
// ----------------------------------------------------
async function loadCustomers() {
    const tbody = document.getElementById('customers-tbody');
    try {
        const querySnapshot = await getDocs(customersRef);
        customersDataList = [];
        tbody.innerHTML = ''; // مسح رسالة التحميل

        let index = 1;
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            data.id = docSnap.id; // حفظ معرف الوثيقة للحذف والتعديل
            customersDataList.push(data);

            // تجهيز الصورة الرمزية (الحرف الأول من الاسم إذا لم توجد صورة)
            const firstLetter = data.name ? data.name.charAt(0).toUpperCase() : '?';
            const avatarHtml = data.avatarUrl 
                ? `<img src="${data.avatarUrl}" alt="${data.name}">` 
                : firstLetter;

            // تجهيز رابط الخريطة (بحث جوجل مابس باستخدام العناوين المدخلة)
            const fullAddress = `${data.country || ''} ${data.city || ''} ${data.district || ''} ${data.street || ''} ${data.buildingNo || ''}`.trim();
            const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

            // تنسيق التاريخ ليناسب التوقيت السعودي
            const dateAdded = data.createdAt ? new Date(data.createdAt).toLocaleDateString('ar-SA') : 'غير متوفر';

            // حالة العميل الافتراضية إذا لم تكن موجودة بالقاعدة
            const status = data.status || "نشط";

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index++}</td>
                <td class="sticky-col">
                    <div class="avatar-cell">
                        <div class="avatar-circle">${avatarHtml}</div>
                        <strong>${data.name || 'بدون اسم'}</strong>
                    </div>
                </td>
                <td dir="ltr">${data.phone || '-'}</td>
                <td dir="ltr">${data.countryCode || '+966'}</td>
                <td>${data.email || '-'}</td>
                <td>${data.country || '-'}</td>
                <td>${data.city || '-'}</td>
                <td>${data.district || '-'}</td>
                <td>${data.street || '-'}</td>
                <td>${data.buildingNo || '-'}</td>
                <td>${data.additionalNo || '-'}</td>
                <td>${data.postalCode || '-'}</td>
                <td>${data.poBox || '-'}</td>
                <td>
                    <a href="${mapSearchUrl}" target="_blank" class="map-link">
                        📍 تحقق من الموقع
                    </a>
                </td>
                <td>${dateAdded}</td>
                <td>${status}</td>
                <td><span class="tag-badge">${data.tag || 'عام'}</span></td>
                <td class="sticky-col-right">
                    <button class="action-btn edit" title="تعديل" onclick="openEditModal('${data.id}')">✏️</button>
                    <button class="action-btn print" title="طباعة" onclick="printCustomer('${data.id}')">🖨️</button>
                    <button class="action-btn delete" title="حذف" onclick="deleteCustomer('${data.id}')">🗑️</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // تحديث عداد العملاء في أعلى الصفحة
        const countElement = document.getElementById('customers-count');
        if (countElement) {
            countElement.innerText = customersDataList.length;
        }

        // في حال كانت قاعدة البيانات فارغة
        if (customersDataList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="18" style="text-align:center; padding:20px;">لا يوجد عملاء مضافين في النظام حتى الآن</td></tr>`;
        }

    } catch (error) {
        console.error("خطأ في جلب العملاء:", error);
        tbody.innerHTML = `<tr><td colspan="18" style="color:red; text-align:center; padding:20px;">خطأ في الاتصال بقاعدة البيانات. تأكد من إعدادات Firebase.</td></tr>`;
    }
}

// ----------------------------------------------------
// الدالة الثانية: نظام التعديل (نافذة المودال)
// ----------------------------------------------------
// تم استخدام window لربط الدوال مع أزرار HTML المباشرة
window.openEditModal = (id) => {
    // جلب بيانات العميل من المصفوفة المخزنة بالذاكرة
    const customer = customersDataList.find(c => c.id === id);
    if (!customer) return;

    // تعبئة الحقول بالبيانات القديمة
    document.getElementById('edit-doc-id').value = id;
    document.getElementById('edit-name').value = customer.name || '';
    document.getElementById('edit-phone').value = customer.phone || '';
    document.getElementById('edit-countryCode').value = customer.countryCode || '';
    document.getElementById('edit-email').value = customer.email || '';
    document.getElementById('edit-country').value = customer.country || '';
    document.getElementById('edit-city').value = customer.city || '';
    document.getElementById('edit-district').value = customer.district || '';
    document.getElementById('edit-street').value = customer.street || '';
    document.getElementById('edit-buildingNo').value = customer.buildingNo || '';
    document.getElementById('edit-additionalNo').value = customer.additionalNo || '';
    document.getElementById('edit-postalCode').value = customer.postalCode || '';
    document.getElementById('edit-poBox').value = customer.poBox || '';
    document.getElementById('edit-tag').value = customer.tag || '';
    document.getElementById('edit-status').value = customer.status || 'نشط';

    // تحديث صورة العرض في النافذة المنبثقة
    const preview = document.getElementById('edit-avatar-preview');
    preview.innerHTML = customer.avatarUrl ? `<img src="${customer.avatarUrl}">` : (customer.name ? customer.name.charAt(0) : 'م');

    // إظهار النافذة
    document.getElementById('edit-customer-modal').classList.add('active');
};

window.closeEditModal = () => {
    document.getElementById('edit-customer-modal').classList.remove('active');
};

// ----------------------------------------------------
// الدالة الثالثة: حفظ التعديلات في قاعدة البيانات
// ----------------------------------------------------
const editForm = document.getElementById('edit-customer-form');
if(editForm) {
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('edit-doc-id').value;
        const saveBtn = document.querySelector('.save-btn');
        
        // تعطيل الزر مؤقتاً أثناء التحميل
        saveBtn.innerText = 'جارِ الحفظ...';
        saveBtn.disabled = true;

        try {
            const docRef = doc(db, "customers", id);
            
            // حقن البيانات الجديدة فوق القديمة
            await updateDoc(docRef, {
                name: document.getElementById('edit-name').value,
                phone: document.getElementById('edit-phone').value,
                countryCode: document.getElementById('edit-countryCode').value,
                email: document.getElementById('edit-email').value,
                country: document.getElementById('edit-country').value,
                city: document.getElementById('edit-city').value,
                district: document.getElementById('edit-district').value,
                street: document.getElementById('edit-street').value,
                buildingNo: document.getElementById('edit-buildingNo').value,
                additionalNo: document.getElementById('edit-additionalNo').value,
                postalCode: document.getElementById('edit-postalCode').value,
                poBox: document.getElementById('edit-poBox').value,
                tag: document.getElementById('edit-tag').value,
                status: document.getElementById('edit-status').value,
                updatedAt: new Date().toISOString() // توقيت آخر تعديل
            });
            
            alert('تم تحديث بيانات العميل بنجاح!');
            closeEditModal();
            loadCustomers(); // إعادة تحميل الجدول لإظهار التعديلات فوراً
            
        } catch (error) {
            console.error("خطأ أثناء التعديل:", error);
            alert('حدث خطأ أثناء الحفظ، يرجى المحاولة مرة أخرى.');
        } finally {
            saveBtn.innerText = 'حفظ التعديلات';
            saveBtn.disabled = false;
        }
    });
}

// ----------------------------------------------------
// الدالة الرابعة: نظام الحذف الآمن
// ----------------------------------------------------
window.deleteCustomer = async (id) => {
    if(confirm('هل أنت متأكد من حذف هذا العميل نهائياً من قاعدة البيانات؟ لا يمكن التراجع عن هذا الإجراء.')) {
        try {
            await deleteDoc(doc(db, "customers", id));
            alert('تم الحذف بنجاح');
            loadCustomers(); // تحديث الجدول بعد الحذف
        } catch (error) {
            console.error("خطأ أثناء الحذف:", error);
            alert('حدث خطأ أثناء محاولة الحذف.');
        }
    }
};

// ----------------------------------------------------
// الدالة الخامسة: نظام الطباعة
// ----------------------------------------------------
window.printCustomer = (id) => {
    // كإجراء مبدئي، سنقوم بطباعة الشاشة الحالية. 
    // يمكنك لاحقاً تخصيص فاتورة أو بطاقة عميل لطباعتها.
    window.print(); 
};

// ----------------------------------------------------
// تشغيل جلب البيانات تلقائياً بمجرد تحميل الصفحة
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', loadCustomers);

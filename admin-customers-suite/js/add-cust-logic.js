/**
 * نظام Tera V12 - محرك إضافة العملاء
 * الملف: js/add-cust-logic.js
 * مؤسسة الإتقان بلس - حائل
 */

// 1. استيراد الدوال اللازمة من Firebase الإصدار 12.12.1 الموحد
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

// 2. استيراد الاتصال الجاهز بقاعدة البيانات من ملف الإعدادات المركزي (في نفس المجلد)
import { db } from './firebase.js'; 

document.addEventListener('DOMContentLoaded', () => {
    // جلب النموذج وزر الحفظ
    const addForm = document.getElementById('addCustomerForm');
    const saveBtn = document.getElementById('btnSave');

    if (saveBtn) {
        saveBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            // 3. جمع البيانات من الحقول المطابقة لهيكل قاعدة البيانات الجديد (18 حقل)
            const customerData = {
                name: document.getElementById('add-name')?.value.trim() || "",
                phone: document.getElementById('add-phone')?.value.trim() || "",
                countryCode: document.getElementById('add-countryCode')?.value.trim() || "+966",
                email: document.getElementById('add-email')?.value.trim() || "",
                country: document.getElementById('add-country')?.value.trim() || "المملكة العربية السعودية",
                city: document.getElementById('add-city')?.value.trim() || "",
                district: document.getElementById('add-district')?.value.trim() || "",
                street: document.getElementById('add-street')?.value.trim() || "",
                buildingNo: document.getElementById('add-buildingNo')?.value.trim() || "",
                additionalNo: document.getElementById('add-additionalNo')?.value.trim() || "",
                postalCode: document.getElementById('add-postalCode')?.value.trim() || "",
                poBox: document.getElementById('add-poBox')?.value.trim() || "",
                tag: document.getElementById('add-tag')?.value.trim() || "عام", 
                status: document.getElementById('add-status')?.value || "نشط",
                notes: document.getElementById('add-notes')?.value.trim() || "",
                
                // بيانات النظام التلقائية والتوقيت الدقيق
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                addedBy: "أبا صالح الشمري" // الموظف المسؤول
            };

            // 4. التحقق من صحة البيانات الأساسية (الاسم ورقم الجوال إجبارية)
            if (!customerData.name || !customerData.phone) {
                alert("يا أبا صالح، يرجى التأكد من تعبئة (اسم العميل) و (رقم الجوال) على الأقل.");
                return;
            }

            try {
                // 5. تعطيل الزر لمنع الإرسال المزدوج بالخطأ
                saveBtn.disabled = true;
                saveBtn.innerText = "جارِ الحفظ في Tera...";

                // 6. حفظ البيانات في مجموعة "customers"
                const customersRef = collection(db, "customers");
                await addDoc(customersRef, customerData);

                // 7. إشعار النجاح وتفريغ الحقول
                alert("تم إضافة العميل بنجاح إلى قاعدة بيانات الإتقان بلس.");
                if (addForm) addForm.reset(); 

                // 8. توجيه المستخدم تلقائياً إلى صفحة قائمة العملاء بعد الإضافة بنجاح
                if (typeof window.parent.teraNavigate === "function") {
                    window.parent.teraNavigate('customers-list');
                }

            } catch (error) {
                console.error("خطأ أثناء الحفظ:", error);
                alert("حدث خطأ في الاتصال، يرجى التحقق من إعدادات Firebase.");
            } finally {
                // إعادة تفعيل الزر للعمليات القادمة
                saveBtn.disabled = false;
                saveBtn.innerText = "حفظ العميل في Tera";
            }
        });
    }
});

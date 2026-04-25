import { fetchCustomerById } from './customers-core.js';

export async function initPrint() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        console.error("❌ معرف العميل غير موجود في الرابط");
        return;
    }

    try {
        const c = await fetchCustomerById(id);

        if (c) {
            // البيانات الأساسية
            document.getElementById('p-name').innerText = c.name || 'غير مسجل';
            document.getElementById('p-email').innerText = c.Email || 'غير متوفر';
            document.getElementById('p-phone').innerText = c.Phone || 'غير متوفر';

            // تفاصيل العنوان الوطني (تنسيق منظم للطباعة)
            const addressHtml = `
                <div class="print-addr-box">
                    <strong>${c.country || 'السعودية'} - ${c.city || ''}</strong><br>
                    <span>حي ${c.district || '---'} | شارع ${c.street || '---'}</span><br>
                    <small>مبنى: ${c.buildingNo || '---'} | إضافي: ${c.additionalNo || '---'} | رمز بريدي: ${c.postalCode || '---'}</small>
                    ${c.poBox ? `<br><small>صندوق بريد: ${c.poBox}</small>` : ''}
                </div>
            `;
            document.getElementById('p-address').innerHTML = addressHtml;

            // الملاحظات
            document.getElementById('p-notes').innerText = c.notes || 'لا يوجد ملاحظات فنية.';

            // معالجة التاريخ بأمان (Timestamp Handling)
            let formattedDate = 'غير محدد';
            if (c.CreatedAt) {
                // التأكد من تحويل التاريخ سواء كان Timestamp أو Object
                const dateObj = c.CreatedAt.toDate ? c.CreatedAt.toDate() : new Date(c.CreatedAt);
                formattedDate = dateObj.toLocaleDateString('ar-SA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }
            document.getElementById('p-date').innerText = formattedDate;

            // بدء الطباعة بعد التأكد من تحميل العناصر
            console.log("🖨️ جاهز للطباعة...");
            setTimeout(() => {
                window.print();
                // إغلاق النافذة اختيارياً بعد الطباعة أو الإلغاء
                // window.close(); 
            }, 1000);

        } else {
            document.body.innerHTML = '<h2 style="text-align:center;margin-top:50px;">عذراً، لم يتم العثور على بيانات العميل</h2>';
        }
    } catch (error) {
        console.error("❌ خطأ أثناء تجهيز الطباعة:", error);
    }
}

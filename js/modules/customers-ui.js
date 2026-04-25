/* --- الجزء المطور لدالة handleEdit داخل setupGlobalFunctions --- */

window.handleEdit = (id) => {
    const cust = customersCache.find(c => c.id === id);
    if (cust) {
        // فتح المودال
        window.showAddCustomerModal(); 
        
        // تغيير عنوان المودال ليعرف المستخدم أنه في وضع التعديل
        const modalTitle = document.querySelector('#customer-modal h3');
        if(modalTitle) modalTitle.innerText = "📝 تعديل بيانات العميل";

        // تعبئة الحقول تلقائياً (تأكد أن الـ ID في الـ HTML يطابق هذه المسميات)
        const form = document.getElementById('customer-form');
        if(form) {
            form.elements['name'].value = cust.name || '';
            form.elements['phone'].value = cust.phone || '';
            form.elements['email'].value = cust.email || '';
            form.elements['city'].value = cust.city || 'حائل';
            form.elements['district'].value = cust.district || '';
            form.elements['street'].value = cust.street || '';
            form.elements['buildingNo'].value = cust.buildingNo || '';
            form.elements['additionalNo'].value = cust.additionalNo || '';
            form.elements['tag'].value = cust.tag || 'regular';
            
            // إضافة ID العميل في حقل مخفي ليعرف الـ Core أننا نقوم بالتحديث وليس الإضافة
            form.dataset.editId = id; 
        }
    }
};

/* --- تحسين دالة الطباعة لتكون احترافية --- */
window.handlePrint = (id) => {
    const cust = customersCache.find(c => c.id === id);
    if (cust) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>بطاقة عميل - ${cust.name}</title>
                <style>
                    body { font-family: 'Tajawal', sans-serif; direction: rtl; padding: 40px; }
                    .card { border: 2px solid #2563eb; padding: 20px; border-radius: 15px; }
                    .header { border-bottom: 2px solid #eee; margin-bottom: 20px; padding-bottom: 10px; }
                    .detail { margin-bottom: 10px; font-size: 1.2rem; }
                    b { color: #2563eb; }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="header"><h2>منصة تيرا - بطاقة معلومات عميل</h2></div>
                    <div class="detail"><b>الاسم:</b> ${cust.name}</div>
                    <div class="detail"><b>الجوال:</b> ${cust.phone}</div>
                    <div class="detail"><b>العنوان:</b> ${cust.city}، حي ${cust.district}، شارع ${cust.street}</div>
                    <div class="detail"><b>رقم المبنى:</b> ${cust.buildingNo} | <b>الإضافي:</b> ${cust.additionalNo}</div>
                    <div class="detail"><b>التصنيف:</b> ${cust.tag === 'vip' ? 'عميل مميز ★' : 'عميل عادي'}</div>
                </div>
                <script>window.onload = function() { window.print(); window.close(); }</script>
            </body>
            </html>
        `);
    }
};

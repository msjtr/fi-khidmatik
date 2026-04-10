<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>فاتورة إلكترونية - منصة في خدمتك</title>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/gh/ushelp/EasyQRCodeJS@master/dist/easy.qrcode.min.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js"></script>

    <style>
        :root { --primary: #1e3a5f; --secondary: #f8fafc; --border: #cbd5e1; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #f1f5f9; font-family: 'Tajawal', sans-serif; color: #1e293b; }
        .page { width: 210mm; min-height: 297mm; padding: 15mm; margin: 10px auto; background: white; box-shadow: 0 0 15px rgba(0,0,0,0.1); display: flex; flex-direction: column; page-break-after: always; }
        
        /* الهيدر الثابت */
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid var(--primary); padding-bottom: 15px; margin-bottom: 20px; }
        .logo-box img { height: 65px; }
        .branding-meta { text-align: left; font-size: 11px; font-weight: bold; color: #64748b; }
        .doc-label { background: var(--primary); color: white; padding: 8px 15px; border-radius: 4px; font-weight: 800; font-size: 16px; }

        /* قسم البيانات (المصدر والمستلم) - عمودين متساويين */
        .entities-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
        .entity-card { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
        .entity-head { background: var(--secondary); padding: 8px 12px; font-weight: 800; font-size: 13px; border-bottom: 1px solid var(--border); color: var(--primary); }
        .entity-body { padding: 12px; font-size: 11px; line-height: 1.8; }
        .entity-body b { color: #000; }

        /* تفاصيل الفاتورة */
        .invoice-meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; background: #fcfcfc; padding: 10px; border-radius: 6px; border: 1px dashed var(--border); }
        .meta-item { font-size: 11px; }
        .meta-item b { display: block; color: var(--primary); font-size: 10px; }

        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: var(--primary); color: white; padding: 10px; font-size: 11px; text-align: center; }
        td { border: 1px solid #e2e8f0; padding: 10px; text-align: center; font-size: 11px; }
        .product-img { width: 60px; height: 60px; object-fit: contain; border: 1px solid #eee; border-radius: 4px; }

        .total-section { margin-right: auto; width: 250px; border: 2px solid var(--primary); border-radius: 8px; padding: 15px; background: var(--secondary); text-align: center; }
        .total-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px; }
        .grand-total { font-size: 18px; font-weight: 800; color: var(--primary); border-top: 1px solid var(--border); pt: 5px; margin-top: 5px; }

        .qr-area { display: flex; justify-content: space-around; margin-top: auto; padding-top: 30px; }
        .footer { background: var(--primary); color: white; padding: 10px; border-radius: 6px; display: flex; justify-content: space-between; font-size: 10px; margin-top: 15px; }

        @media print { .no-print { display: none; } .page { margin: 0; box-shadow: none; width: 100%; } }
    </style>
</head>
<body>

<div id="loader" style="text-align:center; padding:100px;">جاري جلب بيانات المصدر والعميل...</div>
<div id="app"></div>

<script type="module">
    // محاكاة استيراد وظائف order.js لتعمل داخل المتصفح
    const firebaseConfig = {
        apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
        authDomain: "msjt301-974bb.firebaseapp.com",
        projectId: "msjt301-974bb",
        storageBucket: "msjt301-974bb.firebasestorage.app",
        messagingSenderId: "186209858482",
        appId: "1:186209858482:web:186ca610780799ef562aab"
    };

    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    // بيانات المصدر الثابتة (منصة في خدمتك)
    const SOURCE_INFO = {
        name: "منصة في خدمتك",
        country: "المملكة العربية السعودية",
        city: "حائل",
        district: "حي النقرة",
        street: "شارع سعد المشاط",
        building: "3085",
        postalCode: "55431",
        additionalNo: "7718",
        taxId: "312495447600003",
        license: "FL-765735204"
    };

    async function getFullOrderDetails() {
        const id = new URLSearchParams(window.location.search).get('id');
        if (!id) return null;

        try {
            // 1. جلب الطلب
            const orderDoc = await db.collection("orders").doc(id).get();
            if (!orderDoc.exists) return null;
            const order = orderDoc.data();

            // 2. جلب العميل (الربط بـ customerId)
            const customerDoc = await db.collection("customers").doc(order.customerId).get();
            const customer = customerDoc.exists ? customerDoc.data() : {};

            // 3. جلب المنتجات (الربط بـ items)
            const items = await Promise.all((order.items || []).map(async item => {
                const prodDoc = await db.collection("products").doc(item.productId).get();
                const prod = prodDoc.exists ? prodDoc.data() : {};
                return {
                    ...item,
                    name: prod.name || item.name,
                    image: prod.image || item.image || 'images/logo.svg'
                };
            }));

            return { ...order, customer, items, id: orderDoc.id };
        } catch (e) { console.error(e); return null; }
    }

    function renderInvoice(data) {
        const app = document.getElementById('app');
        document.getElementById('loader').style.display = 'none';

        app.innerHTML = `
        <div class="page">
            <div class="header">
                <div class="logo-box"><img src="images/logo.svg" onerror="this.src='https://via.placeholder.com/150?text=Logo'"></div>
                <div class="doc-label">فاتورة إلكترونية</div>
                <div class="branding-meta">
                    الرقم الضريبي: ${SOURCE_INFO.taxId}<br>
                    شهادة العمل الحر: ${SOURCE_INFO.license}
                </div>
            </div>

            <div class="invoice-meta">
                <div class="meta-item"><b>رقم الفاتورة</b>#${data.orderNumber || data.id.substring(0,8).toUpperCase()}</div>
                <div class="meta-item"><b>التاريخ والوقت</b>${data.createdAt || new Date().toLocaleString('ar-SA')}</div>
                <div class="meta-item"><b>حالة الطلب</b>${data.status || 'تم التنفيذ'}</div>
            </div>

            <div class="entities-grid">
                <div class="entity-card">
                    <div class="entity-head">مصدرة من:</div>
                    <div class="entity-body">
                        <b>${SOURCE_INFO.name}</b><br>
                        ${SOURCE_INFO.country} - ${SOURCE_INFO.city}<br>
                        ${SOURCE_INFO.district} - ${SOURCE_INFO.street}<br>
                        مبنى: ${SOURCE_INFO.building} | الرمز البريدي: ${SOURCE_INFO.postalCode}<br>
                        الرقم الإضافي: ${SOURCE_INFO.additionalNo}
                    </div>
                </div>

                <div class="entity-card">
                    <div class="entity-head">مصدرة إلى:</div>
                    <div class="entity-body">
                        <b>اسم العميل:</b> ${data.customer.name || '---'}<br>
                        <b>الدولة:</b> ${data.customer.country || 'المملكة العربية السعودية'}<br>
                        <b>العنوان:</b> ${data.customer.address || '---'}<br>
                        <b>الجوال:</b> ${data.customer.phone || '---'}<br>
                        <b>البريد:</b> ${data.customer.email || '---'}
                    </div>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>صورة المنتج</th>
                        <th>المنتج</th>
                        <th>الكمية</th>
                        <th>سعر الوحدة</th>
                        <th>الإجمالي</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.items.map(item => `
                        <tr>
                            <td><img src="${item.image}" class="product-img"></td>
                            <td style="text-align:right"><b>${item.name}</b></td>
                            <td>${item.quantity || item.qty}</td>
                            <td>${item.price} ر.س</td>
                            <td>${((item.quantity || item.qty) * item.price).toFixed(2)} ر.س</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="total-section">
                <div class="total-row"><span>المجموع الفرعي:</span> <span>${(data.total / 1.15).toFixed(2)} ر.س</span></div>
                <div class="total-row"><span>ضريبة القيمة المضافة (15%):</span> <span>${(data.total - (data.total / 1.15)).toFixed(2)} ر.س</span></div>
                <div class="grand-total">${data.total} ر.س</div>
            </div>

            <div class="qr-area">
                <div id="zatca-qr"></div>
                <div id="order-qr"></div>
            </div>

            <div class="footer">
                <span>نظام الفاتورة الإلكترونية - منصة في خدمتك</span>
                <span>صفحة 1 من 3</span>
            </div>
        </div>
        `;

        // توليد الأكواد
        new QRCode(document.getElementById("zatca-qr"), { text: `Seller:${SOURCE_INFO.name}|VAT:${SOURCE_INFO.taxId}|Total:${data.total}`, width: 90, height: 90 });
        new QRCode(document.getElementById("order-qr"), { text: window.location.href, width: 90, height: 90 });
    }

    getFullOrderDetails().then(data => {
        if (data) renderInvoice(data);
        else document.getElementById('loader').innerHTML = "فشل في تحميل البيانات";
    });
</script>
</body>
</html>

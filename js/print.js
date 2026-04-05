import { db, getOrder, loadCustomersAndProducts, customersMap, productsMap } from './firebase.js';

// بيانات الفاتورة الافتراضية
let invoiceData = {
    invoiceNumber: "KF-2603290287",
    date: "29/03/2026",
    time: "03:21 صباحاً",
    status: "تم التنفيذ",
    taxNumber: "312495447600003",
    freelancerId: "FL-765735204",
    platformName: "منصة في خدمتك",
    sellerAddress: "المملكة العربية السعودية",
    sellerDetail: "حائل : حي النقرة : شارع :سعد المشاط",
    buildingInfo: "رقم المبنى: 3085 الرقم الإضافي: 7718 الرمز البريدي: 55431",
    customer: {
        name: "شركة التقنية المتقدمة",
        country: "المملكة العربية السعودية",
        city: "الرياض - حي النخيل",
        address: "شارع الأمير تركي، مبنى 102",
        phone: "+966 55 123 4567",
        email: "info@advanced-tech.com"
    },
    paymentMethod: "تحويل بنكي",
    deliveryMethod: "تسليم إلكتروني",
    approvalCode: "APP-8821XZ",
    items: [
        { id: 1, name: "استضافة سحابية احترافية", description: "استضافة عالية الأداء لمدة سنة", image: "https://picsum.photos/id/0/100/100", quantity: 2, unitPrice: 1250.00 },
        { id: 2, name: "تصميم واجهات API", description: "تطوير واجهات برمجية متكاملة", image: "https://picsum.photos/id/1/100/100", quantity: 1, unitPrice: 8750.00 },
        { id: 3, name: "شهادة SSL متقدمة", description: "حماية البيانات + EV", image: "https://picsum.photos/id/20/100/100", quantity: 3, unitPrice: 590.00 },
        { id: 4, name: "تطوير لوحة تحكم", description: "لوحة تحكم متكاملة React", image: "https://picsum.photos/id/26/100/100", quantity: 1, unitPrice: 5400.00 }
    ],
    discount: 5784.60,
    vatRate: 0.15
};

function computeTotals(items, discount, vatRate) {
    let subtotal = items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);
    let afterDiscount = subtotal - discount;
    let vat = afterDiscount * vatRate;
    let total = afterDiscount + vat;
    return { subtotal, afterDiscount, vat, total };
}

function generateZatcaQR(taxNumber, totalAmount, vatAmount, sellerName, timestamp = new Date().toISOString()) {
    // TLV format for ZATCA (simplified for demo)
    const tags = [
        { id: 1, value: sellerName.substring(0, 50) },
        { id: 2, value: taxNumber },
        { id: 3, value: timestamp },
        { id: 4, value: totalAmount.toFixed(2) },
        { id: 5, value: vatAmount.toFixed(2) }
    ];
    let tlvString = "";
    tags.forEach(tag => {
        tlvString += String.fromCharCode(tag.id) + String.fromCharCode(tag.value.length) + tag.value;
    });
    return tlvString;
}

function renderTermsAndConditions() {
    return `
        <h3 style="margin-bottom: 15px; color:#1f5068;">📋 الشروط والأحكام والتعليمات</h3>
        <div class="terms-page">
            <div>
                <h4>أولاً: صلاحية العرض والتنفيذ</h4>
                <p><strong>1. مدة صلاحية العرض</strong> - يكون هذا العرض صالحًا لمدة ثلاثة (3) أيام عمل فقط من تاريخ إصداره.</p>
                <p><strong>2. بدء التنفيذ</strong> - تبدأ أعمال التنفيذ بعد استلام الدفعة المقدمة المتفق عليها.</p>
                <p><strong>3. مدة التنفيذ</strong> - تُحتسب مدة التنفيذ من تاريخ اكتمال استلام جميع المتطلبات.</p>
                <p><strong>4. التأخير</strong> - لا يتحمل مقدم الخدمة أي مسؤولية عن أي تأخير ناتج عن ظروف خارجة عن إرادته.</p>
                <p><strong>5. الموافقات الخارجية</strong> - تخضع جميع الموافقات لسياسات الجهات الخارجية.</p>
                
                <h4>ثانياً: التكاليف والمسؤوليات المالية</h4>
                <p><strong>6. الرسوم الخارجية</strong> - لا تشمل هذه الفاتورة أي رسوم خاصة بالجهات الخارجية.</p>
                <p><strong>7. خدمات الطرف الثالث</strong> - تخضع لسياسات تلك الجهات.</p>
                <p><strong>8. المدفوعات الخارجية</strong> - جميع المبالغ المدفوعة لجهات خارجية غير قابلة للاسترجاع.</p>
                <p><strong>9. الدفع نيابة عن العميل</strong> - تُعد المبالغ المدفوعة نيابة عن العميل دينًا مستحقًا.</p>
                <p><strong>10. الضريبة</strong> - جميع الأسعار لا تشمل ضريبة القيمة المضافة.</p>
                
                <h4>ثالثاً: التسليم والملكية</h4>
                <p><strong>11. نطاق التسليم</strong> - يتم التنفيذ وفق النطاق المحدد في هذه الفاتورة فقط.</p>
                <p><strong>12. المنتج النهائي</strong> - يقتصر التسليم على المنتج النهائي الجاهز للاستخدام.</p>
                <p><strong>13. الكود المصدري</strong> - يبقى ملكًا حصريًا لمقدم الخدمة.</p>
                <p><strong>14. نقل الملكية</strong> - لا يتم نقل الملكية إلا بعد سداد كامل المقابل المالي.</p>
                <p><strong>15. عدم طلب التسليم</strong> - في حال عدم طلب العميل نقل الملكية لا يلتزم مقدم الخدمة بالتسليم.</p>
                <p><strong>16. حق إعادة الاستخدام</strong> - يحتفظ مقدم الخدمة بحقه في إعادة استخدام الأعمال المنفذة.</p>
            </div>
            <div>
                <h4>رابعاً: الدفعات والاسترجاع</h4>
                <p><strong>17. نظام الدفع</strong> - يتم السداد وفق الآلية المتفق عليها.</p>
                <p><strong>18. تأخر السداد</strong> - يحق لمقدم الخدمة إيقاف العمل فورًا.</p>
                <p><strong>19. عدم الاسترجاع</strong> - لا يحق للعميل استرجاع أي مبلغ بعد بدء التنفيذ.</p>
                <p><strong>20. إيقاف المشروع</strong> - يحق لمقدم الخدمة إيقاف المشروع عند مخالفة الشروط.</p>
                <p><strong>21. احتساب الأعمال</strong> - تحسب قيمة الأعمال المنفذة حسب نسبة الإنجاز.</p>
                <p><strong>22. الرسوم الإدارية</strong> - تضاف رسوم إدارية بنسبة 20%.</p>
                
                <h4>خامساً: الضمان</h4>
                <p><strong>23-25. الضمان</strong> - يقتصر الضمان على الأخطاء الفنية الناتجة عن مقدم الخدمة فقط.</p>
                
                <h4>سادساً: انتهاء العلاقة والمسؤولية</h4>
                <p><strong>26-30.</strong> تنتهي العلاقة بعد التسليم، والعميل يتحمل مسؤولية التشغيل والنسخ الاحتياطي.</p>
                
                <h4>سابعاً: التواصل والتنفيذ</h4>
                <p><strong>31-33.</strong> تعتمد وسائل التواصل الرسمية، والنسخ الإلكترونية معتمدة قانونيًا.</p>
                
                <h4>ثامناً: البنود القانونية</h4>
                <p><strong>34-38.</strong> العلاقة تعاقدية مستقلة، وهذا المستند يمثل كامل الاتفاق، واللغة العربية هي المعتمدة.</p>
                
                <h4>تاسعاً: النزاعات</h4>
                <p><strong>39-40.</strong> يتم حل النزاعات وديًا، وللمنصة تحديد الجهة المختصة.</p>
                
                <h4>عاشراً: البنود المتقدمة</h4>
                <p><strong>41-46.</strong> القوة القاهرة، السرية، التعديلات خارج النطاق، الاستلام الحكمي بعد 7 أيام.</p>
                
                <h4>حادي عشر: البنود المالية المتقدمة</h4>
                <p><strong>47-50.</strong> المدفوعات الخارجية، المدفوعات بالنيابة، حق رفض الخدمة.</p>
                
                <h4>ثاني عشر: الحماية القانونية</h4>
                <p><strong>51-57.</strong> التنازل عن المطالبات، حدود المسؤولية، الملكية الفكرية، استقلالية البنود، والشروط الإضافية تكون بملحق مستقل.</p>
            </div>
        </div>
    `;
}

function renderInvoicePages() {
    const { subtotal, afterDiscount, vat, total } = computeTotals(invoiceData.items, invoiceData.discount, invoiceData.vatRate);
    const qrString = generateZatcaQR(invoiceData.taxNumber, total, vat, invoiceData.platformName);
    
    let itemsHtml = '';
    invoiceData.items.forEach((item, idx) => {
        itemsHtml += `
            <tr class="product-table-row">
                <td style="text-align: center;">${idx + 1}</td>
                <td>${item.name}</td>
                <td>${item.description}</td>
                <td style="text-align: center;"><img class="product-img" src="${item.image}" alt="product" onerror="this.src='https://placehold.co/60x60?text=Image'"></td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: left;">${item.unitPrice.toFixed(2)} ريال</td>
            </tr>
        `;
    });

    // الصفحة الأولى: الفاتورة
    const page1 = `
        <div class="invoice-page" id="page1">
            <div class="header-flex">
                <div class="logo-area">
                    <img src="images/logo.svg" alt="شعار المنصة" onerror="this.src='https://placehold.co/120x60?text=fi-khidmatik'">
                </div>
                <div class="invoice-title-area">
                    <h2>فاتورة إلكترونية</h2>
                </div>
                <div class="legal-numbers">
                    <div>رقم شهادة العمل الحر: ${invoiceData.freelancerId}</div>
                    <div>الرقم الضريبي: ${invoiceData.taxNumber}</div>
                </div>
            </div>

            <div class="info-row">
                <div class="info-block"><strong>رقم الفاتورة:</strong> ${invoiceData.invoiceNumber}</div>
                <div class="info-block"><strong>التاريخ:</strong> ${invoiceData.date} - ${invoiceData.time}</div>
                <div class="info-block"><strong>حالة الطلب:</strong> ${invoiceData.status}</div>
            </div>

            <div class="two-columns">
                <div class="column">
                    <strong>مصدرة من</strong>
                    <div>${invoiceData.platformName}</div>
                    <div>${invoiceData.sellerAddress}</div>
                    <div>${invoiceData.sellerDetail}</div>
                    <div>${invoiceData.buildingInfo}</div>
                </div>
                <div class="column">
                    <strong>مصدرة إلى</strong>
                    <div>اسم العميل: ${invoiceData.customer.name}</div>
                    <div>الدولة: ${invoiceData.customer.country}</div>
                    <div>المدينة: ${invoiceData.customer.city}</div>
                    <div>العنوان: ${invoiceData.customer.address}</div>
                    <div>رقم الجوال: ${invoiceData.customer.phone}</div>
                    <div>البريد الإلكتروني: ${invoiceData.customer.email}</div>
                </div>
            </div>

            <div class="payment-method">
                <div><strong>طريقة الدفع:</strong> ${invoiceData.paymentMethod}</div>
                <div><strong>طريقة استلام المنتج:</strong> ${invoiceData.deliveryMethod}</div>
                <div><strong>رمز الموافقة على الطلب:</strong> ${invoiceData.approvalCode}</div>
            </div>

            <table class="products-table">
                <thead>
                    <tr>
                        <th>#</th><th>اسم المنتج</th><th>وصف المنتج</th><th>صورة المنتج</th><th>الكمية</th><th>السعر الوحدة</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>

            <div class="totals-box">
                <div class="totals-row"><span>المجموع الفرعي:</span><span>${subtotal.toFixed(2)} ريال</span></div>
                <div class="totals-row"><span>إجمالي الخصم:</span><span>- ${invoiceData.discount.toFixed(2)} ريال</span></div>
                <div class="totals-row"><span>ضريبة القيمة المضافة (15%):</span><span>${vat.toFixed(2)} ريال</span></div>
                <div class="totals-row grand-total"><span>الإجمالي النهائي شامل الضريبة:</span><span>${total.toFixed(2)} ريال</span></div>
            </div>

            <div class="footer-barcode">
                <div class="instruction-text">
                    <div>تخضع هذه الفاتورة لكامل الشروط والأحكام المرفقة</div>
                    <div>شكراً لتسوقكم معنا</div>
                </div>
                <div class="qr-container" id="qrCode_${Date.now()}"></div>
            </div>

            <div class="contact-footer">
                <span>📞 الهاتف: 966534051317</span>
                <span>📱 الواتس اب: 966545312021</span>
                <span>✉️ info@fi-khidmatik.com</span>
                <span>🌐 www.khidmatik.com</span>
            </div>
            <div class="instruction-text" style="text-align: center; margin-top: 10px;">هذه الفاتورة إلكترونية - نسخة معتمدة قانونياً</div>
            <div class="page-number">صفحة 1 من 3</div>
        </div>
    `;

    // الصفحة الثانية: الشروط والأحكام
    const page2 = `
        <div class="invoice-page" id="page2">
            ${renderTermsAndConditions()}
            <div class="page-number">صفحة 2 من 3</div>
        </div>
    `;

    // الصفحة الثالثة: الإقرار والتذييل
    const page3 = `
        <div class="invoice-page" id="page3">
            <h3 style="margin-bottom: 20px; color:#1f5068;">✅ الإقرار والتوقيع</h3>
            <div class="acknowledgment">
                <p style="font-size: 13px;"><strong>أقر أنا العميل بالاطلاع على جميع الشروط والأحكام أعلاه وأوافق عليها بالكامل وأتعهد بالالتزام بها دون أي استثناء.</strong></p>
            </div>
            <div class="signature-line">
                <div><strong>الاسم:</strong> ${invoiceData.customer.name}</div>
                <div><strong>التاريخ:</strong> ${invoiceData.date}</div>
            </div>
            <div style="margin-top: 30px;"><strong>التوقيع:</strong> _________________________________</div>
            
            <div class="contact-footer" style="margin-top: 50px;">
                <span>📞 الهاتف: 966534051317</span>
                <span>📱 الواتس اب: 966545312021</span>
                <span>✉️ info@fi-khidmatik.com</span>
                <span>🌐 www.khidmatik.com</span>
            </div>
            <div class="page-number">صفحة 3 من 3</div>
        </div>
    `;

    return { page1, page2, page3 };
}

function renderAndAttachQR() {
    const { total, vat } = computeTotals(invoiceData.items, invoiceData.discount, invoiceData.vatRate);
    const qrString = generateZatcaQR(invoiceData.taxNumber, total, vat, invoiceData.platformName);
    const qrContainer = document.querySelector('.qr-container');
    if (qrContainer && typeof QRCode !== 'undefined') {
        qrContainer.innerHTML = '';
        new QRCode(qrContainer, {
            text: qrString,
            width: 80,
            height: 80
        });
    }
}

async function loadInvoiceData(orderId) {
    if (orderId) {
        const order = await getOrder(orderId);
        if (order) {
            // تحديث بيانات الفاتورة من الطلب
            invoiceData.invoiceNumber = order.invoiceNumber || invoiceData.invoiceNumber;
            invoiceData.customer = order.customer || invoiceData.customer;
            invoiceData.items = order.items || invoiceData.items;
            invoiceData.discount = order.discount || invoiceData.discount;
        }
    }
    const pages = renderInvoicePages();
    document.getElementById('invoiceContainer').innerHTML = pages.page1 + pages.page2 + pages.page3;
    setTimeout(() => renderAndAttachQR(), 100);
}

// دوال التصدير
async function exportToPDF() {
    const element = document.getElementById('invoiceContainer');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pages = document.querySelectorAll('.invoice-page');
    
    for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i], { scale: 3, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    }
    pdf.save(`فاتورة_${invoiceData.invoiceNumber}.pdf`);
}

async function exportToPNG() {
    const pages = document.querySelectorAll('.invoice-page');
    for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i], { scale: 3, useCORS: true });
        const link = document.createElement('a');
        link.download = `فاتورة_${invoiceData.invoiceNumber}_صفحة${i+1}.png`;
        link.href = canvas.toDataURL();
        link.click();
    }
}

async function exportToZIP() {
    const zip = new JSZip();
    const pages = document.querySelectorAll('.invoice-page');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i], { scale: 3, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        
        const pngBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        zip.file(`فاتورة_${invoiceData.invoiceNumber}_صفحة${i+1}.png`, pngBlob);
    }
    const pdfBlob = pdf.output('blob');
    zip.file(`فاتورة_${invoiceData.invoiceNumber}.pdf`, pdfBlob);
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = `فاتورة_${invoiceData.invoiceNumber}.zip`;
    link.click();
}

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', async () => {
    await loadCustomersAndProducts();
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    await loadInvoiceData(orderId);
    
    document.getElementById('printBtn').addEventListener('click', () => window.print());
    document.getElementById('pdfBtn').addEventListener('click', exportToPDF);
    document.getElementById('pngBtn').addEventListener('click', exportToPNG);
    document.getElementById('zipBtn').addEventListener('click', exportToZIP);
});

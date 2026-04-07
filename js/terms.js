// ========================================
// صفحات الشروط والأحكام
// ========================================

function buildTermsPage1(pageNum, totalPages) {
    return '<div class="page">' +
        window.buildHeader("الشروط والأحكام") +
        '<div class="terms-container">' +
            '<div class="terms-title">الشروط والأحكام والتعليمات</div>' +
            '<div class="legal-notice">' +
                '<strong>إقرار ملزم قانونياً:</strong> يُعد هذا المستند (عرض سعر / فاتورة) اتفاقًا ملزمًا قانونيًا بين الطرفين، ' +
                'ويعتبر اعتماد العميل أو سداد أي دفعة أو بدء التنفيذ إقرارًا صريحًا ونهائيًا ' +
                'بالموافقة على جميع ما ورد فيه من شروط وأحكام دون أي تحفظ.' +
            '</div>' +
            '<div class="terms-grid">' +
                '<div>' +
                    '<div class="terms-card"><h4>أولاً: صلاحية العرض والتنفيذ</h4>' +
                        '<p><strong>1.</strong> مدة صلاحية العرض: يكون هذا العرض صالحًا لمدة ثلاثة (3) أيام عمل فقط.</p>' +
                        '<p><strong>2.</strong> بدء التنفيذ: تبدأ الأعمال بعد استلام الدفعة المقدمة.</p>' +
                        '<p><strong>3.</strong> مدة التنفيذ: تُحتسب من تاريخ اكتمال المتطلبات.</p>' +
                        '<p><strong>4.</strong> التأخير: لا مسؤولية على مقدم الخدمة.</p>' +
                        '<p><strong>5.</strong> الموافقات الخارجية: تخضع لسياسات الجهات المختصة.</p>' +
                    '</div>' +
                    '<div class="terms-card"><h4>ثالثاً: التسليم والملكية</h4>' +
                        '<p><strong>11.</strong> نطاق التسليم: حسب النطاق المحدد.</p>' +
                        '<p><strong>12.</strong> المنتج النهائي: يقتصر على المنتج الجاهز.</p>' +
                        '<p><strong>13.</strong> الكود المصدري: ملك حصري لمقدم الخدمة.</p>' +
                        '<p><strong>14.</strong> نقل الملكية: باتفاق مكتوب وسداد كامل.</p>' +
                        '<p><strong>15.</strong> عدم طلب التسليم: لا يلتزم مقدم الخدمة.</p>' +
                        '<p><strong>16.</strong> حق إعادة الاستخدام: محفوظ لمقدم الخدمة.</p>' +
                    '</div>' +
                '</div>' +
                '<div>' +
                    '<div class="terms-card"><h4>ثانياً: التكاليف والمسؤوليات المالية</h4>' +
                        '<p><strong>6.</strong> الرسوم الخارجية: لا تشمل رسوم الجهات الخارجية.</p>' +
                        '<p><strong>7.</strong> خدمات الطرف الثالث: تخضع لسياساتها.</p>' +
                        '<p><strong>8.</strong> المدفوعات الخارجية: غير قابلة للاسترجاع.</p>' +
                        '<p><strong>9.</strong> الدفع نيابة عن العميل: يُعد ديناً مستحقاً.</p>' +
                        '<p><strong>10.</strong> الضريبة: لا تشمل ضريبة القيمة المضافة.</p>' +
                    '</div>' +
                    '<div class="terms-card"><h4>رابعاً: الدفعات والاسترجاع</h4>' +
                        '<p><strong>17.</strong> نظام الدفع: حسب الآلية المتفق عليها.</p>' +
                        '<p><strong>18.</strong> تأخر السداد: يحق إيقاف العمل فوراً.</p>' +
                        '<p><strong>19.</strong> عدم الاسترجاع: لا يحق استرجاع أي مبلغ بعد البدء.</p>' +
                        '<p><strong>20.</strong> إيقاف المشروع: في حال مخالفة الشروط.</p>' +
                        '<p><strong>21.</strong> احتساب الأعمال: حسب نسبة الإنجاز.</p>' +
                        '<p><strong>22.</strong> الرسوم الإدارية: تضاف بنسبة 20%.</p>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
        window.buildFooter(pageNum, totalPages) +
    '</div>';
}

function buildTermsPage2(pageNum, totalPages) {
    return '<div class="page">' +
        window.buildHeader("الشروط والأحكام") +
        '<div class="terms-container">' +
            '<div class="terms-grid">' +
                '<div>' +
                    '<div class="terms-card"><h4>خامساً: الضمان</h4>' +
                        '<p><strong>23.</strong> الضمان: حسب الخطة التشغيلية.</p>' +
                        '<p><strong>24.</strong> نطاق الضمان: يقتصر على الأخطاء الفنية.</p>' +
                        '<p><strong>25.</strong> الاستثناءات: لا يشمل سوء الاستخدام.</p>' +
                    '</div>' +
                    '<div class="terms-card"><h4>سادساً: انتهاء العلاقة والمسؤولية</h4>' +
                        '<p><strong>26.</strong> انتهاء العلاقة: بعد تسليم المشروع.</p>' +
                        '<p><strong>27.</strong> المسؤولية بعد التسليم: لا توجد.</p>' +
                        '<p><strong>28.</strong> التشغيل: مسؤولية العميل.</p>' +
                        '<p><strong>29.</strong> البيانات: مسؤولية العميل.</p>' +
                        '<p><strong>30.</strong> براءة الذمة: من خدمات الأطراف الثالثة.</p>' +
                    '</div>' +
                    '<div class="terms-card"><h4>سابعاً: التواصل والتنفيذ</h4>' +
                        '<p><strong>31.</strong> وسائل التواصل: المعتمدة فقط.</p>' +
                        '<p><strong>32.</strong> التفويض: يلزم إشعار رسمي.</p>' +
                        '<p><strong>33.</strong> النسخ الإلكترونية: معتمدة قانونياً.</p>' +
                    '</div>' +
                    '<div class="terms-card"><h4>تاسعاً: النزاعات</h4>' +
                        '<p><strong>39.</strong> حل النزاعات: وديًا أولاً.</p>' +
                        '<p><strong>40.</strong> الجهة المختصة: القوانين السعودية.</p>' +
                    '</div>' +
                '</div>' +
                '<div>' +
                    '<div class="terms-card"><h4>ثامناً: البنود القانونية</h4>' +
                        '<p><strong>34.</strong> طبيعة العلاقة: تعاقدية مستقلة.</p>' +
                        '<p><strong>35.</strong> كامل الاتفاق: يلغي أي اتفاقات سابقة.</p>' +
                        '<p><strong>36.</strong> الأخطاء غير المقصودة: لا تؤثر على صحة البنود.</p>' +
                        '<p><strong>37.</strong> عدم التنازل: لا يُعد تنازلاً.</p>' +
                        '<p><strong>38.</strong> اللغة المعتمدة: العربية.</p>' +
                    '</div>' +
                    '<div class="terms-card"><h4>عاشراً: البنود المتقدمة</h4>' +
                        '<p><strong>41.</strong> القوة القاهرة: لا مسؤولية.</p>' +
                        '<p><strong>42.</strong> السرية: يلتزم الطرفان.</p>' +
                        '<p><strong>43.</strong> التعديلات خارج النطاق: بعرض مستقل.</p>' +
                        '<p><strong>44.</strong> التوقف المؤقت: يحق لمقدم الخدمة.</p>' +
                        '<p><strong>45.</strong> الاستلام الحكمي: بعد 7 أيام.</p>' +
                        '<p><strong>46.</strong> الاعتراض: خلال 7 أيام.</p>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
        window.buildFooter(pageNum, totalPages) +
    '</div>';
}

function buildTermsPage3(order, pageNum, totalPages) {
    var dateStr = (order.orderDate ? formatDate(order.orderDate) : '') + ' - ' + (order.orderTime ? formatTime(order.orderTime) : '');
    
    return '<div class="page">' +
        window.buildHeader("الشروط والأحكام") +
        '<div class="terms-container">' +
            '<div class="terms-grid">' +
                '<div>' +
                    '<div class="terms-card"><h4>حادي عشر: البنود المالية والقانونية المتقدمة</h4>' +
                        '<p><strong>47.</strong> المدفوعات الخارجية: غير قابلة للمطالبة.</p>' +
                        '<p><strong>48.</strong> المدفوعات بالنيابة: يلتزم العميل بسدادها.</p>' +
                        '<p><strong>49.</strong> تفسير البنود: بما يحقق الغرض.</p>' +
                        '<p><strong>50.</strong> حق رفض الخدمة: محفوظ لمقدم الخدمة.</p>' +
                    '</div>' +
                '</div>' +
                '<div>' +
                    '<div class="terms-card"><h4>ثاني عشر: الحماية القانونية</h4>' +
                        '<p><strong>51.</strong> التنازل عن المطالبات: بما يتجاوز قيمة الفاتورة.</p>' +
                        '<p><strong>52.</strong> حدود المسؤولية: إجمالي المبلغ المدفوع.</p>' +
                        '<p><strong>53.</strong> الاستخدام غير المشروع: مسؤولية العميل.</p>' +
                        '<p><strong>54.</strong> الملكية الفكرية: محفوظة لمقدم الخدمة.</p>' +
                        '<p><strong>55.</strong> تحديث الشروط: يحق لمقدم الخدمة.</p>' +
                        '<p><strong>56.</strong> استقلالية البنود: كل بند مستقل.</p>' +
                        '<p><strong>57.</strong> الشروط الإضافية: توثق في ملحق مستقل.</p>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="declaration">' +
                '<p><strong>إقرار وتعهد</strong></p>' +
                '<p>أقر أنا العميل <strong>' + escapeHtml(order.customerName) + '</strong></p>' +
                '<p>بأنني اطلعت على جميع الشروط والأحكام الواردة في هذا المستند<br>وأوافق عليها بالكامل وأتعهد بالالتزام بها.</p>' +
            '</div>' +
            '<div class="signature-area">' +
                '<div><strong>العميل:</strong> ' + escapeHtml(order.customerName) + '</div>' +
                '<div><strong>التاريخ:</strong> ' + dateStr + '</div>' +
            '</div>' +
            '<div style="margin-top:20px;"><strong>التوقيع:</strong> _________________</div>' +
        '</div>' +
        window.buildFooter(pageNum, totalPages) +
    '</div>';
}

// تصدير الدوال للاستخدام العام
window.buildTermsPage1 = buildTermsPage1;
window.buildTermsPage2 = buildTermsPage2;
window.buildTermsPage3 = buildTermsPage3;

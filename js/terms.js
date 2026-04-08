// ========================================
// صفحات الشروط والأحكام - النسخة الكاملة
// جميع الأنماط مضمنة (inline styles)
// ========================================

function buildTermsPage1(pageNum, totalPages) {
    return '<div class="page">' +
        window.buildHeader("الشروط والأحكام") +
        '<div class="terms-container" style="display: block; direction: rtl; font-family: \'Segoe UI\', \'Cairo\', sans-serif;">' +
            
            '<div style="font-size: 18px; font-weight: bold; color: #1e3a5f; text-align: center; margin: 10px 0 15px; border-bottom: 2px solid #1e3a5f; padding-bottom: 8px;">الشروط والأحكام والتعليمات</div>' +
            
            '<div style="background-color: #fef3c7; border-right: 4px solid #f59e0b; padding: 15px; margin-bottom: 25px; border-radius: 8px;">' +
                '<strong style="color: #92400e; font-size: 14px;">إقرار مسؤولية البيانات والمعلومات:</strong><br>' +
                '<span style="color: #78350f; font-size: 11px; line-height: 1.6;">يقر العميل ويوافق على أن جميع المعلومات والبيانات والمستندات التي قام بتزويد مقدم الخدمة بها أو تم إدراجها في هذا المستند صحيحة ودقيقة ومكتملة، ويتحمل وحده كامل المسؤولية عنها، كما يتحمل كافة الآثار القانونية والمالية والفنية المترتبة على أي خطأ أو نقص أو عدم دقة فيها، ويلتزم بتعويض مقدم الخدمة تعويضًا كاملاً عن أي أضرار أو خسائر أو مطالبات تنشأ نتيجة لذلك، دون أدنى مسؤولية على مقدم الخدمة.</span><br><br>' +
                '<span style="color: #78350f; font-size: 11px; line-height: 1.6;">يُعد هذا المستند (عرض سعر / فاتورة) اتفاقًا ملزمًا قانونيًا بين الطرفين، ويُعتبر اعتماد العميل أو سداد أي دفعة أو بدء التنفيذ إقرارًا صريحًا ونهائيًا بالموافقة على جميع ما ورد فيه من شروط وأحكام دون أي تحفظ، كما يتحمل العميل مسؤولية عدم الاطلاع أو عدم الفهم لأي من البنود.</span>' +
            '</div>' +
            
            <!-- القسم الأول: صلاحية العرض والتنفيذ -->
            '<div style="margin-bottom: 25px; page-break-inside: avoid;">' +
                '<div style="background: linear-gradient(135deg, #1e3a5f 0%, #2c4c7a 100%); color: white; padding: 10px 18px; border-radius: 10px; margin-bottom: 12px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">' +
                    '<span style="font-size: 22px; background: rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 8px;">📋</span>' +
                    '<h4 style="margin: 0; color: white; font-size: 16px; font-weight: 600;">أولاً: صلاحية العرض والتنفيذ</h4>' +
                '</div>' +
                '<div style="padding-right: 8px;">' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">1. مدة صلاحية العرض:</strong> يكون هذا عرض السعر / الفاتورة صالحًا لمدة ثلاثة (3) أيام عمل فقط من تاريخ إصداره، ويُعد لاغيًا تلقائيًا بعد انتهاء هذه المدة دون الحاجة إلى إشعار مسبق، ولا يترتب على مقدم الخدمة أي التزام بعد ذلك.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">2. بدء التنفيذ:</strong> تبدأ أعمال التنفيذ بعد استلام الدفعة المقدمة المتفق عليها، واستلام جميع المتطلبات والمعلومات اللازمة من العميل بشكل كامل وواضح.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">3. مدة التنفيذ:</strong> تُحتسب مدة التنفيذ من تاريخ اكتمال استلام جميع المتطلبات، ولا يُعتد بأي مدة يترتب عليها تأخير بسبب العميل أو أي طرف خارجي.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">4. التأخير:</strong> لا يتحمل مقدم الخدمة أي مسؤولية عن أي تأخير ناتج عن ظروف خارجة عن إرادته، أو عن أطراف ثالثة، أو عن تأخر العميل في تزويد المتطلبات.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">5. الموافقات الخارجية:</strong> تخضع جميع الموافقات أو التراخيص الصادرة من الجهات الحكومية أو الجهات الخارجية لسياسات تلك الجهات، ولا يضمن مقدم الخدمة الحصول عليها بأي حال من الأحوال.</p>' +
                '</div>' +
            '</div>' +

            <!-- القسم الثاني: التكاليف والمسؤوليات المالية -->
            '<div style="margin-bottom: 25px; page-break-inside: avoid;">' +
                '<div style="background: linear-gradient(135deg, #14532d 0%, #166534 100%); color: white; padding: 10px 18px; border-radius: 10px; margin-bottom: 12px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">' +
                    '<span style="font-size: 22px; background: rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 8px;">💰</span>' +
                    '<h4 style="margin: 0; color: white; font-size: 16px; font-weight: 600;">ثانياً: التكاليف والمسؤوليات المالية</h4>' +
                '</div>' +
                '<div style="padding-right: 8px;">' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">6. الرسوم الخارجية:</strong> لا تشمل قيمة هذا عرض السعر / الفاتورة أي رسوم أو تكاليف خاصة بالجهات الخارجية مثل السيرفرات أو النطاقات أو التراخيص أو الرسوم الحكومية أو بوابات الدفع أو أي مزود خدمة طرف ثالث، ما لم يتم النص على خلاف ذلك بشكل صريح.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">7. خدمات الطرف الثالث:</strong> أي خدمات يتم تقديمها من خلال أطراف ثالثة تخضع لسياسات تلك الجهات، ولا يتحمل مقدم الخدمة أي مسؤولية عن أدائها أو جودتها أو توقفها أو تعديل سياساتها.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">8. المدفوعات الخارجية:</strong> جميع المبالغ التي يتم دفعها إلى جهات خارجية سواء بشكل مباشر من قبل العميل أو من خلال مقدم الخدمة لا يمكن استرجاعها تحت أي ظرف.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">9. الدفع نيابة عن العميل:</strong> في حال قيام مقدم الخدمة بسداد أي مبالغ نيابة عن العميل فإن تلك المبالغ تُعد دينًا مستحقًا على العميل ويلتزم بسدادها عند الطلب ولا تدخل ضمن أي تسوية أو استرجاع.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">10. الضريبة:</strong> جميع الأسعار المذكورة لا تشمل ضريبة القيمة المضافة ويتم إضافتها وفق الأنظمة المعمول بها.</p>' +
                '</div>' +
            '</div>' +

            <!-- القسم الثالث: التسليم والملكية -->
            '<div style="margin-bottom: 25px; page-break-inside: avoid;">' +
                '<div style="background: linear-gradient(135deg, #4c1d95 0%, #5b21b6 100%); color: white; padding: 10px 18px; border-radius: 10px; margin-bottom: 12px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">' +
                    '<span style="font-size: 22px; background: rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 8px;">📦</span>' +
                    '<h4 style="margin: 0; color: white; font-size: 16px; font-weight: 600;">ثالثاً: التسليم والملكية</h4>' +
                '</div>' +
                '<div style="padding-right: 8px;">' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">11. نطاق التسليم:</strong> يتم تنفيذ وتسليم الأعمال وفق النطاق المحدد في هذا عرض السعر / الفاتورة فقط ولا يشمل أي أعمال إضافية غير مذكورة.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">12. المنتج النهائي:</strong> يقتصر التسليم على المنتج النهائي الجاهز للاستخدام ولا يشمل الملفات المفتوحة أو الكود المصدري أو أي مواد إنتاج داخلية.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">13. الكود المصدري:</strong> يبقى الكود المصدري ملكًا حصريًا لمقدم الخدمة ولا يتم تسليمه إلا بموجب اتفاق مستقل ومقابل مالي يتم تحديده بشكل منفصل.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">14. نقل الملكية:</strong> لا يتم نقل ملكية أي من الأعمال أو المواد أو المخرجات إلا بعد اتفاق مكتوب وصريح وسداد كامل المقابل المالي الخاص بنقل الملكية.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">15. عدم طلب التسليم:</strong> في حال عدم طلب العميل نقل الملكية أو تسليم المخرجات وفق ما سبق لا يلتزم مقدم الخدمة بتسليم أي أعمال أو ملفات.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">16. حق إعادة الاستخدام:</strong> يحتفظ مقدم الخدمة بحقه الكامل في إعادة استخدام أو تطوير أو الاستفادة من الأعمال المنفذة بأي شكل من الأشكال ما لم يتم الاتفاق على خلاف ذلك كتابةً.</p>' +
                '</div>' +
            '</div>' +

            <!-- القسم الرابع: الدفعات والاسترجاع -->
            '<div style="margin-bottom: 25px; page-break-inside: avoid;">' +
                '<div style="background: linear-gradient(135deg, #b45309 0%, #c2410c 100%); color: white; padding: 10px 18px; border-radius: 10px; margin-bottom: 12px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">' +
                    '<span style="font-size: 22px; background: rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 8px;">💳</span>' +
                    '<h4 style="margin: 0; color: white; font-size: 16px; font-weight: 600;">رابعاً: الدفعات والاسترجاع</h4>' +
                '</div>' +
                '<div style="padding-right: 8px;">' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">17. نظام الدفع:</strong> يتم سداد قيمة هذا عرض السعر / الفاتورة وفق الآلية المتفق عليها بين الطرفين سواء دفعة واحدة أو على دفعات.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">18. تأخر السداد:</strong> يحق لمقدم الخدمة إيقاف العمل بشكل فوري في حال تأخر العميل عن سداد أي دفعة مستحقة.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">19. عدم الاسترجاع:</strong> لا يحق للعميل المطالبة باسترجاع أي مبلغ مالي بعد بدء التنفيذ أو في حال الانسحاب أو عدم استكمال المشروع لأي سبب كان.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">20. إيقاف المشروع من مقدم الخدمة:</strong> يحق لمقدم الخدمة إيقاف المشروع في حال مخالفة العميل لأي من الشروط أو عدم التزامه بالمتطلبات أو السداد.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">21. احتساب الأعمال:</strong> يتم احتساب قيمة الأعمال المنفذة بناءً على نسبة الإنجاز الفعلية حتى تاريخ الإيقاف.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">22. الرسوم الإدارية:</strong> تُضاف رسوم تشغيلية وإدارية بنسبة 20% على قيمة الأعمال المنفذة.</p>' +
                '</div>' +
            '</div>' +
        '</div>' +
        window.buildFooter(pageNum, totalPages) +
    '</div>';
}

function buildTermsPage2(pageNum, totalPages) {
    return '<div class="page">' +
        window.buildHeader("الشروط والأحكام") +
        '<div class="terms-container" style="display: block; direction: rtl; font-family: \'Segoe UI\', \'Cairo\', sans-serif;">' +

            <!-- القسم الخامس: الضمان -->
            '<div style="margin-bottom: 25px; page-break-inside: avoid;">' +
                '<div style="background: linear-gradient(135deg, #065f46 0%, #047857 100%); color: white; padding: 10px 18px; border-radius: 10px; margin-bottom: 12px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">' +
                    '<span style="font-size: 22px; background: rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 8px;">🛡️</span>' +
                    '<h4 style="margin: 0; color: white; font-size: 16px; font-weight: 600;">خامساً: الضمان</h4>' +
                '</div>' +
                '<div style="padding-right: 8px;">' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">23. الضمان:</strong> يتم تحديد الضمان إن وجد وفق الخطة التشغيلية للمشروع وطبيعته.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">24. نطاق الضمان:</strong> يقتصر الضمان على الأخطاء الفنية الناتجة عن مقدم الخدمة فقط.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">25. الاستثناءات:</strong> لا يشمل الضمان أي مشاكل ناتجة عن عوامل خارجية أو سوء استخدام أو تعديلات من طرف العميل أو طرف ثالث.</p>' +
                '</div>' +
            '</div>' +

            <!-- القسم السادس: انتهاء العلاقة والمسؤولية -->
            '<div style="margin-bottom: 25px; page-break-inside: avoid;">' +
                '<div style="background: linear-gradient(135deg, #7c2d12 0%, #9a3412 100%); color: white; padding: 10px 18px; border-radius: 10px; margin-bottom: 12px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">' +
                    '<span style="font-size: 22px; background: rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 8px;">🔚</span>' +
                    '<h4 style="margin: 0; color: white; font-size: 16px; font-weight: 600;">سادساً: انتهاء العلاقة والمسؤولية</h4>' +
                '</div>' +
                '<div style="padding-right: 8px;">' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">26. انتهاء العلاقة:</strong> تنتهي العلاقة التعاقدية بين الطرفين فور تسليم المشروع وفق النطاق المتفق عليه.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">27. المسؤولية بعد التسليم:</strong> لا يتحمل مقدم الخدمة أي مسؤولية لاحقة عن المشروع بعد التسليم.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">28. التشغيل:</strong> يتحمل العميل المسؤولية الكاملة عن تشغيل المشروع وإدارته.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">29. البيانات:</strong> يتحمل العميل مسؤولية حفظ النسخ الاحتياطية للبيانات.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">30. براءة الذمة:</strong> لا يتحمل مقدم الخدمة أي مسؤولية عن أي خدمات مقدمة من أطراف ثالثة أو توقفها.</p>' +
                '</div>' +
            '</div>' +

            <!-- القسم السابع: التواصل والتنفيذ -->
            '<div style="margin-bottom: 25px; page-break-inside: avoid;">' +
                '<div style="background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); color: white; padding: 10px 18px; border-radius: 10px; margin-bottom: 12px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">' +
                    '<span style="font-size: 22px; background: rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 8px;">📞</span>' +
                    '<h4 style="margin: 0; color: white; font-size: 16px; font-weight: 600;">سابعاً: التواصل والتنفيذ</h4>' +
                '</div>' +
                '<div style="padding-right: 8px;">' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">31. وسائل التواصل:</strong> تُعتمد وسائل التواصل الرسمية المسجلة فقط كقنوات معتمدة بين الطرفين.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">32. التفويض:</strong> يلتزم العميل بإشعار مقدم الخدمة رسميًا في حال تفويض أي شخص للتواصل نيابة عنه.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">33. النسخ الإلكترونية:</strong> تُعتبر جميع النسخ الإلكترونية من هذا عرض السعر / الفاتورة بما في ذلك المرسلة عبر البريد الإلكتروني أو وسائل التواصل نسخًا معتمدة ولها نفس القوة القانونية.</p>' +
                '</div>' +
            '</div>' +

            <!-- القسم الثامن: البنود القانونية -->
            '<div style="margin-bottom: 25px; page-break-inside: avoid;">' +
                '<div style="background: linear-gradient(135deg, #831843 0%, #9d174d 100%); color: white; padding: 10px 18px; border-radius: 10px; margin-bottom: 12px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">' +
                    '<span style="font-size: 22px; background: rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 8px;">⚖️</span>' +
                    '<h4 style="margin: 0; color: white; font-size: 16px; font-weight: 600;">ثامناً: البنود القانونية</h4>' +
                '</div>' +
                '<div style="padding-right: 8px;">' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">34. طبيعة العلاقة:</strong> تُعد العلاقة بين الطرفين علاقة تعاقدية مستقلة ولا تُنشئ أي شراكة أو وكالة أو تمثيل قانوني.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">35. كامل الاتفاق:</strong> يمثل هذا المستند كامل الاتفاق بين الطرفين ويلغي أي اتفاقات أو تفاهمات سابقة سواء كانت شفهية أو مكتوبة.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">36. الأخطاء غير المقصودة:</strong> في حال وجود أي خطأ غير مقصود في الصياغة فإنه لا يؤثر على صحة باقي البنود وتبقى سارية وملزمة.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">37. عدم التنازل:</strong> عدم استخدام مقدم الخدمة لأي من حقوقه لا يُعد تنازلًا عنها ويحتفظ بحقه في استخدامها في أي وقت لاحق.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">38. اللغة المعتمدة:</strong> في حال ترجمة هذا المستند إلى أي لغة أخرى تُعتمد النسخة العربية في التفسير.</p>' +
                '</div>' +
            '</div>' +

            <!-- القسم التاسع: النزاعات -->
            '<div style="margin-bottom: 25px; page-break-inside: avoid;">' +
                '<div style="background: linear-gradient(135deg, #374151 0%, #4b5563 100%); color: white; padding: 10px 18px; border-radius: 10px; margin-bottom: 12px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">' +
                    '<span style="font-size: 22px; background: rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 8px;">🏛️</span>' +
                    '<h4 style="margin: 0; color: white; font-size: 16px; font-weight: 600;">تاسعاً: النزاعات</h4>' +
                '</div>' +
                '<div style="padding-right: 8px;">' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">39. حل النزاعات:</strong> يتم السعي لحل أي نزاع ينشأ بين الطرفين بشكل ودي خلال مدة مناسبة من تاريخ الإشعار.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">40. الجهة المختصة:</strong> في حال عدم التوصل إلى حل يحق لمقدم الخدمة تحديد الجهة القضائية أو التحكيمية المختصة.</p>' +
                '</div>' +
            '</div>' +

            <!-- القسم العاشر: البنود المتقدمة -->
            '<div style="margin-bottom: 25px; page-break-inside: avoid;">' +
                '<div style="background: linear-gradient(135deg, #0e7490 0%, #0891b2 100%); color: white; padding: 10px 18px; border-radius: 10px; margin-bottom: 12px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">' +
                    '<span style="font-size: 22px; background: rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 8px;">🌪️</span>' +
                    '<h4 style="margin: 0; color: white; font-size: 16px; font-weight: 600;">عاشراً: البنود المتقدمة</h4>' +
                '</div>' +
                '<div style="padding-right: 8px;">' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">41. القوة القاهرة:</strong> لا يتحمل مقدم الخدمة أي مسؤولية عن التأخير أو عدم التنفيذ الناتج عن ظروف خارجة عن الإرادة.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">42. السرية:</strong> يلتزم الطرفان بالمحافظة على سرية المعلومات وعدم الإفصاح عنها لأي طرف ثالث دون موافقة خطية.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">43. التعديلات خارج النطاق:</strong> أي طلبات أو تعديلات خارج نطاق هذا المستند يتم تنفيذها بموجب عرض وسعر مستقل.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">44. التوقف المؤقت:</strong> يحق لمقدم الخدمة إيقاف المشروع مؤقتًا في حال عدم تجاوب العميل أو عدم توفير المتطلبات.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">45. الاستلام الحكمي:</strong> يُعد المشروع مستلمًا ومقبولًا من قبل العميل بعد مضي سبعة أيام من تاريخ تسليمه في حال عدم تقديم اعتراض رسمي.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">46. الاعتراض:</strong> يجب على العميل تقديم أي اعتراض بشكل مكتوب وواضح خلال مدة سبعة أيام من تاريخ التسليم.</p>' +
                '</div>' +
            '</div>' +
        '</div>' +
        window.buildFooter(pageNum, totalPages) +
    '</div>';
}

function buildTermsPage3(order, pageNum, totalPages) {
    var dateStr = (order.orderDate ? window.formatDate(order.orderDate) : '') + ' - ' + (order.orderTime ? window.formatTime(order.orderTime) : '');
    
    return '<div class="page">' +
        window.buildHeader("الشروط والأحكام") +
        '<div class="terms-container" style="display: block; direction: rtl; font-family: \'Segoe UI\', \'Cairo\', sans-serif;">' +

            <!-- القسم الحادي عشر: البنود المالية والقانونية المتقدمة -->
            '<div style="margin-bottom: 25px; page-break-inside: avoid;">' +
                '<div style="background: linear-gradient(135deg, #854d0e 0%, #a16207 100%); color: white; padding: 10px 18px; border-radius: 10px; margin-bottom: 12px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">' +
                    '<span style="font-size: 22px; background: rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 8px;">📊</span>' +
                    '<h4 style="margin: 0; color: white; font-size: 16px; font-weight: 600;">حادي عشر: البنود المالية والقانونية المتقدمة</h4>' +
                '</div>' +
                '<div style="padding-right: 8px;">' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">47. المدفوعات الخارجية:</strong> لا تُعد أي مبالغ تُدفع لجهات خارجية مستحقة لمقدم الخدمة ولا يحق المطالبة بها أو استرجاعها.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">48. المدفوعات بالنيابة:</strong> تُحتسب أي مدفوعات يقوم بها مقدم الخدمة نيابة عن العميل ضمن تكاليف المشروع ويلتزم العميل بسدادها.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">49. تفسير البنود:</strong> يتم تفسير بنود هذا المستند بما يحقق الغرض منها وبما يحفظ حقوق مقدم الخدمة.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">50. حق رفض الخدمة:</strong> يحتفظ مقدم الخدمة بحقه في رفض تقديم الخدمة أو إيقافها في أي مرحلة مع احتساب الأعمال المنفذة.</p>' +
                '</div>' +
            '</div>' +

            <!-- القسم الثاني عشر: الحماية القانونية -->
            '<div style="margin-bottom: 25px; page-break-inside: avoid;">' +
                '<div style="background: linear-gradient(135deg, #701a75 0%, #86198f 100%); color: white; padding: 10px 18px; border-radius: 10px; margin-bottom: 12px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">' +
                    '<span style="font-size: 22px; background: rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 8px;">🔒</span>' +
                    '<h4 style="margin: 0; color: white; font-size: 16px; font-weight: 600;">ثاني عشر: الحماية القانونية</h4>' +
                '</div>' +
                '<div style="padding-right: 8px;">' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">51. التنازل عن المطالبات:</strong> يتنازل العميل عن أي مطالبات أو تعويضات تتجاوز قيمة هذا عرض السعر / الفاتورة.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">52. حدود المسؤولية:</strong> لا تتجاوز مسؤولية مقدم الخدمة في جميع الأحوال إجمالي المبلغ المدفوع من قبل العميل.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">53. الاستخدام غير المشروع:</strong> لا يتحمل مقدم الخدمة أي مسؤولية عن استخدام العميل للمخرجات بشكل مخالف للأنظمة.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">54. الملكية الفكرية:</strong> تبقى جميع حقوق الملكية الفكرية محفوظة لمقدم الخدمة ما لم يتم الاتفاق على نقلها بشكل مكتوب.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">55. تحديث الشروط:</strong> يحق لمقدم الخدمة تحديث أو تعديل هذه الشروط مستقبلاً وتسري على الأعمال الجديدة.</p>' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">56. استقلالية البنود:</strong> يتم تفسير كل بند من بنود هذا المستند بشكل مستقل دون التأثير على بقية البنود.</p>' +
                '</div>' +
            '</div>' +

            <!-- القسم: الشروط الإضافية والملحقات (البند 57) -->
            '<div style="margin-bottom: 25px; page-break-inside: avoid;">' +
                '<div style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: white; padding: 10px 18px; border-radius: 10px; margin-bottom: 12px; display: flex; align-items: center; gap: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">' +
                    '<span style="font-size: 22px; background: rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 8px;">📎</span>' +
                    '<h4 style="margin: 0; color: white; font-size: 16px; font-weight: 600;">الشروط الإضافية والملحقات</h4>' +
                '</div>' +
                '<div style="padding-right: 8px;">' +
                    '<p style="font-size: 10px; line-height: 1.6; color: #2d3a4a; margin-bottom: 8px;"><strong style="color: #1e3a5f;">57. الشروط الإضافية والملحقات:</strong> في حال وجود أي شروط أو طلبات أو متطلبات إضافية من قبل العميل سواء كانت فنية أو تشغيلية أو مالية أو تنظيمية ولم تكن ضمن نطاق هذا عرض السعر / الفاتورة فإنه يتم توثيقها حصراً في ملحق اتفاق مستقل يتم إعداده واعتماده من قبل الطرفين بشكل خطي ورسمي، ولا تُعد تلك الشروط أو الطلبات الإضافية جزءًا من هذا المستند ولا يترتب عليها أي تعديل أو تأثير على أي من بنوده ما لم يتم النص على ذلك صراحةً وبشكل مكتوب في ذلك الملحق، كما لا يُعتد بأي اتفاقات أو تفاهمات أو مراسلات سواء كانت شفهية أو غير موثقة ما لم يتم تضمينها في ملحق رسمي معتمد.</p>' +
                '</div>' +
            '</div>' +

            <!-- الإقرار -->
            '<div style="background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%); border-right: 4px solid #0284c7; padding: 15px 20px; margin: 20px 0; border-radius: 12px; page-break-inside: avoid;">' +
                '<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">' +
                    '<span style="font-size: 24px;">📝</span>' +
                    '<p style="font-size: 16px; font-weight: bold; margin: 0; color: #0369a1;">الإقرار</p>' +
                '</div>' +
                '<p style="margin: 0; color: #075985; font-size: 13px;">أقر أنا العميل بالاطلاع على جميع الشروط والأحكام أعلاه وأوافق عليها بالكامل وأتعهد بالالتزام بها دون أي استثناء.</p>' +
            '</div>' +

            <!-- منطقة التوقيع -->
            '<div style="margin-top: 20px; padding: 18px 20px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; border: 1px solid #e2e8f0; page-break-inside: avoid;">' +
                '<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px; flex-wrap: wrap;">' +
                    '<span style="font-size: 20px;">👤</span>' +
                    '<strong style="font-size: 14px; min-width: 100px;">اسم العميل:</strong>' +
                    '<span style="color: #1e293b; font-weight: 500; font-size: 14px;">' + window.escapeHtml(order.customerName) + '</span>' +
                '</div>' +
                '<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px; flex-wrap: wrap;">' +
                    '<span style="font-size: 20px;">📅</span>' +
                    '<strong style="font-size: 14px; min-width: 100px;">التاريخ:</strong>' +
                    '<span style="color: #1e293b; font-weight: 500; font-size: 14px;">' + dateStr + '</span>' +
                '</div>' +
                '<div style="margin-top: 20px; padding-top: 15px; border-top: 1px dashed #cbd5e1; display: flex; align-items: center; gap: 12px;">' +
                    '<span style="font-size: 20px;">✍️</span>' +
                    '<strong style="font-size: 14px; min-width: 80px;">التوقيع:</strong>' +
                    '<span style="border-bottom: 1px solid #94a3b8; min-width: 200px; display: inline-block; height: 25px;"></span>' +
                '</div>' +
            '</div>' +
        '</div>' +
        window.buildFooter(pageNum, totalPages) +
    '</div>';
}

// تصدير الدوال
window.buildTermsPage1 = buildTermsPage1;
window.buildTermsPage2 = buildTermsPage2;
window.buildTermsPage3 = buildTermsPage3;

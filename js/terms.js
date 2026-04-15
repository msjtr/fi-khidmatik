// ========================================
// terms.js - دوال بناء صفحات الشروط والأحكام
// ========================================

window.buildTermsPage1 = function(pageNum, totalPages) {
    return `
        <div class="page">
            ${window.buildHeader('الشروط والأحكام - 1')}
            <div class="terms-container">
                <div class="terms-title">الشروط والأحكام</div>
                <div class="legal-notice">
                    <strong>إقرار مسؤولية البيانات والمعلومات:</strong><br>
                    <span>يقر العميل ويوافق على أن جميع المعلومات والبيانات والمستندات التي قام بتزويد مقدم الخدمة بها صحيحة ودقيقة ومكتملة...</span>
                </div>
                <div class="terms-section terms-section-1">
                    <div class="terms-section-header"><span class="terms-section-icon">📋</span><h4>أولاً: صلاحية العرض والتنفيذ</h4></div>
                    <div class="terms-section-content">
                        <p><strong>1.</strong> مدة صلاحية العرض: ثلاثة أيام عمل.</p>
                        <p><strong>2.</strong> بدء التنفيذ: بعد استلام الدفعة المقدمة.</p>
                    </div>
                </div>
            </div>
            ${window.buildFooter(pageNum, totalPages)}
        </div>
    `;
};

window.buildTermsPage2 = function(pageNum, totalPages) {
    return `
        <div class="page">
            ${window.buildHeader('الشروط والأحكام - 2')}
            <div class="terms-container">
                <div class="terms-section terms-section-2">
                    <div class="terms-section-header"><span class="terms-section-icon">💰</span><h4>ثانياً: التكاليف والمسؤوليات المالية</h4></div>
                    <div class="terms-section-content">
                        <p><strong>6.</strong> الرسوم الخارجية: لا تشمل رسوم الجهات الخارجية.</p>
                    </div>
                </div>
            </div>
            ${window.buildFooter(pageNum, totalPages)}
        </div>
    `;
};

window.buildTermsPage3 = function(order, customer, date, time, pageNum, totalPages) {
    return `
        <div class="page">
            ${window.buildHeader('الشروط والأحكام - 3')}
            <div class="terms-container">
                <div class="declaration">
                    <div class="declaration-header"><span class="declaration-icon">📝</span><p>الإقرار</p></div>
                    <p class="declaration-text">أقر أنا العميل بالاطلاع على جميع الشروط والأحكام أعلاه وأوافق عليها بالكامل.</p>
                </div>
                <div class="signature-area">
                    <div class="signature-row"><span class="signature-label">اسم العميل:</span><span>${customer?.name || ''}</span></div>
                    <div class="signature-row"><span class="signature-label">التاريخ:</span><span>${date} - ${time}</span></div>
                    <div class="signature-line"><span class="signature-label">التوقيع:</span><span class="signature-placeholder"></span></div>
                </div>
            </div>
            ${window.buildFooter(pageNum, totalPages)}
        </div>
    `;
};// ========================================
// terms.js - دوال بناء صفحات الشروط والأحكام
// ========================================

window.buildTermsPage1 = function(pageNum, totalPages) {
    return `
        <div class="page">
            ${window.buildHeader('الشروط والأحكام - 1')}
            <div class="terms-container">
                <div class="terms-title">الشروط والأحكام</div>
                <div class="legal-notice">
                    <strong>إقرار مسؤولية البيانات والمعلومات:</strong><br>
                    <span>يقر العميل ويوافق على أن جميع المعلومات والبيانات والمستندات التي قام بتزويد مقدم الخدمة بها صحيحة ودقيقة ومكتملة...</span>
                </div>
                <div class="terms-section terms-section-1">
                    <div class="terms-section-header"><span class="terms-section-icon">📋</span><h4>أولاً: صلاحية العرض والتنفيذ</h4></div>
                    <div class="terms-section-content">
                        <p><strong>1.</strong> مدة صلاحية العرض: ثلاثة أيام عمل.</p>
                        <p><strong>2.</strong> بدء التنفيذ: بعد استلام الدفعة المقدمة.</p>
                    </div>
                </div>
            </div>
            ${window.buildFooter(pageNum, totalPages)}
        </div>
    `;
};

window.buildTermsPage2 = function(pageNum, totalPages) {
    return `
        <div class="page">
            ${window.buildHeader('الشروط والأحكام - 2')}
            <div class="terms-container">
                <div class="terms-section terms-section-2">
                    <div class="terms-section-header"><span class="terms-section-icon">💰</span><h4>ثانياً: التكاليف والمسؤوليات المالية</h4></div>
                    <div class="terms-section-content">
                        <p><strong>6.</strong> الرسوم الخارجية: لا تشمل رسوم الجهات الخارجية.</p>
                    </div>
                </div>
            </div>
            ${window.buildFooter(pageNum, totalPages)}
        </div>
    `;
};

window.buildTermsPage3 = function(order, customer, date, time, pageNum, totalPages) {
    return `
        <div class="page">
            ${window.buildHeader('الشروط والأحكام - 3')}
            <div class="terms-container">
                <div class="declaration">
                    <div class="declaration-header"><span class="declaration-icon">📝</span><p>الإقرار</p></div>
                    <p class="declaration-text">أقر أنا العميل بالاطلاع على جميع الشروط والأحكام أعلاه وأوافق عليها بالكامل.</p>
                </div>
                <div class="signature-area">
                    <div class="signature-row"><span class="signature-label">اسم العميل:</span><span>${customer?.name || ''}</span></div>
                    <div class="signature-row"><span class="signature-label">التاريخ:</span><span>${date} - ${time}</span></div>
                    <div class="signature-line"><span class="signature-label">التوقيع:</span><span class="signature-placeholder"></span></div>
                </div>
            </div>
            ${window.buildFooter(pageNum, totalPages)}
        </div>
    `;
};

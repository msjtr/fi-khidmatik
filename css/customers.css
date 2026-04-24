/**
 * fi-khidmatik/css/customers.css
 * نظام إدارة العملاء - Tera Gateway UI
 * التحديث: تصميم متجاوب، Glassmorphism، وتنسيقات الجدول الاحترافي
 */

 :root {
    --tera-dark: #1e293b;
    --tera-accent: #3b82f6;
    --tera-success: #10b981;
    --tera-warning: #f59e0b;
    --tera-danger: #ef4444;
    --tera-border: #e2e8f0;
    --tera-bg-soft: #f8fafc;
    --glass-effect: rgba(255, 255, 255, 0.85);
}

/* الحاوية الرئيسية */
.customers-view-container {
    padding: 24px;
    animation: fadeIn 0.4s ease-out;
}

/* شبكة الإحصائيات - بطاقات نيو-مورفيزم خفيفة */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.stat-card {
    background: white;
    padding: 20px;
    border-radius: 16px;
    border: 1px solid var(--tera-border);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s ease;
}

.stat-card:hover {
    transform: translateY(-4px);
    border-color: var(--tera-accent);
}

.stat-card h3 {
    margin: 0;
    font-size: 0.85rem;
    color: #64748b;
    font-weight: 700;
}

.stat-card p {
    margin: 10px 0 0 0;
    font-size: 1.75rem;
    font-weight: 900;
    color: var(--tera-dark);
}

/* شريط الأدوات والبحث */
.toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
    flex-wrap: wrap;
}

.search-box {
    position: relative;
    flex-grow: 1;
    max-width: 450px;
}

.search-box i {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
}

.search-box input {
    width: 100%;
    padding: 12px 42px 12px 16px;
    border-radius: 12px;
    border: 1.5px solid var(--tera-border);
    font-family: inherit;
    font-size: 0.9rem;
    transition: all 0.2s;
}

.search-box input:focus {
    border-color: var(--tera-accent);
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* تصميم الجدول الاحترافي */
.table-container {
    background: white;
    border-radius: 16px;
    border: 1px solid var(--tera-border);
    overflow: hidden;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.04);
}

.tera-table {
    width: 100%;
    border-collapse: collapse;
    text-align: right;
}

.tera-table th {
    background: var(--tera-bg-soft);
    padding: 16px;
    font-size: 0.8rem;
    font-weight: 800;
    color: #475569;
    text-transform: uppercase;
    border-bottom: 2px solid var(--tera-border);
}

.tera-table td {
    padding: 14px 16px;
    border-bottom: 1px solid var(--tera-border);
    font-size: 0.9rem;
}

.customer-row:hover {
    background-color: #f1f5f9;
}

/* خلية بيانات العميل */
.user-cell {
    display: flex;
    align-items: center;
    gap: 12px;
}

.avatar-text {
    width: 38px;
    height: 38px;
    background: linear-gradient(135deg, var(--tera-dark), #334155);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    font-weight: 900;
}

.info .name {
    display: block;
    font-weight: 700;
    color: var(--tera-dark);
}

.info small {
    color: #64748b;
    font-size: 0.75rem;
}

/* شارات التصنيف (Badges) */
.status-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 800;
}

.status-badge.vip {
    background: #fef3c7;
    color: #92400e;
    border: 1px solid #fde68a;
}

.status-badge.normal {
    background: #f1f5f9;
    color: #475569;
}

/* أزرار الإجراءات */
.actions {
    display: flex;
    gap: 8px;
}

.act-btn {
    width: 34px;
    height: 34px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    background: var(--tera-bg-soft);
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.act-btn:hover {
    background: var(--tera-dark);
    color: white;
}

.act-btn.del:hover { background: var(--tera-danger); }
.act-btn.edit:hover { background: var(--tera-accent); }

/* الأزرار الرئيسية */
.btn-primary-tera {
    background: var(--tera-dark);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 10px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
}

.btn-primary-tera:hover {
    background: #000;
}

/* تأثيرات الانتقال */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
}

/* التوافق مع الجوال */
@media (max-width: 768px) {
    .toolbar { flex-direction: column; align-items: stretch; }
    .search-box { max-width: 100%; }
    .tera-table th:nth-child(3), 
    .tera-table td:nth-child(3) { display: none; } /* إخفاء العنوان في الشاشات الصغيرة */
}

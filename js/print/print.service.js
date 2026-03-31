// print.service.js
export async function printInvoice(element) {
    // طباعة العنصر الحالي (يفتح نافذة الطباعة مباشرة)
    const originalTitle = document.title;
    document.title = 'طباعة الفاتورة';
    window.print();
    document.title = originalTitle;
}

// js/modules/products.js

async function initFullEditor(elementId) {
    try {
        // التأكد من أن المكتبة محملة (نبحث عن الـ Namespace الصحيح لـ CKEditor 5)
        const editorElement = document.getElementById(elementId);
        if (!editorElement) return;

        // التحقق من وجود ClassicEditor (النسخة 5) أو CKEDITOR (النسخة 4)
        if (typeof ClassicEditor !== 'undefined') {
            await ClassicEditor.create(editorElement, {
                language: 'ar',
                toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'insertTable', 'undo', 'redo']
            });
            console.log("تم تشغيل محرر CKEditor 5 بنجاح");
        } else if (typeof CKEDITOR !== 'undefined') {
            CKEDITOR.replace(elementId);
            console.log("تم تشغيل محرر CKEditor 4 بنجاح");
        } else {
            console.error("خطأ: مكتبة CKEditor غير موجودة، يرجى التأكد من الرابط في admin.html");
        }
    } catch (error) {
        console.error("خطأ في تشغيل المحرر:", error);
    }
}

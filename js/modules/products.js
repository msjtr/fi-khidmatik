async function initFullEditor() {
    try {
        // نستخدم CKEDITOR.ClassicEditor من الـ SuperBuild
        productEditor = await CKEDITOR.ClassicEditor.create(document.querySelector('#p-desc-editor'), {
            // حذف الميزات التي تطلب اتصال بالسيرفر وتسبب الخطأ
            removePlugins: [
                'ExportPdf',
                'ExportWord',
                'CKBox',
                'CKFinder',
                'EasyImage',
                'RealTimeCollaborativeComments',
                'RealTimeCollaborativeTrackChanges',
                'RealTimeCollaborativeRevisionHistory',
                'PresenceList',
                'Comments',
                'TrackChanges',
                'TrackChangesData',
                'RevisionHistory',
                'Pagination',
                'WProofreader',
                'MathType'
            ],
            toolbar: {
                items: [
                    'heading', '|', 
                    'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', 'highlight', '|',
                    'bold', 'italic', 'underline', 'strikethrough', '|',
                    'alignment', '|',
                    'numberedList', 'bulletedList', '|',
                    'outdent', 'indent', '|',
                    'link', 'insertTable', 'blockQuote', '|',
                    'undo', 'redo', '|',
                    'sourceEditing'
                ],
                shouldNotGroupWhenFull: true
            },
            language: 'ar',
            placeholder: 'اكتب وصف المنتج هنا بالتنسيق الذي تفضله...',
            // تأكيد اتجاه النص للعربية
            contentsLangDirection: 'rtl'
        });
    } catch (e) { 
        console.error("خطأ في تشغيل المحرر الشامل:", e); 
    }
}

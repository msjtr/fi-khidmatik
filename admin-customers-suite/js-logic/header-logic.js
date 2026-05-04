export function initHeaderLogic() {
    
    // 1. نظام العبارات التحفيزية المتغيرة
    const phrases = [
        "يوم مليء بالنجاح والإنجازات! 🚀",
        "الإتقان بلس.. طريقك للتميز 🌟",
        "بداية موفقة لعمل عظيم 💼",
        "نحو أهداف جديدة اليوم 🎯",
        "خدمة العملاء بشغف واحترافية 🤝"
    ];
    
    const phraseElement = document.getElementById('motivational-phrase');
    let currentPhraseIndex = 0;

    if (phraseElement) {/**
 * نظام Tera V12 - محرك الهيدر (Header Logic)
 * المؤسسة: الإتقان بلس - حائل
 */
export function initHeaderLogic() {
    
    // 1. نظام العبارات التحفيزية المتغيرة
    const phrases = [
        "يوم مليء بالنجاح والإنجازات! 🚀",
        "الإتقان بلس.. طريقك للتميز 🌟",
        "بداية موفقة لعمل عظيم 💼",
        "نحو أهداف جديدة اليوم 🎯",
        "خدمة العملاء بشغف واحترافية 🤝"
    ];
    
    const phraseElement = document.getElementById('motivational-phrase');
    let currentPhraseIndex = 0;

    if (phraseElement) {
        // إعطاء تأثير الانتقال برمجياً لضمان النعومة عند التبديل
        phraseElement.style.transition = 'opacity 0.5s ease-in-out';
        
        setInterval(() => {
            phraseElement.style.opacity = '0';
            setTimeout(() => {
                currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
                phraseElement.innerText = phrases[currentPhraseIndex];
                phraseElement.style.opacity = '1';
            }, 500); 
        }, 7000); 
    }

    // 2. توليد الأيقونة الافتراضية من الاسم الأول
    const fullNameElement = document.getElementById('display-user-name');
    const avatarElement = document.getElementById('user-avatar-icon');
    
    if (fullNameElement && avatarElement) {
        const fullName = fullNameElement.innerText.trim();
        if (fullName) {
            const firstLetter = fullName.charAt(0).toUpperCase();
            avatarElement.innerText = firstLetter;
        }
    }

    // 3. فتح وإغلاق القائمة المنسدلة (Dropdown)
    const triggerBtn = document.getElementById('profile-trigger-btn');
    const dropdownMenu = document.getElementById('user-dropdown-menu');

    if (triggerBtn && dropdownMenu) {
        triggerBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            // تم التعديل إلى 'active' ليتوافق مع ملف التنسيق hhh-style.css
            dropdownMenu.classList.toggle('active');
            triggerBtn.classList.toggle('active');
        });

        document.addEventListener('click', function(e) {
            if (!dropdownMenu.contains(e.target) && !triggerBtn.contains(e.target)) {
                dropdownMenu.classList.remove('active');
                triggerBtn.classList.remove('active');
            }
        });
    }

    // 4. الخاصية الجديدة: عداد وقت العمل داخل النظام (Session Timer)
    const sessionCounterEl = document.getElementById('session-time-counter');
    let sessionSeconds = 0; // يبدأ من الصفر عند تحميل الواجهة

    if (sessionCounterEl) {
        setInterval(() => {
            sessionSeconds++;
            
            // حساب الساعات والدقائق والثواني
            const h = Math.floor(sessionSeconds / 3600).toString().padStart(2, '0');
            const m = Math.floor((sessionSeconds % 3600) / 60).toString().padStart(2, '0');
            const s = (sessionSeconds % 60).toString().padStart(2, '0');
            
            // عرض الوقت المنسق (مثال: 00:05:12)
            sessionCounterEl.innerText = `${h}:${m}:${s}`;
        }, 1000); // يتحدث كل ثانية
    }
}
        setInterval(() => {
            phraseElement.style.opacity = '0';
            setTimeout(() => {
                currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
                phraseElement.innerText = phrases[currentPhraseIndex];
                phraseElement.style.opacity = '1';
            }, 500); 
        }, 7000); 
    }

    // 2. توليد الأيقونة الافتراضية من الاسم الأول
    const fullNameElement = document.getElementById('display-user-name');
    const avatarElement = document.getElementById('user-avatar-icon');
    
    if (fullNameElement && avatarElement) {
        const fullName = fullNameElement.innerText.trim();
        const firstLetter = fullName.charAt(0).toUpperCase();
        avatarElement.innerText = firstLetter;
    }

    // 3. فتح وإغلاق القائمة المنسدلة (Dropdown)
    const triggerBtn = document.getElementById('profile-trigger-btn');
    const dropdownMenu = document.getElementById('user-dropdown-menu');

    if (triggerBtn && dropdownMenu) {
        triggerBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
            triggerBtn.classList.toggle('active');
        });

        document.addEventListener('click', function(e) {
            if (!dropdownMenu.contains(e.target) && !triggerBtn.contains(e.target)) {
                dropdownMenu.classList.remove('show');
                triggerBtn.classList.remove('active');
            }
        });
    }

    // 4. الخاصية الجديدة: عداد وقت العمل داخل النظام (Session Timer)
    const sessionCounterEl = document.getElementById('session-time-counter');
    let sessionSeconds = 0; // يبدأ من الصفر عند تحميل الواجهة

    if (sessionCounterEl) {
        setInterval(() => {
            sessionSeconds++;
            
            // حساب الساعات والدقائق والثواني
            const h = Math.floor(sessionSeconds / 3600).toString().padStart(2, '0');
            const m = Math.floor((sessionSeconds % 3600) / 60).toString().padStart(2, '0');
            const s = (sessionSeconds % 60).toString().padStart(2, '0');
            
            // عرض الوقت المنسق (مثال: 00:05:12)
            sessionCounterEl.innerText = `${h}:${m}:${s}`;
        }, 1000); // يتحدث كل ثانية
    }
}

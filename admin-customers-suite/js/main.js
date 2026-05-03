/**
 * منصة في خدمتك من الإتقان بلس | V12.12.12
 * وضع التطوير: تم تعطيل صفحة الدخول مؤقتاً لضمان سرعة الإدارة
 * المستخدم: محمد بن صالح بن جميعان الشمري (أبا صالح)
 * الملف: js/main.js
 */

import { auth, db } from './firebase.js';

let sessionSeconds = 0; 

/**
 * دالة تشغيل النظام الرئيسية
 */
export function initApp() {
    console.log("%c 🛠️ وضع التطوير لـ (أبا صالح الشمري): نظام الإدارة مفعل مباشرة ", "color: #fff; background: #2c3e50; padding: 5px; border-radius: 5px;");

    // تشغيل الواجهة بصلاحيات المشغل الرئيسي لمنصة Tera
    updateUIForOwner();
    setupGlobalListeners();
}

/**
 * تحديث الواجهة بصلاحيات محمد بن صالح الشمري
 */
function updateUIForOwner() {
    const applyUserData = () => {
        // 1. تحديث الاسم الكامل للمدير (محمد بن صالح الشمري)
        const userNameElement = document.getElementById('display-user-name');
        if (userNameElement) {
            userNameElement.innerText = "محمد بن صالح الشمري"; 
        }

        // 2. تحديث الصورة الرمزية (Avatar) لتشمل الحرفين الأولين "م.ص"[cite: 1]
        const avatarElement = document.getElementById('user-avatar-icon');
        if (avatarElement) {
            avatarElement.innerText = "م.ص"; 
        }

        startClock();
        startSessionTimer();
        setupProfileDropdown();
    };

    // مزامنة التحديث مع محرك توزيع القوالب (TeraLayout)
    document.addEventListener('TeraLayoutReady', applyUserData);

    // صمام أمان لضمان التنفيذ في حال تأخر تحميل القالب
    setTimeout(applyUserData, 400);
}

/**
 * دالة تشغيل الساعة الرقمية (منطقة حائل)
 */
function startClock() {
    const clockMount = document.getElementById('clock-mount-point');
    if (!clockMount) return;

    setInterval(() => {
        const now = new Date();
        const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
        const timeString = now.toLocaleTimeString('ar-SA', options);
        const dateString = now.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        
        clockMount.innerHTML = `
            <div class="clock-container" style="text-align: left; direction: ltr;">
                <div class="time-display" style="font-weight: bold; color: var(--accent);">
                    ${timeString}
                </div>
                <div class="date-display" style="font-size: 0.75rem; color: #8892B0;">
                    ${dateString}
                </div>
            </div>
        `;
    }, 1000);
}

/**
 * عداد مدة الجلسة النشطة
 */
function startSessionTimer() {
    const sessionCounter = document.getElementById('session-time-counter');
    if (!sessionCounter) return;

    setInterval(() => {
        sessionSeconds++;
        const hrs = Math.floor(sessionSeconds / 3600);
        const mins = Math.floor((sessionSeconds % 3600) / 60);
        const secs = sessionSeconds % 60;
        
        sessionCounter.innerText = 
            `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, 1000);
}

/**
 * التحكم بالقائمة المنسدلة (Profile Dropdown)
 */
function setupProfileDropdown() {
    const triggerBtn = document.getElementById('profile-trigger-btn');
    const dropdownMenu = document.getElementById('user-dropdown-menu');

    if (triggerBtn && dropdownMenu) {
        triggerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!triggerBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('show');
            }
        });
    }
}

/**
 * مراقبة استقرار الاتصال في مكتب حائل[cite: 1]
 */
function setupGlobalListeners() {
    window.addEventListener('offline', () => {
        // رسالة مخصصة لك يا أبا صالح[cite: 1]
        console.warn("انقطع الاتصال بالشبكة في منطقة حائل.");
        alert("تنبيه أبا صالح: تأكد من اتصال الإنترنت لمتابعة إدارة منصة Tera!");
    });
    
    window.addEventListener('online', () => {
        console.log("تم استعادة الاتصال.. عودة العمليات لمنصة تيرا.");
    });
}

// تشغيل محرك النظام
initApp();

export const systemConfig = {
    version: "12.12.12",
    owner: "Mohammad Bin Saleh Al-Shammari", //[cite: 1]
    region: "Hail, KSA", //[cite: 1]
    mode: "Enterprise Admin"
};

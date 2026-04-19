/**
 * js/utils/helpers.js
 * دوال مساعدة عامة
 */

/**
 * منع هجمات XSS
 */
export const escapeHtml = (str) => {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

/**
 * عرض إشعار منبثق
 */
export const showNotification = (message, type = 'success', duration = 3000) => {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#2ecc71' : '#e74c3c'};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 10001;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        direction: rtl;
        font-family: 'Tajawal', sans-serif;
    `;
    notification.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i> ${message}`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), duration);
};

/**
 * تأخير تنفيذ دالة (Debounce)
 */
export const debounce = (func, delay) => {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
};

/**
 * نسخ نص إلى الحافظة
 */
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('تم النسخ إلى الحافظة', 'success');
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        showNotification('فشل النسخ إلى الحافظة', 'error');
        return false;
    }
};

/**
 * تحميل ملف JSON
 */
export const downloadJSON = (data, filename = 'data.json') => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
};

export default {
    escapeHtml,
    showNotification,
    debounce,
    copyToClipboard,
    downloadJSON
};

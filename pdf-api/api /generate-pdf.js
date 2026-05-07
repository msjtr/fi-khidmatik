import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export default async function handler(req, res) {
    // إعدادات السماح بالاتصال من أي موقع (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).send('الطريقة غير مسموح بها');
    }

    const { html } = req.body;
    let browser = null;

    try {
        // تشغيل محرك كروميوم الخاص ببيئة Vercel السحابية
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });

        const page = await browser.newPage();
        
        // وضع المحتوى والانتظار حتى يكتمل تحميل العناصر (نتورك أيدل)
        await page.setContent(html, { waitUntil: 'networkidle0' });

        // استخراج الـ PDF (دقة 4K افتراضية عبر المحرك)
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '10mm', right: '15mm', bottom: '15mm', left: '15mm' }
        });

        // إرسال الملف الناتج كاستجابة
        res.setHeader('Content-Type', 'application/pdf');
        return res.send(pdf);

    } catch (error) {
        console.error("خطأ في السيرفر:", error.message);
        return res.status(500).json({ error: error.message });
    } finally {
        // إغلاق المتصفح فوراً لتوفير موارد السيرفر
        if (browser) await browser.close();
    }
}

// ملف: js-logic/firebase.js

// 1. استيراد الدوال الأساسية للإصدار 9+
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// 2. إعدادات مشروعك في فايربيس (استبدلها بمفاتيحك الخاصة)
const firebaseConfig = {
  apiKey: "AIzaSyBxxxxxxx-xxxxxxxxxxxx",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

// 3. تشغيل النظام (initializeApp)
const app = initializeApp(firebaseConfig);

// 4. تجهيز وتصدير خدمات قاعدة البيانات والمصادقة للواجهات الأخرى
export const db = getFirestore(app);
export const auth = getAuth(app);

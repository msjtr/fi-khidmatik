<script type="module">
  // تم تصحيح الإصدار من 12.12.1 (غير موجود) إلى 10.7.1 (المستقر)
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
  import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
  import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

  // إعدادات مشروعك (msjt301-974bb)
  const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab",
    measurementId: "G-NDVGC9GPQZ"
  };

  // تهيئة المحرك
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const db = getFirestore(app);
  const auth = getAuth(app);

  // تصدير للنافذة لضمان عمل الجداول
  window.db = db;
  window.auth = auth;

  console.log("✅ Tera Engine: تم تصحيح الروابط والمحرك متصل الآن بـ Firebase");
</script>

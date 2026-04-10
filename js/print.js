import { db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
import { loadTerms } from "./terms.js";

// 📌 قراءة ID من الرابط
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// 🚀 تشغيل عند فتح الصفحة
window.addEventListener("DOMContentLoaded", () => {
  loadInvoice();
});

// 🔥 تحميل الفاتورة
async function loadInvoice() {

  // ❌ إذا ما فيه ID
  if (!id) {
    showError("لا يوجد رقم فاتورة في الرابط");
    return;
  }

  try {
    const ref = doc(db, "invoices", id);
    const snap = await getDoc(ref);

    // ❌ إذا الفاتورة غير موجودة
    if (!snap.exists()) {
      showError("الفاتورة غير موجودة");
      return;
    }

    const data = snap.data();

    // ✅ تعبئة البيانات
    setText("invoiceNumber", "فاتورة " + (data.invoiceNumber || "-"));
    setText("date", data.date || "-");
    setText("clientName", data.clientName || "-");
    setText("city", data.city || "-");

    // 🧾 العناصر
    const tbody = document.getElementById("items");
    tbody.innerHTML = "";

    let subtotal = 0;

    (data.items || []).forEach((item, i) => {
      const qty = Number(item.qty || 0);
      const price = Number(item.price || 0);
      const total = qty * price;

      subtotal += total;

      const row = `
        <tr>
          <td>${i + 1}</td>
          <td>${item.name || "-"}</td>
          <td>${qty}</td>
          <td>${total.toFixed(2)} ريال</td>
        </tr>
      `;

      tbody.innerHTML += row;
    });

    // 💰 الحسابات
    const tax = subtotal * 0.15;
    const total = subtotal + tax;

    setText("subtotal", formatMoney(subtotal));
    setText("tax", formatMoney(tax));
    setText("total", formatMoney(total));

    // 🔳 QR
    generateQR(total, tax, data.date);

    // 📄 الشروط
    loadTerms();

  } catch (error) {
    console.error(error);
    showError("حدث خطأ أثناء تحميل الفاتورة");
  }
}

// 🔳 توليد QR
function generateQR(total, tax, date) {
  try {
    const qrText = `
Seller: منصة في خدمتك
VAT: 312495447600003
Total: ${total.toFixed(2)}
Tax: ${tax.toFixed(2)}
Date: ${date || ""}
`;

    const canvas = document.getElementById("qr");

    if (canvas) {
      QRCode.toCanvas(canvas, qrText);
    }

  } catch (err) {
    console.warn("QR Error:", err);
  }
}

// 🧠 تنسيق فلوس
function formatMoney(amount) {
  return amount.toFixed(2) + " ريال";
}

// 🛠️ مساعد لتعبئة النص
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerText = value;
}

// ❌ عرض خطأ
function showError(message) {
  document.body.innerHTML = `
    <div style="text-align:center; margin-top:100px; font-family:Tahoma;">
      <h2>⚠️ ${message}</h2>
    </div>
  `;
}

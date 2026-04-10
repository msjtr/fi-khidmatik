import { loadTerms } from "./terms.js";

// 🔥 Firebase v8
const db = window.db;

// 📌 قراءة ID من الرابط
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// 🚀 تشغيل عند فتح الصفحة
window.addEventListener("DOMContentLoaded", loadInvoice);

// 🔥 تحميل الفاتورة
async function loadInvoice() {

  if (!id) {
    return showError("❌ لا يوجد رقم فاتورة في الرابط");
  }

  try {

    const snap = await db.collection("invoices").doc(id).get();

    if (!snap.exists) {
      return showError("❌ الفاتورة غير موجودة");
    }

    const data = snap.data();

    // =====================
    // 🔷 بيانات الفاتورة
    // =====================
    setText("invoiceNumber", data.invoiceNumber);
    setText("date", data.date);
    setText("time", data.time || "-");
    setText("status", data.status || "تم التنفيذ");

    // =====================
    // 🔷 بيانات العميل
    // =====================
    setText("clientName", data.clientName);
    setText("city", data.city);
    setText("phone", data.phone || "-");
    setText("email", data.email || "-");

    // =====================
    // 🔷 الدفع
    // =====================
    setText("paymentMethod", data.paymentMethod || "غير محدد");
    setText("deliveryMethod", data.deliveryMethod || "غير محدد");

    // =====================
    // 🔷 المنتجات
    // =====================
    const tbody = document.getElementById("items");
    tbody.innerHTML = "";

    let subtotal = 0;

    (data.items || []).forEach((item, i) => {

      const qty = Number(item.qty || 0);
      const price = Number(item.price || 0);
      const total = qty * price;

      subtotal += total;

      tbody.innerHTML += `
        <tr>
          <td>${i + 1}</td>
          <td>
            <img src="${item.image || 'admin/images/default-product.png'}" width="40">
          </td>
          <td>${item.name || "-"}</td>
          <td>${item.desc || "-"}</td>
          <td>${qty}</td>
          <td>${price}</td>
        </tr>
      `;
    });

    // =====================
    // 🔷 الحسابات
    // =====================
    const discount = Number(data.discount || 0);
    const afterDiscount = subtotal - discount;
    const tax = afterDiscount * 0.15;
    const total = afterDiscount + tax;

    setText("subtotal", formatMoney(subtotal));
    setText("discount", "- " + formatMoney(discount));
    setText("tax", formatMoney(tax));
    setText("total", formatMoney(total));

    // =====================
    // 🔳 QR Code
    // =====================
    generateQR(total, tax, data.date);

    // =====================
    // 📄 الشروط
    // =====================
    loadTerms();

  } catch (error) {
    console.error(error);
    showError("⚠️ حدث خطأ أثناء تحميل الفاتورة");
  }
}

// =====================
// 🔳 QR Code
// =====================
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

// =====================
// 💰 تنسيق العملة
// =====================
function formatMoney(amount) {
  return Number(amount || 0).toFixed(2) + " ريال";
}

// =====================
// 🛠️ مساعد تعبئة
// =====================
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerText = value || "-";
}

// =====================
// ❌ عرض خطأ
// =====================
function showError(message) {
  document.body.innerHTML = `
    <div style="text-align:center; margin-top:100px; font-family:Tahoma;">
      <h2>${message}</h2>
    </div>
  `;
}

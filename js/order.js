function checkout(){

if(cart.length === 0){
alert("السلة فارغة");
return;
}

// رقم الطلب
let last = localStorage.getItem("lastOrderNumber") || 1375;
let newNum = parseInt(last) + 1;
localStorage.setItem("lastOrderNumber", newNum);

let orderNumber = "FK-2026-" + String(newNum).padStart(6,'0');

// الوقت 12 ساعة
let timeInput = document.getElementById("order_time").value;
let formattedTime = "-";

if(timeInput){
let [h,m] = timeInput.split(":");
h = parseInt(h);
let period = h >= 12 ? "م" : "ص";
h = h % 12 || 12;
formattedTime = h + ":" + m + period;
}

let order = {

order_number: orderNumber,
date: document.getElementById("order_date").value || "-",
time: formattedTime,

customer: document.getElementById("name").value,
phone: document.getElementById("phone").value,
address: document.getElementById("address").value,
email: document.getElementById("email").value,

cart: cart,

payment: document.getElementById("payment").value,
tamara_auth: document.getElementById("tamara_auth").value,
tamara_order: document.getElementById("tamara_order").value,

shipping: document.getElementById("shipping").value

};

localStorage.setItem("currentOrder", JSON.stringify(order));

window.location.href = "invoice.html";

}

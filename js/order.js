function checkout(){

if(!window.cart || window.cart.length === 0){
alert("السلة فارغة");
return;
}

let last = localStorage.getItem("num") || 1375;
let n = parseInt(last) + 1;
localStorage.setItem("num", n);

let t = document.getElementById("order_time").value;
let time = "-";

if(t){
let [h,m]=t.split(":");
h=parseInt(h);
time=(h%12||12)+":"+m+(h>=12?"م":"ص");
}

let order = {

order_number: "FK-2026-" + String(n).padStart(6,'0'),

date: document.getElementById("order_date").value,
time: time,

customer: document.getElementById("name").value,
phone: document.getElementById("phone").value,
email: document.getElementById("email").value,

city: document.getElementById("city").value,
district: document.getElementById("district").value,
street: document.getElementById("street").value,
building: document.getElementById("building").value,
extra: document.getElementById("extra").value,
postal: document.getElementById("postal").value,

cart: window.cart,

payment: document.getElementById("payment").value,
tamara_auth: document.getElementById("tamara_auth").value,
tamara_order: document.getElementById("tamara_order").value,

shipping: document.getElementById("shipping").value

};

localStorage.setItem("order", JSON.stringify(order));

window.location.href = "invoice.html";
}

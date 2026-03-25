let cart = [];

function addToCart(){

let name = document.getElementById("product_name").value;
let desc = document.getElementById("product_desc").value;
let price = document.getElementById("product_price").value;

if(name === "" || price === ""){
alert("أدخل اسم المنتج والسعر");
return;
}

cart.push({name, desc, price});
renderCart();

document.getElementById("product_name").value = "";
document.getElementById("product_desc").value = "";window.cart = [];

function addToCart(){

let name = document.getElementById("product_name").value.trim();
let desc = document.getElementById("product_desc").value.trim();
let price = document.getElementById("product_price").value.trim();

if(name === "" || price === ""){
alert("أدخل اسم المنتج والسعر");
return;
}

if(isNaN(price)){
alert("السعر لازم يكون رقم");
return;
}

price = parseFloat(price);

// إضافة المنتج مع الكمية
window.cart.push({
name: name,
desc: desc,
price: price,
qty: 1
});

renderCart();

// تنظيف الحقول
document.getElementById("product_name").value = "";
document.getElementById("product_desc").value = "";
document.getElementById("product_price").value = "";

}

function renderCart(){

let html = "";
let total = 0;

if(window.cart.length === 0){

html = "<p>السلة فارغة</p>";

} else {

window.cart.forEach((p,i)=>{

let itemTotal = p.price * p.qty;
total += itemTotal;

html += `
<div class="cart-item">

<div>
<b>${p.name}</b><br>
${p.desc || ""}
</div>

<div>
${p.price} ريال
</div>

<div>
<button onclick="decreaseQty(${i})">-</button>
<span>${p.qty}</span>
<button onclick="increaseQty(${i})">+</button>
</div>

<div>
${itemTotal.toFixed(2)} ريال
</div>

<div>
<button onclick="removeItem(${i})">🗑</button>
</div>

</div>
`;
});

html += `
<hr>
<h3>المجموع: ${total.toFixed(2)} ريال</h3>
`;
}

document.getElementById("cart").innerHTML = html;
}

// زيادة كمية
function increaseQty(i){
window.cart[i].qty++;
renderCart();
}

// تقليل كمية
function decreaseQty(i){
if(window.cart[i].qty > 1){
window.cart[i].qty--;
renderCart();
}
}

// حذف
function removeItem(i){
window.cart.splice(i,1);
renderCart();
}
document.getElementById("product_price").value = "";

}

function renderCart(){

let html = "";

cart.forEach((p,i)=>{
html += `<div>${p.name} - ${p.price}
<button onclick="removeItem(${i})">حذف</button></div>`;
});

document.getElementById("cart").innerHTML = html;

}

function removeItem(i){
cart.splice(i,1);
renderCart();
}

window.cart = [];

function addToCart(){

let name = document.getElementById("product_name").value.trim();
let desc = document.getElementById("product_desc").value.trim();
let price = document.getElementById("product_price").value.trim();

if(!name || !price){
alert("أدخل اسم المنتج والسعر");
return;
}

if(isNaN(price)){
alert("السعر لازم يكون رقم");
return;
}

price = parseFloat(price);

window.cart.push({name, desc, price, qty:1});

renderCart();

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

let t = p.price * p.qty;
total += t;

html += `
<div class="cart-item">
<div>${p.name}</div>
<div>${p.price} ريال</div>
<div>
<button onclick="decreaseQty(${i})">-</button>
${p.qty}
<button onclick="increaseQty(${i})">+</button>
</div>
<div>${t.toFixed(2)}</div>
<div><button onclick="removeItem(${i})">حذف</button></div>
</div>`;
});

html += `<h3>المجموع: ${total.toFixed(2)} ريال</h3>`;
}

// 🔥 التصحيح هنا
document.getElementById("cart").innerHTML = html;
}

function increaseQty(i){
window.cart[i].qty++;
renderCart();
}

function decreaseQty(i){
if(window.cart[i].qty > 1){
window.cart[i].qty--;
renderCart();
}
}

function removeItem(i){
window.cart.splice(i,1);
renderCart();
}

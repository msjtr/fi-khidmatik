window.cart = [];

function addToCart(){

let name = document.getElementById("product_name").value;
let desc = document.getElementById("product_desc").value;
let price = document.getElementById("product_price").value;

if(!name || !price){
alert("أدخل اسم المنتج والسعر");
return;
}

price = parseFloat(price);

window.cart.push({
name:name,
desc:desc,
price:price,
qty:1
});

renderCart();

document.getElementById("product_name").value="";
document.getElementById("product_desc").value="";
document.getElementById("product_price").value="";
}

function renderCart(){

let html="";
let total=0;

window.cart.forEach((p,i)=>{

let t=p.price*p.qty;
total+=t;

html+=`
<div>
${p.name} - ${p.price} ريال
<button onclick="removeItem(${i})">حذف</button>
</div>`;
});

html+=`<h3>المجموع: ${total.toFixed(2)} ريال</h3>`;

document.getElementById("cart").innerHTML=html;
}

function removeItem(i){
window.cart.splice(i,1);
renderCart();
}

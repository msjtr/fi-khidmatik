let cart = [];

function addToCart(){

let name = document.getElementById("product_name").value;
let desc = document.getElementById("product_desc").value;
let price = document.getElementById("product_price").value;

if(name === "" || price === ""){
alert("أدخل اسم المنتج والسعر");
return;
}

let product = {
name: name,
desc: desc,
price: price
};

cart.push(product);

renderCart();

document.getElementById("product_name").value = "";
document.getElementById("product_desc").value = "";
document.getElementById("product_price").value = "";

}

function renderCart(){

let html = "";

cart.forEach((p,i)=>{

html += `
<div>
${p.name} - ${p.price}
<button onclick="removeItem(${i})">حذف</button>
</div>
`;

});

document.getElementById("cart").innerHTML = html;

}

function removeItem(i){
cart.splice(i,1);
renderCart();
}

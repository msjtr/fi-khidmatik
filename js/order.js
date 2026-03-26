function checkout(){

if(!window.cart || window.cart.length===0){
alert("السلة فارغة");
return;
}

let last = localStorage.getItem("num") || 1375;
let n = parseInt(last)+1;
localStorage.setItem("num", n);

let time="-";
let t=document.getElementById("order_time").value;

if(t){
let parts=t.split(":");
let h=parseInt(parts[0]);
let m=parts[1];
let period=h>=12?"م":"ص";
h=h%12||12;
time=h+":"+m+period;
}

function v(id){
let el=document.getElementById(id);
return el?el.value:"";
}

let order={

order_number:"FK-2026-"+String(n).padStart(6,'0'),

date:v("order_date"),
time:time,

customer:v("name"),
phone:v("phone"),
email:v("email"),

city:v("city"),
district:v("district"),
street:v("street"),
building:v("building"),
extra:v("extra"),
postal:v("postal"),

cart:window.cart,

payment:v("payment"),
tamara_auth:v("tamara_auth"),
tamara_order:v("tamara_order"),

shipping:v("shipping")

};

localStorage.setItem("order", JSON.stringify(order));

window.location.href="invoice.html";
}

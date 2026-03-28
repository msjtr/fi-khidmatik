import {
db,
collection,
addDoc,
doc,
getDoc,
getDocs,
updateDoc,
deleteDoc,
setDoc
} from './firebase.js';

// ===== عام =====
export async function getCollection(name){
const snap = await getDocs(collection(db,name));
return snap.docs.map(d=>({id:d.id,...d.data()}));
}

// ===== المنتجات =====
export const loadProducts = ()=>getCollection('products');
export const addProduct = (d)=>addDoc(collection(db,'products'),d);
export const updateProduct = (id,d)=>updateDoc(doc(db,'products',id),d);
export const deleteProduct = (id)=>deleteDoc(doc(db,'products',id));
export const updateProductQuantity = (id,q)=>updateProduct(id,{quantity:q});

// ===== العملاء =====
export const loadCustomers = ()=>getCollection('customers');
export const addCustomer = (d)=>addDoc(collection(db,'customers'),d);
export const updateCustomer = (id,d)=>updateDoc(doc(db,'customers',id),d);
export const deleteCustomer = (id)=>deleteDoc(doc(db,'customers',id));

// ===== الطلبات =====
export const loadOrders = ()=>getCollection('orders');
export const addOrder = (d)=>addDoc(collection(db,'orders'),d);

// ===== الإعدادات =====
export async function getSettings(id){
const d = await getDoc(doc(db,'settings',id));
return d.exists()?d.data():null;
}
export const setSettings = (id,data)=>setDoc(doc(db,'settings',id),data,{merge:true});

// ===== النسخ الاحتياطي =====
export async function exportAllData(){
const cols=['products','customers','orders','settings'];
let data={};
for(let c of cols){
const snap=await getDocs(collection(db,c));
data[c]=snap.docs.map(d=>({id:d.id,...d.data()}));
}
return data;
}

export async function importAllData(data){
for(let col in data){
for(let item of data[col]){
const {id,...rest}=item;
await setDoc(doc(db,col,id),rest);
}
}
}

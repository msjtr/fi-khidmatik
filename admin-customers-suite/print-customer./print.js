import { doc, getDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { db } from '../js/firebase.js'; 

const currentEmployee = "محمد بن صالح الشمري";
const urlParams = new URLSearchParams(window.location.search);
const customerId = urlParams.get('id');

function toEnNum(s) {
    if(!s) return '';
    const ar = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
    const en = ['0','1','2','3','4','5','6','7','8','9'];
    return s.toString().replace(/[٠-٩]/g, a => en[ar.indexOf(a)]);
}

function setupPage() {
    const n = new Date();
    const h = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {day:'2-digit',month:'2-digit',year:'numeric'}).format(n);
    const g = new Intl.DateTimeFormat('en-GB').format(n);
    document.getElementById('print-date').innerText = toEnNum(`${h} H / ${g} M`);
    document.getElementById('print-time').innerText = toEnNum(n.toLocaleTimeString('en-US'));
}

async function loadData() {
    setupPage();
    if(!customerId) return;
    const snap = await getDoc(doc(db, "customers", customerId));
    if(snap.exists()){
        const c = snap.data();
        const setText = (id, v) => { if(document.getElementById(id)) document.getElementById(id).innerText = toEnNum(v) || '-'; };
        
        setText('c-name', c.name);
        setText('c-countryCode', c.countryCode || '+966');
        setText('c-phone', c.phone);
        setText('c-email', c.email);
        setText('c-country', c.country);
        setText('c-city', c.city);
        setText('c-district', c.district);
        setText('c-street', c.street);
        setText('c-buildingNo', c.buildingNo);
        setText('c-postalCode', c.postalCode);
        
        let d = c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-GB') : '-';
        setText('c-joinDate', d);
        setText('c-status', c.accountStatus);
        setText('c-category', c.customerCategory);
        document.getElementById('c-notes').innerHTML = toEnNum(c.detailedNotes) || '-';
        
        const vCode = Math.random().toString(16).slice(2, 10).toUpperCase();
        setText('verify-code', vCode);
        document.getElementById('watermark-text').innerText = currentEmployee;
        
        new QRCode(document.getElementById("qr-code"), {text: `ID: ${customerId}`, width: 60, height: 60});
    }
}

document.getElementById('btn-print').onclick = () => { window.print(); };
document.addEventListener('DOMContentLoaded', loadData);

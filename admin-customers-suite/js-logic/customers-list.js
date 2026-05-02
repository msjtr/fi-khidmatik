/**
 * نظام Tera V12 - محرك قائمة العملاء (مربوط بالخرائط المجانية)
 */

import { collection, getDocs, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { db } from '../js/firebase.js'; 
import { GeoEngine } from './map-logic.js';

const customersRef = collection(db, "customers");
let customersDataList = [];

// ----------------------------------------------------
// جلب وعرض بيانات العملاء
// ----------------------------------------------------
async function loadCustomers() {
    const tbody = document.getElementById('customers-tbody');
    try {
        const querySnapshot = await getDocs(customersRef);
        customersDataList = [];
        tbody.innerHTML = '';

        let index = 1;
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            data.id = docSnap.id; 
            customersDataList.push(data);

            const firstLetter = data.name ? data.name.charAt(0).toUpperCase() : '?';
            const avatarHtml = data.avatarUrl ? `<img src="${data.avatarUrl}">` : firstLetter;

            // توجيه الخريطة بناءً على الإحداثيات أو النص
            let mapSearchUrl = "";
            if (data.latitude && data.longitude) {
                mapSearchUrl = `https://www.google.com/maps/?q=${data.latitude},${data.longitude}`;
            } else {
                const fullAddress = `${data.country || ''} ${data.city || ''} ${data.district || ''} ${data.street || ''} ${data.buildingNo || ''}`.trim();
                mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
            }

            const dateAdded = data.createdAt ? new Date(data.createdAt).toLocaleDateString('ar-SA') : '-';
            const status = data.status || "نشط";

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index++}</td>
                <td class="sticky-col">
                    <div class="avatar-cell">
                        <div class="avatar-circle">${avatarHtml}</div>
                        <strong>${data.name || '-'}</strong>
                    </div>
                </td>
                <td dir="ltr">${data.phone || '-'}</td>
                <td dir="ltr">${data.countryCode || '+966'}</td>
                <td>${data.email || '-'}</td>
                <td>${data.country || '-'}</td>
                <td>${data.city || '-'}</td>
                <td>${data.district || '-'}</td>
                <td>${data.street || '-'}</td>
                <td>${data.buildingNo || '-'}</td>
                <td>${data.additionalNo || '-'}</td>
                <td>${data.postalCode || '-'}</td>
                <td>${data.poBox || '-'}</td>
                <td><a href="${mapSearchUrl}" target="_blank" class="map-link">📍 الموقع</a></td>
                <td>${dateAdded}</td>
                <td>${status}</td>
                <td><span class="tag-badge">${data.tag || 'عام'}</span></td>
                <td class="sticky-col-right">
                    <button class="action-btn edit" onclick="openEditModal('${data.id}')">✏️</button>
                    <button class="action-btn delete" onclick="deleteCustomer('${data.id}')">🗑️</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        const countElement = document.getElementById('customers-count');
        if (countElement) countElement.innerText = customersDataList.length;

    } catch (error) {
        console.error(error);
    }
}

// ----------------------------------------------------
// تحديث الحقول التلقائي عند تحريك الدبوس
// ----------------------------------------------------
async function updateFieldsFromGeoEngine(lat, lng) {
    document.getElementById('edit-lat').value = lat;
    document.getElementById('edit-lng').value = lng;
    
    const addr = await GeoEngine.getAddressFromCoords(lat, lng);
    if(addr) {
        document.getElementById('edit-city').value = addr.city || '';
        document.getElementById('edit-district').value = addr.district || '';
        document.getElementById('edit-postalCode').value = addr.postalCode || '';
        document.getElementById('edit-street').value = addr.street || '';
    }
}

// ----------------------------------------------------
// تحديث الدبوس التلقائي عند الكتابة في الحقول
// ----------------------------------------------------
async function updateMapFromText() {
    if (!GeoEngine.map || !GeoEngine.marker) return;
    
    const country = document.getElementById('edit-country').value;
    const city = document.getElementById('edit-city').value;
    const district = document.getElementById('edit-district').value;
    const street = document.getElementById('edit-street').value;
    
    const fullAddress = `${street} ${district} ${city} ${country}`.trim();
    if(fullAddress.length < 4) return;

    const coords = await GeoEngine.getCoordsFromAddress(fullAddress);
    if(coords) {
        GeoEngine.map.setView([coords.lat, coords.lng], 15);
        GeoEngine.marker.setLatLng([coords.lat, coords.lng]);
        document.getElementById('edit-lat').value = coords.lat;
        document.getElementById('edit-lng').value = coords.lng;
    }
}

// ----------------------------------------------------
// زر تحديد موقعي
// ----------------------------------------------------
window.autoDetectLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            if(GeoEngine.map && GeoEngine.marker) {
                GeoEngine.map.setView([lat, lng], 16);
                GeoEngine.marker.setLatLng([lat, lng]);
            }
            updateFieldsFromGeoEngine(lat, lng);
        }, () => { alert("يرجى تفعيل الموقع في المتصفح."); });
    }
};

// ----------------------------------------------------
// تهيئة التفاعلات
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    loadCustomers();
    document.querySelectorAll('.address-input').forEach(input => {
        input.addEventListener('change', updateMapFromText);
    });
});

// ----------------------------------------------------
// فتح نافذة التعديل وتشغيل الخريطة
// ----------------------------------------------------
window.openEditModal = async (id) => {
    const customer = customersDataList.find(c => c.id === id);
    if (!customer) return;

    document.getElementById('edit-doc-id').value = id;
    document.getElementById('edit-name').value = customer.name || '';
    document.getElementById('edit-phone').value = customer.phone || '';
    document.getElementById('edit-countryCode').value = customer.countryCode || '+966';
    document.getElementById('edit-email').value = customer.email || '';
    document.getElementById('edit-country').value = customer.country || 'المملكة العربية السعودية';
    document.getElementById('edit-city').value = customer.city || 'حائل';
    document.getElementById('edit-district').value = customer.district || '';
    document.getElementById('edit-street').value = customer.street || '';
    document.getElementById('edit-buildingNo').value = customer.buildingNo || '';
    document.getElementById('edit-additionalNo').value = customer.additionalNo || '';
    document.getElementById('edit-postalCode').value = customer.postalCode || '';
    document.getElementById('edit-poBox').value = customer.poBox || '';
    document.getElementById('edit-tag').value = customer.tag || '';
    document.getElementById('edit-status').value = customer.status || 'نشط';

    const lat = parseFloat(customer.latitude) || 27.5236; 
    const lng = parseFloat(customer.longitude) || 41.6966;
    
    document.getElementById('edit-lat').value = lat;
    document.getElementById('edit-lng').value = lng;

    document.getElementById('edit-customer-modal').classList.add('active');

    // تشغيل الخريطة المجانية
    setTimeout(async () => {
        await GeoEngine.initMap('modal-map', lat, lng);
        
        // عند سحب الدبوس وإفلاته
        GeoEngine.marker.on('dragend', function (e) {
            const pos = e.target.getLatLng();
            updateFieldsFromGeoEngine(pos.lat, pos.lng);
        });

        // عند النقر على الخريطة
        GeoEngine.map.on('click', function(e) {
            GeoEngine.marker.setLatLng(e.latlng);
            updateFieldsFromGeoEngine(e.latlng.lat, e.latlng.lng);
        });
    }, 300); 
};

// ----------------------------------------------------
// إغلاق النافذة
// ----------------------------------------------------
window.closeEditModal = () => {
    document.getElementById('edit-customer-modal').classList.remove('active');
};

// ----------------------------------------------------
// حفظ التعديلات
// ----------------------------------------------------
const editForm = document.getElementById('edit-customer-form');
if(editForm) {
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-doc-id').value;
        const saveBtn = document.querySelector('.save-btn');
        saveBtn.innerText = 'جارِ الحفظ...';
        saveBtn.disabled = true;

        try {
            await updateDoc(doc(db, "customers", id), {
                name: document.getElementById('edit-name').value,
                phone: document.getElementById('edit-phone').value,
                countryCode: document.getElementById('edit-countryCode').value,
                email: document.getElementById('edit-email').value,
                country: document.getElementById('edit-country').value,
                city: document.getElementById('edit-city').value,
                district: document.getElementById('edit-district').value,
                street: document.getElementById('edit-street').value,
                buildingNo: document.getElementById('edit-buildingNo').value,
                additionalNo: document.getElementById('edit-additionalNo').value,
                postalCode: document.getElementById('edit-postalCode').value,
                poBox: document.getElementById('edit-poBox').value,
                tag: document.getElementById('edit-tag').value,
                status: document.getElementById('edit-status').value,
                latitude: document.getElementById('edit-lat').value || null,
                longitude: document.getElementById('edit-lng').value || null,
                updatedAt: new Date().toISOString()
            });
            alert('تم التحديث بنجاح!');
            closeEditModal();
            loadCustomers(); 
        } catch (error) {
            console.error(error);
        } finally {
            saveBtn.innerText = 'حفظ التعديلات';
            saveBtn.disabled = false;
        }
    });
}

// ----------------------------------------------------
// الحذف
// ----------------------------------------------------
window.deleteCustomer = async (id) => {
    if(confirm('هل أنت متأكد من الحذف؟')) {
        try { await deleteDoc(doc(db, "customers", id)); loadCustomers(); } catch (e) {}
    }
};

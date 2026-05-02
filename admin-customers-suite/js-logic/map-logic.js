/** 
 * Tera Geo-Engine v2.0 (Free Version)
 * نظام الخرائط المستقل والمجاني - مخصص لمنطقة حائل
 * يعتمد على Leaflet و OpenStreetMap
 */

export const GeoEngine = {
    map: null,
    marker: null,

    // تهيئة الخريطة داخل عنصر معين
    async initMap(elementId, initialLat = 27.5114, initialLng = 41.7208) {
        // إذا كانت الخريطة موجودة سابقاً، نقوم بحذفها لتجنب التكرار
        if (this.map) {
            this.map.remove();
        }

        // إنشاء خريطة جديدة
        this.map = L.map(elementId).setView([initialLat, initialLng], 14);

        // سحب طبقة الخريطة المجانية من OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap - Tera V12'
        }).addTo(this.map);
        
        // وضع الدبوس القابل للسحب
        this.marker = L.marker([initialLat, initialLng], {
            draggable: true
        }).addTo(this.map);

        // خدعة برمجية لإصلاح حجم الخريطة داخل النافذة المنبثقة
        setTimeout(() => { this.map.invalidateSize(); }, 300);

        return this.map;
    },

    // جلب بيانات العنوان من الإحداثيات (البحث العكسي)
    async getAddressFromCoords(lat, lng) {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`);
            const data = await response.json();
            
            if (data && data.address) {
                const addr = data.address;
                return {
                    fullAddress: data.display_name,
                    district: addr.suburb || addr.neighbourhood || addr.village || "غير محدد",
                    city: addr.city || addr.town || addr.state || "حائل",
                    postalCode: addr.postcode || "",
                    street: addr.road || ""
                };
            }
        } catch (err) {
            console.error("فشل جلب العنوان:", err);
        }
        return null;
    },

    // جلب الإحداثيات من العنوان النصي (عندما تكتب يدوياً في الحقول)
    async getCoordsFromAddress(fullAddress) {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`);
            const data = await response.json();
            if (data && data.length > 0) {
                return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
            }
        } catch (err) {
            console.error("فشل العثور على الإحداثيات:", err);
        }
        return null;
    }
};

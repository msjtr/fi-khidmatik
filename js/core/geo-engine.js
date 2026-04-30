/** 
 * Tera Geo-Engine v1.0
 * نظام الخرائط المستقل - مخصص لمنطقة حائل
 */

export const GeoEngine = {
    map: null,
    marker: null,
    geocoder: null,

    // تهيئة الخريطة داخل عنصر معين
    async initMap(elementId, initialLat = 27.5114, initialLng = 41.7208) {
        this.geocoder = new google.maps.Geocoder();
        const mapOptions = {
            center: { lat: initialLat, lng: initialLng },
            zoom: 13,
            styles: this.getModernStyle(), // نمط نظيف متوافق مع UI تيرا
            disableDefaultUI: false,
        };

        this.map = new google.maps.Map(document.getElementById(elementId), mapOptions);
        
        this.marker = new google.maps.Marker({
            position: { lat: initialLat, lng: initialLng },
            map: this.map,
            draggable: true,
            animation: google.maps.Animation.DROP
        });

        return this.map;
    },

    // جلب بيانات العنوان من الإحداثيات
    async getAddressFromCoords(lat, lng) {
        return new Promise((resolve) => {
            this.geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === "OK" && results[0]) {
                    const components = results[0].address_components;
                    resolve({
                        fullAddress: results[0].formatted_address,
                        district: this.extractComponent(components, "sublocality") || "غير محدد",
                        city: this.extractComponent(components, "locality") || "حائل",
                        postalCode: this.extractComponent(components, "postal_code") || ""
                    });
                }
            });
        });
    },

    extractComponent(components, type) {
        const item = components.find(c => c.types.includes(type));
        return item ? item.long_name : null;
    },

    getModernStyle() {
        return [{ "featureType": "poi", "stylers": [{ "visibility": "off" }] }];
    }
};

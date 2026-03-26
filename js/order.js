function checkout() {

    if (!window.cart || window.cart.length === 0) {
        alert('❌ السلة فارغة');
        return;
    }

    let name = document.getElementById('name').value.trim();
    let phone = document.getElementById('phone').value.trim();

    if (!name || !phone) {
        alert('❌ يرجى إدخال اسم العميل ورقم الجوال');
        return;
    }

    function getVal(id) {
        let el = document.getElementById(id);
        return el ? el.value.trim() : '';
    }

    let safeCart = window.cart.map(item => ({
        code: item.code || '',
        name: item.name || '',
        desc: item.desc || '',
        price: parseFloat(item.price) || 0,
        qty: parseInt(item.qty) || 1,
        discount: parseFloat(item.discount) || 0,
        image: item.image || '',
        barcode: item.barcode || ''
    }));

    let order = {
        orderNumber: getVal('order_number_manual') || 'FK-0000',
        date: getVal('order_date') || new Date().toISOString().split('T')[0],
        customer: name,
        phone: phone,
        email: getVal('email'),
        city: getVal('city'),
        district: getVal('district'),
        street: getVal('street'),
        building: getVal('building'),
        extra: getVal('extra'),
        postal: getVal('postal'),
        cart: safeCart,
        payment: getVal('payment'),
        tamaraAuth: getVal('payment') === 'تمارا' ? getVal('tamara_auth') : '',
        shipping: getVal('shipping')
    };

    // حفظ محلي
    localStorage.setItem('currentOrder', JSON.stringify(order));

    // 🔥 حفظ في Firebase
    db.collection("orders").add(order)
        .then(() => {
            console.log("✅ تم حفظ الطلب");
            window.location.href = 'invoice.html';
        })
        .catch((error) => {
            console.error("❌ خطأ:", error);
            window.location.href = 'invoice.html';
        });
}

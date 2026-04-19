البيانات المطلوبة من العميل:

يتم جلبها من customers:

name
phone
email
city
district
street
buildingNo
additionalNo
poBox
country

📌 ملاحظة مهمة:
لا تعتمد على shippingAddress فقط
لازم يكون فيه:

fallback:
إذا موجود في order → استخدمه
إذا ناقص → كمله من customer

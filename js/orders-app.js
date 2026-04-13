function renderOrdersTable(data) {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    // حالة عدم وجود بيانات (تنسيق أنيق بدلاً من جدول فارغ)
    if (!data || data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="p-20 text-center">
                    <div class="text-slate-300 mb-2"><i class="fas fa-box-open text-5xl"></i></div>
                    <p class="text-slate-400 font-bold text-lg">لا توجد طلبات مسجلة في هذا النظام</p>
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = data.map(o => {
        // 1. معالجة الاسم (تم دمجها في سطر واحد مختصر)
        const name = o.customerSnapshot?.name || o.customerName || o.clientName || "عميل غير معرف";

        // 2. معالجة الإجمالي (استخدام صيغة Number لضمان ظهور رقمين عشريين)
        const rawTotal = o.totals?.total || o.total || 0;
        const finalTotal = parseFloat(rawTotal).toFixed(2);

        // 3. معالجة الوقت والتاريخ
        const date = o.orderDate || "---";
        const time = o.orderTime || "";

        // 4. رقم الطلب (إبرازه بشكل أفضل)
        const orderId = o.orderNumber || (o.id ? o.id.slice(0, 8) : "---");

        return `
            <tr class="border-b border-slate-50 hover:bg-blue-50/40 transition-all duration-200 group">
                <td class="p-4 font-bold text-blue-700 text-xs">
                    <span class="bg-blue-50 px-2 py-1 rounded-lg">#${orderId}</span>
                </td>
                <td class="p-4">
                    <div class="font-bold text-slate-700">${name}</div>
                    <div class="text-[10px] text-slate-400 md:hidden">${date}</div>
                </td>
                <td class="p-4 text-slate-500 text-[11px] hidden md:table-cell">
                    <div class="flex items-center gap-2">
                        <i class="far fa-calendar-alt opacity-30"></i> ${date}
                    </div>
                    <div class="flex items-center gap-2 mt-1 opacity-50">
                        <i class="far fa-clock opacity-30"></i> ${time}
                    </div>
                </td>
                <td class="p-4">
                    <div class="font-black text-slate-800 text-left md:text-right">${finalTotal} <span class="text-[10px] font-normal">ر.س</span></div>
                </td>
                <td class="p-4 text-center">
                    <button onclick="window.open('../../print.html?id=${o.id}', '_blank')" 
                            class="bg-white text-blue-600 p-2 px-5 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100 group-hover:shadow-md active:scale-95">
                        <i class="fas fa-print ml-1 text-sm"></i> عرض
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function renderOrdersTable(data) {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    // 1. معالجة حالة الجدول الفارغ
    if (!data || data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="p-20 text-center animate-fade-in">
                    <div class="text-slate-200 mb-3"><i class="fas fa-box-open text-6xl"></i></div>
                    <p class="text-slate-400 font-bold text-lg">لا توجد طلبات مسجلة في هذا القسم</p>
                    <p class="text-slate-300 text-sm">تأكد من اختيار النظام الصحيح من الأعلى</p>
                </td>
            </tr>`;
        return;
    }

    // 2. بناء صفوف الجدول
    tbody.innerHTML = data.map(o => {
        // معالجة الاسم مع دعم كافة الحقول الممكنة في قاعدة بياناتك
        const rawName = o.customerSnapshot?.name || o.customerName || o.clientName || "عميل غير معرف";
        const name = rawName.trim();

        // معالجة الإجمالي لضمان عدم حدوث خطأ NaN
        const rawTotal = o.totals?.total || o.total || 0;
        const finalTotal = (!isNaN(parseFloat(rawTotal)) ? parseFloat(rawTotal) : 0).toFixed(2);

        // الوقت والتاريخ ورقم الطلب
        const date = o.orderDate || "---";
        const time = o.orderTime || "";
        const orderId = o.orderNumber || (o.id ? o.id.slice(0, 8) : "---");

        return `
            <tr class="border-b border-slate-50 hover:bg-blue-50/40 transition-all duration-200 group">
                <td class="p-4 font-bold text-blue-700 text-xs">
                    <span class="bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm">
                        #${orderId}
                    </span>
                </td>

                <td class="p-4">
                    <div class="font-bold text-slate-700 group-hover:text-blue-900 transition-colors">${name}</div>
                    <div class="text-[10px] text-slate-400 md:hidden mt-1"><i class="far fa-calendar ml-1"></i>${date}</div>
                </td>

                <td class="p-4 text-slate-500 text-[11px] hidden md:table-cell">
                    <div class="flex items-center gap-2">
                        <i class="far fa-calendar-alt text-blue-300"></i> ${date}
                    </div>
                    <div class="flex items-center gap-2 mt-1.5 opacity-60">
                        <i class="far fa-clock text-slate-400"></i> ${time}
                    </div>
                </td>

                <td class="p-4">
                    <div class="font-black text-slate-800 text-left md:text-right text-lg">
                        ${finalTotal} <span class="text-[10px] font-medium text-slate-400">ر.س</span>
                    </div>
                </td>

                <td class="p-4 text-center">
                    <button onclick="window.open('../../print.html?id=${o.id}', '_blank')" 
                            class="bg-white text-blue-600 p-2 px-5 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100 group-hover:shadow-md active:scale-95 flex items-center gap-2 mx-auto">
                        <i class="fas fa-print text-sm"></i>
                        <span class="font-bold">عرض الفاتورة</span>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

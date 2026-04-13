function renderOrdersTable(data) {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    tbody.innerHTML = data.map(o => {
        // 1. معالجة اسم العميل (جديد أو قديم)
        const name = o.customerSnapshot?.name || o.customerName || o.clientName || "---";

        // 2. معالجة الإجمالي (جديد أو قديم)
        // يبحث عن totals.total أولاً، إذا لم يجدها يبحث عن total مباشرة
        let finalTotal = "0.00";
        if (o.totals && o.totals.total) {
            finalTotal = o.totals.total;
        } else if (o.total) {
            finalTotal = o.total;
        }

        // 3. معالجة التاريخ والوقت
        const date = o.orderDate || "---";
        const time = o.orderTime || "";

        return `
            <tr class="border-b hover:bg-blue-50/30 transition">
                <td class="p-4 font-bold text-blue-700 text-xs">${o.orderNumber || o.id.slice(0,8)}</td>
                <td class="p-4 font-medium text-slate-700">${name}</td>
                <td class="p-4 text-slate-500 text-[11px]">
                    ${date} <span class="block opacity-40">${time}</span>
                </td>
                <td class="p-4 font-black text-slate-800">${finalTotal} ر.س</td>
                <td class="p-4 text-center">
                    <button onclick="window.open('../../print.html?id=${o.id}', '_blank')" 
                            class="bg-white text-blue-600 p-2 px-4 rounded-xl hover:bg-blue-600 hover:text-white transition shadow-sm border border-blue-200">
                        <i class="fas fa-print ml-1"></i> عرض الفاتورة
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

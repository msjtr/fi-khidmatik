export const UI = {
    // ... (renderMainLayout تبقى كما هي)

    renderCustomerRow: (id, data) => `
        <tr class="customer-row-fade">
            <td>
                <div class="user-profile-cell">
                    <div class="avatar-box">${(data.name || 'C').charAt(0)}</div>
                    <div class="user-meta">
                        <span class="user-name">${data.name || 'عميل غير معروف'}</span>
                        <span class="user-subtext"><i class="fas fa-envelope"></i> ${data.email || 'بدون بريد'}</span>
                    </div>
                </div>
            </td>
            <td>
                <div class="contact-info">
                    <div style="font-weight: 700; color: var(--tera-dark);">${data.phone || '-'}</div>
                    <div class="user-subtext">انضم: ${data.createdAt ? new Date(data.createdAt).toLocaleDateString('ar-SA') : '-'}</div>
                </div>
            </td>
            <td>
                <div class="user-meta">
                    <span class="user-name" style="font-size: 0.85rem;">${data.city || 'حائل'}</span>
                    <span class="user-subtext">${data.district || 'الحي غير مسجل'}</span>
                </div>
            </td>
            <td>
                <span class="badge-tera ${data.tag === 'vip' ? 'vip' : 'standard'}">
                    ${data.tag === 'vip' ? 'عضو VIP' : 'عادي'}
                </span>
            </td>
            <td>
                <div class="action-dock">
                    <button onclick="previewPrint('${id}')" class="btn-icon print"><i class="fas fa-print"></i></button>
                    <button onclick="editCustomer('${id}')" class="btn-icon edit"><i class="fas fa-pen-to-square"></i></button>
                </div>
            </td>
        </tr>
    `
};

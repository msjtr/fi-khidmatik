/**
 * Tera Gateway - Customers UI Module
 * Version: 12.12.6
 * Description: التحكم في واجهة المستخدم لقاعدة العملاء والتعامل مع النوافذ المنبثقة
 * المطور: محمد بن صالح الشمري
 */

import { db } from '../core/config.js';

class CustomersUI {
    constructor() {
        this.modal = document.getElementById('customerModal');
        this.form = document.getElementById('customerForm');
        this.tableBody = document.getElementById('customersList');
        // استخدام رابط خارجي للأفاتار لتجنب أخطاء 404 في GitHub Pages
        this.defaultAvatar = "https://ui-avatars.com/api/?background=f97316&color=fff&bold=true&name=";
        
        this.init();
    }

    init() {
        // تسجيل الوظائف في النطاق العالمي لسهولة الوصول من HTML
        window.openCustomerModal = (id = null) => this.openModal(id);
        window.closeCustomerModal = () => this.closeModal();
        window.handleCustomerSubmit = (e) => this.handleSubmit(e);
        window.filterCustomers = () => this.handleSearch();
        window.deleteCustomer = (id) => this.confirmDelete(id);

        // تحميل البيانات الأولية
        this.loadCustomers();
    }

    // --- إدارة النافذة المنبثقة (Modal) ---
    
    async openModal(customerId = null) {
        if (!this.modal) return;

        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; 
        
        if (customerId && typeof customerId === 'string') {
            await this.prepareEditMode(customerId);
        } else {
            this.form.reset();
            this.form.dataset.mode = 'add';
            delete this.form.dataset.editId;
            
            // تعيين صورة افتراضية نظيفة للمعاينة
            const preview = document.getElementById('imagePreview');
            if (preview) {
                preview.style.backgroundImage = `url('${this.defaultAvatar}New+User')`;
            }
        }
    }

    closeModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            this.form.reset();
        }
    }

    // --- التعامل مع البيانات (CRUD) ---

    async loadCustomers() {
        try {
            this.tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center; padding: 20px;">
                        <i class="fas fa-spinner fa-spin"></i> جاري تحميل بيانات العملاء من تيرا...
                    </td>
                </tr>`;
            
            // جلب البيانات مع ترتيبها حسب التاريخ الأحدث
            const snapshot = await db.collection('customers').orderBy('createdAt', 'desc').get();
            const customers = [];
            snapshot.forEach(doc => customers.push({ id: doc.id, ...doc.data() }));
            
            this.renderTable(customers);
        } catch (error) {
            console.error("Error loading customers:", error);
            this.tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red;">خطأ في الاتصال: ${error.message}</td></tr>`;
        }
    }

    renderTable(customers) {
        if (customers.length === 0) {
            this.tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center">لا يوجد عملاء في قاعدة بيانات حائل حالياً.</td></tr>';
            return;
        }

        this.tableBody.innerHTML = customers.map(cust => {
            const date = cust.createdAt ? new Date(cust.createdAt.seconds * 1000).toLocaleDateString('ar-SA') : '-';
            const avatarUrl = `${this.defaultAvatar}${encodeURIComponent(cust.name || 'User')}`;

            return `
            <tr class="animate-row">
                <td>
                    <div class="user-info">
                        <div class="avatar-circle" style="background-image: url('${avatarUrl}'); background-size: cover; border: 1px solid #ddd;">
                        </div>
                        <div class="name-details">
                            <strong>${cust.name || 'بدون اسم'}</strong>
                            <small>${cust.type === 'vip' ? '💎 عميل VIP' : 'فرد'}</small>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="contact-col">
                        <span><i class="fas fa-phone"></i> ${cust.phone || '-'}</span>
                        <small>${cust.email || 'بدون بريد'}</small>
                    </div>
                </td>
                <td>
                    <div class="address-col">
                        <span>${cust.district || 'حائل'}</span>
                        <small>${cust.street || '-'}</small>
                    </div>
                </td>
                <td>${date}</td>
                <td><span class="badge-type">${cust.type || 'عادي'}</span></td>
                <td><span class="status-pill active">نشط</span></td>
                <td>
                    <div class="action-btns">
                        <button onclick="openCustomerModal('${cust.id}')" class="edit-btn" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteCustomer('${cust.id}')" class="delete-btn" title="حذف">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
        }).join('');
    }

    async handleSubmit(e) {
        e.preventDefault();
        const btn = this.form.querySelector('.btn-save');
        const formData = new FormData(this.form);
        
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
        }

        const customerData = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            type: formData.get('type'),
            district: formData.get('district'),
            street: formData.get('street'),
            building: formData.get('building'),
            zip: formData.get('zip'),
            updatedAt: new Date()
        };

        try {
            if (this.form.dataset.mode === 'edit') {
                await db.collection('customers').doc(this.form.dataset.editId).update(customerData);
            } else {
                await db.collection('customers').add({
                    ...customerData,
                    createdAt: new Date()
                });
            }
            
            this.closeModal();
            await this.loadCustomers(); 
        } catch (error) {
            alert("حدث خطأ في منصة تيرا: " + error.message);
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerText = 'حفظ البيانات';
            }
        }
    }

    async prepareEditMode(id) {
        try {
            const doc = await db.collection('customers').doc(id).get();
            if (doc.exists) {
                const data = doc.data();
                this.form.dataset.mode = 'edit';
                this.form.dataset.editId = id;
                
                // تعبئة الحقول ديناميكياً
                Object.keys(data).forEach(key => {
                    const input = this.form.querySelector(`[name="${key}"]`);
                    if (input) input.value = data[key];
                });

                const preview = document.getElementById('imagePreview');
                if (preview) {
                    preview.style.backgroundImage = `url('${this.defaultAvatar}${encodeURIComponent(data.name)}')`;
                }
            }
        } catch (error) {
            console.error("Error fetching customer:", error);
        }
    }

    handleSearch() {
        const input = document.getElementById('customerSearch')?.value.toLowerCase() || '';
        const rows = this.tableBody.getElementsByTagName('tr');

        Array.from(rows).forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(input) ? '' : 'none';
        });
    }

    async confirmDelete(id) {
        if (confirm("تنبيه أبا صالح: هل أنت متأكد من حذف هذا العميل نهائياً؟")) {
            try {
                await db.collection('customers').doc(id).delete();
                await this.loadCustomers();
            } catch (error) {
                alert("فشل الحذف: " + error.message);
            }
        }
    }
}

// تشغيل الموديول عند جاهزية الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.CustomersModule = new CustomersUI();
});

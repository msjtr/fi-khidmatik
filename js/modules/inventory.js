/**
 * js/modules/inventory.js
 * موديول إدارة المخزون
 */

import { db } from '../core/firebase.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

export async function initInventory(container) {
    if (!container) return;
    
    const products = await loadInventory();
    
    container.innerHTML = `
        <div style="padding: 25px;">
            <h2><i class="fas fa-warehouse" style="color: #e67e22;"></i> إدارة المخزون</h2>
            <div style="background: white; border-radius: 12px; overflow: hidden; margin-top: 20px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead style="background: #f8f9fa;">
                        <tr>
                            <th style="padding: 12px; text-align: right;">المنتج</th>
                            <th style="padding: 12px; text-align: center;">الكمية</th>
                            <th style="padding: 12px; text-align: center;">القيمة</th>
                            <th style="padding: 12px; text-align: center;">الحالة</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map(p => `
                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td style="padding: 12px;">${p.name}</td>
                                <td style="padding: 12px; text-align: center;">${p.stock}</td>
                                <td style="padding: 12px; text-align: center;">${(p.cost * p.stock).toFixed(2)} ر.س</td>
                                <td style="padding: 12px; text-align: center;">
                                    <span style="padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; background: ${p.stock <= 5 ? '#f8d7da' : '#d4edda'}; color: ${p.stock <= 5 ? '#721c24' : '#155724'}">
                                        ${p.stock <= 5 ? (p.stock <= 0 ? 'نفد' : 'قليل') : 'متوفر'}
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

async function loadInventory() {
    try {
        const snap = await getDocs(collection(db, "products"));
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error loading inventory:", error);
        return [];
    }
}

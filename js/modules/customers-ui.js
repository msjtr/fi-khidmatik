/**
 * customers-ui.js - الملف الرئيسي (يعتمد على core)
 */
import { loadAndDisplayCustomers } from './customers-core.js';

console.log('✅ customers-ui.js تم تحميله');

export async function initCustomers(container) {
    console.log('initCustomers بدأت');
    return loadAndDisplayCustomers(container);
}

export default { initCustomers };

/**
 * customers-ui.js - الملف الرئيسي (يعتمد على core)
 */
import { initCustomers as coreInitCustomers } from './customers-core.js';

console.log('✅ customers-ui.js تم تحميله');

export async function initCustomers(container) {
    console.log('initCustomers بدأت');
    return coreInitCustomers(container);
}

export default { initCustomers };

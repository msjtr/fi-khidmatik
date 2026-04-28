/**
 * js/core/config.js
 */
import { db, auth, firebase } from './firebase.js';

export const APP_CONFIG = {
    name: 'Tera Gateway',
    version: '2.0.2',
    company: 'Tera Gateway',
    debug: true
};

export const FIREBASE_CONFIG = {
    collections: {
        products: 'products',
        orders: 'orders',
        customers: 'customers'
    }
};

export function getAllConfig() {
    return { app: APP_CONFIG, firebase: FIREBASE_CONFIG };
}

export { db, auth, firebase };

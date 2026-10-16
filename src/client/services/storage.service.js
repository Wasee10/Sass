/**
 * Client Storage Service
 * Handles package selection and custom invoice caching in browser storage.
 */

const PACKAGE_KEY = 'stratum_chosen_package';
const INVOICES_KEY = 'stratum_custom_invoices';

export function saveChosenPackage(packageData) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PACKAGE_KEY, JSON.stringify(packageData));
    if (packageData.id) {
      document.cookie = `stratum_chosen_plan=${packageData.id}; path=/; max-age=2592000; SameSite=Lax`;
    }
    if (packageData.interval) {
      document.cookie = `stratum_chosen_interval=${packageData.interval}; path=/; max-age=2592000; SameSite=Lax`;
    }
  } catch (e) {
    console.warn('Storage service write error:', e);
  }
}

export function getChosenPackage() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PACKAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function saveCustomInvoice(invoiceRecord) {
  if (typeof window === 'undefined') return;
  try {
    const existing = JSON.parse(localStorage.getItem(INVOICES_KEY) || '[]');
    if (!existing.some((i) => i.id === invoiceRecord.id)) {
      localStorage.setItem(INVOICES_KEY, JSON.stringify([invoiceRecord, ...existing]));
    }
  } catch (e) {
    console.warn('Storage invoice save error:', e);
  }
}

export function getCustomInvoices() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(INVOICES_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

export default {
  saveChosenPackage,
  getChosenPackage,
  saveCustomInvoice,
  getCustomInvoices,
};

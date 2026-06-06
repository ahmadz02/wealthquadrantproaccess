// Wealth Quadrant Pro Access - shared client storage utility
const WQP_CLIENT_LIST_KEY = 'wq_client_onboard_list_v1';
const WQP_CLIENT_FILE_KEY = 'wq_client_files_v1';

function normalizeEmail(email) { return String(email || '').trim().toLowerCase(); }
function loadJson(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
function saveJson(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

window.WQPStore = {
  getClientList() { return loadJson(WQP_CLIENT_LIST_KEY, []); },
  getClientByEmail(email) {
    const target = normalizeEmail(email);
    return this.getClientList().find(c => normalizeEmail(c.email) === target) || null;
  },
  getClientFile(email) {
    const target = normalizeEmail(email);
    const files = loadJson(WQP_CLIENT_FILE_KEY, {});
    return files[target] || null;
  },
  upsertClientFile(email, patch) {
    const target = normalizeEmail(email);
    if (!target) throw new Error('Client email is required.');
    const files = loadJson(WQP_CLIENT_FILE_KEY, {});
    files[target] = { ...(files[target] || {}), email: target, updatedAt: new Date().toISOString(), ...patch };
    saveJson(WQP_CLIENT_FILE_KEY, files);
    return files[target];
  },
  saveModule(email, moduleName, moduleData) {
    const current = this.getClientFile(email) || { email: normalizeEmail(email), modules: {} };
    current.modules = current.modules || {};
    current.modules[moduleName] = { data: moduleData, updatedAt: new Date().toISOString() };
    return this.upsertClientFile(email, current);
  }
};

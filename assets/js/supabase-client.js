/* Wealth Quadrant Pro Access - Supabase Client
   Replace the placeholder values below after creating your Supabase project. */
window.WQP_SUPABASE_CONFIG = window.WQP_SUPABASE_CONFIG || {
  url: 'https://emyipgsageqnecxqiywa.supabase.co',
  anonKey: 'sb_publishable_x5uhcaJ2_mY5sX6k6XFgjQ_uttmiu78'
};

window.WQPAuth = window.WQPAuth || {};
window.WQPAuth.isConfigured = function () {
  const cfg = window.WQP_SUPABASE_CONFIG || {};
  return Boolean(cfg.url && cfg.anonKey && !cfg.url.includes('YOUR_') && !cfg.anonKey.includes('YOUR_'));
};

window.WQPAuth.getRootPath = function () {
  const path = window.location.pathname;
  if (path.includes('/pages/modules/')) return '../../';
  if (path.includes('/pages/')) return '../';
  return './';
};

if (window.supabase && window.WQPAuth.isConfigured()) {
  window.supabaseClient = window.supabase.createClient(
    window.WQP_SUPABASE_CONFIG.url,
    window.WQP_SUPABASE_CONFIG.anonKey
  );
}

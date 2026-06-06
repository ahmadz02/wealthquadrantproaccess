/* Wealth Quadrant Pro Access - Supabase Data Store
   Central save/load layer for clients and module data. */
(function () {
  window.WQPStore = window.WQPStore || {};

  function getClient() {
    if (!window.supabaseClient) {
      throw new Error('Supabase client is not configured. Check assets/js/supabase-client.js');
    }
    return window.supabaseClient;
  }

  function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
  }

  async function getCurrentUserId() {
    const supabase = getClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data && data.user ? data.user.id : null;
  }

  async function listClients() {
    const supabase = getClient();
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async function getClientByEmail(email) {
    const supabase = getClient();
    const clientEmail = normalizeEmail(email);
    if (!clientEmail) return null;
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('client_email', clientEmail)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  }

  async function upsertClient(client) {
    const supabase = getClient();
    const clientEmail = normalizeEmail(client.client_email || client.email);
    if (!clientEmail) throw new Error('Client email is required.');

    const payload = {
      client_name: String(client.client_name || client.name || '').trim() || 'Unnamed Client',
      client_email: clientEmail,
      phone: String(client.phone || '').trim(),
      onboard_date: client.onboard_date || client.onboardDate || new Date().toISOString().slice(0, 10),
      updated_at: new Date().toISOString()
    };

    const userId = await getCurrentUserId();
    if (userId) payload.created_by = userId;

    const { data, error } = await supabase
      .from('clients')
      .upsert(payload, { onConflict: 'client_email' })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async function saveModule(clientEmail, moduleName, moduleData) {
    const supabase = getClient();
    const email = normalizeEmail(clientEmail);
    if (!email) throw new Error('Client email is required before saving module data.');
    if (!moduleName) throw new Error('Module name is required.');

    let client = await getClientByEmail(email);
    if (!client) {
      client = await upsertClient({ client_email: email, client_name: email });
    }

    const payload = {
      client_id: client.id,
      module_name: moduleName,
      module_data: moduleData || {},
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('client_modules')
      .upsert(payload, { onConflict: 'client_id,module_name' })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async function loadModule(clientEmail, moduleName) {
    const supabase = getClient();
    const client = await getClientByEmail(clientEmail);
    if (!client) return null;
    const { data, error } = await supabase
      .from('client_modules')
      .select('module_data, updated_at')
      .eq('client_id', client.id)
      .eq('module_name', moduleName)
      .maybeSingle();
    if (error) throw error;
    return data ? data.module_data : null;
  }

  function getClientEmailFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return normalizeEmail(params.get('clientEmail') || params.get('client') || '');
  }

  window.WQPStore = {
    normalizeEmail,
    listClients,
    getClientByEmail,
    upsertClient,
    saveModule,
    loadModule,
    getClientEmailFromUrl
  };
})();

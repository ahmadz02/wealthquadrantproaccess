(async function () {
  const root = window.WQPAuth ? window.WQPAuth.getRootPath() : './';

  function redirect(reason) {
    const target = root + 'login.html' + (reason ? '?reason=' + encodeURIComponent(reason) : '');
    window.location.replace(target);
  }

  if (!window.WQPAuth || !window.WQPAuth.isConfigured() || !window.supabaseClient) {
    redirect('supabase_not_configured');
    return;
  }

  const { data: userResult, error: userError } = await window.supabaseClient.auth.getUser();
  if (userError || !userResult.user) {
    redirect('login_required');
    return;
  }

  const { data: profile, error: profileError } = await window.supabaseClient
    .from('profiles')
    .select('role, approved')
    .eq('id', userResult.user.id)
    .single();

  if (profileError || !profile) {
    await window.supabaseClient.auth.signOut();
    redirect('profile_missing');
    return;
  }

  if (profile.role !== 'superadmin' || profile.approved !== true) {
    await window.supabaseClient.auth.signOut();
    redirect('not_approved');
  }
})();

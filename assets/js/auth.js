(function () {
  function bootAuth() {
    const msgBox = document.getElementById('authMessage');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const logoutBtn = document.getElementById('logoutBtn');

    function showMessage(type, text) {
      if (!msgBox) return;
      msgBox.className = 'auth-msg show ' + type;
      msgBox.textContent = text;
    }

    function showConfigWarning() {
      const warning = document.getElementById('configWarning');
      if (warning && window.WQPAuth && !window.WQPAuth.isConfigured()) {
        warning.style.display = 'block';
      }
    }

    async function routeAfterLogin() {
      if (!window.supabaseClient || !window.WQPAuth) {
        showMessage('error', 'Supabase is not configured yet. Update assets/js/supabase-client.js.');
        return;
      }

      const root = window.WQPAuth.getRootPath();
      const { data: userResult, error: userError } = await window.supabaseClient.auth.getUser();
      if (userError || !userResult.user) {
        showMessage('error', 'Unable to verify user session. Please login again.');
        return;
      }

      const { data: profile, error: profileError } = await window.supabaseClient
        .from('profiles')
        .select('role, approved')
        .eq('id', userResult.user.id)
        .single();

      if (profileError || !profile) {
        showMessage('error', 'Profile not found. Please complete Supabase profile setup.');
        return;
      }

      if (profile.role !== 'superadmin' || profile.approved !== true) {
        showMessage('info', 'Your account exists but is not approved as Superadmin yet.');
        return;
      }

      window.location.href = root + 'pages/onboarding.html';
    }

    async function checkExistingSession() {
      if (!window.supabaseClient) return;
      const { data } = await window.supabaseClient.auth.getSession();
      if (data && data.session && location.pathname.endsWith('/login.html')) {
        await routeAfterLogin();
      }
    }

    if (loginForm) {
      loginForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        if (!window.supabaseClient) {
          showMessage('error', 'Supabase is not configured yet. Update assets/js/supabase-client.js.');
          return;
        }
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        showMessage('info', 'Signing in...');
        const { error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
        if (error) {
          showMessage('error', error.message);
          return;
        }
        await routeAfterLogin();
      });
    }

    if (registerForm) {
      registerForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        if (!window.supabaseClient) {
          showMessage('error', 'Supabase is not configured yet. Update assets/js/supabase-client.js.');
          return;
        }
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        if (password !== confirmPassword) {
          showMessage('error', 'Passwords do not match.');
          return;
        }
        showMessage('info', 'Creating account...');
        const redirectTo = window.location.origin + window.WQPAuth.getRootPath().replace('./', '/') + 'auth-callback.html';
        const { error } = await window.supabaseClient.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectTo }
        });
        if (error) {
          showMessage('error', error.message);
          return;
        }
        showMessage('success', 'Registration submitted. Please check your email to confirm your account. The first user will be auto-approved as Superadmin.');
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', async function () {
        if (window.supabaseClient) await window.supabaseClient.auth.signOut();
        window.location.href = window.WQPAuth.getRootPath() + 'login.html';
      });
    }

    showConfigWarning();
    checkExistingSession();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootAuth);
  } else {
    bootAuth();
  }
})();

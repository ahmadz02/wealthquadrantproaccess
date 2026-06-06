# Wealth Quadrant Pro Access - Modular Structure

This folder reorganizes the uploaded standalone HTML files into a modular project structure.

## Start here

Open:

```text
index.html
```

or directly:

```text
pages/onboarding.html
```

## Current flow included

```text
Onboarding -> Dashboard -> Planning Modules
```

The onboarding arrow now routes to:

```text
pages/dashboard.html?clientEmail=<client-email>
```

Dashboard cards now route to files inside:

```text
pages/modules/
```

## Phase 1 storage

Phase 1 still uses browser localStorage. Supabase is intentionally not required yet.

Shared placeholder utilities are in:

```text
assets/js/client-store.js
assets/js/router.js
assets/js/form-utils.js
assets/js/print-utils.js
```

## Recommended next refactor

1. Move repeated inline CSS into `assets/css/styles.css` and split later into variables/layout/components/forms/print.
2. Move each page's calculation logic into `assets/js/calculations/`.
3. Standardize every module save button to call `WQPStore.saveModule(clientEmail, moduleName, data)`.
4. Add Supabase only after local save/load and page routing are stable.


## Supabase Auth Setup Added

This package now includes a login-first flow for Vercel deployment:

- `index.html` redirects to `login.html`
- `login.html` handles Superadmin login
- `register.html` handles Superadmin registration
- `auth-callback.html` handles email confirmation callback routing
- `assets/js/supabase-client.js` stores the Supabase Project URL and anon key placeholders
- `assets/js/auth.js` handles login, registration and logout
- `assets/js/auth-guard.js` protects onboarding, dashboard and module pages
- `supabase-schema.sql` contains the required Supabase tables, trigger and RLS policies

### Before Deployment

1. Create a Supabase project.
2. Run `supabase-schema.sql` in Supabase SQL Editor.
3. In `assets/js/supabase-client.js`, replace:

```js
url: 'YOUR_SUPABASE_PROJECT_URL',
anonKey: 'YOUR_SUPABASE_ANON_KEY'
```

4. In Supabase Auth settings, add your Vercel URL to allowed redirect URLs.
5. Deploy the folder to Vercel.

The first registered user is auto-approved as `superadmin`. Later registered users are created as `approved = false`.

Note: Existing planner data saving is still using localStorage. Supabase data migration should be done in the next phase.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Deploying (Vercel)

Vite inlines `VITE_`-prefixed env vars into the JS bundle **at build time**,
not at runtime. On Vercel:

1. Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and the Cloudinary
   `VITE_` vars in Project Settings → Environment Variables — for every
   environment you deploy (Production/Preview), before triggering a build.
   Adding them after a build won't affect that build's output; redeploy.
2. Never add `SUPABASE_SERVICE_ROLE_KEY` (or any non-`VITE_` secret) to a
   Vercel environment that a client-side build reads from — it must only
   be used from a trusted server context (e.g. a Vercel serverless/edge
   function), never imported into `src/`.
3. `vercel.json` already rewrites all paths to `/index.html`, so deep links
   like `/admin` and `/admin/login` work on refresh/direct visit, not just
   client-side navigation.
4. Supabase session persistence uses the browser's `localStorage`, so
   signed-in sessions survive refreshes and reopening the tab identically
   on Vercel and localhost — it isn't tied to the hosting environment.
5. Admin accounts and access are managed entirely in Supabase (see
   `supabase/README.md`) — nothing admin-related needs Vercel-specific
   configuration.


If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

# Database

Schema lives in `migrations/20260814120000_init_cms_schema.sql`.

## Apply it

```bash
supabase link --project-ref <project-ref>
supabase db push
```

Or paste the file into the Supabase SQL Editor and run it once.

## Create the first admin

Admins are plain Supabase Auth users — there's no separate password table.
1. Create the user: Supabase Dashboard → Authentication → Users → Add user
   (or have them sign up normally).
2. Grant admin access by inserting their `auth.users.id` into `admin_users`,
   using the SQL Editor (service role) — **never** from the app/browser:

   ```sql
   insert into public.admin_users (id)
   values ('<the-user-uuid>');
   ```

Removing that row revokes admin access immediately; it does not delete the
auth user.

## Regenerate TypeScript types

Once the migration is applied to a real project:

```bash
supabase gen types typescript --project-id <project-ref> > src/types/database.types.ts
```

This repo currently ships a hand-authored `database.types.ts` that mirrors
the migration exactly, so the app is type-safe before you've connected a
live project.

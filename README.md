# IEEE Beni Suef Registration System — Supabase Edition

This responsive Arabic/RTL single-page app writes registrations to a shared Supabase table and exports centrally stored records to an Excel-compatible CSV file. It has no build step or server dependency.

## 1. Create the database table

1. Create a [Supabase project](https://supabase.com/dashboard), then open **SQL Editor** → **New query**.
2. Run the following SQL exactly once:

```sql
create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  contact_info text not null,
  position text not null check (position in ('EX-High Board', 'EX-Board', 'High Board', 'Board', 'Member', 'Non-Member')),
  assignment text,
  created_at timestamptz not null default now()
);

alter table public.registrations enable row level security;

-- Allows visitors using the public key to register.
create policy "public can submit registrations"
on public.registrations for insert to anon
with check (true);

-- Required only for the in-page CSV button. See the security note below.
create policy "admin page can read registrations"
on public.registrations for select to anon
using (true);
```

The public key belongs in browser applications; never expose a `service_role` or secret key. Enable RLS on exposed tables and create policies/grants that match permitted operations. [Supabase RLS documentation](https://supabase.com/docs/guides/database/postgres/row-level-security)

### Update an existing table

If you created the table from the previous version of this project, run this migration in Supabase's SQL Editor once. It expands the allowed positions and lets `Non-Member` records store a genuine SQL `NULL` assignment.

```sql
alter table public.registrations
  drop constraint if exists registrations_position_check;

alter table public.registrations
  alter column assignment drop not null,
  add constraint registrations_position_check
    check (position in ('EX-High Board', 'EX-Board', 'High Board', 'Board', 'Member', 'Non-Member'));
```

## 2. Add your Supabase credentials

1. In Supabase go to **Project Settings** → **API**.
2. Copy the **Project URL** and the public **anon** key (or publishable key).
3. In [app.js](app.js), replace these placeholders:

```js
const SUPABASE_URL = "PASTE_YOUR_SUPABASE_URL_HERE";
const SUPABASE_ANON_KEY = "PASTE_YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY_HERE";
```

The app loads the official v2 client from `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`, a documented CDN option. [Supabase JavaScript installation](https://supabase.com/docs/reference/javascript/installing)

## 3. Run and test

Open `index.html` directly in a modern browser, or serve the folder locally:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`, submit a record, then choose **عرض التسجيلات / تحميل CSV**. Verify the data in Supabase under **Table Editor** → `registrations`.

## Security note for the export button

The requested direct browser-side export requires a `select` policy for the public browser key. That makes applicants' names/contact details readable to anyone who can load the deployed page. For a public production registration page, do **not** create the `select` policy: keep only the insert policy and export from the Supabase dashboard, or protect a separate admin page with Supabase Auth and an authenticated-only `select` policy.

## Registration hierarchy

- **EX-High Board:** `Season 10`, `Season 9`, or `Season 8`
- **EX-Board**, **Board**, or **Member:** one of the 20 standard committees
- **High Board:** `WIE`, `SIGHT`, `CSC`, `AESS`, or `Branch`
- **Non-Member:** no secondary field; `assignment` is saved as SQL `NULL`

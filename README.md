
# ClassFit Varna - Supabase + Vercel

Professional fitness management platform.

## 🗄️ Database Setup (Supabase)

**CRITICAL: You must run the SQL setup to create the database tables.**

1.  Copy the content of **`supabase_setup.sql`** (found in the project root).
2.  Go to your **Supabase Dashboard** -> **SQL Editor**.
3.  Paste the SQL and click **Run**.

### 🛠️ CRITICAL DATABASE FIX (Run this if you get "column not found" errors)
If you see errors like `Could not find the 'settled_by' column`, run this snippet in your SQL editor:

```sql
-- Add missing financial and settlement columns
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS settled_by TEXT,
ADD COLUMN IF NOT EXISTS settled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS commission_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS trainer_earnings NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';
```

### What does the SQL do?
- Creates the `users` table for authentication and profiles.
- Creates the `bookings` table for appointments.
- Creates the `messages` table for the contact form.
- Sets up Row Level Security (RLS) policies so the app can read/write data.

### Environment Variables
Ensure these are set in your Vercel Project Settings or `.env` file:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 🚀 Vercel Deployment

1.  Push code to GitHub.
2.  Import project into Vercel.
3.  Add the Environment Variables.
4.  Deploy.

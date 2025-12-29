
# ClassFit Varna - Supabase + Vercel

Professional fitness management platform.

## 🗄️ Database Setup (Supabase)

Run the following SQL in your Supabase SQL Editor:

```sql
-- 1. Create Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'user',
  joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Explicitly naming the constraint prevents "does not exist" errors later
  CONSTRAINT users_role_check CHECK (role IN ('user', 'admin', 'trainer_pending', 'trainer'))
);

-- 2. Create Bookings Table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  booking_date DATE NOT NULL,
  booking_time TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_method TEXT CHECK (payment_method IN ('cash', 'card')),
  language TEXT DEFAULT 'bg',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Basic Security Policy (Simple)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON bookings FOR ALL USING (true) WITH CHECK (true);
```

### ⚠️ Troubleshooting: "Constraint does not exist" Error

If you are updating an existing table and get an error like `ERROR: 42704: constraint "users_role_check" does not exist`, it means the rule wasn't named correctly before. Run this **Safe Update Block**:

```sql
-- 1. Safely remove old constraint if it exists
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- 2. Add the new constraint allowing Trainer roles
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('user', 'admin', 'trainer_pending', 'trainer'));

-- 3. Add phone column if missing
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
```

## 🚀 Vercel Deployment

1.  Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your Vercel Project Environment Variables.
2.  Deploy the project.

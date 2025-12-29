
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
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

### ⚠️ Enabling Trainer Sign Up (SQL Update)

If you see an error about `constraint "users_role_check" does not exist`, it means your table doesn't have the named rule yet. Run this command to add the new roles:

```sql
-- Run this in Supabase SQL Editor to allow Trainers to sign up
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin', 'trainer_pending', 'trainer'));
```

*Note: If you get an error that `users_role_check` ALREADY exists, run this pair of commands instead:*

```sql
ALTER TABLE users DROP CONSTRAINT users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin', 'trainer_pending', 'trainer'));
```

## 🚀 Vercel Deployment

1.  Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your Vercel Project Environment Variables.
2.  Deploy the project.

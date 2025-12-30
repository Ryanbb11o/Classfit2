
# ClassFit Varna - Supabase + Vercel

Professional fitness management platform.

## 🗄️ Database Setup (Supabase)

**CRITICAL FIX: Run this SQL to enable Trainer Profiles & Images**

If you see "Failed to update profile", run this in Supabase SQL Editor:

```sql
-- 1. Add missing columns for profile pictures and bios
ALTER TABLE users ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;

-- 2. Update the role check to allow trainers
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('user', 'admin', 'trainer_pending', 'trainer'));

-- 3. Ensure Row Level Security allows updates
DROP POLICY IF EXISTS "Allow public access" ON users;
CREATE POLICY "Allow public access" ON users FOR ALL USING (true) WITH CHECK (true);
```

### ✨ NEW: Messages Table (Contact Form)

Run this to enable the Contact Form and Admin Inbox:

```sql
-- 1. Create Messages Table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new', -- 'new' or 'read'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 3. Allow Public Insert (Everyone can send messages) & Read
CREATE POLICY "Allow public access messages" ON messages FOR ALL USING (true) WITH CHECK (true);
```

### Initial Setup (If starting from scratch)

```sql
-- 1. Create Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'user',
  image TEXT,
  bio TEXT,
  joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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

-- 3. Basic Security Policy
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON bookings FOR ALL USING (true) WITH CHECK (true);
```

## 🚀 Vercel Deployment

1.  Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your Vercel Project Environment Variables.
2.  Deploy the project.

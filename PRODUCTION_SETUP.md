# Production Deployment Instructions

**Production URL:** https://healthypublicspaces.com

## 🔧 Environment Variables

The app reads its config from a single **`.env`** file (gitignored, loaded automatically by Next.js).

### 1. Supabase Configuration (new-style API keys)
```env
NEXT_PUBLIC_SUPABASE_URL="https://kizvpsgapqhxlhukgsdm.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_fGcOt0fNmknygDVYQF6AXw_I4mo95b8"
SUPABASE_SERVICE_ROLE_KEY="sb_secret_... (get from dashboard, keep secret)"
```

> This project uses Supabase's new-style keys. The **publishable** key acts as the
> anon/public key for the client; the **secret** key replaces the legacy service_role
> key. Both are stored under the existing `NEXT_PUBLIC_SUPABASE_ANON_KEY` /
> `SUPABASE_SERVICE_ROLE_KEY` variable names the code reads.
>
> The app talks to Supabase only through `@supabase/supabase-js` — there is **no**
> direct Postgres connection, so no `DATABASE_URL` is needed.

### 2. App Configuration
```env
NEXT_PUBLIC_APP_URL="https://healthypublicspaces.com"
NODE_ENV=production
PORT=3000
```

## 🔍 Getting Supabase Keys

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select the project: `kizvpsgapqhxlhukgsdm`
3. Go to **Settings** > **API Keys**
4. Copy:
   - publishable key (`sb_publishable_...`) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - secret key (`sb_secret_...`) → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **Keep secret!**

## 🖥️ Node version

This project requires **Node 26**. On the Plesk server (which uses `nodenv`), set the
Node.js version to 26 in the Plesk Node.js panel; `.node-version` pins it to `26`.
If `npm install` fails with `nodenv: node: command not found`, the Node version has
not been selected for the domain.

## 🚀 Deployment Steps

### Option 1: Use the setup script (recommended)
1. Upload code to the server
2. Run the automated setup script:
   ```bash
   chmod +x setup-production-env.sh
   ./setup-production-env.sh
   ```
3. Edit `.env` to add the real `SUPABASE_SERVICE_ROLE_KEY` from the Supabase dashboard
4. Start the application:
   ```bash
   npm start
   ```

### Option 2: Manual setup
1. Upload code to the server
2. Create a `.env` file with all environment variables above
3. Run:
   ```bash
   npm install
   npm run build
   npm start
   ```

## 📋 User Management

### Create an admin user
1. User registers normally through `/register`
2. Promote them in the Supabase database:
   ```sql
   UPDATE users
   SET role = 'ADMIN', status = 'ACTIVE'
   WHERE email = 'admin@example.com';
   ```

## ⚙️ Supabase Settings Check

### Email Authentication
1. Dashboard > Authentication > Settings
2. Check **"Confirm email"** — if enabled, users must confirm before login
3. Add your domain to **"Allowed Redirect URLs"**

### Row Level Security
Ensure the `users` table has proper RLS policies, e.g.:
```sql
-- Allow users to insert their own record
CREATE POLICY "Users can insert own record" ON users
FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to read their own record
CREATE POLICY "Users can read own record" ON users
FOR SELECT USING (auth.uid() = id);
```

## 🔒 Security Checklist
- ✅ `.env` is in `.gitignore`
- ✅ `SUPABASE_SERVICE_ROLE_KEY` (secret key) is kept secret and only lives in `.env`
- ✅ CORS / Allowed Redirect URLs configured in Supabase
- ✅ RLS policies enabled in Supabase
- ✅ Email confirmation settings configured

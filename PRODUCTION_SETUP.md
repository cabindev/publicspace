# Production Deployment Instructions

**Production URL:** https://healthypublicspaces.com

## 🔧 Environment Variables Required

### 1. Supabase Configuration (new-style API keys)
```env
NEXT_PUBLIC_SUPABASE_URL="https://kizvpsgapqhxlhukgsdm.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_fGcOt0fNmknygDVYQF6AXw_I4mo95b8"
SUPABASE_SERVICE_ROLE_KEY="sb_secret_... (get from dashboard, keep secret)"
```

> Note: this project uses Supabase's new-style keys. The publishable key acts as
> the anon/public key for the client; the secret key replaces the service_role key.
> Both are stored in the existing `NEXT_PUBLIC_SUPABASE_ANON_KEY` /
> `SUPABASE_SERVICE_ROLE_KEY` variable names the code already reads.

### 2. Database
```env
DATABASE_URL="postgresql://postgres:[DB-PASSWORD]@db.kizvpsgapqhxlhukgsdm.supabase.co:5432/postgres"
```

### 3. App Configuration
```env
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NODE_ENV=production
PORT=3000
```

## 🔍 Getting Supabase Keys

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `kizvpsgapqhxlhukgsdm`
3. Go to **Settings** > **API Keys**
4. Copy:
   - publishable key (`sb_publishable_...`) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - secret key (`sb_secret_...`) → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **Keep secret!**

## 🚀 Deployment Steps

### Option 1: Use Setup Script (Recommended)
1. Upload code to server
2. Run the automated setup script:
   ```bash
   chmod +x setup-production-env.sh
   ./setup-production-env.sh
   ```
3. Edit `.env.local` to add the SERVICE_ROLE_KEY from Supabase dashboard
4. Start the application:
   ```bash
   npm start
   ```

### Option 2: Manual Setup
1. Upload code to server  
2. Create `.env.local` file with all environment variables
3. Run:
   ```bash
   npm install
   npm run build
   npm start
   ```

## 🔧 Plesk-Specific Configuration

### server.js Features:
- ✅ **Automatic .env.local loading** with dotenv
- ✅ **Environment variables debugging** on startup
- ✅ **Fallback values** if .env.local is missing
- ✅ **Error handling** for missing environment files

### Test Environment Loading:
```bash
# Test environment variables loading
node test-server.js

# Start production server
npm start
```

### Expected Server Startup Logs:
```
✅ Loaded environment variables from .env.local
=== SERVER STARTUP DEBUG ===
NODE_ENV: production
NEXT_PUBLIC_SUPABASE_URL: SET
NEXT_PUBLIC_SUPABASE_ANON_KEY: SET
SUPABASE_SERVICE_ROLE_KEY: SET
=============================
> Ready on http://localhost:3000
```

## 🐛 Debug Authentication Issues

### Test login:
```bash
curl -X POST https://healthypublicspaces.com/api/debug/auth \
  -H "Content-Type: application/json" \
  -d '{"email":"evo_reaction@hotmail.com","password":"your_password"}'
```

### Test signup:
```bash
curl -X POST https://healthypublicspaces.com/api/debug/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

### Common Issues:
1. **Missing SERVICE_ROLE_KEY** - Required for user role management
2. **Wrong database URL** - Check password and connection string  
3. **User not in database** - User exists in Supabase Auth but not in `users` table
4. **CORS issues** - Check domain configuration in Supabase
5. **Email confirmation required** - Check Supabase Auth settings
6. **RLS policies blocking insert** - Check Row Level Security policies

## 📋 User Management

### Create Admin User:
1. User registers normally through `/register`
2. Update in Supabase database:
   ```sql
   UPDATE users 
   SET role = 'ADMIN', status = 'ACTIVE' 
   WHERE email = 'evo_reaction@hotmail.com';
   ```

### Or create user manually:
```sql
INSERT INTO users (id, email, name, role, status) 
VALUES (
  'user-uuid-from-supabase-auth',
  'evo_reaction@hotmail.com',
  'Admin User',
  'ADMIN',
  'ACTIVE'
);
```

## ⚙️ Supabase Settings Check

### Email Authentication Settings:
1. Go to Supabase Dashboard > Authentication > Settings
2. Check **"Confirm email"** - If enabled, users need to confirm email before login
   - For testing: Disable this temporarily
   - For production: Enable but configure email templates
3. Check **"Enable email confirmations"** under Email settings
4. Ensure your domain is added to **"Allowed Redirect URLs"**

### Database Policies:
1. Go to Database > Policies
2. Ensure `users` table has proper RLS policies:
   ```sql
   -- Allow users to insert their own record
   CREATE POLICY "Users can insert own record" ON users 
   FOR INSERT WITH CHECK (auth.uid() = id);
   
   -- Allow users to read their own record  
   CREATE POLICY "Users can read own record" ON users 
   FOR SELECT USING (auth.uid() = id);
   ```

## 🔒 Security Checklist
- ✅ `.env.local` is in `.gitignore`
- ✅ SERVICE_ROLE_KEY is kept secret
- ✅ Database password is secure
- ✅ CORS is configured properly in Supabase
- ✅ RLS policies are enabled in Supabase
- ✅ Email confirmation settings configured
- ✅ Allowed redirect URLs set
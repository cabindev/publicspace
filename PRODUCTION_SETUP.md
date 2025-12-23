# Production Deployment Instructions

## 🔧 Environment Variables Required

### 1. Supabase Configuration
```env
NEXT_PUBLIC_SUPABASE_URL="https://latplvqjbpclasvvtpeu.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key_here"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_here"
```

### 2. Database
```env
DATABASE_URL="postgresql://postgres:password@db.latplvqjbpclasvvtpeu.supabase.co:5432/postgres"
```

### 3. App Configuration
```env
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NODE_ENV=production
PORT=3000
```

## 🔍 Getting Supabase Keys

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `latplvqjbpclasvvtpeu`
3. Go to **Settings** > **API**
4. Copy:
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **Keep secret!**

## 🚀 Deployment Steps

### On Plesk Server:
1. Upload code to server
2. Create `.env.local` file with all environment variables
3. Run:
   ```bash
   npm install
   npm run build
   npm start
   ```

## 🐛 Debug Login Issues

### Test authentication:
```bash
curl -X POST https://your-domain.com/api/debug/auth \
  -H "Content-Type: application/json" \
  -d '{"email":"evo_reaction@hotmail.com","password":"your_password"}'
```

### Common Issues:
1. **Missing SERVICE_ROLE_KEY** - Required for user role management
2. **Wrong database URL** - Check password and connection string
3. **User not in database** - User exists in Supabase Auth but not in `users` table
4. **CORS issues** - Check domain configuration in Supabase

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

## 🔒 Security Checklist
- ✅ `.env.local` is in `.gitignore`
- ✅ SERVICE_ROLE_KEY is kept secret
- ✅ Database password is secure
- ✅ CORS is configured properly in Supabase
- ✅ RLS policies are enabled in Supabase
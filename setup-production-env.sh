#!/bin/bash

# Production Environment Setup Script
# Run this script on the production server after deployment

echo "🚀 Setting up production environment for healthypublicspaces.com"
echo "==============================================================="

# Create .env.local file for production
cat > .env.local << 'EOF'
# Supabase Configuration (new-style API keys)
NEXT_PUBLIC_SUPABASE_URL=https://kizvpsgapqhxlhukgsdm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_fGcOt0fNmknygDVYQF6AXw_I4mo95b8

# IMPORTANT: Get this from Supabase Dashboard > Settings > API Keys > Secret keys
# https://supabase.com/dashboard/project/kizvpsgapqhxlhukgsdm/settings/api-keys
# Copy the secret key (starts with sb_secret_...)
SUPABASE_SERVICE_ROLE_KEY=REPLACE_WITH_ACTUAL_SECRET_KEY_FROM_DASHBOARD

# App Configuration
NEXT_PUBLIC_APP_URL=https://healthypublicspaces.com

# Server Configuration
NODE_ENV=production
PORT=3000

# Database (replace [DB-PASSWORD] with the project's database password)
DATABASE_URL=postgresql://postgres:[DB-PASSWORD]@db.kizvpsgapqhxlhukgsdm.supabase.co:5432/postgres
EOF

echo "✅ Created .env.local file"
echo ""
echo "⚠️  IMPORTANT: You must manually update SUPABASE_SERVICE_ROLE_KEY (and the DB password) in .env.local"
echo "   1. Go to: https://supabase.com/dashboard/project/kizvpsgapqhxlhukgsdm/settings/api-keys"
echo "   2. Copy the secret key (starts with sb_secret_...)"
echo "   3. Replace 'REPLACE_WITH_ACTUAL_SECRET_KEY_FROM_DASHBOARD' in .env.local"
echo ""
echo "🔧 Running deployment commands..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install dotenv for environment variable loading
echo "📦 Installing dotenv for environment variables..."
npm install dotenv

# Build the application
echo "🔨 Building application..."
npm run build

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the application, run:"
echo "   npm start"
echo ""
echo "🧪 Test endpoints:"
echo "   https://healthypublicspaces.com/api/debug/auth"
echo "   https://healthypublicspaces.com/api/debug/signup"
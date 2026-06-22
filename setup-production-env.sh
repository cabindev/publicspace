#!/bin/bash

# Production Environment Setup Script
# Run this on the production server after deploying the code.

echo "🚀 Setting up production environment for healthypublicspaces.com"
echo "==============================================================="

# Create .env (Next.js loads this automatically; it is gitignored).
cat > .env << 'EOF'
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
EOF

echo "✅ Created .env file"
echo ""
echo "⚠️  IMPORTANT: You must manually set SUPABASE_SERVICE_ROLE_KEY in .env"
echo "   1. Go to: https://supabase.com/dashboard/project/kizvpsgapqhxlhukgsdm/settings/api-keys"
echo "   2. Copy the secret key (starts with sb_secret_...)"
echo "   3. Replace 'REPLACE_WITH_ACTUAL_SECRET_KEY_FROM_DASHBOARD' in .env"
echo ""
echo "🔧 Running deployment commands..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the application, run:"
echo "   npm start"

#!/bin/bash

# Production Environment Setup Script
# Run this script on the production server after deployment

echo "🚀 Setting up production environment for healthypublicspaces.com"
echo "==============================================================="

# Create .env.local file for production
cat > .env.local << 'EOF'
# Supabase Configuration (Updated with latest keys)
NEXT_PUBLIC_SUPABASE_URL=https://latplvqjbpclasvvtpeu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdHBsdnFqYnBjbGFzdnZ0cGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NjczNzEsImV4cCI6MjA1MDU0MzM3MX0.Wdmtpl5eFJh6KKGSDcczeDzE0DQ7cHEUEXOUNkcvIek

# IMPORTANT: Get this from Supabase Dashboard > Settings > API > service_role key
# https://supabase.com/dashboard/project/latplvqjbpclasvvtpeu/settings/api-keys
# Copy the "service_role" key (starts with eyJhbGci...)
SUPABASE_SERVICE_ROLE_KEY=REPLACE_WITH_ACTUAL_SERVICE_ROLE_KEY_FROM_DASHBOARD

# App Configuration  
NEXT_PUBLIC_APP_URL=https://healthypublicspaces.com

# Server Configuration
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://postgres:Rrf5y45euJvUV5LS@db.latplvqjbpclasvvtpeu.supabase.co:5432/postgres
EOF

echo "✅ Created .env.local file"
echo ""
echo "⚠️  IMPORTANT: You must manually update SUPABASE_SERVICE_ROLE_KEY in .env.local"
echo "   1. Go to: https://supabase.com/dashboard/project/latplvqjbpclasvvtpeu/settings/api-keys"
echo "   2. Copy the 'service_role' key" 
echo "   3. Replace 'REPLACE_WITH_ACTUAL_SERVICE_ROLE_KEY' in .env.local"
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
// Test server.js functionality
console.log('🧪 Testing server.js configuration...')

// Load environment variables from .env.local for production
try {
  require('dotenv').config({ path: './.env.local' })
  console.log('✅ Loaded environment variables from .env.local')
} catch (error) {
  console.warn('⚠️  Could not load .env.local file:', error.message)
}

// Test environment variables
console.log('=== ENVIRONMENT VARIABLES TEST ===')
console.log('NODE_ENV:', process.env.NODE_ENV || 'NOT SET')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET ✅' : 'NOT SET ❌')
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET ✅' : 'NOT SET ❌')
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET ✅' : 'NOT SET ❌')
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET ✅' : 'NOT SET ❌')
console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL || 'NOT SET')
console.log('===================================')

// Test if fallback values work
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://latplvqjbpclasvvtpeu.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdHBsdnFqYnBjbGFzdnZ0cGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NjczNzEsImV4cCI6MjA1MDU0MzM3MX0.Wdmtpl5eFJh6KKGSDcczeDzE0DQ7cHEUEXOUNkcvIek'

console.log('=== FALLBACK VALUES TEST ===')
console.log('Supabase URL (with fallback):', supabaseUrl.substring(0, 50) + '...')
console.log('Supabase Key (with fallback):', supabaseAnonKey.substring(0, 50) + '...')
console.log('===============================')

console.log('✅ Server.js configuration test complete!')
console.log('💡 Now run: node server.js (in production) or npm start')
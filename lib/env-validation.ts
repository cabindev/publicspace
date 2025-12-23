// Environment variables validation
// This helps catch missing environment variables early

export function validateEnvironment() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:')
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`)
    })
    
    console.error('\n💡 Please check your .env.local file and ensure all required variables are set.')
    console.error('📖 See PRODUCTION_SETUP.md for detailed instructions.')
    
    throw new Error(`Missing environment variables: ${missingVars.join(', ')}`)
  }

  // Validate URL format
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL must start with https://')
    throw new Error('Invalid Supabase URL format')
  }

  // Check if using example values
  if (supabaseUrl?.includes('your_supabase_url_here')) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL still contains placeholder value')
    console.error('💡 Please update .env.local with actual Supabase URL')
    throw new Error('Placeholder environment variable detected')
  }

  console.log('✅ Environment variables validated successfully')
  console.log(`   Supabase URL: ${supabaseUrl?.substring(0, 50)}...`)
}

// Auto-validate on import (only in development)
if (process.env.NODE_ENV !== 'production') {
  try {
    validateEnvironment()
  } catch (error) {
    console.error('Environment validation failed:', error)
  }
}
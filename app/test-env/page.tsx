'use client'

export default function TestEnvPage() {
  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NODE_ENV: process.env.NODE_ENV
  }

  console.log('Environment variables:', envVars)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Test</h1>
      <div className="space-y-2 font-mono text-sm">
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} className="border p-2 rounded">
            <strong>{key}:</strong> 
            <span className={value ? 'text-green-600' : 'text-red-600'}>
              {value ? ` ${value.substring(0, 50)}...` : ' NOT SET'}
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-6">
        <button 
          onClick={() => console.log('Current env:', envVars)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Log to Console
        </button>
      </div>
    </div>
  )
}
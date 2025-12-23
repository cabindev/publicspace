// Load environment variables from .env.local for production
try {
  require('dotenv').config({ path: './.env.local' })
  console.log('✅ Loaded environment variables from .env.local')
} catch (error) {
  console.warn('⚠️  Could not load .env.local file:', error.message)
  console.warn('   Using system environment variables or fallback values')
}

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || 'localhost'
const port = process.env.PORT || 3000

// Debug: Log environment variables status
console.log('=== SERVER STARTUP DEBUG ===')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET')
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET')
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET')
console.log('=============================')

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true)
      const { pathname, query } = parsedUrl

      // Handle file uploads and API routes
      if (pathname.startsWith('/api/')) {
        await handle(req, res, parsedUrl)
      } else if (pathname.startsWith('/_next/')) {
        // Handle Next.js static files
        await handle(req, res, parsedUrl)
      } else {
        // Handle all other routes
        await handle(req, res, parsedUrl)
      }
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})
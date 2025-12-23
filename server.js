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
const fs = require('fs')
const path = require('path')

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

// Simple static file serving function
function serveStaticFile(req, res, filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath)
      if (stat.isFile()) {
        const ext = path.extname(filePath).toLowerCase()
        const mimeTypes = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.gif': 'image/gif',
          '.webp': 'image/webp',
          '.svg': 'image/svg+xml'
        }
        res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream')
        fs.createReadStream(filePath).pipe(res)
        return true
      }
    }
  } catch (error) {
    console.error('Error serving static file:', error)
  }
  return false
}

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      const { pathname } = parsedUrl

      // Handle static files for uploaded images and assets
      if (pathname.startsWith('/report/')) {
        const filePath = path.join(__dirname, 'public', pathname)
        if (serveStaticFile(req, res, filePath)) return
      } else if (pathname.startsWith('/images/')) {
        const filePath = path.join(__dirname, 'public', pathname)
        if (serveStaticFile(req, res, filePath)) return
      } else if (pathname.startsWith('/assets/')) {
        const filePath = path.join(__dirname, 'public', pathname)
        if (serveStaticFile(req, res, filePath)) return
      }

      // Handle all other routes with Next.js
      await handle(req, res, parsedUrl)
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
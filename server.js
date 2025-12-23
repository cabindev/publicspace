// Load environment variables from .env.local for production
try {
  require('dotenv').config({ path: './.env.local' })
  console.log('✅ Loaded environment variables from .env.local')
} catch (error) {
  console.warn('⚠️  Could not load .env.local file:', error.message)
  console.warn('   Using system environment variables or fallback values')
}

const next = require('next')
const express = require('express')
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

app.prepare().then(() => {
  const server = express()
  
  // ตั้งค่าเสิร์ฟไฟล์ static จากโฟลเดอร์ public/report สำหรับรูปภาพที่อัปโหลด
  server.use('/report', express.static(path.join(__dirname, 'public/report')))
  
  // ตั้งค่าเสิร์ฟไฟล์ static อื่นๆ
  server.use('/images', express.static(path.join(__dirname, 'public/images')))
  server.use('/assets', express.static(path.join(__dirname, 'public/assets')))
  
  server.all('*', (req, res) => {
    return handle(req, res)
  })

  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
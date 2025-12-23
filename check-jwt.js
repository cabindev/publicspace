// Check JWT token expiration
const jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdHBsdnFqYnBjbGFzdnZ0cGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NjczNzEsImV4cCI6MjA1MDU0MzM3MX0.Wdmtpl5eFJh6KKGSDcczeDzE0DQ7cHEUEXOUNkcvIek"

const parts = jwt.split('.')
const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())

console.log('JWT Payload:', payload)
console.log('Issued at (iat):', new Date(payload.iat * 1000))
console.log('Expires at (exp):', new Date(payload.exp * 1000))
console.log('Current time:', new Date())
console.log('Is expired?', Date.now() / 1000 > payload.exp)
console.log('Project ref:', payload.ref)
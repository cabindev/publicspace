// Simple bot protection utilities
// Avoids complex CAPTCHA but provides basic bot detection

export interface BotChallenge {
  question: string
  answer: string
  timestamp: number
}

// Simple math challenges for bot detection
export function generateMathChallenge(): BotChallenge {
  const operations = ['+', '-', '*']
  const operation = operations[Math.floor(Math.random() * operations.length)]
  
  let num1: number
  let num2: number
  let answer: number
  
  switch (operation) {
    case '+':
      num1 = Math.floor(Math.random() * 20) + 1
      num2 = Math.floor(Math.random() * 20) + 1
      answer = num1 + num2
      break
    case '-':
      num1 = Math.floor(Math.random() * 30) + 10
      num2 = Math.floor(Math.random() * 10) + 1
      answer = num1 - num2
      break
    case '*':
      num1 = Math.floor(Math.random() * 10) + 1
      num2 = Math.floor(Math.random() * 10) + 1
      answer = num1 * num2
      break
    default:
      num1 = 5
      num2 = 3
      answer = 8
  }
  
  return {
    question: `${num1} ${operation} ${num2} = ?`,
    answer: answer.toString(),
    timestamp: Date.now()
  }
}

// Validate bot challenge response
export function validateBotChallenge(
  userAnswer: string,
  expectedAnswer: string,
  timestamp: number,
  maxAgeMinutes: number = 10
): { valid: boolean; error?: string } {
  
  // Check if challenge expired
  const ageMinutes = (Date.now() - timestamp) / (1000 * 60)
  if (ageMinutes > maxAgeMinutes) {
    return {
      valid: false,
      error: 'Challenge expired. Please try again.'
    }
  }
  
  // Check if answer is correct
  if (userAnswer.trim() !== expectedAnswer) {
    return {
      valid: false,
      error: 'Incorrect answer. Please solve the math problem.'
    }
  }
  
  return { valid: true }
}

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string, // IP or user ID
  maxRequests: number = 5,
  windowMinutes: number = 15
): { allowed: boolean; retryAfter?: number } {
  
  const now = Date.now()
  const windowMs = windowMinutes * 60 * 1000
  const stored = rateLimitStore.get(identifier)
  
  if (!stored || now > stored.resetTime) {
    // New window or expired
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    })
    return { allowed: true }
  }
  
  if (stored.count >= maxRequests) {
    const retryAfter = Math.ceil((stored.resetTime - now) / 1000)
    return { allowed: false, retryAfter }
  }
  
  // Increment count
  stored.count++
  rateLimitStore.set(identifier, stored)
  
  return { allowed: true }
}

// Cleanup old rate limit entries (call periodically)
export function cleanupRateLimit() {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

// Additional bot detection heuristics
export function detectBotBehavior(request: {
  userAgent?: string
  timing?: number // Time taken to fill form
  headers?: { [key: string]: string }
}): { isBot: boolean; reason?: string } {
  
  // Check User-Agent
  if (request.userAgent) {
    const botPatterns = [
      /bot/i, /crawler/i, /spider/i, /scraper/i,
      /curl/i, /wget/i, /python-requests/i, /postman/i
    ]
    
    for (const pattern of botPatterns) {
      if (pattern.test(request.userAgent)) {
        return {
          isBot: true,
          reason: 'Bot-like User-Agent detected'
        }
      }
    }
  }
  
  // Check form timing (too fast = bot)
  if (request.timing && request.timing < 3000) { // Less than 3 seconds
    return {
      isBot: true,
      reason: 'Form submitted too quickly'
    }
  }
  
  // Check missing common headers
  if (request.headers && !request.headers.accept) {
    return {
      isBot: true,
      reason: 'Missing browser headers'
    }
  }
  
  return { isBot: false }
}
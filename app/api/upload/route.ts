import { NextRequest, NextResponse } from 'next/server'

// Validate and sanitize video URLs
function validateVideoUrl(url: string): { isValid: boolean; sanitizedUrl?: string; error?: string } {
  try {
    // Basic URL validation
    const urlObj = new URL(url)
    
    // Allowed domains for video hosting
    const allowedDomains = [
      'youtube.com',
      'www.youtube.com', 
      'youtu.be',
      'vimeo.com',
      'www.vimeo.com',
      'facebook.com',
      'www.facebook.com',
      'fb.watch',
      'drive.google.com',
      'docs.google.com'
    ]
    
    // Check if domain is allowed
    const isAllowedDomain = allowedDomains.some(domain => 
      urlObj.hostname.toLowerCase() === domain || 
      urlObj.hostname.toLowerCase().endsWith(`.${domain}`)
    )
    
    if (!isAllowedDomain) {
      return { 
        isValid: false, 
        error: 'Video URL must be from YouTube, Vimeo, Facebook, or Google Drive' 
      }
    }
    
    // Additional security checks
    if (urlObj.protocol !== 'https:') {
      return { 
        isValid: false, 
        error: 'Video URL must use HTTPS protocol' 
      }
    }
    
    // Remove potentially dangerous parameters
    const sanitizedUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`
    + (urlObj.search ? urlObj.search : '')
    
    return { 
      isValid: true, 
      sanitizedUrl 
    }
    
  } catch (error) {
    return { 
      isValid: false, 
      error: 'Invalid URL format' 
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if request has content
    const contentType = request.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      )
    }

    let body
    let rawBody
    try {
      // Read raw body first for debugging
      rawBody = await request.text()
      console.log('Raw request body:', rawBody)
      
      // Parse JSON
      body = JSON.parse(rawBody)
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError)
      console.error('Raw body was:', rawBody)
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const { videoUrl } = body
    
    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Video URL is required' },
        { status: 400 }
      )
    }
    
    // Validate video URL
    const validation = validateVideoUrl(videoUrl)
    
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }
    
    // Return sanitized URL
    return NextResponse.json({ 
      success: true, 
      url: validation.sanitizedUrl,
      type: 'video',
      message: 'Video URL validated successfully'
    })
    
  } catch (error) {
    console.error('Video URL processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process video URL' },
      { status: 500 }
    )
  }
}

/* File upload functionality disabled for security
- Previous file upload code removed due to malware incident
- System now accepts video URLs from trusted platforms instead
- This provides safer alternative for media sharing
*/
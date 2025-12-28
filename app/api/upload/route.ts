import { NextRequest, NextResponse } from 'next/server'

export async function POST() {
  // Upload functionality completely disabled
  return NextResponse.json(
    { error: 'File upload functionality is disabled' },
    { status: 501 } // 501 Not Implemented
  )
}

/* Upload functionality removed
 * This endpoint is kept for API compatibility but always returns 501
 * Original file upload was disabled for security reasons
 * Video URL validation was also removed as it's not needed
 */
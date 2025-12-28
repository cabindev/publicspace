import { NextRequest, NextResponse } from 'next/server'
import { generateMathChallenge } from '@/lib/bot-protection'

export async function GET(request: NextRequest) {
  try {
    // Generate a new math challenge
    const challenge = generateMathChallenge()
    
    return NextResponse.json({
      success: true,
      challenge: {
        question: challenge.question,
        timestamp: challenge.timestamp
      },
      // Don't send the answer to client - store it for validation
      serverData: {
        expectedAnswer: challenge.answer,
        timestamp: challenge.timestamp
      }
    })
    
  } catch (error) {
    console.error('Error generating bot challenge:', error)
    return NextResponse.json(
      { error: 'Failed to generate challenge' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { answer, expectedAnswer, timestamp } = await request.json()
    
    if (!answer || !expectedAnswer || !timestamp) {
      return NextResponse.json(
        { error: 'Missing challenge data' },
        { status: 400 }
      )
    }
    
    // Validate the challenge
    const validation = validateBotChallenge(answer, expectedAnswer, timestamp)
    
    if (!validation.valid) {
      return NextResponse.json(
        { 
          success: false,
          error: validation.error 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Challenge completed successfully'
    })
    
  } catch (error) {
    console.error('Error validating bot challenge:', error)
    return NextResponse.json(
      { error: 'Failed to validate challenge' },
      { status: 500 }
    )
  }
}

// Import the validation function
import { validateBotChallenge } from '@/lib/bot-protection'
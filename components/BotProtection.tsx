'use client'

import { useState, useEffect } from 'react'

interface BotChallengeData {
  question: string
  expectedAnswer: string
  timestamp: number
}

interface BotProtectionProps {
  onComplete: (challengeData: BotChallengeData) => void
  className?: string
}

export function BotProtection({ onComplete, className = '' }: BotProtectionProps) {
  const [challenge, setChallenge] = useState<{question: string; timestamp: number} | null>(null)
  const [answer, setAnswer] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [expectedAnswer, setExpectedAnswer] = useState('')

  const generateNewChallenge = async () => {
    try {
      setIsLoading(true)
      setError('')
      setAnswer('')
      
      const response = await fetch('/api/bot-challenge')
      const data = await response.json()
      
      if (data.success) {
        setChallenge(data.challenge)
        setExpectedAnswer(data.serverData.expectedAnswer)
      } else {
        setError('Failed to load verification challenge')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswerChange = (value: string) => {
    setAnswer(value)
    setError('')
    
    // Auto-submit when answer looks complete
    if (value.trim() && challenge) {
      const challengeData: BotChallengeData = {
        question: challenge.question,
        expectedAnswer: expectedAnswer,
        timestamp: challenge.timestamp
      }
      
      // Validate answer
      if (value.trim() === expectedAnswer) {
        onComplete({
          ...challengeData,
          expectedAnswer: expectedAnswer
        })
      }
    }
  }

  useEffect(() => {
    generateNewChallenge()
  }, [])

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
        <span className="text-sm text-gray-600">Loading verification...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-3 ${className}`}>
        <p className="text-red-700 text-sm mb-2">{error}</p>
        <button
          onClick={generateNewChallenge}
          className="text-red-600 hover:text-red-700 text-sm font-medium underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center space-x-2 mb-2">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 0h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
        </svg>
        <h3 className="text-blue-900 font-medium text-sm">Verify you're not a bot</h3>
      </div>
      
      {challenge && (
        <div className="space-y-3">
          <div>
            <label className="block text-blue-800 text-sm font-medium mb-1">
              Solve this simple math problem:
            </label>
            <p className="text-blue-900 font-mono text-lg">{challenge.question}</p>
          </div>
          
          <div>
            <input
              type="number"
              value={answer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Enter your answer"
              className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoComplete="off"
            />
          </div>
          
          {answer && answer.trim() === expectedAnswer && (
            <div className="flex items-center space-x-2 text-green-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span className="text-sm">Verified! ✓</span>
            </div>
          )}
          
          <button
            onClick={generateNewChallenge}
            className="text-blue-600 hover:text-blue-700 text-xs underline"
          >
            Generate new question
          </button>
        </div>
      )}
    </div>
  )
}
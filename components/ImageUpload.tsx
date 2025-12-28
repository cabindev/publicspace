'use client'

import { useState, useRef } from 'react'
import { compressImage, validateImageFile, formatFileSize, CompressedImage } from '@/lib/imageUtils'

interface ImageUploadProps {
  onImageChange: (compressedImage: CompressedImage | null) => void
  disabled?: boolean
  className?: string
}

export default function ImageUpload({ onImageChange, disabled = false, className = '' }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isCompressing, setIsCompressing] = useState(false)
  const [compressionInfo, setCompressionInfo] = useState<{
    originalSize: number
    compressedSize: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    setError(null)
    setIsCompressing(true)

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      setError(validation.error!)
      setIsCompressing(false)
      return
    }

    try {
      // Compress image
      const compressedImage = await compressImage(file)
      
      // Update states
      setPreviewUrl(compressedImage.dataUrl)
      setCompressionInfo({
        originalSize: compressedImage.originalSize,
        compressedSize: compressedImage.compressedSize
      })
      
      // Notify parent component
      onImageChange(compressedImage)
      
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการบีบอัดรูปภาพ')
      onImageChange(null)
    } finally {
      setIsCompressing(false)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const clearImage = () => {
    setPreviewUrl(null)
    setCompressionInfo(null)
    setError(null)
    onImageChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      {!previewUrl && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled}
            className="hidden"
          />
          
          <div className="space-y-2">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                />
              </svg>
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-900">คลิกเพื่อเลือกรูปภาพ</p>
              <p className="text-gray-600">หรือลากไฟล์มาวางที่นี่</p>
            </div>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF, WebP ขนาดไม่เกิน 10MB
            </p>
          </div>
          
          {isCompressing && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                <span className="text-sm text-gray-600">กำลังบีบอัดรูปภาพ...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview Area */}
      {previewUrl && (
        <div className="space-y-3">
          <div className="relative">
            <img
              src={previewUrl}
              alt="ตัวอย่างรูปภาพ"
              className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
            />
            <button
              onClick={clearImage}
              disabled={disabled}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50"
              title="ลบรูปภาพ"
            >
              ×
            </button>
          </div>
          
          {/* Compression Info */}
          {compressionInfo && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
              <div className="flex items-center space-x-2 text-green-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">รูปภาพพร้อมส่ง</span>
              </div>
              <div className="mt-1 text-green-600">
                <p>ขนาดเดิม: {formatFileSize(compressionInfo.originalSize)}</p>
                <p>ขนาดหลังบีบอัด: {formatFileSize(compressionInfo.compressedSize)}</p>
                <p>ลดขนาดได้: {Math.round((1 - compressionInfo.compressedSize / compressionInfo.originalSize) * 100)}%</p>
              </div>
            </div>
          )}
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            เปลี่ยนรูปภาพ
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import { useAuth } from '@/hooks/useAuth'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import ImageUpload from '@/components/ImageUpload'
import { CompressedImage } from '@/lib/imageUtils'

type ReportType = 'SUPPORT' | 'COMPLAINT' | 'SUGGESTION'
type LocationType = 'PARK_RECREATION' | 'SPORTS_VENUE' | 'NATURE_PARK' | 'CULTURAL_EVENT' | 'MARKET_STREET' | 'INSTITUTION'

export default function HealthyPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [reportType, setReportType] = useState<ReportType>('SUPPORT')
  const [location, setLocation] = useState('')
  const [locationType, setLocationType] = useState<LocationType>('PARK_RECREATION')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [authChecked, setAuthChecked] = useState(false)
  const [selectedImage, setSelectedImage] = useState<CompressedImage | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading) {
      setAuthChecked(true)
    }
  }, [authLoading])

  const reportTypes = {
    SUPPORT: 'สนับสนุน',
    COMPLAINT: 'ร้องเรียน',
    SUGGESTION: 'เสนอแนะ'
  }

  const locationTypes = {
    PARK_RECREATION: 'สถานที่สวนสาธารณะพักผ่อนหย่อนใจ',
    SPORTS_VENUE: 'สถานที่เล่นกีฬาแข่งขันกีฬา',
    NATURE_PARK: 'สถานที่ธรรมชาติในอุทยานแห่งชาติ ภูเขาน้ำตก ทะเล',
    CULTURAL_EVENT: 'สถานที่จัดงานทางประเพณี วัฒนธรรม',
    MARKET_STREET: 'สถานที่ตลาดนัด ตลาดสด ถนนคนเดิน ลานดนตรี',
    INSTITUTION: 'ศาสนสถาน สถานศึกษา โรงพยาบาล สถานที่ราชการ'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let imageUrl = uploadedImageUrl

      // Upload image first if selected
      if (selectedImage && !uploadedImageUrl) {
        const formData = new FormData()
        formData.append('image', selectedImage.file)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          credentials: 'include',
          body: formData
        })

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          imageUrl = uploadData.url
          setUploadedImageUrl(imageUrl)
        } else {
          const uploadError = await uploadResponse.json()
          throw new Error(uploadError.error || 'Failed to upload image')
        }
      }

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // เพิ่มเพื่อส่ง cookies/session
        body: JSON.stringify({
          title,
          description,
          reportType,
          location,
          locationType,
          imageUrl, // เพิ่ม URL ของรูปภาพ
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTitle('')
        setDescription('')
        setReportType('SUPPORT')
        setLocation('')
        setLocationType('PARK_RECREATION')
        setSelectedImage(null)
        setUploadedImageUrl(null)
        setTimeout(() => {
          setSuccess(false)
          // Only redirect to dashboard if user has access
          if (user) {
            router.push('/dashboard')
          } else {
            router.push('/')
          }
        }, 2000)
      } else if (response.status === 401) {
        router.push('/login')
      } else {
        setError(data.error || 'เกิดข้อผิดพลาดในการส่งรายงาน')
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking auth
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        <Header />
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        <Header />

        {/* Authentication Notice */}
        {!user && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>ข้อความสำคัญ:</strong> คุณจำเป็นต้อง{' '}
                    <Link href="/login" className="underline font-medium">เข้าสู่ระบบ</Link>{' '}
                    หรือ{' '}
                    <Link href="/register" className="underline font-medium">สมัครสมาชิก</Link>{' '}
                    เพื่อส่งรายงานพื้นที่สาธารณะ
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                รายงานพื้นที่สาธารณะ
              </h1>
              <p className="text-gray-600">
                ช่วยเหลือสร้างสรรค์พื้นที่สาธารณะที่ดีต่อสุขภาพสำหรับทุกคน
              </p>
            </div>

            {success && (
              <div className="mb-6 rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      ส่งรายงานเรียบร้อยแล้ว! กำลังไปยัง Dashboard...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  เรื่อง *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="หัวข้อของรายงาน"
                  required
                />
              </div>

              {/* Report Type */}
              <div>
                <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-2">
                  ประเภท *
                </label>
                <select
                  id="reportType"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as ReportType)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  required
                >
                  {Object.entries(reportTypes).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Type */}
              <div>
                <label htmlFor="locationType" className="block text-sm font-medium text-gray-700 mb-2">
                  สถานที่สาธารณะ *
                </label>
                <select
                  id="locationType"
                  value={locationType}
                  onChange={(e) => setLocationType(e.target.value as LocationType)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  required
                >
                  {Object.entries(locationTypes).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  เลือกสถานที่ *
                </label>
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="ที่อยู่หรือชื่อสถานที่"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  รายละเอียด
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับพื้นที่สาธารณะนี้"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รูปภาพประกอบ (ไม่บังคับ)
                </label>
                <ImageUpload
                  onImageChange={setSelectedImage}
                  disabled={loading}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <Link
                  href="/"
                  className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  ยกเลิก
                </Link>
                <button
                  type="submit"
                  disabled={loading || !user}
                  className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'กำลังส่ง...' : !user ? 'กรุณาเข้าสู่ระบบ' : 'ส่งรายงาน'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Partner Logos */}
        <div className="mt-12 bg-white rounded-lg shadow p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">พันธมิตร</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex items-center justify-center p-4">
              <Image
                src="/public.svg"
                alt="Public Logo"
                width={120}
                height={60}
                className="max-w-full h-auto"
              />
            </div>
            <div className="flex items-center justify-center p-4">
              <Image
                src="/logo sdn.svg"
                alt="SDN Logo"
                width={120}
                height={60}
                className="max-w-full h-auto"
              />
            </div>
            <div className="flex items-center justify-center p-4">
              <Image
                src="/sdnth.svg"
                alt="SDNTH Logo"
                width={120}
                height={60}
                className="max-w-full h-auto"
              />
            </div>
            <div className="flex items-center justify-center p-4">
              <Image
                src="/logo plungsungkom.svg"
                alt="Plungsungkom Logo"
                width={120}
                height={60}
                className="max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-center space-x-6">
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="YouTube"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Facebook"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>
      </div>
    </ErrorBoundary>
  )
}
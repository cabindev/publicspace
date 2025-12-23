'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { useAuth } from '@/hooks/useAuth'
import { canAccessDashboard } from '@/lib/auth'
import { AuthErrorBoundary } from '@/components/ErrorBoundary'
import { AuthLoadingSpinner } from '@/components/LoadingSpinner'

interface Report {
  id: string
  title: string
  description: string | null
  location: string
  location_type: string
  image_url: string | null
  status: string
  created_at: string
  user: {
    name: string | null
    email: string
  }
}

export default function DashboardPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [reportsLoading, setReportsLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Wait for auth to load
    if (loading) return

    // Redirect if not authenticated
    if (!user) {
      router.push('/login')
      return
    }

    // Check if user has dashboard access
    const access = canAccessDashboard()
    setHasAccess(access)
    
    if (!access) {
      router.push('/')
      return
    }

    const fetchReports = async () => {
      try {
        const response = await fetch('/api/reports')
        if (response.ok) {
          const data = await response.json()
          setReports(data.reports || [])
        }
      } catch (error) {
        console.error('Error fetching reports:', error)
      } finally {
        setReportsLoading(false)
      }
    }

    // Only fetch reports if user has access
    if (hasAccess) {
      fetchReports()
    }
  }, [user, loading, router, hasAccess])

  const updateReportStatus = async (reportId: string, newStatus: string) => {
    setUpdatingStatus(reportId)
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Update the reports list
        setReports(prev => prev.map(report => 
          report.id === reportId 
            ? { ...report, status: newStatus }
            : report
        ))
      } else {
        console.error('Failed to update report status')
        alert('ไม่สามารถอัปเดตสถานะได้ กรุณาลองใหม่')
      }
    } catch (error) {
      console.error('Error updating report status:', error)
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setUpdatingStatus(null)
    }
  }

  if (loading) {
    return <AuthLoadingSpinner />
  }

  // Show loading while checking access
  if (hasAccess === null) {
    return <AuthLoadingSpinner />
  }

  // Don't render if no access (redirect will handle this)
  if (!user || !hasAccess) {
    return null
  }
  
  const stats = {
    total: reports.length,
    pending: reports.filter((r) => r.status === 'PENDING').length,
    approved: reports.filter((r) => r.status === 'APPROVED').length,
    rejected: reports.filter((r) => r.status === 'REJECTED').length,
  }

  return (
    <AuthErrorBoundary>
      <div className="min-h-screen bg-gray-100">
        <Header />

        {/* Page Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">ติดตามสถิติและจัดการรายงานของคุณ</p>
          </div>
        </div>

        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-4">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              ← กลับหน้าหลัก
            </Link>
            <Link
              href="/healthy"
              className="text-green-600 hover:text-green-500 font-medium"
            >
              รายงานพื้นที่สาธารณะ
            </Link>
          </nav>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">📊</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      รายงานทั้งหมด
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">⏳</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      รอการตรวจสอบ
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.pending}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      อนุมัติแล้ว
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.approved}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">✗</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      ไม่อนุมัติ
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.rejected}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              รายงานล่าสุด
            </h3>
            {reportsLoading ? (
              <div className="text-center py-8">
                <div className="animate-pulse">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto"></div>
                  </div>
                </div>
                <div className="text-gray-500 mt-4">กำลังโหลดรายงาน...</div>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500">ยังไม่มีรายงาน</div>
                <Link
                  href="/healthy"
                  className="mt-2 inline-block text-blue-600 hover:text-blue-500"
                >
                  สร้างรายงานแรกของคุณ →
                </Link>
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        หัวข้อ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        รูปภาพ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        สถานที่
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ประเภท
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        สถานะ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ผู้รายงาน
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        วันที่
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        การจัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reports.slice(0, 10).map((report) => (
                      <tr key={report.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {report.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.image_url ? (
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={report.image_url.startsWith('/') ? report.image_url : `/${report.image_url}`}
                                alt="รูปประกอบรายงาน"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.parentElement!.innerHTML = `
                                    <div class="w-full h-full bg-gray-200 flex items-center justify-center">
                                      <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                    </div>
                                  `;
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.location_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            report.status === 'APPROVED'
                              ? 'bg-green-100 text-green-800'
                              : report.status === 'REJECTED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {report.status === 'APPROVED'
                              ? 'อนุมัติ'
                              : report.status === 'REJECTED'
                              ? 'ไม่อนุมัติ'
                              : 'รอตรวจสอบ'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.user.name || report.user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(report.created_at).toLocaleDateString('th-TH')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {report.status === 'PENDING' ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => updateReportStatus(report.id, 'APPROVED')}
                                disabled={updatingStatus === report.id}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {updatingStatus === report.id ? 'กำลังอัปเดต...' : 'อนุมัติ'}
                              </button>
                              <button
                                onClick={() => updateReportStatus(report.id, 'REJECTED')}
                                disabled={updatingStatus === report.id}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {updatingStatus === report.id ? 'กำลังอัปเดต...' : 'ปฏิเสธ'}
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">
                              {report.status === 'APPROVED' ? 'อนุมัติแล้ว' : 'ปฏิเสธแล้ว'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        </main>
      </div>
    </AuthErrorBoundary>
  )
}
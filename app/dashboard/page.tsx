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
  const [deletingReport, setDeletingReport] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{reportId: string, title: string} | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [filterType, setFilterType] = useState<string>('ALL')
  const { user, loading } = useAuth()
  const router = useRouter()
  
  const itemsPerPage = 10

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

  const deleteReport = async (reportId: string) => {
    setDeletingReport(reportId)
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove the report from the list
        setReports(prev => prev.filter(report => report.id !== reportId))
        setDeleteConfirm(null)
        
        // Adjust current page if needed
        const newFilteredReports = reports.filter(report => 
          report.id !== reportId &&
          (filterStatus === 'ALL' || report.status === filterStatus) &&
          (filterType === 'ALL' || report.location_type === filterType)
        )
        const newTotalPages = Math.ceil(newFilteredReports.length / itemsPerPage)
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages)
        }
      } else {
        const errorData = await response.json()
        console.error('Failed to delete report:', errorData.error)
        alert('ไม่สามารถลบรายงานได้ กรุณาลองใหม่')
      }
    } catch (error) {
      console.error('Error deleting report:', error)
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setDeletingReport(null)
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
  
  // Filter reports based on status and type
  const filteredReports = reports.filter(report => {
    const statusMatch = filterStatus === 'ALL' || report.status === filterStatus
    const typeMatch = filterType === 'ALL' || report.location_type === filterType
    return statusMatch && typeMatch
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedReports = filteredReports.slice(startIndex, endIndex)

  // Get unique location types for filter
  const uniqueLocationTypes = [...new Set(reports.map(report => report.location_type))]
  
  const stats = {
    total: reports.length,
    pending: reports.filter((r) => r.status === 'PENDING').length,
    approved: reports.filter((r) => r.status === 'APPROVED').length,
    rejected: reports.filter((r) => r.status === 'REJECTED').length,
    filtered: filteredReports.length,
  }

  return (
    <AuthErrorBoundary>
      <div className="min-h-screen bg-gray-100">
        <Header />

        {/* Page Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1 text-sm">ติดตามสถิติและจัดการรายงานของคุณ</p>
          </div>
        </div>

        <main className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-4">
          <nav className="flex space-x-4">
            <Link
              href="/"
              className="text-gray-700 hover:text-gray-900 text-sm"
            >
              ← กลับหน้าหลัก
            </Link>
            <Link
              href="/healthy"
              className="text-green-600 hover:text-green-700 text-sm"
            >
              รายงานพื้นที่สาธารณะ
            </Link>
          </nav>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded p-3">
            <div className="text-xs text-gray-500 uppercase">รายงานทั้งหมด</div>
            <div className="text-lg font-semibold text-gray-900 mt-1">{stats.total}</div>
          </div>

          <div className="bg-white border border-gray-200 rounded p-3">
            <div className="text-xs text-gray-500 uppercase">รอการตรวจสอบ</div>
            <div className="text-lg font-semibold text-orange-600 mt-1">{stats.pending}</div>
          </div>

          <div className="bg-white border border-gray-200 rounded p-3">
            <div className="text-xs text-gray-500 uppercase">อนุมัติแล้ว</div>
            <div className="text-lg font-semibold text-green-600 mt-1">{stats.approved}</div>
          </div>

          <div className="bg-white border border-gray-200 rounded p-3">
            <div className="text-xs text-gray-500 uppercase">ไม่อนุมัติ</div>
            <div className="text-lg font-semibold text-red-600 mt-1">{stats.rejected}</div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white border border-gray-200 rounded mb-4">
          <div className="px-4 py-3">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              กรองข้อมูล
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  สถานะ
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                >
                  <option value="ALL">ทั้งหมด</option>
                  <option value="PENDING">รอตรวจสอบ</option>
                  <option value="APPROVED">อนุมัติแล้ว</option>
                  <option value="REJECTED">ไม่อนุมัติ</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  ประเภทสถานที่
                </label>
                <select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                >
                  <option value="ALL">ทั้งหมด</option>
                  {uniqueLocationTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilterStatus('ALL')
                    setFilterType('ALL')
                    setCurrentPage(1)
                  }}
                  className="w-full px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  ล้างตัวกรอง
                </button>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              แสดง {stats.filtered} จาก {stats.total} รายงาน
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white border border-gray-200 rounded">
          <div className="px-4 py-3">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              รายงาน
            </h3>
            {reportsLoading ? (
              <div className="text-center py-6">
                <div className="text-gray-500 text-sm">กำลังโหลดรายงาน...</div>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-gray-500 text-sm">ยังไม่มีรายงาน</div>
                <Link
                  href="/healthy"
                  className="mt-2 inline-block text-gray-700 hover:text-gray-900 text-sm"
                >
                  สร้างรายงานแรกของคุณ →
                </Link>
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                        หัวข้อ
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                        รายละเอียด
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                        รูปภาพ
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                        สถานที่
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                        ประเภท
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                        สถานะ
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                        ผู้รายงาน
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                        วันที่
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                        การจัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedReports.map((report) => (
                      <tr key={report.id}>
                        <td className="px-3 py-2 text-xs text-gray-900 max-w-32">
                          <div className="truncate" title={report.title}>
                            {report.title}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-500 max-w-32">
                          <div className="truncate" title={report.description || 'ไม่มีรายละเอียด'}>
                            {report.description || 'ไม่มีรายละเอียด'}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-500">
                          {report.image_url ? (
                            <div className="w-10 h-10 rounded overflow-hidden bg-gray-100">
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
                                      <div class="w-3 h-3 bg-gray-400 rounded"></div>
                                    </div>
                                  `;
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                              <div className="w-3 h-3 bg-gray-400 rounded"></div>
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-500 max-w-24">
                          <div className="truncate" title={report.location}>
                            {report.location}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-500">
                          {report.location_type}
                        </td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex px-1 py-0.5 text-xs rounded ${
                            report.status === 'APPROVED'
                              ? 'bg-green-100 text-green-700'
                              : report.status === 'REJECTED'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {report.status === 'APPROVED'
                              ? 'อนุมัติ'
                              : report.status === 'REJECTED'
                              ? 'ไม่อนุมัติ'
                              : 'รอตรวจสอบ'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-500 max-w-24">
                          <div className="truncate" title={report.user.name || report.user.email}>
                            {report.user.name || report.user.email}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-500">
                          {new Date(report.created_at).toLocaleDateString('th-TH')}
                        </td>
                        <td className="px-3 py-2 text-xs">
                          <div className="flex space-x-1">
                            {report.status === 'PENDING' ? (
                              <>
                                <button
                                  onClick={() => updateReportStatus(report.id, 'APPROVED')}
                                  disabled={updatingStatus === report.id}
                                  className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {updatingStatus === report.id ? '...' : 'อนุมัติ'}
                                </button>
                                <button
                                  onClick={() => updateReportStatus(report.id, 'REJECTED')}
                                  disabled={updatingStatus === report.id}
                                  className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {updatingStatus === report.id ? '...' : 'ปฏิเสธ'}
                                </button>
                              </>
                            ) : (
                              <span className="text-gray-400 text-xs">
                                {report.status === 'APPROVED' ? 'อนุมัติแล้ว' : 'ปฏิเสธแล้ว'}
                              </span>
                            )}
                            <button
                              onClick={() => setDeleteConfirm({reportId: report.id, title: report.title})}
                              disabled={deletingReport === report.id || updatingStatus === report.id}
                              className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {deletingReport === report.id ? '...' : 'ลบ'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination */}
            {!reportsLoading && filteredReports.length > 0 && totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-3">
                <div className="text-xs text-gray-600">
                  แสดง {startIndex + 1} ถึง {Math.min(endIndex, filteredReports.length)} จาก {filteredReports.length} รายงาน
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-2 py-1 text-xs text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ก่อนหน้า
                  </button>
                  
                  <div className="flex space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                      if (
                        page === 1 || 
                        page === totalPages || 
                        (page >= currentPage - 2 && page <= currentPage + 2)
                      ) {
                        return (
                          <button
                            key={page}
                            type="button"
                            onClick={() => setCurrentPage(page)}
                            className={`px-2 py-1 text-xs rounded ${
                              page === currentPage
                                ? 'bg-gray-800 text-white'
                                : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      } else if (
                        page === currentPage - 3 || 
                        page === currentPage + 3
                      ) {
                        return (
                          <span key={page} className="px-1 py-1 text-xs text-gray-400">
                            ...
                          </span>
                        )
                      }
                      return null
                    })}
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 text-xs text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ถัดไป
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        </main>
        
        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded p-4 max-w-md w-full mx-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                ยืนยันการลบรายงาน
              </h3>
              <p className="text-xs text-gray-600 mb-4">
                คุณแน่ใจหรือไม่ที่จะลบรายงาน "{deleteConfirm.title}" การกระทำนี้ไม่สามารถยกเลิกได้
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deletingReport === deleteConfirm.reportId}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => deleteReport(deleteConfirm.reportId)}
                  disabled={deletingReport === deleteConfirm.reportId}
                  className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {deletingReport === deleteConfirm.reportId ? 'กำลังลบ...' : 'ลบ'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthErrorBoundary>
  )
}
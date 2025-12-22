'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'

interface Report {
  id: string
  title: string
  description: string | null
  location: string
  location_type: string
  image_url: string | null
  created_at: string
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('/api/reports')
        if (response.ok) {
          const data = await response.json()
          const approved = data.reports?.filter((report: any) => report.status === 'APPROVED') || []
          setReports(approved)
        }
      } catch (error) {
        console.error('Error fetching reports:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-3 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-light text-gray-800">Reports</h1>
              <p className="text-xs text-gray-500 mt-1">พื้นที่แสดงความเห็นสาธารณะ</p>
            </div>
            <Link
              href="/"
              className="text-xs text-gray-600 hover:text-gray-800 font-light"
            >
              หน้าหลัก
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto py-6 px-3">
        {/* Stats */}
        <div className="mb-6">
          <div className="border border-gray-100 rounded p-3 inline-block">
            <div className="text-xs font-light text-gray-500">Reports ทั้งหมด</div>
            <div className="text-lg font-light text-gray-800">{reports.length}</div>
          </div>
        </div>

        {/* Table */}
        <div className="border border-gray-100 rounded overflow-hidden">
          {loading ? (
            <div className="p-6 text-center">
              <div className="text-xs text-gray-500">กำลังโหลด...</div>
            </div>
          ) : reports.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-600 text-sm mb-3">ยังไม่มี Reports</p>
              <Link 
                href="/healthy"
                className="inline-block border border-gray-200 hover:border-gray-300 text-gray-600 px-4 py-2 rounded text-sm font-light transition-colors"
              >
                เริ่มรายงาน
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-light text-gray-600">
                      หัวข้อ
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-light text-gray-600">
                      รูป
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-light text-gray-600">
                      สถานที่
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-light text-gray-600">
                      ประเภท
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-light text-gray-600">
                      รายละเอียด
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-light text-gray-600">
                      วันที่
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report, index) => (
                    <tr key={report.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-3 py-2 text-xs font-light text-gray-800 max-w-32">
                        <div className="line-clamp-2">{report.title}</div>
                      </td>
                      <td className="px-3 py-2">
                        {report.image_url ? (
                          <div className="w-8 h-8 rounded overflow-hidden bg-gray-50">
                            <img
                              src={report.image_url}
                              alt="รูป"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                            <div className="w-3 h-3 bg-gray-300 rounded"></div>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-xs font-light text-gray-600 max-w-24 truncate">
                        {report.location}
                      </td>
                      <td className="px-3 py-2 text-xs font-light text-gray-600">
                        {report.location_type}
                      </td>
                      <td className="px-3 py-2 text-xs font-light text-gray-600 max-w-48">
                        <div className="line-clamp-2">
                          {report.description || '-'}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs font-light text-gray-600">
                        {new Date(report.created_at).toLocaleDateString('th-TH', { 
                          day: '2-digit', 
                          month: '2-digit',
                          year: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <Link 
            href="/"
            className="inline-flex items-center text-green-600 hover:text-green-700 text-sm font-light"
          >
            กลับหน้าหลัก
          </Link>
        </div>
      </main>
    </div>
  )
}
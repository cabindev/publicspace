'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ApprovedReport {
  id: string
  title: string
  description: string | null
  location: string
  location_type: string
  image_url: string | null
  created_at: string
}

export default function ReportsSection() {
  const [approvedReports, setApprovedReports] = useState<ApprovedReport[]>([])
  const [reportsLoading, setReportsLoading] = useState(true)

  useEffect(() => {
    const fetchApprovedReports = async () => {
      try {
        const response = await fetch('/api/reports')
        if (response.ok) {
          const data = await response.json()
          const approved = data.reports?.filter((report: any) => report.status === 'APPROVED') || []
          setApprovedReports(approved.slice(0, 12)) // แสดงแค่ 12 รายการสำหรับ feed
        }
      } catch (error) {
        console.error('Error fetching approved reports:', error)
      } finally {
        setReportsLoading(false)
      }
    }

    fetchApprovedReports()
  }, [])

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Reports
          </h2>
          <p className="text-sm text-gray-600">พื้นที่แสดงความเห็นสาธารณะ</p>
        </div>
        
        {reportsLoading ? (
          <div className="space-y-3 max-h-96 overflow-hidden">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : approvedReports.length > 0 ? (
          <div className="relative">
            <div className="max-h-96 overflow-hidden">
              <div className="space-y-2 animate-scroll">
                {/* แสดงรายงานซ้ำสำหรับ loop effect */}
                {[...approvedReports, ...approvedReports].map((report, index) => (
                  <div key={`${report.id}-${index}`} className="flex items-center space-x-3 p-3 bg-white hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors group">
                    <div className="w-12 h-12 flex-shrink-0">
                      {report.image_url ? (
                        <img
                          src={report.image_url}
                          alt="Report"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-green-600 transition-colors">
                        {report.title}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                        <span className="flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          <span className="truncate max-w-20">{report.location}</span>
                        </span>
                        <span>•</span>
                        <span className="text-green-600">{report.location_type}</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-400 flex-shrink-0">
                      {new Date(report.created_at).toLocaleDateString('th-TH', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-600 text-sm mb-3">ยังไม่มี Reports</p>
            <Link 
              href="/healthy"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              เริ่มรายงาน
            </Link>
          </div>
        )}
        
        {approvedReports.length > 0 && (
          <div className="text-center mt-6">
            <Link 
              href="/reports"
              className="inline-flex items-center text-green-600 hover:text-green-700 text-sm font-medium"
            >
              ดูทั้งหมด
              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
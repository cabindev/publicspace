import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ReportsSection from '@/components/ReportsSection'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <Header />

      {/* Hero Section with Image Background */}
      <div 
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/assets/BG Public.png')"
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>
        
        <main className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-block mb-6">
              <div className="text-white px-6 py-3 text-lg font-semibold mb-4">
                พื้นที่สาธารณะเป็นของทุกคน
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Healthy Public Spaces
            </h1>
            <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto leading-relaxed mb-4 drop-shadow-md">
              Creating a healthier environment for everyone
            </p>
            <p className="text-lg text-orange-200 max-w-2xl mx-auto leading-relaxed">
              ขอบคุณที่ไม่สูบไม่ดื่มในที่สาธารณะ
            </p>
          
            
            {/* Call to action */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/healthy"
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                เริ่มรายงาน
              </Link>
              <Link 
                href="/dashboard"
                className="border-2 border-white text-white hover:bg-white hover:text-orange-600 px-8 py-3 rounded-lg text-lg font-medium transition-all duration-300"
              >
                ดู Dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>

      {/* Reports Section */}
      <ReportsSection />

      {/* YouTube Videos Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              วิดีโอแนะนำ
            </h2>
            <p className="text-xl text-gray-600">เรียนรู้เกี่ยวกับพื้นที่สาธารณะที่ดีต่อสุขภาพ</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <div className="relative mb-4">
                <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold absolute top-2 right-2 z-10">
                  NEW
                </div>
                <iframe 
                  className="w-full h-48 rounded-lg"
                  src="https://www.youtube.com/embed/9joqA72w9WM"
                  title="การค้นพบ AmaZing Destination"
                  style={{ border: 0 }}
                  allowFullScreen
                ></iframe>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">การค้นพบ (Discovery)</h3>
              <p className="text-gray-600">การค้นพบ 'AmaZing Destination'</p>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <div className="relative mb-4">
                <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold absolute top-2 right-2 z-10">
                  NEW
                </div>
                <iframe 
                  className="w-full h-48 rounded-lg"
                  src="https://www.youtube.com/embed/Z19yLOiI79w"
                  title="ผิดอะไร?"
                  style={{ border: 0 }}
                  allowFullScreen
                ></iframe>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">ผิดอะไร? (What's Wrong?)</h3>
              <p className="text-gray-600">พื้นที่สาธารณะเป็นของทุกคน</p>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <div className="relative mb-4">
                <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold absolute top-2 right-2 z-10">
                  NEW
                </div>
                <iframe 
                  className="w-full h-48 rounded-lg"
                  src="https://www.youtube.com/embed/saw_k4Oy_sA"
                  title="ผิดอะไร 15sec"
                  style={{ border: 0 }}
                  allowFullScreen
                ></iframe>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">ผิดอะไร 15sec</h3>
              <p className="text-gray-600">พื้นที่สาธารณะเป็นของทุกคน</p>
            </div>
          </div>
          
          <div className="text-center">
            <a 
              href="https://www.youtube.com/@healthypublicspaces-up7us"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg text-lg font-medium transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              ดูวิดีโอเพิ่มเติม
            </a>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">


        </div>
      </section>

      {/* Partner Logos */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">พันธมิตรร่วมโครงการ</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 max-w-6xl mx-auto">
              {[
                { src: "/sss.svg", alt: "สสส Logo" },
                { src: "/sdnth.svg", alt: "สคล Logo" },
                { src: "/logo sdn.svg", alt: "SDN Thailand Logo" },
                { src: "/logo plungsungkom.svg", alt: "พลังสังคม Logo" },
                { src: "/public.svg", alt: "Public Logo" },
                { src: "/assets/civicspace.png", alt: "Civic Space Logo" }
              ].map((logo, index) => (
                <div key={index} className="flex items-center justify-center p-6 rounded-xl hover:shadow-lg hover-lift transition-all">
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={120}
                    height={60}
                    className="max-w-full h-auto opacity-70 hover:opacity-100 transition-opacity"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
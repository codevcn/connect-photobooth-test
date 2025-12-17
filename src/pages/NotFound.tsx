import { fillQueryStringToURL } from '@/utils/helpers'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="h-screen w-screen bg-linear-to-br from-superlight-main-cl via-light-main-cl to-pink-50 flex items-center justify-center p-4 overflow-hidden">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-light-main-cl rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-main-hover-cl rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-superlight-main-cl rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl w-full">
        {/* 404 Number */}
        <div className="text-center mb-8">
          <h1 className="text-[12rem] font-black leading-none bg-linear-to-br from-main-cl via-main-hover-cl to-dark-main-cl bg-clip-text text-transparent drop-shadow-2xl animate-pulse-slow select-none">
            404
          </h1>
          <div className="relative -mt-20">
            <div className="relative bg-white/60 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/20">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Oops! Trang không tồn tại</h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Có vẻ như bạn đã đi lạc rồi... 🤔
                <br />
                Trang này có thể đã bị di chuyển hoặc chưa bao giờ tồn tại!
              </p>

              {/* Action buttons */}
              <div className="flex flex-col gap-4 justify-center">
                <button
                  onClick={() => window.history.back()}
                  className="group flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-800 font-bold rounded-xl shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-main-cl transform hover:scale-105 transition-all duration-200 active:scale-95"
                >
                  <svg
                    className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  <span>Back</span>
                </button>

                <Link
                  to={'/' + fillQueryStringToURL()}
                  className="group flex items-center justify-center gap-2 px-8 py-4 bg-main-cl hover:bg-dark-main-cl text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 active:scale-95"
                >
                  <svg
                    className="w-5 h-5 group-hover:scale-110 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  <span>Home</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

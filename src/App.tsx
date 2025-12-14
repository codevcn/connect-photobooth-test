window.requestIdleCallback =
  window.requestIdleCallback ||
  function (handler) {
    let startTime = Date.now()
    return setTimeout(function () {
      handler({
        didTimeout: false,
        timeRemaining: function () {
          return Math.max(0, 50 - (Date.now() - startTime))
        },
      })
    }, 1)
  }

window.cancelIdleCallback =
  window.cancelIdleCallback ||
  function (id) {
    clearTimeout(id)
  }

import { Routes, Route, BrowserRouter } from 'react-router-dom'
import EditPagePTM from '@/pages/edit/Layout-Ptm'
import EditPageFUN from '@/pages/edit/Layout-Fun'
import EditPageDev from '@/pages/edit/Layout-Dev'
import NotFound from '@/pages/NotFound'
import { LocalStorageHelper } from './utils/localstorage'
import { ToastContainer } from 'react-toastify'
import ScanQRPage from './pages/scan-qr/Page'
import { AppRootProvider } from './providers/RootProvider'
import { useEffect } from 'react'
import IntroPage from './pages/intro/Page'
import { isHomePage } from './utils/helpers'
import PaymentPage from './pages/payment/Page'
import { usePrintedImageStore } from './stores/printed-image/printed-image.store'
import MaintainPage from './pages/maintain/Page'
import { AppTempContainer } from './components/custom/TempContainer'
import { Dev } from './dev/pages/Dev'
import { GlobalKeyboardProvider } from './providers/GlobalKeyboardProvider'
import { useQueryFilter } from './hooks/extensions'

// const IdleCountdown = () => {
//   const navigate = useNavigate()

//   const { showWarning, warningCountdown, confirmActive } = useIdleDetector({
//     idleTimeout: 36000, // 36 giây không hoạt động
//     warningTimeout: 10000, // 10 giây cảnh báo
//     onIdle: () => {
//       // Quay về trang chủ khi hết thời gian
//       navigate('/')
//       LocalStorageHelper.clearAllMockupData()
//     },
//   })

//   return (
//     !isHomePage() && (
//       <IdleWarningModal show={showWarning} countdown={warningCountdown} onConfirm={confirmActive} />
//     )
//   )
// }

// Component để quản lý routes dựa trên query string
function AppRoutes() {
  const queryFilter = useQueryFilter()
  const { clearAllPrintedImages } = usePrintedImageStore()

  const handleReturnHome = () => {
    if (isHomePage()) {
      LocalStorageHelper.clearAllMockupData()
    }
  }

  useEffect(() => {
    handleReturnHome()
  }, [location.pathname])

  useEffect(() => {
    LocalStorageHelper.clearAllMockupData()
    return () => {
      clearAllPrintedImages()
    }
  }, [])

  // Routes cho Photoism
  if (queryFilter.isPhotoism) {
    return (
      <>
        <Routes>
          <Route path="/" element={<IntroPage />} />
          <Route path="/qr" element={<ScanQRPage />} />
          <Route path="/edit" element={<EditPagePTM />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <GlobalKeyboardProvider />
      </>
    )
  }

  // Routes cho Fun Studio
  if (queryFilter.funId) {
    return (
      <Routes>
        <Route path="/" element={<EditPageFUN />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    )
  }

  // Routes cho Dev mode
  if (queryFilter.dev) {
    return (
      <>
        <Routes>
          <Route path="/" element={<EditPageDev />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/dev" element={<Dev />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <GlobalKeyboardProvider />
      </>
    )
  }

  // Không có query string hợp lệ
  return <NotFound />
}

function App() {
  return (
    <AppRootProvider>
      <AppTempContainer />
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored" // "light" | "dark" | "colored"
        toastStyle={{ color: '#fff', fontWeight: 'bold' }}
      />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppRootProvider>
  )
}

function AppWrapper() {
  return <App />
}

export default AppWrapper

import { useContext, Suspense, lazy } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Login from './components/Login'
import CommandPalette from './components/CommandPalette'
import { AppContext } from './context/AppContext'
import { ToastContainer } from 'react-toastify'
import ScrollToFooterButton from './components/ScrollToFooterButton'

const Home      = lazy(() => import('./pages/Home'))
const Result    = lazy(() => import('./pages/Result'))
const BuyCredit = lazy(() => import('./pages/BuyCredit'))
const History   = lazy(() => import('./pages/History'))
const Admin     = lazy(() => import('./pages/Admin'))
const Invoices  = lazy(() => import('./pages/Invoices'))

const FallbackLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="flex flex-col items-center gap-3">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      <p className="text-sm text-gray-400">Loading...</p>
    </div>
  </div>
)

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -16 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
)

const App = () => {
  const { showLogin } = useContext(AppContext)
  const location = useLocation()

  return (
    <>
      <Navbar />
      <div className='px-4 sm:px-10 md:px-14 lg:px-28 min-h-screen bg-gradient-to-b from-teal-50 to-orange-50 dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-800 dark:text-gray-100 transition-colors duration-300'>
        <ToastContainer position='bottom-right' theme='colored' />
        {showLogin && <Login />}
        <CommandPalette />
        <Suspense fallback={<FallbackLoader />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path='/'         element={<PageWrapper><Home /></PageWrapper>} />
              <Route path='/result'   element={<PageWrapper><Result /></PageWrapper>} />
              <Route path='/buy'      element={<PageWrapper><BuyCredit /></PageWrapper>} />
              <Route path='/history'  element={<PageWrapper><History /></PageWrapper>} />
              <Route path='/invoices' element={<PageWrapper><Invoices /></PageWrapper>} />
              <Route path='/admin'    element={<PageWrapper><Admin /></PageWrapper>} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </div>
      <Footer />
      <ScrollToFooterButton />
    </>
  )
}

export default App
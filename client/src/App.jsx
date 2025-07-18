import { useContext } from 'react'
import Home from './pages/Home'
import Result from './pages/Result'
import BuyCredit from './pages/BuyCredit'
import {Routes,Route} from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Login from './components/Login'
import { AppContext } from './context/AppContext'
import { ToastContainer } from 'react-toastify';
import ScrollToFooterButton from './components/ScrollToFooterButton';
const App = () => {
  const {showLogin} = useContext (AppContext)
  return (
    <>
      <Navbar/>
      <div className='px-4 sm:px-10 md:px-14 lg:px-28 min-h-screen bg-gradient-to-b from-teal-50 to-orange-50 dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-800 dark:text-gray-100'>
        <ToastContainer position='bottom-right'/>
        {showLogin && <Login/>}
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/result' element={<Result/>}/>
          <Route path='/buy' element={<BuyCredit/>}/>
        </Routes>
      </div>
      <Footer/>
      <ScrollToFooterButton />
    </>
  )
}

export default App
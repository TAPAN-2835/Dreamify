import { useContext } from 'react'
import { assets } from '../assets/assets'
import { Link, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
const Navbar = () => {
    const {user,setShowLogin,logout,credit} = useContext(AppContext)
    const navigate = useNavigate();
    return (
        <div className='w-full sticky top-0 left-0 z-50 bg-gradient-to-b from-teal-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 shadow flex items-center justify-between py-3 px-4 sm:px-10 md:px-14 lg:px-28'>
            <button onClick={() => { navigate('/'); setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100); }} className='focus:outline-none'>
                <img src={assets.logo} alt="" className='w-40 sm:w-50 lg:w-62' />
            </button>

            <div>
                {user ?
                 <div className='flex items-center gap-2 sm:gap-3'>
                    <button onClick={()=>navigate('/buy')} className='flex items-center gap-2 bg-blue-100 px-4 sm:px-6 py-1.5 sm:py-3 rounded-full hover:scale-105 transition-all duration-700'>
                        <img className='w-5' src={assets.credit_star} alt="" />
                        <p className='text-xs sm:text-sm font-medium text-gray-600'>Credits Left : {credit}</p>
                    </button>
                    {/* Desktop/tablet greeting */}
                    <p className='text-gray-600 hidden sm:block pl-4'>Hi , {user.name}</p>
                    <div className='relative group'>
                        <img src={assets.profile_icon} className='w-10 drop-shadow' alt="" />
                        <div className='absolute hidden group-hover:block top-0 right-0 z-10 text-black pt-12'>
                            <ul className='list-none m-0 p-0 text-sm'>
                                <li onClick={logout} className='rounded-full bg-blue-600 text-white px-6 py-2 cursor-pointer hover:bg-black transition text-center'>Logout</li>
                            </ul>

                        </div>
                    </div>
                </div> 
                : 
                <div className='flex items-center gap-2 sm:gap-5'>
                    <p onClick={()=>navigate('/buy')} className='cursor-pointer'>Pricing</p>
                    <button onClick={()=>setShowLogin(true)} className='bg-zinc-800 text-white px-7 py-2 sm:px-10 text-sm rounded-full '>Login</button>
                </div>}
            </div>
        </div>
    )
}

export default Navbar
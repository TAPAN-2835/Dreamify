import { useContext, useState, useEffect, useRef } from 'react'
import { assets } from '../assets/assets'
import { Link, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
const Navbar = () => {
    const {user,setShowLogin,logout,credit} = useContext(AppContext)
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileRef = useRef(null);

    const handleProfileClick = () => {
        setShowProfileMenu(!showProfileMenu);
    };

    const handleLogout = () => {
        logout();
        setShowProfileMenu(false);
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };

        if (showProfileMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showProfileMenu]);

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
                    <div className='relative' ref={profileRef}>
                        <button 
                            onClick={handleProfileClick}
                            className='focus:outline-none hover:scale-105 transition-transform duration-200'
                        >
                            <img src={assets.profile_icon} className='w-10 drop-shadow' alt="Profile" />
                        </button>
                        {showProfileMenu && (
                            <div className='absolute top-full right-0 mt-2 z-50'>
                                <ul className='list-none m-0 p-0 text-sm'>
                                    <li onClick={handleLogout} className='rounded-full bg-blue-600 text-white px-6 py-2 cursor-pointer hover:bg-black transition text-center shadow-lg'>Logout</li>
                                </ul>
                            </div>
                        )}
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
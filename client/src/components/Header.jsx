import { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { motion } from "framer-motion"
import {AppContext} from '../context/AppContext'
import {useNavigate} from 'react-router-dom'

const sampleImages = [assets.sample_img_3, assets.sample_img_4, assets.sample_img_5, assets.sample_img_6];

const Header = () => {
  const {user,setShowLogin} = useContext(AppContext)
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalImg, setModalImg] = useState(null)

  const onClickHandler = ()=>{
    if (user) {
      navigate('/result')
    }
    else{
      setShowLogin(true)
    }
  }

  // Modal open
  const handleImgClick = (img) => {
    setModalImg(img)
    setModalOpen(true)
  }
  const closeModal = () => {
    setModalOpen(false)
    setModalImg(null)
  }

  return (
    <motion.div className='flex flex-col justify-center items-center text-center py-8' initial={{ opacity: 0.2, y: 100 }} transition={{ duration: 1 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      {/* Mobile greeting above oval text */}
      {user && (
        <div className="sm:hidden flex justify-center w-full mb-4">
          <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-100 to-orange-100 shadow text-blue-800 font-semibold text-sm">
            <span role="img" aria-label="wave">👋</span> Hi, {user.name}
          </span>
        </div>
      )}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className='text-stone-500 inline-flex text-center gap-2 bg-white px-6 py-1 rounded-full border border-neutral-500 -mt-3 sm:mt-0 mt-2'>
        <p>Dreamify: The Best AI Image Generator</p>
        <img src={assets.star_icon} alt="" />
      </motion.div>

      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 2 }} className='text-4xl max-w-[300px] sm:text-7xl sm:max-w-[590px]  mx-auto mt-5 text-center'>Turn Text Into <span className='text-blue-600'>Images</span>, Instantly. </motion.h1>

      <motion.p className='text-center max-w-xl mx-auto mt-5' initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.6,duration:0.8}} >Bring your imagination to life with Dreamify. Type your idea, and our AI creates your visual masterpiece in seconds.</motion.p>

      <motion.button onClick={onClickHandler} className='sm:text-lg text-white bg-black w-auto mt-8 px-12 py-2.5 flex items-center gap-2 rounded-full shadow-lg hover:scale-110 hover:bg-blue-700 transition-all duration-300' whileHover={{scale:1.1, backgroundColor:'#2563eb'}} whileTap={{scale:0.95}} initial={{opacity:0}} animate={{opacity:1}} transition={{default:{duration:0.5},opacity:{delay:0.8,duration:1}}}>
        Generate Images
        <img className='h-6' src={assets.star_group} alt="" />
      </motion.button>

      {/* Sample Images Section (2x2 grid on mobile, row on larger screens) */}
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1,duration:1}} className='flex flex-col items-center mt-16 gap-3 w-full'>
        <div className='grid grid-cols-2 grid-rows-2 gap-4 w-full max-w-xs sm:flex sm:flex-row sm:gap-6 sm:justify-center sm:max-w-2xl md:max-w-3xl'>
          {sampleImages.map((img, idx) => (
            <motion.img
              key={idx}
              whileHover={{scale:1.05,duration:0.1}}
              className='rounded-lg hover:scale-105 transition-all duration-300 cursor-pointer w-40 h-40 object-cover shadow-lg sm:w-52 sm:h-52 md:w-64 md:h-64 flex-shrink-0'
              src={img}
              alt={`Sample generated image ${idx+1}`}
              onClick={() => handleImgClick(img)}
            />
          ))}
        </div>
      </motion.div>
      <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.2,duration:0.8}} className='mt-6 text-neutral-600'>Generated images from Dreamify</motion.p>

      {/* Modal for image preview */}
      {modalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50'>
          <div className='bg-white p-4 rounded-lg shadow-lg relative'>
            <button onClick={closeModal} aria-label='Close preview modal' className='absolute top-2 right-2 text-gray-500 hover:text-black text-xl' tabIndex={0}>&times;</button>
            <img src={modalImg} alt='Large preview of generated sample image' className='max-w-xs max-h-[70vh] rounded' />
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default Header
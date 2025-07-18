import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import {motion} from 'framer-motion'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';
import Button from './Button';

const GenerateBtn = () => {
  const {user,setShowLogin} = useContext(AppContext)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const onClickHandler = async () => {
    setLoading(true)
    try {
      if (user) {
        toast.success('Navigating to results!')
        navigate('/result')
      } else {
        setShowLogin(true)
        toast.info('Please log in to generate images.')
      }
    } catch {
      toast.error('An error occurred!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial = {{opacity:0.2 , y:100}}
      transition={{ duration:1}}
      whileInView={{opacity:1,y:0}}
      viewport={{once:true}}
      className='pb-16 text-center'>
        <h1 className='text-2xl md:text-3xl lg:text-4xl mt-4 font-semibold text-neutral-800 py-6'>See the magic Try now</h1>
        <Button onClick={onClickHandler} disabled={loading} className='inline-flex items-center gap-2 px-12 py-3 m-auto bg-zinc-900 text-white hover:bg-black hover:text-white group'>
          {loading ? (
            <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          ) : null}
          {loading ? 'Processing...' : 'Generate Images'}
          <img src={assets.star_group} alt="" className='h-6 transition-colors duration-200 group-hover:filter group-hover:brightness-0 group-hover:invert' />
        </Button>
    </motion.div>
  )
}

export default GenerateBtn
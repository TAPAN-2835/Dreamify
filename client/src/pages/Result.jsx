import { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { motion } from 'framer-motion'
import { AppContext } from '../context/AppContext'

const randomPrompts = [
  'A futuristic city skyline at sunset',
  'A cat wearing sunglasses',
  'A magical forest with glowing plants',
  'A robot painting a picture',
  'A mountain landscape in spring',
  'A bowl of ramen on a wooden table',
  'A fantasy castle on a hill',
  'A cute puppy playing with a ball',
];

const Result = () => {
  const [image, setImage] = useState(assets.sample_img_1)
  const [isImageLoaded, setImageLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState('')
  const [usedPrompt, setUsedPrompt] = useState('')
  const { generateImage } = useContext(AppContext)

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    setLoading(true)
    if (input) {
      const image = await generateImage(input)
      if (image) {
        setImageLoaded(true)
        setImage(image)
        setUsedPrompt(input)
      }
    }
    setLoading(false)
  }

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(usedPrompt || input)
  }

  const handleRandomPrompt = () => {
    const random = randomPrompts[Math.floor(Math.random() * randomPrompts.length)]
    setInput(random)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this AI generated image!',
        url: image
      })
    } else {
      navigator.clipboard.writeText(image)
    }
  }

  return (
    <motion.div className='flex flex-col min-h-[90vh] justify-center items-center bg-transparent py-10'>
      <div className='w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center'>
        {/* Image Preview */}
        <div className='relative mb-4 w-full flex justify-center items-center min-h-[256px]'>
          {loading ? (
            <div className="w-full h-64 flex items-center justify-center animate-pulse bg-gray-200 rounded-lg">
              <svg className="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            </div>
          ) : (
            <img src={image} alt="Generated" className='max-w-xs rounded-lg border shadow' loading="lazy" />
          )}
          <span className={`absolute bottom-0 left-0 h-1 bg-blue-500 ${loading ? 'w-full transition-all duration-[10s]' : 'w-0'}`}></span>
        </div>
        {/* Prompt Input & Generate Button */}
        {!isImageLoaded && (
          <form onSubmit={onSubmitHandler} className='w-full flex flex-col gap-3'>
              <input
                onChange={e => setInput(e.target.value)}
                value={input}
                type="text"
                placeholder='Describe what you want to generate'
              className='w-full bg-neutral-100 text-black text-base px-4 py-3 rounded-full placeholder-color outline-none mb-2 sm:mb-0'
                style={{ wordBreak: 'break-word', color: '#000' }}
              />
            <button type='submit' className='w-full bg-zinc-900 text-white py-3 text-base rounded-full hover:bg-black transition'>Generate</button>
            <div className='flex justify-between mt-2'>
              <button type='button' onClick={handleRandomPrompt} className='text-blue-600 hover:underline text-xs'>Try Random Prompt</button>
              <button type='button' onClick={handleCopyPrompt} className='text-blue-600 hover:underline text-xs'>Copy Prompt</button>
            </div>
          </form>
        )}
        {/* Download/Share Buttons */}
        {isImageLoaded && (
          <div className='w-full flex flex-col items-center gap-3 mt-4'>
            <div className='flex items-center gap-2'>
              <span className='text-gray-700 text-sm bg-gray-100 px-3 py-1 rounded-full'>{usedPrompt}</span>
              <button type='button' onClick={handleCopyPrompt} className='text-blue-600 hover:text-blue-800 hover:scale-105 transition text-xs'>Copy</button>
            </div>
            <div className='flex gap-2 flex-wrap justify-center text-white text-sm'>
              <button type='button' onClick={() => { setImageLoaded(false) }} className='bg-transparent border border-zinc-900 text-black px-8 py-3 rounded-full cursor-pointer hover:bg-gray-200 hover:scale-105 transition'>Generate Another</button>
              <a className='bg-zinc-900 px-10 py-3 rounded-full cursor-pointer hover:bg-gray-800 hover:scale-105 transition' href={image} download >Download</a>
              <button type='button' onClick={handleShare} className='bg-blue-600 px-10 py-3 rounded-full cursor-pointer hover:bg-blue-700 hover:scale-105 transition'>Share</button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default Result
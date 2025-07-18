import React from 'react'
import { assets, testimonialsData } from '../assets/assets'
import { motion } from 'framer-motion'

const starVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1 } })
};

const Testimonials = () => {
  return (
    <motion.div
      initial={{ opacity: 0.2, y: 100 }}
      transition={{ duration: 1 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className='flex flex-col items-center justify-center my-20 p-12'
    >
      <h1 className='text-3xl sm:text-4xl font-semibold mb-2'>Why People Love Dreamify</h1>
      <p className='text-gray-500 mb-12'>See why users call Dreamify the best AI image generator.</p>
      <div className='flex flex-wrap gap-8 justify-center'>
        {testimonialsData.map((testimonial, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className='bg-white/80 p-10 rounded-2xl shadow-2xl border border-gray-200 w-80 m-auto flex flex-col items-center min-h-[370px]'
          >
            <img src={testimonial.image} alt={`User avatar for ${testimonial.name}`} className='rounded-full w-16 border-4 border-blue-200 shadow mb-3' />
            <h2 className='text-xl font-semibold mt-1'>{testimonial.name}</h2>
            <p className='text-gray-500 mb-2'>{testimonial.role}</p>
            <div className='flex mb-4'>
              {Array(testimonial.stars).fill().map((_, i) => (
                <motion.img
                  key={i}
                  src={assets.rating_star}
                  alt='Star icon'
                  className='w-5 h-5'
                  custom={i}
                  variants={starVariants}
                  initial='hidden'
                  animate='visible'
                />
              ))}
            </div>
            <p className='text-center text-base text-gray-700 italic'>"{testimonial.text}"</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default Testimonials
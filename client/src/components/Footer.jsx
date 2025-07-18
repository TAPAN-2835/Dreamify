import { assets } from '../assets/assets'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

const iconVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.3 + i * 0.15, duration: 0.6, type: 'spring' } })
};

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleFooterNav = (sectionId) => {
    if (location.pathname === '/') {
      // Already on home, just scroll
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Go to home and pass scroll target
      navigate('/', { state: { scrollTo: sectionId } });
    }
  };

  return (
    <footer className="w-full bg-gradient-to-t from-orange-50 to-teal-50 dark:from-gray-800 dark:to-gray-900 border-t border-gray-200 pt-10 pb-6 px-4 flex flex-col items-center">
      {/* Logo and Tagline */}
      <div className="flex flex-col items-center mb-6">
        <img src={assets.logo} alt="Dreamify Logo" width={120} className="mb-2" />
        <motion.span
          className="font-semibold text-lg text-blue-700"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, type: 'spring' }}
        >
          Dreamify: The Best AI Image Generator
        </motion.span>
      </div>
      {/* Navigation Links */}
      <nav className="flex flex-wrap justify-center gap-6 mb-4 text-gray-700 font-medium">
        <button type="button" onClick={() => handleFooterNav('home')}>Home</button>
        <a href="/buy">Pricing</a>
        <button type="button" onClick={() => handleFooterNav('testimonials')}>Testimonials</button>
        <a href="https://mail.google.com/mail/?view=cm&fs=1&to=mrpatel2835@gmail.com&su=Dreamify%20Inquiry&body=Hello%2C%0A%0AI%20would%20like%20to%20inquire%20about..." target="_blank" rel="noopener noreferrer">Contact</a>
        <button type="button" onClick={() => handleFooterNav('faq-contact')}>FAQ</button>
      </nav>
      {/* Social Icons */}
      <motion.div className="flex gap-4 mb-4" initial="hidden" animate="visible">
        {/* LinkedIn */}
        <motion.a
          href="https://www.linkedin.com/in/tapan-patel-b91241288/"
          target="_blank"
          rel="noopener noreferrer"
          custom={0}
          variants={iconVariants}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" className="hover:scale-110 transition">
            <path d="M19,3H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z M9,15.7C9,16.4,8.4,17,7.7,17 c-0.7,0-1.3-0.6-1.3-1.3v-4.5C6.5,10.6,7,10,7.7,10C8.4,10,9,10.6,9,11.3V15.7z M7.7,8.7c-0.8,0-1.3-0.5-1.3-1.2 c0-0.7,0.5-1.2,1.4-1.2c0.8,0,1.3,0.5,1.3,1.2C9.1,8.2,8.6,8.7,7.7,8.7z M18,15.8c0,0.7-0.5,1.2-1.2,1.2s-1.2-0.5-1.2-1.2v-2.6 c0-1.1-0.7-1.2-0.9-1.2c-0.2,0-1.1,0-1.1,1.2v2.6c0,0.7-0.5,1.2-1.2,1.2h-0.1c-0.7,0-1.2-0.5-1.2-1.2v-4.5c0-0.7,0.6-1.3,1.3-1.3 s1.3,0.6,1.3,1.3c0,0,0.3-1.3,2.2-1.3c1.2,0,2.2,1,2.2,3.2V15.8z"></path>
          </svg>
        </motion.a>
        {/* Instagram */}
        <motion.a
          href="https://www.instagram.com/charming_tapan/"
          target="_blank"
          rel="noopener noreferrer"
          custom={1}
          variants={iconVariants}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" className="hover:scale-110 transition">
            <path d="M 8 3 C 5.239 3 3 5.239 3 8 L 3 16 C 3 18.761 5.239 21 8 21 L 16 21 C 18.761 21 21 18.761 21 16 L 21 8 C 21 5.239 18.761 3 16 3 L 8 3 z M 18 5 C 18.552 5 19 5.448 19 6 C 19 6.552 18.552 7 18 7 C 17.448 7 17 6.552 17 6 C 17 5.448 17.448 5 18 5 z M 12 7 C 14.761 7 17 9.239 17 12 C 17 14.761 14.761 17 12 17 C 9.239 17 7 14.761 7 12 C 7 9.239 9.239 7 12 7 z M 12 9 A 3 3 0 0 0 9 12 A 3 3 0 0 0 12 15 A 3 3 0 0 0 15 12 A 3 3 0 0 0 12 9 z"></path>
          </svg>
        </motion.a>
        {/* X (Twitter) */}
        <motion.a
          href="https://x.com/PatelTapan7032?t=te5oHww2W4Q5T2g9D2lTjg&s=09"
          target="_blank"
          rel="noopener noreferrer"
          custom={2}
          variants={iconVariants}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 30 30" className="hover:scale-110 transition">
            <path d="M 6 4 C 4.895 4 4 4.895 4 6 L 4 24 C 4 25.105 4.895 26 6 26 L 24 26 C 25.105 26 26 25.105 26 24 L 26 6 C 26 4.895 25.105 4 24 4 L 6 4 z M 8.6484375 9 L 13.259766 9 L 15.951172 12.847656 L 19.28125 9 L 20.732422 9 L 16.603516 13.78125 L 21.654297 21 L 17.042969 21 L 14.056641 16.730469 L 10.369141 21 L 8.8945312 21 L 13.400391 15.794922 L 8.6484375 9 z M 10.878906 10.183594 L 17.632812 19.810547 L 19.421875 19.810547 L 12.666016 10.183594 L 10.878906 10.183594 z"></path>
          </svg>
        </motion.a>
      </motion.div>
      {/* Contact Email */}
      <div className="mb-4 text-gray-600 text-sm">support@dreamify.com</div>
      {/* Legal Links */}
      <div className="flex flex-wrap justify-center gap-6 mb-4 text-gray-500 text-xs">
        <a href="#privacy">Privacy Policy</a>
        <a href="#terms">Terms of Service</a>
    </div>
      {/* Copyright */}
      <div className="text-gray-400 text-xs text-center mt-2">Made By Tapan © 2025 Dreamify. All rights reserved.</div>
    </footer>
  )
}

export default Footer
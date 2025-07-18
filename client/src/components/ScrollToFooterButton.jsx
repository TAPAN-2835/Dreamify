import React, { useState, useEffect } from 'react';
import Fab from '@mui/material/Fab';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const sectionOrder = ['home', 'about', 'testimonials', 'faq-contact', 'footer'];

const getSectionElement = (id) => {
  if (id === 'footer') return document.querySelector('footer');
  return document.getElementById(id);
};

const getCurrentSection = () => {
  // Find the section closest to the top of the viewport
  let minDiff = Infinity;
  let current = 'home';
  sectionOrder.forEach((id) => {
    const el = getSectionElement(id);
    if (el) {
      const rect = el.getBoundingClientRect();
      const diff = Math.abs(rect.top);
      if (rect.top <= window.innerHeight / 2 && diff < minDiff) {
        minDiff = diff;
        current = id;
      }
    }
  });
  return current;
};

const ScrollToFooterButton = () => {
  const [currentSection, setCurrentSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setCurrentSection(getCurrentSection());
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    // Check if any section exists (for home page)
    const hasSections = sectionOrder.some(id => getSectionElement(id));
    if (!hasSections) {
      // Not on home, just scroll to footer
      const footer = getSectionElement('footer');
      if (footer) {
        footer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }
    if (currentSection === 'footer') {
      // Scroll to home
      const home = getSectionElement('home');
      if (home) {
        home.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      // Scroll to next section
      const idx = sectionOrder.indexOf(currentSection);
      const nextId = sectionOrder[idx + 1];
      const nextSection = getSectionElement(nextId);
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // If next section doesn't exist, scroll to footer
        const footer = getSectionElement('footer');
        if (footer) {
          footer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  };

  const isAtFooter = currentSection === 'footer';
  // Responsive size for button and icon
  const fabSx = {
    position: 'fixed',
    bottom: 20,
    right: 20,
    zIndex: 1000,
    boxShadow: 3,
    width: { xs: 44, sm: 56 },
    height: { xs: 44, sm: 56 },
    minHeight: 'unset',
    minWidth: 'unset',
  };
  const iconFontSize = window.innerWidth < 640 ? '1.5rem' : '2rem';

  return (
    <Fab
      color="primary"
      aria-label={isAtFooter ? 'Scroll to home' : 'Scroll to next section'}
      onClick={handleClick}
      sx={fabSx}
    >
      {isAtFooter ? <KeyboardArrowUpIcon sx={{ fontSize: iconFontSize }} /> : <KeyboardArrowDownIcon sx={{ fontSize: iconFontSize }} />}
    </Fab>
  );
};

export default ScrollToFooterButton; 
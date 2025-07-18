import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../components/Header'
import Steps from '../components/Steps'
import Description from '../components/Description'
import Testimonials from '../components/Testimonials'
import GenerateBtn from '../components/GenerateBtn'

// Placeholder FAQ and Contact components
const FAQ = () => (
  <div className="p-8 bg-white rounded-2xl shadow-lg">
    <h2 className="text-2xl font-bold mb-4 text-blue-700">Frequently Asked Questions</h2>
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-lg">What is Dreamify?</h3>
        <p className="text-gray-600">Dreamify is an AI-powered image generator that turns your text prompts into stunning visuals instantly.</p>
      </div>
      <div>
        <h3 className="font-semibold text-lg">How do I use Dreamify?</h3>
        <p className="text-gray-600">Simply enter a description of the image you want, and our AI will generate it for you. Download or share your creation with one click!</p>
      </div>
      <div>
        <h3 className="font-semibold text-lg">Is there a free trial?</h3>
        <p className="text-gray-600">Yes! You can try Dreamify for free with limited credits. Upgrade anytime for more features and credits.</p>
      </div>
      <div>
        <h3 className="font-semibold text-lg">Can I use the images commercially?</h3>
        <p className="text-gray-600">Absolutely! All images you generate are yours to use for personal or commercial projects.</p>
      </div>
    </div>
  </div>
);

const HomeSection = () => (
  <section id="home">
    <Header />
  </section>
);

const AboutSection = () => (
  <section id="about">
    <Steps />
    <Description />
  </section>
);

const FAQContactSection = () => (
  <section id="faq-contact" className="py-20 px-4 bg-gradient-to-b from-orange-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
    <div className="max-w-3xl mx-auto flex justify-center">
      <FAQ />
    </div>
  </section>
);

const Home = () => {
  const location = useLocation();
  useEffect(() => {
    if (location.state && location.state.scrollTo) {
      const el = document.getElementById(location.state.scrollTo);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 100); // slight delay to ensure DOM is ready
      }
    }
  }, [location.state]);
  return (
    <div>
      <HomeSection />
      <AboutSection />
      <section id="testimonials">
        <Testimonials />
      </section>
      <FAQContactSection />
      <GenerateBtn />
    </div>
  )
}

export default Home
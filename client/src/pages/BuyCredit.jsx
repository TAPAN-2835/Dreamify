import { useContext } from 'react';
import { assets, plans } from '../assets/assets';
import { AppContext } from '../context/AppContext';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Button from '../components/Button';

const BuyCredit = () => {
  const { user, backendUrl, credit, setShowLogin } = useContext(AppContext);

  const handlePurchase = async (planId) => {
    try {
      // Retrieve userId from local storage
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID is missing');
      }

      // Create a checkout session
      const response = await fetch(`${backendUrl}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId, userId }), // Include both planId and userId
      });

      const session = await response.json();

      if (response.ok && session.url) {
        // Redirect to the Stripe Checkout session directly
        window.location.href = session.url;
      } else {
        throw new Error(session.message || 'Failed to create checkout session.');
      }
    } catch (error) {
      console.error(error.message);
      toast.error(error.message || 'An error occurred while processing the payment.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0.2, y: 100 }}
      transition={{ duration: 1 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="min-h-[80vh] text-center pt-8 mb-10"
    >
      <div className='mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-100 to-teal-100 px-5 py-3 shadow-sm'>
        <span className='text-sm font-semibold text-blue-800'>Instant AI credits</span>
        <span className='text-xs text-blue-600'>1 credit per image · safe checkout</span>
      </div>
      {user ? (
        <div className="mb-6 flex justify-center items-center gap-2">
          <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold text-lg shadow">
            Credits: {credit !== false ? credit : '...'}
          </span>
        </div>
      ) : (
        <div className='mb-6 text-sm text-gray-600 dark:text-gray-300'>Log in to save your purchases and track usage.</div>
      )}
      <h1 className="text-center text-3xl font-semibold mb-4 sm:mb-10">Choose the plan that fits your workflow</h1>
      <p className='max-w-2xl mx-auto text-gray-600 dark:text-gray-300 mb-8'>Dreamify makes it easy to buy credits, generate images fast, and unlock smoother creative workflows with higher volume plans.</p>

      <div className="flex flex-wrap justify-center gap-8 text-left">
        {plans.map((item, index) => {
          const isPopular = item.id === 'Advanced';
          return (
            <div
              key={index}
              className={`relative bg-white/80 p-10 rounded-2xl shadow-2xl border border-blue-200 w-80 m-auto flex flex-col items-center min-h-[370px] transition-all duration-500 hover:scale-105 hover:shadow-xl ${isPopular ? 'border-4 border-blue-500 shadow-lg scale-105' : ''}`}
            >
              {isPopular && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow">Most Popular</span>
              )}
              <img width={40} src={assets.camera_icon} alt="" />
              <p className="mt-3 mb-1 font-semibold">{item.id}</p>
              <p className="text-sm">{item.desc}</p>
              <p className="mt-6">
                <span className="text-3xl font-medium">${item.price}</span> / {item.credits} credits
              </p>

              <Button
                onClick={() => {
                  if (!user) return setShowLogin(true);
                  handlePurchase(item.id);
                }}
                variant={user ? 'primary' : 'secondary'}
                className="w-full mt-8 text-sm min-w-52"
                disabled={false}
              >
                {user ? 'Purchase' : 'Login to buy'}
              </Button>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default BuyCredit;

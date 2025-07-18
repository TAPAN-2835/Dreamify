import { useContext } from 'react';
import { assets, plans } from '../assets/assets';
import { AppContext } from '../context/AppContext';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'react-toastify';
import Button from '../components/Button';

console.log('Stripe key:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const BuyCredit = () => {
  const { user, backendUrl, loadCreditsData, credit } = useContext(AppContext);

  const handlePurchase = async (planId) => {
    try {
      const stripe = await stripePromise;
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
        // Redirect to the Stripe Checkout session
        handlePostPayment(planId,userId);
        await stripe.redirectToCheckout({ sessionId: session.url.split('/').pop() });
      } else {
        throw new Error(session.message || 'Failed to create checkout session.');
      }
    } catch (error) {
      console.error(error.message);
      toast.error(error.message || 'An error occurred while processing the payment.');
    }
  };

  const handlePostPayment = async (planId,userId) => {

    if (planId && userId) {
      try {
        // Confirm payment and update credits
        const response = await fetch(`${backendUrl}/api/stripe/confirm-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ planId, userId }),
        });

        const result = await response.json();

        if (response.ok) {
          toast.success('Credits updated successfully!');
          console.log('Payment confirmed:', result);

          // Optionally reload credits data after successful payment
          if (loadCreditsData) loadCreditsData();
        } else {
          throw new Error(result.message || 'Failed to confirm payment.');
        }
      } catch (error) {
        console.error('Error confirming payment:', error.message);
        toast.error(error.message || 'An error occurred while confirming the payment.');
      }
    }
  };

  // Check for post-payment success only when the URL has the `success=true` parameter
  // useEffect(() => {
  //   const urlParams = new URLSearchParams(window.location.search);
  //   if (urlParams.get('success') === 'true') {
  //     handlePostPayment();
  //   }
  // }, []);

  return (
    <motion.div
      initial={{ opacity: 0.2, y: 100 }}
      transition={{ duration: 1 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="min-h-[80vh] text-center pt-8 mb-10"
    >
      {/* Credit Balance Display */}
      {user && (
        <div className="mb-6 flex justify-center items-center gap-2">
          <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold text-lg shadow">
            Credits: {credit !== false ? credit : '...'}
          </span>
        </div>
      )}
      <button className="border border-gray-400 px-10 py-2 rounded-full mb-6">Our Plans</button>
      <h1 className="text-center text-3xl font-medium mb-6 sm:mb-10">Choose the plan</h1>

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
                onClick={() => handlePurchase(item.id)}
                className="w-full mt-8 text-sm min-w-52"
                disabled={!user}
              >
                {user ? 'Purchase' : 'Get Started'}
              </Button>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default BuyCredit;

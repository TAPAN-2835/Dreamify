import React, { useContext, useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import { AppContext } from '../context/AppContext';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import Button from './Button';

const EyeIcon = ({ visible, onClick }) => (
  <span onClick={onClick} className="cursor-pointer select-none">
    {visible ? (
      // Eye open SVG
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
    ) : (
      // Eye closed SVG
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95m3.249-2.568A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.043 5.306M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>
    )}
  </span>
);

const Login = () => {
  const [state, setState] = useState('Login');
  const { setShowLogin, backendUrl, setToken, setUser } = useContext(AppContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (state === 'Login') {
        const { data } = await axios.post(`${backendUrl}/api/user/login`, {
          email,
          password,
        });

        if (data.success) {
          setToken(data.token);
          setUser(data.user);
          localStorage.setItem('token', data.token);
          localStorage.setItem('userId', data.user.id); // Store user ID in local storage
          setShowLogin(false);
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(`${backendUrl}/api/user/register`, {
          name,
          email,
          password,
        });

        if (data.success) {
          setToken(data.token);
          setUser(data.user);
          localStorage.setItem('token', data.token);
          localStorage.setItem('userId', data.user.id); // Store user ID in local storage
          setShowLogin(false);
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred');
    }
    setLoading(false);
  };

  const onForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail || !newPassword || !confirmPassword) {
      toast.error('Please fill all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setForgotLoading(true);
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/update-password`, {
        email: forgotEmail,
        newPassword,
      });
      if (data.success) {
        toast.success('Password updated! You can now log in.');
        setShowForgot(false);
        setState('Login');
        setForgotEmail('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred');
    }
    setForgotLoading(false);
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    }
  }, [])
  return (
    <div className='fixed top-0 left-0 right-0 bottom-0 z-10 backdrop-blur-sm bg-black/30 flex justify-center items-center'>
      {showForgot ? (
        <motion.form
          onSubmit={onForgotSubmit}
          initial={{ opacity: 0.2, y: 50 }}
          transition={{ duration: 1 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className='relative bg-white p-10 rounded-xl text-slate-500 min-w-[320px]'>
          <h1 className='text-center text-2xl text-neutral-700 font-medium mb-2'>Forgot Password</h1>
          <p className='text-sm mb-4'>Enter your email and new password.</p>
          <div className='border px-6 py-2 flex items-center gap-2 rounded-full mb-4'>
            <img src={assets.email_icon} alt='' />
            <input type='email' placeholder='Email Id' onChange={e => setForgotEmail(e.target.value)} value={forgotEmail} required className='outline-none text-sm bg-transparent' />
          </div>
          <div className='border px-6 py-2 flex items-center gap-2 rounded-full mb-4'>
            <img src={assets.lock_icon} alt='' />
            <input type={showForgotNewPassword ? 'text' : 'password'} placeholder='New Password' onChange={e => setNewPassword(e.target.value)} value={newPassword} required className='outline-none text-sm bg-transparent flex-1' />
            <EyeIcon visible={showForgotNewPassword} onClick={() => setShowForgotNewPassword(v => !v)} />
          </div>
          <div className='border px-6 py-2 flex items-center gap-2 rounded-full mb-4'>
            <img src={assets.lock_icon} alt='' />
            <input type={showForgotConfirmPassword ? 'text' : 'password'} placeholder='Confirm Password' onChange={e => setConfirmPassword(e.target.value)} value={confirmPassword} required className='outline-none text-sm bg-transparent flex-1' />
            <EyeIcon visible={showForgotConfirmPassword} onClick={() => setShowForgotConfirmPassword(v => !v)} />
          </div>
          <Button className='w-full mt-2' type='submit' disabled={forgotLoading}>
            {forgotLoading ? 'Updating...' : 'Update Password'}
          </Button>
          <p className='mt-5 text-center text-blue-600 cursor-pointer' onClick={() => setShowForgot(false)}>Back to Login</p>
          <img onClick={() => { setShowForgot(false); setShowLogin(false); }} src={assets.cross_icon} alt='' className='absolute top-5 right-5 cursor-pointer' />
        </motion.form>
      ) : (
        <motion.form onSubmit={onSubmitHandler}
          initial={{ opacity: 0.2, y: 50 }}
          transition={{ duration: 1 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className='relative bg-white p-10 rounded-xl text-slate-500'>
          <h1 className='text-center text-2xl text-neutral-700 font-medium'>{state}</h1>
          <p className='text-sm'>Welcome back! please sign in to continue</p>

          {state !== 'Login' &&
            <div className='border px-6 py-2 flex items-center gap-2 rounded-full mt-5'>
              <img src={assets.user_icon} alt="" />
              <input type="text" placeholder='Full Name' onChange={e => setName(e.target.value)} value={name} required className='outline-none text-sm' />
            </div>
          }

          <div className='border px-6 py-2 flex items-center gap-2 rounded-full mt-4'>
            <img src={assets.email_icon} alt="" />
            <input type="email" placeholder='Email Id' onChange={e => setEmail(e.target.value)} value={email} required className='outline-none text-sm' />
          </div>

          <div className='border px-6 py-2 flex items-center gap-2 rounded-full mt-4'>
            <img src={assets.lock_icon} alt="" />
            <input type={state === 'Login' ? (showLoginPassword ? 'text' : 'password') : (showSignupPassword ? 'text' : 'password')} placeholder='Password' onChange={e => setPassword(e.target.value)} value={password} required className='outline-none text-sm bg-transparent flex-1' />
            {state === 'Login' ? (
              <EyeIcon visible={showLoginPassword} onClick={() => setShowLoginPassword(v => !v)} />
            ) : (
              <EyeIcon visible={showSignupPassword} onClick={() => setShowSignupPassword(v => !v)} />
            )}
          </div>
          <p className='text-sm text-blue-600 my-4 cursor-pointer' onClick={() => setShowForgot(true)}>Forgot password?</p>
          <Button className='w-full mt-4' type='submit' disabled={loading}>
            {state === 'Login' ? 'login' : 'Create account'}
          </Button>
          {state === 'Login' ?
            <p className='mt-5 text-center'>Don't have an account? <span className='text-blue-600 cursor-pointer' onClick={() => setState('Sign Up')}>Sign up</span></p> :
            <p className='mt-5 text-center'>Already have an account? <span className='text-blue-600 cursor-pointer' onClick={() => setState('Login')}>Login</span></p>
          }

          <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="" className='absolute top-5 right-5 cursor-pointer' />
        </motion.form>
      )}
    </div>
  )
}

export default Login
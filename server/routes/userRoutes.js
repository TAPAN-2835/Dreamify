import {registerUser,loginUser, userCredits, updatePassword} from '../controllers/userController.js'
import express from 'express'
import userAuth from '../middleware/auth.js'
import rateLimit from 'express-rate-limit'

const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // 5 requests/minute/IP
  message: { success: false, message: 'Too many login attempts, please try again after a minute' }
});

const userRouter = express.Router()

userRouter.post('/register',registerUser)
userRouter.post('/login', loginLimiter, loginUser)
userRouter.get('/credits',userAuth,userCredits)
userRouter.post('/update-password', userAuth, updatePassword)

export default userRouter;
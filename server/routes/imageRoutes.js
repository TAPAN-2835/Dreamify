import express from 'express'
import { generateImage, getJobStatus, cancelJob, getUserHistory, deleteHistoryItem } from '../controllers/imageController.js'
import userAuth from '../middleware/auth.js'
import rateLimit from 'express-rate-limit'

const generateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.body.userId || req.ip,
  message: { success: false, message: 'Generation limit reached, please try again later' }
});

const imageRouter = express.Router()
imageRouter.post('/generate-image', userAuth, generateLimiter, generateImage)
imageRouter.get('/job/:jobId',      userAuth, getJobStatus)
imageRouter.delete('/job/:jobId',   userAuth, cancelJob)
imageRouter.get('/history',         userAuth, getUserHistory)
imageRouter.delete('/history/:id',  userAuth, deleteHistoryItem)

export default imageRouter
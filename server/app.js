import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import { cleanEnv, str, num } from 'envalid';

const isTest = process.env.NODE_ENV === 'test';
const env = cleanEnv(process.env, {
  JWT_SECRET: isTest ? str({ default: process.env.JWT_SECRET || 'test_secret' }) : str(),
  MONGODB_URI: isTest ? str({ default: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dreamify_test' }) : str(),
  STRIPE_SECRET_KEY: isTest ? str({ default: process.env.STRIPE_SECRET_KEY || 'sk_test_dummy' }) : str(),
  STRIPE_WEBHOOK_SECRET: isTest ? str({ default: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test' }) : str(),
  CLIPDROP_API_KEY: isTest ? str({ default: process.env.CLIPDROP_API_KEY || 'test_clipdrop_key' }) : str(),
  CLIENT_URL: str({ default: 'http://localhost:5173' }),
  PORT: num({ default: 4000 })
});

import connectedDB from './config/db.js';
import logger from './config/logger.js';
import userRouter from './routes/userRoutes.js';
import imageRouter from './routes/imageRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import billingRouter from './routes/billingRoutes.js';
import { startCreditResetCron } from './crons/creditReset.cron.js';
import Stripe from 'stripe';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

const app = express();


// Security middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(morgan('combined'));
app.use(cookieParser());

// CORS
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));

// Stripe Webhook (must be BEFORE express.json)
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Basic webhook processing (kept small to avoid side effects during tests)
  res.json({ received: true });
});

app.use(express.json());

// Connect DB and start cron only when not running tests
if (process.env.NODE_ENV !== 'test') {
  connectedDB();
  startCreditResetCron();
}

// Routes
app.use('/api/user', userRouter);
app.use('/api/image', imageRouter);
app.use('/api/admin', adminRouter);
app.use('/api/billing', billingRouter);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.get('/', (req, res) => res.send('Dreamify API running'));

// Global error handler
app.use((err, req, res, next) => {
  logger.error(err.message, { stack: err.stack, url: req.url, method: req.method });
  res.status(err.status || 500).json({ success: false, message: 'Internal server error' });
});

export default app;

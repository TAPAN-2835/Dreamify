import express from 'express';
import adminAuth from '../middleware/adminAuth.js';
import userModel from '../models/userModel.js';
import CreditTransaction from '../models/CreditTransaction.js';
import Stripe from 'stripe';

const billingRouter = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// GET /api/billing/invoices?page=1&limit=20&type=purchase
billingRouter.get('/invoices', adminAuth, async (req, res, next) => {
  try {
    const userId = req.body.userId;
    const { page = 1, limit = 20, type } = req.query;

    const filter = { userId };
    if (type) filter.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [transactions, total] = await Promise.all([
      CreditTransaction.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      CreditTransaction.countDocuments(filter)
    ]);

    res.json({
      success: true,
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/billing/my-invoices - User's own invoice history
billingRouter.get('/my-invoices', async (req, res, next) => {
  try {
    const token = req.headers.token;
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const jwt = (await import('jsonwebtoken')).default;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { page = 1, limit = 20, type } = req.query;
    const filter = { userId };
    if (type && type !== 'all') filter.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [transactions, total] = await Promise.all([
      CreditTransaction.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      CreditTransaction.countDocuments(filter)
    ]);

    res.json({
      success: true,
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/billing/customer-portal — Stripe Customer Portal
billingRouter.post('/customer-portal', async (req, res, next) => {
  try {
    const token = req.headers.token;
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const jwt = (await import('jsonwebtoken')).default;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Create Stripe customer if not exists
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user._id.toString() }
      });
      customerId = customer.id;
      await userModel.findByIdAndUpdate(user._id, { stripeCustomerId: customerId });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/invoices`,
    });

    res.json({ success: true, url: portalSession.url });
  } catch (error) {
    next(error);
  }
});

export default billingRouter;

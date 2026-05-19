import express from 'express';
import adminAuth from '../middleware/adminAuth.js';
import userModel from '../models/userModel.js';
import GeneratedImage from '../models/GeneratedImage.js';
import GenerationJob from '../models/GenerationJob.js';
import PaymentTransaction from '../models/PaymentTransaction.js';
import CreditTransaction from '../models/CreditTransaction.js';
import imageGenerationQueue from '../queues/imageGeneration.queue.js';

const adminRouter = express.Router();

// All admin routes protected
adminRouter.use(adminAuth);

// GET /api/admin/stats — full analytics
adminRouter.get('/stats', async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      activeUsersToday,
      totalGenerations,
      failedJobs,
      avgGenTime,
      revenue,
      creditsConsumed,
      queueCounts,
      dailyGenerations,
      topUsers
    ] = await Promise.all([
      // Total users
      userModel.countDocuments(),

      // Active users today
      userModel.countDocuments({ lastActiveAt: { $gte: today } }),

      // Total generations
      GeneratedImage.countDocuments(),

      // Failed jobs
      GenerationJob.countDocuments({ status: 'failed' }),

      // Average generation time
      GeneratedImage.aggregate([
        { $group: { _id: null, avg: { $avg: '$generationTime' } } }
      ]),

      // Total revenue (sum of amounts from PaymentTransaction in cents)
      PaymentTransaction.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),

      // Credits consumed from ledger
      CreditTransaction.aggregate([
        { $match: { type: 'generation' } },
        { $group: { _id: null, total: { $sum: { $abs: '$amount' } } } }
      ]),

      // BullMQ queue counts
      Promise.all([
        imageGenerationQueue.getWaitingCount(),
        imageGenerationQueue.getActiveCount(),
        imageGenerationQueue.getFailedCount(),
        imageGenerationQueue.getCompletedCount(),
      ]),

      // Daily generations last 14 days
      GeneratedImage.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Top 10 users by generations
      GeneratedImage.aggregate([
        { $group: { _id: '$userId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        { $project: { name: '$user.name', email: '$user.email', count: 1 } }
      ])
    ]);

    const [waiting, active, queueFailed, completed] = queueCounts;

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsersToday,
        totalGenerations,
        failedJobs,
        avgGenerationTime: avgGenTime[0]?.avg ? Math.round(avgGenTime[0].avg) : 0,
        revenueUSD: revenue[0]?.total ? (revenue[0].total / 100).toFixed(2) : '0.00',
        creditsConsumed: creditsConsumed[0]?.total || 0,
        queue: { waiting, active, failed: queueFailed, completed },
        dailyGenerations,
        topUsers
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/adjust-credits — admin manual credit adjustment
adminRouter.post('/adjust-credits', async (req, res, next) => {
  try {
    const { targetUserId, amount, reason } = req.body;
    const adminId = req.body.userId;

    if (!targetUserId || !amount || !reason) {
      return res.status(400).json({ success: false, message: 'targetUserId, amount, and reason are required' });
    }

    const user = await userModel.findByIdAndUpdate(
      targetUserId,
      { $inc: { creditBalance: amount } },
      { new: true }
    );

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await CreditTransaction.create({
      userId: targetUserId,
      type: 'admin_adjustment',
      amount,
      balance: user.creditBalance,
      description: reason,
      adminId
    });

    res.json({ success: true, newBalance: user.creditBalance });
  } catch (error) {
    next(error);
  }
});

export default adminRouter;

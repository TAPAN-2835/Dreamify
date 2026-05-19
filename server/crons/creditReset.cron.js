import cron from 'node-cron';
import userModel from '../models/userModel.js';
import CreditTransaction from '../models/CreditTransaction.js';
import logger from '../config/logger.js';

const FREE_CREDIT_AMOUNT = 5;
const FREE_TIER_THRESHOLD = 50; // users with <= 50 total credits ever are considered free tier

/**
 * Monthly free credits reset — runs on 1st of every month at midnight
 * Idempotent: only grants if last grant was NOT in current month
 */
export const startCreditResetCron = () => {
  cron.schedule('0 0 1 * *', async () => {
    logger.info('[Cron] Starting monthly free credit reset...');
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    try {
      // Find free-tier users who haven't received credits this month
      const freeUsers = await userModel.find({ role: 'user' }).select('_id creditBalance').lean();

      let granted = 0;
      for (const user of freeUsers) {
        // Idempotency: check if they already received free credits this month
        const alreadyGranted = await CreditTransaction.findOne({
          userId: user._id,
          type: 'free_credits',
          createdAt: { $gte: startOfMonth }
        });

        if (alreadyGranted) continue;

        const updated = await userModel.findByIdAndUpdate(
          user._id,
          { $inc: { creditBalance: FREE_CREDIT_AMOUNT } },
          { new: true }
        );

        await CreditTransaction.create({
          userId: user._id,
          type: 'free_credits',
          amount: FREE_CREDIT_AMOUNT,
          balance: updated.creditBalance,
          description: 'Monthly free credits reset'
        });

        granted++;
      }

      logger.info(`[Cron] Monthly free credits granted to ${granted} users`);
    } catch (error) {
      logger.error('[Cron] Credit reset failed:', error);
    }
  }, {
    timezone: 'UTC'
  });

  logger.info('[Cron] Monthly credit reset cron scheduled');
};

import userModel from "../models/userModel.js";
import GenerationJob from "../models/GenerationJob.js";
import GeneratedImage from "../models/GeneratedImage.js";
import imageGenerationQueue from "../queues/imageGeneration.queue.js";
import logger from "../config/logger.js";

const generateImage = async (req, res) => {
  try {
    const { userId, prompt } = req.body;

    if (!userId || !prompt) {
      return res.json({ success: false, message: "Missing details" });
    }

    const user = await userModel.findById(userId);
    if (!user) return res.json({ success: false, message: "User not found" });

    if (user.creditBalance <= 0) {
      return res.json({ success: false, message: "No credit Balance", creditBalance: user.creditBalance });
    }

    const dbJob = await GenerationJob.create({ userId, prompt, status: 'queued', progress: 0 });

    // Premium users get higher priority (lower number = higher priority in BullMQ)
    const priority = user.role === 'admin' ? 1 : 10;

    await imageGenerationQueue.add('generate-image-job', {
      jobId: dbJob._id.toString(),
      userId: userId.toString(),
      prompt
    }, { priority });

    logger.info(`Job queued`, { jobId: dbJob._id, userId, prompt: prompt.substring(0, 40) });

    res.json({ success: true, message: "Job queued", jobId: dbJob._id.toString() });

  } catch (error) {
    logger.error('generateImage error:', error);
    res.json({ success: false, message: error.message });
  }
};

const getJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await GenerationJob.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    res.json({
      success: true,
      status: job.status,
      progress: job.progress,
      resultUrl: job.resultUrl,
      errorMessage: job.errorMessage
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const cancelJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.body.userId;

    const dbJob = await GenerationJob.findOne({ _id: jobId, userId });
    if (!dbJob) return res.status(404).json({ success: false, message: 'Job not found' });

    if (dbJob.status !== 'queued') {
      return res.json({ success: false, message: `Cannot cancel a job that is ${dbJob.status}` });
    }

    // Find and remove from BullMQ queue
    const bullJob = await imageGenerationQueue.getJob(jobId);
    if (bullJob) {
      await bullJob.remove();
    }

    await GenerationJob.findByIdAndUpdate(jobId, {
      status: 'failed',
      errorMessage: 'Cancelled by user',
      completedAt: new Date()
    });

    // Emit cancellation via socket
    if (global.io) {
      global.io.to(`room:user:${userId}`).emit('generation:update', {
        jobId, status: 'failed', progress: 0, errorMessage: 'Cancelled by user'
      });
    }

    res.json({ success: true, message: 'Job cancelled' });
  } catch (error) {
    logger.error('cancelJob error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getUserHistory = async (req, res) => {
  try {
    const userId = req.body.userId;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [history, total] = await Promise.all([
      GeneratedImage.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      GeneratedImage.countDocuments({ userId })
    ]);

    res.json({
      success: true,
      history,
      hasMore: skip + history.length < total,
      total
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deleteHistoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.body.userId;
    const item = await GeneratedImage.findOneAndDelete({ _id: id, userId });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export { generateImage, getJobStatus, cancelJob, getUserHistory, deleteHistoryItem };
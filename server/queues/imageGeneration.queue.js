import { Queue } from 'bullmq';
import connection from '../config/redis.js';

const imageGenerationQueue = new Queue('image-generation', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true, // Auto cleanup
    removeOnFail: false, // Keep failed jobs for inspection
  },
});

export default imageGenerationQueue;

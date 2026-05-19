import { Queue } from 'bullmq';
import { redisConnectionConfig } from '../config/redis.js';

let imageGenerationQueue = null;
if (process.env.NODE_ENV !== 'test') {
  imageGenerationQueue = new Queue('image-generation', {
    connection: redisConnectionConfig,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    },
  });
}

export default imageGenerationQueue;

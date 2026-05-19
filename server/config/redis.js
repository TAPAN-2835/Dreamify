import Redis from 'ioredis';

const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
};

if (process.env.NODE_ENV !== 'test' && !process.env.REDIS_URL) {
  throw new Error('REDIS_URL is required in production. Set REDIS_URL in your environment.');
}

const connection = process.env.NODE_ENV === 'test'
  ? { on: () => {}, disconnect: async () => {} }
  : new Redis(process.env.REDIS_URL || redisConfig);

if (process.env.NODE_ENV !== 'test') {
  connection.on('error', (err) => {
    console.error('Redis connection error:', err);
  });

  connection.on('connect', () => {
    console.log('Connected to Redis successfully');
  });
}

export default connection;

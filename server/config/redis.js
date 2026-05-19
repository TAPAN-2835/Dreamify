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

const connection = new Redis(process.env.REDIS_URL || redisConfig);

connection.on('error', (err) => {
  console.error('Redis connection error:', err);
});

connection.on('connect', () => {
  console.log('Connected to Redis successfully');
});

export default connection;

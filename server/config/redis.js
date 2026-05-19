import Redis from 'ioredis';

const redisOptions = {
  maxRetriesPerRequest: null,
  connectTimeout: 10000,
  keepAlive: 10000,
  enableReadyCheck: true,
  retryStrategy(times) {
    return Math.min(times * 50, 2000);
  },
  reconnectOnError(err) {
    if (!err || !err.message) return false;
    return err.message.includes('ECONNRESET') || err.message.includes('ECONNREFUSED');
  },
};

const redisConnectionConfig = process.env.REDIS_URL
  ? {
      url: process.env.REDIS_URL,
      ...redisOptions,
      tls: process.env.REDIS_URL.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
    }
  : {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT || 6379),
      password: process.env.REDIS_PASSWORD || undefined,
      ...redisOptions,
    };

if (process.env.NODE_ENV !== 'test' && !process.env.REDIS_URL) {
  throw new Error('REDIS_URL is required in production. Set REDIS_URL in your environment.');
}

const connection = process.env.NODE_ENV === 'test'
  ? { on: () => {}, disconnect: async () => {} }
  : new Redis(redisConnectionConfig);

if (process.env.NODE_ENV !== 'test') {
  connection.on('error', (err) => {
    console.error('Redis connection error:', err);
  });

  connection.on('connect', () => {
    console.log('Connected to Redis successfully');
  });
}

export { redisConnectionConfig };
export default connection;

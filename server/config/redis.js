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

const buildRedisConfig = () => {
  if (process.env.REDIS_URL) {
    const url = process.env.REDIS_URL.trim();
    console.log(`[Redis] Using URL with protocol: ${url.split('//')[0]}//...`);
    
    // For rediss://, ioredis automatically uses TLS, we just pass URL + options
    const config = {
      url,
      ...redisOptions,
    };
    
    // Only add explicit tls config for rediss:// to ensure it works
    if (url.startsWith('rediss://')) {
      config.tls = { rejectUnauthorized: false };
    }
    
    return config;
  }
  
  console.log('[Redis] Using localhost fallback (only for development)');
  return {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD || undefined,
    ...redisOptions,
  };
};

const redisConnectionConfig = buildRedisConfig();

if (process.env.NODE_ENV === 'production' && !process.env.REDIS_URL) {
  throw new Error('REDIS_URL is required in production. Set REDIS_URL in your environment.');
}

const connection = process.env.NODE_ENV === 'test'
  ? { on: () => {}, disconnect: async () => {} }
  : new Redis(redisConnectionConfig);

if (process.env.NODE_ENV !== 'test') {
  connection.on('error', (err) => {
    console.error('[Redis] Connection error:', err.message || err);
  });

  connection.on('connect', () => {
    console.log('[Redis] Connected successfully to remote Redis');
  });

  connection.on('close', () => {
    console.log('[Redis] Connection closed');
  });
}

export { redisConnectionConfig };
export default connection;

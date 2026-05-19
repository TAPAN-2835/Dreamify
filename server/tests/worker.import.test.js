// Ensure worker module can be imported safely by mocking Worker
jest.mock('bullmq', () => ({ Worker: function Worker() { return {}; } }));
jest.mock('../config/redis.js', () => ({}));
jest.mock('cloudinary', () => ({ v2: { uploader: { upload_stream: jest.fn((opts, cb) => ({ end: () => cb(null, { secure_url: 'https://example.com/img.webp' }) })) } } }));
jest.mock('sharp', () => (buffer => ({ webp: () => ({ toBuffer: async () => Buffer.from('') }), resize: () => ({ webp: () => ({ toBuffer: async () => Buffer.from('') }) }), blur: () => ({ webp: () => ({ toBuffer: async () => Buffer.from('') }) }) })));
jest.mock('../models/GenerationJob.js', () => ({ findByIdAndUpdate: jest.fn() }));
jest.mock('../models/GeneratedImage.js', () => ({ findOne: jest.fn().mockResolvedValue(null), create: jest.fn() }));
jest.mock('../models/userModel.js', () => ({ findOneAndUpdate: jest.fn().mockResolvedValue({ creditBalance: 10 }) }));
jest.mock('../models/CreditTransaction.js', () => ({ create: jest.fn() }));

describe('Worker import', () => {
  it('imports worker without throwing', async () => {
    await expect(import('../workers/image.worker.js')).resolves.toBeDefined();
  });
});

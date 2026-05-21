import GenerationJob from '../models/GenerationJob.js';
import userModel from '../models/userModel.js';
import GeneratedImage from '../models/GeneratedImage.js';
import CreditTransaction from '../models/CreditTransaction.js';
import axios from 'axios';
import FormData from 'form-data';
import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import dotenv from 'dotenv';

dotenv.config();

const missingCloudinary = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']
  .filter((key) => !process.env[key]);
if (missingCloudinary.length > 0) {
  throw new Error(
    `Missing Cloudinary environment variables: ${missingCloudinary.join(', ')}. ` +
    `Add them to server/.env before running the app.`
  );
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const emitProgress = (userId, payload) => {
  try {
    if (global.io) {
      global.io.to(`room:user:${userId}`).emit('generation:update', payload);
    }
  } catch (e) {
    console.error('Socket emit error:', e.message);
  }
};

export async function processJob({ jobId, userId, prompt }) {
  const startTime = Date.now();
  emitProgress(userId, { jobId, status: 'queued', progress: 0 });

  try {
    await GenerationJob.findByIdAndUpdate(jobId, {
      status: 'processing',
      startedAt: new Date(),
      progress: 10
    });

    emitProgress(userId, { jobId, status: 'processing', progress: 10 });

    // Check prompt cache
    const cachedImage = await GeneratedImage.findOne({ userId, prompt })
      .sort({ createdAt: -1 })
      .select('imageUrl thumbnailUrl blurPlaceholder')
      .lean();

    let imageUrl, thumbnailUrl, blurPlaceholder;

    if (cachedImage) {
      imageUrl = cachedImage.imageUrl;
      thumbnailUrl = cachedImage.thumbnailUrl;
      blurPlaceholder = cachedImage.blurPlaceholder;
      emitProgress(userId, { jobId, status: 'processing', progress: 75, cached: true });
    } else {
      // 1. Call Clipdrop API
      const formData = new FormData();
      formData.append('prompt', prompt);

      emitProgress(userId, { jobId, status: 'processing', progress: 25 });

      const { data: rawBuffer } = await axios.post(
        'https://clipdrop-api.co/text-to-image/v1',
        formData,
        {
          headers: { 'x-api-key': process.env.CLIPDROP_API_KEY },
          responseType: 'arraybuffer',
          timeout: 60000,
        }
      );

      emitProgress(userId, { jobId, status: 'processing', progress: 40 });

      // 2. Convert to WebP using sharp
      const webpBuffer = await sharp(Buffer.from(rawBuffer))
        .webp({ quality: 85 })
        .toBuffer();

      // 3. Generate thumbnail (300px wide)
      const thumbBuffer = await sharp(Buffer.from(rawBuffer))
        .resize(300)
        .webp({ quality: 60 })
        .toBuffer();

      // 4. Generate LQIP blur placeholder (20px, base64)
      const lqipBuffer = await sharp(Buffer.from(rawBuffer))
        .resize(20)
        .blur(2)
        .webp({ quality: 20 })
        .toBuffer();
      blurPlaceholder = `data:image/webp;base64,${lqipBuffer.toString('base64')}`;

      emitProgress(userId, { jobId, status: 'processing', progress: 55 });

      // 5. Upload main WebP to Cloudinary
      const mainUpload = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'dreamify_generations', format: 'webp', quality: 'auto' },
          (err, result) => err ? reject(err) : resolve(result)
        );
        stream.end(webpBuffer);
      });

      // 6. Upload thumbnail
      const thumbUpload = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'dreamify_thumbnails', format: 'webp', quality: 'auto' },
          (err, result) => err ? reject(err) : resolve(result)
        );
        stream.end(thumbBuffer);
      });

      imageUrl = mainUpload.secure_url;
      thumbnailUrl = thumbUpload.secure_url;

      emitProgress(userId, { jobId, status: 'processing', progress: 75 });
    }

    // Atomically decrement credit
    const updatedUser = await userModel.findOneAndUpdate(
      { _id: userId, creditBalance: { $gte: 1 } },
      { $inc: { creditBalance: -1 } },
      { new: true }
    );

    if (!updatedUser) throw new Error('Insufficient credits at execution time');

    // Save ledger entry
    await CreditTransaction.create({
      userId,
      type: 'generation',
      amount: -1,
      balance: updatedUser.creditBalance,
      description: `AI image generation: "${prompt.substring(0, 60)}"`,
      generationJobId: jobId
    });

    // Save generation history with thumbnail + LQIP
    const generationTime = Date.now() - startTime;
    await GeneratedImage.create({
      userId,
      prompt,
      imageUrl,
      thumbnailUrl: thumbnailUrl || imageUrl,
      blurPlaceholder: blurPlaceholder || '',
      creditsUsed: 1,
      generationTime
    });

    await GenerationJob.findByIdAndUpdate(jobId, {
      status: 'completed',
      progress: 100,
      resultUrl: imageUrl,
      completedAt: new Date()
    });

    emitProgress(userId, {
      jobId,
      status: 'completed',
      progress: 100,
      resultUrl: imageUrl,
      thumbnailUrl: thumbnailUrl || imageUrl,
      blurPlaceholder: blurPlaceholder || '',
      creditBalance: updatedUser.creditBalance
    });

    return { resultUrl: imageUrl };

  } catch (error) {
    console.error(`Job ${jobId} failed:`, error.message);

    await GenerationJob.findByIdAndUpdate(jobId, {
      status: 'failed',
      errorMessage: error.message,
      completedAt: new Date()
    });

    emitProgress(userId, { jobId, status: 'failed', progress: 0, errorMessage: error.message });

    throw error;
  }
}

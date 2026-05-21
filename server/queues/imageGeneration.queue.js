import { processJob } from '../lib/jobProcessor.js';

// Lightweight in-process queue replacement for environments without Redis.
// `add(name, data, opts)` will start processing immediately in background.
const imageGenerationQueue = {
  async add(name, data, opts) {
    // fire-and-forget processing
    processJob(data).catch((err) => console.error('In-process job error:', err.message));
    return { id: data.jobId };
  },
  // Used by cancel flow; this stub returns null because there is no external queue.
  async getJob() { return null; },
  async getWaitingCount() { return 0; },
  async getActiveCount() { return 0; },
  async getFailedCount() { return 0; },
  async getCompletedCount() { return 0; }
};

export default imageGenerationQueue;

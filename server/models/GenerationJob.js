import mongoose from 'mongoose';

const generationJobSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  prompt: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['queued', 'processing', 'completed', 'failed'], 
    default: 'queued' 
  },
  progress: { type: Number, default: 0 },
  resultUrl: { type: String, default: null },
  errorMessage: { type: String, default: null },
  startedAt: { type: Date },
  completedAt: { type: Date }
}, { timestamps: true });

const GenerationJob = mongoose.models.GenerationJob || mongoose.model('GenerationJob', generationJobSchema);

export default GenerationJob;

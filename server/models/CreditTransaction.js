import mongoose from 'mongoose';

const creditTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true, index: true },
  type: {
    type: String,
    enum: ['purchase', 'generation', 'refund', 'admin_adjustment', 'free_credits'],
    required: true
  },
  amount: { type: Number, required: true }, // positive = add, negative = deduct
  balance: { type: Number, required: true }, // balance AFTER transaction
  description: { type: String },
  stripeSessionId: { type: String, default: null },
  generationJobId: { type: mongoose.Schema.Types.ObjectId, ref: 'GenerationJob', default: null },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null },
}, { timestamps: true });

// Compound index for fast user ledger queries
creditTransactionSchema.index({ userId: 1, createdAt: -1 });

const CreditTransaction = mongoose.models.CreditTransaction || mongoose.model('CreditTransaction', creditTransactionSchema);
export default CreditTransaction;

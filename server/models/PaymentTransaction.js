import mongoose from "mongoose";

const paymentTransactionSchema = new mongoose.Schema({
    stripeSessionId: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    creditsAdded: { type: Number, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    status: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const PaymentTransaction = mongoose.models.PaymentTransaction || mongoose.model("PaymentTransaction", paymentTransactionSchema);

export default PaymentTransaction;

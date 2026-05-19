import mongoose from "mongoose";

const generatedImageSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    prompt: { type: String, required: true },
    imageUrl: { type: String, required: true },
    thumbnailUrl: { type: String, default: '' },
    blurPlaceholder: { type: String, default: '' },
    creditsUsed: { type: Number, required: true, default: 1 },
    generationTime: { type: Number },
    createdAt: { type: Date, default: Date.now }
});

const GeneratedImage = mongoose.models.GeneratedImage || mongoose.model("GeneratedImage", generatedImageSchema);

export default GeneratedImage;

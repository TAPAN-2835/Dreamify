import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import userModel from '../models/userModel.js';

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI missing in server/.env');
}

await mongoose.connect(uri);
const id = '6a0b5db21213af7ad357d9b3';
const before = await userModel.findById(id).lean();
if (!before) {
  throw new Error(`User not found: ${id}`);
}
console.log('Current credits:', before.creditBalance);
const res = await userModel.updateOne({ _id: id }, { $set: { creditBalance: 10 } });
console.log('Matched:', res.matchedCount ?? res.n);
console.log('Modified:', res.modifiedCount ?? res.nModified);
const after = await userModel.findById(id).lean();
console.log('Updated credits to:', after.creditBalance);
await mongoose.disconnect();

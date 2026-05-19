import mongoose from "mongoose";

const connectedDB = async () => {
  if (process.env.NODE_ENV !== 'test' && !process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required in production. Set MONGODB_URI in your environment.');
  }

  mongoose.connection.on('connected', () => {
    console.log("database connected");
  });

  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

export default connectedDB
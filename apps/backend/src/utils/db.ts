import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(' MongoDB connected successfully.');
  } catch (error) {
    console.error(' MongoDB connection error:', error);
    process.exit(1); 
  }
};
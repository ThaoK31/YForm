import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const uri = process.env.NODE_ENV === 'test' ? process.env.MONGODB_URI_TEST : process.env.MONGO_URI;
    await mongoose.connect(uri);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1); // Quitte l'application en cas d'échec
  }
};

export default connectDB;

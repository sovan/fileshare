import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Replace with your MongoDB Atlas or local connection string
    // Use 127.0.0.1 instead of localhost for Node.js 18+ to prevent connection issues
    const conn = await mongoose.connect("mongodb://127.0.0.1:27017/sovan");
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;

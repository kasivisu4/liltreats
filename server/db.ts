import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME ?? "liltreats";

if (!uri) {
  throw new Error(
    "MONGODB_URI is not set. Add it to your backend environment variables — never to frontend code.",
  );
}

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) return;
  await mongoose.connect(uri, { dbName });
  isConnected = true;
  console.log(`[db] Connected to MongoDB — database: ${dbName}`);
}

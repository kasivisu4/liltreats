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

  const MAX_RETRIES = 5;
  const RETRY_DELAY_MS = 4000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(uri, {
        dbName,
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      });
      isConnected = true;
      console.log(`[db] Connected to MongoDB — database: ${dbName}`);
      return;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (attempt < MAX_RETRIES) {
        console.warn(`[db] Connection attempt ${attempt}/${MAX_RETRIES} failed: ${message}`);
        console.warn(`[db] Retrying in ${RETRY_DELAY_MS / 1000}s...`);
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      } else {
        console.error(`[db] All ${MAX_RETRIES} connection attempts failed.`);
        console.error("[db] IMPORTANT: Add this server's IP to MongoDB Atlas Network Access:");
        console.error("[db] https://cloud.mongodb.com -> Network Access -> Add IP Address");
        console.error("[db] Or set 0.0.0.0/0 to allow all IPs (not recommended for production).");
        // Don't crash the process — let the API server run so the frontend stays up.
        // Every API route that needs DB will get a 503 until the connection is fixed.
      }
    }
  }
}

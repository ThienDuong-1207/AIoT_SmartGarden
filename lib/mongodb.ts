import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

global.mongooseCache = cache;

export async function dbConnect() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("Please define MONGODB_URI in environment variables");
  }

  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(mongoUri, {
      dbName: process.env.MONGODB_DB_NAME || "AIoT",
      bufferCommands: false,
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}

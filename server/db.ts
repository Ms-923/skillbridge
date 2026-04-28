import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

let connectionPromise: Promise<typeof mongoose> | null = null;

mongoose.set('bufferCommands', false);

export async function connectToDatabase() {
  if (!MONGO_URI || MONGO_URI === 'PASTE_ATLAS_CONNECTION_STRING') {
    throw new Error('MONGO_URI is not configured');
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(MONGO_URI).catch((error) => {
      connectionPromise = null;
      throw error;
    });
  }

  return connectionPromise;
}

export function getDatabaseStatus() {
  return {
    readyState: mongoose.connection.readyState,
    status: {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    }[mongoose.connection.readyState] || 'unknown',
    mongoUriSet: !!MONGO_URI && MONGO_URI !== 'PASTE_ATLAS_CONNECTION_STRING',
  };
}

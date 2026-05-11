import mongoose from 'mongoose';

const uri = process.env.MONGODB_URL || process.env.DATABASE_URL;
if (!uri) {
  throw new Error('Missing MONGODB_URL in environment');
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseGlobal: { conn: any; promise: Promise<any> | null } | undefined;
}

const globalAny: any = global;

if (!globalAny._mongooseGlobal) {
  globalAny._mongooseGlobal = { conn: null, promise: null };
}

const cached = globalAny._mongooseGlobal;

export async function connect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const opts = { bufferCommands: false };
    cached.promise = mongoose.connect(uri, opts).then((m) => m.connection);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connect;

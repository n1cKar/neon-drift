import { MongoClient } from "mongodb";

const uri =
  "mongodb+srv://nimashmendis0202:6VENXMpy8Mbl12tL@cluster0.oltgqj0.mongodb.net/?retryWrites=true&w=majority";

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  // In case you want to keep it in env
  process.env.MONGODB_URI = uri;
}

if (process.env.NODE_ENV === "development") {
  // use global variable to preserve client across hot reloads
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(process.env.MONGODB_URI);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  // production mode
  client = new MongoClient(process.env.MONGODB_URI);
  clientPromise = client.connect();
}

export default clientPromise;

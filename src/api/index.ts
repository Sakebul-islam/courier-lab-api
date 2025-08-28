import { IncomingMessage, ServerResponse } from "http";
import mongoose from "mongoose";
import app from "../app";
import { envVars } from "../app/config/env";

let isConnecting = false;

async function ensureDb() {
  if (mongoose.connection.readyState === 1) return;
  if (mongoose.connection.readyState === 2 || isConnecting) return;
  isConnecting = true;
  try {
    await mongoose.connect(envVars.DB_URL);
    // eslint-disable-next-line no-console
    console.log("Connected to DB (Vercel)");
  } finally {
    isConnecting = false;
  }
}

type Handler = (req: IncomingMessage, res: ServerResponse) => void;
const expressHandler: Handler = (req, res) => {
  (app as unknown as Handler)(req, res);
};

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await ensureDb();
  return expressHandler(req, res);
}

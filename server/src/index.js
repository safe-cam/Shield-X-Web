import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import authRoutes from '../routes/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

dotenv.config();
connectDB();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;

// Increase JSON payload limit to allow small avatar images sent as data URLs.
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Allow cross-origin requests during development (Vite runs on :5174)
app.use(cors({
  origin: "*"
}));
// serve public from project root (/server/public)
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/api', authRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Create an axios instance usable from the server. Use the Vite-style env name
// if present on the server, otherwise fall back to localhost.
const API = axios.create({
  baseURL: process.env.VITE_API_URL || "http://localhost:5000"
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

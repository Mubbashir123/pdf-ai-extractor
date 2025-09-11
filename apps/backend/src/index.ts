import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './utils/db';
import invoiceRoutes from './routes/index'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

connectDB();

const allowedOrigins = [
  process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  'https://pdf-ai-extractor-frontend.vercel.app',
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, true);
  },
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// API Routes
app.use('/api', invoiceRoutes); 

// Base route
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`));
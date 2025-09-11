import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './utils/db';
import invoiceRoutes from './routes/index'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

connectDB();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', invoiceRoutes); 

// Base route
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`));
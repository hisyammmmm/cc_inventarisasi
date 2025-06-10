import express from 'express';
import cors from 'cors';
import UserRoute from './routes/UserRoute.js';
import BarangRoute from './routes/BarangRoute.js';
import db from './config/database.js';

const app = express();
// Middleware untuk parsing JSON
const corsOptions = {
  origin: [
    'http://localhost:5500',
    'http://127.0.0.1:5500'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

// CORS middleware
app.use(cors(corsOptions));

// Parsing JSON
app.use(express.json());

// Routes
app.use(UserRoute);
app.use(BarangRoute);

// Error handling middleware (letakkan di akhir)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: err.message,
    message: 'Internal Server Error' 
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message, message: 'Internal Server Error' });
});

// Sync DB
db.sync().then(async () => {
  console.log('Database synced');
});


const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
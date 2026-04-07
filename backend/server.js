const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'https://puff-off.vercel.app'
  ],
  credentials: true,
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/addictions', require('./routes/addictionRoutes'));
app.use('/api/checkins', require('./routes/checkInRoutes'));
app.use('/api/journals', require('./routes/journalRoutes'));
app.use('/api/usagelogs', require('./routes/usageLogRoutes'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'PuffOff API is running 🚀' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

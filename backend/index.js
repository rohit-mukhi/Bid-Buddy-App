import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './api/routes/auth.js';
import auctionRoutes from './api/routes/auctions.js';
import createTables from './config/initDb.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 images

app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Initialize database tables
createTables()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });



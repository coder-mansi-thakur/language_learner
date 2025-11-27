import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
import './models/User.js'; // Import models to ensure they are registered before sync
import './models/Language.js';
import userRoutes from './routes/userRoutes.js';
import { seedLanguages } from './utils/seedLanguages.js';

connectDB().then(() => {
  seedLanguages();
});

// Routes
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

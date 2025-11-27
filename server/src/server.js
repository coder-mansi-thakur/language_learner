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
import './models/associations.js'; // Import associations to register models and relationships
import userRoutes from './routes/userRoutes.js';
import languageRoutes from './routes/languageRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import vocabularyRoutes from './routes/vocabularyRoutes.js';
import userVocabularyRoutes from './routes/userVocabularyRoutes.js';
import { seedLanguages } from './utils/seedLanguages.js';

connectDB().then(() => {
  seedLanguages();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/languages', languageRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/vocabulary', vocabularyRoutes);
app.use('/api/user-vocabulary', userVocabularyRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

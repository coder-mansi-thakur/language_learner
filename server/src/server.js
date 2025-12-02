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
import habitRoutes from './routes/habitRoutes.js';
import sentenceRoutes from './routes/sentenceRoutes.js';
import { seedLanguages } from './utils/seedLanguages.js';
import { seedVocabulary } from './utils/seedVocabulary.js';

connectDB().then(async () => {
  await seedLanguages();
  await seedVocabulary();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/languages', languageRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/vocabulary', vocabularyRoutes);
app.use('/api/user-vocabulary', userVocabularyRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/sentences', sentenceRoutes);

app.get('/api/ping', (req, res) => {
  res.status(200).send('pong');
});

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import express from 'express';
import { getAllLanguages } from '../controllers/languageController.js';

const router = express.Router();

router.get('/', getAllLanguages);

export default router;

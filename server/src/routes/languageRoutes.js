import express from 'express';
import { getAllLanguages, getLanguageByCode } from '../controllers/languageController.js';

const router = express.Router();

router.get('/', getAllLanguages);
router.get('/:code', getLanguageByCode);

export default router;

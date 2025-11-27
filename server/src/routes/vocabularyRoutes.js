import express from 'express';
import { getAllVocabulary, createVocabulary, updateVocabulary, deleteVocabulary } from '../controllers/vocabularyController.js';

const router = express.Router();

router.get('/', getAllVocabulary);
router.post('/', createVocabulary);
router.put('/:id', updateVocabulary);
router.delete('/:id', deleteVocabulary);

export default router;

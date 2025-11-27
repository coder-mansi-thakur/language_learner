import express from 'express';
import { getUserVocabulary, updateWordProgress } from '../controllers/userVocabularyController.js';

const router = express.Router();

router.get('/:firebaseUid', getUserVocabulary);
router.post('/:firebaseUid/progress', updateWordProgress);

export default router;

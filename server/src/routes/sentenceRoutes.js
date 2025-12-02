import express from 'express';
import { generateSentences, saveSentence, getSentences, deleteSentence, updateSentence, updateSentenceProgress } from '../controllers/sentenceController.js';

const router = express.Router();

router.post('/:firebaseUid/generate', generateSentences);
router.post('/:firebaseUid/progress', updateSentenceProgress);
router.post('/:firebaseUid', saveSentence);
router.get('/:firebaseUid', getSentences);
router.put('/:firebaseUid/:id', updateSentence);
router.delete('/:firebaseUid/:id', deleteSentence);



export default router;

import express from 'express';
import { syncUser, getUserProfile, startLearning } from '../controllers/userController.js';

const router = express.Router();

router.post('/sync', syncUser);
router.get('/:firebaseUid', getUserProfile);
router.post('/:firebaseUid/languages', startLearning);

export default router;

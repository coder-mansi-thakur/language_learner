import express from 'express';
import { getHabits, createHabit, deleteHabit, toggleHabitLog } from '../controllers/habitController.js';

const router = express.Router();

router.get('/:firebaseUid', getHabits);
router.post('/:firebaseUid', createHabit);
router.delete('/:firebaseUid/:habitId', deleteHabit);
router.post('/:firebaseUid/:habitId/toggle', toggleHabitLog);

export default router;

import express from 'express';
import { getHabits, createHabit, deleteHabit, toggleHabitLog, updateHabit } from '../controllers/habitController.js';

const router = express.Router();

router.get('/:firebaseUid', getHabits);
router.post('/:firebaseUid', createHabit);
router.put('/:firebaseUid/:habitId', updateHabit);
router.delete('/:firebaseUid/:habitId', deleteHabit);
router.post('/:firebaseUid/:habitId/toggle', toggleHabitLog);

export default router;

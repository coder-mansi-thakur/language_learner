import axios from 'axios';
import { config } from '../config/api';

const API_URL = `${config.API_BASE_URL}/habits`;

export const getHabits = async (firebaseUid) => {
  const response = await axios.get(`${API_URL}/${firebaseUid}`);
  return response.data;
};

export const createHabit = async (firebaseUid, habitData) => {
  const response = await axios.post(`${API_URL}/${firebaseUid}`, habitData);
  return response.data;
};

export const updateHabit = async (firebaseUid, habitId, habitData) => {
  const response = await axios.put(`${API_URL}/${firebaseUid}/${habitId}`, habitData);
  return response.data;
};

export const deleteHabit = async (firebaseUid, habitId) => {
  const response = await axios.delete(`${API_URL}/${firebaseUid}/${habitId}`);
  return response.data;
};

export const toggleHabitLog = async (firebaseUid, habitId, date, imageUrl = null) => {
  const response = await axios.post(`${API_URL}/${firebaseUid}/${habitId}/toggle`, { date, imageUrl });
  return response.data;
};

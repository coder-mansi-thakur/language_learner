import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { getHabits, createHabit, deleteHabit, toggleHabitLog } from '../services/habitService';

const HabitTracker = () => {
  const { currentUser } = useAuth();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDesc, setNewHabitDesc] = useState('');

  const fetchHabits = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const data = await getHabits(currentUser.uid);
      setHabits(data);
    } catch (error) {
      console.error('Error fetching habits:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, [currentUser]);

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    try {
      await createHabit(currentUser.uid, {
        name: newHabitName,
        description: newHabitDesc,
        frequency: 'daily', // Default for now
        targetCount: 1,
        color: '#4F46E5'
      });
      setNewHabitName('');
      setNewHabitDesc('');
      setIsModalOpen(false);
      fetchHabits();
    } catch (error) {
      console.error('Error creating habit:', error);
    }
  };

  const handleDeleteHabit = async (habitId) => {
    if (!window.confirm('Are you sure you want to delete this habit?')) return;
    try {
      await deleteHabit(currentUser.uid, habitId);
      fetchHabits();
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  const handleToggleHabit = async (habitId) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      await toggleHabitLog(currentUser.uid, habitId, today);
      fetchHabits();
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  };

  const isCompletedToday = (habit) => {
    const today = new Date().toISOString().split('T')[0];
    return habit.HabitLogs?.some(log => log.date === today && log.completed);
  };

  if (loading) {
    return (
      <Layout>
        <div className="retro-container" style={{ textAlign: 'center' }}>
          <p>Loading habits...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="retro-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Habit Tracker</h2>
          <button className="retro-btn" onClick={() => setIsModalOpen(true)}>
            Add Habit
          </button>
        </div>

        <div style={{ display: 'grid', gap: '20px' }}>
          {habits.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666' }}>No habits yet. Start by adding one!</p>
          ) : (
            habits.map(habit => {
              const completed = isCompletedToday(habit);
              return (
                <div key={habit.id} className="retro-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0', textDecoration: completed ? 'line-through' : 'none' }}>
                      {habit.name}
                    </h3>
                    {habit.description && <p style={{ margin: 0, fontSize: '0.9em', color: '#666' }}>{habit.description}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button 
                      className={`retro-btn ${completed ? 'secondary' : ''}`}
                      onClick={() => handleToggleHabit(habit.id)}
                    >
                      {completed ? 'Completed' : 'Mark Done'}
                    </button>
                    <button 
                      className="retro-btn secondary"
                      style={{ padding: '5px 10px', fontSize: '0.8em' }}
                      onClick={() => handleDeleteHabit(habit.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add New Habit"
        >
          <form onSubmit={handleCreateHabit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Habit Name</label>
              <input
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                className="retro-input"
                placeholder="e.g., Read 10 pages"
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Description (Optional)</label>
              <input
                type="text"
                value={newHabitDesc}
                onChange={(e) => setNewHabitDesc(e.target.value)}
                className="retro-input"
                placeholder="e.g., English book"
              />
            </div>
            <button type="submit" className="retro-btn">Create Habit</button>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default HabitTracker;

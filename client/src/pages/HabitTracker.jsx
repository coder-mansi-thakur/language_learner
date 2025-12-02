import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { getHabits, createHabit, deleteHabit, toggleHabitLog, updateHabit } from '../services/habitService';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const HabitTracker = () => {
  const { currentUser } = useAuth();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDesc, setNewHabitDesc] = useState('');
  const [pastDays, setPastDays] = useState([]);

  // Log Modal State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const days = [];
    // Generate last 90 days
    for (let i = 89; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        date: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        fullDayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      });
    }
    setPastDays(days);
  }, []);

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

  const handleSaveHabit = async (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    try {
      if (editingHabit) {
        await updateHabit(currentUser.uid, editingHabit.id, {
          name: newHabitName,
          description: newHabitDesc,
        });
      } else {
        await createHabit(currentUser.uid, {
          name: newHabitName,
          description: newHabitDesc,
          frequency: 'daily', // Default for now
          targetCount: 1,
          color: '#4F46E5'
        });
      }
      setNewHabitName('');
      setNewHabitDesc('');
      setEditingHabit(null);
      setIsModalOpen(false);
      fetchHabits();
    } catch (error) {
      console.error('Error saving habit:', error);
    }
  };

  const openEditModal = (habit) => {
    setEditingHabit(habit);
    setNewHabitName(habit.name);
    setNewHabitDesc(habit.description || '');
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingHabit(null);
    setNewHabitName('');
    setNewHabitDesc('');
    setIsModalOpen(true);
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

  const handleToggleHabit = async (habitId, date) => {
    // Instead of toggling immediately, open the modal
    const habit = habits.find(h => h.id === habitId);
    const log = habit.HabitLogs?.find(l => l.date === date);
    
    setSelectedHabit(habit);
    setSelectedDate(date);
    setSelectedLog(log);
    setIsLogModalOpen(true);
  };

  const handleLogAction = async (action, file = null) => {
    if (!selectedHabit || !selectedDate) return;

    try {
      let imageUrl = null;
      if (file) {
        setUploadingImage(true);
        const storageRef = ref(storage, `habit-logs/${currentUser.uid}/${selectedHabit.id}/${selectedDate}-${Date.now()}`);
        await uploadBytes(storageRef, file);
        imageUrl = await getDownloadURL(storageRef);
        setUploadingImage(false);
      }

      // If action is 'toggle', we just call the API. 
      // If we have an image, we pass it.
      // If we are uncompleting, we might want to delete the image? 
      // For now, toggleHabitLog handles create/delete based on existence.
      // But if we are adding an image to an existing log, we need to handle that.
      
      // If we are just adding an image to an existing completed log, we call toggleHabitLog with the image.
      // If we are marking as done (from not done), we call toggleHabitLog with image (optional).
      // If we are marking as not done (from done), we call toggleHabitLog (which will delete).

      if (action === 'markDone' || action === 'updateImage') {
         await toggleHabitLog(currentUser.uid, selectedHabit.id, selectedDate, imageUrl);
      } else if (action === 'markNotDone') {
         await toggleHabitLog(currentUser.uid, selectedHabit.id, selectedDate);
      }

      setIsLogModalOpen(false);
      fetchHabits();
    } catch (error) {
      console.error('Error updating habit log:', error);
      setUploadingImage(false);
    }
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
          <button className="retro-btn" onClick={openCreateModal}>
            Add Habit
          </button>
        </div>

        <div style={{ display: 'grid', gap: '20px' }}>
          {habits.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666' }}>No habits yet. Start by adding one!</p>
          ) : (
            habits.map(habit => (
              <div key={habit.id} className="retro-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0' }}>{habit.name}</h3>
                    {habit.description && <p style={{ margin: 0, fontSize: '0.9em', color: '#666' }}>{habit.description}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      className="retro-btn secondary"
                      style={{ padding: '5px 10px', fontSize: '0.8em' }}
                      onClick={() => openEditModal(habit)}
                    >
                      Edit
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
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(20px, 1fr))', 
                  gap: '4px', 
                  paddingBottom: '5px' 
                }}>
                  {pastDays.map(day => {
                    const isCompleted = habit.HabitLogs?.some(log => log.date === day.date && log.completed);
                    const isToday = day.date === new Date().toISOString().split('T')[0];
                    
                    // Calculate if editable (last 7 days)
                    const todayString = new Date().toISOString().split('T')[0];
                    const todayDate = new Date(todayString);
                    const targetDate = new Date(day.date);
                    const diffTime = todayDate - targetDate;
                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                    const isEditable = diffDays >= 0 && diffDays < 7;

                    return (
                      <div 
                        key={day.date}
                        onClick={() => {
                          if (isEditable) handleToggleHabit(habit.id, day.date);
                        }}
                        title={`${day.fullDayName}, ${day.date}${!isEditable ? ' (Read-only)' : ''}`}
                        style={{
                          width: '20px',
                          height: '20px',
                          border: '1px solid #000',
                          backgroundColor: isCompleted ? '#22c55e' : 'transparent', // Green color
                          cursor: isEditable ? 'pointer' : 'default',
                          boxShadow: isToday ? '2px 2px 0px #000' : 'none',
                          transform: isToday ? 'translate(-1px, -1px)' : 'none',
                          transition: 'all 0.1s ease'
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingHabit ? "Edit Habit" : "Add New Habit"}
        >
          <form onSubmit={handleSaveHabit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
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
            <button type="submit" className="retro-btn">{editingHabit ? "Save Changes" : "Create Habit"}</button>
          </form>
        </Modal>

        <Modal
          isOpen={isLogModalOpen}
          onClose={() => setIsLogModalOpen(false)}
          title={selectedHabit?.name}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <p>Date: {selectedDate}</p>
            
            {selectedLog?.imageUrl && (
              <div style={{ width: '100%', maxWidth: '300px' }}>
                <img src={selectedLog.imageUrl} alt="Proof" style={{ width: '100%', borderRadius: '8px', border: '2px solid #000' }} />
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', width: '100%' }}>
              {selectedLog?.completed ? (
                <>
                  <div style={{ color: '#22c55e', fontWeight: 'bold', textAlign: 'center' }}>Completed!</div>
                  <button 
                    className="retro-btn secondary" 
                    onClick={() => handleLogAction('markNotDone')}
                  >
                    Mark as Not Done
                  </button>
                  <label className="retro-btn" style={{ textAlign: 'center', cursor: 'pointer' }}>
                    {uploadingImage ? 'Uploading...' : (selectedLog.imageUrl ? 'Update Photo' : 'Add Photo Proof')}
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handleLogAction('updateImage', e.target.files[0]);
                        }
                      }}
                      disabled={uploadingImage}
                    />
                  </label>
                </>
              ) : (
                <>
                  <button 
                    className="retro-btn" 
                    onClick={() => handleLogAction('markDone')}
                  >
                    Mark as Done
                  </button>
                  <label className="retro-btn secondary" style={{ textAlign: 'center', cursor: 'pointer' }}>
                    {uploadingImage ? 'Uploading...' : 'Mark Done with Photo'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handleLogAction('markDone', e.target.files[0]);
                        }
                      }}
                      disabled={uploadingImage}
                    />
                  </label>
                </>
              )}
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default HabitTracker;

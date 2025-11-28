import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import DesignSystem from './pages/DesignSystem';
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import LanguageLearn from './pages/LanguageLearn';
import Practice from './pages/Practice';
import VocabCMS from './pages/VocabCMS';
import AddWord from './pages/AddWord';
import MyVocabulary from './pages/MyVocabulary';
import ImageTextExtractor from './pages/ImageTextExtractor';
import HabitTracker from './pages/HabitTracker';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/habits" element={<HabitTracker />} />
            <Route path="/learn/:code" element={<LanguageLearn />} />
            <Route path="/add-word/:code" element={<AddWord />} />
            <Route path="/practice/:code" element={<Practice />} />
            <Route path="/my-vocab" element={<MyVocabulary />} />
            <Route path="/image-extractor" element={<ImageTextExtractor />} />
            <Route path="/image-extractor/:code" element={<ImageTextExtractor />} />
            <Route path="/admin/vocab" element={<VocabCMS />} />
            <Route path="/ui-components" element={<DesignSystem />} />
            {/* Future routes will go here */}
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

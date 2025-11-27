import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import DesignSystem from './pages/DesignSystem';
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import LanguageLearn from './pages/LanguageLearn';
import VocabCMS from './pages/VocabCMS';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/learn/:code" element={<LanguageLearn />} />
          <Route path="/admin/vocab" element={<VocabCMS />} />
          <Route path="/ui-components" element={<DesignSystem />} />
          {/* Future routes will go here */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

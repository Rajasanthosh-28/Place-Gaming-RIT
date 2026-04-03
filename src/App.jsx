import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Leaderboard from './pages/Leaderboard';
import Challenges from './pages/Challenges';
import SpeedChallenge from './pages/SpeedChallenge';
import CodingChallenge from './pages/CodingChallenge';
import PuzzleGame from './pages/PuzzleGame';
import Missions from './pages/Missions';
import Profile from './pages/Profile';
import Applications from './pages/Applications';
import Login from './pages/Login';
import Signup from './pages/Signup';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const GameLayout = ({ children }) => (
  <>
    <Sidebar />
    <div className="flex-1 flex flex-col ml-16 md:ml-64 transition-all duration-300">
      <Navbar />
      <main className="flex-1 p-4 md:p-6 lg:p-10 relative">{children}</main>
    </div>
  </>
);

function App() {
  // Validate token on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => {
        if (!res.ok) {
          // Token is invalid, clear it
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        } else {
          return res.json();
        }
      }).then(user => {
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
      }).catch(() => {
        // Backend not reachable — keep cached data, don't force logout
      });
    }
  }, []);

  return (
    <Router>
      <div className="flex bg-slate-900 min-h-screen text-slate-100 selection:bg-cyan-500/30">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={
            <ProtectedRoute>
              <GameLayout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/challenges" element={<Challenges />} />
                  <Route path="/speed" element={<SpeedChallenge />} />
                  <Route path="/coding" element={<CodingChallenge />} />
                  <Route path="/puzzles" element={<PuzzleGame />} />
                  <Route path="/missions" element={<Missions />} />
                  <Route path="/jobs" element={<Jobs />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/applications" element={<Applications />} />
                </Routes>
              </GameLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Problems from './pages/Problems';
import Editor from './pages/Editor';
import BugHunt from './pages/BugHunt';
import Tracer from './pages/Tracer';
import Achievements from './pages/Achievements';
import MentorPanel from './pages/MentorPanel';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen"><div className="loader"></div></div>;
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <AuthPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="problems" element={<Problems />} />
        <Route path="editor" element={<Editor />} />
        <Route path="editor/:id" element={<Editor />} />
        <Route path="bughunt" element={<BugHunt />} />
        <Route path="tracer" element={<Tracer />} />
        <Route path="achievements" element={<Achievements />} />
        <Route path="mentor" element={<MentorPanel />} />
        <Route path="admin" element={<AdminPanel />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

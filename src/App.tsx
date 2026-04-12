import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/dashboard';
import Login from './pages/login';
import Signup from './pages/signup';

export default function App() {
  // สร้าง State สำหรับเก็บสถานะการ Login (เบื้องต้นใช้ boolean ไปก่อน)
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  return (
    <Router>
      <Routes>
        {/* หน้า Login */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={() => setIsAuthenticated(true)} />
          }
        />

        {/* หน้า Signup */}
        <Route
          path="/signup"
          element={<Signup onSignup={() => { }} />}
        />

        {/* หน้า Dashboard หลัก (อนุญาตให้เข้าได้เฉพาะตอน Login แล้ว) */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? <Dashboard onLogout={() => setIsAuthenticated(false)} /> : <Navigate to="/login" />
          }
        />

        {/* Redirect ค่าเริ่มต้นไปหน้า login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
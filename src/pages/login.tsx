import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AUTH_API_URL } from '../services/api';

export default function Login({ onLogin }: { onLogin: () => void }) {
  // UI ยังให้ผู้ใช้กรอก Email แต่ตอนส่ง API จะแมปไปที่ key 'username'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // เพิ่ม state สำหรับเก็บข้อความแจ้งเตือนเมื่อ login ผิดพลาด
  const [isLoading, setIsLoading] = useState(false); // เพิ่ม state กันการกดปุ่มซ้ำ
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // เรียก API ไปที่ Endpoint
      const response = await fetch(`${AUTH_API_URL}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: email,    // ส่งค่าจากช่อง email ไปที่ตัวแปร username
          password: password, // ส่งค่า password
        }),
      });

      if (!response.ok) {
        // กรณี HTTP Status ไม่ใช่ 200-299 (เช่น 401 Unauthorized)
        throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }

      const data = await response.json();

      // 1. เก็บ Token ไว้ใน localStorage เพื่อเอาไปแนบ Header ในการเรียก API อื่นๆ ภายหลัง
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        console.log('Access Token:', data.access_token); // สำหรับ manual test service อื่นๆ ครับ
      }

      console.log('Login success!');

      // 2. อัปเดตสถานะใน App.tsx ว่า Login ผ่านแล้ว
      onLogin();

      // 3. เปลี่ยนหน้าไปที่ Dashboard
      navigate('/dashboard');

    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg border border-stone-200">
        <div className="flex flex-col items-center mb-8">
          <span className="material-symbols-outlined text-[3rem] text-primary mb-2">coffee_maker</span>
          <h1 className="font-headline font-bold text-2xl text-stone-800">Welcome to CogniBrew</h1>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {/* แสดง Error Message ถ้ามี */}
          {error && (
            <div className="p-3 bg-error-container/30 text-error rounded-xl text-sm font-medium text-center border border-error/20">
              {error}
            </div>
          )}

          <input
            type="email"
            placeholder="Email (Username)"
            className="p-3 rounded-xl border border-stone-300 focus:outline-none focus:border-primary disabled:bg-stone-100"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="p-3 rounded-xl border border-stone-300 focus:outline-none focus:border-primary disabled:bg-stone-100"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 p-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-stone-500">
          Don't have an account? <Link to="/signup" className="text-primary font-bold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
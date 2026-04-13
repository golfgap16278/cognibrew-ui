import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// ปรับ onSignup ให้เป็น optional (?) เผื่อใน App.tsx ไม่ได้ส่งค่ามาจะได้ไม่ error
export default function Signup({ onSignup }: { onSignup?: () => void }) {
  // เพิ่ม State ให้ครบตามที่ API ต้องการ
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('User'); // ตั้งค่าเริ่มต้นเป็น Barista
  const [password, setPassword] = useState('');

  // State สำหรับจัดการ UX
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // เรียก API ไปที่ Endpoint
      const response = await fetch('http://localhost:60080/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          surname: surname,
          email: email,
          role: role,
          pwd: password, // แมป State password ส่งไปในชื่อ key 'pwd' ตามที่ API ต้องการ
        }),
      });

      if (!response.ok) {
        throw new Error('ไม่สามารถสร้างบัญชีได้ กรุณาลองใหม่อีกครั้ง');
      }

      console.log('Signup success!');

      // เรียก onSignup ถ้ามีการส่ง prop นี้มา
      if (onSignup) {
        onSignup();
      }

      // เมื่อสมัครสำเร็จ ให้พากลับไปหน้า Login
      navigate('/login');

    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background py-8">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg border border-stone-200">
        <div className="flex flex-col items-center mb-8">
          <span className="material-symbols-outlined text-[3rem] text-primary mb-2">coffee_maker</span>
          <h1 className="font-headline font-bold text-2xl text-stone-800">Create Account</h1>
        </div>

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          {/* แสดง Error Message ถ้ามี */}
          {error && (
            <div className="p-3 bg-error-container/30 text-error rounded-xl text-sm font-medium text-center border border-error/20">
              {error}
            </div>
          )}

          {/* จัดกลุ่ม ชื่อ-นามสกุล ให้อยู่บรรทัดเดียวกัน */}
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="First Name"
              className="w-full p-3 rounded-xl border border-stone-300 focus:outline-none focus:border-primary disabled:bg-stone-100"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              className="w-full p-3 rounded-xl border border-stone-300 focus:outline-none focus:border-primary disabled:bg-stone-100"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <input
            type="email"
            placeholder="Email"
            className="p-3 rounded-xl border border-stone-300 focus:outline-none focus:border-primary disabled:bg-stone-100"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />

          {/* Dropdown สำหรับเลือก Role */}
          <select
            className="p-3 rounded-xl border border-stone-300 focus:outline-none focus:border-primary disabled:bg-stone-100 bg-white"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={isLoading}
            required
          >
            <option value="User">Barista</option>
            <option value="Admin">Manager</option>
            <option value="Owner">Owner</option>
          </select>

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
            className="mt-4 p-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-stone-500">
          Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
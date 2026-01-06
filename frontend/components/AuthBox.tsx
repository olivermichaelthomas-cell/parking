import { useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => {
    const saved = localStorage.getItem('authToken');
    const savedRole = localStorage.getItem('authRole');
    if (saved) setToken(saved);
    if (savedRole) setRole(savedRole);
  }, []);

  const save = (t: string, r?: string) => {
    localStorage.setItem('authToken', t);
    if (r) localStorage.setItem('authRole', r);
    setToken(t);
    if (r) setRole(r);
  };

  const clear = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authRole');
    setToken(null);
    setRole(null);
  };
  return { token, role, save, clear };
}

export default function AuthBox() {
  const { token, role, save, clear } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const login = async () => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      save(data.token, data.role);
      setMessage('Logged in');
    } else {
      setMessage(data.message || 'Login failed');
    }
  };

  return (
    <div className="card">
      <h3>Auth</h3>
      {token ? (
        <div>
          <p>Signed in as {role}</p>
          <button onClick={clear}>Sign out</button>
        </div>
      ) : (
        <>
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={login}>Login</button>
          <p style={{ fontSize: '12px' }}>Use seed accounts: admin@parking.mu / AdminPass123! or officer@parking.mu / OfficerPass123!</p>
        </>
      )}
      {message && <p>{message}</p>}
    </div>
  );
}

export { API_BASE };

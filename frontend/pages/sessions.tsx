import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import AuthBox, { API_BASE, useAuth } from '../components/AuthBox';

interface Vehicle { id: string; plate_number: string; }
interface Zone { id: number; name: string; max_duration_minutes: number; unit_minutes: number; price_per_unit: number; }
interface Session { id: string; start_time: string; end_time: string; status: string; zone_id: number; amount_paid: number; plate_number?: string; zone_name?: string; }

export default function SessionsPage() {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const [duration, setDuration] = useState(30);
  const [message, setMessage] = useState('');
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/zones`).then((r) => r.json()).then(setZones);
  }, []);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/vehicles`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()).then(setVehicles);
    fetch(`${API_BASE}/sessions/mine`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()).then(setSessions);
  }, [token]);

  const startSession = async () => {
    if (!token) return setMessage('Login required');
    const res = await fetch(`${API_BASE}/sessions/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ vehicle_id: selectedVehicle, zone_id: selectedZone, duration_minutes: duration }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage('Session started');
      setSessions([data, ...sessions]);
    } else {
      setMessage(data.message || 'Could not start session');
    }
  };

  return (
    <Layout>
      <AuthBox />
      <div className="card">
        <h2>Start Parking Session</h2>
        <select value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)}>
          <option value="">Select vehicle</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>{v.plate_number}</option>
          ))}
        </select>
        <select value={selectedZone || ''} onChange={(e) => setSelectedZone(Number(e.target.value))}>
          <option value="">Select zone</option>
          {zones.map((z) => (
            <option key={z.id} value={z.id}>{z.name}</option>
          ))}
        </select>
        <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} placeholder="Duration minutes" />
        <button onClick={startSession}>Pay & Start (mock)</button>
        {message && <p>{message}</p>}
      </div>
      <div className="card">
        <h2>Recent Sessions</h2>
        {sessions.map((s) => (
          <div key={s.id}>
            {s.plate_number || ''} Zone {s.zone_name || s.zone_id} – {new Date(s.start_time).toLocaleTimeString()} to {new Date(s.end_time).toLocaleTimeString()} ({s.status})
          </div>
        ))}
      </div>
    </Layout>
  );
}

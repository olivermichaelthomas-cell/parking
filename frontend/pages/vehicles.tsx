import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import AuthBox, { API_BASE, useAuth } from '../components/AuthBox';

interface Vehicle {
  id: string;
  plate_number: string;
  nickname?: string;
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [plate, setPlate] = useState('');
  const [nickname, setNickname] = useState('');
  const [message, setMessage] = useState('');
  const { token } = useAuth();

  const load = async () => {
    if (!token) return;
    const res = await fetch(`${API_BASE}/vehicles`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setVehicles(await res.json());
  };

  useEffect(() => {
    load();
  }, [token]);

  const add = async () => {
    if (!token) return setMessage('Login required');
    const res = await fetch(`${API_BASE}/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ plate_number: plate, nickname }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage('Vehicle added');
      setPlate('');
      setNickname('');
      load();
    } else {
      setMessage(data.message || 'Failed');
    }
  };

  return (
    <Layout>
      <AuthBox />
      <div className="card">
        <h2>Add Vehicle</h2>
        <input placeholder="Plate number" value={plate} onChange={(e) => setPlate(e.target.value)} />
        <input placeholder="Nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} />
        <button onClick={add}>Save</button>
        {message && <p>{message}</p>}
      </div>
      <div className="card">
        <h2>Your Vehicles</h2>
        {vehicles.map((v) => (
          <div key={v.id}>{v.plate_number} {v.nickname && `(${v.nickname})`}</div>
        ))}
      </div>
    </Layout>
  );
}

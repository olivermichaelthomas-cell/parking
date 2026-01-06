import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import AuthBox, { API_BASE, useAuth } from '../../components/AuthBox';

interface ZoneInput {
  name: string;
  price_per_unit: number;
  unit_minutes: number;
  max_duration_minutes: number;
}

export default function AdminZones() {
  const [zones, setZones] = useState<any[]>([]);
  const [form, setForm] = useState<ZoneInput>({ name: '', price_per_unit: 10, unit_minutes: 30, max_duration_minutes: 120 });
  const { token } = useAuth();

  const load = async () => {
    const res = await fetch(`${API_BASE}/zones`);
    setZones(await res.json());
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!token) return;
    const payload = { ...form, enforcement_hours_by_day: { mon: { start: '08:00', end: '17:00' } }, active: true };
    const res = await fetch(`${API_BASE}/zones/admin/zones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    if (res.ok) load();
  };

  return (
    <Layout>
      <AuthBox />
      <div className="card">
        <h2>Create Zone</h2>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input type="number" placeholder="Price per unit" value={form.price_per_unit} onChange={(e) => setForm({ ...form, price_per_unit: Number(e.target.value) })} />
        <input type="number" placeholder="Unit minutes" value={form.unit_minutes} onChange={(e) => setForm({ ...form, unit_minutes: Number(e.target.value) })} />
        <input type="number" placeholder="Max duration" value={form.max_duration_minutes} onChange={(e) => setForm({ ...form, max_duration_minutes: Number(e.target.value) })} />
        <button onClick={create}>Save</button>
      </div>
      <div className="card">
        <h2>Zones</h2>
        {zones.map((z) => (
          <div key={z.id}>{z.name} - MUR {z.price_per_unit}</div>
        ))}
      </div>
    </Layout>
  );
}

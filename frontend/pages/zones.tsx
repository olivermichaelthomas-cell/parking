import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import AuthBox, { API_BASE, useAuth } from '../components/AuthBox';

interface Zone {
  id: number;
  name: string;
  price_per_unit: number;
  unit_minutes: number;
  max_duration_minutes: number;
}

export default function ZonesPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    fetch(`${API_BASE}/zones`).then((res) => res.json()).then(setZones);
  }, []);

  return (
    <Layout>
      <AuthBox />
      <div className="card">
        <h2>Zones</h2>
        {zones.map((z) => (
          <div key={z.id}>
            <strong>{z.name}</strong> - MUR {z.price_per_unit} per {z.unit_minutes} mins (max {z.max_duration_minutes} mins)
          </div>
        ))}
      </div>
    </Layout>
  );
}

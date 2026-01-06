import { useState } from 'react';
import Layout from '../components/Layout';
import AuthBox, { API_BASE, useAuth } from '../components/AuthBox';

export default function OfficerPage() {
  const [plate, setPlate] = useState('');
  const [result, setResult] = useState<any>(null);
  const { token } = useAuth();

  const lookup = async () => {
    if (!token) return;
    const res = await fetch(`${API_BASE}/sessions/active?plate=${plate}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setResult(data);
  };

  return (
    <Layout>
      <AuthBox />
      <div className="card">
        <h2>Officer Lookup</h2>
        <input placeholder="Plate" value={plate} onChange={(e) => setPlate(e.target.value)} />
        <button onClick={lookup}>Check</button>
        {result && (
          <div>
            <p>Status: {result.status}</p>
            {result.session && (
              <div>
                <p>Zone: {result.session.zone_name}</p>
                <p>Start: {new Date(result.session.start_time).toLocaleString()}</p>
                <p>Expires: {new Date(result.session.end_time).toLocaleString()}</p>
                <p>Payment Ref: {result.session.payment_ref}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

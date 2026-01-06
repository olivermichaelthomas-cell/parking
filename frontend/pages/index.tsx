import Layout from '../components/Layout';
import Link from 'next/link';

export default function Home() {
  return (
    <Layout>
      <div className="card">
        <h2>Welcome to Mauritius Public Parking e-Coupon</h2>
        <p>Purchase digital parking coupons, manage your vehicles, and stay notified before expiry.</p>
        <p>This starter UI is mobile-first and connects to the Node.js API defined in this repository.</p>
      </div>
      <div className="card">
        <h3>Quick Links</h3>
        <ul>
          <li><Link href="/zones">View Zones</Link></li>
          <li><Link href="/vehicles">Add Vehicle</Link></li>
          <li><Link href="/sessions">Start Session</Link></li>
          <li><Link href="/officer">Officer Lookup</Link></li>
          <li><Link href="/admin/zones">Admin Zones</Link></li>
        </ul>
      </div>
    </Layout>
  );
}

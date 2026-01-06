import Link from 'next/link';
import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <header>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 'bold' }}>Mauritius e-Coupon</div>
          <nav>
            <Link href="/">Home</Link>
            <Link href="/zones">Zones</Link>
            <Link href="/vehicles">Vehicles</Link>
            <Link href="/sessions">Sessions</Link>
            <Link href="/officer">Officer</Link>
            <Link href="/admin/zones">Admin</Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

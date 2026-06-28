'use client';

export default function SubscriptionCancel() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <div style={{ textAlign: 'center', maxWidth: 500, padding: 20 }}>
        <img src="https://tejiona.com/logo.png" alt="TEJIONA" style={{ height: 64, marginBottom: 20 }} />
        <i className="fas fa-times-circle" style={{ color: '#f59e0b', fontSize: 48, marginBottom: 16, display: 'block' }} />
        <h1 style={{ color: '#fff', fontSize: 22, marginBottom: 12 }}>Paiement annulé / Payment cancelled</h1>
        <p style={{ color: '#94a3b8', marginBottom: 24 }}>
          Vous pouvez réessayer à tout moment. / You can try again anytime.
        </p>
        <a href="https://tejiona.com#services" style={{ background: '#6366f1', color: '#fff', padding: '12px 28px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, display: 'inline-block' }}>
          Retour aux offres / Back to offers
        </a>
      </div>
    </div>
  );
}

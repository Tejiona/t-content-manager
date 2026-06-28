'use client';

export default function SubscriptionSuccess() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <div style={{ textAlign: 'center', maxWidth: 500, padding: 20 }} className="animate-slide-up">
        <img src="https://tejiona.com/logo.png" alt="TEJIONA" style={{ height: 64, marginBottom: 20 }} />
        <i className="fas fa-check-circle" style={{ color: '#10b981', fontSize: 64, marginBottom: 20, display: 'block' }} />
        <h1 style={{ color: '#fff', fontSize: 26, marginBottom: 12 }}>
          Subscription Confirmed!
        </h1>
        <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: 24 }}>
          Merci pour votre souscription au <strong style={{ color: '#6366f1' }}>Content Manager IA</strong>.<br />
          Un email de confirmation avec les instructions de configuration vous a été envoyé.<br /><br />
          Thank you for subscribing to <strong style={{ color: '#6366f1' }}>AI Content Manager</strong>.<br />
          A confirmation email with setup instructions has been sent to you.
        </p>
        <p style={{ color: '#475569', fontSize: 13 }}>
          &copy; 2026 TEJIONA AI Solutions &middot; <a href="https://tejiona.com" style={{ color: '#6366f1', textDecoration: 'none' }}>tejiona.com</a>
        </p>
      </div>
    </div>
  );
}

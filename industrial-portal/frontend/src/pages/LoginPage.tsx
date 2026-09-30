import { useState } from 'react';

interface LoginPageProps {
  onLogin: (userData: object) => void;
}

const INDUSTRY_SECTORS = [
  'Oil & Gas Refinery', 'Chemical Manufacturing', 'Steel & Metals',
  'Thermal Power Plant', 'Cement Industry', 'Pharmaceutical',
  'Textile & Dyeing', 'Fertilizer Plant', 'Paper & Pulp', 'Other',
];

const INDIA_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab',
  'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
];

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('A. Sharma');
  const [email, setEmail] = useState('safety.officer@industry.gov.in');
  const [password, setPassword] = useState('demo1234');
  const [facilityName, setFacilityName] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [municipality, setMunicipality] = useState('Pune');
  const [sector, setSector] = useState('Chemical Manufacturing');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Fill in every field to continue.'); return;
    }
    setLoading(true); setError('');
    // Demo: always succeed with local session
    await new Promise(r => setTimeout(r, 600));
    onLogin({ name: name.trim(), email: email.trim(), state, municipality, facilityName, sector });
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0d12',
      display: 'grid',
      placeItems: 'center',
      padding: '40px 16px',
      color: '#e2e8f0',
      fontFamily: 'Lexend, sans-serif',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Radial glows */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(circle at 10% 0%, rgba(255,69,0,0.18) 0%, transparent 35%), radial-gradient(circle at 95% 90%, rgba(239,68,68,0.12) 0%, transparent 32%)',
      }} />

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 900, display: 'grid', gap: 32, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>

        {/* Left: Branding panel */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: 'rgba(255,69,0,0.15)',
              border: '1px solid rgba(255,69,0,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
            }}>🏭</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>AGNI-VISION INDUSTRY WATCH</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#ff4500' }}>
                Industrial Safety Portal
              </div>
            </div>
          </div>

          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, lineHeight: 1.3, color: '#fff' }}>
            Facility-level fire detection for industrial safety officers.
          </h1>

          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: '#94a3b8' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#ef4444', fontSize: 16 }}>🔥</span> Real-time satellite thermal anomaly detection
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#38bdf8', fontSize: 16 }}>📡</span> VIIRS, MODIS & SEVIRI multi-sensor fusion
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#f59e0b', fontSize: 16 }}>⚠️</span> Asset health monitoring & incident response
            </li>
          </ul>

          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#475569', margin: 0 }}>
            Demo environment · accounts are simulated, no real login is created
          </p>

          {/* Back to map */}
          <a href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: '#94a3b8', fontSize: 13, textDecoration: 'none',
            transition: 'color 0.2s',
          }}
            onMouseOver={e => (e.currentTarget.style.color = '#fff')}
            onMouseOut={e => (e.currentTarget.style.color = '#94a3b8')}
          >
            ← Back to AGNI-VISION Map
          </a>
        </div>

        {/* Right: Login form */}
        <form onSubmit={handleSubmit} style={{
          background: 'rgba(14,17,23,0.92)',
          backdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 14,
          padding: 28,
          boxShadow: '0 24px 48px rgba(0,0,0,0.6)',
        }}>
          {/* Mode toggle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 4, marginBottom: 22 }}>
            {(['signin', 'signup'] as const).map(m => (
              <button key={m} type="button" onClick={() => { setMode(m); setError(''); }} style={{
                padding: '8px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontSize: 13, fontFamily: 'Lexend, sans-serif', fontWeight: 600, transition: 'all 0.2s',
                background: mode === m ? 'rgba(255,69,0,0.18)' : 'transparent',
                color: mode === m ? '#ff4500' : '#94a3b8',
                boxShadow: mode === m ? 'inset 0 0 0 1px rgba(255,69,0,0.4)' : 'none',
              }}>
                {m === 'signin' ? 'Sign In' : 'Register Facility'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Name */}
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Safety Officer Name</span>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" style={inputStyle} />
            </label>

            {/* Email */}
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Official Email</span>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@industry.gov.in" style={inputStyle} />
            </label>

            {/* Password */}
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</span>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
            </label>

            {/* State + Sector row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>State / UT</span>
                <select value={state} onChange={e => setState(e.target.value)} style={selectStyle}>
                  {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sector</span>
                <select value={sector} onChange={e => setSector(e.target.value)} style={selectStyle}>
                  <option value="">Select sector</option>
                  {INDUSTRY_SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
            </div>

            {/* Facility name (signup only) */}
            {mode === 'signup' && (
              <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Facility / Plant Name</span>
                <input value={facilityName} onChange={e => setFacilityName(e.target.value)} placeholder="e.g. Reliance Jamnagar Refinery" style={inputStyle} />
              </label>
            )}

            {/* Error */}
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#f87171' }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              marginTop: 4,
              height: 42, borderRadius: 8, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? 'rgba(255,69,0,0.4)' : 'linear-gradient(135deg, #ff4500, #f97316)',
              color: '#fff', fontSize: 14, fontFamily: 'Lexend, sans-serif', fontWeight: 700,
              letterSpacing: '0.05em', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {loading ? (
                <>
                  <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  Authenticating...
                </>
              ) : (
                mode === 'signin' ? 'Sign In to Portal' : 'Register & Continue'
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  height: 38, padding: '0 12px', borderRadius: 8,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: '#e2e8f0', fontSize: 14, fontFamily: 'Lexend, sans-serif',
  outline: 'none', transition: 'border-color 0.2s',
};

const selectStyle: React.CSSProperties = {
  height: 38, padding: '0 10px', borderRadius: 8,
  background: '#0f1318',
  border: '1px solid rgba(255,255,255,0.12)',
  color: '#e2e8f0', fontSize: 13, fontFamily: 'Lexend, sans-serif',
  outline: 'none',
};

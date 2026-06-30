import { useState } from "react";

const S = {
  overlay: {
    position: "fixed", inset: 0, zIndex: 9999,
    background: "rgba(0,0,0,0.80)",
    display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
  },
  card: {
    background: "linear-gradient(180deg,#1e1035,#120a25)",
    borderRadius: 20, border: "1.5px solid rgba(180,130,255,0.35)",
    padding: "28px 24px", maxWidth: 340, width: "100%",
    fontFamily: "'Lora',serif",
  },
  title: { fontSize: 20, fontWeight: 700, color: "#c9a0e8", textAlign: "center", marginBottom: 4 },
  sub:   { fontSize: 13, color: "rgba(200,180,230,0.65)", textAlign: "center", marginBottom: 22, lineHeight: 1.5 },
  googleBtn: {
    width: "100%", background: "white", border: "none", borderRadius: 12,
    padding: "13px", display: "flex", alignItems: "center", justifyContent: "center",
    gap: 10, fontSize: 14, fontWeight: 700, cursor: "pointer",
    fontFamily: "'Lora',serif", color: "#333", marginBottom: 14,
  },
  divider: {
    display: "flex", alignItems: "center", gap: 10, marginBottom: 14,
  },
  divLine: { flex: 1, height: 1, background: "rgba(180,130,255,0.2)" },
  divText: { fontSize: 11, color: "rgba(200,180,230,0.45)", whiteSpace: "nowrap" },
  input: {
    width: "100%", background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(180,130,255,0.3)", borderRadius: 10,
    padding: "12px 14px", fontSize: 14, color: "white",
    fontFamily: "'Lora',serif", marginBottom: 10, boxSizing: "border-box",
    outline: "none",
  },
  primaryBtn: {
    width: "100%", background: "linear-gradient(135deg,#6b3fa0,#9b59d0)",
    border: "none", borderRadius: 12, padding: "13px",
    color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer",
    fontFamily: "'Lora',serif", marginBottom: 10,
  },
  switchBtn: {
    width: "100%", background: "transparent",
    border: "1px solid rgba(180,130,255,0.2)", borderRadius: 12, padding: "11px",
    color: "rgba(180,130,255,0.7)", fontSize: 13, cursor: "pointer",
    fontFamily: "'Lora',serif", marginBottom: 8,
  },
  skipBtn: {
    width: "100%", background: "transparent", border: "none",
    color: "rgba(200,180,230,0.4)", fontSize: 12, cursor: "pointer",
    fontFamily: "'Lora',serif", padding: "8px",
  },
  error: {
    background: "rgba(220,60,60,0.15)", border: "1px solid rgba(220,60,60,0.3)",
    borderRadius: 8, padding: "10px 12px", fontSize: 12,
    color: "#ff9090", marginBottom: 12, lineHeight: 1.5,
  },
};

// Minimal inline Google "G" logo in SVG
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

export default function SignInModal({ onGoogle, onEmail, onSkip, error, onClearError }) {
  const [isNew, setIsNew]       = useState(false);
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onEmail(email.trim(), password, isNew);
  }

  return (
    <div style={S.overlay}>
      <div style={S.card}>
        <div style={{ fontSize: 28, textAlign: "center", marginBottom: 8 }}>🌹</div>
        <div style={S.title}>Save Your Progress</div>
        <div style={S.sub}>
          Sign in to keep your 54-Day Novena and rosary progress synced across all your devices.
        </div>

        {error && (
          <div style={S.error}>{error}</div>
        )}

        <button style={S.googleBtn} onClick={() => { onClearError(); onGoogle(); }}>
          <GoogleIcon />
          Continue with Google
        </button>

        <div style={S.divider}>
          <div style={S.divLine} />
          <span style={S.divText}>or use email</span>
          <div style={S.divLine} />
        </div>

        <form onSubmit={handleSubmit}>
          <input
            style={S.input}
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => { onClearError(); setEmail(e.target.value); }}
            autoComplete="email"
            required
          />
          <input
            style={S.input}
            type="password"
            placeholder={isNew ? "Create a password (6+ chars)" : "Password"}
            value={password}
            onChange={e => { onClearError(); setPassword(e.target.value); }}
            autoComplete={isNew ? "new-password" : "current-password"}
            required
          />
          <button type="submit" style={S.primaryBtn}>
            {isNew ? "Create Account" : "Sign In"}
          </button>
        </form>

        <button style={S.switchBtn} onClick={() => { onClearError(); setIsNew(v => !v); }}>
          {isNew ? "Already have an account? Sign in" : "No account yet? Create one"}
        </button>

        <button style={S.skipBtn} onClick={onSkip}>
          Continue without signing in
        </button>
      </div>
    </div>
  );
}

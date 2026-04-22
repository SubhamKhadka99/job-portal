import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/client";
import { toast } from "../hooks/useToast";
import { ArrowLeftIcon, ChevronDownIcon } from "../components/icons";

// ─── Verification screen ──────────────────────────────────────────────────────
function VerifyScreen({ email, onVerified, onBack }) {
  const [codes, setCodes]       = useState(["", "", "", "", "", ""]);
  const [loading, setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);

  // Countdown timer for the Resend button
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  function handleInput(index, value) {
    // Allow only digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const next  = [...codes];
    next[index] = digit;
    setCodes(next);

    // Auto-advance to next box
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are filled
    if (digit && index === 5) {
      const full = [...next].join("");
      if (full.length === 6) submitCode(full);
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === "Backspace" && !codes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = ["", "", "", "", "", ""];
    pasted.split("").forEach((d, i) => { next[i] = d; });
    setCodes(next);
    // Focus the last filled box
    const lastIdx = Math.min(pasted.length - 1, 5);
    inputRefs.current[lastIdx]?.focus();
    if (pasted.length === 6) submitCode(pasted);
  }

  async function submitCode(code) {
    setLoading(true);
    const res = await authApi.verify(email, code);
    setLoading(false);

    if (res.success) {
      onVerified(res.user, res.token);
    } else {
      toast(res.message || "Invalid code", "error");
      setCodes(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  }

  async function handleResend() {
    setResending(true);
    const res = await authApi.resendCode(email);
    setResending(false);
    if (res.success) {
      toast("A new code has been sent!", "success");
      setCountdown(60);
      setCodes(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } else {
      toast(res.message || "Failed to resend", "error");
    }
  }

  const fullCode = codes.join("");

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Hire<span>Craft</span></div>
        <div className="auth-tagline">Check your inbox</div>

        <div style={{ textAlign: "center", margin: "1.25rem 0 1.75rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: ".75rem" }}>📬</div>
          <p style={{ color: "var(--muted)", fontSize: ".9rem", lineHeight: 1.6, margin: 0 }}>
            We sent a 6-digit code to<br />
            <strong style={{ color: "var(--ink)" }}>{email}</strong>
          </p>
        </div>

        {/* 6-box code input */}
        <div style={{ display: "flex", gap: ".5rem", justifyContent: "center", marginBottom: "1.5rem" }}>
          {codes.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              autoFocus={i === 0}
              onChange={(e) => handleInput(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              style={{
                width: "3rem",
                height: "3.5rem",
                textAlign: "center",
                fontSize: "1.5rem",
                fontWeight: 700,
                border: `2px solid ${digit ? "var(--gold)" : "var(--border)"}`,
                borderRadius: "10px",
                background: "var(--surface)",
                color: "var(--ink)",
                outline: "none",
                transition: "border-color .15s",
              }}
            />
          ))}
        </div>

        <button
          className="btn btn-gold btn-full"
          onClick={() => submitCode(fullCode)}
          disabled={loading || fullCode.length < 6}
        >
          {loading ? "Verifying…" : "Verify Email"}
        </button>

        <div style={{ textAlign: "center", marginTop: "1.25rem", fontSize: ".85rem", color: "var(--muted)" }}>
          Didn't receive it?{" "}
          {countdown > 0 ? (
            <span>Resend in {countdown}s</span>
          ) : (
            <button
              className="btn btn-ghost btn-sm"
              onClick={handleResend}
              disabled={resending}
              style={{ display: "inline", padding: "0", fontWeight: 600, color: "var(--gold)" }}
            >
              {resending ? "Sending…" : "Resend code"}
            </button>
          )}
        </div>

        <div className="auth-footer" style={{ marginTop: "1.5rem" }}>
          <button className="btn btn-ghost btn-sm" onClick={onBack}>
            <ArrowLeftIcon size={13} /> Back to sign in
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main auth page ───────────────────────────────────────────────────────────
export default function AuthPage({ onSuccess, onBack }) {
  const { login } = useAuth();
  const [tab, setTab]   = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [loading, setLoading]   = useState(false);

  // When set, show the verification screen instead of the login/signup form
  const [pendingEmail, setPendingEmail] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit() {
    if (!form.email || !form.password) {
      toast("Email and password are required", "error");
      return;
    }
    if (tab === "signup" && !form.name) {
      toast("Name is required", "error");
      return;
    }

    setLoading(true);
    const res = tab === "login"
      ? await authApi.login(form.email, form.password)
      : await authApi.signup(form.name, form.email, form.password, form.role);
    setLoading(false);

    // Backend signals that verification is needed
    if (res.requiresVerification) {
      setPendingEmail(res.email || form.email);
      if (res.message) toast(res.message, "info");
      return;
    }

    if (res.success) {
      login(res.user, res.token);
      toast(`Welcome${tab === "login" ? " back" : ""}, ${res.user.name.split(" ")[0]}!`, "success");
      onSuccess();
    } else {
      toast(res.message || "Something went wrong", "error");
    }
  }

  function handleVerified(user, token) {
    login(user, token);
    toast(`Welcome, ${user.name.split(" ")[0]}!`, "success");
    onSuccess();
  }

  // Show verification screen if we have a pending email
  if (pendingEmail) {
    return (
      <VerifyScreen
        email={pendingEmail}
        onVerified={handleVerified}
        onBack={() => setPendingEmail(null)}
      />
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Hire<span>Craft</span></div>
        <div className="auth-tagline">Find your next opportunity or great hire.</div>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === "login" ? "active" : ""}`} onClick={() => setTab("login")}>
            Sign In
          </button>
          <button className={`auth-tab ${tab === "signup" ? "active" : ""}`} onClick={() => setTab("signup")}>
            Create Account
          </button>
        </div>

        <div className="form">
          {tab === "signup" && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.name} onChange={set("name")} placeholder="Jane Smith" autoFocus />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="you@email.com"
              autoFocus={tab === "login"}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              value={form.password}
              onChange={set("password")}
              placeholder="••••••••"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          {tab === "signup" && (
            <div className="form-group">
              <label className="form-label">I am a</label>
              <div className="select-wrap">
                <select className="form-select" value={form.role} onChange={set("role")}>
                  <option value="user">Job Seeker</option>
                  <option value="admin">Employer / Admin</option>
                </select>
                <span className="select-arrow"><ChevronDownIcon size={13} /></span>
              </div>
            </div>
          )}

          <button className="btn btn-gold btn-full" onClick={handleSubmit} disabled={loading}>
            {loading ? "Please wait…" : tab === "login" ? "Sign In" : "Create Account"}
          </button>
        </div>

        <div className="auth-footer">
          <button className="btn btn-ghost btn-sm" onClick={onBack}>
            <ArrowLeftIcon size={13} /> Back to jobs
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/client";
import { toast } from "../hooks/useToast";
import { ArrowLeftIcon, ChevronDownIcon } from "../components/icons";

export default function AuthPage({ onSuccess, onBack }) {
  const { login } = useAuth();
  const [tab, setTab]   = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [loading, setLoading] = useState(false);

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

    if (res.success) {
      login(res.user, res.token);
      toast(`Welcome${tab === "login" ? " back" : ""}, ${res.user.name.split(" ")[0]}!`, "success");
      onSuccess();
    } else {
      toast(res.message || "Something went wrong", "error");
    }
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

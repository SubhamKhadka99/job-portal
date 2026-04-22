import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { usersApi } from "../api/client";
import { toast } from "../hooks/useToast";
import { initials } from "../utils/formatters";
import Spinner from "../components/Spinner";

export default function ProfilePage() {
  const { user, login, token } = useAuth();
  const [form, setForm] = useState({
    phone: "", location: "", bio: "", experience: "", skills: [],
  });
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);

  useEffect(() => {
    usersApi.getMe().then((res) => {
      if (res.success) {
        const u = res.user;
        setForm({
          phone:      u.phone      || "",
          location:   u.location   || "",
          bio:        u.bio        || "",
          experience: u.experience || "",
          skills:     u.skills     || [],
        });
      }
      setLoading(false);
    });
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function addSkill(e) {
    if ((e.key === "Enter" || e.key === ",") && skillInput.trim()) {
      e.preventDefault();
      const s = skillInput.trim().replace(/,$/, "");
      if (s && !form.skills.includes(s))
        setForm((f) => ({ ...f, skills: [...f.skills, s] }));
      setSkillInput("");
    }
  }

  function removeSkill(s) {
    setForm((f) => ({ ...f, skills: f.skills.filter((x) => x !== s) }));
  }

  async function save() {
    setSaving(true);
    const res = await usersApi.updateProfile(form);
    setSaving(false);
    if (res.success) {
      toast("Profile updated!", "success");
      login({ ...user, ...res.user }, token);
    } else {
      toast(res.message || "Failed to save", "error");
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="profile-page">
      <div className="profile-card">
        {/* Avatar & identity */}
        <div className="profile-avatar">{initials(user?.name)}</div>
        <div className="profile-name">{user?.name}</div>
        <div className="profile-email">{user?.email}</div>
        <div style={{ marginTop: ".5rem" }}>
          <span className="role-pill">{user?.role}</span>
        </div>

        <div className="profile-divider" />

        {/* Editable fields */}
        <div className="form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                className="form-input"
                value={form.phone}
                onChange={set("phone")}
                placeholder="+1 555 0000"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                className="form-input"
                value={form.location}
                onChange={set("location")}
                placeholder="City, Country"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Bio</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={form.bio}
              onChange={set("bio")}
              placeholder="A short bio about yourself..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Experience</label>
            <input
              className="form-input"
              value={form.experience}
              onChange={set("experience")}
              placeholder="e.g. 3 years in frontend development"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Skills{" "}
              <span style={{ color: "var(--muted)", fontWeight: 400 }}>
                (press Enter or comma to add)
              </span>
            </label>
            <div className="tags-input-wrap">
              {form.skills.map((s) => (
                <span className="tag-chip" key={s}>
                  {s}
                  <button onClick={() => removeSkill(s)} type="button">×</button>
                </span>
              ))}
              <input
                className="tags-input"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={addSkill}
                placeholder="React, Node.js…"
              />
            </div>
          </div>

          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

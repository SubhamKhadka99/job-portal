import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { applicationsApi } from "../api/client";
import { toast } from "../hooks/useToast";
import { XIcon, UploadIcon } from "./icons";

export default function ApplyModal({ job, onClose, onSuccess }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    fullName:    user?.name  || "",
    email:       user?.email || "",
    phone:       "",
    coverLetter: "",
  });
  const [file, setFile]       = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // FIX: validate that selected file is a PDF before submitting
  function handleFileChange(e) {
    const selected = e.target.files[0];
    if (selected && selected.type !== "application/pdf") {
      toast("Only PDF files are accepted for your CV", "error");
      e.target.value = "";
      return;
    }
    setFile(selected);
  }

  async function handleSubmit() {
    if (!form.fullName || !form.email) {
      toast("Name and email are required", "error");
      return;
    }
    if (!file) {
      toast("Please upload your CV (PDF only)", "error");
      return;
    }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append("cv", file);

    setLoading(true);
    const res = await applicationsApi.apply(job._id, fd);
    setLoading(false);

    if (res.success) {
      toast("Application submitted!", "success");
      onSuccess();
    } else {
      toast(res.message || "Failed to apply", "error");
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <div className="modal-title">Apply for Position</div>
            <div className="modal-subtitle">{job.title} at {job.company}</div>
          </div>
          <button className="modal-close" onClick={onClose}><XIcon size={15} /></button>
        </div>

        <div className="modal-body">
          <div className="form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" value={form.fullName} onChange={set("fullName")} placeholder="Jane Smith" />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" value={form.email} onChange={set("email")} placeholder="you@email.com" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone <span style={{ color: "var(--muted)", fontWeight: 400 }}>(optional)</span></label>
              <input className="form-input" value={form.phone} onChange={set("phone")} placeholder="+1 555 0000" />
            </div>

            <div className="form-group">
              <label className="form-label">Cover Letter <span style={{ color: "var(--muted)", fontWeight: 400 }}>(optional)</span></label>
              <textarea
                className="form-textarea"
                rows={4}
                value={form.coverLetter}
                onChange={set("coverLetter")}
                placeholder="Tell them why you're a great fit..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">CV / Resume *</label>
              {/* FIX: accept only .pdf — backend rejects anything else */}
              <div className="file-upload">
                <input type="file" accept=".pdf" onChange={handleFileChange} />
                <div className="file-upload-icon"><UploadIcon size={22} /></div>
                <div className="file-upload-text"><strong>Click to upload</strong> or drag &amp; drop</div>
                <div className="form-hint" style={{ marginTop: ".3rem" }}>PDF only — max 5 MB</div>
                {file && <div className="file-selected">✓ {file.name}</div>}
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: 0 }}>
              <button className="btn btn-outline" onClick={onClose}>Cancel</button>
              <button className="btn btn-gold" style={{ flex: 1 }} onClick={handleSubmit} disabled={loading}>
                {loading ? "Submitting…" : "Submit Application"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

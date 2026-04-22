import { useState } from "react";
import { jobsApi } from "../api/client";
import { toast } from "../hooks/useToast";
import { expLabels } from "../utils/formatters";
import { XIcon, ChevronDownIcon } from "./icons";

export default function JobFormModal({ job, onClose, onSave }) {
  const isEdit = Boolean(job);

  const [form, setForm] = useState({
    title:               job?.title               || "",
    company:             job?.company             || "",
    location:            job?.location            || "",
    type:                job?.type                || "full-time",
    description:         job?.description         || "",
    requirements:        job?.requirements?.join("\n") || "",
    salaryMin:           job?.salaryMin            ?? "",
    salaryMax:           job?.salaryMax            ?? "",
    experienceLevel:     job?.experienceLevel      || "junior",
    applicationDeadline: job?.applicationDeadline
      ? job.applicationDeadline.split("T")[0]
      : "",
    status: job?.status || "open",
  });
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSave() {
    if (!form.title || !form.company || !form.location || !form.description) {
      toast("Please fill in all required fields", "error");
      return;
    }
    setSaving(true);
    const body = {
      ...form,
      requirements: form.requirements.split("\n").map((r) => r.trim()).filter(Boolean),
      salaryMin:    form.salaryMin !== "" ? Number(form.salaryMin) : null,
      salaryMax:    form.salaryMax !== "" ? Number(form.salaryMax) : null,
      applicationDeadline: form.applicationDeadline || null,
    };
    const res = isEdit
      ? await jobsApi.update(job._id, body)
      : await jobsApi.create(body);
    setSaving(false);
    if (res.success) {
      toast(isEdit ? "Job updated!" : "Job posted!", "success");
      onSave();
    } else {
      toast(res.message || "Failed to save", "error");
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-wide">
        <div className="modal-header">
          <div>
            <div className="modal-title">{isEdit ? "Edit Job" : "Post a New Job"}</div>
            <div className="modal-subtitle">
              {isEdit ? `Editing "${job.title}"` : "Fill in the details for this position"}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><XIcon size={15} /></button>
        </div>

        <div className="modal-body">
          <div className="form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Job Title *</label>
                <input className="form-input" value={form.title} onChange={set("title")} placeholder="Senior Frontend Engineer" />
              </div>
              <div className="form-group">
                <label className="form-label">Company *</label>
                <input className="form-input" value={form.company} onChange={set("company")} placeholder="Acme Corp" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Location *</label>
                <input className="form-input" value={form.location} onChange={set("location")} placeholder="New York, NY" />
              </div>
              <div className="form-group">
                <label className="form-label">Job Type</label>
                <div className="select-wrap">
                  <select className="form-select" value={form.type} onChange={set("type")}>
                    {["full-time","part-time","contract","internship","remote"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <span className="select-arrow"><ChevronDownIcon size={13} /></span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                className="form-textarea"
                rows={5}
                value={form.description}
                onChange={set("description")}
                placeholder="Describe the role, responsibilities, and your team..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Requirements <span style={{ color: "var(--muted)", fontWeight: 400 }}>(one per line)</span>
              </label>
              <textarea
                className="form-textarea"
                rows={4}
                value={form.requirements}
                onChange={set("requirements")}
                placeholder={"3+ years React experience\nStrong TypeScript skills\nFamiliarity with REST APIs"}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Min Salary ($)</label>
                <input className="form-input" type="number" min="0" value={form.salaryMin} onChange={set("salaryMin")} placeholder="60000" />
              </div>
              <div className="form-group">
                <label className="form-label">Max Salary ($)</label>
                <input className="form-input" type="number" min="0" value={form.salaryMax} onChange={set("salaryMax")} placeholder="90000" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Experience Level</label>
                <div className="select-wrap">
                  <select className="form-select" value={form.experienceLevel} onChange={set("experienceLevel")}>
                    {Object.entries(expLabels).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                  <span className="select-arrow"><ChevronDownIcon size={13} /></span>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Application Deadline</label>
                <input className="form-input" type="date" value={form.applicationDeadline} onChange={set("applicationDeadline")} />
              </div>
            </div>

            {isEdit && (
              <div className="form-group">
                <label className="form-label">Status</label>
                <div className="select-wrap">
                  <select className="form-select" value={form.status} onChange={set("status")}>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                  <span className="select-arrow"><ChevronDownIcon size={13} /></span>
                </div>
              </div>
            )}

            <div className="modal-actions" style={{ marginTop: 0 }}>
              <button className="btn btn-outline" onClick={onClose}>Cancel</button>
              <button className="btn btn-gold" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : isEdit ? "Update Job" : "Post Job"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

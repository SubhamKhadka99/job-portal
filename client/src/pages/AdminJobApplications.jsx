import { useState, useEffect } from "react";
import { jobsApi, applicationsApi } from "../api/client";
import { toast } from "../hooks/useToast";
import { fmtDate } from "../utils/formatters";
import StatusBadge from "../components/StatusBadge";
import Spinner from "../components/Spinner";
import { ArrowLeftIcon, EyeIcon, ChevronDownIcon } from "../components/icons";

const STATUSES = ["applied", "reviewing", "shortlisted", "rejected", "hired"];

export default function AdminJobApplications({ job, onBack }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // appId being updated

  useEffect(() => {
    jobsApi.getApplications(job._id).then((res) => {
      if (res.success) setData(res);
      else toast(res.message || "Failed to load applications", "error");
      setLoading(false);
    });
  }, [job._id]);

  async function handleStatusChange(appId, status) {
    setUpdating(appId);
    const res = await applicationsApi.updateStatus(appId, status);
    setUpdating(null);
    if (res.success) {
      setData((d) => ({
        ...d,
        applications: d.applications.map((a) =>
          a._id === appId ? { ...a, status } : a
        ),
      }));
      toast("Status updated", "success");
    } else {
      toast(res.message || "Update failed", "error");
    }
  }

  if (loading) return <Spinner />;

  const apps = data?.applications || [];

  return (
    <div className="dashboard">
      {/* Back button */}
      <button className="btn btn-ghost btn-sm back-btn" onClick={onBack}>
        <ArrowLeftIcon size={14} /> Back to jobs
      </button>

      <div className="dashboard-header">
        <div className="dashboard-title">{job.title}</div>
        <div className="dashboard-sub">
          {apps.length} applicant{apps.length !== 1 ? "s" : ""} · {job.company} · {job.location}
        </div>
      </div>

      {apps.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No applications yet</h3>
          <p>Share your job posting to start receiving candidates.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Contact</th>
                <th>Cover Letter</th>
                <th>Applied</th>
                <th>Status</th>
                <th>CV</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app) => (
                <tr key={app._id}>
                  <td>
                    <div className="td-name">{app.fullName}</div>
                  </td>
                  <td>
                    <div>{app.email}</div>
                    {app.phone && (
                      <div className="td-sub">{app.phone}</div>
                    )}
                  </td>
                  <td>
                    {app.coverLetter ? (
                      <div className="td-cover">{app.coverLetter}</div>
                    ) : (
                      <span className="td-empty">—</span>
                    )}
                  </td>
                  <td>{fmtDate(app.createdAt)}</td>
                  <td>
                    <StatusBadge status={app.status} />
                  </td>
                  <td>
                    {app.cvUrl ? (
                      <a
                        href={app.cvUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-ghost btn-sm"
                      >
                        <EyeIcon size={13} /> View
                      </a>
                    ) : (
                      <span className="td-empty">—</span>
                    )}
                  </td>
                  <td>
                    <div className="select-wrap" style={{ minWidth: 140 }}>
                      <select
                        className="form-select select-sm"
                        value={app.status}
                        disabled={updating === app._id}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <span className="select-arrow">
                        <ChevronDownIcon size={12} />
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { jobsApi } from "../api/client";
import { toast } from "../hooks/useToast";
import { fmtDate, expLabels } from "../utils/formatters";
import JobFormModal from "../components/JobFormModal";
import AdminJobApplications from "./AdminJobApplications";
import Spinner from "../components/Spinner";
import { PlusIcon, EyeIcon, EditIcon, TrashIcon } from "../components/icons";

export default function AdminDashboard() {
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editJob, setEditJob]   = useState(null);   // job being edited
  const [viewJob, setViewJob]   = useState(null);   // job whose apps we're viewing

  const loadJobs = useCallback(() => {
    setLoading(true);
    jobsApi.getMine().then((res) => {
      if (res.success) setJobs(res.jobs);
      setLoading(false);
    });
  }, []);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  function openCreate() { setEditJob(null); setShowForm(true); }
  function openEdit(job) { setEditJob(job); setShowForm(true); }

  async function handleDelete(job) {
    if (!window.confirm(`Delete "${job.title}"? All applications will be removed.`)) return;
    const res = await jobsApi.remove(job._id);
    if (res.success) {
      toast("Job deleted", "success");
      loadJobs();
    } else {
      toast(res.message || "Delete failed", "error");
    }
  }

  // Sub-page: applications for a specific job
  if (viewJob)
    return <AdminJobApplications job={viewJob} onBack={() => setViewJob(null)} />;

  const open   = jobs.filter((j) => j.status === "open").length;
  const closed = jobs.length - open;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <div className="dashboard-title">Employer Dashboard</div>
          <div className="dashboard-sub">Manage your job postings and review applicants</div>
        </div>
        <button className="btn btn-gold" onClick={openCreate}>
          <PlusIcon size={15} /> Post Job
        </button>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Total Postings</div>
          <div className="stat-value">{jobs.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Open</div>
          <div className="stat-value" style={{ color: "var(--sage)" }}>{open}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Closed</div>
          <div className="stat-value" style={{ color: "var(--muted)" }}>{closed}</div>
        </div>
      </div>

      {/* Jobs table */}
      <div className="section-header">
        <div className="section-title">Your Postings</div>
      </div>

      {loading ? (
        <Spinner />
      ) : jobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No jobs posted yet</h3>
          <p>Create your first job posting to start receiving applications.</p>
          <button className="btn btn-gold" style={{ marginTop: "1rem" }} onClick={openCreate}>
            <PlusIcon size={14} /> Post First Job
          </button>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Position</th>
                <th>Type</th>
                <th>Level</th>
                <th>Posted</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job._id}>
                  <td>
                    <div className="td-name">{job.title}</div>
                    <div className="td-sub">{job.company} · {job.location}</div>
                  </td>
                  <td>
                    <span className={`job-type-tag ${job.type}`}>{job.type}</span>
                  </td>
                  <td>{expLabels[job.experienceLevel]}</td>
                  <td>{fmtDate(job.createdAt)}</td>
                  <td>{job.applicationDeadline ? fmtDate(job.applicationDeadline) : <span className="td-empty">—</span>}</td>
                  <td>
                    <span className={`status-dot ${job.status}`}>{job.status}</span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn btn-ghost btn-sm"
                        title="View Applications"
                        onClick={() => setViewJob(job)}
                      >
                        <EyeIcon size={14} />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        title="Edit"
                        onClick={() => openEdit(job)}
                      >
                        <EditIcon size={14} />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm danger-btn"
                        title="Delete"
                        onClick={() => handleDelete(job)}
                      >
                        <TrashIcon size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit modal */}
      {showForm && (
        <JobFormModal
          job={editJob}
          onClose={() => setShowForm(false)}
          onSave={() => { setShowForm(false); loadJobs(); }}
        />
      )}
    </div>
  );
}

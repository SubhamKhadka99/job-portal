import { useState, useEffect } from "react";
import { applicationsApi } from "../api/client";
import StatusBadge from "../components/StatusBadge";
import Spinner from "../components/Spinner";
import { fmtDate } from "../utils/formatters";

export default function MyApplications() {
  const [apps, setApps]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applicationsApi.getMine().then((res) => {
      if (res.success) setApps(res.applications);
      setLoading(false);
    });
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="applications-page">
      <div className="page-heading">My Applications</div>
      <div className="page-subheading">Track the status of all your job applications.</div>

      {apps.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <h3>No applications yet</h3>
          <p>Start applying to jobs and track your progress here.</p>
        </div>
      ) : (
        apps.map((app) => (
          <div className="app-card" key={app._id}>
            <div className="job-company-logo" style={{ flexShrink: 0 }}>
              {(app.job?.company || "?")[0].toUpperCase()}
            </div>
            <div className="app-card-body">
              <div className="app-card-job">{app.job?.title}</div>
              <div className="app-card-company">
                {app.job?.company} · {app.job?.location}
              </div>
              <div className="app-card-meta">
                <StatusBadge status={app.status} />
                {app.job?.type && (
                  <span className={`job-type-tag ${app.job.type}`}>{app.job.type}</span>
                )}
                <span className="app-card-date">Applied {fmtDate(app.createdAt)}</span>
              </div>
              {app.adminNote && (
                <div className="admin-note">
                  <strong>Recruiter note:</strong> {app.adminNote}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

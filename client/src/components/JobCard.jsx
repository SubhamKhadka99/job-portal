import { fmtSalary, fmtDate, expLabels } from "../utils/formatters";
import { MapPinIcon, ClockIcon } from "./icons";

export default function JobCard({ job, onClick }) {
  const salary = fmtSalary(job.salaryMin, job.salaryMax);

  return (
    <div className="job-card" onClick={onClick}>
      <div className="job-card-top">
        <div className="job-company-logo">
          {(job.company || "?")[0].toUpperCase()}
        </div>
        <span className={`job-status-badge ${job.status}`}>{job.status}</span>
      </div>

      <div>
        <div className="job-title">{job.title}</div>
        <div className="job-company">{job.company}</div>
      </div>

      <div className="job-meta">
        <span className="job-meta-item">
          <MapPinIcon size={13} /> {job.location}
        </span>
        <span className="job-meta-item">
          <ClockIcon size={13} /> {expLabels[job.experienceLevel] || job.experienceLevel}
        </span>
        <span className={`job-type-tag ${job.type}`}>{job.type}</span>
      </div>

      <div className="job-card-footer">
        <div>
          {salary && <div className="job-salary">{salary}</div>}
          {job.applicationDeadline && (
            <div className="job-deadline">Closes {fmtDate(job.applicationDeadline)}</div>
          )}
        </div>
        <button
          className="job-view-btn"
          onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
          View
        </button>
      </div>
    </div>
  );
}

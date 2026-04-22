import { fmtSalary, fmtDate, expLabels } from "../utils/formatters";
import { XIcon, CheckIcon } from "./icons";

export default function JobModal({ job, onClose, onApply, hasApplied, isLoggedIn }) {
  const salary = fmtSalary(job.salaryMin, job.salaryMax);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <div className="modal-title">{job.title}</div>
            <div className="modal-subtitle">{job.company} · {job.location}</div>
          </div>
          <button className="modal-close" onClick={onClose}><XIcon size={15} /></button>
        </div>

        <div className="modal-body">
          <div className="modal-section">
            <div className="modal-meta-grid">
              <div className="modal-meta-item">
                <div className="modal-meta-label">Type</div>
                <div className="modal-meta-value">{job.type}</div>
              </div>
              <div className="modal-meta-item">
                <div className="modal-meta-label">Experience</div>
                <div className="modal-meta-value">{expLabels[job.experienceLevel]}</div>
              </div>
              {salary && (
                <div className="modal-meta-item">
                  <div className="modal-meta-label">Salary</div>
                  <div className="modal-meta-value" style={{ textTransform: "none" }}>{salary}</div>
                </div>
              )}
              {job.applicationDeadline && (
                <div className="modal-meta-item">
                  <div className="modal-meta-label">Deadline</div>
                  <div className="modal-meta-value" style={{ textTransform: "none" }}>
                    {fmtDate(job.applicationDeadline)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {job.description && (
            <div className="modal-section">
              <h4>About the role</h4>
              <p className="modal-desc">{job.description}</p>
            </div>
          )}

          {job.requirements?.length > 0 && (
            <div className="modal-section">
              <h4>Requirements</h4>
              <ul className="modal-reqs">
                {job.requirements.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}

          <div className="modal-actions">
            {!isLoggedIn ? (
              <button className="btn btn-gold btn-full" onClick={onApply}>
                Sign in to Apply
              </button>
            ) : hasApplied ? (
              <button className="btn btn-outline btn-full" disabled>
                <CheckIcon size={14} /> Already Applied
              </button>
            ) : (
              <button className="btn btn-gold btn-full" onClick={onApply}>
                Apply Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

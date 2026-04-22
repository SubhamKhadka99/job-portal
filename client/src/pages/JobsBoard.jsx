import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { jobsApi, applicationsApi } from "../api/client";
import JobCard from "../components/JobCard";
import JobModal from "../components/JobModal";
import ApplyModal from "../components/ApplyModal";
import Spinner from "../components/Spinner";
import { SearchIcon, BriefcaseIcon, XIcon } from "../components/icons";
import { expLabels } from "../utils/formatters";

const JOB_TYPES = ["full-time", "part-time", "remote", "contract", "internship"];

export default function JobsBoard({ onAuthRequired }) {
  const { user } = useAuth();
  const [jobs, setJobs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [query, setQuery]       = useState("");          // committed search
  const [draft, setDraft]       = useState("");          // typing buffer
  const [typeFilter, setType]   = useState("");
  const [expFilter, setExp]     = useState("");
  const [selected, setSelected] = useState(null);        // job detail modal
  const [applyJob, setApplyJob] = useState(null);        // apply modal
  const [appliedIds, setApplied] = useState(new Set());

  // Fetch jobs when committed query changes
  useEffect(() => {
    setLoading(true);
    jobsApi.getAll(query).then((res) => {
      if (res.success) setJobs(res.jobs);
      setLoading(false);
    });
  }, [query]);

  // Pre-load applied IDs so we can show "Already Applied"
  useEffect(() => {
    if (!user) return;
    applicationsApi.getMine().then((res) => {
      if (res.success)
        setApplied(new Set(res.applications.map((a) => a.job?._id).filter(Boolean)));
    });
  }, [user]);

  const displayed = jobs
    .filter((j) => !typeFilter || j.type === typeFilter)
    .filter((j) => !expFilter  || j.experienceLevel === expFilter);

  function commitSearch() { setQuery(draft); }

  function clearAll() {
    setQuery(""); setDraft(""); setType(""); setExp("");
  }

  function handleApply(job) {
    if (!user) { onAuthRequired(); return; }
    setSelected(null);
    setApplyJob(job);
  }

  const hasFilters = query || typeFilter || expFilter;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="hero">
        <div className="hero-eyebrow">
          <BriefcaseIcon size={13} /> Open Positions
        </div>
        <h1 className="hero-title">
          Find your next <em>great</em> opportunity
        </h1>
        <p className="hero-sub">
          Browse curated job openings from companies that value talent and craft.
        </p>
        <div className="hero-search">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && commitSearch()}
            placeholder="Search by title, company, or skill…"
          />
          <button onClick={commitSearch}>
            <SearchIcon size={15} /> Search
          </button>
        </div>
      </div>

      {/* ── Filters ───────────────────────────────────────────── */}
      <div className="filters-bar">
        <span className="filters-label">Filter</span>

        {JOB_TYPES.map((t) => (
          <span
            key={t}
            className={`filter-chip ${typeFilter === t ? "active" : ""}`}
            onClick={() => setType(typeFilter === t ? "" : t)}
          >
            {t}
          </span>
        ))}

        <div className="filter-divider" />

        {Object.entries(expLabels).map(([val, label]) => (
          <span
            key={val}
            className={`filter-chip ${expFilter === val ? "active" : ""}`}
            onClick={() => setExp(expFilter === val ? "" : val)}
          >
            {label}
          </span>
        ))}
      </div>

      {/* ── Jobs grid ─────────────────────────────────────────── */}
      <div className="jobs-section">
        <div className="jobs-header">
          <div className="jobs-count">
            <strong>{displayed.length}</strong>{" "}
            position{displayed.length !== 1 ? "s" : ""} found
          </div>
          {hasFilters && (
            <button className="btn btn-ghost btn-sm" onClick={clearAll}>
              <XIcon size={13} /> Clear all
            </button>
          )}
        </div>

        {loading ? (
          <Spinner />
        ) : displayed.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No jobs found</h3>
            <p>Try adjusting your search terms or removing a filter.</p>
          </div>
        ) : (
          <div className="jobs-grid">
            {displayed.map((job) => (
              <JobCard key={job._id} job={job} onClick={() => setSelected(job)} />
            ))}
          </div>
        )}
      </div>

      {/* ── Job detail modal ──────────────────────────────────── */}
      {selected && (
        <JobModal
          job={selected}
          onClose={() => setSelected(null)}
          onApply={() => handleApply(selected)}
          hasApplied={appliedIds.has(selected._id)}
          isLoggedIn={!!user}
        />
      )}

      {/* ── Apply modal ───────────────────────────────────────── */}
      {applyJob && (
        <ApplyModal
          job={applyJob}
          onClose={() => setApplyJob(null)}
          onSuccess={() => {
            setApplied((s) => new Set([...s, applyJob._id]));
            setApplyJob(null);
          }}
        />
      )}
    </>
  );
}

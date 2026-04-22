// FIX: was hardcoded to "http://localhost:5000/api" — now reads from env so
// both local dev and production deployments work without code changes.
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Core fetch wrapper.
 * Automatically attaches the JWT Bearer token from localStorage.
 * Pass isFormData=true to skip setting Content-Type (browser sets it with boundary).
 */
async function request(method, path, body, isFormData = false) {
  const token = localStorage.getItem("jb_token");

  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!isFormData) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  return res.json();
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login:      (email, password)             => request("POST", "/auth/login",  { email, password }),
  signup:     (name, email, password, role) => request("POST", "/auth/signup", { name, email, password, role }),
  verify:     (email, code)                 => request("POST", "/auth/verify", { email, code }),
  resendCode: (email)                       => request("POST", "/auth/resend", { email }),
};

// ─── Jobs ─────────────────────────────────────────────────────────────────────
export const jobsApi = {
  /** Public: get all open jobs, optionally with full-text search */
  getAll:          (q)          => request("GET",    `/jobs${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  /** Admin: get jobs posted by current user */
  getMine:         ()           => request("GET",    "/jobs/admin/mine"),
  /** Admin: get applications for a specific job */
  getApplications: (jobId)      => request("GET",    `/jobs/admin/${jobId}/applications`),
  /** Admin: create a new job posting */
  create:          (data)       => request("POST",   "/jobs", data),
  /** Admin: update a job posting */
  update:          (jobId, data) => request("PUT",    `/jobs/${jobId}`, data),
  /** Admin: delete a job posting */
  remove:          (jobId)      => request("DELETE", `/jobs/${jobId}`),
};

// ─── Applications ─────────────────────────────────────────────────────────────
export const applicationsApi = {
  /** User: apply for a job — body is a FormData object with cv file */
  apply:        (jobId, formData)            => request("POST",  `/applications/${jobId}`, formData, true),
  /** User: get current user's own applications */
  getMine:      ()                           => request("GET",   "/applications/mine"),
  /** Admin: update the status (and optionally adminNote) on an application */
  updateStatus: (appId, status, adminNote)   =>
    request("PATCH", `/applications/${appId}/status`, { status, adminNote }),
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersApi = {
  /** Get the current user's full profile */
  getMe:         ()     => request("GET", "/users/me"),
  /** Update the current user's profile fields */
  updateProfile: (data) => request("PUT", "/users/profile", data),
};

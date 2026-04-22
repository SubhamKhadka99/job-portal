/** Format a salary range into a readable string, e.g. "$60k – $90k" */
export function fmtSalary(min, max) {
  if (!min && !max) return null;
  const f = (n) => (n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`);
  if (min && max) return `${f(min)} – ${f(max)}`;
  if (min) return `From ${f(min)}`;
  return `Up to ${f(max)}`;
}

/** Format an ISO date string into "Jan 1, 2025" */
export function fmtDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Extract initials from a full name, e.g. "Jane Smith" → "JS" */
export function initials(name) {
  return (
    name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?"
  );
}

/** Human-readable labels for experience level enum values */
export const expLabels = {
  fresher: "Fresher",
  junior:  "Junior",
  mid:     "Mid-level",
  senior:  "Senior",
};

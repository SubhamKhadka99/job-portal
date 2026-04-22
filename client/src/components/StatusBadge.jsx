/**
 * Displays a colour-coded pill for application status.
 * Valid values: applied | reviewing | shortlisted | rejected | hired
 */
export default function StatusBadge({ status }) {
  return (
    <span className={`status-badge status-${status}`}>
      {status}
    </span>
  );
}

import { useAuth } from "../context/AuthContext";
import { initials } from "../utils/formatters";
import { BriefcaseIcon, LayersIcon, ListIcon, LogOutIcon } from "./icons";

export default function Navbar({ page, onNav }) {
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    onNav("jobs");
  }

  return (
    <nav className="nav">
      <div className="nav-brand" onClick={() => onNav("jobs")}>
        Hire<span>Craft</span>
      </div>

      <div className="nav-spacer" />

      <div className="nav-links">
        <button
          className={`nav-btn ${page === "jobs" ? "active" : ""}`}
          onClick={() => onNav("jobs")}
        >
          <BriefcaseIcon size={15} /> Browse Jobs
        </button>

        {user && (
          user.role === "admin" ? (
            <button
              className={`nav-btn ${page === "admin" ? "active" : ""}`}
              onClick={() => onNav("admin")}
            >
              <LayersIcon size={15} /> Dashboard
            </button>
          ) : (
            <button
              className={`nav-btn ${page === "applications" ? "active" : ""}`}
              onClick={() => onNav("applications")}
            >
              <ListIcon size={15} /> My Applications
            </button>
          )
        )}

        <div className="nav-divider" />

        {user ? (
          <>
            <button
              className={`nav-btn ${page === "profile" ? "active" : ""}`}
              onClick={() => onNav("profile")}
            >
              <div className="nav-avatar">{initials(user.name)}</div>
              <span className="nav-username">{user.name.split(" ")[0]}</span>
            </button>
            <button className="nav-btn nav-logout" onClick={handleLogout} title="Sign out">
              <LogOutIcon size={15} />
            </button>
          </>
        ) : (
          <button className="nav-btn nav-btn-primary" onClick={() => onNav("auth")}>
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}

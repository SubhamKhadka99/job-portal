import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useToastSystem } from "./hooks/useToast";
import Navbar from "./components/Navbar";
import ToastContainer from "./components/Toast";
import JobsBoard from "./pages/JobsBoard";
import AuthPage from "./pages/AuthPage";
import MyApplications from "./pages/MyApplications";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboard from "./pages/AdminDashboard";
import "./styles/global.css";

// ─── Inner app (has access to AuthContext) ────────────────────────────────────
function AppInner() {
  const { user } = useAuth();
  const { toasts } = useToastSystem();
  const [page, setPage] = useState("jobs");

  // Guard: redirect to jobs if user tries to access a role-restricted page
  function nav(target) {
    if (target === "applications" && user?.role === "admin") return setPage("admin");
    if (target === "admin" && user?.role !== "admin") return setPage("jobs");
    if ((target === "applications" || target === "profile") && !user) return setPage("auth");
    setPage(target);
  }

  function renderPage() {
    switch (page) {
      case "auth":
        return <AuthPage onSuccess={() => nav("jobs")} onBack={() => nav("jobs")} />;
      case "applications":
        return user?.role !== "admin" ? <MyApplications /> : null;
      case "profile":
        return user ? <ProfilePage /> : null;
      case "admin":
        return user?.role === "admin" ? <AdminDashboard /> : null;
      default:
        return <JobsBoard onAuthRequired={() => nav("auth")} />;
    }
  }

  // Auth page gets full-screen treatment (no nav)
  if (page === "auth") {
    return (
      <>
        <ToastContainer toasts={toasts} />
        <AuthPage onSuccess={() => nav("jobs")} onBack={() => nav("jobs")} />
      </>
    );
  }

  return (
    <div className="app">
      <ToastContainer toasts={toasts} />
      <Navbar page={page} onNav={nav} />
      <main className="main">{renderPage()}</main>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

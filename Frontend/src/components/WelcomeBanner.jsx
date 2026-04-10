import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Sparkles, X } from "lucide-react";

function WelcomeBanner() {
  const [visible, setVisible] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const seen = localStorage.getItem("hasSeenWelcome");
    if (!seen) setVisible(true);
  }, []);

  const handleClose = () => {
    setVisible(false);
    localStorage.setItem("hasSeenWelcome", "true");
  };

  if (!visible) return null;

  return (
    <div className="welcome-banner">
      <div className="welcome-banner-bg" />
      <div className="welcome-banner-content">
        <div className="welcome-banner-text">
          <div className="welcome-banner-title">
            <Sparkles size={18} strokeWidth={2.2} />
            <h3>Welcome to Ciccado!</h3>
          </div>
          <p className="welcome-banner-subtitle">
            Hi {user?.name || user?.role || "there"}! Get started by exploring the
            dashboard, managing bugs, or reviewing project reports.
          </p>
          <div className="welcome-banner-actions">
            <button className="btn btn-white" onClick={handleClose}>
              Get Started
            </button>
            <button className="btn btn-ghost" onClick={handleClose}>
              Dismiss
            </button>
          </div>
        </div>
        <button
          className="welcome-banner-close"
          onClick={handleClose}
          aria-label="Close welcome banner"
        >
          <X size={18} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}

export default WelcomeBanner;

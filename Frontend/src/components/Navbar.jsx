import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Search, Lock, LogOut } from "lucide-react";

function Navbar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/bugs?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <header className="topbar">
      {/* Search */}
      <form className="topbar-search" onSubmit={handleSearch}>
        <Search size={16} strokeWidth={2} className="topbar-search-icon" />
        <input
          type="text"
          placeholder="Search bugs, projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="topbar-search-input"
        />
      </form>

      {/* Profile */}
      <div className="topbar-actions">
        <div className="topbar-profile" ref={dropdownRef}>
          <button
            className="topbar-avatar"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-label="Profile menu"
          >
            <span className="topbar-avatar-initials">{initials}</span>
          </button>

          {dropdownOpen && (
            <div className="topbar-dropdown">
              <div className="topbar-dropdown-header">
                <p className="topbar-dropdown-name">{user?.name || "User"}</p>
                <p className="topbar-dropdown-role">{user?.role || "Member"}</p>
              </div>
              <hr className="topbar-dropdown-divider" />
              <button
                className="topbar-dropdown-item"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate("/change-password");
                }}
              >
                <Lock size={15} strokeWidth={1.8} />
                Change Password
              </button>
              <button
                className="topbar-dropdown-item topbar-dropdown-item--danger"
                onClick={handleLogout}
              >
                <LogOut size={15} strokeWidth={1.8} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;

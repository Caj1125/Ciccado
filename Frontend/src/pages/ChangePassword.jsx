import { useState } from "react";
import { changePasswordRequest } from "../api/api";

function ChangePassword() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (form.newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }
    if (form.currentPassword === form.newPassword) {
      setError("New password must be different from current password");
      return;
    }

    setLoading(true);
    try {
      const data = await changePasswordRequest(form);
      setMessage(data.message || "Password changed successfully");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="page-header">
        <h1>Change Password</h1>
      </div>

      <form className="card form-card narrow" onSubmit={onSubmit}>
        <div className="form-group">
          <label>Current Password</label>
          <input
            type="password"
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            minLength={8}
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            minLength={8}
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            required
          />
        </div>

        {error && <p className="error-text">{error}</p>}
        {message && <p className="success-text">{message}</p>}

        <button className="btn btn-primary" disabled={loading}>
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </section>
  );
}

export default ChangePassword;

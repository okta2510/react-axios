import React, { useState } from "react";
import { User, LogIn, LogOut, UserPlus, Shield } from "lucide-react";

export default function AuthBar({
  currentUser,
  users,
  onLogin,
  onRegister,
  onLogout,
  onSelectUser,
}) {
  const [showModal, setShowModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("customer");
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setIsLoading(true);

    try {
      if (isRegistering) {
        await onRegister({ name, email, password, role });
        setIsRegistering(false);
      } else {
        await onLogin({ email, password });
        setShowModal(false);
      }
    } catch (err) {
      setAuthError(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-bar card" style={{ padding: "0.75rem 1.25rem", marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
        {currentUser ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "var(--primary-light)",
                color: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
              }}
            >
              {currentUser.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <strong>{currentUser.name}</strong>
                <span className="badge badge-primary" style={{ fontSize: "0.65rem" }}>
                  {currentUser.role || "customer"}
                </span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {currentUser.email} &bull; ID: #{currentUser.id}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)" }}>
            <User size={18} />
            <span>Not logged in (Browsing as Guest)</span>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {/* Quick User Switcher dropdown for instant demo testing */}
          {users.length > 0 && (
            <select
              className="quick-user-select"
              value={currentUser?.id || ""}
              onChange={(e) => onSelectUser(e.target.value)}
              style={{
                padding: "0.4rem 0.6rem",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                fontSize: "0.85rem",
                background: "white",
              }}
            >
              <option value="" disabled>-- Switch User (Demo) --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          )}

          {currentUser ? (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onLogout}
              title="Logout"
            >
              <LogOut size={14} /> Logout
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                setShowModal(true);
                setAuthError("");
              }}
            >
              <LogIn size={14} /> Login / Register
            </button>
          )}
        </div>
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <div className="form-header">
              <h3>{isRegistering ? "Create New User Account" : "Login to Dumet Store"}</h3>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
            </div>

            {authError && (
              <div className="alert-banner alert-error" style={{ marginBottom: "1rem" }}>
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {isRegistering && (
                <>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.6rem",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. admin@dumetschool.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-actions" style={{ marginTop: "1.25rem", justifyContent: "space-between" }}>
                <button
                  type="button"
                  style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontSize: "0.85rem" }}
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setAuthError("");
                  }}
                >
                  {isRegistering ? "Already have an account? Login" : "Don't have an account? Register"}
                </button>

                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? "Processing..." : isRegistering ? "Register User" : "Login"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


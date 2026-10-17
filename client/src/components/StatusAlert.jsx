import React from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

export default function StatusAlert({ type = "error", message, onClose }) {
  if (!message) return null;

  const isError = type === "error";

  return (
    <div className={`alert-banner ${isError ? "alert-error" : "alert-success"}`}>
      <div className="alert-content">
        {isError ? (
          <AlertCircle className="alert-icon" size={20} />
        ) : (
          <CheckCircle2 className="alert-icon" size={20} />
        )}
        <span>{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} className="alert-close" aria-label="Dismiss alert">
          <X size={16} />
        </button>
      )}
    </div>
  );
}


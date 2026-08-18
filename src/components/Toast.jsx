import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import "./Toast.css";

const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  return (
    <div className={`toast-banner ${type}`}>
      <div className="toast-content">
        {type === "success" ? (
          <CheckCircle2 size={16} className="toast-icon success-icon" />
        ) : (
          <AlertCircle size={16} className="toast-icon warning-icon" />
        )}
        <span className="toast-message">{message}</span>
      </div>
      <button className="toast-close" onClick={onClose} aria-label="Close notification">
        <X size={14} />
      </button>
    </div>
  );
};

export default Toast;

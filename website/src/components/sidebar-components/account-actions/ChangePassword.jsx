import React, { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { FaKey, FaCheckCircle, FaExclamationTriangle, FaShieldAlt } from "react-icons/fa";
import { API_URL } from "@/utils/constants";

const PasswordChangeForm = () => {
  const authSecretKey = localStorage.getItem('auth_secret_key');
  const userId = localStorage.getItem('account_id');

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [toast, setToast] = useState({ message: "", type: "", visible: false });
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const showToast = (message, type) => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3500);
  };

  const changePassword = async () => {
    if (!authSecretKey) {
      showToast("Authentication failed. Please log in.", "error");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'AuthToken': authSecretKey,
          'Route': 'route-change-password'
        },
        body: JSON.stringify({
          "USER_ID": userId,
          "OLD_PASSWORD": formData.oldPassword,
          "NEW_PASSWORD": formData.newPassword
        })
      });

      const result = await response.json();

      if (result.status_code === "success") {
        showToast("Password changed successfully!", "success");
        setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else if (result.status_code === "authorization_error") {
        showToast("Please login again.", "error");
      } else if (result.status_code === "password_error" || result.status_code === "old_password_not_match") {
        showToast("Incorrect old password. Please try again.", "error");
      } else {
        showToast("Failed to change password. Please try again.", "error");
      }
    } catch (error) {
      showToast("Network error. Please check your connection.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
      showToast("Please fill in all fields.", "error");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      showToast("New passwords do not match.", "error");
      return;
    }
    if (formData.newPassword.length < 6) {
      showToast("New password must be at least 6 characters.", "error");
      return;
    }
    changePassword();
  };

  const fields = [
    { label: "Current Password", name: "oldPassword", placeholder: "Enter your current password" },
    { label: "New Password", name: "newPassword", placeholder: "Enter your new password" },
    { label: "Confirm New Password", name: "confirmPassword", placeholder: "Re-enter your new password" },
  ];

  return (
    <div className="finance-v2" style={{ maxWidth: 540, margin: '0 auto' }}>

      {/* Toast */}
      {toast.visible && (
        <div className="wallet-toast" style={{
          background: toast.type === 'success' ? '#059669' : '#e11d48',
        }}>
          {toast.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Hero */}
      <div className="finance-v2-top" style={{ display: 'block', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{
            width: 42, height: 42, display: 'grid', placeItems: 'center',
            borderRadius: 10, background: 'linear-gradient(135deg, #0e2040 0%, #1646d7 58%, #22c6e8 100%)',
            color: '#fff', fontSize: 16, flexShrink: 0,
          }}>
            <FaShieldAlt />
          </div>
          <div>
            <h1 style={{ margin: 0, color: '#0f172a', fontSize: 22, fontWeight: 900, lineHeight: 1 }}>
              Change Password
            </h1>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 12, fontWeight: 700 }}>
              Update your account security credentials below.
            </p>
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="finance-v2-panel">
        <div className="finance-v2-panel-head">
          <span><FaKey /></span>
          <div>
            <h2>Account Security</h2>
            <p>All fields are required</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="finance-v2-form-grid" style={{ marginTop: 8 }}>
            {fields.map(({ label, name, placeholder }) => (
              <label key={name}>
                <span>{label}</span>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={13}
                    style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}
                  />
                  <input
                    type={showPassword[name] ? "text" : "password"}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="finance-v2-text-input"
                    style={{ paddingLeft: 34, paddingRight: 38, width: '100%', boxSizing: 'border-box' }}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility(name)}
                    style={{
                      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      border: 0, background: 'transparent', color: '#64748b', cursor: 'pointer',
                      display: 'grid', placeItems: 'center', padding: 4,
                    }}
                  >
                    {showPassword[name] ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </label>
            ))}
          </div>

          {/* Note */}
          <div className="finance-v2-note" style={{ marginTop: 14 }}>
            <FaShieldAlt style={{ color: '#1646d7', flexShrink: 0, marginTop: 1 }} />
            <span>Use at least 6 characters. Avoid using easy-to-guess passwords like your name or birthdate.</span>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              type="button"
              className="finance-v2-secondary"
              style={{ flex: 1 }}
              onClick={() => setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" })}
            >
              Clear
            </button>
            <button
              type="submit"
              className="finance-v2-primary"
              style={{ flex: 2, marginTop: 0 }}
              disabled={loading}
            >
              {loading ? "Saving…" : "Save New Password"}
            </button>
          </div>
        </form>
      </div>

      {/* Footnote */}
      <div className="wallet-statement-footnote" style={{ marginTop: 14 }}>
        <FaShieldAlt style={{ color: '#1646d7' }} />
        <span>Your password is encrypted and securely stored. You will remain logged in after changing it.</span>
      </div>
    </div>
  );
};

export default PasswordChangeForm;

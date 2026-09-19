import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import generateRandomToken from "@/utils/randomTokenGenerator";
import { Toast } from "flowbite-react";
import { HiCheck, HiX } from "react-icons/hi";
import { API_URL } from "@/utils/constants";
import { FONTS } from "../../constants/theme";

const Register = ({ onSwitchToLogin, onClose }) => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get("ref") || params.get("invite") || localStorage.getItem("referral_code") || "";
    } catch (e) {
      return "";
    }
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successView, setSuccessView] = useState(false);
  const [toast, setToast] = useState(null);

  const handleCloseModal = () => {
    if (typeof window !== 'undefined') {
      if (window.location.search || window.location.pathname === '/register') {
        try {
          navigate('/', { replace: true });
        } catch (e) {
          window.history.replaceState({}, '', '/');
        }
      }
    }
    if (onClose) {
      onClose();
    }
  };


  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const isValidPhoneNumber = (number) => /^\d{10}$/.test(number);

  const handleOtpChange = (e) => {
    const value = e.target.value;
    if (value.length <= 6 && /^\d*$/.test(value)) {
      setOtp(value);
      setOtpError("");
    }
  };

  const validatePasswords = (pass, confirmPass) => {
    if (!pass || !confirmPass) return "";
    return pass !== confirmPass ? "Passwords do not match" : "";
  };

  const handleGetOtp = async () => {
    if (!isValidPhoneNumber(phoneNumber)) {
      setOtpError("Please enter a valid 10-digit phone number");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(API_URL + "?Route=route-send-sms", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Route: "route-send-sms",
          AuthToken: generateRandomToken(32),
        },
        body: JSON.stringify({ SMS_MOBILE: phoneNumber }),
      });

      const data = await response.json();
      console.log("[Register] OTP Response:", data);

      if (data.status_code === "otp_error") {
        setOtpError("We failed to send OTP! Please try again!");
        showToast("error", "Failed to send OTP. Please try again!");
      } else if (data.status_code === "otp_limit_error") {
        setOtpError("You have reached the limit of OTP requests! Please try again later!");
        showToast("error", "OTP request limit reached. Please try later!");
      } else if (data.status_code === "sms_token_missing") {
        setOtpError("SMS gateway token is missing in backend settings.");
        showToast("error", "SMS token missing in backend settings.");
      } else if (data.status_code === "otp_service_disabled") {
        setOtpError("OTP service is disabled in backend settings.");
        showToast("error", "OTP service is disabled.");
      } else if (data.status_code === "sms_gateway_error") {
        setOtpError("SMS gateway request failed. Please try again.");
        showToast("error", "SMS gateway request failed.");
      } else if (data.status_code === "sms_gateway_invalid_response" || data.status_code === "sms_send_failed") {
        setOtpError("SMS provider did not accept the OTP request.");
        showToast("error", "SMS provider did not accept the OTP request.");
      } else if (data.status_code === "success") {
        setOtpSent(true);
        setOtpError("");
        showToast("success", "OTP sent successfully!");
      } else {
        setOtpError("Unable to send OTP right now.");
        showToast("error", "Unable to send OTP right now.");
      }
    } catch (error) {
      setOtpError("Something went wrong! Please try again.");
      showToast("error", "Something went wrong. Please try again!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const fetchUrl = `${API_URL}?Route=route-create-account&AuthToken=${encodeURIComponent(generateRandomToken(32))}&_t=${Date.now()}`;
      console.log("[Register] Attempting registration...", { url: fetchUrl });

      const response = await fetch(fetchUrl, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Route: "route-create-account",
          AuthToken: generateRandomToken(32),
        },
        body: JSON.stringify({
          SIGNUP_MOBILE: phoneNumber,
          SIGNUP_USERNAME: username,
          SIGNUP_PASSWORD: password,
          SIGNUP_OTP: otp,
          SIGNUP_INVITE_CODE: referralCode || "",
        }),
      });

      const data = await response.json();
      console.log("[Register] API Response:", data);

      if (data.status_code === "success") {
        localStorage.setItem("auth_secret_key", data.data[0].auth_secret_key);
        localStorage.setItem("account_id", data.data[0].account_id);
        window.dispatchEvent(new Event("site-data-refresh"));

        setSuccessView(true);
        setTimeout(() => {
          handleCloseModal();
        }, 2500);
      } else if (data.status_code === "already_registered") {
        showToast("error", "Already registered! Please login.");
      } else if (data.status_code === "username_exists") {
        showToast("error", "Username already exists! Please choose another.");
      } else {
        showToast("error", data.message || "Registration failed! Please try again.");
      }
    } catch (error) {
      console.error("[Register] Request Error:", error);
      showToast("error", "Something went wrong! Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="auth-modal-shell">
        <div className="auth-modal-card animate-modal-in">
          <button onClick={handleCloseModal} className="auth-close-btn" aria-label="Close sign up">
            <FontAwesomeIcon icon={faTimes} className="w-3.5 h-3.5" />
          </button>

          <aside className="auth-brand-panel">
            <div>
              <div className="auth-brand-mark">R</div>
              <h3 className="auth-brand-title">Start with a cleaner setup</h3>
              <p className="auth-brand-copy">
                Register once, verify your mobile, and keep your bonus, wallet, and game access in one account.
              </p>
            </div>
            <div className="auth-benefits">
              <div className="auth-benefit">
                <span>Welcome</span>
                <span>Bonus</span>
              </div>
              <div className="auth-benefit">
                <span>Verification</span>
                <span>OTP</span>
              </div>
              <div className="auth-benefit">
                <span>Support</span>
                <span>24/7</span>
              </div>
            </div>
          </aside>

          <div className="auth-content">
            <div className="auth-mobile-banner">
              <div className="auth-mobile-kicker">New Player Bonus</div>
              <div className="auth-mobile-title">Join in a minute and unlock welcome rewards.</div>
              <div className="auth-mobile-chips">
                <span>Bonus</span>
                <span>OTP</span>
                <span>Support</span>
              </div>
            </div>
            {successView ? (
              <div className="auth-success animate-fade-in">
                <div className="auth-success-orb">
                  <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="auth-title">
                  Account <span>Ready</span>
                </h2>
                <p className="auth-subtitle">Your account is ready. Time to start winning.</p>
                <button onClick={handleCloseModal} className="auth-submit-btn">
                  Continue
                </button>
              </div>
            ) : (
              <>
              <div className="mb-6">
                <div className="auth-kicker">New Player Bonus</div>
                <h2 className="auth-title" style={{ fontFamily: FONTS.display }}>
                  Create <span>Account</span>
                </h2>
                <p className="auth-subtitle" style={{ fontFamily: FONTS.ui }}>
                  Join the lobby and unlock your welcome rewards.
                </p>
              </div>

              <div
                className="auth-form"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (!(isLoading || otp.length !== 6 || !password || !confirmPassword || passwordError || !username)) {
                      handleRegister(e);
                    }
                  }
                }}
              >
                <div className="auth-field-row">
                  <label className="auth-label">Mobile</label>
                  <div className="auth-input-line">
                    <div className="auth-input-wrap">
                      <span className="auth-prefix">+91</span>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => {
                          setPhoneNumber(e.target.value.replace(/\D/g, ""));
                          setOtpError("");
                        }}
                        className="auth-input auth-input-strong has-prefix"
                        placeholder="9999999999"
                        disabled={otpSent}
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleGetOtp}
                      disabled={isLoading || otpSent}
                      className="auth-secondary-btn"
                    >
                      {isLoading ? "..." : otpSent ? "Sent" : "Get OTP"}
                    </button>
                  </div>
                </div>

                {otpError && <div className="auth-error">{otpError}</div>}

                {otpSent && (
                  <div className="auth-form animate-fade-in">
                    <div className="auth-field-row">
                      <label className="auth-label">Username</label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="auth-input auth-input-strong"
                        placeholder="Create username"
                        required
                      />
                    </div>

                    <div className="auth-field-row">
                      <label className="auth-label">OTP Code</label>
                      <input
                        type="text"
                        value={otp}
                        onChange={handleOtpChange}
                        className="auth-input auth-input-strong text-center font-bold"
                        placeholder="000000"
                        maxLength={6}
                        required
                      />
                    </div>

                    <div className="auth-field-row">
                      <label className="auth-label">Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setPasswordError(validatePasswords(e.target.value, confirmPassword));
                        }}
                        className="auth-input auth-input-strong"
                        placeholder="Create password"
                        required
                      />
                    </div>

                    <div className="auth-field-row">
                      <label className="auth-label">Confirm</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setPasswordError(validatePasswords(password, e.target.value));
                        }}
                        className="auth-input auth-input-strong"
                        placeholder="Confirm password"
                        required
                      />
                    </div>

                    <div className="auth-field-row">
                      <label className="auth-label">Referral</label>
                      <input
                        type="text"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                        className="auth-input auth-input-strong"
                        placeholder="Bonus code optional"
                      />
                    </div>

                    {passwordError && <div className="auth-error">{passwordError}</div>}

                    <button
                      type="button"
                      onClick={handleRegister}
                      disabled={isLoading || otp.length !== 6 || !password || !confirmPassword || passwordError || !username}
                      className="auth-submit-btn"
                    >
                      {isLoading ? "Processing..." : "Register Now ->"}
                    </button>
                  </div>
                )}
              </div>

              <div className="auth-footer">
                Already registered?{" "}
                <button onClick={onSwitchToLogin} className="auth-link-btn">
                  Login Here
                </button>
              </div>
              </>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed top-4 right-4 sm:w-auto w-full flex sm:justify-end justify-center z-50">
          <Toast>
            <div
              className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                toast.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {toast.type === "success" ? <HiCheck className="h-5 w-5" /> : <HiX className="h-5 w-5" />}
            </div>
            <div className="ml-3 text-sm font-normal">{toast.message}</div>
            <Toast.Toggle onDismiss={() => setToast(null)} />
          </Toast>
        </div>
      )}
    </>
  );
};

export default Register;

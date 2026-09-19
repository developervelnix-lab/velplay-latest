import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import generateRandomToken from "@/utils/randomTokenGenerator";
import { Toast } from "flowbite-react";
import { HiCheck, HiX } from "react-icons/hi";
import { API_URL } from "@/utils/constants";
import { FONTS } from "../../constants/theme";

const Login = ({ onSwitchToRegister, onClose }) => {
  const [loginMethod, setLoginMethod] = useState("mobile");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successView, setSuccessView] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePhoneChange = (e) => {
    setPhoneNumber(e.target.value.replace(/\D/g, ""));
    setError("");
  };

  const handleOtpChange = (e) => {
    const value = e.target.value;
    if (value.length <= 6 && /^\d*$/.test(value)) {
      setOtp(value);
      setError("");
    }
  };

  const handleGetOtp = async () => {
    if (phoneNumber.length < 10) {
      setError("Please enter a valid phone number");
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
      console.log("[Login] OTP Response:", data);
      if (data.status_code === "otp_error") {
        setError("We failed to send OTP! Please try again!");
        showToast("error", "Failed to send OTP. Please try again!");
      } else if (data.status_code === "otp_limit_error") {
        setError("You have reached the limit of OTP requests! Please try again later!");
        showToast("error", "OTP request limit reached. Please try later!");
      } else if (data.status_code === "sms_token_missing") {
        setError("SMS gateway token is missing in backend settings.");
        showToast("error", "SMS token missing in backend settings.");
      } else if (data.status_code === "otp_service_disabled") {
        setError("OTP service is disabled in backend settings.");
        showToast("error", "OTP service is disabled.");
      } else if (data.status_code === "sms_gateway_error") {
        setError("SMS gateway request failed. Please try again.");
        showToast("error", "SMS gateway request failed.");
      } else if (data.status_code === "sms_gateway_invalid_response" || data.status_code === "sms_send_failed") {
        setError("SMS provider did not accept the OTP request.");
        showToast("error", "SMS provider did not accept the OTP request.");
      } else if (data.status_code === "success") {
        setOtpSent(true);
        setError("");
        showToast("success", "OTP sent successfully!");
      } else {
        setError("Unable to send OTP right now.");
        showToast("error", "Unable to send OTP right now.");
      }
    } catch (error) {
      setError("Something went wrong! Please try again.");
      showToast("error", "Something went wrong. Please try again!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    let loginData = {};

    if (loginMethod === "mobile") {
      if (!otpSent) {
        handleGetOtp();
        return;
      }

      if (otp.length !== 6) {
        setError("Please enter a valid 6-digit OTP");
        return;
      }

      loginData = {
        MOBILE: phoneNumber,
        USER_OTP: otp,
      };
    } else {
      if (!username) {
        setError("Please enter your username");
        return;
      }

      if (!password) {
        setError("Please enter your password");
        return;
      }

      loginData = {
        LOGIN_ID: username,
        LOGIN_PASSWORD: password,
      };
    }

    setIsLoading(true);
    try {
      const fetchUrl = `${API_URL}?Route=route-login&AuthToken=${encodeURIComponent(generateRandomToken(32))}&_t=${Date.now()}`;
      console.log("[Login] Attempting login...", { method: loginMethod, url: fetchUrl });

      const response = await fetch(fetchUrl, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Route: "route-login",
          AuthToken: generateRandomToken(32),
        },
        body: JSON.stringify(loginData),
      });

      const result = await response.json();
      console.log("[Login] API Response:", result);

      if (result.status_code === "success") {
        const accId = result.data[0].account_id;
        localStorage.setItem("auth_secret_key", result.data[0].auth_secret_key);
        localStorage.setItem("account_id", accId);
        localStorage.removeItem("cached_site_info");
        if (typeof sessionStorage !== "undefined") {
          const currentTabId = sessionStorage.getItem("tab_session_id");
          if (currentTabId) {
            localStorage.setItem("primary_active_tab_id", currentTabId);
            localStorage.setItem("primary_active_user_id", accId);
          }
        }
        try {
          const bc = new BroadcastChannel("velplay_tab_session_channel");
          bc.postMessage({
            type: "LOGIN_EVENT",
            primaryTabId: sessionStorage.getItem("tab_session_id"),
            accountId: accId
          });
          bc.close();
        } catch (e) {}
        window.dispatchEvent(new Event("site-data-refresh"));

        setSuccessView(true);
        setTimeout(() => {
          if (onClose) onClose();
        }, 2500);
      } else if (result.status_code === "password_error") {
        showToast("error", "Incorrect password. Please try again!");
      } else if (result.status_code === "user_not_exist") {
        showToast("error", "Mobile/Username not found! Please register first.");
      } else {
        showToast("error", result.message || "Login Failed. Please try again!");
      }
    } catch (error) {
      console.error("[Login] Request Error:", error);
      showToast("error", "Error during login. Please try again!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="auth-modal-shell">
        <div className="auth-modal-card animate-modal-in">
          <button onClick={onClose} className="auth-close-btn" aria-label="Close login">
            <FontAwesomeIcon icon={faTimes} className="w-3.5 h-3.5" />
          </button>

          <aside className="auth-brand-panel">
            <div>
              <div className="auth-brand-mark">R</div>
              <h3 className="auth-brand-title">Premium gaming access</h3>
              <p className="auth-brand-copy">
                Secure account login with fast OTP access, live wallet updates, and instant game launch.
              </p>
            </div>
            <div className="auth-benefits">
              <div className="auth-benefit">
                <span>Security</span>
                <span>OTP</span>
              </div>
              <div className="auth-benefit">
                <span>Wallet</span>
                <span>Live</span>
              </div>
              <div className="auth-benefit">
                <span>Access</span>
                <span>24/7</span>
              </div>
            </div>
          </aside>

          <div className="auth-content">
            <div className="auth-mobile-banner">
              <div className="auth-mobile-kicker">Premium Login</div>
              <div className="auth-mobile-title">Fast access, secure wallet, instant play.</div>
              <div className="auth-mobile-chips">
                <span>OTP</span>
                <span>Wallet</span>
                <span>24/7</span>
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
                  Login <span>Successful</span>
                </h2>
                <p className="auth-subtitle">Welcome back. Your game lobby is ready.</p>
                <button onClick={onClose} className="auth-submit-btn">
                  Continue
                </button>
              </div>
            ) : (
              <>
              <div className="mb-6">
                <div className="auth-kicker">Secure Access</div>
                <h2 className="auth-title" style={{ fontFamily: FONTS.display }}>
                  Welcome <span>Back</span>
                </h2>
                <p className="auth-subtitle" style={{ fontFamily: FONTS.ui }}>
                  Sign in to your account and start winning.
                </p>
              </div>

              <div className="auth-switcher">
                <button
                  type="button"
                  onClick={() => setLoginMethod("mobile")}
                  className={`auth-switcher-btn ${loginMethod === "mobile" ? "is-active" : ""}`}
                >
                  With OTP
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod("username")}
                  className={`auth-switcher-btn ${loginMethod === "username" ? "is-active" : ""}`}
                >
                  Password
                </button>
              </div>

              <div
                className="auth-form"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (!(isLoading || (loginMethod === "mobile" && otpSent && otp.length !== 6))) {
                      handleLogin(e);
                    }
                  }
                }}
              >
                {loginMethod === "mobile" ? (
                  <>
                    <div className="auth-field-row">
                      <label className="auth-label">Mobile</label>
                      <div className="auth-input-line">
                        <div className="auth-input-wrap">
                          <span className="auth-prefix">+91</span>
                          <input
                            type="tel"
                            value={phoneNumber}
                            onChange={handlePhoneChange}
                            className="auth-input has-prefix"
                            placeholder="9999999999"
                            disabled={otpSent}
                            required
                          />
                        </div>
                        {!otpSent && (
                          <button type="button" onClick={handleGetOtp} disabled={isLoading} className="auth-secondary-btn">
                            {isLoading ? "..." : "Get OTP"}
                          </button>
                        )}
                      </div>
                    </div>

                    {otpSent && (
                      <div className="auth-field-row animate-fade-in">
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
                    )}
                  </>
                ) : (
                  <>
                    <div className="auth-field-row">
                      <label className="auth-label">User</label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value);
                          setError("");
                        }}
                        className="auth-input auth-input-strong"
                        placeholder="Mobile or username"
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
                          setError("");
                        }}
                        className="auth-input auth-input-strong"
                        placeholder="Enter password"
                        required
                      />
                    </div>
                  </>
                )}

                {error && <div className="auth-error">{error}</div>}

                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={isLoading || (loginMethod === "mobile" && otpSent && otp.length !== 6)}
                  className="auth-submit-btn"
                >
                  {isLoading ? "Processing..." : "Login Now ->"}
                </button>
              </div>

              <div className="auth-footer">
                Don't have an account yet?{" "}
                <button onClick={onSwitchToRegister} className="auth-link-btn">
                  Create Account
                </button>
              </div>
              </>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed top-4 right-4 sm:right-4 sm:w-auto w-full flex justify-center z-50">
          <Toast className="flex items-center">
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

export default Login;

"use client"

import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faWallet,
  faIndianRupeeSign,
  faCopy,
  faCheck,
  faInfoCircle,
  faQrcode,
  faCreditCard,
  faDownload,
  faHistory,
  faSearch,
  faClock,
  faSync,
  faTimes,
  faExpand
} from "@fortawesome/free-solid-svg-icons"
import { useNavigate } from "react-router-dom"
import { FONTS } from "../../constants/theme"
import { apiGet } from "@/utils/apiFetch"
import { useSite } from "../../context/SiteContext"

function Deposit() {
  const [amount, setAmount] = useState("")
  const [paymentMethods, setPaymentMethods] = useState([])
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [utr, setUtr] = useState("")
  const [quickAmounts, setQuickAmounts] = useState(["500", "1000", "2000", "5000", "10000", "25000"])
  const [minDeposit, setMinDeposit] = useState(100)
  const [notification, setNotification] = useState({ isOpen: false, message: "", type: "" })
  const [depositRecords, setDepositRecords] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [loadingMethods, setLoadingMethods] = useState(true)
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const navigate = useNavigate()
  const userId = localStorage.getItem("account_id")
  const { accountInfo, logout } = useSite()

  const addToast = (message, type = "info") => {
    setNotification({ isOpen: true, message, type })
  }

  const handleQuickAmount = (value) => setAmount(value.toString())

  const fetchPaymentMethods = async () => {
    setLoadingMethods(true)
    try {
      const response = await apiGet("route-payment-methods")
      const result = await response.json()
      if (result.status_code === "success" && result.payment_methods && result.payment_methods.length > 0) {
        setPaymentMethods(result.payment_methods)
        setSelectedMethod(result.payment_methods[0])
        setMinDeposit(result.payment_methods[0].min_deposit || 100)
      } else {
        fetchFallbackAddress()
      }
    } catch (error) {
      console.error("Error fetching payment methods, using fallback:", error)
      fetchFallbackAddress()
    } finally {
      setLoadingMethods(false)
    }
  }

  const fetchFallbackAddress = async () => {
    try {
      const response = await apiGet("route-deposit-info")
      const result = await response.json()
      const fallbackList = []
      if (result.UPI?.UPI_ID_1) {
        fallbackList.push({
          id: 1,
          method_name: "UPI Pay",
          method_type: "upi",
          account_number_or_upi: result.UPI.UPI_ID_1,
          min_deposit: result.min_deposit || 100,
          instructions: "Scan QR or copy UPI ID to pay."
        })
      }
      if (result.BANK_DETAILS) {
        fallbackList.push({
          id: 2,
          method_name: "Bank Transfer",
          method_type: "bank_transfer",
          account_name: result.BANK_DETAILS.ACCOUNT_HOLDER || "velplay365",
          account_number_or_upi: result.BANK_DETAILS.ACCOUNT_NUMBER || "912020001234567",
          ifsc_or_bank_name: (result.BANK_DETAILS.BANK_NAME || "AXIS") + " (" + (result.BANK_DETAILS.IFSC_CODE || "") + ")",
          min_deposit: 500
        })
      }
      if (fallbackList.length > 0) {
        setPaymentMethods(fallbackList)
        setSelectedMethod(fallbackList[0])
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchPaymentMethods()
  }, [])

  useEffect(() => {
    if (selectedMethod && selectedMethod.min_deposit) {
      setMinDeposit(selectedMethod.min_deposit)
    }
  }, [selectedMethod])

  const fetchDepositRecords = async () => {
    if (!userId) return
    setLoadingHistory(true)
    try {
      const response = await apiGet("route-recharge-records", { PAGE_NUM: 1 })
      const result = await response.json()
      if (result.data && Array.isArray(result.data)) {
        setDepositRecords(result.data)
      } else {
        setDepositRecords([])
      }
    } catch (error) {
      console.error("Fetch deposit records error", error)
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    fetchDepositRecords()
  }, [userId])

  const copyToClipboard = (text, label) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    addToast(label + " copied", "success")
  }

  const getQrUrl = () => {
    if (!selectedMethod) return null
    if (selectedMethod.qr_code_image && selectedMethod.qr_code_image.trim() !== "") {
      return selectedMethod.qr_code_image
    }
    if (selectedMethod.account_number_or_upi) {
      return "https://api.qrserver.com/v1/create-qr-code/?data=upi://pay?pa=" + encodeURIComponent(selectedMethod.account_number_or_upi) + "&pn=Merchant&cu=INR&size=300x300"
    }
    return null
  }

  // INSTANT SILENT QR DOWNLOAD WITHOUT POPUP MODAL INTERRUPTIONS
  const downloadQRCode = () => {
    const qrUrl = getQrUrl()
    if (!qrUrl) return

    const fileName = "QR_" + (selectedMethod?.method_name || "Payment").replace(/[^a-zA-Z0-9]/g, "_") + ".png"

    try {
      // 1. Try drawing from rendered DOM img element
      const imgEl = document.querySelector(".finance-v2-qr img") || document.querySelector("#v_qr_img_el")
      if (imgEl && imgEl.complete && imgEl.naturalWidth > 0) {
        const canvas = document.createElement("canvas")
        const width = imgEl.naturalWidth || 300
        const height = imgEl.naturalHeight || 300
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        ctx.fillStyle = "#FFFFFF"
        ctx.fillRect(0, 0, width, height)
        ctx.drawImage(imgEl, 0, 0, width, height)

        try {
          const dataUrl = canvas.toDataURL("image/png")
          const a = document.createElement("a")
          a.href = dataUrl
          a.download = fileName
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          return
        } catch (e) {
          console.warn("Canvas toDataURL restricted, trying fetch blob:", e)
        }
      }
    } catch (err) {
      console.error("DOM Image canvas error:", err)
    }

    // 2. Fetch Blob Download Fallback
    fetch(qrUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const bUrl = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = bUrl
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        setTimeout(() => {
          document.body.removeChild(a)
          window.URL.revokeObjectURL(bUrl)
        }, 200)
      })
      .catch(() => {
        // 3. Direct Link Download Fallback
        const a = document.createElement("a")
        a.href = qrUrl
        a.download = fileName
        a.target = "_blank"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      })
  }

  const copyBankDetails = () => {
    if (!selectedMethod) return
    const details = "Holder: " + (selectedMethod.account_name || "--") + "\nNumber/UPI: " + (selectedMethod.account_number_or_upi || "--") + "\nBank/IFSC: " + (selectedMethod.ifsc_or_bank_name || "--")
    copyToClipboard(details, "Payment details")
  }

  const handleDeposit = async () => {
    const minLimit = minDeposit || 100
    if (!amount || parseFloat(amount) < minLimit) {
      addToast("Minimum deposit amount is Rs " + minLimit, "error")
      return
    }

    if (selectedMethod?.method_type === "gateway") {
      const paymentURL = "https://pay.velplay365.com/gateapi/payments/gateways1/initialisation/casypay.php"
      window.location.href = paymentURL + "?amount=" + amount + "&user_id=" + userId
      return
    }

    if (!utr || utr.trim() === "") {
      addToast("Transaction UTR is required", "error")
      return
    }

    const utrRegex = /^[a-zA-Z0-9]{12,22}$/
    if (!utrRegex.test(utr)) {
      addToast(utr.length < 12 || utr.length > 22 ? "UTR must be 12 to 22 characters" : "UTR must contain only letters and numbers", "error")
      return
    }

    try {
      const response = await apiGet("route-recharge-request", {
        RECHARGE_AMOUNT: amount,
        RECHARGE_MODE: selectedMethod?.method_name || "UPI",
        RECHARGE_DETAILS: utr + "," + (selectedMethod?.method_name || "UPI"),
      })
      const result = await response.json()
      if (result.status_code === "pending" || result.status_code === "success" || result.status_code === "200") {
        addToast("Deposit of Rs " + amount + " submitted successfully!", "success")
        setAmount("")
        setUtr("")
        fetchDepositRecords()
      } else if (result.status_code === "authorization_error" || result.status_code === "auth_error") {
        logout()
      } else {
        addToast("Error: " + (result.status_code || result.message), "error")
      }
    } catch (error) {
      addToast("Error submitting request", "error")
    }
  }

  const isLoggedIn = !!accountInfo?.account_id

  useEffect(() => {
    if (!isLoggedIn) navigate("/")
  }, [isLoggedIn, navigate])

  if (!isLoggedIn) return null

  return (
    <div className="finance-v2 finance-deposit-v2">
      {notification.isOpen && (
        <div className="finance-v2-modal">
          <div className="finance-v2-notice">
            <div className={`finance-v2-notice-icon ${notification.type || "info"}`}>
              <FontAwesomeIcon icon={notification.type === "success" ? faCheck : faInfoCircle} />
            </div>
            <h3>{notification.type === "success" ? "Request Updated" : "Wallet Notice"}</h3>
            <p>{notification.message}</p>
            <button type="button" onClick={() => setNotification({ ...notification, isOpen: false })}>Close</button>
          </div>
        </div>
      )}

      {/* BIG SIZE QR CODE LIGHTBOX MODAL */}
      {qrModalOpen && getQrUrl() && (
        <div
          onClick={() => setQrModalOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(6px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#111827",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "20px",
              padding: "24px",
              maxWidth: "420px",
              width: "100%",
              textAlign: "center",
              position: "relative",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setQrModalOpen(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "rgba(255, 255, 255, 0.1)",
                border: "none",
                color: "#ffffff",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px"
              }}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>

            <h3 style={{ color: "#ffffff", fontSize: "20px", fontWeight: "800", marginBottom: "4px" }}>
              {selectedMethod?.method_name}
            </h3>
            <p style={{ color: "#9ca3af", fontSize: "12px", marginBottom: "16px" }}>
              Scan QR code with any UPI or Payment App
            </p>

            {/* BIG SIZE QR Image Box */}
            <div style={{ background: "#ffffff", padding: "20px", borderRadius: "16px", display: "inline-block", marginBottom: "16px" }}>
              <img
                id="v_qr_img_el"
                src={getQrUrl()}
                alt="QR Code Big Size"
                style={{ width: "280px", height: "280px", objectFit: "contain", display: "block" }}
              />
            </div>

            {selectedMethod?.account_number_or_upi && (
              <div style={{ background: "rgba(255, 255, 255, 0.05)", padding: "10px 14px", borderRadius: "10px", marginBottom: "16px" }}>
                <span style={{ color: "#9ca3af", fontSize: "11px", display: "block" }}>UPI / Account Details</span>
                <span style={{ color: "#38bdf8", fontWeight: "800", fontFamily: "monospace", fontSize: "14px" }}>
                  {selectedMethod.account_number_or_upi}
                </span>
              </div>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={downloadQRCode}
                style={{
                  flex: 1,
                  background: "#10b981",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >
                <FontAwesomeIcon icon={faDownload} /> Download QR Code
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="finance-v2-top">
        <div>
          <span className="finance-v2-tag">Instant Deposit Desk</span>
          <h1 style={{ fontFamily: FONTS.head }}>Add Balance</h1>
          <p>Pick a payment channel, enter the amount, then submit your UTR in one compact flow.</p>
        </div>
        <div className="finance-v2-stats">
          <div><strong>{"\u20b9"}{minDeposit.toLocaleString("en-IN")}</strong><span>Min Deposit</span></div>
          <div><strong>LIVE</strong><span>Admin Gateways</span></div>
          <div><strong>24/7</strong><span>Support</span></div>
        </div>
      </section>

      <section className="finance-v2-workspace">
        <div className="finance-v2-panel finance-v2-methods">
          <div className="finance-v2-panel-head">
            <span>01</span>
            <div>
              <h2>Payment Channel</h2>
              <p>Choose where you made the transfer.</p>
            </div>
          </div>

          <div className="finance-v2-method-list">
            {paymentMethods.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMethod(m)}
                className={selectedMethod?.id === m.id ? "active" : ""}
              >
                <FontAwesomeIcon icon={m.method_type === "bank_transfer" ? faCreditCard : faQrcode} />
                <span>{m.method_name}</span>
                {m.bonus_percentage > 0 && (
                  <span style={{ fontSize: "9px", background: "#10b981", color: "#fff", padding: "1px 5px", borderRadius: "4px", marginLeft: "4px" }}>
                    +{m.bonus_percentage}%
                  </span>
                )}
                {selectedMethod?.id === m.id && <FontAwesomeIcon icon={faCheck} className="check" />}
              </button>
            ))}
          </div>

          {selectedMethod && (
            <div className="finance-v2-payment-card">
              {selectedMethod.method_type === "gateway" ? (
                <div className="finance-v2-gateway">
                  <FontAwesomeIcon icon={faCreditCard} />
                  <h3>{selectedMethod.method_name}</h3>
                  <p>Continue to the secure payment gateway. UTR is not required for this channel.</p>
                </div>
              ) : selectedMethod.method_type === "bank_transfer" ? (
                <>
                  <div className="finance-v2-payline">
                    <span>{selectedMethod.method_name}</span>
                    <button type="button" onClick={copyBankDetails}>
                      <FontAwesomeIcon icon={faCopy} /> Copy All
                    </button>
                  </div>
                  <div className="finance-v2-bank-grid">
                    {[
                      ["Holder", selectedMethod.account_name],
                      ["Account / UPI", selectedMethod.account_number_or_upi],
                      ["Bank / IFSC", selectedMethod.ifsc_or_bank_name],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <span>{label}</span>
                        <strong>{value || "--"}</strong>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="finance-v2-payline">
                    <span>{selectedMethod.method_name}</span>
                    <button type="button" onClick={() => copyToClipboard(selectedMethod.account_number_or_upi, "UPI ID")}>
                      <FontAwesomeIcon icon={faCopy} /> Copy
                    </button>
                  </div>
                  <div className="finance-v2-upi-id">{selectedMethod.account_number_or_upi || "Fetching..."}</div>
                  
                  {getQrUrl() && (
                    <div className="finance-v2-qr-row">
                      {/* Clickable QR Image for Big Size Preview */}
                      <div
                        onClick={() => setQrModalOpen(true)}
                        title="Click to view Big Size QR"
                        style={{ cursor: "pointer", position: "relative" }}
                        className="finance-v2-qr"
                      >
                        <img src={getQrUrl()} alt="Payment QR code" style={{ maxHeight: "160px" }} />
                        <div
                          style={{
                            position: "absolute",
                            bottom: "6px",
                            right: "6px",
                            background: "rgba(0,0,0,0.7)",
                            color: "#fff",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "10px"
                          }}
                        >
                          <FontAwesomeIcon icon={faExpand} /> Click to Enlarge
                        </div>
                      </div>
                      
                      <button type="button" className="finance-v2-soft-btn" onClick={downloadQRCode}>
                        <FontAwesomeIcon icon={faDownload} /> Download QR
                      </button>
                    </div>
                  )}

                  {selectedMethod.instructions && (
                    <div style={{ fontSize: "12px", color: "#60a5fa", marginTop: "10px" }}>
                      ℹ️ {selectedMethod.instructions}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="finance-v2-ticket">
          <div className="finance-v2-panel-head">
            <span>02</span>
            <div>
              <h2>Deposit Request</h2>
              <p>Enter amount and reference details.</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-1.5">
            <label className="finance-v2-label mb-0">Deposit Amount</label>
            <span className="text-xs font-bold text-[#22c6e8] bg-[#22c6e8]/10 px-2.5 py-0.5 rounded-md border border-[#22c6e8]/30">
              Min: {"\u20b9"}{minDeposit.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="finance-v2-money-input">
            <FontAwesomeIcon icon={faIndianRupeeSign} />
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
          </div>

          <div className="finance-v2-chip-grid">
            {quickAmounts.map((v) => (
              <button key={v} type="button" onClick={() => handleQuickAmount(v)} className={amount === v.toString() ? "active" : ""}>
                {"\u20b9"}{parseInt(v).toLocaleString("en-IN")}
              </button>
            ))}
          </div>

          {selectedMethod?.method_type !== "gateway" && (
            <>
              <label className="finance-v2-label">UTR / Reference No.</label>
              <input
                className="finance-v2-text-input"
                type="text"
                value={utr}
                onChange={(e) => setUtr(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
                placeholder="12 to 22 digit UTR number"
                maxLength={22}
                minLength={12}
              />
            </>
          )}

          <button
            type="button"
            className="finance-v2-submit-btn"
            onClick={handleDeposit}
          >
            Submit Deposit Request
          </button>
        </div>
      </section>

      {/* Recent Deposit Records Section with Explicit High-Contrast Dark Theme */}
      <div style={{ background: "#111827", borderRadius: "16px", padding: "20px", border: "1px solid rgba(255,255,255,0.1)", marginTop: "28px" }}>
        <div style={{ display: "flex", items: "center", justifyContent: "space-between", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div>
            <h2 style={{ color: "#ffffff", fontSize: "18px", fontWeight: "800", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <FontAwesomeIcon icon={faHistory} style={{ color: "#38bdf8" }} />
              Recent Deposit Records
            </h2>
            <p style={{ color: "#9ca3af", fontSize: "12px", margin: "4px 0 0 0" }}>Track your previous deposit transactions</p>
          </div>
          <button
            type="button"
            onClick={fetchDepositRecords}
            style={{ background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", border: "1px solid rgba(56, 189, 248, 0.3)", borderRadius: "8px", padding: "6px 14px", fontWeight: "700", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <FontAwesomeIcon icon={faSync} className={loadingHistory ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          {loadingHistory ? (
            <div style={{ padding: "24px", textAlign: "center", color: "#9ca3af", fontSize: "13px" }}>Loading deposit records...</div>
          ) : depositRecords.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 6px", textAlgin: "left" }}>
              <thead>
                <tr>
                  <th style={{ color: "#94a3b8", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.1)", textAlign: "left" }}>Date & Time</th>
                  <th style={{ color: "#94a3b8", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.1)", textAlign: "left" }}>Mode</th>
                  <th style={{ color: "#94a3b8", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.1)", textAlign: "left" }}>Amount</th>
                  <th style={{ color: "#94a3b8", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.1)", textAlign: "left" }}>UTR / Ref</th>
                  <th style={{ color: "#94a3b8", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.1)", textAlign: "left" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {depositRecords.map((item, idx) => {
                  const dateVal = item.r_date || item.r_time || item.tbl_time_stamp || item.date || item.created_at || "--"
                  const modeVal = item.r_mode || item.tbl_recharge_mode || item.mode || "Deposit"
                  const amountVal = item.r_amount || item.tbl_recharge_amount || item.amount || 0
                  const detailsVal = item.r_details || item.tbl_recharge_details || item.utr || "--"
                  const rawStatus = (item.r_status || item.tbl_request_status || item.status || "pending").toLowerCase()

                  let badgeStyle = { background: "rgba(250, 204, 21, 0.15)", color: "#facc15", border: "1px solid rgba(250, 204, 21, 0.3)" }
                  let statusText = "PENDING"

                  if (rawStatus === "success" || rawStatus === "approved") {
                    badgeStyle = { background: "rgba(74, 222, 128, 0.15)", color: "#4ade80", border: "1px solid rgba(74, 222, 128, 0.3)" }
                    statusText = "SUCCESS"
                  } else if (rawStatus === "reject" || rawStatus === "failed" || rawStatus === "rejected") {
                    badgeStyle = { background: "rgba(248, 113, 113, 0.15)", color: "#f87171", border: "1px solid rgba(248, 113, 113, 0.3)" }
                    statusText = "REJECTED"
                  }

                  return (
                    <tr key={idx} style={{ background: "rgba(255,255,255,0.03)" }}>
                      <td style={{ color: "#f1f5f9", fontSize: "13px", padding: "12px 14px", fontWeight: "500" }}>{dateVal}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", border: "1px solid rgba(56, 189, 248, 0.3)", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "800" }}>
                          {modeVal}
                        </span>
                      </td>
                      <td style={{ color: "#ffffff", fontSize: "14px", fontWeight: "800", padding: "12px 14px" }}>
                        {"\u20b9"}{parseFloat(amountVal).toLocaleString("en-IN")}
                      </td>
                      <td style={{ color: "#cbd5e1", fontSize: "12px", fontFamily: "monospace", padding: "12px 14px" }}>
                        {detailsVal}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ ...badgeStyle, padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" }}>
                          {statusText}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: "32px", textAlign: "center", color: "#9ca3af", fontSize: "13px" }}>
              <FontAwesomeIcon icon={faHistory} style={{ fontSize: "28px", marginBottom: "8px", opacity: 0.5, display: "block" }} />
              No deposit records found.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Deposit

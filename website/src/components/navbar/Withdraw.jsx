"use client"

import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faWallet,
  faIndianRupeeSign,
  faCheck,
  faInfoCircle,
  faCreditCard,
  faPlus,
  faChevronDown,
  faSearch,
  faTimes,
  faUniversity,
  faHistory,
  faClock,
  faShieldAlt,
  faEye,
  faEyeSlash, faSpinner,
} from "@fortawesome/free-solid-svg-icons"
import { FaTrash } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useSite } from "../../context/SiteContext"
import { FONTS } from "../../constants/theme"
import { apiGet, apiPost } from "@/utils/apiFetch"

const Withdraw = () => {
  const navigate = useNavigate()
  const [amount, setAmount] = useState("")
  const [showAddBankPopup, setShowAddBankPopup] = useState(false)
  const [addedBankAccounts, setAddedBankAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState("")
  const [showBankDropdown, setShowBankDropdown] = useState(false)
  const { accountInfo, logout } = useSite()
  const userId = localStorage.getItem("account_id")
  const [notification, setNotification] = useState({ isOpen: false, message: "", type: "" })
  const [availableBanks, setAvailableBanks] = useState([])
  const [bankSearch, setBankSearch] = useState("")
  const [withdrawRecords, setWithdrawRecords] = useState([])
  const [historyFilter, setHistoryFilter] = useState("All")
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [confirmSelection, setConfirmSelection] = useState({ isOpen: false, account: null })
  const [showFullAcct, setShowFullAcct] = useState(false)
  const [minWithdraw, setMinWithdraw] = useState(1000)

  const [formData, setFormData] = useState({
    realName: "",
    accountNumber: "",
    selectedBank: "",
    ifscCode: "",
  })
  const [popupError, setPopupError] = useState("")
  const [popupLoading, setPopupLoading] = useState(false)

  const addToast = (message, type = "info") => {
    setNotification({ isOpen: true, message, type })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const fetchBankCards = async () => {
    try {
      const response = await apiGet("route-get-bankcards", { PAGE_NUM: 1 })
      const result = await response.json()
      if (result.status_code === "success") setAddedBankAccounts(result.data)
    } catch (error) {
      console.error("Error fetching bank cards", error)
    }
  }

  const fetchBankList = async () => {
    try {
      const response = await apiGet("route-get-banklist")
      const result = await response.json()
      setAvailableBanks(result.data.banklist)
    } catch (error) {
      console.error("Error fetching bank list", error)
    }
  }

  const fetchWithdrawRecords = async () => {
    if (!userId) return
    setLoadingHistory(true)
    try {
      const response = await apiGet("route-withdraw-records", { PAGE_NUM: 1 })
      const result = await response.json()
      setWithdrawRecords(result.data || [])
    } catch (error) {
      console.error("Fetch error", error)
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    fetchBankCards()
    fetchBankList()
    fetchWithdrawRecords()
    const fetchMinWithdraw = async () => {
      try {
        const response = await apiGet("route-get-primary-bankcard")
        const result = await response.json()
        if (result.minimum_withdrawl) {
          setMinWithdraw(parseFloat(result.minimum_withdrawl) || 1000)
        } else if (accountInfo?.service_min_withdraw) {
          setMinWithdraw(parseFloat(accountInfo.service_min_withdraw) || 1000)
        }
      } catch (e) {
        if (accountInfo?.service_min_withdraw) {
          setMinWithdraw(parseFloat(accountInfo.service_min_withdraw) || 1000)
        }
      }
    }
    fetchMinWithdraw()
  }, [accountInfo?.service_min_withdraw])

  const addBankDetails = async () => {
    setPopupError("")

    if (addedBankAccounts.length >= 3) {
      setPopupError("Maximum 3 bank accounts limit reached. Please delete an existing account first.")
      return
    }

    const { realName, accountNumber, selectedBank, ifscCode } = formData
    if (!realName.trim()) {
      setPopupError("Please enter the Account Holder Name.")
      return
    }
    if (!accountNumber.trim()) {
      setPopupError("Please enter the Bank Account Number.")
      return
    }
    if (!selectedBank.trim()) {
      setPopupError("Please select your Bank Name.")
      return
    }
    if (!ifscCode.trim()) {
      setPopupError("Please enter the 11-digit IFSC Code.")
      return
    }

    const cleanIFSC = ifscCode.trim().toUpperCase()
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/
    if (cleanIFSC.length !== 11) {
      setPopupError("IFSC Code must be exactly 11 characters (e.g. SBIN0001234).")
      return
    }
    if (!ifscRegex.test(cleanIFSC)) {
      setPopupError("Invalid IFSC format. 5th character must be 0 (e.g. HDFC0001234).")
      return
    }

    const cleanAcc = accountNumber.trim()
    if (!/^\d+$/.test(cleanAcc)) {
      setPopupError("Account number must contain only numbers.")
      return
    }
    if (cleanAcc.length < 9 || cleanAcc.length > 18) {
      setPopupError("Account number must be between 9 and 18 digits.")
      return
    }

    setPopupLoading(true)
    try {
      const response = await apiGet("route-add-bankcard", {
        BENEFICIARY_NAME: realName.trim(),
        USER_BANK_NAME: selectedBank.trim(),
        USER_BANK_ACCOUNT: cleanAcc,
        USER_BANK_IFSC_CODE: cleanIFSC,
        IS_PRIMARY: "true",
        CARD_METHOD: "bank",
      })
      const result = await response.json()
      if (result.status_code === "success") {
        addToast("Bank account linked successfully!", "success")
        await fetchBankCards()
        setShowAddBankPopup(false)
        setFormData({ realName: "", accountNumber: "", selectedBank: "", ifscCode: "" })
      } else if (result.status_code === "authorization_error" || result.status_code === "auth_error") {
        logout()
      } else if (result.status_code === "already_exist") {
        setPopupError("This bank account number is already linked to your profile.")
      } else if (result.status_code === "limit_reached") {
        setPopupError("Maximum 3 bank accounts limit reached. Delete an existing account first.")
      } else if (result.status_code === "invalid_params") {
        setPopupError("Invalid details provided. Please check your bank information.")
      } else {
        setPopupError(result.message || `Unable to link bank (${result.status_code}). Please try again.`)
      }
    } catch (error) {
      setPopupError("Connection error while saving bank details. Please try again.")
    } finally {
      setPopupLoading(false)
    }
  }

  const deleteBankCard = async (cardId) => {
    if (!window.confirm("Are you sure you want to delete this bank account?")) return
    try {
      const response = await apiGet("route-delete-bankcard", { CARD_ID: cardId })
      const rawResponse = await response.text()
      let result
      try {
        result = JSON.parse(rawResponse)
      } catch (error) {
        throw new Error(`Invalid server response: ${rawResponse.substring(0, 50)}...`)
      }

      if (result.status_code === "success") {
        addToast("Account deleted successfully", "success")
        fetchBankCards()
        if (selectedAccount === cardId) setSelectedAccount("")
      } else if (result.status_code === "authorization_error" || result.status_code === "auth_error") {
        logout()
      } else {
        addToast(result.message || `Error: ${result.status_code}`, "error")
      }
    } catch (error) {
      addToast(error.message || "Failed to connect to server", "error")
    }
  }

  const handleWithdrawal = async () => {
    if (!selectedAccount) {
      addToast("Select a bank account", "error")
      return
    }
    const minLimit = minWithdraw || 1000
    if (!amount || parseFloat(amount) < minLimit || parseFloat(amount) > 50000) {
      addToast(`Amount must be Rs ${minLimit.toLocaleString("en-IN")} to Rs 50,000`, "error")
      return
    }
    if (parseFloat(amount) > parseFloat(accountInfo?.account_balance || 0)) {
      addToast("Insufficient withdrawable balance", "error")
      return
    }

    try {
      const response = await apiPost("route-withdraw-request", { WITHDRAW_AMOUNT: amount })
      const result = await response.json()
      if (result.status_code === "success") {
        addToast(`Withdrawal of Rs ${amount} initiated`, "success")
        setAmount("")
        fetchWithdrawRecords()
      } else if (result.status_code === "gameplay_required") {
        addToast(`Gameplay of Rs ${result.required_play_balance || "required amount"} required before withdrawal`, "error")
      } else {
        const msg = result.message || result.status_code
        addToast(`Failed: ${msg.replace(/_/g, " ").toUpperCase()}`, "error")
      }
    } catch (error) {
      addToast("Error processing request", "error")
    }
  }

  const isLoggedIn = !!accountInfo?.account_id

  useEffect(() => {
    if (!isLoggedIn) navigate("/")
  }, [isLoggedIn, navigate])

  if (!isLoggedIn) return null

  const selectedBankAccount = addedBankAccounts.find((account) => account.c_bank_id === selectedAccount)

  return (
    <div className="finance-v2 finance-withdraw-v2">
      {notification.isOpen && (
        <div className="finance-v2-modal">
          <div className="finance-v2-notice">
            <div className={`finance-v2-notice-icon ${notification.type || "info"}`}>
              <FontAwesomeIcon icon={notification.type === "success" ? faCheck : faInfoCircle} />
            </div>
            <h3>{notification.type === "success" ? "Request Updated" : "Payout Notice"}</h3>
            <p>{notification.message}</p>
            <button type="button" onClick={() => setNotification({ ...notification, isOpen: false })}>Close</button>
          </div>
        </div>
      )}

      <section className="finance-v2-top withdraw">
        <div>
          <span className="finance-v2-tag">Verified Payout Desk</span>
          <h1 style={{ fontFamily: FONTS.head }}>Withdraw Balance</h1>
          <p>Choose a saved bank, set a payout amount, and send the request from a clean settlement screen.</p>
        </div>
        <div className="finance-v2-stats">
          <div><strong>{"\u20b9"}{minWithdraw.toLocaleString("en-IN")}</strong><span>Min Payout</span></div>
          <div><strong>{"\u20b9"}50K</strong><span>Limit</span></div>
          <div><strong>3</strong><span>Banks</span></div>
        </div>
      </section>

      <section className="finance-v2-workspace withdraw">
        <div className="finance-v2-panel">
          <div className="finance-v2-balance-strip">
            <div>
              <span>Withdrawable Balance</span>
              <strong>{"\u20b9"}{parseFloat(accountInfo?.account_balance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
            </div>
            <FontAwesomeIcon icon={faIndianRupeeSign} />
          </div>

          <div className="finance-v2-mini-balances">
            <div><span>Casino Bonus</span><strong>{"\u20b9"}{parseFloat(accountInfo?.account_casino_bonus || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong></div>
            <div><span>Sports Bonus</span><strong>{"\u20b9"}{parseFloat(accountInfo?.account_sports_bonus || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong></div>
            <div><span>Total Balance</span><strong>{"\u20b9"}{parseFloat(accountInfo?.account_balance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong></div>
          </div>

          <div className="finance-v2-panel-head account-head">
            <span>01</span>
            <div>
              <h2>Settlement Bank</h2>
              <p>Select or link a verified bank account.</p>
            </div>
            <button
              type="button"
              className="finance-v2-link-btn"
              disabled={addedBankAccounts.length >= 3}
              onClick={() => {
                if (addedBankAccounts.length >= 3) addToast("Maximum 3 bank accounts allowed", "error")
                else setShowAddBankPopup(true)
              }}
            >
              <FontAwesomeIcon icon={faPlus} />
              Link
            </button>
          </div>

          <div className="finance-v2-account-list">
            {addedBankAccounts.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                <AnimatePresence>
                  {addedBankAccounts.map((account) => {
                    const isSelected = selectedAccount === account.c_bank_id
                    return (
                      <motion.div
                        key={account.c_bank_id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={() => setSelectedAccount(account.c_bank_id)}
                        className={`relative p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? "border-[#1646d7] bg-blue-500/10 shadow-lg shadow-blue-500/10"
                            : "border-gray-200 dark:border-white/10 bg-white/60 dark:bg-[#121620]/60 hover:border-blue-300 dark:hover:border-blue-500/40"
                        }`}
                      >
                        {/* Radio & Info */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              isSelected
                                ? "border-[#1646d7] bg-[#1646d7] text-white scale-110 shadow-sm"
                                : "border-gray-400 dark:border-gray-500 bg-transparent"
                            }`}
                          >
                            {isSelected && <FontAwesomeIcon icon={faCheck} className="text-[9px]" />}
                          </div>

                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isSelected ? "bg-[#1646d7] text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                          }`}>
                            <FontAwesomeIcon icon={faUniversity} className="text-sm" />
                          </div>

                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                              <strong className="text-xs sm:text-sm font-black text-gray-900 dark:text-white truncate">
                                {account.c_bank_name}
                              </strong>
                              {isSelected ? (
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white tracking-wider flex-shrink-0">
                                  Selected
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider hidden sm:inline-block">
                                  Tap to select
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-mono tracking-wider">
                              A/C: ���� {account.c_bank_account.slice(-4)}
                            </span>
                          </div>
                        </div>

                        {/* Delete Action */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteBankCard(account.c_bank_id)
                          }}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors flex-shrink-0 cursor-pointer"
                          title="Delete bank card"
                        >
                          <FaTrash size={13} />
                        </button>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <div className="finance-v2-empty-account" onClick={() => setShowAddBankPopup(true)} role="button" tabIndex={0}>
                <FontAwesomeIcon icon={faPlus} />
                <div>
                  <strong>Add Bank Account</strong>
                  <span>Required before withdrawal</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="finance-v2-ticket payout">
          <div className="finance-v2-panel-head">
            <span>02</span>
            <div>
              <h2>Payout Request</h2>
              {selectedBankAccount ? (
                <p className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 text-xs">
                  <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                  Destination: {selectedBankAccount.c_bank_name} (���� {selectedBankAccount.c_bank_account.slice(-4)})
                </p>
              ) : (
                <p className="text-amber-500 font-semibold text-xs">
                  ?? Please tap a bank account on the left to select it.
                </p>
              )}
            </div>
          </div>
          <div className="finance-v2-panel-head">
            <span>02</span>
            <div>
              <h2>Payout Request</h2>
              <p>{selectedBankAccount ? `Sending to ${selectedBankAccount.c_bank_name}` : "Choose a bank account first."}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-1.5">
            <label className="finance-v2-label mb-0">Withdraw Amount</label>
            <span className="text-xs font-bold text-[#22c6e8] bg-[#22c6e8]/10 px-2.5 py-0.5 rounded-md border border-[#22c6e8]/30">
              Min: {"\u20b9"}{minWithdraw.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="finance-v2-money-input">
            <FontAwesomeIcon icon={faIndianRupeeSign} />
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
          </div>

          <div className="finance-v2-chip-grid four">
            {["500", "1000", "5000", "10000"].map((v) => (
              <button key={v} type="button" onClick={() => setAmount(v)} className={amount === v ? "active" : ""}>
                {"\u20b9"}{parseInt(v).toLocaleString("en-IN")}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleWithdrawal}
            disabled={!amount || !selectedAccount}
            className="finance-v2-primary"
            style={
              amount && selectedAccount
                ? {
                    background: "linear-gradient(135deg, #0e2040 0%, #1646d7 58%, #22c6e8 100%)",
                    color: "#ffffff",
                    border: "0",
                  }
                : undefined
            }
          >
            <FontAwesomeIcon icon={faWallet} />
            Confirm Payout
          </button>

          <div className="finance-v2-note">
            <FontAwesomeIcon icon={faInfoCircle} />
            Real cash deposits and game winnings can be withdrawn instantly. Bonus funds may need wagering.
          </div>
        </div>
      </section>

      <section className="finance-v2-history">
        <div className="finance-v2-history-head">
          <div>
            <h2>Withdrawal History</h2>
            <p>Recent payout request logs</p>
          </div>
          <div className="finance-v2-filters">
            {["All", "Success", "Processing", "Rejected"].map((f) => (
              <button key={f} type="button" onClick={() => setHistoryFilter(f)} className={historyFilter === f ? "active" : ""}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="finance-v2-records">
          {withdrawRecords
            .filter((r) => historyFilter === "All" || (r.w_status || "").toLowerCase() === historyFilter.toLowerCase())
            .slice(0, 6)
            .map((r, i) => (
              <div className="finance-v2-record" key={i}>
                <div>
                  <strong>{"\u20b9"}{parseFloat(r.w_amount || 0).toLocaleString("en-IN")}</strong>
                  <span>{r.w_date} {r.w_time}</span>
                </div>
                <div>
                  <em>{r.w_status}</em>
                  <small>#{String(r.w_uniq_id || "--------").substring(0, 8).toUpperCase()}</small>
                </div>
              </div>
            ))}

          {withdrawRecords.length === 0 && !loadingHistory && (
            <div className="finance-v2-empty"><FontAwesomeIcon icon={faSearch} /> No withdrawals recorded</div>
          )}
          {loadingHistory && (
            <div className="finance-v2-empty"><FontAwesomeIcon icon={faClock} /> Loading withdrawal history...</div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {showAddBankPopup && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: "spring", damping: 26, stiffness: 340 }}
              className="relative w-full max-w-[480px] my-auto bg-white rounded-2xl sm:rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.35)] border border-slate-200 overflow-hidden flex flex-col text-slate-900"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            >
              {/* Top Accent Gradient Bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-[#0e2040] via-[#1646d7] to-[#22c6e8]" />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  setShowAddBankPopup(false)
                  setPopupError("")
                }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer z-10"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xs" />
              </button>

              <div className="p-5 sm:p-6 space-y-4">
                {/* Header Info */}
                <div className="flex items-center gap-3 pr-6">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1646d7] flex-shrink-0 shadow-sm">
                    <FontAwesomeIcon icon={faUniversity} className="text-lg" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 leading-tight">
                      Link Bank Account
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Enter details exactly as registered in your bank records.
                    </p>
                  </div>
                </div>

                {/* Error Banner */}
                {popupError && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5 leading-relaxed"
                  >
                    <FontAwesomeIcon icon={faInfoCircle} className="text-rose-600 text-sm flex-shrink-0" />
                    <span>{popupError}</span>
                  </motion.div>
                )}

                {/* Form Fields */}
                <div className="space-y-3">
                  {/* Account Holder Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faShieldAlt} className="text-[#1646d7]" /> Account Holder Name
                    </label>
                    <input
                      name="realName"
                      value={formData.realName}
                      onChange={handleInputChange}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm font-medium focus:bg-white focus:border-[#1646d7] focus:ring-2 focus:ring-[#1646d7]/15 outline-none transition-all"
                    />
                  </div>

                  {/* Bank Name Selector */}
                  <div className="space-y-1 relative">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faUniversity} className="text-[#1646d7]" /> Select Bank Name
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowBankDropdown(!showBankDropdown)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-sm flex items-center justify-between text-slate-900 hover:border-slate-300 transition-colors cursor-pointer"
                    >
                      <span className={formData.selectedBank ? "font-bold text-slate-900" : "text-slate-400"}>
                        {formData.selectedBank || "Choose your bank"}
                      </span>
                      <FontAwesomeIcon icon={faChevronDown} className="text-slate-400 text-xs" />
                    </button>

                    {/* Popular Quick Bank Chips */}
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {["State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Punjab National Bank", "Bank of Baroda"].map((bank) => (
                        <button
                          key={bank}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, selectedBank: bank }))
                            setShowBankDropdown(false)
                          }}
                          className={`text-[10px] px-2 py-1 rounded-lg border font-bold transition-all cursor-pointer ${
                            formData.selectedBank === bank
                              ? "bg-[#1646d7] border-[#1646d7] text-white shadow-sm"
                              : "bg-slate-100 border-slate-200 text-slate-600 hover:border-blue-300 hover:text-[#1646d7] hover:bg-blue-50"
                          }`}
                        >
                          {bank.replace(" Bank", "").replace(" of India", "")}
                        </button>
                      ))}
                    </div>

                    {/* Searchable Dropdown Menu */}
                    {showBankDropdown && (
                      <div className="absolute top-[68px] left-0 right-0 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl p-2.5 space-y-1.5 max-h-56 overflow-hidden flex flex-col">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
                          <FontAwesomeIcon icon={faSearch} className="text-slate-400 text-xs" />
                          <input
                            value={bankSearch}
                            onChange={(e) => setBankSearch(e.target.value)}
                            placeholder="Search banks..."
                            className="w-full bg-transparent text-slate-900 text-xs outline-none font-medium"
                            autoFocus
                          />
                        </div>
                        <div className="overflow-y-auto space-y-0.5 pr-1 custom-scrollbar">
                          {availableBanks
                            .filter((b) => (b.bankName || "").toLowerCase().includes(bankSearch.toLowerCase()))
                            .map((b) => (
                              <button
                                key={b.bankName}
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, selectedBank: b.bankName }))
                                  setShowBankDropdown(false)
                                  setBankSearch("")
                                }}
                                className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-700 hover:text-white hover:bg-[#1646d7] transition-colors cursor-pointer font-semibold"
                              >
                                {b.bankName}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Account Number */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faCreditCard} className="text-[#1646d7]" /> Account Number
                    </label>
                    <input
                      name="accountNumber"
                      type="text"
                      inputMode="numeric"
                      value={formData.accountNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "")
                        setFormData(prev => ({ ...prev, accountNumber: val }))
                      }}
                      placeholder="e.g. 100023456789"
                      maxLength={18}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm font-mono font-bold tracking-wider focus:bg-white focus:border-[#1646d7] focus:ring-2 focus:ring-[#1646d7]/15 outline-none transition-all"
                    />
                  </div>

                  {/* IFSC Code */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faUniversity} className="text-[#1646d7]" /> IFSC Code
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono font-bold">11 Characters</span>
                    </div>
                    <input
                      name="ifscCode"
                      value={formData.ifscCode}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
                        setFormData(prev => ({ ...prev, ifscCode: val }))
                      }}
                      placeholder="e.g. SBIN0001234"
                      maxLength={11}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm font-mono font-bold tracking-widest uppercase focus:bg-white focus:border-[#1646d7] focus:ring-2 focus:ring-[#1646d7]/15 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  onClick={addBankDetails}
                  disabled={popupLoading}
                  className="w-full py-3.5 rounded-xl font-black text-xs sm:text-sm tracking-wider uppercase text-white shadow-xl hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  style={{ background: "linear-gradient(135deg, #0e2040 0%, #1646d7 58%, #22c6e8 100%)" }}
                >
                  {popupLoading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="fa-spin" />
                      <span>Linking Bank Account...</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faCheck} />
                      <span>Confirm & Link Bank</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmSelection.isOpen && confirmSelection.account && (
          <div className="finance-v2-modal">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="finance-v2-popup compact"
            >
              <div className="finance-v2-popup-head centered">
                <FontAwesomeIcon icon={faUniversity} />
                <div>
                  <h3>Set Active Account?</h3>
                  <p>{confirmSelection.account.c_bank_name}</p>
                </div>
              </div>

              <div className="finance-v2-confirm-lines">
                <div><span>Holder</span><strong>{confirmSelection.account.c_beneficiary}</strong></div>
                <div><span>IFSC</span><strong>{confirmSelection.account.c_bank_ifsc_code}</strong></div>
                <div>
                  <span>Account</span>
                  <strong>
                    {showFullAcct
                      ? confirmSelection.account.c_bank_account
                      : `${confirmSelection.account.c_bank_account.slice(0, 4)} **** ${confirmSelection.account.c_bank_account.slice(-4)}`}
                    <button type="button" onClick={() => setShowFullAcct(!showFullAcct)}>
                      <FontAwesomeIcon icon={showFullAcct ? faEyeSlash : faEye} />
                    </button>
                  </strong>
                </div>
              </div>

              <button
                type="button"
                className="finance-v2-primary"
                onClick={() => {
                  setSelectedAccount(confirmSelection.account.c_bank_id)
                  addToast(`${confirmSelection.account.c_bank_name} selected`, "success")
                  setConfirmSelection({ isOpen: false, account: null })
                }}
              >
                Set Active Account
              </button>
              <button type="button" className="finance-v2-secondary" onClick={() => setConfirmSelection({ isOpen: false, account: null })}>Cancel</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Withdraw

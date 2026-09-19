"use client"

import { useEffect } from "react"
import RanaHeader from "./velplay365/RanaHeader"
import RanaSidebarLeft from "./velplay365/RanaSidebarLeft"
import RanaSidebarRight from "./velplay365/RanaSidebarRight"
import RanaMainContent from "./velplay365/RanaMainContent"
import AuthModalHost from "../common/AuthModalHost"
import WhatsAppFloat from "../common/WhatsAppFloat"
import { useLocation } from "react-router-dom"
import { useSite } from "../../context/SiteContext"
import '../../assets/css/velplay365.css'

function Home() {
  const location = useLocation()
  const { setShowRegister } = useSite()

  useEffect(() => {
    document.documentElement.classList.add('light')
    document.body.classList.add('show-whatsapp')

    return () => {
      document.documentElement.classList.remove('light')
      document.body.classList.remove('show-whatsapp')
    }
  }, [])

  useEffect(() => {
    if (location.pathname === '/register') {
      const referralCode = new URLSearchParams(location.search).get('ref')
      if (referralCode) localStorage.setItem('referral_code', referralCode)
      setShowRegister(true)
    }
  }, [location.pathname, location.search, setShowRegister])

  return (
    <div className="rana-layout">
      <AuthModalHost />
      <WhatsAppFloat />
      <RanaHeader />
      <div className="page-wrap">
        <RanaSidebarLeft />
        <RanaMainContent />
        <RanaSidebarRight />
      </div>
    </div>
  )
}

export default Home

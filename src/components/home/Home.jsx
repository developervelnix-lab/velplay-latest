"use client"

import { useEffect } from "react"
import RanaHeader from "./velplay365/RanaHeader"
import RanaSidebarLeft from "./velplay365/RanaSidebarLeft"
import RanaSidebarRight from "./velplay365/RanaSidebarRight"
import RanaMainContent from "./velplay365/RanaMainContent"
import AuthModalHost from "../common/AuthModalHost"
import '../../assets/css/velplay365.css'

function Home() {
  useEffect(() => {
    document.documentElement.classList.add('light')

    return () => {
      document.documentElement.classList.remove('light')
    }
  }, [])

  return (
    <div className="rana-layout">
      <AuthModalHost />
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

import React from 'react'
import RanaHeader from '../home/velplay365/RanaHeader'
import Deposit from '../navbar/Deposit'
import '../../assets/css/velplay365.css'

function DepositPage() {
  return (
    <div className="finance-route-shell rana-layout min-h-screen">
      <RanaHeader />
      <main className="finance-route-main">
        <Deposit />
      </main>
    </div>
  )
}

export default DepositPage

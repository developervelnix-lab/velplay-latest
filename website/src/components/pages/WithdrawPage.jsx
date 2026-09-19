import React from 'react'
import RanaHeader from '../home/velplay365/RanaHeader'
import Withdraw from '../navbar/Withdraw'
import '../../assets/css/velplay365.css'

function WithdrawPage() {
  return (
    <div className="finance-route-shell rana-layout min-h-screen">
      <RanaHeader />
      <main className="finance-route-main">
        <Withdraw />
      </main>
    </div>
  )
}

export default WithdrawPage

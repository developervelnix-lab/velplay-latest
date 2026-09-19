import React from 'react'
import RanaHeader from '../home/velplay365/RanaHeader'
import BettingTransactionPage from '../sidebar-components/statements/BettingTransaction'
import '../../assets/css/velplay365.css';

function ProfitLossPage() {
  return (
    <div className="finance-route-shell rana-layout min-h-screen">
      <RanaHeader />
      <main className="finance-route-main">
        <BettingTransactionPage />
      </main>
    </div>
  )
}

export default ProfitLossPage

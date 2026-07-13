import React from 'react'
import RanaHeader from '../home/velplay365/RanaHeader'
import Promotion from '../sidebar-components/Miscellaneous/Promotion'
import '../../assets/css/velplay365.css';

function PromotionPage() {
  return (
    <div className="rana-layout promo-route min-h-screen">
      <RanaHeader />
      <main className="promo-route-main">
        <Promotion />
      </main>
    </div>
  )
}

export default PromotionPage

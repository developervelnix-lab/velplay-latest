import React from 'react'
import RanaHeader from '../home/velplay365/RanaHeader'
import InviteAndEarn from '../sidebar-components/Miscellaneous/InviteAndEarn'
import '../../assets/css/velplay365.css';

function InviteAndEarnPage() {
  return (
    <div className="rana-layout invite-route min-h-screen">
      <RanaHeader />
      <main className="invite-route-main">
        <InviteAndEarn />
      </main>
    </div>
  )
}

export default InviteAndEarnPage

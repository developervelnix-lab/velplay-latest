import React from 'react'
import RanaHeader from '../home/velplay365/RanaHeader'
import OpenBets from '../sidebar-components/statements/OpenBets'
import '../../assets/css/velplay365.css'

function OpenBetPage() {
  return (
    <div className="rana-layout min-h-screen">
      <RanaHeader />
      <div className=''>
        <OpenBets />
      </div>
    </div>
  )
}

export default OpenBetPage

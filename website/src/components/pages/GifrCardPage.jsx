import React from 'react'
import RanaHeader from '../home/velplay365/RanaHeader'
import GiftCardRedemption from '../sidebar-components/Miscellaneous/GiftCard'
import { useColors } from '../../hooks/useColors';
import '../../assets/css/velplay365.css';

function GifrCardPage() {
  const COLORS = useColors();
  return (
    <div className="rana-layout min-h-screen">
      <RanaHeader />
      <div className='pb-10 px-2'>
        <GiftCardRedemption />
      </div>
    </div>
  )
}

export default GifrCardPage

import React from 'react'
import ContactUs from '../sidebar-components/contact/ContactUs'
import RanaHeader from '../home/velplay365/RanaHeader'
import { useColors } from '../../hooks/useColors';
import '../../assets/css/velplay365.css';

function ContactPage() {
  const COLORS = useColors();
  return (
    <div className="rana-layout min-h-screen">
      <RanaHeader />
      <div className='pb-10 px-2'>
        <ContactUs />
      </div>
    </div>
  )
}

export default ContactPage

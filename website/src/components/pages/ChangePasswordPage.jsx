import React from 'react'
import RanaHeader from '../home/velplay365/RanaHeader'
import PasswordChangeForm from '../sidebar-components/account-actions/ChangePassword'
import '../../assets/css/velplay365.css';

function ChangePasswordPage() {
  return (
    <div className="finance-route-shell rana-layout min-h-screen">
      <RanaHeader />
      <main className="finance-route-main">
        <PasswordChangeForm />
      </main>
    </div>
  )
}

export default ChangePasswordPage

import ExclusionPolicy from '../sidebar-components/legal-complience/Exclusion'
import RanaHeader from '../home/velplay365/RanaHeader'
import '../../assets/css/velplay365.css';

function ExclusionPolicyPage() {
  return (
    <div className="rana-layout legal-route-shell min-h-screen">
      <RanaHeader />
      <main className="legal-route-main">
        <ExclusionPolicy />
      </main>
    </div>
  )
}

export default ExclusionPolicyPage

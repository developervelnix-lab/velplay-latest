import RulesAndRegulation from '../sidebar-components/legal-complience/RulesAndRegulation'
import RanaHeader from '../home/velplay365/RanaHeader'
import '../../assets/css/velplay365.css';

function RulesAndRegulationPage() {
  return (
    <div className="rana-layout legal-route-shell min-h-screen">
      <RanaHeader />
      <main className="legal-route-main">
        <RulesAndRegulation />
      </main>
    </div>
  )
}

export default RulesAndRegulationPage

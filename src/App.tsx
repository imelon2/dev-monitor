import { Link, Routes, Route } from 'react-router-dom'
import './App.css'
import SequencerInboxHome from './pages/Search/SequencerInbox/SequencerInboxHome'
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';


function App() {
  ModuleRegistry.registerModules([AllCommunityModule]);


  return (

    <div className="App">
      <nav>
        {/* Link 컴포넌트를 사용하여 페이지 간 이동 */}
        <Link to="/">홈</Link> |{' '}
      </nav>

      <Routes>
        <Route path="/" element={<SequencerInboxHome />} />
      </Routes>
    </div>
  )
}

export default App

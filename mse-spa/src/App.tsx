import { HashRouter, Route, Routes } from 'react-router-dom'
import { RecordingDetailsPage } from './pages/RecordingDetailsPage'
import { RecordingListPage } from './pages/RecordingListPage'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<RecordingListPage />} />
        <Route path="/recordings/:recordingId" element={<RecordingDetailsPage />} />
      </Routes>
    </HashRouter>
  )
}

export default App

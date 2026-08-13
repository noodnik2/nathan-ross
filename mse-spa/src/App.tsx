import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { RecordingDetailsPage } from './pages/RecordingDetailsPage'
import { RecordingListPage } from './pages/RecordingListPage'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<RecordingListPage />} />
        <Route path="/recordings/:recordingId" element={<RecordingDetailsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { RecordingListPage } from './pages/RecordingListPage'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<RecordingListPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

import { Routes, Route } from 'react-router-dom'
import './index.css'
import { AuthScreen } from './components/AuthScreen'
import { Dashboard } from './components/Dashboard'
import { TrainingMode } from './components/TrainingMode'
import { Changelog } from './pages/Changelog'

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthScreen />} />
      <Route path="/" element={<Dashboard />} />
      <Route path="/changelog" element={<Changelog />} />
      <Route path="/training" element={<TrainingMode />} />
    </Routes>
  )
}

export default App

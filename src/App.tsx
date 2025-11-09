import { Routes, Route } from 'react-router-dom'
import './index.css'
import { Dashboard } from './components/Dashboard'
import { TrainingMode } from './components/TrainingMode'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/training" element={<TrainingMode />} />
    </Routes>
  )
}

export default App

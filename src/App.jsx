import './App.css'
import { Routes, Route } from 'react-router-dom'
import Home from './components/Home.jsx'
import Videos from './components/Videos.jsx'
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />}/>
      <Route path="/videos" element={<Videos />}/>
    </Routes>
  )
}

export default App

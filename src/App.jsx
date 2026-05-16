import './App.css'
import { Routes, Route } from 'react-router-dom'
import Home from './components/Home.jsx'
import Videos from './components/Videos.jsx'
import Navbar from './components/Navbar.jsx'
import Preview from './components/Preview.jsx'

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/videos" element={<Videos />}/>
        <Route path="/preview/:filename" element={<Preview />} />
      </Routes>
    </div>
  )
}

export default App

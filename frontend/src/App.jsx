import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Screen1 from './pages/Screen1'; 
import Calibration from './pages/screen_3';
import GameScreen from './pages/GameScreen';

function App() {
  return (
    <Router>
      <div className="bg-black min-h-screen">
        <Routes>
          {/* Default Route: localhost:5173/ */}
          <Route path="/" element={<Screen1 />} />
          
          {/* Screen 3 Route: localhost:5173/3 */}
          <Route path="/3" element={<Calibration />} />
          
          {/* Your New Game Route! */}
          <Route path="/game" element={<GameScreen />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
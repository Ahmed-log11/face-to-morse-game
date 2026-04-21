import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Screen1 from './pages/Screen1'; 
import Calibration from './pages/screen_3';
import GameScreen from './pages/GameScreen';
import Screen2 from './pages/Screen2';
import Leaderboard from './pages/LeaderboardScreen'; 

function App() {
  return (
    <Router>
      <div className="bg-black min-h-screen">
        <Routes>

          {/* الصفحة الأولى */}
          <Route path="/" element={<Screen1 />} />

          {/* الصفحة الثانية */}
          <Route path="/instructions" element={<Screen2 />} />

          {/* الصفحة الثالثة */}
          <Route path="/3" element={<Calibration />} />

          {/* صفحة اللعبة */}
          <Route path="/game" element={<GameScreen />} />

          {/*  Leaderboard */}
          <Route path="/leaderboard" element={<Leaderboard />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
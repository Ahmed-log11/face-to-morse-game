import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome'; // Make sure the capital W matches the file!
import Calibration from './pages/screen_3';

function App() {
  return (
    <Router>
      <div className="bg-black min-h-screen">
        <Routes>
          {/* Default Route: localhost:5173/ */}
          <Route path="/" element={<Welcome />} />
          
          {/* Screen 3 Route: localhost:5173/3 */}
          <Route path="/3" element={<Calibration />} />
          
          {/* You can add Screen 4 here later like this: */}
          {/* <Route path="/4" element={<Gameplay />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
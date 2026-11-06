import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SimpleTest from './pages/SimpleTest';
import TestPage from './pages/TestPage';
import EnhancedMeetingRoom from './pages/EnhancedMeetingRoom';
import WaitingRoomDemo from './pages/WaitingRoomDemo';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SimpleTest />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/waiting-demo" element={<WaitingRoomDemo />} />
        <Route path="/meeting/:meetingId" element={<EnhancedMeetingRoom />} />
      </Routes>
    </Router>
  );
}

export default App;

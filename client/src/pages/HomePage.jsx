import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';

function HomePage() {
  const navigate = useNavigate();

  const handleNewMeeting = (meetingCode) => {
    navigate(`/meeting/${meetingCode}`);
  };

  const handleJoinMeeting = (meetingCode) => {
    navigate(`/meeting/${meetingCode}`);
  };

  return (
    <div className="app">
      <Navbar />
      <HeroSection 
        onNewMeeting={handleNewMeeting}
        onJoinMeeting={handleJoinMeeting}
      />
    </div>
  );
}

export default HomePage;

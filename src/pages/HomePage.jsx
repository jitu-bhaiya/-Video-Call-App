import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [room, setRoom] = useState('');   // null nahi, '' - warna "uncontrolled input" warning aati hai
  const navigate = useNavigate();

  const joinRoom = () => {
    const roomId = room.trim();
    if (!roomId) return;                  // khali room id par /room/null nahi jaana chahiye
    navigate(`/room/${encodeURIComponent(roomId)}`);
  };

  return (
    <div className="app">
      <input
        type="text"
        placeholder="Enter room id"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
      />
      <button onClick={joinRoom}>Join</button>
    </div>
  );
};

export default HomePage;

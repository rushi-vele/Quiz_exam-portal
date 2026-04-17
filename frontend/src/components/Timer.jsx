import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const Timer = ({ duration, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLow = timeLeft < 300; // Less than 5 mins

  return (
    <div className={`timer-display glass ${isLow ? 'timer-low' : ''}`}>
      <Clock size={20} />
      <span className="time-text">{formatTime(timeLeft)}</span>
    </div>
  );
};

export default Timer;

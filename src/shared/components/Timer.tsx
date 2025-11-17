import React, { useState, useEffect } from 'react';

interface TimerProps {
  initialMinutes: number;
  isDark: boolean;
  onTimeUp?: () => void;
}

const Timer: React.FC<TimerProps> = ({ initialMinutes, isDark, onTimeUp }) => {
  const [remainingSeconds, setRemainingSeconds] = useState(initialMinutes * 60);

  useEffect(() => {
    setRemainingSeconds(initialMinutes * 60);
  }, [initialMinutes]);

  useEffect(() => {
    if (remainingSeconds <= 0) {
      if (onTimeUp) {
        onTimeUp();
      }
      return;
    }

    const timerId = setInterval(() => {
      setRemainingSeconds(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [remainingSeconds, onTimeUp]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  
  const percentage = (remainingSeconds / (initialMinutes * 60)) * 100;
  
  let progressColor;
  if (percentage > 50) {
    progressColor = 'bg-green-500';
  } else if (percentage > 20) {
    progressColor = 'bg-yellow-500';
  } else {
    progressColor = 'bg-red-500';
  }

  const timerClasses = `
    flex items-center space-x-2 p-2 rounded-xl shadow-lg transition-all duration-300
    ${isDark 
      ? 'bg-slate-800/80 backdrop-blur-sm border border-slate-600' 
      : 'bg-white/80 backdrop-blur-sm border border-gray-200'
    }
  `;

  return (
    <div className={timerClasses}>
      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <div className="w-24">
        <div className="text-center font-mono font-semibold text-sm">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <div className={`w-full rounded-full h-1 mt-1 ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>
          <div 
            className={`h-1 rounded-full ${progressColor} transition-all duration-1000`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Timer;

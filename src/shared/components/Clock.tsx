import React, { useState, useEffect } from 'react';

interface ClockProps {
  isDark: boolean;
}

const Clock: React.FC<ClockProps> = ({ isDark }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const clockClasses = `
    flex items-center space-x-2 text-sm font-medium
    ${isDark ? 'text-gray-300' : 'text-gray-600'}
  `;

  return (
    <div className={clockClasses}>
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{formatTime(time)}</span>
    </div>
  );
};

export default Clock;

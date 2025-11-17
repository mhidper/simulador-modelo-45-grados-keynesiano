import React from 'react';

interface UsageTimerProps {
  remainingSecondsProp: number;
  isDark: boolean;
}

/**
 * Componente que muestra el tiempo de uso restante en formato visual
 * - Muestra horas:minutos:segundos
 * - Barra de progreso con colores según el tiempo restante
 * - No tiene lógica de conteo propia, solo muestra el valor recibido
 */
const UsageTimer: React.FC<UsageTimerProps> = ({ remainingSecondsProp, isDark }) => {
  const remainingSeconds = Math.max(0, remainingSecondsProp); // Evitar valores negativos
  
  // Calcular horas, minutos y segundos
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = Math.floor(remainingSeconds % 60);
  
  // Calcular porcentaje restante
  const totalSeconds = 2 * 60 * 60; // 2 horas = 7200 segundos
  const percentage = Math.min(100, Math.max(0, (remainingSeconds / totalSeconds) * 100));
  
  // Determinar color según porcentaje restante
  let progressColor;
  let textColorClass;
  
  if (percentage > 50) {
    progressColor = isDark ? 'bg-green-400' : 'bg-green-500';
    textColorClass = isDark ? 'text-green-400' : 'text-green-600';
  } else if (percentage > 20) {
    progressColor = isDark ? 'bg-yellow-400' : 'bg-yellow-500';
    textColorClass = isDark ? 'text-yellow-400' : 'text-yellow-600';
  } else {
    progressColor = isDark ? 'bg-red-400' : 'bg-red-500';
    textColorClass = isDark ? 'text-red-400' : 'text-red-600';
  }

  const timerContainerClasses = `
    p-3 rounded-xl transition-all duration-300 shadow-lg
    ${isDark 
      ? 'bg-slate-800/80 backdrop-blur-sm border border-slate-600' 
      : 'bg-white/80 backdrop-blur-sm border border-gray-200'
    }
  `;

  return (
    <div className={timerContainerClasses} title="Tiempo de uso semanal restante (se resetea los lunes a las 00:00)">
      <div className="flex items-center space-x-2">
        {/* Icono de reloj */}
        <svg 
          className={`w-5 h-5 ${textColorClass}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        
        {/* Display del tiempo y barra de progreso */}
        <div className="w-28">
          {/* Tiempo en formato HH:MM:SS */}
          <div className={`text-center font-mono font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          
          {/* Barra de progreso */}
          <div className={`w-full rounded-full h-1.5 mt-1 ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>
            <div 
              className={`h-1.5 rounded-full ${progressColor} transition-all duration-300 ease-out`} 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          
          {/* Texto del porcentaje (opcional, puede descomentar si lo deseas) */}
          {/* <div className={`text-xs text-center mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {percentage.toFixed(0)}%
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default UsageTimer;

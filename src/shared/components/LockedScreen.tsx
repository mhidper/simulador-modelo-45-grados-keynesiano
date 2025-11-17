import React, { useState, useEffect } from 'react';

interface LockedScreenProps {
  isDark: boolean;
  nextResetDate: Date;
}

/**
 * Pantalla que se muestra cuando el usuario ha agotado sus 2 horas semanales
 * Muestra un contador en tiempo real hasta el próximo lunes a las 00:00
 */
const LockedScreen: React.FC<LockedScreenProps> = ({ isDark, nextResetDate }) => {
  const [timeUntilReset, setTimeUntilReset] = useState<string>('');

  // Actualizar el countdown cada segundo
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = nextResetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeUntilReset('¡Ya puedes entrar de nuevo!');
        // Recargar la página para que el hook detecte la nueva semana
        setTimeout(() => window.location.reload(), 2000);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      let countdown = '';
      if (days > 0) {
        countdown += `${days} día${days > 1 ? 's' : ''} `;
      }
      countdown += `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      
      setTimeUntilReset(countdown);
    };

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);

    return () => clearInterval(intervalId);
  }, [nextResetDate]);

  const containerClasses = `
    flex items-center justify-center min-h-screen p-4
    ${isDark ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white' : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-gray-900'}
  `;

  const cardClasses = `
    p-8 rounded-2xl shadow-2xl w-full max-w-lg text-center
    ${isDark ? 'bg-slate-800/80 backdrop-blur-sm border border-slate-600' : 'bg-white/80 backdrop-blur-sm border border-blue-200'}
  `;

  const formattedDate = nextResetDate.toLocaleString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={containerClasses}>
      <div className={cardClasses}>
        {/* Icono animado */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-xl animate-pulse">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        {/* Título */}
        <h2 className="text-3xl font-extrabold text-center mb-3 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
          Tiempo de Uso Agotado
        </h2>
        
        {/* Descripción */}
        <p className={`text-center mb-6 text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Has utilizado tus <strong>2 horas semanales</strong> disponibles.
        </p>

        {/* Contador en tiempo real */}
        <div className={`p-6 rounded-xl mb-6 ${isDark ? 'bg-slate-700/50' : 'bg-blue-50'}`}>
          <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Tiempo restante hasta el reset:
          </p>
          <div className={`text-4xl font-bold font-mono ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            {timeUntilReset}
          </div>
        </div>

        {/* Información del próximo reset */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-700/30' : 'bg-blue-100/50'}`}>
          <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Se desbloqueará el:
          </p>
          <p className={`text-base font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            {formattedDate}
          </p>
        </div>

        {/* Mensaje informativo */}
        <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-amber-900/20 border border-amber-700/30' : 'bg-amber-50 border border-amber-200'}`}>
          <div className="flex items-start space-x-2">
            <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className={`text-sm text-left ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
              <strong>Recordatorio:</strong> El contador se resetea automáticamente cada <strong>lunes a las 00:00</strong> horas, otorgándote 2 nuevas horas de uso.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className={`mt-6 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          Esta medida asegura un acceso equitativo para todos los estudiantes.
        </p>
      </div>
    </div>
  );
};

export default LockedScreen;

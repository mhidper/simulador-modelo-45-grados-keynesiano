import { useState, useEffect, useCallback, useRef } from 'react';

const USAGE_LIMIT_SECONDS = 2 * 60 * 60; // 2 horas en segundos
const UPDATE_INTERVAL_MS = 1000; // Actualizar uso cada 1 segundo
const SAVE_TO_STORAGE_INTERVAL = 5000; // Guardar en localStorage cada 5 segundos

/**
 * Obtiene el inicio de la semana actual (lunes a las 00:00)
 */
const getStartOfWeek = (): Date => {
  const now = new Date();
  const day = now.getDay(); // Sunday - 0, Monday - 1, ...
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Ajustar si es domingo
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

/**
 * Obtiene el próximo lunes a las 00:00
 */
const getNextMonday = (): Date => {
  const startOfWeek = getStartOfWeek();
  const nextMonday = new Date(startOfWeek);
  nextMonday.setDate(startOfWeek.getDate() + 7);
  return nextMonday;
};

/**
 * Hook personalizado para rastrear el uso semanal de la aplicación
 * - Permite 2 horas de uso por semana
 * - Se resetea cada lunes a las 00:00
 * - Persiste el tiempo usado entre sesiones
 * - Solo cuenta tiempo cuando la pestaña está activa
 */
export const useUsageTracker = () => {
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<number>(USAGE_LIMIT_SECONDS);
  const [nextResetDate, setNextResetDate] = useState<Date>(getNextMonday());
  const [usageSeconds, setUsageSeconds] = useState<number>(0);

  // --- SOLUCIÓN: Refs para persistir valores entre renders ---
  const lastSaveTimeRef = useRef<number>(Date.now());
  const usageSecondsRef = useRef<number>(0);
  // ---------------------------------------------------------

  /**
   * Verifica si estamos en una nueva semana y resetea el uso si es necesario
   */
  const checkAndResetWeek = useCallback((): number => {
    const storedWeekStartStr = localStorage.getItem('weekStartDate');
    const currentWeekStart = getStartOfWeek();
    
    let usage = 0;

    if (storedWeekStartStr) {
      const storedWeekStart = new Date(storedWeekStartStr);
      
      // Verificar si estamos en la misma semana
      if (currentWeekStart.getTime() === storedWeekStart.getTime()) {
        // Misma semana, cargar uso actual
        usage = parseInt(localStorage.getItem('weeklyUsage') || '0', 10);
      } else {
        // Nueva semana, resetear uso
        console.log('🔄 Nueva semana detectada - Reseteando contador a 2 horas');
        localStorage.setItem('weeklyUsage', '0');
        localStorage.setItem('weekStartDate', currentWeekStart.toISOString());
        usage = 0;
      }
    } else {
      // Primera vez usando la aplicación
      console.log('🆕 Primera vez - Inicializando contador en 2 horas');
      localStorage.setItem('weeklyUsage', '0');
      localStorage.setItem('weekStartDate', currentWeekStart.toISOString());
      usage = 0;
    }

    return usage;
  }, []);

  /**
   * Guarda el uso actual en localStorage
   */
  const saveToStorage = useCallback((currentUsage: number) => {
    localStorage.setItem('weeklyUsage', currentUsage.toString());
  }, []);

  /**
   * Inicializa el estado del tracker
   */
  const initializeTracker = useCallback(() => {
    const usage = checkAndResetWeek();
    const currentRemaining = USAGE_LIMIT_SECONDS - usage;
    
    setUsageSeconds(usage);
    usageSecondsRef.current = usage; // Sincronizar el Ref
    setRemainingTime(currentRemaining);
    setNextResetDate(getNextMonday());
    setIsLocked(currentRemaining <= 0);

    if (currentRemaining <= 0) {
      console.log('🔒 Tiempo agotado - Bloqueando acceso');
    } else {
      const hours = Math.floor(currentRemaining / 3600);
      const minutes = Math.floor((currentRemaining % 3600) / 60);
      console.log(`⏱️ Tiempo restante: ${hours}h ${minutes}m`);
    }
  }, [checkAndResetWeek]);

  // Inicializar al montar el componente
  useEffect(() => {
    initializeTracker();
  }, [initializeTracker]);

  // Timer principal que cuenta cada segundo
  useEffect(() => {
    if (isLocked) return;

    // Reiniciar el tiempo de guardado solo cuando el timer *empieza*
    lastSaveTimeRef.current = Date.now();

    const intervalId = setInterval(() => {
      // Solo contar tiempo si la pestaña está activa
      if (document.hasFocus()) {
        
        // Actualizamos el estado usando la forma de "callback"
        // Esto nos da el valor previo sin necesitarlo como dependencia
        setUsageSeconds(prev => {
          const newUsage = prev + 1;
          usageSecondsRef.current = newUsage; // Mantener Ref sincronizado
          const newRemaining = USAGE_LIMIT_SECONDS - newUsage;
          
          setRemainingTime(newRemaining);

          // Guardar en localStorage cada 5 segundos (usando el Ref)
          const now = Date.now();
          if (now - lastSaveTimeRef.current >= SAVE_TO_STORAGE_INTERVAL) {
            saveToStorage(newUsage);
            lastSaveTimeRef.current = now; // Actualizar el Ref de tiempo
            console.log(`💾 Progreso guardado: ${newUsage}s`);
          }

          // Verificar si se agotó el tiempo
          if (newRemaining <= 0) {
            setIsLocked(true);
            saveToStorage(newUsage); // Guardado final
            console.log('🔒 Tiempo agotado - Bloqueando acceso');
            clearInterval(intervalId); // Limpiar aquí mismo
          }

          return newUsage;
        });
      }
    }, UPDATE_INTERVAL_MS);

    // Guardar al desmontar el componente (cuando el usuario cierra la pestaña)
    return () => {
      clearInterval(intervalId);
      // Usar el Ref al guardar (siempre tiene el valor más actual)
      saveToStorage(usageSecondsRef.current);
      console.log(`👋 Pestaña cerrada - Progreso guardado: ${usageSecondsRef.current}s`);
    };
  // Quitar usageSeconds del array de dependencias para evitar reinicios
  }, [isLocked, saveToStorage]); 

  // Verificar reset de semana al recuperar el foco
  useEffect(() => {
    const handleFocus = () => {
      console.log('👀 Pestaña recuperó el foco - Verificando semana');
      initializeTracker();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [initializeTracker]);

  // Verificar si es lunes a las 00:00 cada minuto
  useEffect(() => {
    const checkMondayReset = setInterval(() => {
      const now = new Date();
      const startOfWeek = getStartOfWeek();
      
      // Si estamos en lunes y es 00:00, resetear
      if (now.getDay() === 1 && now.getHours() === 0 && now.getMinutes() === 0) {
        const storedWeekStartStr = localStorage.getItem('weekStartDate');
        if (storedWeekStartStr) {
          const storedWeekStart = new Date(storedWeekStartStr);
          if (storedWeekStart.getTime() < startOfWeek.getTime()) {
            console.log('🔄 Lunes 00:00 - Reseteando automáticamente');
            initializeTracker();
          }
        }
      }
    }, 60000); // Verificar cada minuto

    return () => clearInterval(checkMondayReset);
  }, [initializeTracker]);

  return { 
    isLocked, 
    remainingTime, 
    nextResetDate,
    usageSeconds,
    totalAllowedSeconds: USAGE_LIMIT_SECONDS
  };
};

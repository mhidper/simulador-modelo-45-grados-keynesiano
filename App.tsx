import React, { useState, useEffect, useMemo, useCallback, useRef, createContext, useContext } from 'react';
import type { EconomicParams, ChartData } from './types';
import { generateExplanation } from './services/geminiService';
import Controls from './components/Controls';
import KeynesianCrossChart from './components/KeynesianCrossChart';
import Explanation from './components/Explanation';
import { calculateEquilibrium, getChangedParam } from './services/utils';

const initialParams: EconomicParams = {
  c0: 180,
  c1: 0.8,
  I: 160,
  G: 160,
  T: 120,
};

// Theme Context
interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {}
});

export const useTheme = () => useContext(ThemeContext);

const App: React.FC = () => {
  const [params, setParams] = useState<EconomicParams>(initialParams);
  const [baselineParams, setBaselineParams] = useState<EconomicParams | null>(null);
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isDark, setIsDark] = useState<boolean>(false);
  
  const isInitialMount = useRef(true);
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => !prev);
  }, []);

  const equilibriumY = useMemo(() => calculateEquilibrium(params), [params]);
  const baselineEquilibriumY = useMemo(() => baselineParams ? calculateEquilibrium(baselineParams) : null, [baselineParams]);

  const handleParamStart = useCallback(() => {
    if (!isDragging) {
      setBaselineParams(params);
      setIsDragging(true);
    }
  }, [params, isDragging]);

  const handleParamChange = useCallback((param: keyof EconomicParams, value: number) => {
    setParams(prev => ({ ...prev, [param]: value }));
    
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }
    
    dragTimeoutRef.current = setTimeout(() => {
      setIsDragging(false);
    }, 500);
  }, []);

  useEffect(() => {
    const fetchExplanation = async () => {
      if (isInitialMount.current) {
        const initialExplanation = `
### ¡Bienvenido al Simulador del Modelo de 45 Grados Keynesiano!

Este modelo ilustra cómo se determina el equilibrio en el mercado de bienes.

- La **línea de 45 grados** muestra todos los puntos donde la producción total (Y) es igual a la demanda total (Z).
- La **línea de Demanda (ZZ)** muestra la demanda total de bienes y servicios para cada nivel de renta. Se calcula como **Z = C + I + G**.
- La función de consumo es **C = c₀ + c₁ * (Y - T)**.

La economía está en **equilibrio** donde la línea ZZ se cruza con la línea de 45 grados. En este punto, la producción es exactamente igual a la demanda.

**¡Usa los controles de la izquierda para cambiar los parámetros económicos y ver qué sucede!** El gráfico se actualizará instantáneamente y este panel proporcionará una explicación paso a paso de las consecuencias económicas.
        `;
        setExplanation(initialExplanation.trim());
        setIsLoading(false);
        isInitialMount.current = false;
        return;
      }
      
      if (isDragging || !baselineParams) return;
      
      setIsLoading(true);
      const changedParam = getChangedParam(baselineParams, params);

      if (changedParam) {
        try {
          const result = await generateExplanation(baselineParams, params, changedParam, baselineEquilibriumY!, equilibriumY);
          setExplanation(result);
        } catch (error) {
          console.error(error);
          setExplanation('Hubo un error al obtener la explicación de la API de Gemini.');
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    
    const timer = setTimeout(() => {
        fetchExplanation();
    }, 500);

    return () => clearTimeout(timer);
  }, [params, isDragging, baselineParams, baselineEquilibriumY, equilibriumY]);

  useEffect(() => {
    return () => {
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
    };
  }, []);

  const autonomousSpending = useMemo(() => {
    return params.c0 + params.I + params.G - params.c1 * params.T;
  }, [params]);

  const chartData: ChartData[] = useMemo(() => {
    const maxVal = Math.max(equilibriumY, baselineEquilibriumY || 0) * 1.5;
    const data: ChartData[] = [];
    for (let y = 0; y <= maxVal; y += maxVal / 50) {
      data.push({
        y_val: y,
        z_line: autonomousSpending + params.c1 * y,
        forty_five_line: y,
        z_prime_line: baselineParams ? (baselineParams.c0 + baselineParams.I + baselineParams.G - baselineParams.c1 * baselineParams.T) + baselineParams.c1 * y : null
      });
    }
    return data;
  }, [equilibriumY, baselineEquilibriumY, autonomousSpending, params, baselineParams]);

  const themeClasses = isDark 
    ? "min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white transition-all duration-500 ease-in-out"
    : "min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-gray-900 transition-all duration-500 ease-in-out";

  const headerClasses = isDark
    ? "bg-gradient-to-r from-slate-800 to-gray-800 shadow-2xl border-b border-slate-600"
    : "bg-gradient-to-r from-white to-blue-50 shadow-xl border-b border-blue-100";

  const cardClasses = isDark
    ? "bg-gradient-to-br from-slate-800 to-gray-800 border border-slate-600 shadow-2xl"
    : "bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl";

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <div className={themeClasses}>
        <header className={headerClasses}>
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">K</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Simulador del Modelo de 45 Grados Keynesiano
                  </h1>
                  <p className={`mt-1 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Un Modelo Interactivo del Mercado de Bienes
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {isDragging && (
                  <div className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 backdrop-blur-sm rounded-full border border-blue-300/30 animate-pulse">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <span className="text-sm text-blue-600 font-medium">
                      Ajustando parámetros...
                    </span>
                  </div>
                )}
                
                <button
                  onClick={toggleTheme}
                  className={`
                    p-3 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95
                    ${isDark 
                      ? 'bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/30' 
                      : 'bg-slate-800/10 hover:bg-slate-800/20 border border-slate-300/30'
                    }
                  `}
                  title={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
                >
                  {isDark ? (
                    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-grow container mx-auto p-6 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className={`lg:col-span-1 ${cardClasses} p-6 rounded-2xl h-fit transform transition-all duration-300 hover:shadow-2xl`}>
              <Controls 
                params={params} 
                onParamChange={handleParamChange}
                onParamStart={handleParamStart}
              />
            </div>
            
            <div className={`lg:col-span-2 ${cardClasses} p-6 rounded-2xl transform transition-all duration-300 hover:shadow-2xl`}>
               <KeynesianCrossChart
                  data={chartData}
                  equilibriumY={equilibriumY}
                  previousEquilibriumY={baselineEquilibriumY}
                  autonomousSpending={autonomousSpending}
                />
            </div>
          </div>
          
          <div className={`${cardClasses} p-6 rounded-2xl transform transition-all duration-300 hover:shadow-2xl`}>
            <Explanation explanation={explanation} isLoading={isLoading} />
          </div>
        </main>
        
        {/* Footer con créditos */}
        <footer className={`mt-12 border-t transition-all duration-300 ${
          isDark ? 'border-slate-600' : 'border-gray-200'
        }`}>
          <div className="container mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <div className={`flex items-center space-x-3 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white text-sm font-bold">©</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Diseñado por</span>
                  <span className={`ml-1 font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
                    Manuel Alej. Hidalgo Pérez
                  </span>
                </div>
              </div>
              
              <div className={`flex items-center space-x-4 text-xs ${
                isDark ? 'text-gray-500' : 'text-gray-500'
              }`}>
                <span>Simulador Educativo</span>
                <span>•</span>
                <span>Modelo de 45 Grados Keynesiano</span>
                <span>•</span>
                <span>© {new Date().getFullYear()}</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ThemeContext.Provider>
  );
};

export default App;
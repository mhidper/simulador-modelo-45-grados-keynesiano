import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import ISLMChart from './components/ISLMChart';
import ISLMControls from './components/ISLMControls';
import type { ISLMParams, ISLMChartData, ISLMEquilibrium } from '../../shared/types';
import { generateISLMChartData } from './services/islmService';
import { calculateISLMEquilibrium } from './services/calculations';
import { generateISLMExplanation } from './services/geminiService';
import { getChangedParam } from './services/utils';
import { useTheme } from '../../shared/contexts/ThemeContext';

const initialParams: ISLMParams = {
  c0: 100,
  c1: 0.6,
  I0: 80,
  d1: 0.1,
  d2: 40,
  G: 150,
  T: 100,
  t: 0.2,
  useLumpSumTax: true,
  iBar: 3.0
};

const ISLMModel: React.FC = () => {
  const { isDark } = useTheme();
  
  const [params, setParams] = useState<ISLMParams>(initialParams);
  const [baselineParams, setBaselineParams] = useState<ISLMParams | null>(null);
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  const isInitialMount = useRef(true);
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calcular equilibrios usando useMemo (como en el modelo de 45 grados)
  const equilibrium = useMemo(() => calculateISLMEquilibrium(params), [params]);
  const baselineEquilibrium = useMemo(() => 
    baselineParams ? calculateISLMEquilibrium(baselineParams) : null, 
    [baselineParams]
  );

  // Manejar inicio de cambio de parámetro
  const handleParamStart = useCallback(() => {
    if (!isDragging) {
      setBaselineParams(params);
      setIsDragging(true);
    }
  }, [params, isDragging]);

  // Manejar cambio de parámetro
 // Manejar cambio de parámetro
  const handleParamChange = useCallback((param: keyof ISLMParams, value: number) => {
    
    // NUEVA LÓGICA:
    // Si estamos cambiando un parámetro sin estar "arrastrando" (isDragging = false)
    // y no hay un 'baseline' establecido, significa que este es el
    // primer cambio. Por lo tanto, guardamos el estado ACTUAL ('params')
    // como el 'baseline' ANTES de actualizar 'params'.
    setBaselineParams(currentBaseline => {
      if (!currentBaseline && !isDragging) {
        return params; // 'params' es el estado pre-cambio
      }
      return currentBaseline; // Mantener el baseline si ya existía
    });

    // Lógica original: actualizar el estado 'params'
    setParams(prev => ({ ...prev, [param]: value }));
    
    // Lógica original del timeout
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }
    
    dragTimeoutRef.current = setTimeout(() => {
      setIsDragging(false);
    }, 500);
  }, [params, isDragging]); 
  // Resetear a valores iniciales
  const handleReset = () => {
    setBaselineParams(null);
    setParams(initialParams);
    setExplanation('');
    setIsDragging(false);
    isInitialMount.current = true;
  };

  // useEffect para generar explicación (EXACTAMENTE como en 45 grados)
  useEffect(() => {
    const fetchExplanation = async () => {
      if (isInitialMount.current) {
        const initialExplanation = `### 🎯 Bienvenido al Modelo IS-LM

El modelo IS-LM muestra el equilibrio simultáneo en dos mercados fundamentales de la economía:

**Mercado de Bienes (Curva IS):** Relaciona la producción nacional con el tipo de interés. Cuando el tipo de interés baja, la inversión aumenta, lo que incrementa la demanda agregada y la producción.

**Mercado Monetario (Curva LM):** En este modelo, el Banco Central Europeo (BCE) fija directamente el tipo de interés objetivo (${params.iBar.toFixed(2)}%). Por eso la curva LM es horizontal: el BCE mantiene el tipo fijo independientemente del nivel de producción.

**Equilibrio Actual:**
- Producción: ${equilibrium.Y.toFixed(0)} millones €
- Tipo de interés: ${equilibrium.i.toFixed(2)}%
- Consumo: ${equilibrium.C.toFixed(0)} millones €
- Inversión: ${equilibrium.I.toFixed(0)} millones €

**Explora cómo los cambios en la política fiscal (G, T) o monetaria (tipo de interés) afectan al equilibrio de la economía.**`;
        
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
          const result = await generateISLMExplanation(
            baselineParams,
            params,
            changedParam,
            baselineEquilibrium!,
            equilibrium
          );
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
  }, [params, isDragging, baselineParams, baselineEquilibrium, equilibrium]);

  useEffect(() => {
    return () => {
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
    };
  }, []);

  // Generar datos del gráfico
  const maxY = useMemo(() => {
    return Math.max(equilibrium.Y, baselineEquilibrium?.Y || 0) * 1.5;
  }, [equilibrium.Y, baselineEquilibrium]);

  const chartData: ISLMChartData = useMemo(() => {
    const current = generateISLMChartData(params, 0, maxY);
    
    if (baselineParams) {
      const baseline = generateISLMChartData(baselineParams, 0, maxY);
      return {
        ...current,
        previousIsCurve: baseline.isCurve,
        previousLmCurve: baseline.lmCurve,
        previousEquilibrium: baseline.equilibrium
      };
    }
    
    return current;
  }, [params, baselineParams, maxY]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className={`mb-8 p-6 rounded-xl transition-all duration-300 ${
          isDark 
            ? 'bg-gradient-to-r from-blue-900 to-purple-900 border border-blue-700' 
            : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'
        }`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-4xl">⚖️</span>
                <h1 className={`text-3xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Modelo IS-LM
                </h1>
              </div>
              <p className={`text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Equilibrio simultáneo en los mercados de bienes (IS) y monetario (LM)
              </p>
            </div>
            
            <button
              onClick={handleReset}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg ${
                isDark
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white'
              }`}
            >
              🔄 Resetear
            </button>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controles */}
          <div className="lg:col-span-1">
            <div className={`p-6 rounded-xl transition-all duration-300 sticky top-4 ${
              isDark 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
            }`}>
              <div className="flex items-center space-x-2 mb-6">
                <span className="text-2xl">🎛️</span>
                <h2 className={`text-xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Controles
                </h2>
              </div>
              
              <ISLMControls
                params={params}
                onParamChange={handleParamChange}
                onParamStart={handleParamStart}
              />
            </div>
          </div>

          {/* Gráfico */}
          <div className="lg:col-span-2">
            <div className={`p-6 rounded-xl transition-all duration-300 ${
              isDark 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
            }`}>
              <div className="flex items-center space-x-2 mb-6">
                <span className="text-2xl">📈</span>
                <h2 className={`text-xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Gráfico IS-LM
                </h2>
              </div>
              
              <ISLMChart
                chartData={chartData}
                previousEquilibrium={baselineEquilibrium ? {
                  Y: baselineEquilibrium.Y,
                  i: baselineEquilibrium.i
                } : null}
              />
            </div>

            {/* Ecuaciones del modelo */}
            <div className={`mt-6 p-6 rounded-xl transition-all duration-300 ${
              isDark 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
            }`}>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">📐</span>
                <h2 className={`text-xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Ecuaciones del Modelo
                </h2>
              </div>
              
              <div className={`space-y-3 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                  <p className="font-semibold mb-1">Curva IS (Mercado de Bienes):</p>
                  <p className="font-mono text-sm">
                    Y = C(Y-T) + I(Y,i) + G
                  </p>
                  <p className="font-mono text-sm mt-1">
                    C = {params.c0.toFixed(0)} + {params.c1.toFixed(2)}(Y - {params.T.toFixed(0)})
                  </p>
                  <p className="font-mono text-sm">
                    I = {params.I0.toFixed(0)} + {params.d1.toFixed(2)}Y - {params.d2.toFixed(0)}i
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/20">
                  <p className="font-semibold mb-1">Curva LM (Mercado Monetario):</p>
                  <p className="font-mono text-sm">
                    i = {params.iBar.toFixed(2)}% (fijado por el BCE)
                  </p>
                  <p className="text-xs mt-2 opacity-75">
                    El banco central fija el tipo de interés objetivo (LM horizontal)
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20">
                  <p className="font-semibold mb-1">Equilibrio:</p>
                  <p className="font-mono text-sm">
                    Y* = {equilibrium.Y.toFixed(0)}
                  </p>
                  <p className="font-mono text-sm">
                    i* = {equilibrium.i.toFixed(2)}%
                  </p>
                  <p className="font-mono text-sm">
                    C* = {equilibrium.C.toFixed(0)}
                  </p>
                  <p className="font-mono text-sm">
                    I* = {equilibrium.I.toFixed(0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Panel de explicación con IA */}
            <div className={`mt-6 p-6 rounded-xl transition-all duration-300 ${
              isDark 
                ? 'bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-600/50' 
                : 'bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200'
            }`}>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">🤖</span>
                <h2 className={`text-xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Análisis del Cambio
                </h2>
              </div>
              
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {isLoading ? (
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
                    <p className="italic">Generando explicación...</p>
                  </div>
                ) : explanation ? (
                  <div className="leading-relaxed whitespace-pre-line">{explanation}</div>
                ) : (
                  <p className="italic opacity-75">Mueve un parámetro para ver la explicación</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ISLMModel;

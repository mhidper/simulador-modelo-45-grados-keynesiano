import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { EconomicParams, ChartData } from '../../../shared/types';
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

interface KeynesianCrossModelProps {
  isDark: boolean;
  onBack: () => void;
}

const KeynesianCrossModel: React.FC<KeynesianCrossModelProps> = ({ isDark, onBack }) => {
  const [params, setParams] = useState<EconomicParams>(initialParams);
  const [baselineParams, setBaselineParams] = useState<EconomicParams | null>(null);
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  const isInitialMount = useRef(true);
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const cardClasses = isDark
    ? "bg-gradient-to-br from-slate-800 to-gray-800 border border-slate-600 shadow-2xl"
    : "bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl";

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header con botón de regreso */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
            isDark 
              ? 'bg-slate-700 hover:bg-slate-600 text-white' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Volver al Menú</span>
        </button>
        
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Modelo de 45 Grados Keynesiano
          </h1>
          <p className={`mt-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Equilibrio en el Mercado de Bienes
          </p>
        </div>
        
        <div className="w-32"> {/* Spacer para centrar el título */}
          {isDragging && (
            <div className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 backdrop-blur-sm rounded-full border border-blue-300/30 animate-pulse">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <span className="text-sm text-blue-600 font-medium">
                Ajustando...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Contenido principal */}
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
    </div>
  );
};

export default KeynesianCrossModel;

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { EconomicParams, ChartData } from '../../../shared/types';
import { generateExplanation } from './services/geminiService';
import Controls from './components/Controls';
import KeynesianCrossChart from './components/KeynesianCrossChart';
import Explanation from './components/Explanation';
import { calculateEquilibrium, getChangedParam, needsBaselineReset, syncInvestmentParameters } from './services/utils';

const initialParams: EconomicParams = {
  c0: 180,
  c1: 0.8,
  I: 160,
  G: 160,
  T: 120,
  t: 0.25, // 25% tax rate
  useLumpSumTax: true, // Start with traditional model
  
  // Investment function parameters
  b0: 120, // Autonomous investment
  b1: 0.15, // Investment sensitivity to income
  b2: 1000, // Investment sensitivity to interest rate
  i: 0.05, // 5% interest rate
  useSimpleInvestment: true, // Start with simple investment
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
    
    // If we're changing a parameter after switching tax models,
    // reset baseline to show the effect properly
    if (baselineParams && needsBaselineReset(baselineParams, params)) {
      setBaselineParams(params);
    }
    
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }
    
    dragTimeoutRef.current = setTimeout(() => {
      setIsDragging(false);
    }, 500);
  }, [params, baselineParams]);

  const handleToggleChange = useCallback((param: keyof EconomicParams, value: boolean) => {
    const oldParams = { ...params };
    const newParams = { ...params, [param]: value };
    
    // Synchronize parameters when switching tax models
    if (param === 'useLumpSumTax') {
      if (value) {
        // Switching TO lump sum (value = true)
        // Calculate equivalent T₀ that gives similar tax burden
        const currentY = calculateEquilibrium(params);
        const equivalentT = params.t * currentY;
        newParams.T = Math.max(0, Math.min(500, equivalentT));
      } else {
        // Switching TO proportional (value = false) 
        // Calculate equivalent t that gives similar tax burden
        const currentY = calculateEquilibrium(params);
        const equivalentT = currentY > 0 ? Math.max(0.05, Math.min(0.8, params.T / currentY)) : 0.25;
        newParams.t = equivalentT;
      }
    }
    
    // Synchronize parameters when switching investment models
    if (param === 'useSimpleInvestment') {
      const syncedParams = syncInvestmentParameters(params, value);
      Object.assign(newParams, syncedParams);
    }
    
    setParams(newParams);
    // Set baseline to old params to show the effect of changing model
    setBaselineParams(oldParams);
  }, [params]);

  useEffect(() => {
    const fetchExplanation = async () => {
      if (isInitialMount.current) {
        const initialExplanation = `
### ¡Bienvenido al Simulador del Modelo de 45 Grados Keynesiano Avanzado!

Este modelo ilustra cómo se determina el equilibrio en el mercado de bienes con funciones de inversión y fiscalidad flexibles.

**Características principales:**
- La **línea de 45 grados** muestra todos los puntos donde la producción total (Y) es igual a la demanda total (Z).
- La **línea de Demanda (ZZ)** muestra la demanda total de bienes y servicios para cada nivel de renta.
- **Función de Consumo:** C = c₀ + c₁ × (Y - T) [con impuestos fijos] o C = c₀ + c₁ × (Y - tY) [con impuestos proporcionales]
- **Función de Inversión:** I = I₀ [inversión fija] o I = b₀ + b₁Y - b₂i [inversión endógena]

**Modelos disponibles:**
- **Fiscal:** Impuestos fijos (T) vs. proporcionales (tY)
- **Inversión:** Fija (I) vs. endógena (función de renta y tipo de interés)

La economía está en **equilibrio** donde la línea ZZ se cruza con la línea de 45 grados. Con inversión endógena, el multiplicador es más complejo y la economía más dinámica.

**¡Explora los diferentes modelos usando los toggles y observa cómo cambia la dinámica económica!**
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
    let investment;
    
    // Calculate investment component
    if (params.useSimpleInvestment) {
      investment = params.I;
    } else {
      // For endogenous investment, we need the autonomous part only
      // The part that depends on Y will be handled separately
      investment = params.b0 - params.b2 * params.i;
    }
    
    if (params.useLumpSumTax) {
      // Traditional model: T = T0 (lump sum)
      return params.c0 + investment + params.G - params.c1 * params.T;
    } else {
      // Extended model: T = tY (proportional taxes)
      return params.c0 + investment + params.G;
    }
  }, [params]);

  const chartData: ChartData[] = useMemo(() => {
    const maxVal = Math.max(equilibriumY, baselineEquilibriumY || 0) * 1.5;
    const data: ChartData[] = [];
    
    for (let y = 0; y <= maxVal; y += maxVal / 50) {
      let currentZ, baselineZ = null;
      
      // Current model calculation
      let marginalPropensity;
      if (params.useLumpSumTax) {
        marginalPropensity = params.c1 + (params.useSimpleInvestment ? 0 : params.b1);
        currentZ = autonomousSpending + marginalPropensity * y;
      } else {
        marginalPropensity = params.c1 * (1 - params.t) + (params.useSimpleInvestment ? 0 : params.b1);
        currentZ = autonomousSpending + marginalPropensity * y;
      }
      
      // Baseline model calculation (if exists)
      if (baselineParams) {
        let baselineAutonomous;
        let baselineInvestment;
        
        // Calculate baseline investment component
        if (baselineParams.useSimpleInvestment) {
          baselineInvestment = baselineParams.I;
        } else {
          baselineInvestment = baselineParams.b0 - baselineParams.b2 * baselineParams.i;
        }
        
        let baselineMarginalPropensity;
        if (baselineParams.useLumpSumTax) {
          baselineAutonomous = baselineParams.c0 + baselineInvestment + baselineParams.G - baselineParams.c1 * baselineParams.T;
          baselineMarginalPropensity = baselineParams.c1 + (baselineParams.useSimpleInvestment ? 0 : baselineParams.b1);
          baselineZ = baselineAutonomous + baselineMarginalPropensity * y;
        } else {
          baselineAutonomous = baselineParams.c0 + baselineInvestment + baselineParams.G;
          baselineMarginalPropensity = baselineParams.c1 * (1 - baselineParams.t) + (baselineParams.useSimpleInvestment ? 0 : baselineParams.b1);
          baselineZ = baselineAutonomous + baselineMarginalPropensity * y;
        }
      }
      
      data.push({
        y_val: y,
        z_line: currentZ,
        forty_five_line: y,
        z_prime_line: baselineZ
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
            onToggleChange={handleToggleChange}
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

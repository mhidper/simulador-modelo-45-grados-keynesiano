import React, { useState } from 'react';
import Controls from './Controls';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import type { ISLMParams } from '../../../shared/types';

/**
 * Componente de prueba para el componente Controls completo
 * Paso 7.1: Controles integrados
 */
const TestGSlider: React.FC = () => {
  const { isDark } = useTheme();
  
  // Parámetros iniciales del modelo IS-LM
  const [params, setParams] = useState<ISLMParams>({
    c0: 100,
    c1: 0.8,
    I0: 150,
    d1: 0.1,
    d2: 50,
    G: 500,
    T: 200,
    iBar: 2.5
  });

  const handleParamChange = (param: keyof ISLMParams, value: number) => {
    setParams(prev => ({
      ...prev,
      [param]: value
    }));
  };

  const handleParamStart = () => {
    // Handler para cuando se empieza a arrastrar
    console.log('Arrastrando slider...');
  };

  const fiscalBalance = params.G - params.T;
  const fiscalType = fiscalBalance > 0 ? 'Déficit' : fiscalBalance < 0 ? 'Superávit' : 'Equilibrado';
  const fiscalIcon = fiscalBalance > 0 ? '📊' : fiscalBalance < 0 ? '📉' : '⚖️';

  const monetaryType = params.iBar < 2 ? 'Muy expansiva' : params.iBar < 4 ? 'Expansiva' : params.iBar < 6 ? 'Neutral' : 'Restrictiva';
  const monetaryIcon = params.iBar < 4 ? '💹' : params.iBar < 6 ? '➡️' : '📈';

  return (
    <div className={`min-h-screen p-8 transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-gray-100'
    }`}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className={`p-6 rounded-xl ${
          isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        }`}>
          <h1 className="text-2xl font-bold mb-2">
            🧪 Prueba del Componente Controls - Paso 7.1
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Componente integrado con los 3 controles de política económica
          </p>
        </div>

        {/* Componente Controls integrado */}
        <Controls
          params={params}
          onParamChange={handleParamChange}
          onParamStart={handleParamStart}
        />

        {/* Panel de Análisis */}
        <div className={`p-6 rounded-xl ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <h2 className="text-lg font-semibold mb-4">📊 Análisis del Policy Mix:</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Análisis Fiscal */}
            <div className={`p-5 rounded-xl ${
              isDark ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-600/30' : 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200'
            }`}>
              <h3 className={`font-semibold mb-3 flex items-center ${
                isDark ? 'text-green-300' : 'text-green-700'
              }`}>
                {fiscalIcon} Balance Fiscal
              </h3>
              <div className="space-y-2 text-sm">
                <p className="font-mono">
                  <strong>G - T =</strong> {fiscalBalance}
                </p>
                <p>
                  <strong>Situación:</strong> {fiscalType}
                </p>
                <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                  {fiscalBalance > 0 
                    ? '→ Curva IS se desplaza a la derecha (expansiva)'
                    : fiscalBalance < 0
                    ? '→ Curva IS se desplaza a la izquierda (restrictiva)'
                    : '→ Sin desplazamiento de IS'
                  }
                </p>
              </div>
            </div>

            {/* Análisis Monetario */}
            <div className={`p-5 rounded-xl ${
              isDark ? 'bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border border-blue-600/30' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200'
            }`}>
              <h3 className={`font-semibold mb-3 flex items-center ${
                isDark ? 'text-blue-300' : 'text-blue-700'
              }`}>
                {monetaryIcon} Política Monetaria
              </h3>
              <div className="space-y-2 text-sm">
                <p className="font-mono">
                  <strong>ī =</strong> {params.iBar.toFixed(2)}%
                </p>
                <p>
                  <strong>Tipo:</strong> {monetaryType}
                </p>
                <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                  {params.iBar < 4 
                    ? '→ Curva LM en nivel bajo (estimula economía)'
                    : params.iBar < 6
                    ? '→ Curva LM en nivel neutro'
                    : '→ Curva LM en nivel alto (frena economía)'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Policy Mix */}
          <div className={`mt-6 p-4 rounded-xl ${
            isDark ? 'bg-purple-900/20 border border-purple-600/30' : 'bg-purple-50 border border-purple-200'
          }`}>
            <h3 className={`font-semibold mb-2 ${
              isDark ? 'text-purple-300' : 'text-purple-700'
            }`}>
              🎯 Combinación de Políticas (Policy Mix):
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {fiscalBalance > 100 && params.iBar < 4 && '🚀 Políticas muy expansivas: ↑G, ↓i → Fuerte aumento de Y*'}
              {fiscalBalance > 100 && params.iBar >= 4 && params.iBar < 6 && '📊 Política fiscal expansiva con tipo de interés neutro'}
              {fiscalBalance > 100 && params.iBar >= 6 && '⚠️ Políticas contradictorias: ↑G pero ↑i → Efectos parcialmente compensados'}
              {Math.abs(fiscalBalance) <= 100 && params.iBar < 4 && '💹 Política monetaria expansiva con presupuesto equilibrado'}
              {Math.abs(fiscalBalance) <= 100 && params.iBar >= 4 && params.iBar < 6 && '➡️ Políticas neutrales: Presupuesto equilibrado e interés neutral'}
              {Math.abs(fiscalBalance) <= 100 && params.iBar >= 6 && '📈 Política monetaria restrictiva con presupuesto equilibrado'}
              {fiscalBalance < -100 && params.iBar < 4 && '⚠️ Políticas contradictorias: ↓G pero ↓i → Efectos parcialmente compensados'}
              {fiscalBalance < -100 && params.iBar >= 4 && params.iBar < 6 && '📉 Política fiscal restrictiva con tipo de interés neutro'}
              {fiscalBalance < -100 && params.iBar >= 6 && '🔻 Políticas muy restrictivas: ↓G, ↑i → Fuerte caída de Y*'}
            </p>
          </div>
        </div>

        {/* Estado de todos los parámetros */}
        <div className={`p-6 rounded-xl ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <h2 className="text-lg font-semibold mb-4">⚙️ Estado Completo de los Parámetros:</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-sm">
            <div>
              <strong>c₀:</strong> {params.c0}
            </div>
            <div>
              <strong>c₁:</strong> {params.c1}
            </div>
            <div>
              <strong>I₀:</strong> {params.I0}
            </div>
            <div>
              <strong>d₁:</strong> {params.d1}
            </div>
            <div>
              <strong>d₂:</strong> {params.d2}
            </div>
            <div className="text-green-600 dark:text-green-400">
              <strong>G:</strong> {params.G}
            </div>
            <div className="text-orange-600 dark:text-orange-400">
              <strong>T:</strong> {params.T}
            </div>
            <div className="text-blue-600 dark:text-blue-400">
              <strong>ī:</strong> {params.iBar.toFixed(2)}%
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl ${
          isDark ? 'bg-green-900/20 border border-green-600/30 text-green-300' : 'bg-green-50 border border-green-200 text-green-700'
        }`}>
          <p className="text-sm">
            ✅ <strong>Paso 7.1 completo:</strong> El componente Controls integra los 3 sliders de forma modular y organizada. Los controles están separados por tipo de política (fiscal vs monetaria).
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestGSlider;

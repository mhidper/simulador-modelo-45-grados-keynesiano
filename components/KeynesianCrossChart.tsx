import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  ReferenceDot,
  ReferenceLine,
  ComposedChart
} from 'recharts';
import type { ChartData } from '../types';
import { useTheme } from '../App';

interface KeynesianCrossChartProps {
  data: ChartData[];
  equilibriumY: number;
  previousEquilibriumY: number | null;
  autonomousSpending: number;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  const { isDark } = useTheme();
  
  if (active && payload && payload.length) {
    return (
      <div className={`p-4 rounded-xl shadow-2xl border transition-all duration-300 backdrop-blur-sm ${
        isDark 
          ? 'bg-gray-800/90 border-slate-600 text-white' 
          : 'bg-white/90 border-gray-200 text-gray-800'
      }`}>
        <p className="font-bold mb-3 text-lg">
          📊 Renta (Y): <span className="text-blue-500 font-mono">{label.toFixed(0)}</span>
        </p>
        {payload.map((pld: any, index: number) => (
          pld.value && (
            <p key={index} style={{ color: pld.color }} className="text-sm font-medium flex items-center space-x-2 mb-1">
              <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: pld.color }}></span>
              <span>{`${pld.name}: ${pld.value.toFixed(0)}`}</span>
            </p>
          )
        ))}
      </div>
    );
  }

  return null;
};

const KeynesianCrossChart: React.FC<KeynesianCrossChartProps> = ({ 
  data, 
  equilibriumY, 
  previousEquilibriumY, 
  autonomousSpending 
}) => {
  const { isDark } = useTheme();
  const hasTransition = previousEquilibriumY !== null;
  const maxY = Math.max(equilibriumY, previousEquilibriumY || 0);
  const change = hasTransition ? equilibriumY - (previousEquilibriumY || 0) : 0;
  const isIncrease = change > 0;
  
  const gridColor = isDark ? '#374151' : '#f0f0f0';
  const axisColor = isDark ? '#9ca3af' : '#666';
  const textColor = isDark ? '#e5e7eb' : '#374151';
  
  const maxDomain = Math.max(maxY * 1.3, 1200);
  const titleClasses = isDark ? 'text-white' : 'text-gray-800';
  
  const getStatusClasses = () => {
    if (!hasTransition) {
      return isDark 
        ? 'bg-slate-700/50 border-slate-600 text-gray-300'
        : 'bg-blue-50/50 border-blue-200 text-blue-700';
    }
    
    if (isDark) {
      return isIncrease 
        ? 'bg-gradient-to-r from-green-600/30 to-emerald-600/30 border-green-400/40 text-green-100' 
        : 'bg-gradient-to-r from-red-600/30 to-rose-600/30 border-red-400/40 text-red-100';
    } else {
      return isIncrease 
        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-green-800' 
        : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300 text-red-800';
    }
  };
  
  return (
    <div className="w-full flex flex-col">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-lg">📈</span>
          </div>
          <h2 className={`text-2xl font-bold ${titleClasses}`}>
            Equilibrio del Mercado de Bienes
          </h2>
        </div>
        
        {hasTransition && (
          <div className={`inline-flex items-center space-x-4 p-4 rounded-xl border-2 transition-all duration-500 ${getStatusClasses()}`}>
            <span className="text-2xl">
              {isIncrease ? '🚀' : '📉'}
            </span>
            <div className="text-center">
              <div className="font-bold text-lg">
                {isIncrease ? 'Expansión Económica' : 'Contracción Económica'}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <span className="font-mono text-lg">
                  {previousEquilibriumY?.toFixed(0)}
                </span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="font-mono text-lg">
                  {equilibriumY.toFixed(0)}
                </span>
                <span className={`font-bold text-xl ml-2 ${
                  isIncrease 
                    ? isDark ? 'text-green-300' : 'text-green-600'
                    : isDark ? 'text-red-300' : 'text-red-600'
                }`}>
                  {isIncrease ? '+' : ''}{change.toFixed(0)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className={`rounded-xl overflow-hidden ${
        isDark ? 'bg-slate-800/50' : 'bg-white/50'
      } backdrop-blur-sm border ${
        isDark ? 'border-slate-600' : 'border-gray-200'
      } transition-all duration-300`} style={{ height: '600px' }} data-testid="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.6} />
            
            <XAxis 
              dataKey="y_val" 
              type="number" 
              domain={[0, maxDomain]}
              label={{ 
                value: "Renta, Producción (Y)", 
                position: "insideBottom", 
                offset: -15,
                style: { textAnchor: 'middle', fill: textColor, fontSize: '14px', fontWeight: 500 }
              }}
              tickFormatter={(tick) => tick.toFixed(0)}
              stroke={axisColor}
              tick={{ fill: textColor, fontSize: 12 }}
            />
            
            <YAxis 
              domain={[0, maxDomain]}
              label={{ 
                value: "Demanda (Z)", 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: textColor, fontSize: '14px', fontWeight: 500 }
              }}
              tickFormatter={(tick) => tick.toFixed(0)}
              stroke={axisColor}
              tick={{ fill: textColor, fontSize: 12 }}

            />
            
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              height={60}
              wrapperStyle={{ 
                paddingBottom: '20px',
                color: textColor,
                fontSize: '14px',
                fontWeight: '500'
              }}
            />
            
            {/* Línea de 45 grados */}
            <Line 
              type="monotone" 
              dataKey="forty_five_line" 
              name="🔲 Línea 45° (Y = Z)" 
              stroke={isDark ? '#6b7280' : '#1f2937'}
              strokeWidth={3}
              dot={false}
              strokeDasharray="0"
            />

            {/* Línea de demanda anterior */}
            {hasTransition && (
              <Line 
                type="monotone" 
                dataKey="z_prime_line" 
                name="🔴 Demanda Anterior (ZZ')" 
                stroke={isDark ? '#f87171' : '#ef4444'}
                strokeWidth={4}
                strokeDasharray="10 5"
                dot={false}
                opacity={0.8}
              />
            )}
            
            {/* Línea de demanda actual */}
            <Line 
              type="monotone" 
              dataKey="z_line" 
              name="🔵 Demanda Nueva (ZZ)" 
              stroke={isDark ? '#60a5fa' : '#2563eb'}
              strokeWidth={4}
              dot={false}
            />

            {/* Líneas verticales de referencia */}
            {hasTransition && (
              <>
                <ReferenceLine 
                  x={previousEquilibriumY} 
                  stroke={isDark ? '#f87171' : '#ef4444'}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  opacity={0.7}
                  label={{ 
                    value: "Anterior", 
                    position: "top",
                    fill: isDark ? '#f87171' : '#ef4444',
                    fontSize: 12,
                    fontWeight: "bold"
                  }}
                />
                <ReferenceLine 
                  x={equilibriumY} 
                  stroke={isDark ? '#60a5fa' : '#2563eb'}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  opacity={0.7}
                  label={{ 
                    value: "Nuevo", 
                    position: "top",
                    fill: isDark ? '#60a5fa' : '#2563eb',
                    fontSize: 12,
                    fontWeight: "bold"
                  }}
                />
              </>
            )}

            {/* Puntos de equilibrio */}
            {hasTransition && (
              <ReferenceDot 
                x={previousEquilibriumY}
                y={previousEquilibriumY}
                r={10}
                fill={isDark ? '#f87171' : '#ef4444'}
                stroke="white"
                strokeWidth={3}
                className="animate-pulse"
              />
            )}

            <ReferenceDot 
              x={equilibriumY}
              y={equilibriumY}
              r={12}
              fill={isDark ? '#60a5fa' : '#2563eb'}
              stroke="white"
              strokeWidth={3}
              className="animate-pulse"
            />

          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {/* Panel de métricas */}
      {hasTransition && (
        <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
          <div className={`p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${
            isDark 
              ? 'bg-red-900/30 border-red-600/50 hover:shadow-lg hover:shadow-red-500/20' 
              : 'bg-red-50 border-red-200 hover:shadow-lg hover:shadow-red-500/10'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xl">🔴</span>
              <h4 className={`font-semibold ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                Equilibrio Anterior
              </h4>
            </div>
            <p className={`font-mono text-lg font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
              Y' = {previousEquilibriumY?.toFixed(0)}
            </p>
          </div>
          
          <div className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
            isIncrease 
              ? isDark
                ? 'bg-green-900/30 border-green-500/50 hover:shadow-lg hover:shadow-green-500/20' 
                : 'bg-green-50 border-green-300 hover:shadow-lg hover:shadow-green-500/10'
              : isDark
                ? 'bg-red-900/30 border-red-500/50 hover:shadow-lg hover:shadow-red-500/20'
                : 'bg-red-50 border-red-300 hover:shadow-lg hover:shadow-red-500/10'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xl">{isIncrease ? '📈' : '📉'}</span>
              <h4 className={`font-semibold ${
                isIncrease 
                  ? isDark ? 'text-green-300' : 'text-green-700'
                  : isDark ? 'text-red-300' : 'text-red-700'
              }`}>
                {isIncrease ? 'Cambio (Expansión)' : 'Cambio (Contracción)'}
              </h4>
            </div>
            <p className={`font-mono text-lg font-bold ${
              isIncrease 
                ? isDark ? 'text-green-400' : 'text-green-600'
                : isDark ? 'text-red-400' : 'text-red-600'
            }`}>
              {isIncrease ? '+' : ''}{change.toFixed(0)}
            </p>
          </div>
          
          <div className={`p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${
            isDark 
              ? 'bg-blue-900/30 border-blue-600/50 hover:shadow-lg hover:shadow-blue-500/20' 
              : 'bg-blue-50 border-blue-200 hover:shadow-lg hover:shadow-blue-500/10'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xl">🔵</span>
              <h4 className={`font-semibold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                Equilibrio Nuevo
              </h4>
            </div>
            <p className={`font-mono text-lg font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              Y* = {equilibriumY.toFixed(0)}
            </p>
          </div>
        </div>
      )}
      
      {!hasTransition && (
        <div className={`mt-6 text-center p-6 rounded-xl transition-all duration-300 ${
          isDark 
            ? 'bg-blue-900/20 border border-blue-600/30 text-blue-300' 
            : 'bg-blue-50 border border-blue-200 text-blue-700'
        }`}>
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span className="text-2xl animate-bounce">✨</span>
            <strong className="text-lg">¡Modifica los parámetros económicos!</strong>
            <span className="text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>🎯</span>
          </div>
          <p className="text-sm opacity-80">
            Arrastra los controles para ver cómo cambia el equilibrio del mercado
          </p>
        </div>
      )}
    </div>
  );
};

export default KeynesianCrossChart;
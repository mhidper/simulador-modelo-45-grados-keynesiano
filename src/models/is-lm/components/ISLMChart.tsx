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
  Label
} from 'recharts';
import type { ISLMChartData } from '../../../shared/types';
import { useTheme } from '../../../shared/contexts/ThemeContext';

interface ISLMChartProps {
  chartData: ISLMChartData;
  previousEquilibrium?: { Y: number; i: number } | null;
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
          📊 Producción (Y): <span className="text-blue-500 font-mono">{label.toFixed(0)}</span>
        </p>
        {payload.map((pld: any, index: number) => (
          pld.value && !pld.name?.includes('Anterior') && (
            <p key={index} style={{ color: pld.color }} className="text-sm font-medium flex items-center space-x-2 mb-1">
              <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: pld.color }}></span>
              <span>{`${pld.name}: ${pld.value.toFixed(2)}%`}</span>
            </p>
          )
        ))}
      </div>
    );
  }

  return null;
};

const ISLMChart: React.FC<ISLMChartProps> = ({ chartData, previousEquilibrium }) => {
  const { isDark } = useTheme();
  const { isCurve, lmCurve, equilibrium, previousIsCurve, previousLmCurve, previousEquilibrium: prevEq } = chartData;
  
  // Combinar datos para el gráfico
  const combinedData = isCurve.map((isPoint, index) => {
    const dataPoint: any = {
      Y: isPoint.Y,
      IS: isPoint.i,
      LM: lmCurve[index]?.i || equilibrium.i
    };
    
    // Añadir curvas anteriores si existen
    if (previousIsCurve && previousIsCurve[index]) {
      dataPoint.ISAnterior = previousIsCurve[index].i;
    }
    if (previousLmCurve && previousLmCurve[index]) {
      dataPoint.LMAnterior = previousLmCurve[index].i;
    }
    
    return dataPoint;
  });

  // Determinar si hay transición
  const hasTransition = prevEq !== null && prevEq !== undefined;
  const isIncrease = hasTransition && equilibrium.Y > prevEq.Y;
  const change = hasTransition ? equilibrium.Y - prevEq.Y : 0;

  return (
    <div className="space-y-6">
      <ResponsiveContainer width="100%" height={500}>
        <LineChart data={combinedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={isDark ? '#374151' : '#E5E7EB'}
            opacity={0.5}
          />
          
          <XAxis 
            dataKey="Y"
            type="number"
            domain={['dataMin', 'dataMax']}
            stroke={isDark ? '#9CA3AF' : '#6B7280'}
            tick={{ fill: isDark ? '#D1D5DB' : '#374151' }}
            tickFormatter={(value) => value.toFixed(0)}
          >
            <Label 
              value="Producción (Y)" 
              position="bottom" 
              offset={40}
              style={{ 
                fill: isDark ? '#F3F4F6' : '#1F2937',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            />
          </XAxis>
          
          <YAxis
            type="number"
            domain={['auto', 'auto']}
            stroke={isDark ? '#9CA3AF' : '#6B7280'}
            tick={{ fill: isDark ? '#D1D5DB' : '#374151' }}
            tickFormatter={(value) => `${value.toFixed(1)}%`}
          >
            <Label 
              value="Tipo de interés (i)" 
              angle={-90} 
              position="left"
              offset={0}
              style={{ 
                fill: isDark ? '#F3F4F6' : '#1F2937',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            />
          </YAxis>
          
          <Tooltip content={<CustomTooltip />} />
          
          <Legend 
            verticalAlign="top" 
            height={50}
            wrapperStyle={{
              paddingTop: '10px',
              paddingBottom: '10px'
            }}
            iconType="line"
            formatter={(value) => (
              <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>
                {value}
              </span>
            )}
          />
          
          {/* Curva IS Anterior (en gris si existe) */}
          {previousIsCurve && (
            <Line
              type="monotone"
              dataKey="ISAnterior"
              stroke="#9CA3AF"
              strokeWidth={2}
              dot={false}
              name="IS Anterior"
              strokeDasharray="3 3"
              opacity={0.5}
              animationDuration={0}
            />
          )}
          
          {/* Curva LM Anterior (en gris si existe) */}
          {previousLmCurve && (
            <Line
              type="monotone"
              dataKey="LMAnterior"
              stroke="#9CA3AF"
              strokeWidth={2}
              dot={false}
              name="LM Anterior"
              strokeDasharray="3 3"
              opacity={0.5}
              animationDuration={0}
            />
          )}
          
          {/* Curva IS actual */}
          <Line
            type="monotone"
            dataKey="IS"
            stroke="#3B82F6"
            strokeWidth={3}
            dot={false}
            name="Curva IS"
            animationDuration={800}
          />
          
          {/* Curva LM actual (horizontal) */}
          <Line
            type="monotone"
            dataKey="LM"
            stroke="#10B981"
            strokeWidth={3}
            dot={false}
            name="Curva LM"
            strokeDasharray="5 5"
            animationDuration={800}
          />
          
          {/* Punto de equilibrio anterior (si existe) */}
          {hasTransition && (
            <ReferenceDot
              x={prevEq.Y}
              y={prevEq.i}
              r={6}
              fill="#9CA3AF"
              stroke="#FFF"
              strokeWidth={2}
              label={{
                value: 'E₀',
                position: 'bottom',
                fill: isDark ? '#D1D5DB' : '#6B7280',
                fontSize: 14,
                fontWeight: 'bold'
              }}
            />
          )}
          
          {/* Punto de equilibrio actual */}
          <ReferenceDot
            x={equilibrium.Y}
            y={equilibrium.i}
            r={8}
            fill="#EF4444"
            stroke="#FFF"
            strokeWidth={3}
            label={{
              value: 'E*',
              position: 'top',
              fill: isDark ? '#FCA5A5' : '#DC2626',
              fontSize: 16,
              fontWeight: 'bold'
            }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Información del equilibrio */}
      <div className={`p-6 rounded-xl transition-all duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' 
          : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
      }`}>
        <h3 className={`text-lg font-bold mb-4 flex items-center ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          <span className="text-2xl mr-2">🎯</span>
          Equilibrio del Modelo IS-LM
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl border transition-all duration-300 ${
            isDark 
              ? 'bg-blue-900/30 border-blue-600/50' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xl">📊</span>
              <h4 className={`font-semibold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                Producción de Equilibrio
              </h4>
            </div>
            <p className={`font-mono text-lg font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              Y* = {equilibrium.Y.toFixed(0)}
            </p>
          </div>
          
          <div className={`p-4 rounded-xl border transition-all duration-300 ${
            isDark 
              ? 'bg-green-900/30 border-green-600/50' 
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xl">💰</span>
              <h4 className={`font-semibold ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                Tipo de Interés
              </h4>
            </div>
            <p className={`font-mono text-lg font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
              i* = {equilibrium.i.toFixed(2)}%
            </p>
          </div>
          
          <div className={`p-4 rounded-xl border transition-all duration-300 ${
            isDark 
              ? 'bg-purple-900/30 border-purple-600/50' 
              : 'bg-purple-50 border-purple-200'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xl">🛒</span>
              <h4 className={`font-semibold ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                Consumo
              </h4>
            </div>
            <p className={`font-mono text-lg font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
              C* = {equilibrium.C.toFixed(0)}
            </p>
          </div>
          
          <div className={`p-4 rounded-xl border transition-all duration-300 ${
            isDark 
              ? 'bg-orange-900/30 border-orange-600/50' 
              : 'bg-orange-50 border-orange-200'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xl">🏭</span>
              <h4 className={`font-semibold ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>
                Inversión
              </h4>
            </div>
            <p className={`font-mono text-lg font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
              I* = {equilibrium.I.toFixed(0)}
            </p>
          </div>
        </div>
      </div>

      {/* Indicador de cambio */}
      {hasTransition && (
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl border transition-all duration-300 ${
            isIncrease 
              ? isDark 
                ? 'bg-green-900/30 border-green-600/50' 
                : 'bg-green-50 border-green-200'
              : isDark 
                ? 'bg-red-900/30 border-red-600/50' 
                : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xl">{isIncrease ? '📈' : '📉'}</span>
              <h4 className={`font-semibold ${
                isIncrease 
                  ? isDark ? 'text-green-300' : 'text-green-700'
                  : isDark ? 'text-red-300' : 'text-red-700'
              }`}>
                Cambio en Y
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
          
          <div className={`p-4 rounded-xl border transition-all duration-300 ${
            isDark 
              ? 'bg-blue-900/30 border-blue-600/50' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xl">🔵</span>
              <h4 className={`font-semibold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                Equilibrio Nuevo
              </h4>
            </div>
            <p className={`font-mono text-lg font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              Y* = {equilibrium.Y.toFixed(0)}
            </p>
          </div>
        </div>
      )}
      
      {!hasTransition && (
        <div className={`text-center p-6 rounded-xl transition-all duration-300 ${
          isDark 
            ? 'bg-blue-900/20 border border-blue-600/30 text-blue-300' 
            : 'bg-blue-50 border border-blue-200 text-blue-700'
        }`}>
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span className="text-2xl animate-bounce">✨</span>
            <strong className="text-lg">¡Modifica las políticas económicas!</strong>
            <span className="text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>🎯</span>
          </div>
          <p className="text-sm opacity-80">
            Ajusta la política fiscal (G, T) o monetaria (i) para ver cómo cambia el equilibrio
          </p>
        </div>
      )}
    </div>
  );
};

export default ISLMChart;

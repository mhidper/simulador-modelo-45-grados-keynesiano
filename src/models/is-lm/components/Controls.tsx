import React from 'react';
import type { ISLMParams } from '../../../shared/types';
import { useTheme } from '../../../shared/contexts/ThemeContext';

interface ControlsProps {
  params: ISLMParams;
  onParamChange: (param: keyof ISLMParams, value: number) => void;
  onParamStart: () => void;
}

interface SliderProps {
  id: keyof ISLMParams;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  description: string;
  icon: string;
  color: 'green' | 'orange' | 'blue';
  onParamChange: (param: keyof ISLMParams, value: number) => void;
  onParamStart: () => void;
}

const Slider: React.FC<SliderProps> = ({
  id,
  label,
  value,
  min,
  max,
  step,
  description,
  icon,
  color,
  onParamChange,
  onParamStart
}) => {
  const { isDark } = useTheme();
  const percentage = ((value - min) / (max - min)) * 100;

  // Colores según el tipo de control
  const colorConfig = {
    green: {
      gradient: 'from-green-500 to-emerald-600',
      hover: isDark ? 'hover:border-green-400 hover:shadow-green-500/20' : 'hover:border-green-300 hover:shadow-green-500/10',
      value: isDark ? 'text-green-400' : 'text-green-600',
      track: isDark ? '#10B981' : '#34D399',
      thumb: 'linear-gradient(135deg, #10B981, #34D399)',
      shadow: 'rgba(16, 185, 129, 0.3)'
    },
    orange: {
      gradient: 'from-orange-500 to-red-600',
      hover: isDark ? 'hover:border-orange-400 hover:shadow-orange-500/20' : 'hover:border-orange-300 hover:shadow-orange-500/10',
      value: isDark ? 'text-orange-400' : 'text-orange-600',
      track: isDark ? '#F97316' : '#FB923C',
      thumb: 'linear-gradient(135deg, #F97316, #FB923C)',
      shadow: 'rgba(249, 115, 22, 0.3)'
    },
    blue: {
      gradient: 'from-blue-500 to-purple-600',
      hover: isDark ? 'hover:border-blue-400 hover:shadow-blue-500/20' : 'hover:border-blue-300 hover:shadow-blue-500/10',
      value: isDark ? 'text-blue-400' : 'text-blue-600',
      track: isDark ? '#3B82F6' : '#60A5FA',
      thumb: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
      shadow: 'rgba(59, 130, 246, 0.3)'
    }
  };

  const config = colorConfig[color];

  const containerClasses = isDark
    ? `group p-4 rounded-xl bg-gradient-to-br from-slate-700 to-gray-700 border border-slate-600 ${config.hover} transition-all duration-300`
    : `group p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 ${config.hover} transition-all duration-300`;

  const labelClasses = isDark ? 'text-gray-200' : 'text-gray-700';
  const descriptionClasses = isDark ? 'text-gray-400' : 'text-gray-500';

  // Formatear el valor mostrado
  const displayValue = id === 'iBar' ? `${value.toFixed(2)}%` : value.toString();

  return (
    <div className={containerClasses}>
      <div className="flex items-center space-x-3 mb-3">
        <div className={`w-8 h-8 bg-gradient-to-br ${config.gradient} rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
          {icon}
        </div>
        <div className="flex-1">
          <label htmlFor={id} className={`flex justify-between text-sm font-semibold ${labelClasses}`}>
            <span>{label}</span>
            <span className={`font-bold text-lg font-mono ${config.value} transition-all duration-300 group-hover:scale-110`}>
              {displayValue}
            </span>
          </label>
        </div>
      </div>

      <div className="relative mb-3">
        <input
          type="range"
          id={id}
          name={id}
          min={min}
          max={max}
          step={step}
          value={value}
          onMouseDown={onParamStart}
          onTouchStart={onParamStart}
          onChange={(e) => onParamChange(id, Number(e.target.value))}
          className="w-full h-3 rounded-full appearance-none cursor-pointer transition-all duration-300"
          style={{
            background: `linear-gradient(to right, 
              ${config.track} 0%, 
              ${config.track} ${percentage}%, 
              ${isDark ? '#374151' : '#E5E7EB'} ${percentage}%, 
              ${isDark ? '#374151' : '#E5E7EB'} 100%)`
          }}
        />
        <style>
          {`
            #${id}::-webkit-slider-thumb {
              appearance: none;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: ${config.thumb};
              cursor: pointer;
              box-shadow: 0 4px 6px -1px ${config.shadow}, 0 2px 4px -1px ${config.shadow};
              transition: all 0.2s ease;
              border: 3px solid white;
            }
            
            #${id}::-webkit-slider-thumb:hover {
              transform: scale(1.2);
              box-shadow: 0 10px 15px -3px ${config.shadow}, 0 4px 6px -2px ${config.shadow};
            }
            
            #${id}::-moz-range-thumb {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: ${config.thumb};
              cursor: pointer;
              box-shadow: 0 4px 6px -1px ${config.shadow}, 0 2px 4px -1px ${config.shadow};
              transition: all 0.2s ease;
              border: 3px solid white;
            }
            
            #${id}::-moz-range-thumb:hover {
              transform: scale(1.2);
              box-shadow: 0 10px 15px -3px ${config.shadow}, 0 4px 6px -2px ${config.shadow};
            }
          `}
        </style>
      </div>

      <div className={`flex justify-between text-xs ${descriptionClasses} mb-2`}>
        <span className="font-mono">{id === 'iBar' ? `${min}%` : min}</span>
        <span className="font-mono">{id === 'iBar' ? `${max}%` : max}</span>
      </div>

      <p className={`text-xs ${descriptionClasses} leading-relaxed`}>
        {description}
      </p>
    </div>
  );
};

const Controls: React.FC<ControlsProps> = ({ params, onParamChange, onParamStart }) => {
  const { isDark } = useTheme();

  return (
    <div className="space-y-6">
      {/* Sección de Política Fiscal */}
      <div className={`p-4 rounded-xl ${
        isDark ? 'bg-green-900/10 border border-green-600/30' : 'bg-green-50 border border-green-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center ${
          isDark ? 'text-green-300' : 'text-green-700'
        }`}>
          <span className="mr-2">🏛️</span>
          Política Fiscal
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Slider
            id="G"
            label="Gasto Público (G)"
            value={params.G}
            min={0}
            max={2000}
            step={10}
            description="💡 ↑G desplaza IS a la derecha → ↑Y* (política expansiva)"
            icon="🏛️"
            color="green"
            onParamChange={onParamChange}
            onParamStart={onParamStart}
          />
          <Slider
            id="T"
            label="Impuestos (T)"
            value={params.T}
            min={0}
            max={1000}
            step={10}
            description="💡 ↑T desplaza IS a la izquierda → ↓Y* (política restrictiva)"
            icon="💰"
            color="orange"
            onParamChange={onParamChange}
            onParamStart={onParamStart}
          />
        </div>
      </div>

      {/* Sección de Política Monetaria */}
      <div className={`p-4 rounded-xl ${
        isDark ? 'bg-blue-900/10 border border-blue-600/30' : 'bg-blue-50 border border-blue-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center ${
          isDark ? 'text-blue-300' : 'text-blue-700'
        }`}>
          <span className="mr-2">🏦</span>
          Política Monetaria
        </h3>
        <Slider
          id="iBar"
          label="Tipo de Interés BCE (ī)"
          value={params.iBar}
          min={0}
          max={10}
          step={0.25}
          description="💡 ↓ī desplaza LM hacia abajo → ↑Y* (política expansiva)"
          icon="🏦"
          color="blue"
          onParamChange={onParamChange}
          onParamStart={onParamStart}
        />
      </div>
    </div>
  );
};

export default Controls;

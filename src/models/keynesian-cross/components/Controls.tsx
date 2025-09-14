import React from 'react';
import type { EconomicParams } from '../../../shared/types';
import { useTheme } from '../../../shared/contexts/ThemeContext';

interface ControlsProps {
  params: EconomicParams;
  onParamChange: (param: keyof EconomicParams, value: number) => void;
  onParamStart: () => void;
}

interface ControlItemProps {
  id: keyof EconomicParams;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  description: string;
  symbol: string;
  icon: string;
  onParamChange: (param: keyof EconomicParams, value: number) => void;
  onParamStart: () => void;
}

const ControlItem: React.FC<ControlItemProps> = ({ 
  id, 
  label, 
  value, 
  min, 
  max, 
  step, 
  description, 
  symbol,
  icon,
  onParamChange, 
  onParamStart 
}) => {
  const { isDark } = useTheme();
  const percentage = ((value - min) / (max - min)) * 100;
  
  const containerClasses = isDark
    ? "group p-4 rounded-xl bg-gradient-to-br from-slate-700 to-gray-700 border border-slate-600 hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
    : "group p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10";

  const labelClasses = isDark ? "text-gray-200" : "text-gray-700";
  const valueClasses = isDark ? "text-blue-400" : "text-blue-600";
  const descriptionClasses = isDark ? "text-gray-400" : "text-gray-500";

  return (
    <div className={containerClasses}>
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg">
          {icon}
        </div>
        <div className="flex-1">
          <label htmlFor={id} className={`flex justify-between text-sm font-semibold ${labelClasses}`}>
            <span className="flex items-center space-x-2">
              <span>{label}</span>
              <span className="font-mono text-xs opacity-75">({symbol})</span>
            </span>
            <span className={`font-bold text-lg font-mono ${valueClasses} transition-all duration-300 group-hover:scale-110`}>
              {id === 'c1' ? value.toFixed(2) : value}
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
          onChange={(e) => onParamChange(id, parseFloat(e.target.value))}
          className="w-full h-3 bg-transparent rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, 
              ${isDark ? '#3b82f6' : '#2563eb'} 0%, 
              ${isDark ? '#3b82f6' : '#2563eb'} ${percentage}%, 
              ${isDark ? '#374151' : '#e5e7eb'} ${percentage}%, 
              ${isDark ? '#374151' : '#e5e7eb'} 100%)`
          }}
        />
        <div 
          className="absolute top-1/2 w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg transform -translate-y-1/2 transition-all duration-200 hover:scale-125 hover:shadow-xl"
          style={{ left: `calc(${percentage}% - 10px)` }}
        />
        
        {/* Marcadores de escala */}
        <div className="flex justify-between mt-2 px-1">
          <span className={`text-xs font-mono ${descriptionClasses}`}>{min}</span>
          <span className={`text-xs font-mono ${descriptionClasses}`}>{max}</span>
        </div>
      </div>
      
      <p className={`text-xs leading-relaxed ${descriptionClasses} transition-all duration-300 group-hover:text-blue-500`}>
        {description}
      </p>
    </div>
  );
};

const Controls: React.FC<ControlsProps> = ({ params, onParamChange, onParamStart }) => {
  const { isDark } = useTheme();
  
  const titleClasses = isDark ? "text-gray-100" : "text-gray-800";

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className={`text-2xl font-bold ${titleClasses} mb-2`}>
          Parámetros Económicos
        </h2>
        <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto"></div>
      </div>
      
      <div className="space-y-4">
        <ControlItem
          id="c0"
          label="Consumo Autónomo"
          symbol="c₀"
          icon="🏠"
          value={params.c0}
          min={0}
          max={500}
          step={10}
          description="Nivel básico de consumo independiente de la renta."
          onParamChange={onParamChange}
          onParamStart={onParamStart}
        />
        
        <ControlItem
          id="c1"
          label="Propensión Marginal a Consumir"
          symbol="c₁"
          icon="💳"
          value={params.c1}
          min={0.1}
          max={0.95}
          step={0.05}
          description="Fracción de cada euro adicional de renta que se consume."
          onParamChange={onParamChange}
          onParamStart={onParamStart}
        />
        
        <ControlItem
          id="I"
          label="Inversión Privada"
          symbol="I"
          icon="🏭"
          value={params.I}
          min={0}
          max={500}
          step={10}
          description="Gasto empresarial en maquinaria, equipos y estructuras."
          onParamChange={onParamChange}
          onParamStart={onParamStart}
        />
        
        <ControlItem
          id="G"
          label="Gasto Público"
          symbol="G"
          icon="🏛️"
          value={params.G}
          min={0}
          max={500}
          step={10}
          description="Compras gubernamentales de bienes y servicios."
          onParamChange={onParamChange}
          onParamStart={onParamStart}
        />
        
        <ControlItem
          id="T"
          label="Impuestos Netos"
          symbol="T"
          icon="💰"
          value={params.T}
          min={0}
          max={500}
          step={10}
          description="Impuestos menos transferencias del gobierno."
          onParamChange={onParamChange}
          onParamStart={onParamStart}
        />
      </div>
    </div>
  );
};

export default Controls;
import React from 'react';
import type { ISLMParams } from '../../../shared/types';
import { useTheme } from '../../../shared/contexts/ThemeContext';

interface ISLMControlsProps {
  params: ISLMParams;
  onParamChange: (param: keyof ISLMParams, value: number) => void;
  onParamStart: () => void;
  onParamEnd?: () => void;  // AÑADIDO
}

interface ControlItemProps {
  id: keyof ISLMParams;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  description: string;
  symbol: string;
  icon: string;
  onParamChange: (param: keyof ISLMParams, value: number) => void;
  onParamStart: () => void;
  onParamEnd?: () => void;  // AÑADIDO
  formatValue?: (value: number) => string;
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
  onParamStart,
  onParamEnd,  // AÑADIDO
  formatValue
}) => {
  const { isDark } = useTheme();
  const percentage = ((value - min) / (max - min)) * 100;
  
  const containerClasses = isDark
    ? "group p-4 rounded-xl bg-gradient-to-br from-slate-700 to-gray-700 border border-slate-600 hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
    : "group p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10";

  const labelClasses = isDark ? "text-gray-200" : "text-gray-700";
  const valueClasses = isDark ? "text-blue-400" : "text-blue-600";
  const descriptionClasses = isDark ? "text-gray-400" : "text-gray-500";

  const displayValue = formatValue ? formatValue(value) : value.toString();

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
          onMouseUp={onParamEnd}      // AÑADIDO
          onTouchEnd={onParamEnd}     // AÑADIDO
          onChange={(e) => onParamChange(id, parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer 
                     dark:bg-gray-700 accent-blue-500 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                     transition-all duration-300 hover:h-3"
          style={{
            background: `linear-gradient(to right, 
              rgb(59 130 246) 0%, 
              rgb(59 130 246) ${percentage}%, 
              ${isDark ? 'rgb(55 65 81)' : 'rgb(229 231 235)'} ${percentage}%, 
              ${isDark ? 'rgb(55 65 81)' : 'rgb(229 231 235)'} 100%)`
          }}
        />
      </div>
      
      <p className={`text-xs ${descriptionClasses} leading-relaxed`}>
        {description}
      </p>
    </div>
  );
};

const ISLMControls: React.FC<ISLMControlsProps> = ({ params, onParamChange, onParamStart, onParamEnd }) => {  // AÑADIDO onParamEnd
  const { isDark } = useTheme();
  
  const sectionHeaderClasses = isDark
    ? "flex items-center space-x-3 mb-4 pb-2 border-b border-slate-600"
    : "flex items-center space-x-3 mb-4 pb-2 border-b border-gray-300";
    
  const sectionTitleClasses = isDark 
    ? "text-lg font-bold text-white" 
    : "text-lg font-bold text-gray-900";

  return (
    <div className="space-y-8">
      {/* Sección: Política Fiscal */}
      <div>
        <div className={sectionHeaderClasses}>
          <span className="text-2xl">🏛️</span>
          <h3 className={sectionTitleClasses}>Política Fiscal</h3>
        </div>
        <div className="grid gap-4">
          <ControlItem
            id="G"
            label="Gasto Público"
            value={params.G}
            min={0}
            max={500}
            step={10}
            description="Gasto del gobierno en bienes y servicios. Un aumento de G desplaza la curva IS hacia la derecha."
            symbol="G"
            icon="🏛️"
            onParamChange={onParamChange}
            onParamStart={onParamStart}
            onParamEnd={onParamEnd}  // AÑADIDO
          />
          
          <ControlItem
            id="T"
            label="Impuestos"
            value={params.T}
            min={0}
            max={300}
            step={10}
            description="Impuestos de suma fija. Un aumento de T reduce la renta disponible y desplaza la IS hacia la izquierda."
            symbol="T"
            icon="💰"
            onParamChange={onParamChange}
            onParamStart={onParamStart}
            onParamEnd={onParamEnd}  // AÑADIDO
          />
        </div>
      </div>

      {/* Sección: Política Monetaria */}
      <div>
        <div className={sectionHeaderClasses}>
          <span className="text-2xl">🏦</span>
          <h3 className={sectionTitleClasses}>Política Monetaria</h3>
        </div>
        <div className="grid gap-4">
          <ControlItem
            id="iBar"
            label="Tipo de Interés Objetivo"
            value={params.iBar}
            min={0}
            max={10}
            step={0.25}
            description="Tipo de interés fijado por el BCE (LM horizontal). Una reducción de i estimula la economía."
            symbol="ī"
            icon="📊"
            onParamChange={onParamChange}
            onParamStart={onParamStart}
            onParamEnd={onParamEnd}  // AÑADIDO
            formatValue={(value) => `${value.toFixed(2)}%`}
          />
        </div>
      </div>

      {/* Sección: Función de Consumo */}
      <div>
        <div className={sectionHeaderClasses}>
          <span className="text-2xl">🛒</span>
          <h3 className={sectionTitleClasses}>Función de Consumo</h3>
        </div>
        <div className="grid gap-4">
          <ControlItem
            id="c0"
            label="Consumo Autónomo"
            value={params.c0}
            min={0}
            max={200}
            step={5}
            description="Consumo independiente de la renta. Representa el consumo mínimo que realizan las familias."
            symbol="c₀"
            icon="🏠"
            onParamChange={onParamChange}
            onParamStart={onParamStart}
            onParamEnd={onParamEnd}  // AÑADIDO
          />
          
          <ControlItem
            id="c1"
            label="Propensión Marginal a Consumir"
            value={params.c1}
            min={0.1}
            max={0.9}
            step={0.05}
            description="Fracción de cada euro adicional de renta disponible que se destina al consumo (0 < c₁ < 1)."
            symbol="c₁"
            icon="💳"
            onParamChange={onParamChange}
            onParamStart={onParamStart}
            onParamEnd={onParamEnd}  // AÑADIDO
            formatValue={(value) => value.toFixed(2)}
          />
        </div>
      </div>

      {/* Sección: Función de Inversión */}
      <div>
        <div className={sectionHeaderClasses}>
          <span className="text-2xl">🏭</span>
          <h3 className={sectionTitleClasses}>Función de Inversión</h3>
        </div>
        <div className="grid gap-4">
          <ControlItem
            id="I0"
            label="Inversión Autónoma"
            value={params.I0}
            min={0}
            max={200}
            step={5}
            description="Inversión independiente de la renta y el tipo de interés. Base de la inversión empresarial."
            symbol="I₀"
            icon="🏗️"
            onParamChange={onParamChange}
            onParamStart={onParamStart}
            onParamEnd={onParamEnd}  // AÑADIDO
          />
          
          <ControlItem
            id="d1"
            label="Sensibilidad de I a Y"
            value={params.d1}
            min={0}
            max={0.3}
            step={0.01}
            description="Mide cómo aumenta la inversión cuando crece la renta. Principio del acelerador."
            symbol="d₁"
            icon="📈"
            onParamChange={onParamChange}
            onParamStart={onParamStart}
            onParamEnd={onParamEnd}  // AÑADIDO
            formatValue={(value) => value.toFixed(2)}
          />
          
          <ControlItem
            id="d2"
            label="Sensibilidad de I a i"
            value={params.d2}
            min={10}
            max={100}
            step={5}
            description="Mide cómo disminuye la inversión cuando sube el tipo de interés. Mayor d₂ = IS más plana."
            symbol="d₂"
            icon="📉"
            onParamChange={onParamChange}
            onParamStart={onParamStart}
            onParamEnd={onParamEnd}  // AÑADIDO
          />
        </div>
      </div>

      {/* Información adicional */}
      <div className={`p-4 rounded-xl ${
        isDark 
          ? 'bg-blue-900/20 border border-blue-600/30 text-blue-300' 
          : 'bg-blue-50 border border-blue-200 text-blue-700'
      }`}>
        <div className="flex items-start space-x-3">
          <span className="text-xl">💡</span>
          <div className="flex-1 text-sm">
            <p className="font-semibold mb-2">Modelo IS-LM con LM horizontal</p>
            <ul className="space-y-1 text-xs opacity-80">
              <li>• <strong>Curva IS:</strong> i = (1/d₂)·A - [(1-c₁-d₁)/d₂]·Y</li>
              <li>• <strong>Curva LM:</strong> i = ī (horizontal)</li>
              <li>• <strong>Gasto autónomo:</strong> A = c₀ + I₀ + G - c₁·T</li>
              <li>• <strong>Equilibrio:</strong> Y* se determina en la IS con i = ī</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ISLMControls;

import React from 'react';
import type { ISLMParams } from '../../../shared/types';
import { useTheme } from '../../../shared/contexts/ThemeContext';

interface GSliderProps {
  value: number;
  onChange: (value: number) => void;
  onStart: () => void;
}

const GSlider: React.FC<GSliderProps> = ({ value, onChange, onStart }) => {
  const { isDark } = useTheme();
  
  // Rango para G (gasto público)
  const min = 0;
  const max = 2000;
  const step = 10;
  
  const percentage = ((value - min) / (max - min)) * 100;
  
  const containerClasses = isDark
    ? "group p-6 rounded-xl bg-gradient-to-br from-slate-700 to-gray-700 border border-slate-600 hover:border-green-400 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20"
    : "group p-6 rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:border-green-300 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10";

  const labelClasses = isDark ? "text-gray-200" : "text-gray-700";
  const valueClasses = isDark ? "text-green-400" : "text-green-600";
  const descriptionClasses = isDark ? "text-gray-400" : "text-gray-500";

  return (
    <div className={containerClasses}>
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-lg">
          🏛️
        </div>
        <div className="flex-1">
          <label htmlFor="G" className={`flex justify-between text-sm font-semibold ${labelClasses}`}>
            <span className="flex items-center space-x-2">
              <span>Gasto Público</span>
              <span className="font-mono text-xs opacity-75">(G)</span>
            </span>
            <span className={`font-bold text-xl font-mono ${valueClasses} transition-all duration-300 group-hover:scale-110`}>
              {value}
            </span>
          </label>
        </div>
      </div>
      
      <div className="relative mb-4">
        <input
          type="range"
          id="G"
          name="G"
          min={min}
          max={max}
          step={step}
          value={value}
          onMouseDown={onStart}
          onTouchStart={onStart}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-3 rounded-full appearance-none cursor-pointer transition-all duration-300"
          style={{
            background: `linear-gradient(to right, 
              ${isDark ? '#10B981' : '#34D399'} 0%, 
              ${isDark ? '#10B981' : '#34D399'} ${percentage}%, 
              ${isDark ? '#374151' : '#E5E7EB'} ${percentage}%, 
              ${isDark ? '#374151' : '#E5E7EB'} 100%)`
          }}
        />
        <style>
          {`
            input[type="range"]::-webkit-slider-thumb {
              appearance: none;
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background: linear-gradient(135deg, #10B981, #34D399);
              cursor: pointer;
              box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3), 0 2px 4px -1px rgba(16, 185, 129, 0.2);
              transition: all 0.2s ease;
              border: 3px solid white;
            }
            
            input[type="range"]::-webkit-slider-thumb:hover {
              transform: scale(1.2);
              box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.4), 0 4px 6px -2px rgba(16, 185, 129, 0.3);
            }
            
            input[type="range"]::-moz-range-thumb {
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background: linear-gradient(135deg, #10B981, #34D399);
              cursor: pointer;
              box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3), 0 2px 4px -1px rgba(16, 185, 129, 0.2);
              transition: all 0.2s ease;
              border: 3px solid white;
            }
            
            input[type="range"]::-moz-range-thumb:hover {
              transform: scale(1.2);
              box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.4), 0 4px 6px -2px rgba(16, 185, 129, 0.3);
            }
          `}
        </style>
      </div>
      
      <div className={`flex justify-between text-xs ${descriptionClasses} mb-3`}>
        <span className="font-mono">{min}</span>
        <span className="font-mono">{max}</span>
      </div>
      
      <p className={`text-sm ${descriptionClasses} leading-relaxed`}>
        💡 <strong>Política fiscal expansiva:</strong> Un aumento del gasto público desplaza la curva IS hacia la derecha, aumentando la producción de equilibrio.
      </p>
    </div>
  );
};

export default GSlider;

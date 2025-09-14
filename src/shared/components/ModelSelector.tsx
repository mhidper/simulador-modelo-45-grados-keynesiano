import React from 'react';
import type { EconomicModel } from '../types';
import { ECONOMIC_MODELS } from '../modelConfig';

interface ModelSelectorProps {
  onModelSelect: (modelId: string) => void;
  isDark: boolean;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ onModelSelect, isDark }) => {
  const getLevelBadge = (level: string) => {
    const badges = {
      basico: 'bg-green-100 text-green-800 border-green-200',
      intermedio: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      avanzado: 'bg-red-100 text-red-800 border-red-200'
    };
    
    if (isDark) {
      return {
        basico: 'bg-green-900/30 text-green-300 border-green-700',
        intermedio: 'bg-yellow-900/30 text-yellow-300 border-yellow-700',
        avanzado: 'bg-red-900/30 text-red-300 border-red-700'
      }[level as keyof typeof badges];
    }
    
    return badges[level as keyof typeof badges];
  };

  const getModelCard = (model: EconomicModel) => {
    const baseClasses = `
      relative p-6 rounded-2xl border-2 transition-all duration-300 transform
      ${model.isAvailable ? 'hover:scale-105 hover:shadow-2xl cursor-pointer' : 'opacity-60 cursor-not-allowed'}
    `;
    
    const availableClasses = isDark 
      ? 'bg-gradient-to-br from-slate-800 to-gray-800 border-slate-600 hover:border-slate-400'
      : 'bg-white/70 backdrop-blur-sm border-gray-200 hover:border-gray-400';
      
    const unavailableClasses = isDark
      ? 'bg-slate-900/50 border-slate-700'
      : 'bg-gray-100/50 border-gray-300';

    return model.isAvailable ? `${baseClasses} ${availableClasses}` : `${baseClasses} ${unavailableClasses}`;
  };

  return (
    <div className="container mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white text-3xl">🎓</span>
          </div>
          <div>
            <h1 className={`text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
              Simuladores de Macroeconomía
            </h1>
            <p className={`mt-2 text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Modelos Interactivos para el Aprendizaje Económico
            </p>
          </div>
        </div>
        
        <div className={`max-w-3xl mx-auto p-6 rounded-xl ${
          isDark ? 'bg-blue-900/20 border border-blue-600/30' : 'bg-blue-50 border border-blue-200'
        }`}>
          <p className={`text-lg leading-relaxed ${isDark ? 'text-blue-100' : 'text-blue-800'}`}>
            Bienvenido a nuestra plataforma de simulación macroeconómica. Cada modelo te permitirá explorar 
            diferentes aspectos de la teoría económica de manera interactiva, con explicaciones detalladas 
            y análisis en tiempo real.
          </p>
        </div>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {ECONOMIC_MODELS.map((model, index) => (
          <div
            key={model.id}
            className={getModelCard(model)}
            onClick={() => model.isAvailable && onModelSelect(model.id)}
          >
            {/* Header del modelo */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${model.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <span className="text-white text-2xl">{model.icon}</span>
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {model.name}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 text-xs font-medium border rounded-full ${getLevelBadge(model.level)}`}>
                      {model.level.charAt(0).toUpperCase() + model.level.slice(1)}
                    </span>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {model.estimatedTime}
                    </span>
                  </div>
                </div>
              </div>
              
              {!model.isAvailable && (
                <div className={`px-3 py-1 text-xs font-medium rounded-full ${
                  isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                }`}>
                  Próximamente
                </div>
              )}
            </div>

            {/* Descripción */}
            <p className={`text-sm leading-relaxed mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {model.description}
            </p>

            {/* Objetivos de aprendizaje */}
            <div className="mb-4">
              <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                📚 Objetivos de aprendizaje:
              </h4>
              <ul className="space-y-1">
                {model.learningObjectives.slice(0, 3).map((objective, i) => (
                  <li key={i} className={`text-xs flex items-start space-x-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>{objective}</span>
                  </li>
                ))}
                {model.learningObjectives.length > 3 && (
                  <li className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    ... y {model.learningObjectives.length - 3} objetivos más
                  </li>
                )}
              </ul>
            </div>

            {/* Prerequisites */}
            {model.prerequisites && (
              <div className="mb-4">
                <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  🔗 Requisitos previos:
                </h4>
                <div className="flex flex-wrap gap-1">
                  {model.prerequisites.map((prereq, i) => (
                    <span key={i} className={`px-2 py-1 text-xs rounded ${
                      isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {ECONOMIC_MODELS.find(m => m.id === prereq)?.name || prereq}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Botón de acción */}
            <div className="flex items-center justify-between mt-6">
              {model.isAvailable ? (
                <button className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300
                  bg-gradient-to-r ${model.color} text-white hover:shadow-lg transform hover:scale-105
                `}>
                  <span>Comenzar Simulación</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'
                }`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-sm">En desarrollo</span>
                </div>
              )}
              
              <span className={`text-2xl font-bold ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>
                0{index + 1}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className={`mt-12 text-center p-6 rounded-xl ${
        isDark ? 'bg-slate-800/50 border border-slate-600' : 'bg-gray-50 border border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          🚀 Próximamente
        </h3>
        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Estamos trabajando en los modelos IS-LM, Phillips Curve y Sector Exterior. 
          Cada modelo incluirá simulaciones interactivas, casos reales y ejercicios guiados.
        </p>
      </div>
    </div>
  );
};

export default ModelSelector;

import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { useTheme } from '../../../shared/contexts/ThemeContext';

interface ISLMExplanationProps {
  explanation: string;
  isLoading: boolean;
}

const ISLMExplanation: React.FC<ISLMExplanationProps> = ({ explanation, isLoading }) => {
  const { isDark } = useTheme();
  
  const renderContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('### ')) {
        const content = line.substring(4);
        return (
          <h3 key={index} className={`text-xl font-bold mt-6 mb-3 ${
            isDark ? 'text-white' : 'text-gray-800'
          } border-l-4 border-blue-500 pl-4 transition-all duration-300`}>
            {renderTextWithMath(content)}
          </h3>
        );
      }
      if (line.startsWith('- ')) {
        const content = line.substring(2);
        return (
          <li key={index} className={`ml-6 list-none relative mb-3 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          } leading-relaxed`}>
            <span className="absolute -left-6 top-1 w-2 h-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"></span>
            {renderTextWithMath(content)}
          </li>
        );
      }
      if (line.trim() === '') {
          return null;
      }
      
      return (
        <p key={index} className={`mb-4 leading-relaxed ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        } transition-all duration-300`}>
          {renderTextWithMath(line)}
        </p>
      );
    });
  };

  const renderTextWithMath = (text: string) => {
    const parts = text.split(/(\$[^$]+\$)/);
    
    return parts.map((part, index) => {
      if (part.startsWith('$') && part.endsWith('$')) {
        const mathContent = part.slice(1, -1);
        try {
          return (
            <span key={index} className="inline-block mx-1 p-1 bg-blue-50 dark:bg-blue-900/30 rounded">
              <InlineMath math={mathContent} />
            </span>
          );
        } catch (error) {
          console.error("Error renderizando LaTeX:", error);
          return <span key={index} className="font-mono text-sm">{mathContent}</span>;
        }
      }
      
      // Renderizar texto en negrita
      if (part.includes('**')) {
        const boldParts = part.split(/(\*\*[^*]+\*\*)/);
        return boldParts.map((boldPart, boldIndex) => {
          if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
            return <strong key={`${index}-${boldIndex}`}>{boldPart.slice(2, -2)}</strong>;
          }
          return <span key={`${index}-${boldIndex}`}>{boldPart}</span>;
        });
      }
      
      return <span key={index}>{part}</span>;
    });
  };

  if (isLoading) {
    return (
      <div className={`rounded-xl p-8 transition-all duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' 
          : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
      }`}>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <p className={`text-lg font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              🤖 Generando explicación con IA...
            </p>
            <p className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Analizando el impacto económico
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!explanation) {
    return (
      <div className={`rounded-xl p-8 text-center transition-all duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-700/50' 
          : 'bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200'
      }`}>
        <div className="flex flex-col items-center space-y-3">
          <span className="text-5xl animate-bounce">📚</span>
          <p className={`text-lg font-semibold ${
            isDark ? 'text-blue-300' : 'text-blue-700'
          }`}>
            ¡Comienza a explorar el modelo IS-LM!
          </p>
          <p className={`text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Modifica los parámetros para obtener explicaciones contextualizadas
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl p-6 transition-all duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' 
        : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
    }`}>
      <div className="flex items-center space-x-2 mb-6 pb-4 border-b border-gray-700 dark:border-gray-600">
        <span className="text-2xl">🤖</span>
        <h2 className={`text-xl font-bold ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Explicación con IA
        </h2>
      </div>
      
      <div className="prose dark:prose-invert max-w-none">
        {renderContent(explanation)}
      </div>

      <div className={`mt-6 pt-4 border-t flex items-center justify-between ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <p className={`text-xs ${
          isDark ? 'text-gray-500' : 'text-gray-400'
        }`}>
          💡 Explicación generada con Google Gemini
        </p>
      </div>
    </div>
  );
};

export default ISLMExplanation;

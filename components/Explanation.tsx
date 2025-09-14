import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { useTheme } from '../App';

interface ExplanationProps {
  explanation: string;
  isLoading: boolean;
}

const Explanation: React.FC<ExplanationProps> = ({ explanation, isLoading }) => {
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
  }

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
          return (
            <span key={index} className={`font-mono px-2 py-1 rounded text-sm ${
              isDark ? 'bg-gray-700 text-blue-300' : 'bg-gray-100 text-blue-700'
            }`}>
              {mathContent}
            </span>
          );
        }
      } else {
        const boldParts = part.split('**');
        return boldParts.map((boldPart, boldIndex) => 
          boldIndex % 2 === 1 ? (
            <strong key={`${index}-${boldIndex}`} className="font-bold text-blue-600 dark:text-blue-400">
              {boldPart}
            </strong>
          ) : (
            <span key={`${index}-${boldIndex}`}>{boldPart}</span>
          )
        );
      }
    });
  }

  const containerClasses = isDark
    ? "bg-gradient-to-br from-slate-800 to-gray-800"
    : "bg-gradient-to-br from-blue-50 to-indigo-50";

  const titleClasses = isDark ? "text-white" : "text-gray-800";

  return (
    <div data-testid="explanation-container">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
          <span className="text-white text-sm">📚</span>
        </div>
        <h2 className={`text-xl font-bold ${titleClasses}`}>
          Explicación Económica
        </h2>
      </div>
      
      {isLoading ? (
        <div className={`${containerClasses} p-6 rounded-xl border ${
          isDark ? 'border-slate-600' : 'border-blue-200'
        } transition-all duration-300`}>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-2 border-purple-200 border-t-purple-500 rounded-full animate-spin animate-reverse"></div>
            </div>
            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
              <span className="font-medium animate-pulse">Analizando el cambio económico...</span>
            </div>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      ) : (
        <div className={`${containerClasses} p-6 rounded-xl border ${
          isDark ? 'border-slate-600' : 'border-blue-200'
        } transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10`}>
          <div className="prose prose-sm max-w-none">
            {renderContent(explanation)}
          </div>
        </div>
      )}
    </div>
  );
};

export default Explanation;
import React, { useState } from 'react';

interface ApiKeyPromptProps {
  onApiKeySubmit: (apiKey: string) => void;
  isDark: boolean;
}

const ApiKeyPrompt: React.FC<ApiKeyPromptProps> = ({ onApiKeySubmit, isDark }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError('Por favor, introduce una API key válida.');
      return;
    }
    onApiKeySubmit(apiKey);
  };

  const containerClasses = `
    flex items-center justify-center min-h-screen p-4
    ${isDark ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white' : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-gray-900'}
  `;

  const cardClasses = `
    p-8 rounded-2xl shadow-2xl w-full max-w-lg animate-slideIn hover-lift
    ${isDark ? 'glass-dark border border-gray-700' : 'glass border border-blue-100 bg-white/50'}
  `;

  const inputClasses = `
    w-full p-3 rounded-lg border focus-ring transition-colors duration-200
    ${isDark 
      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500' 
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
    }
  `;

  const buttonClasses = `
    w-full py-3 rounded-lg text-white font-semibold text-lg hover-lift animate-glow
    bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700
    transition-all duration-300 transform active:scale-98 focus-ring
  `;

  return (
    <div className={containerClasses}>
      <div className={cardClasses}>
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-float">
            <span className="text-white font-bold text-2xl">🤖</span>
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-center mb-2 text-gradient animate-slideIn">
          API Key de Gemini
        </h2>
        <p className={`text-center mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Para usar las explicaciones de IA, por favor introduce tu API Key de Google Gemini.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="apiKey" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Tu API Key
            </label>
            <input
              type="password"
              id="apiKey"
              className={inputClasses}
              placeholder="Introduce tu clave aquí"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <button type="submit" className={`${buttonClasses} mt-4`}>
            Guardar y Continuar
          </button>
        </form>
        <div className={`mt-6 text-xs text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <p>Puedes obtener tu API key desde Google AI Studio. La clave se guardará localmente en tu navegador.</p>
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline mt-1 block">
            Obtener una API Key →
          </a>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyPrompt;

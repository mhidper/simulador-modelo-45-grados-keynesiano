import React, { useState } from 'react';
import { ThemeProvider, useTheme } from './shared/contexts/ThemeContext';
import ModelSelector from './shared/components/ModelSelector';
import KeynesianCrossModel from './models/keynesian-cross/KeynesianCrossModel';
import ISLMModel from './models/is-lm/ISLMModel';
import Login from './shared/components/Login';
import Clock from './shared/components/Clock';
import { useUsageTracker } from './shared/hooks/useUsageTracker';
import LockedScreen from './shared/components/LockedScreen';
import UsageTimer from './shared/components/UsageTimer';

type AppView = 'menu' | 'keynesian-cross' | 'is-lm' | 'is-lm-pc' | 'open-economy';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('menu');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>(localStorage.getItem('geminiApiKey') || '');
  const { isDark, toggleTheme } = useTheme();
  const { isLocked, remainingTime, nextResetDate } = useUsageTracker();

  const handleLoginSuccess = (email: string) => {
    setUserEmail(email);
    setIsAuthenticated(true);
  };

  const handleModelSelect = (modelId: string) => {
    setCurrentView(modelId as AppView);
  };

  const handleBackToMenu = () => {
    setCurrentView('menu');
  };

  const handleApiKeySubmit = (key: string) => {
    localStorage.setItem('geminiApiKey', key);
    setApiKey(key);
    setShowApiKeyPrompt(false);
  };

  // Si el tiempo de uso se ha agotado, mostrar pantalla de bloqueo
  if (isLocked) {
    return <LockedScreen isDark={isDark} nextResetDate={nextResetDate} />;
  }

  // Si no está autenticado, mostrar Login
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} isDark={isDark} />;
  }

  const themeClasses = isDark 
    ? "min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white transition-all duration-500 ease-in-out"
    : "min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-gray-900 transition-all duration-500 ease-in-out";

  const headerClasses = isDark
    ? "bg-gradient-to-r from-slate-800 to-gray-800 shadow-2xl border-b border-slate-600"
    : "bg-gradient-to-r from-white to-blue-50 shadow-xl border-b border-blue-100";

  const renderCurrentView = () => {
    switch (currentView) {
      case 'keynesian-cross':
        return <KeynesianCrossModel isDark={isDark} onBack={handleBackToMenu} />;
      case 'is-lm':
        return <ISLMModel />;
      case 'is-lm-pc':
        return (
          <div className="container mx-auto p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Modelo IS-LM-PC</h2>
            <p className="text-gray-600">Próximamente...</p>
            <button onClick={handleBackToMenu} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
              Volver al Menú
            </button>
          </div>
        );
      case 'open-economy':
        return (
          <div className="container mx-auto p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Modelo con Sector Exterior</h2>
            <p className="text-gray-600">Próximamente...</p>
            <button onClick={handleBackToMenu} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
              Volver al Menú
            </button>
          </div>
        );
      default:
        return <ModelSelector onModelSelect={handleModelSelect} isDark={isDark} />;
    }
  };

  return (
    <>
      {showApiKeyPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-2xl w-96 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <h3 className="text-xl font-bold mb-4">API Key de Gemini</h3>
            <input
              type="password"
              placeholder="Pega tu API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className={`w-full p-2 rounded border mb-4 ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleApiKeySubmit(apiKey)}
                className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                Guardar
              </button>
              <button
                onClick={() => setShowApiKeyPrompt(false)}
                className={`flex-1 py-2 rounded border ${isDark ? 'border-slate-600 hover:bg-slate-700' : 'border-gray-300 hover:bg-gray-100'}`}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={themeClasses}>
        {/* Header solo se muestra en el menú principal */}
        {currentView === 'menu' && (
          <header className={headerClasses}>
            <div className="container mx-auto px-6 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">📊</span>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Simuladores de Macroeconomía
                    </h1>
                    <p className={`mt-1 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Plataforma Educativa Interactiva
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <UsageTimer remainingSecondsProp={remainingTime} isDark={isDark} />
                  <Clock isDark={isDark} />
                  <button
                    onClick={() => setShowApiKeyPrompt(true)}
                    className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                      isDark 
                        ? 'bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30' 
                        : 'bg-slate-800/10 hover:bg-slate-800/20 border border-slate-300/30'
                    }`}
                    title="Configurar API Key de Gemini"
                  >
                    🤖
                  </button>
                  <button
                    onClick={toggleTheme}
                    className={`
                      p-3 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95
                      ${isDark 
                        ? 'bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/30' 
                        : 'bg-slate-800/10 hover:bg-slate-800/20 border border-slate-300/30'
                      }
                    `}
                    title={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
                  >
                    {isDark ? (
                      <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </header>
        )}
        
        {/* Controles para vistas internas */}
        {currentView !== 'menu' && (
          <div className="fixed top-4 right-4 z-50 flex items-center space-x-2">
            <UsageTimer remainingSecondsProp={remainingTime} isDark={isDark} />
            <button
              onClick={toggleTheme}
              className={`
                p-3 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg
                ${isDark 
                  ? 'bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/30' 
                  : 'bg-slate-800/10 hover:bg-slate-800/20 border border-slate-300/30 bg-white/80 backdrop-blur-sm'
                }
              `}
              title={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            >
              {isDark ? (
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        )}
        
        <main className="flex-grow">
          {renderCurrentView()}
        </main>
        
        {/* Footer solo se muestra en el menú principal */}
        {currentView === 'menu' && (
          <footer className={`border-t transition-all duration-300 ${
            isDark ? 'border-slate-600' : 'border-gray-200'
          }`}>
            <div className="container mx-auto px-6 py-6">
              <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                <div className={`flex items-center space-x-3 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                    <span className="text-white text-sm font-bold">©</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Diseñado por</span>
                    <span className={`ml-1 font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
                      Manuel Alej. Hidalgo Pérez
                    </span>
                  </div>
                </div>
                
                <div className={`flex items-center space-x-4 text-xs ${
                  isDark ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  <span>Plataforma Educativa</span>
                  <span>•</span>
                  <span>Simuladores Macroeconómicos</span>
                  <span>•</span>
                  <span>© {new Date().getFullYear()}</span>
                </div>
              </div>
            </div>
          </footer>
        )}
      </div>
    </>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;

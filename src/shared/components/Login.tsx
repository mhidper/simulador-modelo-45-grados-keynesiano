import React, { useState } from 'react';
import authorizedUsers from '../../config/authorizedUsers.json'; // Import the JSON file

interface LoginProps {
  onLoginSuccess: (email: string) => void;
  isDark: boolean;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, isDark }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>(''); // This will correspond to 'code' in the JSON
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, introduce tu usuario y código de acceso.'); // Updated error message
      return;
    }

    // Authenticate against the authorizedUsers.json data
    const userFound = authorizedUsers.users.find(user => 
      user.email === email && user.code === password
    );

    if (userFound) {
      onLoginSuccess(email);
    } else {
      setError('Credenciales incorrectas o código de acceso inválido. Por favor, inténtalo de nuevo.'); // More specific error message
    }
  };

  const containerClasses = `
    flex items-center justify-center min-h-screen p-4
    ${isDark ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white' : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-gray-900'}
  `;

  const cardClasses = `
    p-8 rounded-2xl shadow-2xl w-full max-w-md animate-slideIn hover-lift
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

  const errorClasses = `
    text-red-500 text-sm mt-2
  `;

  return (
    <div className={containerClasses}>
      <div className={cardClasses}>
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-float">
            <span className="text-white font-bold text-2xl">🔑</span>
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-center mb-2 text-gradient animate-slideIn">
          Iniciar Sesión
        </h2>
        <p className={`text-center mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Accede a los simuladores de macroeconomía
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Usuario
            </label>
            <input
              type="text"
              id="email"
              className={inputClasses}
              placeholder="usuario"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Código de Acceso
            </label>
            <input
              type="password"
              id="password"
              className={inputClasses}
              placeholder="Código de Acceso"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className={errorClasses}>{error}</p>}
          <button type="submit" className={buttonClasses}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
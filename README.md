# 📊 Simuladores de Macroeconomía Interactivos

> **Una plataforma educativa moderna para el aprendizaje de modelos macroeconómicos a través de simulaciones interactivas**

[![React](https://img.shields.io/badge/React-19.1.1-61dafb?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646cff?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.0-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](https://choosealicense.com/licenses/mit/)

## 🎯 **Descripción**

**Simuladores de Macroeconomía** es una plataforma educativa interactiva diseñada para estudiantes universitarios y profesores de economía. Permite explorar y comprender modelos macroeconómicos fundamentales a través de simulaciones en tiempo real, con explicaciones detalladas generadas por inteligencia artificial.

### ✨ **Características Principales**

- 🎓 **Educativo**: Explicaciones narrativas como si fueras un profesor en clase
- 🔬 **Interactivo**: Ajusta parámetros y observa cambios inmediatos en los gráficos
- 🤖 **IA Integrada**: Explicaciones contextuales generadas con Google Gemini
- 📱 **Responsive**: Funciona perfectamente en desktop, tablet y móvil
- 🎨 **Tema Dual**: Modo claro y oscuro disponible
- 📊 **Visualizaciones Profesionales**: Gráficos interactivos con Recharts

## 🏗️ **Modelos Disponibles**

### ✅ **Actualmente Implementados**

#### 📈 **1. Modelo de 45 Grados (Cruz Keynesiana)**
- **Nivel**: Básico
- **Tiempo estimado**: 30-45 min
- **Descripción**: Modelo fundamental que determina el equilibrio en el mercado de bienes
- **Características**:
  - Ajuste de parámetros en tiempo real (c₀, c₁, I, G, T)
  - Visualización del efecto multiplicador
  - Explicaciones paso a paso del proceso económico
  - Análisis de políticas fiscales

### 🚧 **En Desarrollo**

#### ⚖️ **2. Modelo IS-LM**
- **Nivel**: Intermedio
- **Tiempo estimado**: 45-60 min
- **Descripción**: Equilibrio simultáneo en mercados de bienes y dinero
- **Estado**: Arquitectura preparada

#### 📈 **3. Modelo IS-LM-PC**
- **Nivel**: Intermedio
- **Tiempo estimado**: 60-75 min
- **Descripción**: Incorpora la Curva de Phillips al análisis IS-LM
- **Estado**: Planificado

#### 🌍 **4. Modelo con Sector Exterior**
- **Nivel**: Avanzado
- **Tiempo estimado**: 75-90 min
- **Descripción**: Economía abierta con tipos de cambio y comercio internacional
- **Estado**: Planificado

## 🚀 **Instalación y Uso**

### **Prerrequisitos**
- Node.js 18.0 o superior
- npm o yarn

### **Instalación**

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/keynesian-cross-model-simulator.git

# Navegar al directorio
cd keynesian-cross-model-simulator

# Instalar dependencias
npm install

# Configurar variables de entorno (opcional)
cp .env.example .env.local
# Editar .env.local con tu API key de Google Gemini
```

### **Ejecución**

```bash
# Desarrollo
npm run dev

# Construcción para producción
npm run build

# Vista previa de producción
npm run preview
```

La aplicación estará disponible en `http://localhost:5173`

## ⚙️ **Configuración**

### **Variables de Entorno**

Crea un archivo `.env.local` en la raíz del proyecto:

```env
VITE_GEMINI_API_KEY=tu_api_key_de_google_gemini
```

> **Nota**: La aplicación funciona sin API key, pero con explicaciones locales menos detalladas.

### **Obtener API Key de Google Gemini**

1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea una nueva API key
3. Cópiala en tu archivo `.env.local`

## 🏛️ **Arquitectura**

```
src/
├── models/
│   └── keynesian-cross/          # Modelo de 45 grados
│       ├── components/           # Componentes específicos
│       ├── services/            # Lógica de negocio
│       └── KeynesianCrossModel.tsx
├── shared/
│   ├── components/              # Componentes reutilizables
│   │   └── ModelSelector.tsx    # Menú principal
│   ├── contexts/                # Contextos React
│   │   └── ThemeContext.tsx     # Tema claro/oscuro
│   ├── types.ts                 # Tipos TypeScript
│   └── modelConfig.ts           # Configuración de modelos
└── App.tsx                      # Aplicación principal
```

### **Principios de Diseño**

- **🔧 Modularidad**: Cada modelo es independiente y autocontenido
- **🔄 Escalabilidad**: Fácil adición de nuevos modelos económicos
- **♻️ Reutilización**: Componentes y utilidades compartidas
- **📚 Separación de responsabilidades**: Lógica, presentación y datos separados

## 🎓 **Uso Educativo**

### **Para Estudiantes**

1. **📖 Explora**: Comienza con el Modelo de 45 Grados
2. **🔧 Experimenta**: Ajusta parámetros y observa los efectos
3. **📚 Aprende**: Lee las explicaciones detalladas
4. **🔄 Practica**: Prueba diferentes escenarios económicos

### **Para Profesores**

- **📺 Demostraciones en clase**: Proyecta y explica en tiempo real
- **📝 Tareas interactivas**: Asigna experimentos específicos
- **🔍 Análisis de casos**: Simula eventos económicos históricos
- **📊 Material de apoyo**: Exporta gráficos para presentaciones

## 🛠️ **Tecnologías Utilizadas**

### **Frontend**
- **React 19** - Librería de interfaces de usuario
- **TypeScript** - Tipado estático para JavaScript
- **Tailwind CSS** - Framework de CSS utilitario
- **Recharts** - Librería de gráficos para React

### **Construcción y Desarrollo**
- **Vite** - Herramienta de construcción rápida
- **ESLint** - Linter para JavaScript/TypeScript

### **Integraciones**
- **Google Gemini AI** - Generación de explicaciones inteligentes
- **React KaTeX** - Renderizado de fórmulas matemáticas

## 🤝 **Contribuir**

¡Las contribuciones son bienvenidas! Ya sea que quieras:

- 🐛 Reportar bugs
- 💡 Sugerir nuevas características
- 📝 Mejorar documentación
- 🔧 Implementar nuevos modelos económicos

### **Proceso de Contribución**

1. **Fork** el repositorio
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add: AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

### **Añadir Nuevos Modelos**

La arquitectura está diseñada para facilitar la adición de nuevos modelos:

1. Crea una carpeta en `src/models/nuevo-modelo/`
2. Implementa los componentes siguiendo la estructura existente
3. Actualiza `src/shared/modelConfig.ts`
4. Añade las rutas en `src/App.tsx`

## 📋 **Roadmap**

### **Versión 2.0** (Q2 2024)
- [ ] 🆕 Modelo IS-LM completo
- [ ] 📊 Sistema de escenarios predefinidos
- [ ] 📈 Calculadora avanzada del multiplicador
- [ ] 📄 Exportación de reportes PDF

### **Versión 3.0** (Q3 2024)
- [ ] 📈 Modelo IS-LM-PC (Curva de Phillips)
- [ ] 🎯 Sistema de ejercicios guiados
- [ ] 👥 Modo colaborativo para aulas
- [ ] 📚 Biblioteca de casos históricos

### **Versión 4.0** (Q4 2024)
- [ ] 🌍 Modelo de economía abierta
- [ ] 🤖 IA pedagógica avanzada
- [ ] 📱 Aplicación móvil nativa
- [ ] 🔗 API para desarrolladores

## 📜 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 **Autor**

**Manuel Alejandro Hidalgo Pérez**
- 🎓 Profesor de Macroeconomía
- 📧 Email: [tu-email@universidad.edu]
- 🔗 LinkedIn: [tu-linkedin]
- 🐦 Twitter: [@tu-twitter]

## 🙏 **Agradecimientos**

- **🎓 Universidad**: Por el apoyo a la innovación educativa
- **👥 Estudiantes**: Por su feedback y pruebas constantes
- **🤝 Comunidad Open Source**: Por las herramientas increíbles
- **🧠 Google AI**: Por hacer accesible la IA generativa

## 📊 **Estado del Proyecto**

![GitHub last commit](https://img.shields.io/github/last-commit/tu-usuario/keynesian-cross-model-simulator?style=flat-square)
![GitHub issues](https://img.shields.io/github/issues/tu-usuario/keynesian-cross-model-simulator?style=flat-square)
![GitHub stars](https://img.shields.io/github/stars/tu-usuario/keynesian-cross-model-simulator?style=flat-square)

---

<div align="center">

**🎓 Hecho con ❤️ para la educación económica**

[🚀 Demo en Vivo](https://tu-demo-url.com) | [📖 Documentación](https://tu-docs-url.com) | [🐛 Reportar Bug](https://github.com/tu-usuario/keynesian-cross-model-simulator/issues)

</div>

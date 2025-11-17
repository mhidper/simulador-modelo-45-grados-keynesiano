import type { EconomicModel } from './types';

export const ECONOMIC_MODELS: EconomicModel[] = [
  {
    id: 'keynesian-cross',
    name: 'Modelo de 45 Grados',
    description: 'El modelo básico keynesiano que determina el equilibrio en el mercado de bienes mediante la intersección de la demanda agregada con la línea de 45 grados.',
    level: 'basico',
    isAvailable: true,
    icon: '📊',
    color: 'from-blue-500 to-purple-600',
    estimatedTime: '30-45 min',
    learningObjectives: [
      'Comprender el equilibrio en el mercado de bienes',
      'Analizar el efecto multiplicador del gasto',
      'Evaluar el impacto de políticas fiscales',
      'Interpretar gráficamente la cruz keynesiana'
    ]
  },
  {
    id: 'is-lm',
    name: 'Modelo IS-LM',
    description: 'Análisis simultáneo del equilibrio en los mercados de bienes (IS) y dinero (LM). Permite estudiar las interacciones entre política fiscal y monetaria.',
    level: 'intermedio',
    isAvailable: true, // ✅ CAMBIADO A TRUE PARA PRUEBAS
    icon: '⚖️',
    color: 'from-green-500 to-teal-600',
    estimatedTime: '45-60 min',
    prerequisites: ['keynesian-cross'],
    learningObjectives: [
      'Entender el equilibrio simultáneo en dos mercados',
      'Analizar política fiscal en el modelo IS-LM',
      'Estudiar los efectos de la política monetaria',
      'Comprender la trampa de la liquidez'
    ]
  },
  {
    id: 'is-lm-pc',
    name: 'Modelo IS-LM-PC',
    description: 'Incorpora la Curva de Phillips al análisis IS-LM, permitiendo estudiar la relación entre inflación, desempleo y política macroeconómica.',
    level: 'intermedio',
    isAvailable: false,
    icon: '📈',
    color: 'from-orange-500 to-red-600',
    estimatedTime: '60-75 min',
    prerequisites: ['keynesian-cross', 'is-lm'],
    learningObjectives: [
      'Analizar la relación inflación-desempleo',
      'Estudiar políticas antiinflacionarias',
      'Comprender el trade-off de corto plazo',
      'Evaluar expectativas de inflación'
    ]
  },
  {
    id: 'open-economy',
    name: 'Modelo con Sector Exterior',
    description: 'Extensión del modelo IS-LM-PC a una economía abierta, incluyendo tipos de cambio, balanza comercial y flujos de capital.',
    level: 'avanzado',
    isAvailable: false,
    icon: '🌍',
    color: 'from-indigo-500 to-purple-600',
    estimatedTime: '75-90 min',
    prerequisites: ['keynesian-cross', 'is-lm', 'is-lm-pc'],
    learningObjectives: [
      'Modelar una economía abierta',
      'Analizar tipos de cambio flexibles vs fijos',
      'Estudiar la balanza de pagos',
      'Evaluar políticas en economía globalizada'
    ]
  }
];

export const getModelById = (id: string): EconomicModel | undefined => {
  return ECONOMIC_MODELS.find(model => model.id === id);
};

export const getAvailableModels = (): EconomicModel[] => {
  return ECONOMIC_MODELS.filter(model => model.isAvailable);
};

export const getModelsByLevel = (level: 'basico' | 'intermedio' | 'avanzado'): EconomicModel[] => {
  return ECONOMIC_MODELS.filter(model => model.level === level);
};

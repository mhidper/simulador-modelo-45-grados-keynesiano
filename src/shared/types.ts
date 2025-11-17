// Tipos globales de la aplicación
export interface EconomicModel {
  id: string;
  name: string;
  description: string;
  level: 'basico' | 'intermedio' | 'avanzado';
  isAvailable: boolean;
  icon: string;
  color: string;
  estimatedTime: string;
  learningObjectives: string[];
  prerequisites?: string[];
}

// Tipos específicos del modelo Keynesiano
export interface EconomicParams {
  c0: number; // Autonomous Consumption
  c1: number; // Marginal Propensity to Consume
  I: number;  // Investment (when using simple model)
  G: number;  // Government Spending
  T: number;  // Taxes (lump sum)
  t: number;  // Tax rate (proportional taxes)
  useLumpSumTax: boolean; // Toggle between T and tY
  
  // Investment function parameters
  b0: number; // Autonomous Investment
  b1: number; // Investment sensitivity to income
  b2: number; // Investment sensitivity to interest rate
  i: number;  // Interest rate
  useSimpleInvestment: boolean; // Toggle between I and I = b0 + b1*Y - b2*i
}

export interface ChartData {
  y_val: number;
  z_line: number;
  forty_five_line: number;
  z_prime_line: number | null;
}

// Tipos para el modelo IS-LM
export interface ISLMParams {
  // Parámetros de la función de consumo
  c0: number;  // Consumo autónomo
  c1: number;  // Propensión marginal a consumir (0 < c1 < 1)
  
  // Parámetros de la función de inversión: I = I0 + d1*Y - d2*i
  I0: number;  // Inversión autónoma
  d1: number;  // Sensibilidad de la inversión a la renta (d1 > 0)
  d2: number;  // Sensibilidad de la inversión al tipo de interés (d2 > 0)
  
  // Variables de política fiscal
  G: number;   // Gasto público
  T: number;   // Impuestos de suma fija (cuando useLumpSumTax = true)
  t: number;   // Tipo impositivo proporcional T = t*Y (cuando useLumpSumTax = false)
  useLumpSumTax: boolean; // true = T constante, false = T = t*Y
  
  // Política monetaria moderna: LM horizontal
  iBar: number; // Tipo de interés objetivo fijado por el BCE (ī)
}

export interface ISLMEquilibrium {
  Y: number;   // Producción de equilibrio
  i: number;   // Tipo de interés de equilibrio (= iBar en LM horizontal)
  C: number;   // Consumo de equilibrio
  I: number;   // Inversión de equilibrio
  
  // Gasto autónomo calculado
  A: number;
}

export interface ISCurvePoint {
  Y: number;   // Producción
  i: number;   // Tipo de interés correspondiente en la curva IS
}

export interface LMCurvePoint {
  Y: number;   // Producción (puede variar)
  i: number;   // Tipo de interés (constante = iBar en LM horizontal)
}

export interface ISLMChartData {
  isCurve: ISCurvePoint[];   // Puntos de la curva IS actual
  lmCurve: LMCurvePoint[];   // Puntos de la curva LM actual (horizontal)
  equilibrium: ISLMEquilibrium; // Punto de equilibrio actual
  
  // Curvas anteriores (para mostrar el cambio)
  previousIsCurve?: ISCurvePoint[];   // Curva IS antes del cambio
  previousLmCurve?: LMCurvePoint[];   // Curva LM antes del cambio
  previousEquilibrium?: ISLMEquilibrium; // Equilibrio anterior
}

export interface PhillipsCurveParams {
  // A definir cuando implementemos Phillips Curve
  u_n: number;    // Natural unemployment rate
  alpha: number;  // Sensitivity of inflation to unemployment
  pi_e: number;   // Expected inflation
}

export interface OpenEconomyParams {
  // A definir cuando implementemos sector exterior
  e: number;      // Exchange rate
  NX: number;     // Net exports
  m: number;      // Marginal propensity to import
}

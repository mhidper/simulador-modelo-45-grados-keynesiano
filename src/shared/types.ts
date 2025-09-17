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

// Tipos para futuros modelos
export interface ISLMParams {
  // A definir cuando implementemos IS-LM
  a: number;  // Autonomous spending
  b: number;  // Interest rate sensitivity of investment
  c: number;  // MPC
  d: number;  // Income sensitivity of money demand
  h: number;  // Interest rate sensitivity of money demand
  M: number;  // Money supply
  P: number;  // Price level
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

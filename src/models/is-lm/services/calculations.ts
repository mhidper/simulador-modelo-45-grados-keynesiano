import type { ISLMParams, ISCurvePoint, ISLMEquilibrium } from '../../../shared/types';

/**
 * Helper: Calcula la Renta Disponible (Yd) según el modelo fiscal
 * Yd = Y - T  (Impuestos fijos)
 * Yd = Y * (1-t) (Impuestos proporcionales)
 */
const getDisposableIncome = (Y: number, params: ISLMParams): number => {
  if (params.useLumpSumTax) {
    return Y - params.T;
  } else {
    return Y * (1 - params.t);
  }
};

/**
 * Calcula el gasto autónomo A
 * A = c0 + I0 + G - c1*T   (Si impuestos fijos)
 * A = c0 + I0 + G         (Si impuestos proporcionales, T no es autónomo)
 */
export const calculateAutonomousSpending = (params: ISLMParams): number => {
  const { c0, I0, G, c1, T, useLumpSumTax } = params;
  
  if (useLumpSumTax) {
    // T reduce el gasto autónomo vía consumo
    return c0 + I0 + G - c1 * T;
  } else {
    // Con impuestos proporcionales, T no es un valor fijo,
    // por lo que el gasto autónomo es simplemente...
    return c0 + I0 + G;
  }
};

/**
 * Calcula el denominador del multiplicador
 * m = 1 / (denominador)
 * den = 1 - c1 - d1            (Si impuestos fijos)
 * den = 1 - c1*(1-t) - d1      (Si impuestos proporcionales)
 */
const getMultiplierDenominator = (params: ISLMParams): number => {
  const { c1, d1, t, useLumpSumTax } = params;

  if (useLumpSumTax) {
    // Multiplicador simple
    return 1 - c1 - d1;
  } else {
    // El tipo 't' actúa como estabilizador automático, reduciendo el
    // efecto de c1 y d1 sobre la renta.
    const effectiveMPC = c1 * (1 - t);
    return 1 - effectiveMPC - d1;
  }
};

/**
 * Calcula el multiplicador del gasto autónomo en el modelo IS-LM
 * Con LM horizontal: ΔY/ΔA = 1 / (denominador)
 */
export const calculateFiscalMultiplier = (params: ISLMParams): number => {
  const denominator = getMultiplierDenominator(params);
  // Evitar división por cero si (c1+d1) >= 1
  return denominator > 0 ? 1 / denominator : 0;
};

/**
 * Calcula la producción dado un tipo de interés en la curva IS
 * Despejando Y de la ecuación IS:
 * Y = [Multiplicador] * (A - d2*i)
 * * @param i - Tipo de interés
 * @param params - Parámetros del modelo
 * @returns Producción correspondiente en la curva IS
 */
export const calculateISOutput = (i: number, params: ISLMParams): number => {
  const { d2 } = params;
  const A = calculateAutonomousSpending(params);
  const multiplier = calculateFiscalMultiplier(params);
  
  return multiplier * (A - d2 * i);
};

/**
 * Calcula el tipo de interés para un nivel de producción dado en la curva IS
 * Despejando i de la ecuación IS: i = (A/d2) - (Y / (multiplicador * d2))
 *
 * @param Y - Nivel de producción
 * @param params - Parámetros del modelo
 * @returns Tipo de interés correspondiente en la curva IS
 */
export const calculateISInterestRate = (Y: number, params: ISLMParams): number => {
  const { d2 } = params;
  const A = calculateAutonomousSpending(params);
  const multiplier = calculateFiscalMultiplier(params);
  
  if (multiplier === 0) return 0; // Evitar división por cero

  // i = (A/d2) - (Y / (multiplier * d2))
  // Sabiendo que multiplier = 1 / den
  // i = (A/d2) - (Y * den / d2)
  const denominator = getMultiplierDenominator(params);
  return (A - Y * denominator) / d2;
};

/**
 * Genera puntos de la curva IS para graficar
 */
export const generateISCurve = (
  params: ISLMParams,
  minY: number,
  maxY: number,
  numPoints: number = 100
): ISCurvePoint[] => {
  const points: ISCurvePoint[] = [];
  const step = (maxY - minY) / (numPoints - 1);
  
  for (let j = 0; j < numPoints; j++) {
    const Y = minY + j * step;
    // Usamos la función corregida que respeta t y T
    const i = calculateISInterestRate(Y, params);
    points.push({ Y, i });
  }
  
  return points;
};

/**
 * Calcula el consumo de equilibrio
 * C = c0 + c1 * Yd
 */
export const calculateConsumption = (Y: number, params: ISLMParams): number => {
  const { c0, c1 } = params;
  const Yd = getDisposableIncome(Y, params); // Usa el helper
  return c0 + c1 * Yd;
};

/**
 * Calcula la inversión de equilibrio
 * I = I0 + d1*Y - d2*i
 */
export const calculateInvestment = (Y: number, i: number, params: ISLMParams): number => {
  const { I0, d1, d2 } = params;
  return I0 + d1 * Y - d2 * i;
};

/**
 * Calcula el equilibrio del modelo IS-LM con LM horizontal
 * (Esta función ahora funciona para AMBOS modelos de impuestos)
 */
export const calculateISLMEquilibrium = (params: ISLMParams): ISLMEquilibrium => {
  const { iBar } = params;
  
  // Con LM horizontal, el tipo de interés es fijo
  const i = iBar;
  
  // Calculamos Y usando la ISOutput (que ya es sensible a T y t)
  const Y = calculateISOutput(i, params);
  
  // Calculamos consumo e inversión de equilibrio (Consumo ya es sensible)
  const C = calculateConsumption(Y, params);
  const I = calculateInvestment(Y, i, params);
  
  // Gasto autónomo (ya es sensible)
  const A = calculateAutonomousSpending(params);
  
  return { Y, i, C, I, A };
};

/**
 * Calcula la pendiente de la curva IS
 * Pendiente = - (denominador / d2)
 */
export const calculateISSlope = (params: ISLMParams): number => {
  const { d2 } = params;
  const denominator = getMultiplierDenominator(params);
  return -denominator / d2;
};
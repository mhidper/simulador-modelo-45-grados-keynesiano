import type { ISLMParams } from '../../../shared/types';
import { calculateISLMEquilibrium, calculateFiscalMultiplier, calculateISSlope } from './calculations';

/**
 * Encuentra qué parámetro cambió entre dos conjuntos de parámetros
 * Similar a la función del modelo de 45 grados
 */
export const getChangedParam = (
  oldParams: ISLMParams, 
  newParams: ISLMParams
): keyof ISLMParams | null => {
  // Primero verificar si cambió el modelo de impuestos
  if (oldParams.useLumpSumTax !== newParams.useLumpSumTax) {
    return 'useLumpSumTax';
  }
  
  // Lista de parámetros relevantes a verificar
  const relevantParams: (keyof ISLMParams)[] = ['c0', 'c1', 'I0', 'd1', 'd2', 'G', 'iBar'];
  
  // Añadir parámetros fiscales según el modelo actual
  if (newParams.useLumpSumTax) {
    relevantParams.push('T');
  } else {
    relevantParams.push('t');
  }
  
  // Buscar el primer parámetro que cambió
  for (const paramKey of relevantParams) {
    if (oldParams[paramKey] !== newParams[paramKey]) {
      return paramKey;
    }
  }
  
  return null;
};

/**
 * Obtiene información sobre el multiplicador fiscal en el modelo IS-LM
 */
export const getMultiplierInfo = (params: ISLMParams) => {
  const { c1, d1, d2, useLumpSumTax, t } = params;
  const multiplier = calculateFiscalMultiplier(params);
  const slope = calculateISSlope(params);
  
  if (useLumpSumTax) {
    return {
      multiplier,
      marginalPropensityToConsume: c1,
      investmentSensitivityToIncome: d1,
      investmentSensitivityToInterest: d2,
      isSlope: slope,
      taxEffect: 0,
      description: `Multiplicador con impuestos fijos: 1/(1-c₁-d₁) = ${multiplier.toFixed(2)}`
    };
  } else {
    // Con impuestos proporcionales, el multiplicador se ve afectado
    const effectiveMPC = c1 * (1 - t);
    return {
      multiplier,
      marginalPropensityToConsume: c1,
      effectiveMPC,
      investmentSensitivityToIncome: d1,
      investmentSensitivityToInterest: d2,
      isSlope: slope,
      taxEffect: c1 * t,
      description: `Multiplicador con impuestos proporcionales (tasa t=${t.toFixed(2)}): más complejo debido al efecto estabilizador automático`
    };
  }
};

/**
 * Verifica si se necesita resetear la baseline cuando cambia el modelo fiscal
 */
export const needsBaselineReset = (
  baselineParams: ISLMParams | null, 
  currentParams: ISLMParams
): boolean => {
  if (!baselineParams) return false;
  
  // Si cambió el modelo de impuestos, resetear baseline
  return baselineParams.useLumpSumTax !== currentParams.useLumpSumTax;
};

/**
 * Sincroniza parámetros entre modelos de impuestos para transiciones suaves
 */
export const syncTaxParameters = (
  fromParams: ISLMParams, 
  toUseLumpSum: boolean
): Partial<ISLMParams> => {
  const equilibrium = calculateISLMEquilibrium(fromParams);
  const currentY = equilibrium.Y;
  
  if (toUseLumpSum && !fromParams.useLumpSumTax) {
    // Convirtiendo de proporcional a fijo
    const equivalentT = fromParams.t * currentY;
    return { T: Math.max(0, Math.min(500, equivalentT)) };
  } else if (!toUseLumpSum && fromParams.useLumpSumTax) {
    // Convirtiendo de fijo a proporcional
    const equivalentT = currentY > 0 ? Math.max(0.05, Math.min(0.8, fromParams.T / currentY)) : 0.25;
    return { t: equivalentT };
  }
  
  return {};
};

/**
 * Calcula el efecto de un cambio en un parámetro sobre el equilibrio
 */
export const calculateParameterEffect = (
  param: keyof ISLMParams,
  oldParams: ISLMParams,
  newParams: ISLMParams
): {
  deltaY: number;
  deltaC: number;
  deltaI: number;
  affectedCurve: 'IS' | 'LM';
} => {
  const oldEquilibrium = calculateISLMEquilibrium(oldParams);
  const newEquilibrium = calculateISLMEquilibrium(newParams);
  
  return {
    deltaY: newEquilibrium.Y - oldEquilibrium.Y,
    deltaC: newEquilibrium.C - oldEquilibrium.C,
    deltaI: newEquilibrium.I - oldEquilibrium.I,
    affectedCurve: param === 'iBar' ? 'LM' : 'IS'
  };
};

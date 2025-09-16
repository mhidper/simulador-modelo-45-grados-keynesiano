
import type { EconomicParams } from '../../../shared/types';

export const calculateEquilibrium = (params: EconomicParams): number => {
  const { c0, c1, I, G, T, t, useLumpSumTax } = params;
  
  let multiplier: number;
  let autonomousSpending: number;
  
  if (useLumpSumTax) {
    // Traditional model: T = T0 (lump sum)
    if (1 - c1 === 0) {
      return Infinity;
    }
    multiplier = 1 / (1 - c1);
    autonomousSpending = c0 + I + G - c1 * T;
  } else {
    // Extended model: T = tY (proportional taxes)
    const marginalPropensityToSpend = c1 * (1 - t);
    if (1 - marginalPropensityToSpend === 0) {
      return Infinity;
    }
    multiplier = 1 / (1 - marginalPropensityToSpend);
    autonomousSpending = c0 + I + G;
  }
  
  return multiplier * autonomousSpending;
};

// Función para calcular el multiplicador sin el equilibrio
export const calculateMultiplier = (params: EconomicParams): number => {
  const { c1, t, useLumpSumTax } = params;
  
  if (useLumpSumTax) {
    return 1 / (1 - c1);
  } else {
    const marginalPropensityToSpend = c1 * (1 - t);
    return 1 / (1 - marginalPropensityToSpend);
  }
};

// Función para obtener información sobre el multiplicador
export const getMultiplierInfo = (params: EconomicParams) => {
  const { c1, t, useLumpSumTax } = params;
  
  if (useLumpSumTax) {
    return {
      multiplier: 1 / (1 - c1),
      marginalPropensityToSpend: c1,
      marginalPropensityToSave: 1 - c1,
      taxEffect: 0,
      description: "Multiplicador simple: 1/(1-c₁)"
    };
  } else {
    const marginalPropensityToSpend = c1 * (1 - t);
    return {
      multiplier: 1 / (1 - marginalPropensityToSpend),
      marginalPropensityToSpend: marginalPropensityToSpend,
      marginalPropensityToSave: 1 - c1,
      taxEffect: c1 * t,
      description: "Multiplicador con impuestos proporcionales: 1/(1-c₁(1-t))"
    };
  }
};

export const getChangedParam = (oldParams: EconomicParams, newParams: EconomicParams): keyof EconomicParams | null => {
    // Check if tax model changed first
    if (oldParams.useLumpSumTax !== newParams.useLumpSumTax) {
        return 'useLumpSumTax';
    }
    
    // For other parameters, check only relevant ones based on current model
    const relevantParams: (keyof EconomicParams)[] = ['c0', 'c1', 'I', 'G'];
    
    if (newParams.useLumpSumTax) {
        relevantParams.push('T');
    } else {
        relevantParams.push('t');
    }
    
    for (const paramKey of relevantParams) {
        if (oldParams[paramKey] !== newParams[paramKey]) {
            return paramKey;
        }
    }
    
    return null;
};

// Function to check if baseline and current params use different tax models
export const needsBaselineReset = (baselineParams: EconomicParams | null, currentParams: EconomicParams): boolean => {
    if (!baselineParams) return false;
    
    // If tax models are different, we might need to reset baseline
    return baselineParams.useLumpSumTax !== currentParams.useLumpSumTax;
};

// Function to sync parameters between tax models for smoother transitions
export const syncTaxParameters = (fromParams: EconomicParams, toUseLumpSum: boolean): Partial<EconomicParams> => {
    const currentY = calculateEquilibrium(fromParams);
    
    if (toUseLumpSum && !fromParams.useLumpSumTax) {
        // Converting from proportional to lump sum
        const equivalentT = fromParams.t * currentY;
        return { T: Math.max(0, Math.min(500, equivalentT)) };
    } else if (!toUseLumpSum && fromParams.useLumpSumTax) {
        // Converting from lump sum to proportional
        const equivalentT = currentY > 0 ? Math.max(0.05, Math.min(0.8, fromParams.T / currentY)) : 0.25;
        return { t: equivalentT };
    }
    
    return {};
}

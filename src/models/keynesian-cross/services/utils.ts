
import type { EconomicParams } from '../../../shared/types';

export const calculateEquilibrium = (params: EconomicParams): number => {
  const { c0, c1, I, G, T, t, useLumpSumTax, b0, b1, b2, i, useSimpleInvestment } = params;
  
  let multiplier: number;
  let autonomousSpending: number;
  
  if (useLumpSumTax) {
    // Traditional model: T = T0 (lump sum)
    if (useSimpleInvestment) {
      // Simple case: I is exogenous
      if (1 - c1 === 0) {
        return Infinity;
      }
      multiplier = 1 / (1 - c1);
      autonomousSpending = c0 + I + G - c1 * T;
    } else {
      // Complex case: I = b0 + b1*Y - b2*i
      // Y = c0 + c1*(Y - T) + b0 + b1*Y - b2*i + G
      // Y = c0 + c1*Y - c1*T + b0 + b1*Y - b2*i + G
      // Y - c1*Y - b1*Y = c0 - c1*T + b0 - b2*i + G
      // Y*(1 - c1 - b1) = c0 - c1*T + b0 - b2*i + G
      const denominator = 1 - c1 - b1;
      if (denominator === 0) {
        return Infinity;
      }
      multiplier = 1 / denominator;
      autonomousSpending = c0 - c1 * T + b0 - b2 * i + G;
    }
  } else {
    // Extended model: T = tY (proportional taxes)
    if (useSimpleInvestment) {
      // Simple case: I is exogenous
      const marginalPropensityToSpend = c1 * (1 - t);
      if (1 - marginalPropensityToSpend === 0) {
        return Infinity;
      }
      multiplier = 1 / (1 - marginalPropensityToSpend);
      autonomousSpending = c0 + I + G;
    } else {
      // Complex case: I = b0 + b1*Y - b2*i with proportional taxes
      // Y = c0 + c1*(Y - t*Y) + b0 + b1*Y - b2*i + G
      // Y = c0 + c1*Y*(1-t) + b0 + b1*Y - b2*i + G
      // Y - c1*Y*(1-t) - b1*Y = c0 + b0 - b2*i + G
      // Y*(1 - c1*(1-t) - b1) = c0 + b0 - b2*i + G
      const denominator = 1 - c1 * (1 - t) - b1;
      if (denominator === 0) {
        return Infinity;
      }
      multiplier = 1 / denominator;
      autonomousSpending = c0 + b0 - b2 * i + G;
    }
  }
  
  return multiplier * autonomousSpending;
};

// Función para calcular el multiplicador sin el equilibrio
export const calculateMultiplier = (params: EconomicParams): number => {
  const { c1, t, useLumpSumTax, b1, useSimpleInvestment } = params;
  
  if (useLumpSumTax) {
    if (useSimpleInvestment) {
      return 1 / (1 - c1);
    } else {
      return 1 / (1 - c1 - b1);
    }
  } else {
    if (useSimpleInvestment) {
      const marginalPropensityToSpend = c1 * (1 - t);
      return 1 / (1 - marginalPropensityToSpend);
    } else {
      const marginalPropensityToSpend = c1 * (1 - t) + b1;
      return 1 / (1 - marginalPropensityToSpend);
    }
  }
};

// Función para obtener información sobre el multiplicador
export const getMultiplierInfo = (params: EconomicParams) => {
  const { c1, t, useLumpSumTax, b1, useSimpleInvestment } = params;
  
  if (useLumpSumTax) {
    if (useSimpleInvestment) {
      return {
        multiplier: 1 / (1 - c1),
        marginalPropensityToSpend: c1,
        marginalPropensityToSave: 1 - c1,
        investmentEffect: 0,
        taxEffect: 0,
        description: "Multiplicador simple: 1/(1-c₁)"
      };
    } else {
      return {
        multiplier: 1 / (1 - c1 - b1),
        marginalPropensityToSpend: c1,
        marginalPropensityToSave: 1 - c1,
        investmentEffect: b1,
        taxEffect: 0,
        description: "Multiplicador con inversión endógena: 1/(1-c₁-b₁)"
      };
    }
  } else {
    if (useSimpleInvestment) {
      const marginalPropensityToSpend = c1 * (1 - t);
      return {
        multiplier: 1 / (1 - marginalPropensityToSpend),
        marginalPropensityToSpend: marginalPropensityToSpend,
        marginalPropensityToSave: 1 - c1,
        investmentEffect: 0,
        taxEffect: c1 * t,
        description: "Multiplicador con impuestos proporcionales: 1/(1-c₁(1-t))"
      };
    } else {
      const totalMarginalPropensity = c1 * (1 - t) + b1;
      return {
        multiplier: 1 / (1 - totalMarginalPropensity),
        marginalPropensityToSpend: c1 * (1 - t),
        marginalPropensityToSave: 1 - c1,
        investmentEffect: b1,
        taxEffect: c1 * t,
        description: "Multiplicador completo: 1/(1-c₁(1-t)-b₁)"
      };
    }
  }
};

// Función para calcular el valor efectivo de la inversión
export const calculateInvestment = (params: EconomicParams, Y: number): number => {
  const { I, b0, b1, b2, i, useSimpleInvestment } = params;
  
  if (useSimpleInvestment) {
    return I;
  } else {
    return b0 + b1 * Y - b2 * i;
  }
};

export const getChangedParam = (oldParams: EconomicParams, newParams: EconomicParams): keyof EconomicParams | null => {
    // Check if investment model changed first
    if (oldParams.useSimpleInvestment !== newParams.useSimpleInvestment) {
        return 'useSimpleInvestment';
    }
    
    // Check if tax model changed
    if (oldParams.useLumpSumTax !== newParams.useLumpSumTax) {
        return 'useLumpSumTax';
    }
    
    // For other parameters, check only relevant ones based on current models
    const relevantParams: (keyof EconomicParams)[] = ['c0', 'c1', 'G'];
    
    // Add investment-related parameters based on current model
    if (newParams.useSimpleInvestment) {
        relevantParams.push('I');
    } else {
        relevantParams.push('b0', 'b1', 'b2', 'i');
    }
    
    // Add tax-related parameters based on current model
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

// Function to check if baseline and current params use different models
export const needsBaselineReset = (baselineParams: EconomicParams | null, currentParams: EconomicParams): boolean => {
    if (!baselineParams) return false;
    
    // If investment or tax models are different, we might need to reset baseline
    return baselineParams.useLumpSumTax !== currentParams.useLumpSumTax ||
           baselineParams.useSimpleInvestment !== currentParams.useSimpleInvestment;
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
};

// Function to sync parameters between investment models
export const syncInvestmentParameters = (fromParams: EconomicParams, toSimple: boolean): Partial<EconomicParams> => {
    const currentY = calculateEquilibrium(fromParams);
    const currentI = calculateInvestment(fromParams, currentY);
    
    if (toSimple && !fromParams.useSimpleInvestment) {
        // Converting from endogenous to simple investment
        // Set I to current effective investment value
        return { I: Math.max(0, Math.min(500, currentI)) };
    } else if (!toSimple && fromParams.useSimpleInvestment) {
        // Converting from simple to endogenous investment
        // Try to approximate current I with reasonable b0, b1, b2 values
        const suggestedB0 = fromParams.I * 0.8; // Most investment is autonomous
        const suggestedB1 = 0.1; // Small income effect
        const suggestedB2 = 1000; // Moderate interest rate sensitivity
        
        return { 
            b0: suggestedB0,
            b1: suggestedB1,
            b2: suggestedB2
        };
    }
    
    return {};
};

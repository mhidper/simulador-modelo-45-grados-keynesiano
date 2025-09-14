
import type { EconomicParams } from '../types';

export const calculateEquilibrium = (params: EconomicParams): number => {
  const { c0, c1, I, G, T } = params;
  if (1 - c1 === 0) {
    return Infinity;
  }
  const multiplier = 1 / (1 - c1);
  const autonomousSpending = c0 + I + G - c1 * T;
  return multiplier * autonomousSpending;
};

export const getChangedParam = (oldParams: EconomicParams, newParams: EconomicParams): keyof EconomicParams | null => {
    for (const key in newParams) {
        const paramKey = key as keyof EconomicParams;
        if (oldParams[paramKey] !== newParams[paramKey]) {
            return paramKey;
        }
    }
    return null;
}

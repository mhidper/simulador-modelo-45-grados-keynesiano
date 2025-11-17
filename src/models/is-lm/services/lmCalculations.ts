import type { ISLMParams, LMCurvePoint } from '../../../shared/types';

/**
 * Genera puntos de la curva LM horizontal
 * En el modelo moderno, el BCE fija el tipo de interés objetivo (iBar)
 * Por tanto, la LM es una línea horizontal en i = iBar
 * 
 * @param params - Parámetros del modelo
 * @param minY - Producción mínima para el gráfico
 * @param maxY - Producción máxima para el gráfico
 * @param numPoints - Número de puntos a generar
 * @returns Array de puntos (Y, i) de la curva LM horizontal
 */
export const generateLMCurve = (
  params: ISLMParams,
  minY: number,
  maxY: number,
  numPoints: number = 100
): LMCurvePoint[] => {
  const { iBar } = params;
  const points: LMCurvePoint[] = [];
  const step = (maxY - minY) / (numPoints - 1);
  
  // La LM es horizontal: para cualquier Y, i = iBar
  for (let j = 0; j < numPoints; j++) {
    const Y = minY + j * step;
    points.push({ Y, i: iBar });
  }
  
  return points;
};

/**
 * Obtiene el tipo de interés de equilibrio en la LM
 * Con LM horizontal, siempre es iBar independientemente de Y
 * 
 * @param params - Parámetros del modelo
 * @returns Tipo de interés fijado por el BCE
 */
export const getLMInterestRate = (params: ISLMParams): number => {
  return params.iBar;
};

/**
 * Verifica si la política monetaria es acomodaticia
 * Compara el tipo de interés actual con un tipo de referencia
 * 
 * @param currentRate - Tipo de interés actual (iBar)
 * @param referenceRate - Tipo de interés de referencia (e.g., tipo natural)
 * @returns true si la política es acomodaticia (iBar < referencia)
 */
export const isAccommodativePolicy = (currentRate: number, referenceRate: number): boolean => {
  return currentRate < referenceRate;
};

/**
 * Calcula el desplazamiento de la LM tras un cambio en el tipo de interés objetivo
 * Retorna el cambio en el tipo de interés (Δi)
 * 
 * @param oldIBar - Tipo de interés objetivo anterior
 * @param newIBar - Tipo de interés objetivo nuevo
 * @returns Cambio en el tipo de interés
 */
export const calculateLMShift = (oldIBar: number, newIBar: number): number => {
  return newIBar - oldIBar;
};

/**
 * Determina el tipo de política monetaria basándose en el cambio de iBar
 * 
 * @param deltaI - Cambio en el tipo de interés (Δi)
 * @returns Descripción de la política monetaria
 */
export const getMonetaryPolicyType = (deltaI: number): string => {
  if (deltaI < 0) {
    return 'expansiva'; // El BCE reduce el tipo de interés
  } else if (deltaI > 0) {
    return 'restrictiva'; // El BCE aumenta el tipo de interés
  } else {
    return 'neutral'; // Sin cambios
  }
};

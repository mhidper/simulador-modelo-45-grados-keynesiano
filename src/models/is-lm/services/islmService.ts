import type { ISLMParams, ISLMChartData, ISLMEquilibrium } from '../../../shared/types';
import { generateISCurve, calculateISLMEquilibrium } from './calculations';
import { generateLMCurve } from './lmCalculations';

/**
 * Genera todos los datos necesarios para graficar el modelo IS-LM
 * Incluye las curvas IS y LM, y el punto de equilibrio
 * 
 * @param params - Parámetros del modelo
 * @param minY - Producción mínima para el gráfico (default: 0)
 * @param maxY - Producción máxima para el gráfico (default: se calcula automáticamente)
 * @returns Datos completos para el gráfico IS-LM
 */
export const generateISLMChartData = (
  params: ISLMParams,
  minY?: number,
  maxY?: number
): ISLMChartData => {
  // Calcular equilibrio primero
  const equilibrium = calculateISLMEquilibrium(params);
  
  // Definir rangos del gráfico
  const minYValue = minY ?? 0;
  const maxYValue = maxY ?? equilibrium.Y * 1.5; // 150% de Y de equilibrio
  
  // Generar curvas
  const isCurve = generateISCurve(params, minYValue, maxYValue, 100);
  const lmCurve = generateLMCurve(params, minYValue, maxYValue, 100);
  
  return {
    isCurve,
    lmCurve,
    equilibrium
  };
};

/**
 * Calcula el efecto de un cambio en el gasto público (política fiscal)
 * Retorna el equilibrio inicial y el nuevo equilibrio tras el cambio
 * 
 * @param params - Parámetros iniciales del modelo
 * @param deltaG - Cambio en el gasto público (ΔG)
 * @returns Objeto con equilibrio inicial y nuevo equilibrio
 */
export const analyzeFiscalPolicyEffect = (
  params: ISLMParams,
  deltaG: number
): { initial: ISLMEquilibrium; final: ISLMEquilibrium; multiplier: number } => {
  // Equilibrio inicial
  const initial = calculateISLMEquilibrium(params);
  
  // Nuevos parámetros con ΔG
  const newParams = { ...params, G: params.G + deltaG };
  const final = calculateISLMEquilibrium(newParams);
  
  // Calcular multiplicador efectivo: ΔY/ΔG
  const multiplier = (final.Y - initial.Y) / deltaG;
  
  return { initial, final, multiplier };
};

/**
 * Calcula el efecto de un cambio en los impuestos (política fiscal)
 * Retorna el equilibrio inicial y el nuevo equilibrio tras el cambio
 * 
 * @param params - Parámetros iniciales del modelo
 * @param deltaT - Cambio en los impuestos (ΔT)
 * @returns Objeto con equilibrio inicial y nuevo equilibrio
 */
export const analyzeTaxPolicyEffect = (
  params: ISLMParams,
  deltaT: number
): { initial: ISLMEquilibrium; final: ISLMEquilibrium; multiplier: number } => {
  // Equilibrio inicial
  const initial = calculateISLMEquilibrium(params);
  
  // Nuevos parámetros con ΔT
  const newParams = { ...params, T: params.T + deltaT };
  const final = calculateISLMEquilibrium(newParams);
  
  // Calcular multiplicador efectivo: ΔY/ΔT
  const multiplier = (final.Y - initial.Y) / deltaT;
  
  return { initial, final, multiplier };
};

/**
 * Calcula el efecto de un cambio en el tipo de interés objetivo (política monetaria)
 * Retorna el equilibrio inicial y el nuevo equilibrio tras el cambio
 * 
 * @param params - Parámetros iniciales del modelo
 * @param deltaIBar - Cambio en el tipo de interés objetivo (ΔiBar)
 * @returns Objeto con equilibrio inicial y nuevo equilibrio
 */
export const analyzeMonetaryPolicyEffect = (
  params: ISLMParams,
  deltaIBar: number
): { initial: ISLMEquilibrium; final: ISLMEquilibrium; deltaY: number; deltaI: number } => {
  // Equilibrio inicial
  const initial = calculateISLMEquilibrium(params);
  
  // Nuevos parámetros con ΔiBar
  const newParams = { ...params, iBar: params.iBar + deltaIBar };
  const final = calculateISLMEquilibrium(newParams);
  
  // Cambios en producción y tipo de interés
  const deltaY = final.Y - initial.Y;
  const deltaI = final.i - initial.i;
  
  return { initial, final, deltaY, deltaI };
};

/**
 * Analiza el efecto combinado de política fiscal y monetaria
 * Útil para estudiar policy mix
 * 
 * @param params - Parámetros iniciales del modelo
 * @param deltaG - Cambio en el gasto público
 * @param deltaIBar - Cambio en el tipo de interés objetivo
 * @returns Equilibrio inicial y final con el policy mix
 */
export const analyzePolicyMix = (
  params: ISLMParams,
  deltaG: number,
  deltaIBar: number
): { initial: ISLMEquilibrium; final: ISLMEquilibrium } => {
  // Equilibrio inicial
  const initial = calculateISLMEquilibrium(params);
  
  // Aplicar ambas políticas simultáneamente
  const newParams = {
    ...params,
    G: params.G + deltaG,
    iBar: params.iBar + deltaIBar
  };
  const final = calculateISLMEquilibrium(newParams);
  
  return { initial, final };
};

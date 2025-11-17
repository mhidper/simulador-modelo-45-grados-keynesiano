import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ISLMParams, ISLMEquilibrium } from '../../../shared/types';

// Obtener API key
const getApiKey = (): string | null => {
  let apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    apiKey = localStorage.getItem('geminiApiKey');
  }
  
  return apiKey || null;
};

const paramDescriptions: Record<keyof ISLMParams, { name: string, realExample: string, symbol: string }> = {
  c0: { name: "Consumo Autónomo", realExample: "el gasto básico que hace una familia incluso sin ingresos", symbol: "c₀" },
  c1: { name: "Propensión Marginal a Consumir", realExample: "si una familia recibe 100€ extra, cuántos euros de esos 100 gasta", symbol: "c₁" },
  I0: { name: "Inversión Autónoma", realExample: "inversión empresarial que no depende de la renta ni del interés", symbol: "I₀" },
  d1: { name: "Sensibilidad de Inversión a la Renta", realExample: "cuánto más invierten las empresas cuando crece la economía", symbol: "d₁" },
  d2: { name: "Sensibilidad de Inversión al Interés", realExample: "cuánto cae la inversión cuando el BCE sube los tipos", symbol: "d₂" },
  G: { name: "Gasto Público", realExample: "cuando el gobierno construye hospitales o paga pensiones", symbol: "G" },
  T: { name: "Impuestos", realExample: "impuestos que pagan las familias", symbol: "T" },
  t: { name: "Tipo Impositivo", realExample: "el porcentaje de la renta que se paga en impuestos", symbol: "t" },
  useLumpSumTax: { name: "Tipo de Impuestos", realExample: "determina si son fijos o proporcionales", symbol: "modelo" },
  iBar: { name: "Tipo de Interés Objetivo", realExample: "el tipo que fija el BCE", symbol: "ī" }
};

const generateLocalExplanation = (
  oldParams: ISLMParams,
  newParams: ISLMParams,
  changedParam: keyof ISLMParams,
  oldEquilibrium: ISLMEquilibrium,
  newEquilibrium: ISLMEquilibrium
): string => {
  const desc = paramDescriptions[changedParam];
  const oldValue = oldParams[changedParam];
  const newValue = newParams[changedParam];
  const deltaY = newEquilibrium.Y - oldEquilibrium.Y;
  const deltaC = newEquilibrium.C - oldEquilibrium.C;
  const deltaI = newEquilibrium.I - oldEquilibrium.I;
  const affectedCurve = changedParam === 'iBar' ? 'LM' : 'IS';
  
  return `### 📊 Cambio en ${desc.name} (${desc.symbol})

Has modificado ${desc.realExample} de ${typeof oldValue === 'number' ? oldValue.toFixed(2) : oldValue} a ${typeof newValue === 'number' ? newValue.toFixed(2) : newValue}.

**Curva afectada:** ${affectedCurve} se desplaza ${deltaY > 0 ? 'hacia la derecha' : 'hacia la izquierda'}.

**Cambios en el equilibrio:**
- Producción: ${oldEquilibrium.Y.toFixed(0)} → ${newEquilibrium.Y.toFixed(0)} millones € (${deltaY > 0 ? '+' : ''}${deltaY.toFixed(0)})
- Consumo: ${oldEquilibrium.C.toFixed(0)} → ${newEquilibrium.C.toFixed(0)} millones € (${deltaC > 0 ? '+' : ''}${deltaC.toFixed(0)})
- Inversión: ${oldEquilibrium.I.toFixed(0)} → ${newEquilibrium.I.toFixed(0)} millones € (${deltaI > 0 ? '+' : ''}${deltaI.toFixed(0)})
- Tipo de interés: ${newEquilibrium.i.toFixed(2)}%

${deltaY > 0 ? 'La economía se expande.' : 'La economía se contrae.'}`;
};

export const generateISLMExplanation = async (
  oldParams: ISLMParams,
  newParams: ISLMParams,
  changedParam: keyof ISLMParams,
  oldEquilibrium: ISLMEquilibrium,
  newEquilibrium: ISLMEquilibrium
): Promise<string> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    return generateLocalExplanation(oldParams, newParams, changedParam, oldEquilibrium, newEquilibrium);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-pro",
      generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
    });

    const desc = paramDescriptions[changedParam];
    const oldValue = oldParams[changedParam];
    const newValue = newParams[changedParam];
    const deltaY = newEquilibrium.Y - oldEquilibrium.Y;
    const deltaC = newEquilibrium.C - oldEquilibrium.C;
    const deltaI = newEquilibrium.I - oldEquilibrium.I;
    const affectedCurve = changedParam === 'iBar' ? 'LM' : 'IS';

    const prompt = `Eres un profesor de macroeconomía explicando el modelo IS-LM a alumnos universitarios. Tu tono es cercano, pedagógico y claro.

### Tarea
Un alumno ha movido un parámetro en un simulador. Explica el impacto de este cambio en la economía, paso a paso.

### Contexto del Cambio
- **Parámetro Cambiado:** ${desc.name} (${desc.symbol})
- **Valor Anterior:** ${typeof oldValue === 'number' ? oldValue.toFixed(2) : oldValue}
- **Valor Nuevo:** ${typeof newValue === 'number' ? newValue.toFixed(2) : newValue}

### Datos del Equilibrio
- **Equilibrio Inicial:**
  - Producción (Y): ${oldEquilibrium.Y.toFixed(0)} millones €
  - Consumo (C): ${oldEquilibrium.C.toFixed(0)} millones €
  - Inversión (I): ${oldEquilibrium.I.toFixed(0)} millones €
- **Nuevo Equilibrio:**
  - Producción (Y): ${newEquilibrium.Y.toFixed(0)} millones € (Cambio: ${deltaY > 0 ? '+' : ''}${deltaY.toFixed(0)})
  - Consumo (C): ${newEquilibrium.C.toFixed(0)} millones € (Cambio: ${deltaC > 0 ? '+' : ''}${deltaC.toFixed(0)})
  - Inversión (I): ${newEquilibrium.I.toFixed(0)} millones € (Cambio: ${deltaI > 0 ? '+' : ''}${deltaI.toFixed(0)})
  - Tipo de Interés (i): ${newEquilibrium.i.toFixed(2)}% (Fijado por el BCE, ${changedParam === 'iBar' ? 'ha cambiado' : 'se mantiene'})

### Instrucciones de Respuesta
1.  **Piensa Paso a Paso (Chain of Thought Interno):**
    * 1. Identifica el cambio (ej. "aumento del Gasto Público").
    * 2. Identifica la curva afectada (${affectedCurve}).
    * 3. Describe el desplazamiento (ej. "La IS se desplaza a la derecha").
    * 4. Describe el mecanismo de transmisión (ej. "Más G -> Más Demanda -> Más Producción...").
    * 5. Describe los efectos secundarios (ej. "Más Producción -> Más Renta -> Más Consumo e Inversión").
    * 6. Concluye con el nuevo equilibrio.
2.  **Formato de Salida (Lo que ve el usuario):**
    * Genera una explicación fluida y en párrafos basada en tu pensamiento paso a paso.
    * **No** escribas "Piensa Paso a Paso" ni uses listas numeradas en la respuesta final.
    * Empieza saludando el cambio (ej. "¡Buena pregunta! Fijaos, hemos subido el Gasto Público...").
    * Explica el mecanismo de forma intuitiva, usando los datos para cuantificar el impacto.
    * Usa **negritas** para los conceptos clave (Curva IS, Curva LM, producción, consumo, inversión).
    * Habla en español de España.
    * Sé conciso (3-4 párrafos).`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error: any) {
    console.error("Error IA:", error);
    
    if (error?.message?.includes('429') || error?.message?.includes('quota')) {
      console.warn("⚠️ Cuota de API excedida - usando explicación local");
    }
    
    return generateLocalExplanation(oldParams, newParams, changedParam, oldEquilibrium, newEquilibrium);
  }
};

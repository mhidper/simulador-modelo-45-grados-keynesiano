import { GoogleGenAI } from "@google/genai";
import type { EconomicParams } from '../types';

// The API key is sourced from the environment variable `process.env.API_KEY`
// as per the project guidelines.
// Fix: Correctly initialize GoogleGenAI with a named apiKey parameter.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const paramDescriptions: Record<keyof EconomicParams, { name: string, effect: string }> = {
    c0: { name: "Consumo Autónomo (c₀)", effect: "el nivel de consumo cuando la renta es cero" },
    c1: { name: "Propensión Marginal a Consumir (c₁)", effect: "la pendiente de la función de consumo" },
    I: { name: "Inversión (I)", effect: "el gasto de las empresas" },
    G: { name: "Gasto Público (G)", effect: "el gasto del gobierno" },
    T: { name: "Impuestos (T)", effect: "los impuestos netos (impuestos menos transferencias)" }
};

export const generateExplanation = async (
    oldParams: EconomicParams, 
    newParams: EconomicParams,
    changedParam: keyof EconomicParams,
    oldEquilibrium: number,
    newEquilibrium: number
): Promise<string> => {
    
    const paramInfo = paramDescriptions[changedParam];
    const oldValue = oldParams[changedParam];
    const newValue = newParams[changedParam];
    
    const prompt = `
Eres un experto en macroeconomía keynesiana y tu trabajo es explicar los cambios en el modelo del aspa keynesiana a un estudiante universitario.
Sé claro, conciso y utiliza un lenguaje sencillo pero preciso. Usa markdown para formatear la respuesta con encabezados (###), negritas (**) y listas (-).

Contexto del cambio:
- Parámetro modificado: ${paramInfo.name} (${changedParam})
- Valor anterior: ${oldValue}
- Nuevo valor: ${newValue}
- Renta de equilibrio anterior (Y): ${oldEquilibrium.toFixed(2)}
- Nueva renta de equilibrio (Y'): ${newEquilibrium.toFixed(2)}

Tarea:
Explica en tres pasos el impacto del cambio en la economía, siguiendo esta estructura:

1.  **Impacto Directo:** Describe cómo el cambio en ${paramInfo.name} afecta directamente a la curva de demanda agregada (ZZ). Menciona si la curva se desplaza hacia arriba o hacia abajo y por qué. Si cambió c1, explica cómo cambia la pendiente.
2.  **El Proceso Multiplicador:** Explica cómo el cambio inicial en la demanda desencadena un proceso multiplicador. Describe el ciclo de gasto-renta que lleva a un cambio mayor en la producción total.
3.  **Nuevo Equilibrio:** Describe el nuevo punto de equilibrio (A'). Compara la nueva renta de equilibrio con la anterior y resume el efecto total del cambio.

La respuesta debe ser solo la explicación en 3 pasos, sin añadir saludos ni introducciones adicionales.
`;

    try {
        // Fix: Use ai.models.generateContent with the correct model and parameters.
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        // Fix: Extract text directly from response.text property.
        return response.text.trim();
    } catch (error) {
        console.error("Error generating explanation from Gemini API:", error);
        throw new Error("Failed to generate explanation from Gemini API.");
    }
};

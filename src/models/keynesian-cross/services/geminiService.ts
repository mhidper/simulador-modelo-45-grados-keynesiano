import { GoogleGenerativeAI } from "@google/generative-ai";
import type { EconomicParams } from '../../../shared/types';

const paramDescriptions: Record<keyof EconomicParams, { name: string, realExample: string, symbol: string }> = {
    c0: { name: "Consumo Autónomo", realExample: "el gasto básico que hacen las familias incluso cuando no tienen ingresos", symbol: "c₀" },
    c1: { name: "Propensión Marginal a Consumir", realExample: "la tendencia a gastar cuando reciben dinero extra", symbol: "c₁" },
    I: { name: "Inversión Empresarial", realExample: "cuando las empresas compran maquinaria nueva o abren nuevas tiendas", symbol: "I" },
    G: { name: "Gasto Público", realExample: "cuando el gobierno construye carreteras o paga salarios de funcionarios", symbol: "G" },
    T: { name: "Impuestos Fijos", realExample: "impuestos que se pagan independientemente de la renta", symbol: "T₀" },
    t: { name: "Tipo Impositivo", realExample: "el porcentaje de la renta que se paga en impuestos", symbol: "t" },
    useLumpSumTax: { name: "Modelo Fiscal", realExample: "determina si los impuestos son fijos o proporcionales", symbol: "modelo" },
    b0: { name: "Inversión Autónoma", realExample: "la inversión que hacen las empresas independientemente de la renta o el interés", symbol: "b₀" },
    b1: { name: "Sensibilidad de Inversión a la Renta", realExample: "cuánto más invierten las empresas cuando mejora la economía", symbol: "b₁" },
    b2: { name: "Sensibilidad de Inversión al Interés", realExample: "cuánto menos invierten las empresas cuando suben los tipos de interés", symbol: "b₂" },
    i: { name: "Tipo de Interés", realExample: "el coste del dinero que influye en las decisiones de inversión", symbol: "i" },
    useSimpleInvestment: { name: "Modelo de Inversión", realExample: "determina si la inversión es fija o depende de la renta y el interés", symbol: "modelo" }
};

const generateNarrativeLocalExplanation = (oldParams: EconomicParams, newParams: EconomicParams, changedParam: keyof EconomicParams, oldEquilibrium: number, newEquilibrium: number): string => {
    const paramInfo = paramDescriptions[changedParam];
    const oldValue = oldParams[changedParam];
    const newValue = newParams[changedParam];
    const change = typeof oldValue === 'number' && typeof newValue === 'number' ? newValue - oldValue : 0;
    const equilibriumChange = newEquilibrium - oldEquilibrium;
    const isIncrease = change > 0;
    const multiplier = newParams.useLumpSumTax ? (newParams.useSimpleInvestment ? (1 / (1 - newParams.c1)) : (1 / (1 - newParams.c1 - newParams.b1))) : (newParams.useSimpleInvestment ? (1 / (1 - newParams.c1 * (1 - newParams.t))) : (1 / (1 - newParams.c1 * (1 - newParams.t) - newParams.b1)));

    let story = "";

    switch (changedParam) {
        case 'I':
            story = `Las empresas han ${isIncrease ? 'aumentado' : 'reducido'} su inversión en ${Math.abs(change)} millones de euros. Esto significa ${isIncrease ? 'más máquinas nuevas, más tiendas abiertas, más fábricas construidas' : 'menos compras de equipamiento, proyectos cancelados, menor expansión empresarial'}. El efecto se extiende: ${isIncrease ? 'más trabajadores contratados, más ingresos familiares, más consumo' : 'menos empleos, menores ingresos, reducción del consumo'}. Con un multiplicador de ${multiplier.toFixed(2)}, estos ${Math.abs(change)} millones de inversión han generado ${Math.abs(equilibriumChange).toFixed(0)} millones de ${equilibriumChange > 0 ? 'crecimiento' : 'contracción'} económica total.`;
            break;
        case 'G':
            story = `El gobierno ha ${isIncrease ? 'aumentado' : 'reducido'} el gasto público en ${Math.abs(change)} millones de euros. En términos concretos: ${isIncrease ? 'más obras públicas, más funcionarios contratados, más inversión en hospitales y colegios' : 'recortes en obra pública, menos contrataciones, menor inversión en servicios públicos'}. Los empleados públicos ${isIncrease ? 'que cobran este dinero extra lo gastan' : 'que pierden ingresos reducen su consumo'}. El multiplicador de ${multiplier.toFixed(2)} ha convertido estos ${Math.abs(change)} millones en ${Math.abs(equilibriumChange).toFixed(0)} millones de impacto económico total.`;
            break;
        case 'T':
            story = `Hemos cambiado los impuestos fijos de ${oldValue} a ${newValue} millones. Esto significa que ${isIncrease ? 'cada ciudadano paga ' + Math.abs(change/45) + '€ más al año' : 'cada ciudadano recibe ' + Math.abs(change/45) + '€ más al año'} (aproximadamente). ${isIncrease ? 'Las familias tienen menos dinero disponible para gastar en consumo.' : 'Las familias tienen más dinero disponible para sus gastos diarios.'}. Con una propensión a consumir de ${newParams.c1}, esto ${isIncrease ? 'reduce' : 'aumenta'} el consumo total, y el multiplicador amplifica el efecto hasta ${Math.abs(equilibriumChange).toFixed(0)} millones de euros de impacto económico.`;
            break;
        case 'c0':
            story = `Hemos cambiado el consumo autónomo de ${oldValue} a ${newValue} millones. Esto significa que las familias españolas ${isIncrease ? 'gastan ' + Math.abs(change) + ' millones más' : 'han reducido en ' + Math.abs(change) + ' millones'} sus gastos básicos. ${isIncrease ? 'Las familias se sienten más seguras y gastan más en necesidades básicas: mejor comida, vivienda más digna...' : 'Las familias se han apretado el cinturón, reduciendo hasta los gastos más esenciales.'}. Este cambio inicial se amplifica por el efecto multiplicador de ${multiplier.toFixed(2)}. El resultado: la economía ha ${isIncrease ? 'crecido' : 'decrecido'} en ${Math.abs(equilibriumChange).toFixed(0)} millones de euros anuales.`;
            break;
        default:
            story = `Se ha modificado el parámetro ${paramInfo.name} y la economía ha respondido en consecuencia. El equilibrio ha cambiado de ${oldEquilibrium.toFixed(0)} a ${newEquilibrium.toFixed(0)} millones de euros.`;
    }

    return `### 📊 Análisis del Cambio Económico\n\n${story}\n\n---\n\n💡 Concepto clave: ${paramInfo.realExample}\n\n🔢 Multiplicador actual: ${multiplier.toFixed(2)} ${newParams.useLumpSumTax ? '(modelo de impuestos fijos)' : '(modelo de impuestos proporcionales)'}\n\n*Esta explicación ha sido generada localmente. Para análisis aún más detallados, puedes configurar la API de Gemini.*`;
};

export const generateExplanation = async (oldParams: EconomicParams, newParams: EconomicParams, changedParam: keyof EconomicParams, oldEquilibrium: number, newEquilibrium: number): Promise<string> => {
    try {
        let apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            apiKey = localStorage.getItem('geminiApiKey') || '';
        }
        
        if (!apiKey) {
            return generateNarrativeLocalExplanation(oldParams, newParams, changedParam, oldEquilibrium, newEquilibrium);
        }
        
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
        
        const paramInfo = paramDescriptions[changedParam];
        const prompt = `Eres un profesor de macroeconomía explicando... el modelo keynesiano de 45 grados.

        CAMBIO REALIZADO:
        - Parámetro modificado: ${paramInfo.name}
        - Valor anterior: ${oldParams[changedParam]}
        - Valor nuevo: ${newParams[changedParam]}
        - Equilibrio anterior: Y = ${oldEquilibrium.toFixed(0)} millones €
        - Equilibrio nuevo: Y = ${newEquilibrium.toFixed(0)} millones €

        Genera una explicación pedagógica en español que incluya:
        1. Qué ha cambiado en la economía (2-3 frases)
        2. El mecanismo de transmisión y el efecto multiplicador (2-3 frases)
        3. El impacto final en las familias y empresas españolas con ejemplos concretos (2-3 frases)

        Usa un tono profesional pero cercano. Incluye cifras específicas del cambio. Máximo 6-7 frases en total.`;
        
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Error generando explicación:", error);
        return generateNarrativeLocalExplanation(oldParams, newParams, changedParam, oldEquilibrium, newEquilibrium);
    }
};

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { EconomicParams } from '../../../shared/types';

// Inicializar la IA de Google Gemini
const initializeGemini = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("VITE_GEMINI_API_KEY no encontrada. Usando explicaciones locales.");
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

const genAI = initializeGemini();

const paramDescriptions: Record<keyof EconomicParams, { name: string, realExample: string, symbol: string }> = {
    c0: { 
        name: "Consumo Autónomo", 
        realExample: "el gasto básico que hacen las familias incluso cuando no tienen ingresos",
        symbol: "c₀"
    },
    c1: { 
        name: "Propensión Marginal a Consumir", 
        realExample: "la tendencia a gastar cuando reciben dinero extra",
        symbol: "c₁"
    },
    I: { 
        name: "Inversión Empresarial", 
        realExample: "cuando las empresas compran maquinaria nueva o abren nuevas tiendas",
        symbol: "I"
    },
    G: { 
        name: "Gasto Público", 
        realExample: "cuando el gobierno construye carreteras o paga salarios de funcionarios",
        symbol: "G"
    },
    T: { 
        name: "Impuestos Fijos", 
        realExample: "impuestos que se pagan independientemente de la renta",
        symbol: "T₀"
    },
    t: { 
        name: "Tipo Impositivo", 
        realExample: "el porcentaje de la renta que se paga en impuestos",
        symbol: "t"
    },
    useLumpSumTax: { 
        name: "Modelo Fiscal", 
        realExample: "determina si los impuestos son fijos o proporcionales",
        symbol: "modelo"
    }
};

// Función de fallback con explicaciones narrativas locales
const generateNarrativeLocalExplanation = (
    oldParams: EconomicParams, 
    newParams: EconomicParams,
    changedParam: keyof EconomicParams,
    oldEquilibrium: number,
    newEquilibrium: number
): string => {
    const paramInfo = paramDescriptions[changedParam];
    const oldValue = oldParams[changedParam];
    const newValue = newParams[changedParam];
    const change = typeof oldValue === 'number' && typeof newValue === 'number' ? newValue - oldValue : 0;
    const equilibriumChange = newEquilibrium - oldEquilibrium;
    const isIncrease = change > 0;
    const multiplier = newParams.useLumpSumTax ? 
        (1 / (1 - newParams.c1)) : 
        (1 / (1 - newParams.c1 * (1 - newParams.t)));

    let story = "";

    switch (changedParam) {
        case 'useLumpSumTax':
            const newModel = newParams.useLumpSumTax ? 'impuestos fijos' : 'impuestos proporcionales';
            const oldModel = oldParams.useLumpSumTax ? 'impuestos fijos' : 'impuestos proporcionales';
            const newMultiplier = newParams.useLumpSumTax ? (1 / (1 - newParams.c1)) : (1 / (1 - newParams.c1 * (1 - newParams.t)));
            const oldMultiplier = oldParams.useLumpSumTax ? (1 / (1 - oldParams.c1)) : (1 / (1 - oldParams.c1 * (1 - oldParams.t)));
            
            story = `¡Acabamos de hacer algo muy interesante! Hemos cambiado el modelo fiscal de ${oldModel} a ${newModel}.

¿Qué significa esto en términos prácticos? ${newParams.useLumpSumTax ? 
                'Ahora los impuestos son de "suma fija", lo que significa que todos pagan la misma cantidad independientemente de su renta. Es como una cuota fija.' : 
                'Ahora los impuestos son "proporcionales", cada persona paga un ' + (newParams.t * 100).toFixed(0) + '% de su renta. Quien gana más, paga más.'}

Pensad en las implicaciones: ${newParams.useLumpSumTax ? 
                'Con impuestos fijos, cuando te suben el sueldo, te quedas con TODO el aumento. Tu incentivo para trabajar más es máximo.' : 
                'Con impuestos proporcionales, cuando te suben el sueldo, Hacienda se lleva una parte. Esto reduce tu incentivo a trabajar más horas extra.'}

Esto cambia radicalmente el multiplicador económico. Hemos pasado de ${oldMultiplier.toFixed(2)} a ${newMultiplier.toFixed(2)}. ${newMultiplier > oldMultiplier ? 
                'El multiplicador ha AUMENTADO - la economía ahora es MÁS reactiva a los estímulos económicos.' : 
                'El multiplicador ha DISMINUIDO - los impuestos actúan como "estabilizadores automáticos" que amortiguan tanto las subidas como las bajadas.'}

El equilibrio económico ha pasado de ${oldEquilibrium.toFixed(0)} millones a ${newEquilibrium.toFixed(0)} millones - una diferencia de ${Math.abs(equilibriumChange).toFixed(0)} millones de euros anuales.

${newParams.useLumpSumTax ? 
                'Con impuestos fijos tenemos una economía más volátil pero potencialmente más dinámica.' : 
                'Con impuestos proporcionales tenemos una economía más estable, con menos auges pero también menos crisis.'}`;
            break;

        case 't':
            story = `Acabamos de cambiar el tipo impositivo del ${(oldValue * 100).toFixed(0)}% al ${(newValue * 100).toFixed(0)}%. 

Ejemplo práctico: Una familia que gana 3000€ mensuales antes pagaba ${(oldValue * 3000).toFixed(0)}€ en impuestos y se quedaba con ${(3000 * (1 - oldValue)).toFixed(0)}€. Ahora paga ${(newValue * 3000).toFixed(0)}€ y se queda con ${(3000 * (1 - newValue)).toFixed(0)}€.

${isIncrease ? 'Cada familia tiene ' + Math.abs((oldValue - newValue) * 3000).toFixed(0) + '€ menos cada mes' : 'Cada familia tiene ' + Math.abs((newValue - oldValue) * 3000).toFixed(0) + '€ más cada mes'} para gastar.

Esto cambia la "propensión efectiva a gastar" de ${(oldParams.c1 * (1 - oldValue)).toFixed(2)} a ${(newParams.c1 * (1 - newValue)).toFixed(2)}. 

Cuando a una familia le llega un euro extra de renta, antes se gastaba ${(oldParams.c1 * (1 - oldValue) * 100).toFixed(0)} céntimos, ahora se gasta ${(newParams.c1 * (1 - newValue) * 100).toFixed(0)} céntimos.

El multiplicador económico ha cambiado de ${(1 / (1 - oldParams.c1 * (1 - oldValue))).toFixed(2)} a ${(1 / (1 - newParams.c1 * (1 - newValue))).toFixed(2)}.

Resultado: la economía ha ${equilibriumChange > 0 ? 'crecido' : 'decrecido'} en ${Math.abs(equilibriumChange).toFixed(0)} millones de euros anuales.`;
            break;

        case 'c0':
            story = `Hemos cambiado el consumo autónomo de ${oldValue} a ${newValue} millones. Esto significa que las familias españolas ${isIncrease ? 'gastan ' + Math.abs(change) + ' millones más' : 'han reducido en ' + Math.abs(change) + ' millones'} sus gastos básicos, incluso sin cambios en sus ingresos.

¿Qué ha pasado en la vida real? ${isIncrease ? 'Las familias se sienten más seguras y gastan más en necesidades básicas: mejor comida, vivienda más digna...' : 'Las familias se han apretado el cinturón, reduciendo hasta los gastos más esenciales por precaución.'}

Este cambio inicial se amplifica por el efecto multiplicador de ${multiplier.toFixed(2)}. El resultado: la economía ha ${isIncrease ? 'crecido' : 'decrecido'} en ${Math.abs(equilibriumChange).toFixed(0)} millones de euros anuales.`;
            break;

        case 'c1':
            story = `Hemos modificado la propensión marginal a consumir de ${oldValue} a ${newValue}. 

Esto significa que cuando a una familia le llegan 100€ extra, antes se gastaba ${(oldValue * 100).toFixed(0)}€ y ahora se gasta ${(newValue * 100).toFixed(0)}€.

${isIncrease ? 'La gente se ha vuelto más gastadora - quizás por optimismo económico o porque ahorrar da menos rendimiento.' : 'La gente se ha vuelto más ahorradora - tal vez por incertidumbre o porque necesita ahorrar más para objetivos como vivienda.'}

Este cambio en el comportamiento ha transformado el multiplicador de ${(1/(1-oldValue)).toFixed(2)} a ${multiplier.toFixed(2)}, ${isIncrease ? 'acelerando' : 'frenando'} la velocidad de circulación del dinero en la economía.

Resultado: ${Math.abs(equilibriumChange).toFixed(0)} millones de euros ${equilibriumChange > 0 ? 'más' : 'menos'} de actividad económica anual.`;
            break;

        case 'I':
            story = `Las empresas han ${isIncrease ? 'aumentado' : 'reducido'} su inversión en ${Math.abs(change)} millones de euros. 

Esto significa ${isIncrease ? 'más máquinas nuevas, más tiendas abiertas, más fábricas construidas' : 'menos compras de equipamiento, proyectos cancelados, menor expansión empresarial'}.

El efecto se extiende: ${isIncrease ? 'más trabajadores contratados, más ingresos familiares, más consumo' : 'menos empleos, menores ingresos, reducción del consumo'}.

Con un multiplicador de ${multiplier.toFixed(2)}, estos ${Math.abs(change)} millones de inversión han generado ${Math.abs(equilibriumChange).toFixed(0)} millones de ${equilibriumChange > 0 ? 'crecimiento' : 'contracción'} económica total.`;
            break;

        case 'G':
            story = `El gobierno ha ${isIncrease ? 'aumentado' : 'reducido'} el gasto público en ${Math.abs(change)} millones de euros.

En términos concretos: ${isIncrease ? 'más obras públicas, más funcionarios contratados, más inversión en hospitales y colegios' : 'recortes en obra pública, menos contrataciones, menor inversión en servicios públicos'}.

Los empleados públicos ${isIncrease ? 'que cobran este dinero extra lo gastan' : 'que pierden ingresos reducen su consumo'}, y este efecto se propaga por toda la economía.

El multiplicador de ${multiplier.toFixed(2)} ha convertido estos ${Math.abs(change)} millones en ${Math.abs(equilibriumChange).toFixed(0)} millones de impacto económico total.`;
            break;

        case 'T':
            story = `Hemos cambiado los impuestos fijos de ${oldValue} a ${newValue} millones. 

Esto significa que ${isIncrease ? 'cada ciudadano paga ' + Math.abs(change/45) + '€ más al año en tasas fijas' : 'cada ciudadano recibe ' + Math.abs(change/45) + '€ más al año por reducción de tasas'} (aproximadamente).

${isIncrease ? 'Las familias tienen menos dinero disponible para gastar en consumo.' : 'Las familias tienen más dinero disponible para sus gastos diarios.'}

Con una propensión a consumir de ${newParams.c1}, esto ${isIncrease ? 'reduce' : 'aumenta'} el consumo total, y el multiplicador amplifica el efecto hasta ${Math.abs(equilibriumChange).toFixed(0)} millones de euros de impacto económico.`;
            break;

        default:
            story = `Se ha modificado el parámetro ${paramInfo.name} y la economía ha respondido en consecuencia. El equilibrio ha cambiado de ${oldEquilibrium.toFixed(0)} a ${newEquilibrium.toFixed(0)} millones de euros, reflejando cómo las modificaciones se propagan mediante el efecto multiplicador.`;
            break;
    }

    return `
### 📊 Análisis del Cambio Económico

${story}

---

**💡 Concepto clave:** ${paramInfo.realExample}

**🔢 Multiplicador actual:** ${multiplier.toFixed(2)} ${newParams.useLumpSumTax ? '(modelo de impuestos fijos)' : '(modelo de impuestos proporcionales con t=' + (newParams.t*100).toFixed(0) + '%)'}

*Esta explicación ha sido generada localmente. Para análisis aún más detallados, puedes configurar la API de Gemini.*
    `.trim();
};

// Función principal exportada
export const generateExplanation = async (
    oldParams: EconomicParams, 
    newParams: EconomicParams,
    changedParam: keyof EconomicParams,
    oldEquilibrium: number,
    newEquilibrium: number
): Promise<string> => {
    
    try {
        // Por ahora usar siempre explicación local para evitar errores
        return generateNarrativeLocalExplanation(oldParams, newParams, changedParam, oldEquilibrium, newEquilibrium);
        
    } catch (error) {
        console.error("Error generando explicación:", error);
        return "Error al generar la explicación económica.";
    }
};

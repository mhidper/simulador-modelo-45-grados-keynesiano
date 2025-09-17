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
    },
    b0: {
        name: "Inversión Autónoma",
        realExample: "la inversión que hacen las empresas independientemente de la renta o el interés",
        symbol: "b₀"
    },
    b1: {
        name: "Sensibilidad de Inversión a la Renta",
        realExample: "cuánto más invierten las empresas cuando mejora la economía",
        symbol: "b₁"
    },
    b2: {
        name: "Sensibilidad de Inversión al Interés",
        realExample: "cuánto menos invierten las empresas cuando suben los tipos de interés",
        symbol: "b₂"
    },
    i: {
        name: "Tipo de Interés",
        realExample: "el coste del dinero que influye en las decisiones de inversión",
        symbol: "i"
    },
    useSimpleInvestment: {
        name: "Modelo de Inversión",
        realExample: "determina si la inversión es fija o depende de la renta y el interés",
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
        (newParams.useSimpleInvestment ? (1 / (1 - newParams.c1)) : (1 / (1 - newParams.c1 - newParams.b1))) : 
        (newParams.useSimpleInvestment ? (1 / (1 - newParams.c1 * (1 - newParams.t))) : (1 / (1 - newParams.c1 * (1 - newParams.t) - newParams.b1)));

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

        case 'useSimpleInvestment':
            const newInvestmentModel = newParams.useSimpleInvestment ? 'inversión fija' : 'inversión endógena';
            const oldInvestmentModel = oldParams.useSimpleInvestment ? 'inversión fija' : 'inversión endógena';
            const currentY = newEquilibrium;
            const effectiveInvestment = newParams.useSimpleInvestment ? 
                newParams.I : 
                (newParams.b0 + newParams.b1 * currentY - newParams.b2 * newParams.i);
            
            story = `¡Acabamos de cambiar el modelo de inversión! Hemos pasado de ${oldInvestmentModel} a ${newInvestmentModel}.

¿Qué significa esto? ${newParams.useSimpleInvestment ? 
                'Ahora la inversión empresarial es una cantidad fija de ' + newParams.I + ' millones, independientemente de lo que pase en la economía.' : 
                'Ahora la inversión empresarial depende de las condiciones económicas: I = ' + newParams.b0 + ' + ' + newParams.b1 + '×Y - ' + newParams.b2 + '×i'}

En el mundo real: ${newParams.useSimpleInvestment ? 
                'Las empresas tienen un presupuesto fijo para inversión, sin importar si la economía va bien o mal, ni si el dinero está caro o barato.' : 
                'Las empresas ajustan sus planes de inversión según vean la economía. Si va bien (Y alto), invierten más. Si el dinero está caro (i alto), invierten menos.'}

Esto cambia drásticamente la dinámica económica. ${newParams.useSimpleInvestment ? 
                'Con inversión fija, la economía es más predecible pero menos dinámica.' : 
                'Con inversión endógena, la economía es más volátil - los auges se amplifican pero también las crisis.'}

El multiplicador ha cambiado y el equilibrio ha pasado a ${newEquilibrium.toFixed(0)} millones. La inversión efectiva ahora es de ${effectiveInvestment.toFixed(0)} millones.`;
            break;

        case 'b0':
            story = `Hemos cambiado la inversión autónoma de ${oldValue} a ${newValue} millones. Esta es la parte de la inversión empresarial que NO depende de la situación económica.

En términos prácticos: ${isIncrease ? 'Las empresas han decidido invertir ' + Math.abs(change) + ' millones más en proyectos básicos' : 'Las empresas han recortado ' + Math.abs(change) + ' millones en sus planes de inversión esencial'} - independientemente de cómo vaya la economía o cuánto cueste el dinero.

Ejemplos: ${isIncrease ? 'renovación de fábricas anticuadas, apertura de nuevas sedes, compra de patentes necesarias' : 'aplazamiento de renovaciones, cierre de proyectos no rentables, reducción de I+D'}.

Con el multiplicador actual de ${multiplier.toFixed(2)}, este cambio de ${Math.abs(change)} millones ha generado ${Math.abs(equilibriumChange).toFixed(0)} millones de impacto total en la economía.`;
            break;

        case 'b1':
            story = `Hemos modificado la sensibilidad de la inversión a la renta de ${oldValue} a ${newValue}. Esto significa que por cada euro extra de PIB, las empresas ahora ${isIncrease ? 'aumentan' : 'reducen'} su inversión en ${Math.abs(change * 1000).toFixed(0)} céntimos.

¿Qué significa en la realidad? ${isIncrease ? 'Las empresas se han vuelto más optimistas y agresivas: cuando ven que la economía mejora, rápidamente aumentan sus planes de inversión.' : 'Las empresas se han vuelto más conservadoras: aunque la economía mejore, prefieren mantener sus niveles de inversión.'}

Esto ${isIncrease ? 'acelera' : 'estabiliza'} la economía. ${isIncrease ? 'Los auges serán más fuertes pero también las caídas.' : 'La economía será más estable frente a las fluctuaciones.'}

El multiplicador ahora es ${multiplier.toFixed(2)}, ${isIncrease ? 'mayor que antes debido al efecto acelerador' : 'lo que refleja una economía más amortiguada'}. El equilibrio ha cambiado a ${newEquilibrium.toFixed(0)} millones.`;
            break;

        case 'b2':
            story = `Hemos cambiado la sensibilidad de la inversión al tipo de interés de ${oldValue} a ${newValue}. Esto significa que cuando los tipos suben 1 punto porcentual, la inversión ahora ${isIncrease ? 'cae' : 'cae menos'} en ${newValue} millones.

En el mundo empresarial: ${isIncrease ? 'Las empresas se han vuelto más sensibles al coste del dinero. Un pequeño cambio en los tipos de interés ahora afecta mucho a sus decisiones de inversión.' : 'Las empresas se han vuelto menos dependientes del coste del crédito - quizás tienen más liquidez propia o proyectos muy rentables.'}

Con el tipo actual del ${(newParams.i * 100).toFixed(1)}%, la inversión efectiva es ${(newParams.b0 + newParams.b1 * newEquilibrium - newParams.b2 * newParams.i).toFixed(0)} millones.

Esto hace que la política monetaria sea ${isIncrease ? 'MÁS efectiva' : 'MENOS efectiva'}. ${isIncrease ? 'El Banco Central tiene más poder para influir en la economía cambiando los tipos.' : 'Los cambios en los tipos de interés tendrán menos impacto en la actividad económica.'}`;  
            break;

        case 'i':
            const oldInvestmentValue = oldParams.b0 + oldParams.b1 * oldEquilibrium - oldParams.b2 * oldValue;
            const newInvestmentValue = newParams.b0 + newParams.b1 * newEquilibrium - newParams.b2 * newValue;
            const investmentChange = newInvestmentValue - oldInvestmentValue;
            
            story = `Hemos cambiado el tipo de interés del ${(oldValue * 100).toFixed(1)}% al ${(newValue * 100).toFixed(1)}%. 

Esto afecta directamente a las decisiones de inversión empresarial. ${isIncrease ? 'Con dinero más caro, las empresas han reducido su inversión' : 'Con dinero más barato, las empresas han aumentado su inversión'} en ${Math.abs(investmentChange).toFixed(0)} millones.

En términos prácticos: ${isIncrease ? 'Los proyectos empresariales ahora son menos rentables. Muchos se aplazan o cancelan porque el coste de financiación es demasiado alto.' : 'Los proyectos empresariales son más atractivos. Financiarse es más barato, así que se aprueban más inversiones.'}

La inversión total ha pasado de ${oldInvestmentValue.toFixed(0)} a ${newInvestmentValue.toFixed(0)} millones.

Este es un ejemplo clásico de cómo la política monetaria afecta a la economía real a través del canal de la inversión. El equilibrio final ha cambiado a ${newEquilibrium.toFixed(0)} millones.`;
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

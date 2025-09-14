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
        realExample: "el gasto básico que hacen las familias incluso cuando no tienen ingresos (comida básica, vivienda mínima, financiado con ahorros o ayuda familiar)",
        symbol: "c₀"
    },
    c1: { 
        name: "Propensión Marginal a Consumir", 
        realExample: "la tendencia natural de las personas a gastar cuando reciben dinero extra (si te llega una paga extra de 100€, ¿cuánto gastas y cuánto ahorras?)",
        symbol: "c₁"
    },
    I: { 
        name: "Inversión Empresarial", 
        realExample: "cuando las empresas compran maquinaria nueva, abren nuevas tiendas, construyen fábricas o desarrollan nuevos productos",
        symbol: "I"
    },
    G: { 
        name: "Gasto Público", 
        realExample: "cuando el gobierno construye carreteras, paga salarios de funcionarios, invierte en hospitales o financia programas sociales",
        symbol: "G"
    },
    T: { 
        name: "Impuestos Netos", 
        realExample: "la diferencia entre lo que el gobierno recauda (IRPF, IVA, etc.) y lo que devuelve en forma de ayudas y subsidios",
        symbol: "T"
    }
};

const generateNarrativeExplanation = async (
    oldParams: EconomicParams, 
    newParams: EconomicParams,
    changedParam: keyof EconomicParams,
    oldEquilibrium: number,
    newEquilibrium: number
): Promise<string> => {
    
    if (!genAI) {
        throw new Error("Gemini AI no está configurado");
    }

    const paramInfo = paramDescriptions[changedParam];
    const oldValue = oldParams[changedParam];
    const newValue = newParams[changedParam];
    const change = newValue - oldValue;
    const equilibriumChange = newEquilibrium - oldEquilibrium;
    const multiplier = 1 / (1 - newParams.c1);
    
    const prompt = `
Eres un profesor de universidad que está explicando macroeconomía a sus estudiantes en el aula. Acabas de mostrarles cómo cambiar un parámetro en el modelo keynesiano afecta a toda la economía, y ahora necesitas explicarles qué ha pasado de una manera que realmente lo entiendan y puedan visualizar.

IMPORTANTE: Escribe como si estuvieras hablando directamente a tus estudiantes en clase. Usa un lenguaje natural, cercano, con ejemplos reales que puedan entender. Cuenta una historia económica que haga que visualicen lo que está pasando en la economía real.

SITUACIÓN:
==========
Acabamos de cambiar ${paramInfo.name} (${paramInfo.symbol}) de ${oldValue} a ${newValue}.
Esto significa: ${paramInfo.realExample}

El equilibrio de la economía ha pasado de ${oldEquilibrium.toFixed(0)} a ${newEquilibrium.toFixed(0)} millones de euros.
Es decir, la economía ahora produce ${Math.abs(equilibriumChange).toFixed(0)} millones ${equilibriumChange > 0 ? 'MÁS' : 'MENOS'} cada año.

La propensión marginal a consumir es c₁ = ${newParams.c1}, lo que significa que cuando alguien recibe 100€ extra, gasta ${(newParams.c1 * 100).toFixed(0)}€ y ahorra ${((1-newParams.c1) * 100).toFixed(0)}€.

INSTRUCCIONES:
==============
Explica esto como si fueras un profesor hablando en clase. Tu explicación debe:

1. **Empezar conectando con la realidad**: Explica qué significa este cambio en el mundo real, con ejemplos concretos que los estudiantes puedan imaginar.

2. **Contar la historia paso a paso**: Narra cómo se desarrolla el proceso económico, como si fuera una historia con personajes reales (familias, empresas, gobierno). Explica qué pasa primero, luego qué, y después qué.

3. **Usar ejemplos numéricos concretos y sencillos**: En lugar de hablar en abstracto, pon ejemplos con números redondos que sean fáciles de seguir.

4. **Explicar el "por qué" detrás de cada paso**: No solo digas qué pasa, explica por qué tiene sentido que pase eso.

5. **Conectar con la experiencia personal**: Relaciona los conceptos con cosas que los estudiantes conocen de su propia vida.

6. **Usar un tono conversacional**: Como si realmente estuvieras hablando, no escribiendo un libro de texto.

ESTRUCTURA SUGERIDA (pero flexible):
===================================
- Introduce el cambio conectándolo con la realidad
- Explica qué pasa inmediatamente después del cambio
- Narra cómo se extiende el efecto por la economía (el multiplicador)
- Describe el nuevo equilibrio y qué significa para la gente real
- Reflexiona sobre las implicaciones más amplias

EJEMPLO DE TONO (úsalo como referencia):
=======================================
"Bueno, vamos a ver qué acaba de pasar aquí. Imagináos que sois una familia típica española..."
"Ahora, pensad en lo que haríais vosotros en esta situación..."
"¿Veis cómo va funcionando esto? Es como cuando..."
"Esto es exactamente lo que vemos en la realidad cuando..."

La explicación debe ser EXTENSA (mínimo 1200 palabras), narrativa, y hacer que los estudiantes realmente visualicen y entiendan el proceso económico como algo real y tangible, no como fórmulas abstractas.

¡Haz que cobren vida estos números!
`;

    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-pro",
            generationConfig: {
                temperature: 0.8,
                topP: 0.9,
                topK: 40,
                maxOutputTokens: 3000,
            }
        });

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        return text.trim();
        
    } catch (error) {
        console.error("Error con Gemini API:", error);
        throw error;
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
    const change = newValue - oldValue;
    const equilibriumChange = newEquilibrium - oldEquilibrium;
    const isIncrease = change > 0;
    const multiplier = 1 / (1 - newParams.c1);

    let story = "";

    switch (changedParam) {
        case 'c0':
            story = `
Vale, vamos a ver qué acaba de pasar aquí. Acabamos de cambiar el consumo autónomo de ${oldValue} a ${newValue}, lo que significa que las familias españolas ahora gastan ${Math.abs(change)} millones de euros ${isIncrease ? 'más' : 'menos'} en necesidades básicas cada año, incluso sin tener ingresos adicionales.

¿Qué significa esto en la vida real? Imagináos que las familias, por alguna razón, han decidido ${isIncrease ? 'gastar más en lo esencial' : 'apretarse el cinturón en gastos básicos'}. Quizás ${isIncrease ? 'se sienten más seguras y compran mejor comida, o deciden vivir en pisos algo mejores' : 'están preocupadas por el futuro y han decidido reducir incluso los gastos más básicos'}.

Ahora, pensad en lo que pasa cuando estas familias ${isIncrease ? 'aumentan' : 'reducen'} su gasto. No estamos hablando solo de números en un papel, estamos hablando de gente real comprando ${isIncrease ? 'más' : 'menos'} en el supermercado, ${isIncrease ? 'yendo más' : 'yendo menos'} a restaurantes, ${isIncrease ? 'comprando' : 'posponiendo'} ropa básica.

¿Y qué pasa entonces? Pues que los tenderos, los camareros, los dependientes de las tiendas de ropa... todos estos trabajadores ven que ${isIncrease ? 'tienen más trabajo' : 'les baja la actividad'}. Los dueños de estos negocios ${isIncrease ? 'empiezan a sonreír porque venden más' : 'fruncen el ceño porque las ventas bajan'}.

Aquí viene lo interesante, y esto es lo que hace que la economía sea fascinante: estos trabajadores y empresarios que ${isIncrease ? 'ganan más dinero' : 'ven reducidos sus ingresos'} también son consumidores. Cuando el tendero ve que vende más y gana más, ¿qué hace? Pues ${isIncrease ? 'se va a casa más contento y también gasta más' : 'se preocupa y también reduce su propio gasto'}.

Pero claro, como la propensión marginal a consumir es ${newParams.c1}, cuando estos comerciantes y trabajadores ${isIncrease ? 'reciben' : 'pierden'} 100 euros extra, se gastan ${(newParams.c1 * 100).toFixed(0)} euros y ahorran ${((1-newParams.c1) * 100).toFixed(0)} euros. Esto significa que el efecto se va extendiendo, pero cada vez con menos fuerza.

Es como cuando tiráis una piedra en un lago: la primera onda es la más grande, pero luego van saliendo ondas cada vez más pequeñas. En nuestro caso, el cambio inicial de ${Math.abs(change)} millones ha acabado generando un cambio total de ${Math.abs(equilibriumChange).toFixed(0)} millones en toda la economía. ¡El multiplicador ha funcionado!

Al final, la economía española ha acabado ${isIncrease ? 'creciendo' : 'contrayéndose'} en ${Math.abs(equilibriumChange).toFixed(0)} millones de euros anuales. Esto significa que ${isIncrease ? 'hay más empleo, más actividad, la gente está un poco mejor' : 'hay menos actividad económica, posiblemente más paro, y la gente lo nota en su día a día'}.

Lo que es impresionante de todo esto es que un cambio relativamente pequeño en cómo se comportan las familias puede tener un efecto muchísimo mayor en toda la economía. Por eso los economistas estamos siempre tan atentos a las "expectativas" y la "confianza" de los consumidores.
            `;
            break;

        case 'c1':
            story = `
Esto que acabamos de cambiar es muy interesante. Hemos modificado la propensión marginal a consumir de ${oldValue} a ${newValue}. Os explico qué significa esto con un ejemplo que todos podéis entender.

Imagináos que mañana os llega una paga extra de 1000 euros. Con c₁ = ${oldValue}, os habríais gastado ${(oldValue * 1000).toFixed(0)} euros y ahorrado ${((1-oldValue) * 1000).toFixed(0)} euros. Pero ahora, con c₁ = ${newValue}, os gastaríais ${(newValue * 1000).toFixed(0)} euros y ahorraríais ${((1-newValue) * 1000).toFixed(0)} euros.

Puede parecer un cambio pequeño, pero pensad en esto: no sois solo vosotros, son TODAS las familias de España las que han cambiado su forma de comportarse ante el dinero extra. ${isIncrease ? 'Ahora la gente es más gastadora' : 'Ahora la gente es más ahorradora'}.

¿Y por qué puede haber pasado esto? ${isIncrease ? 'Quizás la gente se siente más optimista sobre el futuro, o han bajado los tipos de interés y ahorrar da menos beneficio' : 'Tal vez hay incertidumbre económica, o la gente ve que los precios de la vivienda están muy altos y necesita ahorrar más para comprarse una casa'}.

Ahora viene lo fascinante: este cambio en cómo reacciona la gente al dinero extra cambia completamente cómo funciona toda la economía. Es como si hubieseis cambiado la "personalidad económica" del país.

Fijaos en lo que pasa. Cuando una empresa paga salarios a sus trabajadores, estos trabajadores ahora ${isIncrease ? 'se gastan una proporción mayor' : 'se gastan una proporción menor'} de ese dinero. Esto significa que ${isIncrease ? 'los comercios venden más, los bares tienen más clientes, las empresas venden más productos' : 'la actividad comercial se reduce, hay menos movimiento en la economía'}.

Pero aquí está el efecto multiplicador que os decía: cuando los comercios venden ${isIncrease ? 'más' : 'menos'}, también ${isIncrease ? 'ganan más dinero' : 'ingresan menos'}, y como estos comerciantes también tienen la nueva propensión a consumir, ${isIncrease ? 'gastan más de ese dinero extra' : 'reducen aún más su gasto'}.

Es como si hubierais cambiado la "velocidad" a la que circula el dinero por la economía. ${isIncrease ? 'Ahora el dinero se mueve más rápido, cambia de manos más veces, genera más actividad' : 'Ahora el dinero se mueve más lento, se queda más tiempo parado en las cuentas de ahorro'}.

El resultado final es que la economía ha pasado de producir ${oldEquilibrium.toFixed(0)} millones a ${newEquilibrium.toFixed(0)} millones anuales. Una diferencia de ${Math.abs(equilibriumChange).toFixed(0)} millones. ${isIncrease ? 'Es una expansión importante que se notará en forma de más empleo y más actividad' : 'Es una contracción que probablemente se traducirá en menos empleos y menos dinamismo económico'}.

Lo que me parece increíble de esto es que solo cambiando cómo reacciona la gente al dinero extra, sin cambiar la cantidad total de dinero en la economía, hemos conseguido ${isIncrease ? 'un crecimiento' : 'una contracción'} económica. ¡Eso es el poder de la psicología económica!
            `;
            break;

        case 'I':
            story = `
Acabamos de ver qué pasa cuando las empresas cambian sus planes de inversión, pasando de ${oldValue} a ${newValue} millones. Esto significa que las empresas españolas van a ${isIncrease ? 'invertir' : 'desinvertir'} ${Math.abs(change)} millones de euros ${isIncrease ? 'más' : 'menos'} este año.

¿Qué significa esto en términos reales? Imagináos que sois dueños de una panadería y habíais decidido ${isIncrease ? 'comprar un horno nuevo' : 'no renovar la maquinaria vieja'}. O que dirigís una startup y ${isIncrease ? 'vais a contratar más programadores' : 'habéis decidido no expandir el equipo'}. O que tenéis una empresa de construcción y ${isIncrease ? 'vais a comprar excavadoras nuevas' : 'vais a posponer la compra de maquinaria'}.

Ahora, pensad en la cadena de efectos que se desata. Cuando las empresas ${isIncrease ? 'compran más maquinaria' : 'reducen sus compras'}, ¿quién se beneficia o se perjudica? Los fabricantes de maquinaria, los vendedores, los transportistas que llevan esa maquinaria... toda una cadena de gente que ${isIncrease ? 'de repente tiene más trabajo' : 've cómo baja la demanda de sus servicios'}.

Pero además, estas empresas que ${isIncrease ? 'invierten más' : 'invierten menos'} también ${isIncrease ? 'contratan más trabajadores' : 'pueden despedir o no contratar'}. Pensad en ello: si una empresa compra máquinas nuevas, necesita gente para manejarlas. Si abre una nueva sucursal, necesita trabajadores para esa sucursal.

Y aquí viene el efecto dominó que hace que la economía sea tan interesante: todos estos trabajadores que ${isIncrease ? 'consiguen empleo o mejores salarios' : 'pierden el trabajo o ven reducidos sus ingresos'} son también consumidores. Cuando llegan a casa, ${isIncrease ? 'tienen más dinero para gastar' : 'tienen que reducir sus gastos'}.

Como la propensión marginal a consumir es ${newParams.c1}, cada euro extra que ganan estos trabajadores se convierte en ${(newParams.c1).toFixed(2)} euros de consumo adicional. Esto significa que ${isIncrease ? 'van más al supermercado, salen más a cenar, compran más ropa' : 'reducen sus compras, salen menos, posponen gastos'}.

¿Y qué pasa entonces? Que los supermercados, restaurantes y tiendas ${isIncrease ? 'venden más' : 'venden menos'}. Los dueños de estos negocios ${isIncrease ? 'ven subir sus ingresos' : 'ven bajar sus ventas'}, y como también son personas con la misma propensión a consumir, ${isIncrease ? 'también aumentan sus gastos' : 'también los reducen'}.

Es como una reacción en cadena. La inversión inicial de ${Math.abs(change)} millones ha acabado generando un cambio total en la economía de ${Math.abs(equilibriumChange).toFixed(0)} millones. ¡Casi ${multiplier.toFixed(1)} veces más!

Esto explica por qué los gobiernos y bancos centrales están tan preocupados por el "clima de inversión" y la "confianza empresarial". Cuando las empresas se animan a invertir, no solo benefician a sus propios negocios, sino que ponen en marcha una máquina de crecimiento económico que beneficia a toda la sociedad.

${isIncrease ? 'El resultado es que tenemos una economía más dinámica, con más empleo, más innovación y más bienestar general' : 'El resultado es una economía más estancada, con menos oportunidades de empleo y menos dinamismo'}.
            `;
            break;

        case 'G':
            story = `
Lo que acabamos de hacer es cambiar el gasto público de ${oldValue} a ${newValue} millones. Esto significa que el gobierno español ha decidido ${isIncrease ? 'gastar' : 'recortar'} ${Math.abs(change)} millones de euros ${isIncrease ? 'más' : 'menos'} este año.

¿En qué se traduce esto? Imagináos cosas concretas: ${isIncrease ? 'el gobierno decide construir una nueva línea de metro, contratar más profesores, invertir en hospitales nuevos, o aumentar las ayudas a las familias' : 'el gobierno cancela obras públicas, reduce personal en la administración, recorta ayudas sociales, o pospone inversiones en infraestructuras'}.

Pensad en las personas que esto afecta directamente. Si el gobierno ${isIncrease ? 'construye' : 'cancela'} una carretera, hablamos de ingenieros, albañiles, operadores de maquinaria, proveedores de materiales... Si ${isIncrease ? 'contrata' : 'despide'} profesores, hablamos de educadores que ${isIncrease ? 'consiguen trabajo' : 'se quedan en paro'}.

Todas estas personas que ${isIncrease ? 'reciben dinero del gobierno' : 'dejan de recibir dinero del gobierno'} no se van a quedar con ese dinero debajo del colchón. Van a ${isIncrease ? 'gastárselo' : 'tener que reducir sus gastos'}. Y como la propensión marginal a consumir es ${newParams.c1}, van a ${isIncrease ? 'gastar' : 'dejar de gastar'} ${(newParams.c1 * Math.abs(change)).toFixed(0)} millones adicionales en la economía.

¿Y dónde se gastan ese dinero? En el supermercado de su barrio, en la gasolinera, comprándose ropa, yendo al cine, pagando la hipoteca... Es decir, ese dinero va a parar a comerciantes, gasolineros, dependientes, trabajadores de cines, empleados de bancos.

Aquí está la magia del multiplicador: todos estos comerciantes y trabajadores que ${isIncrease ? 'reciben más dinero' : 'ven reducidos sus ingresos'} por el ${isIncrease ? 'aumento' : 'descenso'} del gasto público también van a ${isIncrease ? 'aumentar' : 'reducir'} sus propios gastos. No todo, porque parte lo ahorran, pero sí una proporción.

Es como tirar una piedra en un estanque: la primera onda es el gasto directo del gobierno, pero luego van saliendo ondas cada vez más pequeñas conforme el dinero va pasando de unas manos a otras.

El resultado final es impresionante: ${isIncrease ? 'un aumento' : 'una reducción'} del gasto público de ${Math.abs(change)} millones ha generado ${isIncrease ? 'un crecimiento' : 'una contracción'} total de la economía de ${Math.abs(equilibriumChange).toFixed(0)} millones. ¡Es como si cada euro que ${isIncrease ? 'gasta' : 'deja de gastar'} el gobierno se convirtiera en ${multiplier.toFixed(2)} euros de actividad económica!

Esto explica muchas de las discusiones políticas que veis en las noticias. Cuando hay una crisis y los políticos debaten si el gobierno debe gastar más o menos, no están hablando solo de las cuentas públicas. Están hablando de si poner en marcha esta máquina multiplicadora que puede ${isIncrease ? 'sacar a la economía de una recesión' : 'ayudar a controlar la inflación en tiempos de sobrecalentamiento'}.

${isIncrease ? 'El resultado es una economía más activa, con más empleo público y privado, más actividad comercial y, en general, más bienestar' : 'El resultado es una economía más contenida, posiblemente con mayor ahorro público pero también con menos actividad económica general'}.
            `;
            break;

        case 'T':
            story = `
Acabamos de cambiar los impuestos netos de ${oldValue} a ${newValue} millones. Esto significa que el gobierno ${isIncrease ? 'va a recaudar' : 'va a devolver'} ${Math.abs(change)} millones de euros ${isIncrease ? 'más' : 'menos'} a los ciudadanos este año.

¿Qué significa esto en vuestra vida diaria? ${isIncrease ? 'Imagináos que recibís la carta de Hacienda y tenéis que pagar más IRPF, o que sube el IVA y todo está más caro' : 'Pensad que el gobierno baja el IRPF, reduce el IVA, o aumenta las ayudas y subsidios'}. En definitiva, ${isIncrease ? 'tenéis menos dinero disponible para gastar' : 'tenéis más dinero en el bolsillo'}.

Ahora bien, aquí hay algo curioso y es que el efecto es exactamente al revés de lo que podríais pensar. Cuando ${isIncrease ? 'suben' : 'bajan'} los impuestos, la economía ${isIncrease ? 'se contrae' : 'se expande'}. ¿Por qué? Porque lo que importa para el consumo no es la renta total, sino la renta disponible, es decir, lo que os queda después de pagar impuestos.

Vamos a verlo paso a paso. Las familias españolas tenían una renta disponible de Y - ${oldValue}, y ahora tienen Y - ${newValue}. Esto significa que ${isIncrease ? 'cada familia tiene menos dinero para gastar' : 'cada familia tiene más dinero para gastar'}.

¿Y qué hacen las familias cuando ${isIncrease ? 'les queda menos dinero' : 'les sobra más dinero'}? Pues lo que hacemos todos: ${isIncrease ? 'recortar gastos' : 'gastarlo'}. Pero no todo, porque parte se ahorra. Con una propensión marginal a consumir de ${newParams.c1}, las familias ${isIncrease ? 'van a reducir' : 'van a aumentar'} su consumo.

Pensad en comportamientos concretos: ${isIncrease ? 'dejan de ir tanto al restaurante, posponen la compra de ropa, compran marcas más baratas en el super' : 'se permiten más caprichos, van más a cenar fuera, se compran esa chaqueta que llevaban tiempo queriendo'}.

Todos estos cambios en el comportamiento de las familias se traducen inmediatamente en ${isIncrease ? 'menos' : 'más'} actividad para los comercios, restaurantes, tiendas... Los dueños de estos negocios ven cómo ${isIncrease ? 'bajan' : 'suben'} sus ventas.

Y aquí viene otra vez el efecto multiplicador: estos comerciantes que ${isIncrease ? 'ganan menos' : 'ganan más'} también son consumidores. Cuando el dueño del restaurante ve que ${isIncrease ? 'tiene menos clientes' : 'la cosa va mejor'}, ${isIncrease ? 'también reduce sus propios gastos' : 'también se anima a gastar más'}. 

El efecto se va extendiendo por toda la economía como las ondas en el agua. ${isIncrease ? 'Una subida' : 'Una bajada'} de impuestos de ${Math.abs(change)} millones ha acabado ${isIncrease ? 'contrayendo' : 'expandiendo'} la economía en ${Math.abs(equilibriumChange).toFixed(0)} millones.

Esto es lo que hace que la política fiscal sea tan poderosa y, a la vez, tan delicada. Los gobiernos pueden usar los impuestos no solo para recaudar dinero, sino como una herramienta para ${isIncrease ? 'enfriar una economía que va demasiado rápida' : 'estimular una economía que está estancada'}.

Es fascinante cómo ${isIncrease ? 'un aumento' : 'una bajada'} de impuestos que en principio solo afecta a las cuentas de las familias acaba teniendo un impacto tan grande en toda la economía. Al final, ${isIncrease ? 'tenemos una economía más contenida, con menos actividad pero posiblemente más ahorros' : 'tenemos una economía más dinámica, con más actividad y consumo'}.
            `;
            break;
    }

    return `
${story}

*Esta explicación ha sido generada localmente. Para análisis aún más detallados y contextualizados, puedes configurar la API de Gemini en las variables de entorno.*
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
        // Intentar usar Gemini AI primero
        if (genAI && import.meta.env.VITE_GEMINI_API_KEY) {
            return await generateNarrativeExplanation(oldParams, newParams, changedParam, oldEquilibrium, newEquilibrium);
        } else {
            // Fallback a explicación local narrativa
            return generateNarrativeLocalExplanation(oldParams, newParams, changedParam, oldEquilibrium, newEquilibrium);
        }
        
    } catch (error) {
        console.error("Error generando explicación con Gemini:", error);
        // En caso de error, usar explicación local narrativa
        return generateNarrativeLocalExplanation(oldParams, newParams, changedParam, oldEquilibrium, newEquilibrium);
    }
};

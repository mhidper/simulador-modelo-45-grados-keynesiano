// Función simple para generar PDF sin hooks complicados
export const generateSimplePDF = async (options: {
  equilibriumY: number;
  previousEquilibriumY: number | null;
  author: string;
}) => {
  try {
    // Importación dinámica para evitar errores
    const { default: jsPDF } = await import('jspdf');
    console.log('jsPDF cargado correctamente');

    // Crear PDF básico
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Header
    pdf.setFontSize(18);
    pdf.text('Simulador del Modelo de 45 Grados Keynesiano', 20, 20);
    
    pdf.setFontSize(12);
    pdf.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 20, 30);
    pdf.text(`Diseñado por: ${options.author}`, 20, 35);

    // Línea separadora
    pdf.line(20, 40, 190, 40);

    // Datos del equilibrio
    pdf.setFontSize(14);
    pdf.text('Resultados del Análisis:', 20, 55);
    
    pdf.setFontSize(12);
    if (options.previousEquilibriumY !== null) {
      const change = options.equilibriumY - options.previousEquilibriumY;
      const changeText = change > 0 ? `+${change.toFixed(0)}` : change.toFixed(0);
      
      pdf.text(`• Equilibrio Anterior: ${options.previousEquilibriumY.toFixed(0)}`, 25, 70);
      pdf.text(`• Equilibrio Nuevo: ${options.equilibriumY.toFixed(0)}`, 25, 80);
      pdf.text(`• Cambio: ${changeText} (${change > 0 ? 'Expansión' : 'Contracción'})`, 25, 90);
      
      // Multiplicador estimado
      if (change !== 0) {
        pdf.text(`• Efecto Multiplicador: ${(change > 0 ? 'Positivo' : 'Negativo')}`, 25, 100);
      }
    } else {
      pdf.text(`• Equilibrio Actual: ${options.equilibriumY.toFixed(0)}`, 25, 70);
    }

    // Explicación teórica
    pdf.setFontSize(14);
    pdf.text('Marco Teórico:', 20, 120);
    
    pdf.setFontSize(10);
    const teoriaTexto = [
      'El modelo de 45 grados keynesiano muestra como se determina el equilibrio',
      'en el mercado de bienes. Los componentes principales son:',
      '',
      '• Consumo (C): Depende de la renta disponible',
      '• Inversión (I): Gasto empresarial en capital',
      '• Gasto Público (G): Compras gubernamentales',
      '• Impuestos (T): Reducen la renta disponible',
      '',
      'El equilibrio se encuentra donde la demanda total (ZZ) cruza',
      'la línea de 45 grados (Y = Z).'
    ];
    
    let yPosition = 135;
    teoriaTexto.forEach(linea => {
      pdf.text(linea, 25, yPosition);
      yPosition += 6;
    });

    // Footer
    pdf.setFontSize(8);
    pdf.text('Generado por el Simulador del Modelo de 45 Grados Keynesiano', 20, 280);
    pdf.text(`© ${new Date().getFullYear()} Manuel Alej. Hidalgo Pérez`, 20, 285);

    // Generar y descargar
    const fecha = new Date().toISOString().slice(0, 10);
    const filename = `analisis-keynesiano-${fecha}.pdf`;
    pdf.save(filename);
    
    console.log(`PDF generado: ${filename}`);
    return { success: true, filename };
    
  } catch (error) {
    console.error('Error generando PDF:', error);
    return { success: false, error: error.message };
  }
};
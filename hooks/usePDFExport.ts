import { useCallback } from 'react';

interface PDFOptions {
  title: string;
  author: string;
  equilibriumY: number;
  previousEquilibriumY: number | null;
}

export const usePDFExport = () => {
  const generatePDF = useCallback(async (options: PDFOptions) => {
    try {
      // Importación dinámica para evitar errores de módulo
      const jsPDF = (await import('jspdf')).default;
      const html2canvas = (await import('html2canvas')).default;

      console.log('Iniciando generación de PDF...');
      
      // Crear PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Header del PDF
      pdf.setFontSize(16);
      pdf.text('Simulador del Modelo de 45 Grados Keynesiano', 20, 20);
      
      pdf.setFontSize(10);
      pdf.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 20, 30);
      pdf.text(`Diseñado por: ${options.author}`, 20, 35);

      // Información básica del equilibrio
      pdf.setFontSize(12);
      if (options.previousEquilibriumY !== null) {
        const change = options.equilibriumY - options.previousEquilibriumY;
        pdf.text(`Equilibrio Anterior: ${options.previousEquilibriumY.toFixed(0)}`, 20, 50);
        pdf.text(`Equilibrio Nuevo: ${options.equilibriumY.toFixed(0)}`, 20, 60);
        pdf.text(`Cambio: ${change > 0 ? '+' : ''}${change.toFixed(0)}`, 20, 70);
      } else {
        pdf.text(`Equilibrio Actual: ${options.equilibriumY.toFixed(0)}`, 20, 50);
      }

      // Intentar capturar el gráfico
      const chartElement = document.querySelector('[data-testid="chart-container"]') as HTMLElement;
      if (chartElement) {
        console.log('Capturando gráfico...');
        try {
          const chartCanvas = await html2canvas(chartElement, {
            backgroundColor: '#ffffff',
            scale: 1,
            useCORS: true,
            logging: false
          });
          
          const chartImgData = chartCanvas.toDataURL('image/png');
          const chartWidth = 170;
          const chartHeight = (chartCanvas.height * chartWidth) / chartCanvas.width;
          
          pdf.addImage(chartImgData, 'PNG', 20, 85, chartWidth, Math.min(chartHeight, 150));
          console.log('Gráfico capturado exitosamente');
        } catch (error) {
          console.warn('Error capturando gráfico:', error);
          pdf.text('Error: No se pudo capturar el gráfico', 20, 85);
        }
      } else {
        console.warn('Elemento del gráfico no encontrado');
        pdf.text('Error: Gráfico no encontrado', 20, 85);
      }

      // Generar nombre del archivo
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `modelo-45-grados-${timestamp}.pdf`;

      // Descargar
      pdf.save(filename);
      console.log(`PDF generado: ${filename}`);
      
      return { success: true, filename };
    } catch (error) {
      console.error('Error generando PDF:', error);
      return { success: false, error: error.message };
    }
  }, []);

  return { generatePDF };
};
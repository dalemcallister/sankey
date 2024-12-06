import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportToPDF(name: string) {
  try {
    const svgContainer = document.querySelector('.bg-white.p-6.rounded-lg.shadow-lg');
    if (!svgContainer) {
      throw new Error('SVG container not found');
    }

    // Use html2canvas to capture the SVG and its container
    const canvas = await html2canvas(svgContainer as HTMLElement, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher resolution
      logging: false,
      useCORS: true
    });

    // Create PDF with A4 landscape dimensions
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Add title
    pdf.setFontSize(16);
    pdf.text(name, 15, 15);

    // Calculate dimensions to fit the page while maintaining aspect ratio
    const imgAspectRatio = canvas.width / canvas.height;
    const maxWidth = pdfWidth - 30; // 15mm margin on each side
    const maxHeight = pdfHeight - 40; // 25mm top margin + 15mm bottom margin

    let imgWidth = maxWidth;
    let imgHeight = imgWidth / imgAspectRatio;

    if (imgHeight > maxHeight) {
      imgHeight = maxHeight;
      imgWidth = imgHeight * imgAspectRatio;
    }

    // Center the image horizontally
    const xOffset = (pdfWidth - imgWidth) / 2;

    // Convert canvas to image data
    const imgData = canvas.toDataURL('image/png', 1.0);

    // Add image to PDF
    pdf.addImage(imgData, 'PNG', xOffset, 25, imgWidth, imgHeight);

    // Save the PDF
    const filename = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`;
    pdf.save(filename);

    return true;
  } catch (error) {
    console.error('PDF Export Error:', error);
    throw error;
  }
}
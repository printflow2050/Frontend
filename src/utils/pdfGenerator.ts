import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Base64 encoded printer icon (you can replace this with your own icon)
const PRINTER_ICON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAADXUlEQVR4nO2WX0xbZRjGn/f7TjnlT0tLgUJhZBQmysIYYyDh0l0YjIBk2R8X6JUrjZpl2YIaTebiVW+80cR4oTdem5hF0GxBktkQnCYiDmYWB4zhYAPG2AptoXD6nZ7z+Z0CbSmiW7YL4rm5+L7nfZ/n9z7ned/3EP7no0qlUhiNRiFJEnRdZ1kQBMiyDL/fD6fTuXsBQRAEn8/3YGtr64e6rr/odrsDmUwGNpvtoK7rJ1Kp1OpsNntAEISrqVRqxcQjhPz2n9iEkLt2u/3teDy+srW19VkikQAhJBYKhV7RNO1iJBL5QJKk5tra2s8dDkdvIpFY5vF4zoVCoVPBYPBsOp0+VVlZ+anX6z0bj8cD8/PzH05MTJyenZ09E4/H36murl4qLS09G41GXzcM43Uul/tpIpE4UmgDhG3bdr6ysvKM0+l8ZXx8/GQymVxHCEkmk0noup6x2+2QJAmiKEIURWia9qAoihAEASzLQtd1syyK4j1d19O5XA6GYUDXdaRSKciyzOfzeYiiCJfLhbKyMvj9/nQoFFoul8urGxoanjFN88qOHWhpaWF8Pt8j4XD4diAQeJzjOD6dTsMwDLAsC4/HA6/XC57nkc1mYRgG0uk0GIaBJEnQNA2EkDvZbPZ3QkiS47icaZqKaZqaLMsghMBms4HjOLAsC5ZlwXEcZFmGYRhgjH3NRTAAHD58mPF6vU8AQH19/TLD3Nlyx3FwOByglILjOFitVlgsFjAMA5ZlQQiBaZoghNwlhPxICPmVUvqbqqq/U0oNhBBomiZUVYWu6/dcLhfy+Tx4noemaQiFQlBVFZqmged5MAyzu0+o0+kEwzCQJAl2ux0Mw4BSClVVkc/nQQgBpRQsy4JSCkopGIYBpRSUUlBKQQiBqqpgjEFRFCiKAsMwoCgKVFWFoiiglEJVVSiKAp7nIYrirgVYloXdbgfP87Db7XeKnFJKsV0qFBe8+P/24xsUv7M9y7KglIJlWVBKYbFYYLFYQCmF1Wq9xyilO3dAKQXHcbBYLLDZbLBarWBZFoQQEELAMAx4ngfP87DZbGBZFoQQEELAcRw4jgPHceA4DhzHgWVZEELAMAw4jgPLsmAYBizLguM4WK1WWCwWUEphsVjAcRxsNhtsNhsopWAYBlarlWNZVrHZbGXb3vDEP9/meTw+uROLAAAAAElFTkSuQmCC";

interface Shop {
  name: string;
  address: string;
  phone: string;
  qr_code: string;
}

export const generateShopQRCodePDF = async (shop: Shop): Promise<void> => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // Header dimensions
  const headerHeight = 45;

  // Helper function to draw a horizontal gradient background
  const drawHorizontalGradient = (
    doc: jsPDF,
    x: number,
    y: number,
    width: number,
    height: number,
    startColor: { r: number; g: number; b: number },
    endColor: { r: number; g: number; b: number }
  ) => {
    // Draw one 1mm-wide rectangle per step
    const steps = Math.ceil(width);
    for (let i = 0; i < steps; i++) {
      const factor = i / steps;
      const r = Math.round(startColor.r + factor * (endColor.r - startColor.r));
      const g = Math.round(startColor.g + factor * (endColor.g - startColor.g));
      const b = Math.round(startColor.b + factor * (endColor.b - startColor.b));
      doc.setFillColor(r, g, b);
      doc.rect(x + i, y, 1, height, 'F');
    }
  };

  // Define gradient colors (Tailwind blue-600 and indigo-700)
  const startColor = { r: 37, g: 99, b: 235 };   // #2563eb
  const endColor = { r: 67, g: 56, b: 202 };       // #4338ca
  drawHorizontalGradient(doc, 0, 0, width, headerHeight, startColor, endColor);

  // Header Content: Printer Icon and Branding Text
  // Printer icon (using emoji as placeholder; replace with an image if available)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(20);
  // The x,y coordinates for the icon can be adjusted as needed
  try {
    doc.addImage(PRINTER_ICON, 'PNG', 10, 15, 13, 13);
  } catch (error) {
    console.error('Failed to load printer icon:', error);
  }

  // "PrintFlow" branding text styled to mimic the website's design
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(255, 255, 255);
  // Positioning the text to the right of the icon
  doc.text('PrintFlow', 25, 30);

  // Tagline under the brand name
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text('Digital Print Management Solution', 25, 38);

  // Shop Details
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(shop.name, width / 2, 60, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(shop.address, width / 2, 70, { align: 'center' });
  doc.text(`Contact: ${shop.phone}`, width / 2, 78, { align: 'center' });

  // QR Code with a Light Border
  try {
    const qrImage = await fetch(shop.qr_code);
    const qrBlob = await qrImage.blob();
    const qrBase64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(qrBlob);
    });

    doc.setDrawColor(200, 200, 200);
    // Draw a border around the QR code
    doc.rect(width / 2 - 42, 88, 84, 84);
    doc.addImage(qrBase64 as string, 'PNG', width / 2 - 40, 90, 80, 80);
  } catch (error) {
    console.error('Failed to load QR code image:', error);
    throw new Error('Failed to generate PDF with QR code');
  }

  // Instructions Section
  doc.setFontSize(18);
  doc.setTextColor(52, 120, 255);
  doc.text('How to upload your files:', 20, 190);

  const instructions = [
    '1. Scan the QR code with your smartphone',
    '2. Select your document to upload',
    '3. Choose print preferences (B/W or Color)',
    '4. Submit your print job',
    '5. Note your token number',
    '6. Show the token to collect your prints'
  ];

  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  instructions.forEach((instruction, index) => {
    doc.text(instruction, 25, 205 + index * 8);
  });

  // Footer Section
  const footerHeight = 30;
  doc.setFillColor(235, 235, 235);
  doc.rect(0, height - footerHeight, width, footerHeight, 'F');
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text('Powered by PrintFlow - Digital Print Management Solution', width / 2, height - 18, { align: 'center' });
  doc.setFontSize(10);
  doc.setTextColor(52, 120, 255);
  doc.text('www.printflow.com', width / 2, height - 10, { align: 'center' });

  // Save the PDF
  doc.save(`${shop.name}_QR_Code.pdf`);
};

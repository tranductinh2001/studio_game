import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateSamplePdf() {
  const students = [
    { fullName: "Nguyễn Hoàng An", studentCode: "HS6A01", cardId: "CARD_0001", classId: "CLASS_6A" },
    { fullName: "Trần Quốc Bảo", studentCode: "HS6A02", cardId: "CARD_0002", classId: "CLASS_6A" },
    { fullName: "Lê Thị Ngọc Bích", studentCode: "HS6A03", cardId: "CARD_0003", classId: "CLASS_6A" },
    { fullName: "Phạm Minh Cường", studentCode: "HS6A04", cardId: "CARD_0004", classId: "CLASS_6A" }
  ];

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const cardSlot = i % 2; 
    if (i > 0 && cardSlot === 0) {
      doc.addPage();
    }

    const topOffset = cardSlot === 0 ? 10 : 155;
    const leftOffset = 15;
    const cardWidth = 180;
    const cardHeight = 135;

    // Card Border
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(1.2);
    doc.roundedRect(leftOffset, topOffset, cardWidth, cardHeight, 5, 5);

    // Header strip
    doc.setFillColor(15, 23, 42);
    doc.rect(leftOffset, topOffset, cardWidth, 14, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("THCS DAK TROI - LOP 6A | BAI 6: MANG THONG TIN TOAN CAU", leftOffset + 5, topOffset + 9);

    // Student Info
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(`Hoc sinh: ${student.fullName}`, leftOffset + 8, topOffset + 24);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Ma so: ${student.studentCode}  |  The: ${student.cardId}`, leftOffset + 8, topOffset + 30);

    // Directions on 4 borders
    // TOP: A
    doc.setFontSize(18);
    doc.setTextColor(220, 38, 38);
    doc.text("A", leftOffset + (cardWidth / 2) - 3, topOffset + 38);
    doc.setFontSize(9);
    doc.text("^ (Dap an A huong len tren)", leftOffset + (cardWidth / 2) - 22, topOffset + 43);

    // RIGHT: B
    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235);
    doc.text("B >", leftOffset + cardWidth - 18, topOffset + (cardHeight / 2) + 5);

    // BOTTOM: C
    doc.setFontSize(18);
    doc.setTextColor(22, 163, 74);
    doc.text("C", leftOffset + (cardWidth / 2) - 3, topOffset + cardHeight - 12);
    doc.setFontSize(9);
    doc.text("v (Dap an C huong len tren)", leftOffset + (cardWidth / 2) - 22, topOffset + cardHeight - 6);

    // LEFT: D
    doc.setFontSize(18);
    doc.setTextColor(217, 119, 6);
    doc.text("< D", leftOffset + 6, topOffset + (cardHeight / 2) + 5);

    // Center QR Code
    const qrData = JSON.stringify({
      cardId: student.cardId,
      studentCode: student.studentCode,
      classId: student.classId
    });

    const qrDataUrl = await QRCode.toDataURL(qrData, {
      width: 250,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: 'H'
    });

    const qrSize = 65;
    const qrX = leftOffset + (cardWidth - qrSize) / 2;
    const qrY = topOffset + 46;
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

    // Outer guide box
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.rect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4);
  }

  const outPath = path.join(__dirname, '../WEBBY_CLASSROOM_RELEASE/SAMPLE_STUDENT_CARDS.pdf');
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  fs.writeFileSync(outPath, pdfBuffer);
  console.log(`✅ Sample PDF generated successfully at ${outPath} (${pdfBuffer.length} bytes)`);
}

generateSamplePdf();


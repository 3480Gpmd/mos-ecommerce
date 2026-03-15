import ExcelJS from 'exceljs';

interface EasyfattItem {
  code: string;
  name: string;
  qty: number;
  priceNet: string;
  unit: string;
  vatPct: string;
  discountPct?: string;
}

/**
 * Genera un file Excel nel formato importabile da Danea Easyfatt
 * Colonne: Cod. | Descrizione | Lotto/Seriale | Q.tà | Prezzo netto | U.m. | Sconti | Iva | Mag. | Prezzo d'acq.
 */
export async function generateEasyfattExcel(items: EasyfattItem[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Documento');

  // Header secondo il modello Easyfatt
  const headers = ['Cod.', 'Descrizione', 'Lotto/Seriale', 'Q.tà', 'Prezzo netto', 'U.m.', 'Sconti', 'Iva', 'Mag.', "Prezzo d'acq."];

  const headerRow = sheet.addRow(headers);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, size: 10, name: 'Arial' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9E1F2' },
    };
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // Dati prodotti
  for (const item of items) {
    const row = sheet.addRow([
      item.code,                          // Cod.
      item.name,                          // Descrizione
      '',                                 // Lotto/Seriale
      item.qty,                           // Q.tà
      parseFloat(item.priceNet),          // Prezzo netto
      item.unit || 'PZ',                  // U.m.
      item.discountPct || '',             // Sconti
      parseInt(item.vatPct) || 22,        // Iva
      '',                                 // Mag.
      '',                                 // Prezzo d'acq.
    ]);

    row.eachCell((cell) => {
      cell.font = { size: 10, name: 'Arial' };
    });
  }

  // Larghezze colonne
  sheet.getColumn(1).width = 15;  // Cod.
  sheet.getColumn(2).width = 45;  // Descrizione
  sheet.getColumn(3).width = 15;  // Lotto/Seriale
  sheet.getColumn(4).width = 8;   // Q.tà
  sheet.getColumn(5).width = 14;  // Prezzo netto
  sheet.getColumn(6).width = 8;   // U.m.
  sheet.getColumn(7).width = 10;  // Sconti
  sheet.getColumn(8).width = 6;   // Iva
  sheet.getColumn(9).width = 8;   // Mag.
  sheet.getColumn(10).width = 14; // Prezzo d'acq.

  // Formato numerico per prezzo
  sheet.getColumn(5).numFmt = '#,##0.00';

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

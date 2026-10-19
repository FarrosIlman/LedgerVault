const { createWorker } = require('tesseract.js');
const path = require('path');

async function testTaxiOCR() {
  const imagePath = path.resolve(__dirname, '../assets/images/receipt_taxi.jpg');
  console.log('Running OCR on taxi receipt...');
  const worker = await createWorker('eng');
  const ret = await worker.recognize(imagePath);
  console.log('--- TAXI RECEIPT TEXT ---');
  console.log(ret.data.text);
  console.log('--- END ---');
  await worker.terminate();
}

testTaxiOCR().catch(console.error);

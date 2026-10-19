const { createWorker } = require('tesseract.js');
const path = require('path');

async function testOCR() {
  const imagePath = path.resolve(__dirname, '../assets/images/receipt_cafe.jpg');
  console.log('Running OCR on:', imagePath);
  
  const worker = await createWorker('eng');
  const ret = await worker.recognize(imagePath);
  console.log('--- EXTRACTED TEXT ---');
  console.log(ret.data.text);
  console.log('--- END TEXT ---');
  await worker.terminate();
}

testOCR().catch(console.error);

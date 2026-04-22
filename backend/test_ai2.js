const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('AIzaSyDQJTpYDLsC1v6a9mwJpbea21BwkB_dZ0I');

async function testModel(modelName) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName, generationConfig: { responseMimeType: 'application/json' } });
    const result = await model.generateContent('Generate JSON: {"hello":"world"}');
    console.log(`[SUCCESS] ${modelName}:`, result.response.text().trim());
  } catch (e) {
    console.log(`[ERROR] ${modelName}:`, e.message);
  }
}

async function run() {
  await testModel('gemini-1.5-flash');
  await testModel('gemini-2.0-flash');
  await testModel('gemini-2.5-flash');
}
run();

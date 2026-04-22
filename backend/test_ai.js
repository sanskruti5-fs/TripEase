const { GoogleGenerativeAI } = require('@google/generative-ai'); 
const genAI = new GoogleGenerativeAI('AIzaSyCqSItwW4OexN_lQ1D4WgzAt-Gj3HEcThE'); 
async function run() { 
  try { 
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash', 
      generationConfig: { responseMimeType: 'application/json' } 
    }); 
    const prompt = 'Generate JSON: { "hello": "world" }'; 
    const result = await model.generateContent(prompt); 
    console.log(result.response.text()); 
  } catch(e) { 
    console.error('1.5 Error:', e.message); 
  }

  try { 
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash', 
      generationConfig: { responseMimeType: 'application/json' } 
    }); 
    const prompt = 'Generate JSON: { "hello": "world" }'; 
    const result = await model.generateContent(prompt); 
    console.log('2.5 Response:', result.response.text()); 
  } catch(e) { 
    console.error('2.5 Error:', e.message); 
  }
} 
run();

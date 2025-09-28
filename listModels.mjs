import https from 'https';
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!apiKey) {
  console.error("Error: GOOGLE_GENERATIVE_AI_API_KEY not found in your .env.local file.");
  process.exit(1);
}

const options = {
  hostname: 'generativelanguage.googleapis.com',
  path: '/v1beta/models',
  method: 'GET',
  headers: {
    'x-goog-api-key': apiKey,
  },
};

console.log("Fetching available Gemini models via REST API...\n");

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    if (res.statusCode !== 200) {
      console.error(`Error: API request failed with status code ${res.statusCode}`);
      console.error('Response:', data);
      return;
    }
    try {
      const parsedData = JSON.parse(data);
      console.log("Models that support 'generateContent':");
      console.log("-------------------------------------");

      let foundModels = false;
      if (parsedData.models && Array.isArray(parsedData.models)) {
        parsedData.models.forEach((m) => {
          if (m.supportedGenerationMethods.includes("generateContent")) {
            console.log(`- ${m.name}`); // e.g., models/gemini-pro
            foundModels = true;
          }
        });
      }
      if (!foundModels) {
        console.log("No models found. Please check your API key and that the Generative Language API is enabled in your Google Cloud project.");
      } else {
        console.log("\n-------------------------------------");
        console.log("Copy one of the model names above and paste it into your `app/api/ai-chat/route.ts` file.");
      }
    } catch (e) {
      console.error('Error parsing JSON response:', e.message);
    }
  });
});

req.on('error', (e) => console.error('Error with the request itself:', e.message));
req.end();

import { GoogleGenerativeAI } from "@google/generative-ai";
import pdf from 'pdf-parse';
import dotenv from "dotenv";
dotenv.config();
// Initialize the Gemini client
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Function to get text from a PDF buffer
const getPdfText = async (fileBuffer: Buffer): Promise<string> => {
    const data = await pdf(fileBuffer);
    return data.text;
};

const getExtractionPrompt = (text: string): string => {
    return `
    You are an expert data extraction AI. Your task is to extract structured data from the provided invoice text.
    Analyze the text and extract the information based on the JSON schema below.
    Respond ONLY with a valid JSON object. Do not include any other text, explanations, or markdown formatting.

    **JSON Schema:**
    {
      "vendor": { "name": "string", "address": "string", "taxId": "string" },
      "invoice": {
        "number": "string", "date": "string", "currency": "string",
        "subtotal": "number", "taxPercent": "number", "total": "number",
        "poNumber": "string", "poDate": "string",
        "lineItems": [{ "description": "string", "unitPrice": "number", "quantity": "number", "total": "number" }]
      }
    }

    **Invoice Text:**
    ---
    ${text}
    ---

    **Your JSON Output:**
    `;
};

export const extractDataWithAI = async (fileBuffer: Buffer) => {
    const text = await getPdfText(fileBuffer);
    const prompt = getExtractionPrompt(text);
    
    const genAI = gemini.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const result = await genAI.generateContent(prompt);
    const responseText = result.response.text();

    if (!responseText) {
        throw new Error("Gemini did not return a response.");
    }
    
    const jsonString = responseText.replace(/```json\n|```/g, '').trim();

    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("Failed to parse Gemini response:", jsonString);
        throw new Error("Gemini returned malformed JSON.");
    }
};
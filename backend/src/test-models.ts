import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function listModels() {
  try {
    // There is no direct listModels in the current SDK version easily, 
    // but we can try to hit a known model to see the error or use the REST API.
    console.log("Testing model access...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("test");
    const response = await result.response;
    console.log("Success with gemini-1.5-flash:", response.text());
  } catch (e: any) {
    console.error("List models error:", e.message);
  }
}

listModels();

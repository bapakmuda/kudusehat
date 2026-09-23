import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

async function run() {
  const envFile = fs.readFileSync(".env.local", "utf8");
  const match = envFile.match(/GEMINI_API_KEY=(.*)/);
  if (!match) throw new Error("No API key");
  const apiKey = match[1].trim();

  const genAI = new GoogleGenerativeAI(apiKey);
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await response.json();
  console.log(data.models.map(m => m.name));
}
run();

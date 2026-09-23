import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

async function run() {
  try {
    const envFile = fs.readFileSync(".env.local", "utf8");
    const match = envFile.match(/GEMINI_API_KEY=(.*)/);
    if (!match) throw new Error("No API key");
    const apiKey = match[1].trim();

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const messages = [
      { sender: "ai", text: "Halo, saya Dokter AI." },
      { sender: "user", text: "Halo" },
      { sender: "user", text: "Apa kabar?" }, // Consecutive user messages
    ];

    const allMessages = messages.map((msg) => ({
      role: msg.sender === "ai" ? "model" : "user",
      parts: [{ text: msg.text }],
    }));

    const contents = [
      { role: "user", parts: [{ text: `SYSTEM INSTRUCTION: Test\n\nMengerti?` }] },
      { role: "model", parts: [{ text: "Ya, mengerti." }] },
    ];

    for (const msg of allMessages) {
      if (contents[contents.length - 1].role === msg.role) {
        contents[contents.length - 1].parts[0].text += "\n\n" + msg.parts[0].text;
      } else {
        contents.push(msg);
      }
    }

    if (contents[contents.length - 1].role === "model") {
      contents.push({ role: "user", parts: [{ text: "Lanjutkan." }] });
    }

    const result = await model.generateContent({
      contents,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    });

    const response = await result.response;
    console.log("Success:", response.text());
  } catch (err) {
    console.error("FAILED:", err);
  }
}
run();

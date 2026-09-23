import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set in environment variables." },
        { status: 500 }
      );
    }

    const { messages, childContext } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages format." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemInstruction = `Kamu adalah "Dokter AI", seorang asisten dokter spesialis anak di aplikasi KuduSehat.
Tugas kamu adalah menjawab pertanyaan orang tua (Bunda/Ayah) mengenai kesehatan, tumbuh kembang, dan nutrisi anak.
Gunakan bahasa yang ramah, profesional, suportif, dan mudah dipahami.
Selalu sertakan peringatan bahwa kamu adalah AI dan orang tua harus tetap memeriksakan anaknya ke dokter sungguhan atau IGD jika ada kondisi gawat darurat (seperti kejang, sesak napas berat, atau demam tinggi yang tidak turun).
Berikan tips praktis perawatan di rumah untuk gejala ringan.`;

    let fullInstruction = systemInstruction;
    if (childContext) {
      fullInstruction += `\n\nInformasi Pasien Anak yang sedang dikonsultasikan:
Nama: ${childContext.name}
Tanggal Lahir: ${childContext.birthDate}
Jenis Kelamin: ${childContext.gender}
Berat Badan: ${childContext.weight ? childContext.weight + " kg" : "Tidak diketahui"}
Tinggi Badan: ${childContext.height ? childContext.height + " cm" : "Tidak diketahui"}
(Gunakan informasi ini untuk memberikan saran yang lebih relevan dan panggil nama anak jika sesuai.)`;
    }

    // Map messages to Gemini API format (role: 'user' | 'model')
    const allMessages = messages.map((msg: any) => ({
      role: msg.sender === "ai" ? "model" : "user",
      parts: [{ text: msg.text }],
    }));

    const contents = [
      { role: "user", parts: [{ text: `SYSTEM INSTRUCTION: ${fullInstruction}\n\nMengerti?` }] },
      { role: "model", parts: [{ text: "Ya, saya mengerti. Saya akan bertindak sebagai Dokter AI untuk aplikasi KuduSehat sesuai instruksi." }] },
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
    const text = response.text();

    return NextResponse.json({ reply: text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan: " + (error.message || String(error)) },
      { status: 500 }
    );
  }
}

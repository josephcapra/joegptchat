// pages/api/chat.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // ✅ Responses API (replacement for Assistants)
    const response = await client.responses.create({
      model: "gpt-4o-mini", // lightweight + fast
      input: [
        {
          role: "user",
          content: message,
        },
      ],
    });

    // Extract text reply safely
    const reply =
      response.output?.[0]?.content?.[0]?.text || "⚠️ No response from model";

    res.status(200).json({ reply });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Failed to connect to OpenAI API" });
  }
}

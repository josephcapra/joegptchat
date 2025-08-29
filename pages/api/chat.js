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
    const { message, threadId } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // ✅ Use Responses API
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: message,
        },
      ],
    });

    // Extract text
    const reply =
      response.output?.[0]?.content?.[0]?.text || "⚠️ No response from model";

    // Send back reply + threadId for compatibility
    res.status(200).json({
      reply,
      threadId: threadId || "demo-thread", // fallback threadId
    });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Failed to connect to OpenAI API" });
  }
}

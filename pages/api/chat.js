// pages/api/chat.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Vercel injects this from your env vars
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message is required." });
    }

    // Call OpenAI Responses API
    const response = await client.responses.create({
      model: "gpt-5-mini", // You can change to gpt-5 or gpt-4o depending on needs
      input: message,
    });

    // Extract reply safely
    const reply =
      response.output?.[0]?.content?.[0]?.text ||
      "Sorry, I couldn’t generate a response.";

    res.status(200).json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    res
      .status(500)
      .json({ error: "Something went wrong. Check server logs for details." });
  }
}

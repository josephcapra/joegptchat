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

    // Base RealGeeks URL (adjust to your site’s domain if needed)
    const baseUrl =
      "https://paradiserealtyfla.realgeeks.com/search/results/?";

    // Let GPT decide what filters should be applied
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini", // ⚡ fast + cheaper
      messages: [
        {
          role: "system",
          content: `You are a real estate search assistant. 
          Convert user queries into RealGeeks property search filters.
          Always respond with a short intro sentence and a clickable URL link.`,
        },
        { role: "user", content: message },
      ],
    });

    let reply = response.choices[0]?.message?.content?.trim();

    // If GPT doesn't generate a link, add a fallback generic URL
    if (!reply.includes("http")) {
      reply += `\n\n👉 [View Listings Here](${baseUrl})`;
    }

    res.status(200).json({ reply });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Failed to connect to OpenAI API" });
  }
}

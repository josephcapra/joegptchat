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

    // ✅ Base RealGeeks URL on your own domain
    const baseUrl =
      "https://paradiserealtyfla.com/search/results/?";

    // Let GPT turn queries into RealGeeks filters
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini", // lightweight but accurate
      messages: [
        {
          role: "system",
          content: `You are a real estate assistant for Paradise Realty FLA. 
          Convert user queries into RealGeeks property search URLs.
          Always respond with:
          1. A short intro sentence
          2. A clickable link using the domain paradiserealtyfla.com
          
          Example format:
          "Here are some homes you might like: 👉 [View Listings](https://paradiserealtyfla.com/search/results/?county=St.+Lucie&list_price_max=400000)"`,
        },
        { role: "user", content: message },
      ],
    });

    let reply = response.choices[0]?.message?.content?.trim();

    // Fallback — in case GPT forgets to add a link
    if (!reply.includes("http")) {
      reply += `\n\n👉 [View Listings](${baseUrl})`;
    }

    res.status(200).json({ reply });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Failed to connect to OpenAI API" });
  }
}

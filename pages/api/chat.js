// pages/api/chat.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ Your clean base URL
const BASE_URL = "https://paradiserealtyfla.com/search/results/?";

function buildUrl(filters = {}) {
  const url = new URL(BASE_URL);

  // Apply overrides on top of base
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value.toString());
    }
  });

  return url.toString();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const q = message.toLowerCase();
    let url = BASE_URL;

    // 🔎 Custom logic for common searches
    if (q.includes("under 400k") && q.includes("psl")) {
      url = buildUrl({
        county: "St. Lucie",
        city: "Port St. Lucie",
        list_price_max: 400000,
      });
    } else if (q.includes("55+") || q.includes("senior")) {
      url = buildUrl({
        county: "St. Lucie",
        city: "Port St. Lucie",
        senior_community_yn: true,
      });
    } else if (q.includes("new construction") && q.includes("martin")) {
      url = buildUrl({
        county: "Martin",
        year_built_min: 2020,
      });
    } else if (q.includes("waterfront") && q.includes("west palm")) {
      url = buildUrl({
        county: "Palm Beach",
        city: "West Palm Beach",
        waterfront: true,
      });
    } else {
      // 🧠 Fallback: use GPT to generate a search description
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a real estate search assistant. 
            Convert queries into property searches using paradiserealtyfla.com.`,
          },
          { role: "user", content: message },
        ],
      });

      const reply = response.choices[0]?.message?.content?.trim() || "Here are some homes you may like:";
      return res.status(200).json({
        reply: `${reply}\n\n👉 [View Listings](${BASE_URL})`,
      });
    }

    // ✅ Always return clickable link
    return res.status(200).json({
      reply: `Here are listings matching "${message}":\n\n👉 [View Listings](${url})`,
      url,
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}

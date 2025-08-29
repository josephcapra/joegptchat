// pages/api/chat.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Base RealGeeks search URL
const BASE_URL = "https://paradiserealtyfla.realgeeks.com/search/results/";

function buildSearchUrl(params) {
  const url = new URL(BASE_URL);
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.set(key, params[key]);
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

    // 🔎 Hard-coded RealGeeks logic
    if (q.includes("homes under $400k in psl") || q.includes("port st. lucie under 400k")) {
      return res.json({
        reply: `Here are homes under $400k in Port St. Lucie:\n${buildSearchUrl({
          county: "St. Lucie",
          city: "Port St. Lucie",
          list_price_max: 400000,
          beds_min: 2,
          baths_min: 1
        })}`
      });
    }

    if (q.includes("55+") || q.includes("55 plus community") || q.includes("senior")) {
      return res.json({
        reply: `Here are 55+ Communities in PSL:\n${buildSearchUrl({
          county: "St. Lucie",
          city: "Port St. Lucie",
          senior_community_yn: true
        })}`
      });
    }

    if (q.includes("new construction in martin")) {
      return res.json({
        reply: `Here are new construction homes in Martin County:\n${buildSearchUrl({
          county: "Martin",
          year_built_min: 2020
        })}`
      });
    }

    if (q.includes("waterfront homes in west palm")) {
      return res.json({
        reply: `Here are waterfront homes in West Palm Beach:\n${buildSearchUrl({
          county: "Palm Beach",
          city: "West Palm Beach",
          waterfront: "True"
        })}`
      });
    }

    // 🧠 If no match, fall back to GPT for natural conversation
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini", // ✅ lightweight fast model
      messages: [{ role: "user", content: message }],
    });

    const reply = response.choices[0]?.message?.content?.trim() || "No reply";
    res.status(200).json({ reply });

  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Failed to connect to OpenAI API" });
  }
}

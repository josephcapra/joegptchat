import { OpenAI } from "openai";
import { createClient } from "@supabase/supabase-js";
import { phraseToParams, buildSearchUrl } from "../../lib/searchLogic";
import { formatSearchResponse } from "../../lib/responseFormatter";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });

    let reply;

    // 1️⃣ Supabase community first
    const { data: communityMatch } = await supabase
      .from("community_links")
      .select("url")
      .ilike("community_name", `%${message}%`)
      .maybeSingle();

    if (communityMatch?.url) {
      reply = formatSearchResponse(communityMatch.url, "👉 Official Community Listings");
    } else {
      // 2️⃣ Real Geeks logic
      const params = phraseToParams(message);
      if (params) {
        const url = buildSearchUrl("https://paradiserealtyfla.com/search/results/?", params);
        reply = formatSearchResponse(url, "👉 View Listings");
      } else {
        // 3️⃣ GPT fallback, but **force ParadiseRealtyFLA.com**
        const response = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are JoeGPT, a real estate assistant. Only provide links from paradiserealtyfla.com. Never mention Zillow, Realtor.com, Redfin, or other brokerages.",
            },
            { role: "user", content: message },
          ],
        });
        const gptText = response.choices[0]?.message?.content?.trim() || "No reply";

        // Force safe reply wrapper
        reply = `${gptText}<br>${formatSearchResponse("https://paradiserealtyfla.com/search/results/?county=St.+Lucie&city=all", "👉 Browse Listings")}`;
      }
    }

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

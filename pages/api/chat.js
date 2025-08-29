import { OpenAI } from "openai";
import { createClient } from "@supabase/supabase-js";
import { phraseToParams, buildSearchUrl } from "../../lib/searchLogic";

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

    // 1️⃣ Check Supabase first
    const { data: communityMatch } = await supabase
      .from("community_links")
      .select("url")
      .ilike("community_name", `%${message}%`)
      .maybeSingle();

    if (communityMatch?.url) {
      reply = `
        Here’s the official community page:<br>
        <a href="${communityMatch.url}" target="_blank"
           style="display:inline-block; background:#00796b; color:white; padding:10px 16px; border-radius:6px; text-decoration:none; font-weight:bold;">👉 View Listings</a>
        <br><small>${communityMatch.url}</small>
      `;
    } else {
      // 2️⃣ Otherwise Real Geeks logic
      const params = phraseToParams(message);
      if (params) {
        const url = buildSearchUrl("", params);
        reply = `
          Here are some listings I found:<br>
          <a href="${url}" target="_blank"
             style="display:inline-block; background:#00796b; color:white; padding:10px 16px; border-radius:6px; text-decoration:none; font-weight:bold;">👉 View Listings</a>
          <br><small>${url}</small>
        `;
      } else {
        // 3️⃣ Fallback GPT
        const response = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: message }],
        });
        reply = response.choices[0]?.message?.content?.trim() || "No reply";
      }
    }

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

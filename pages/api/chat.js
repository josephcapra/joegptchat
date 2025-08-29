// /pages/api/chat.js
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

// OpenAI client
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message required" });
  }

  try {
    // 1️⃣ Search Supabase communities for matches
    const { data: communities, error } = await supabase
      .from("communities1") // you can expand to 2 + 3
      .select("community_name_city, url, description")
      .ilike("community_name_city", `%${message}%`)
      .limit(5);

    if (communities && communities.length > 0) {
      return res.status(200).json({
        reply: "Here are some matching communities:",
        results: communities
      });
    }

    // 2️⃣ Fallback to OpenAI
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }],
    });

    const reply = response.choices[0]?.message?.content?.trim() || "No reply";
    return res.status(200).json({ reply });

  } catch (err) {
    console.error("Chat API Error:", err);
    return res.status(500).json({ error: "Failed to connect" });
  }
}

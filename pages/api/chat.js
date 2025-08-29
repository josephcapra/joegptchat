// pages/api/chat.js

import { OpenAI } from "openai";
import { phraseToFilters, buildSearchUrl } from "../../lib/searchLogic.js";
// If Supabase is connected later:
// import { createClient } from "@supabase/supabase-js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// );

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });

    let reply;

    // 1️⃣ TODO: Supabase check (if community tables are connected)
    // const { data: communityMatch } = await supabase
    //   .from("community_links")
    //   .select("url")
    //   .ilike("community_name", `%${message}%`)
    //   .maybeSingle();
    //
    // if (communityMatch?.url) {
    //   reply = formatReply(communityMatch.url, "👉 Official Community Listings");
    //   return res.status(200).json({ reply });
    // }

    // 2️⃣ Real Geeks search logic
    const filters = phraseToFilters(message);
    const url = buildSearchUrl(filters);

    reply = formatReply(url, "👉 View Listings");

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// ✅ Always return clickable button + raw URL
function formatReply(url, label = "👉 View Listings") {
  // Force only your domain
  if (!url.includes("paradiserealtyfla.com")) {
    return "⚠️ Sorry, I can only provide listings from ParadiseRealtyFLA.com.";
  }

  return `
    <div>
      <a href="${url}" target="_blank"
         style="display:inline-block; background:#00796b; color:white; padding:10px 16px; 
                border-radius:6px; text-decoration:none; font-weight:bold; margin:6px 0;">
         ${label}
      </a>
      <br><small>${url}</small>
    </div>
  `;
}

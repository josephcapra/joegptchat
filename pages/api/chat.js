// pages/api/chat.js
import { OpenAI } from "openai";
import { createClient } from "@supabase/supabase-js";

// ✅ Setup OpenAI + Supabase
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ✅ Utility: Clean URL encoding
function buildSearchUrl(base, params) {
  return (
    base +
    params
      .replace(/\s+/g, "+")
      .replace(/%20/g, "+")
      .replace(/%2B/g, "+")
      .replace(/%2F/g, "/")
      .replace(/%26/g, "&")
      .replace(/%3D/g, "=")
  );
}

const BASE_URL = "https://paradiserealtyfla.com/search/results/?";

// ✅ Map natural phrases → search params
function phraseToParams(query) {
  query = query.toLowerCase();
  let params = [];

  // Geography
  if (query.includes("port st lucie")) params.push("county=all&city=Port+St.+Lucie");
  if (query.includes("st lucie county")) params.push("county=St.+Lucie&city=all");
  if (query.includes("fort pierce")) params.push("county=all&city=Fort+Pierce");
  if (query.includes("hobe sound")) params.push("county=all&city=Hobe+Sound");

  // Price
  if (query.includes("under 300k")) params.push("list_price_max=300000");
  if (query.includes("under 400k")) params.push("list_price_max=400000");
  if (query.includes("under 500k")) params.push("list_price_max=500000");
  if (query.includes("over 1m")) params.push("list_price_min=1000000");
  if (query.includes("between 500k and 750k"))
    params.push("list_price_min=500000&list_price_max=750000");

  // Property type
  if (query.includes("single family")) params.push("type=res");
  if (query.includes("condo")) params.push("type=con");
  if (query.includes("townhome") || query.includes("townhouse")) params.push("type=twn");
  if (query.includes("multi-family")) params.push("type=mul");
  if (query.includes("land")) params.push("type=lnd");

  // Beds & baths
  if (query.includes("2 bed")) params.push("beds_min=2");
  if (query.includes("3 bed")) params.push("beds_min=3");
  if (query.includes("4 bed")) params.push("beds_min=4");
  if (query.includes("2 bath")) params.push("baths_min=2");
  if (query.includes("3 bath")) params.push("baths_min=3");

  // Lifestyle
  if (query.includes("pool")) params.push("pool=True");
  if (query.includes("55+")) params.push("senior_community_yn=True");
  if (query.includes("waterfront")) params.push("waterfront=True");
  if (query.includes("oceanfront")) params.push("waterfront=Ocean+Front");
  if (query.includes("riverfront")) params.push("waterfront=River+Front");
  if (query.includes("lakefront")) params.push("waterfront=Lake+Front");

  // HOA
  if (query.includes("no hoa")) params.push("hoa_yn=False");
  if (query.includes("hoa under 300")) params.push("hoa_yn=True&hoa_fee_max=300");
  if (query.includes("hoa under 500")) params.push("hoa_yn=True&hoa_fee_max=500");
  if (query.includes("gated")) params.push("hoa_yn=True&hoa_fee_includes=Security");

  // Year built
  if (query.includes("built after 2015")) params.push("year_built_min=2015");
  if (query.includes("built after 2018")) params.push("year_built_min=2018");
  if (query.includes("new construction")) params.push("year_built_min=2020");

  // Garage
  if (query.includes("2 car garage")) params.push("garage_spaces_min=2");
  if (query.includes("3 car garage")) params.push("garage_spaces_min=3");

  return params.join("&");
}

// ✅ API Handler
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    let reply;

    // 1️⃣ Check Supabase first for community link
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
      // 2️⃣ Otherwise build Real Geeks search URL
      const params = phraseToParams(message);
      if (params) {
        const url = buildSearchUrl(BASE_URL, params);
        reply = `
          Here are some listings I found:<br>
          <a href="${url}" target="_blank" 
             style="display:inline-block; background:#00796b; color:white; padding:10px 16px; border-radius:6px; text-decoration:none; font-weight:bold;">👉 View Listings</a>
          <br><small>${url}</small>
        `;
      } else {
        // 3️⃣ Fallback: GPT answer
        const response = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: message }],
        });
        reply = response.choices[0]?.message?.content?.trim() || "No reply";
      }
    }

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Failed to connect to API" });
  }
}

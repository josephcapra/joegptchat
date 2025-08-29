// pages/api/chat.js
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

// 🔑 Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ Clean base search URL
const BASE_URL = "https://paradiserealtyfla.com/search/results/?";

function buildUrl(filters = {}) {
  const url = new URL(BASE_URL);
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value.toString());
    }
  });
  return url.toString();
}

// 🔎 Query Supabase for a matching community
async function getCommunityLink(userQuery) {
  const { data, error } = await supabase
    .from("communities2") // adjust table name if different
    .select("community_name_city, url")
    .ilike("community_name_city", `%${userQuery}%`)
    .limit(1);

  if (error) {
    console.error("Supabase error:", error);
    return null;
  }

  return data?.[0]?.url || null;
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
    let filters = {};

    // 1️⃣ First, check if it's a community request
    const communityUrl = await getCommunityLink(message);
    if (communityUrl) {
      return res.status(200).json({
        reply: `Here are listings in ${message}:\n\n👉 [View Listings](${communityUrl})`,
        url: communityUrl,
      });
    }

    // 2️⃣ Otherwise, parse into RealGeeks search filters
    const priceMatch = q.match(/under\s*\$?(\d+[kK]?)/);
    if (priceMatch) {
      let max = priceMatch[1].replace(/k/i, "000");
      filters.list_price_max = parseInt(max);
    }
    const rangeMatch = q.match(/\$?(\d+[kK]?)\s*-\s*\$?(\d+[kK]?)/);
    if (rangeMatch) {
      filters.list_price_min = parseInt(rangeMatch[1].replace(/k/i, "000"));
      filters.list_price_max = parseInt(rangeMatch[2].replace(/k/i, "000"));
    }

    const bedsMatch = q.match(/(\d+)\s*(bed|br)/);
    if (bedsMatch) filters.beds_min = parseInt(bedsMatch[1]);

    const bathsMatch = q.match(/(\d+)\s*(bath|ba)/);
    if (bathsMatch) filters.baths_min = parseInt(bathsMatch[1]);

    if (q.includes("port st lucie") || q.includes("psl")) {
      filters.county = "St. Lucie";
      filters.city = "Port St. Lucie";
    } else if (q.includes("stuart")) {
      filters.county = "Martin";
      filters.city = "Stuart";
    } else if (q.includes("jupiter")) {
      filters.county = "Palm Beach";
      filters.city = "Jupiter";
    } else if (q.includes("west palm")) {
      filters.county = "Palm Beach";
      filters.city = "West Palm Beach";
    }

    if (q.includes("55+") || q.includes("senior")) {
      filters.senior_community_yn = true;
    }

    if (q.includes("pool")) {
      filters.pool = true;
    }

    if (
      q.includes("waterfront") ||
      q.includes("canal") ||
      q.includes("lake") ||
      q.includes("ocean") ||
      q.includes("river")
    ) {
      filters.waterfront = true;
    }

    const url = buildUrl(filters);

    // ✅ Always return clickable Markdown link
    return res.status(200).json({
      reply: `Here are listings matching "${message}":\n\n👉 [View Listings](${url})`,
      url,
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}

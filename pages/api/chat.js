// pages/api/chat.js
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

// Connect Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Base Real Geeks search URL
const BASE_URL = "https://paradiserealtyfla.com/search/results/";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, threadId } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    let params = new URLSearchParams();
    const lower = message.toLowerCase();

    // ===========================================
    // 1. Supabase Community Match First
    // ===========================================
    const { data: communityMatch } = await supabase
      .from("community_links")
      .select("url")
      .ilike("community_name", `%${message}%`)
      .maybeSingle();

    if (communityMatch) {
      return res.status(200).json({
        reply: `🏡 Found community match: <a href="${communityMatch.url}" target="_blank">View Listings Here</a>`,
        threadId: threadId || uuidv4(),
      });
    }

    // ===========================================
    // 2. Geography (county & city)
    // ===========================================
    const geoMap = {
      "st. lucie county": { county: "St.+Lucie", city: "all" },
      "port st. lucie": { county: "all", city: "Port+St.+Lucie" },
      "fort pierce": { county: "all", city: "Fort+Pierce" },
      "palm city": { county: "all", city: "Palm+City" },
      "hobe sound": { county: "all", city: "Hobe+Sound" },
    };

    for (let key in geoMap) {
      if (lower.includes(key)) {
        params.set("county", geoMap[key].county);
        params.set("city", geoMap[key].city);
      }
    }

    // ===========================================
    // 3. Price filters
    // ===========================================
    if (/under\s?300k/.test(lower)) params.set("list_price_max", "300000");
    if (/under\s?400k/.test(lower)) params.set("list_price_max", "400000");
    if (/under\s?500k/.test(lower)) params.set("list_price_max", "500000");
    if (/over\s?1m/.test(lower)) params.set("list_price_min", "1000000");
    if (/between\s?500k\s?and\s?750k/.test(lower)) {
      params.set("list_price_min", "500000");
      params.set("list_price_max", "750000");
    }

    // ===========================================
    // 4. Property types
    // ===========================================
    const typeMap = {
      "single family": "res",
      "house": "res",
      "condo": "con",
      "townhome": "twn",
      "townhouse": "twn",
      "multi": "mul",
      "multi-family": "mul",
      "land": "lnd",
      "vacant": "lnd",
    };

    for (let key in typeMap) {
      if (lower.includes(key)) params.append("type", typeMap[key]);
    }

    // ===========================================
    // 5. Beds & baths
    // ===========================================
    const bedMatch = lower.match(/(\d+)\s?(bed|br)/);
    const bathMatch = lower.match(/(\d+)\s?(bath|ba)/);
    if (bedMatch) params.set("beds_min", bedMatch[1]);
    if (bathMatch) params.set("baths_min", bathMatch[1]);

    // ===========================================
    // 6. Size (SqFt, lot, acres)
    // ===========================================
    const sqftMatch = lower.match(/over\s?(\d+)\s?(sqft|square feet|sq ft)/);
    if (sqftMatch) params.set("area_min", sqftMatch[1]);

    if (lower.includes("quarter acre")) params.set("lot_dimensions", "1/4+Acre");
    if (lower.includes("half acre")) params.set("acres_min", "0.5");
    if (lower.includes("5 acres")) params.set("lot_dimensions", "5+Acres");

    // ===========================================
    // 7. Year Built
    // ===========================================
    const yearMatch = lower.match(/after\s?(20\d{2})/);
    if (yearMatch) params.set("year_built_min", yearMatch[1]);

    if (lower.includes("new construction")) {
      params.set("year_built_min", "2020");
    }

    // ===========================================
    // 8. Lifestyle features
    // ===========================================
    if (lower.includes("pool")) params.set("pool", "True");
    if (lower.includes("55+")) params.set("senior_community_yn", "True");
    if (lower.includes("waterfront")) params.set("waterfront", "True");
    if (lower.includes("oceanfront")) params.set("waterfront", "Ocean+Front");
    if (lower.includes("lakefront")) params.set("waterfront", "Lake+Front");
    if (lower.includes("riverfront")) params.set("waterfront", "River+Front");

    // ===========================================
    // 9. HOA
    // ===========================================
    if (lower.includes("no hoa")) params.set("hoa_yn", "False");
    if (lower.includes("hoa under 300")) {
      params.set("hoa_yn", "True");
      params.set("hoa_fee_max", "300");
    }
    if (lower.includes("hoa under 500")) {
      params.set("hoa_yn", "True");
      params.set("hoa_fee_max", "500");
    }
    if (lower.includes("gated")) {
      params.set("hoa_yn", "True");
      params.append("hoa_fee_includes", "Security");
    }
    if (lower.includes("lawn care"))
      params.append("hoa_fee_includes", "Maintenance+Grounds");
    if (lower.includes("cable"))
      params.append("hoa_fee_includes", "Cable+TV");

    // ===========================================
    // 10. Garage
    // ===========================================
    const garageMatch = lower.match(/(\d)\s?(car garage)/);
    if (garageMatch) params.set("garage_spaces_min", garageMatch[1]);

    // ===========================================
    // 11. Views
    // ===========================================
    if (lower.includes("golf view")) params.set("view", "Golf+Course");
    if (lower.includes("lake view")) params.set("view", "Lake");
    if (lower.includes("ocean view")) params.set("view", "Ocean");
    if (lower.includes("preserve view")) params.set("view", "Preserve");
    if (lower.includes("city view")) params.set("view", "City");

    // ===========================================
    // 12. Sorting
    // ===========================================
    if (lower.includes("cheapest")) params.set("sort_by", "price-asc");
    if (lower.includes("most expensive")) params.set("sort_by", "price-desc");
    if (lower.includes("newest")) params.set("sort_by", "date-desc");

    // ===========================================
    // Default Fallback
    // ===========================================
    if (![...params.keys()].length) {
      params.set("county", "St.+Lucie");
      params.set("city", "Port+St.+Lucie");
    }

    const url = `${BASE_URL}?${params.toString()}`;

    return res.status(200).json({
      reply: `Here are some listings I found:<br><a href="${url}" target="_blank">👉 View Listings</a>`,
      threadId: threadId || uuidv4(),
    });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Failed to process request" });
  }
}

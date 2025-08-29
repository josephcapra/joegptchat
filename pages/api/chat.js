// pages/api/chat.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const baseUrl = "https://paradiserealtyfla.realgeeks.com/search/results/";
    const params = new URLSearchParams();

    // Default property types
    ["res", "con", "twn", "lnd", "mul"].forEach(t => params.append("type", t));
    params.set("list_price_min", "50000");
    params.set("list_price_max", "7000000");

    // ---- Price ----
    const underMatch = message.match(/under\s*\$?([\d,]+)/i);
    if (underMatch) params.set("list_price_max", underMatch[1].replace(/,/g, ""));
    const rangeMatch = message.match(/\$?([\d,]+)\s*(to|-)\s*\$?([\d,]+)/i);
    if (rangeMatch) {
      params.set("list_price_min", rangeMatch[1].replace(/,/g, ""));
      params.set("list_price_max", rangeMatch[3].replace(/,/g, ""));
    }

    // ---- Beds / Baths ----
    const bedsMatch = message.match(/(\d+)\s*(bed|bedroom)/i);
    if (bedsMatch) params.set("beds_min", bedsMatch[1]);
    const bathsMatch = message.match(/(\d+)\s*(bath|bathroom)/i);
    if (bathsMatch) params.set("baths_min", bathsMatch[1]);

    // ---- Year Built ----
    const yearMatch = message.match(/built\s*(after|since)?\s*(\d{4})/i);
    if (yearMatch) params.set("year_built_min", yearMatch[2]);

    // ---- Sqft ----
    const sqftMatch = message.match(/(\d{3,5})\s*(sqft|square feet)/i);
    if (sqftMatch) params.set("area_min", sqftMatch[1]);

    // ---- Acres ----
    const acreMatch = message.match(/(\d+(\.\d+)?)\s*acre/i);
    if (acreMatch) params.set("acres_min", acreMatch[1]);

    // ---- City / County ----
    if (/port st lucie|psl/i.test(message)) params.set("city", "Port St. Lucie");
    if (/stuart/i.test(message)) params.set("city", "Stuart");
    if (/jupiter/i.test(message)) params.set("city", "Jupiter");
    if (/martin/i.test(message)) params.set("county", "Martin");
    if (/palm beach/i.test(message)) params.set("county", "Palm Beach");

    // ---- Features ----
    if (/pool/i.test(message)) params.set("pool", "True");
    if (/waterfront/i.test(message)) params.set("waterfront", "True");
    if (/55/i.test(message)) params.set("senior_community_yn", "True");
    if (/hoa/i.test(message)) params.set("hoa_yn", "True");

    // ---- HOA Fee ----
    const hoaMatch = message.match(/hoa.*under\s*\$?([\d,]+)/i);
    if (hoaMatch) params.set("hoa_fee_max", hoaMatch[1].replace(/,/g, ""));

    // ---- Garage ----
    const garageMatch = message.match(/(\d+)\s*(car|garage)/i);
    if (garageMatch) params.set("garage_spaces_min", garageMatch[1]);

    // ---- Views ----
    if (/ocean/i.test(message)) params.append("view", "Ocean");
    if (/lake/i.test(message)) params.append("view", "Lake");
    if (/golf/i.test(message)) params.append("view", "Golf Course");

    // ---- Roof ----
    if (/tile roof/i.test(message)) params.append("roof", "Tile");
    if (/metal roof/i.test(message)) params.append("roof", "Metal");

    const url = `${baseUrl}?${params.toString()}`;

    return res.status(200).json({
      reply: `Here are listings matching "${message}":`,
      url,
    });

  } catch (err) {
    console.error("Search API error:", err);
    res.status(500).json({ error: "Failed to build search URL" });
  }
}

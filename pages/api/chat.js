// /pages/api/chat.js
import { NextResponse } from "next/server";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });

    let url = "https://paradiserealtyfla.realgeeks.com/search/results/?";
    let reply = "Here are listings that may help:";

    // Defaults
    let params = {
      county: "St. Lucie",
      city: "Port St. Lucie",
      subdivision: "all",
      type: "res",
      list_price_min: 50000,
      list_price_max: 7000000,
      beds_min: 2,
      baths_min: 1,
    };

    // Price parsing
    const priceMatch = message.match(/\$?(\d{2,3}k|\d{3,})(?:\s*-\s*\$?(\d{2,3}k|\d{3,}))?/i);
    if (priceMatch) {
      let min = priceMatch[1].replace("k", "000");
      let max = priceMatch[2] ? priceMatch[2].replace("k", "000") : params.list_price_max;
      params.list_price_min = parseInt(min);
      params.list_price_max = parseInt(max);
    }

    // Beds
    const bedsMatch = message.match(/(\d+)\s*(?:beds?|bedrooms?)/i);
    if (bedsMatch) params.beds_min = parseInt(bedsMatch[1]);

    // Baths
    const bathsMatch = message.match(/(\d+)\s*(?:baths?|bathrooms?)/i);
    if (bathsMatch) params.baths_min = parseInt(bathsMatch[1]);

    // 55+ / retirement
    if (/55\+|retire|senior/i.test(message)) params.senior_community_yn = true;

    // Waterfront
    if (/waterfront|lake|river|canal|ocean/i.test(message)) params.waterfront = true;

    // Pool
    if (/pool/i.test(message)) params.pool = true;

    // City / County mapping
    if (/stuart/i.test(message)) {
      params.city = "Stuart";
      params.county = "Martin";
    } else if (/jupiter/i.test(message)) {
      params.city = "Jupiter";
      params.county = "Palm Beach";
    } else if (/fort pierce/i.test(message)) {
      params.city = "Fort Pierce";
      params.county = "St. Lucie";
    } else if (/palm beach/i.test(message)) {
      params.city = "West Palm Beach";
      params.county = "Palm Beach";
    }

    // Build query string
    const queryString = Object.entries(params)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");

    url += queryString;

    return res.status(200).json({
      reply: reply,
      url: url,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}

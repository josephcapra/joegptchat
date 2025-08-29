// pages/api/chat.js
import { NextResponse } from "next/server";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    let url = "https://paradiserealtyfla.realgeeks.com/search/results/?";

    // very simple keyword-to-search mapping
    if (/400k/i.test(message)) {
      url += "list_price_max=400000&city=Port+St.+Lucie";
    } else if (/55\+/i.test(message)) {
      url += "subdivision=55%2B+Communities&city=Port+St.+Lucie";
    } else if (/waterfront/i.test(message)) {
      url += "waterfront=True&city=West+Palm+Beach";
    } else if (/new construction/i.test(message)) {
      url += "year_built_min=2020&city=Martin+County";
    } else {
      return res.status(200).json({
        reply: "I couldn’t match that to a property search. Try asking about price, 55+ communities, waterfront, or new construction.",
      });
    }

    return res.status(200).json({
      reply: `Here are some listings I found for "${message}":`,
      url,
    });
  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({ error: "Failed to process request" });
  }
}

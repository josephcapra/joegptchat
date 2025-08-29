import { v4 as uuidv4 } from "uuid";

const allowedOrigins = [
  "https://paradiserealtyfla.com",
  "https://paradiserealtyfla.realgeeks.com",
  "http://localhost:3000"
];

export default async function handler(req, res) {
  const origin = req.headers.origin;

  // ✅ Allow wildcard match for RealGeeks + Paradise Realty
  if (origin && (origin.includes("paradiserealtyfla.com") || origin.includes("realgeeks.com") || origin.includes("localhost"))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // ✅ Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, threadId } = req.body;

    // --------------------------------------
    // Example search logic
    // --------------------------------------
    let county = "St.+Lucie";
    let city = "Port+St.+Lucie";
    let maxPrice = "";

    if (/under\s*\$?400k/i.test(message)) {
      maxPrice = "&list_price_max=400000";
    }
    if (/Hobe Sound/i.test(message)) {
      city = "Hobe+Sound";
      county = "Martin";
    }

    const searchUrl = `https://paradiserealtyfla.com/search/results/?county=${county}&city=${city}${maxPrice}`;

    return res.status(200).json({
      threadId: threadId || uuidv4(),
      reply: `
        Here are some listings I found:<br><br>
        <a href="${searchUrl}" target="_blank"
          style="display:inline-block; background:#00796b; color:white; padding:10px 16px; border-radius:6px; text-decoration:none; font-weight:bold;">
          🔗 View Listings
        </a>
        <br><br>
        <small>${searchUrl}</small>
      `,
    });
  } catch (err) {
    console.error("Chat API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// lib/responseFormatter.js

export function formatSearchResponse(url, label = "👉 View Listings") {
  if (!url.includes("paradiserealtyfla.com")) {
    // 🚫 Block outside brokerages
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

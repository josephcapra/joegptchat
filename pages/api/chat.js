// pages/api/chat.js
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Supabase client (server-side with service role key)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, threadId } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // --- Call OpenAI ---
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }],
    });

    const reply =
      response.choices[0]?.message?.content?.trim() ||
      "Sorry, I couldn’t generate a response.";

    // --- Save query to Supabase ---
    await supabase.from("queries").insert({
      question: message,
      matched_community: null, // you can fill this later if you add matching logic
      response_url: null, // or store link to property page
      created_at: new Date().toISOString(),
    });

    res.status(200).json({ reply, threadId });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Failed to connect to OpenAI or Supabase" });
  }
}

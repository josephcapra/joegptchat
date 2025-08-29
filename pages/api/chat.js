export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, thread } = req.body;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5",
        input: [
          { role: "system", content: "You are JoeGPT, a real estate assistant for Paradise Realty FLA. Always return direct ParadiseRealtyFLA.com links. Apply the full search logic when generating results." },
          ...(thread || []),
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();
    const reply = data.output?.[0]?.content?.[0]?.text || "⚠️ No response from JoeGPT";

    res.status(200).json({
      reply,
      thread: [
        ...(thread || []),
        { role: "user", content: message },
        { role: "assistant", content: reply }
      ]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
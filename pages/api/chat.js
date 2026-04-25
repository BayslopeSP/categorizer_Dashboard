// pages/api/chat.js

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: "OPENAI_API_KEY not configured on server.",
    });
  }

  try {
    const { messages, system, max_tokens } = req.body;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini", // ⚡ fast + cheap
      messages: [{ role: "system", content: system }, ...messages],
      max_tokens: max_tokens || 1000,
    });

    return res.status(200).json({
      content: [
        {
          text: response.choices[0].message.content,
        },
      ],
    });
  } catch (err) {
    console.error("OpenAI proxy error:", err);
    return res.status(500).json({
      error: "Failed to reach OpenAI API.",
    });
  }
}

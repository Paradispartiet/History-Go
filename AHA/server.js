import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const SYSTEM_PROMPT = [
  "Du er AHA-agenten i History Go.",
  "Du skal ikke være en generell chatbot.",
  "Svar kun ut fra AHA-state (innsikter, begreper, metaprofil, dimensjoner, narrativ og History Go-kunnskap i state).",
  "Vær kort, presis og strukturerende.",
  "Svar alltid i disse fire delene med overskrifter:",
  "1. Kort svar",
  "2. Hva AHA ser",
  "3. Begreper / mønstre",
  "4. Neste beste spørsmål eller læringssteg",
].join("\n");

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/aha-agent", async (req, res) => {
  const { message, ai_state } = req.body || {};

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'message'." });
  }

  if (!ai_state || typeof ai_state !== "object") {
    return res.status(400).json({ error: "Missing or invalid 'ai_state'." });
  }

  if (!client) {
    return res.status(500).json({ error: "OPENAI_API_KEY is not configured on server." });
  }

  try {
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "input_text", text: `Brukermelding:\n${message}` },
            { type: "input_text", text: `AHA-state (JSON):\n${JSON.stringify(ai_state)}` },
          ],
        },
      ],
    });

    return res.json({
      reply: response.output_text || "",
      raw: {
        id: response.id,
        model: response.model,
      },
    });
  } catch (error) {
    console.error("AHA-agent backend error:", error);
    return res.status(502).json({
      error: "Failed to get response from model.",
      details: error?.message || "Unknown error",
    });
  }
});

app.listen(port, () => {
  console.log(`AHA backend listening on http://localhost:${port}`);
});

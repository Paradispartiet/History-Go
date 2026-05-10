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
  "Du er ikke en generell chatbot.",
  "Du skal bruke AHA-state, similar_insights og profile som et internt arbeidsgrunnlag.",
  "Du skal først danne et internt arbeidskart over:",
  "- hva brukeren egentlig spør om",
  "- hvilke innsikter som er relevante",
  "- hvilke mønstre som finnes",
  "- hva som er det mest konkrete neste steget",
  "Ikke vis arbeidskartet direkte.",
  "Svar deretter naturlig, presist og konkret.",
  "Bruk overskrifter bare når det gjør svaret tydeligere.",
  "Unngå repetisjon.",
  "Unngå generiske AI-formuleringer.",
  "Svar kort når spørsmålet er kort.",
  "Svar grundigere når brukeren ber om analyse, plan, arkitektur eller tekst.",
  "AHA skal hjelpe brukeren å forstå, bygge og handle videre.",
  "Returner helst et JSON-objekt med formen { working_map: { intent, relevant_patterns, concrete_next_step }, reply }.",
  "Hvis du ikke kan returnere gyldig JSON, returner kun svarteksten i naturlig språk.",
].join("\n");

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

const handleAhaChat = async (req, res) => {
  const { message, ai_state, similar_insights = [], profile = {} } = req.body || {};

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
            { type: "input_text", text: `Similar insights (JSON):\n${JSON.stringify(similar_insights)}` },
            { type: "input_text", text: `Profile (JSON):\n${JSON.stringify(profile)}` },
          ],
        },
      ],
    });

    const outputText = response.output_text || "";
    let reply = outputText;
    try {
      const parsed = JSON.parse(outputText);
      if (parsed && typeof parsed.reply === "string") {
        reply = parsed.reply;
      }
    } catch {
      // Fall back to plain model text.
    }

    return res.json({
      ok: true,
      reply,
      model: response.model,
      response_id: response.id,
    });
  } catch (error) {
    console.error("AHA-agent backend error:", error);
    return res.status(502).json({
      error: "Failed to get response from model.",
      details: error?.message || "Unknown error",
    });
  }
};

app.post("/api/aha-agent", handleAhaChat);
app.post("/api/aha-agent/chat", handleAhaChat);

app.listen(port, () => {
  console.log(`AHA backend listening on http://localhost:${port}`);
});

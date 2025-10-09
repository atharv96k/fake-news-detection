import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { generateText } from "ai";
import { perplexity } from "@ai-sdk/perplexity";
import fetch from "node-fetch";
import stringSimilarity from "string-similarity";
import * as cheerio from "cheerio";
import mysql from "mysql2/promise";

function looksLikeClaim(query) {
  // 1. Basic validation: ensure query is a non-empty string.
  if (!query || typeof query !== "string") {
    return false;
  }

  const text = query.trim().toLowerCase();

  // 2. Filter out very short or non-alphabetic inputs.
  const words = text.split(/\s+/);
  if (words.length < 3 || !/[a-z]/.test(text)) {
    return false;
  }

  // 🚫 2a. Ignore personal/self-descriptive statements
  const personalPatterns = [
    /\b(my name is|i am|this is me|we are|our name is|i have|i think|i believe)\b/,
  ];
  if (personalPatterns.some((p) => p.test(text))) {
    return false;
  }

  // 3. Rule-based checks for NON-claims.

  // 3a. Questions
  const questionPatterns = [
    /^\s*(what|who|when|where|why|how|is|are|was|were|do|does|did|will|can|could|should|would)\b/,
    /\?\s*$/,
  ];
  if (questionPatterns.some((p) => p.test(text))) {
    return false;
  }

  // 3b. Commands
  const commandPatterns = [
    /^\s*(tell|write|create|generate|explain|define|calculate|give|show|list|summarize|translate)\b/,
  ];
  if (commandPatterns.some((p) => p.test(text))) {
    return false;
  }

  // 3c. Greetings
  const greetingPatterns = [
    /^\s*(hi|hello|hey|yo|ok(ay)?|thanks?(\s*you)?|bye|good\s*(morning|afternoon|evening))\s*[.!]?\s*$/i,
  ];
  if (greetingPatterns.some((p) => p.test(text))) {
    return false;
  }

  // 4. Claim indicators
  const claimIndicators = [
    /\b(is|are|was|were|am)\b/,
    /\b(has|have|had)\b/,
    /\b(says?|said|states?|stated|reports?|reported|announces?|announced|claims?|claimed|declares?|declared)\b/,
    /\b(will|won|lost|signed|approved|launched|inaugurated|discovered|developed|created|found|showed|revealed|confirmed)\b/,
    /\b(government|company|study|report|scientists?|researchers?|minister|president|ceo)\b/,
  ];

  return claimIndicators.some((p) => p.test(text));
}


dotenv.config();
const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "https://truthlenss.vercel.app",
  })
);

const enrichedResults = new Map();

// ✅ MySQL Connection (IST timezone enforced)
const db = await mysql.createPool({
  host: process.env.MYSQL_HOST ,
  user: process.env.MYSQL_USER ,
  password: process.env.MYSQL_PASSWORD ,
  database: process.env.MYSQL_DATABASE ,
  timezone: "+05:30",
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  connectTimeout: 10000,
  idleTimeout: 60000,
});

// ✅ Keep-alive ping every 50 seconds
setInterval(async () => {
  try {
    await db.query("SELECT 1");
    console.log("🔁 MySQL keep-alive ping successful");
  } catch (err) {
    console.error("⚠️ MySQL keep-alive ping failed:", err.message);
  }
}, 50000);

// ✅ Handle connection errors gracefully
db.on?.("error", (err) => {
  console.error("⚠️ MySQL Pool Error:", err.code);
  if (err.code === "PROTOCOL_CONNECTION_LOST" || err.code === "ECONNRESET") {
    console.log("🔄 Attempting to reconnect to MySQL...");
  }
});

// ✅ Helper: Generate current Indian Standard Time (IST)
function getISTDateTime() {
  const date = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // +05:30 offset in ms
  const istTime = new Date(date.getTime() + istOffset);
  return istTime.toISOString().slice(0, 19).replace("T", " "); // MySQL DATETIME format
}

async function fetchArticleText(url) {
  try {
    if (!url || url === "N/A") return "";
    const response = await fetch(url, { timeout: 5000 });
    const html = await response.text();
    const $ = cheerio.load(html);
    $("script, style, nav, footer, header").remove();
    const text = $("body").text().replace(/\s+/g, " ").trim();
    return text.slice(0, 2000);
  } catch {
    return "";
  }
}

async function generateSummary(articleText, claim, url) {
  try {
    if (articleText && articleText.length > 100) {
      const { text } = await generateText({
        model: perplexity("sonar-pro"),
        prompt: `Claim: ${claim}
        Article Content: ${articleText}
        Summarize in 2–3 sentences whether this article supports, refutes, or is neutral about the claim.`,
      });
      return text.trim();
    } else {
      const { text } = await generateText({
        model: perplexity("sonar-pro"),
        prompt: `Claim: ${claim}
        
        The article could not be scraped. Use your knowledge and context from this URL:
        ${url}

        Summarize in 2–3 sentences whether this source likely supports, refutes, or is neutral about the claim.`,
      });
      return text.trim();
    }
  } catch {
    return "Summary unavailable.";
  }
}

// 🧠 Main Fact Check Route
app.post("/fact-check", async (req, res) => {
  const normalize = (str) => str.toLowerCase().replace(/[^\w]/g, "").trim();
  let { query } = req.body;

  if (!query) return res.status(400).json({ error: "Query is required" });
  console.log(`📰 Incoming claim: ${query}`);

  if (!looksLikeClaim(query)) {
    return res.json({
      verdict: "Not a factual claim",
      confidence_percentage: 0,
      top_3_sources: [],
      note: "This input doesn't appear to be a verifiable factual statement.",
    });
  }

  const claimForAI = query.split(":")[0].trim();
  const normalizedQuery = normalize(claimForAI);

  try {
    const CACHE_TTL_MS = 2 * 60 * 1000;
    const [rows] = await db.query(`SELECT * FROM query_cache WHERE created_at_ms IS NOT NULL`);
    const now = Date.now();

    const recentRows = rows.filter((r) => now - Number(r.created_at_ms) < CACHE_TTL_MS);

    let bestMatch = null;
    let highestScore = 0;

    for (const row of recentRows) {
      const cachedQuery = normalize(row.query_text);
      const score = stringSimilarity.compareTwoStrings(normalizedQuery, cachedQuery);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = row;
      }
    }

    if (bestMatch && highestScore >= 0.85) {
      console.log(`✅ Semantic cache hit — similarity: ${highestScore.toFixed(2)}`);
      let parsedResponse;
      if (typeof bestMatch.response === "string") {
        try {
          parsedResponse = JSON.parse(bestMatch.response);
        } catch {
          console.warn("⚠️ Could not parse cached response; using as-is");
          parsedResponse = bestMatch.response;
        }
      } else parsedResponse = bestMatch.response;

      return res.json({ requestId: "cached", ...parsedResponse });
    }

    console.log("🌀 Cache miss — Fetching from Perplexity");
    await new Promise((resolve) => setTimeout(resolve, 500));

    const fetchWithTimeout = (promise, ms = 20000) =>
      Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms)),
      ]);

    let text;
    try {
      ({ text } = await fetchWithTimeout(
        generateText({
          model: perplexity("sonar-pro"),
          prompt: `Fact check the following claim and respond in JSON format:
          {
            "verdict": "True/Fake/Mixed",
            "confidence_percentage": <number>,
            "top_3_sources": [
              { "title": "<title>", "url": "<url>", "summary": "<short placeholder summary>" }
            ]
          }
          Claim: ${claimForAI}`,
        }),
        20000
      ));
    } catch (err) {
      console.error("⚠️ Perplexity timeout or error:", err.message);
      return res.status(500).json({ error: "AI request timeout or failed" });
    }

    let data;
    try {
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}") + 1;
      const jsonCandidate = text.slice(jsonStart, jsonEnd).replace(/```json|```/g, "").trim();
      data = JSON.parse(jsonCandidate);
    } catch {
      console.warn("⚠️ AI response not valid JSON, using fallback");
      data = {
        verdict: "Pending",
        confidence_percentage: 0,
        top_3_sources: [],
        note: "AI response could not be parsed properly. Manual review needed.",
      };
    }

    // ✅ IST timestamp insert
    // ✅ Compute IST manually and store it
    const istNow = getISTDateTime();

    await db.query(
      `INSERT INTO query_cache (query_text, response, created_at_ms, created_at)
   VALUES (?, ?, ?, ?)
   ON DUPLICATE KEY UPDATE
     response = VALUES(response),
     created_at_ms = VALUES(created_at_ms),
     created_at = VALUES(created_at)`,
      [normalizedQuery, JSON.stringify(data), Date.now(), istNow]
    );


    const requestId = Date.now().toString();
    enrichedResults.set(requestId, { status: "processing", data, timestamp: Date.now() });

    if (!data.verdict || data.verdict.trim() === "") {
      data.verdict = "Uncertain";
      data.confidence_percentage = 0;
      data.top_3_sources = [];
      data.note = "The claim could not be verified with high certainty.";
    }

    console.log(`✅ Verdict: ${data.verdict} (${data.confidence_percentage}%)`);
    res.json(data);

    (async () => {
      if (data.top_3_sources) {
        const enriched = await Promise.all(
          data.top_3_sources.map(async (src) => {
            const articleText = await fetchArticleText(src.url);
            const summary = await generateSummary(articleText, claimForAI, src.url);
            return { title: src.title, url: src.url, summary };
          })
        );
        data.top_3_sources = enriched;
        enrichedResults.set(requestId, { status: "done", data, timestamp: Date.now() });
      }
    })();
  } catch (error) {
    console.error("❌ Fact-check error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// 🧹 Periodic cleanup every 5 minutes
setInterval(async () => {
  const CUTOFF = Date.now() - 3 * 60 * 1000;
  try {
    await db.query("DELETE FROM query_cache WHERE created_at_ms < ?", [CUTOFF]);
    console.log("🧹 Periodic cache cleanup done");
  } catch (err) {
    console.error("⚠️ Cleanup error:", err.message);
  }
}, 3 * 60 * 1000);

app.get("/fact-check/enriched/:id", (req, res) => {
  const result = enrichedResults.get(req.params.id);
  if (!result) return res.status(404).json({ error: "Result not found" });
  res.json(result);
});

app.listen(5000, () => console.log("✅ Backend is Running Fine (IST Enabled)!"));

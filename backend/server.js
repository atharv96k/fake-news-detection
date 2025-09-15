import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { generateText } from "ai";
import { perplexity } from "@ai-sdk/perplexity";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

dotenv.config();
const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "https://fake-news-detection-psbo.vercel.app/",
  })
);

// 🗂 Simple in-memory cache for enriched results
const enrichedResults = new Map();

// Utility: Fetch article text
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

// Utility: Generate summary
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

// Route: Initial fact check (fast)
app.post("/fact-check", async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Query is required" });

  try {
    const { text } = await generateText({
      model: perplexity("sonar-pro"),
      prompt: `Fact check the following claim and respond ONLY in JSON format:
{
  "verdict": "True/Fake/Mixed",
  "confidence_percentage": <number>,
  "top_3_sources": [
    { 
      "title": "<title>", 
      "url": "<url>", 
      "summary": "<short placeholder summary>"
    }
  ]
}

Claim: ${query}`,
    });

    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}") + 1;
    const jsonText = text.slice(jsonStart, jsonEnd);
    const data = JSON.parse(jsonText);

    // Generate a unique request ID
    const requestId = Date.now().toString();
    enrichedResults.set(requestId, { status: "processing", data });

    // Send partial response immediately
    res.json({ requestId, ...data });

    // Background enrichment
    (async () => {
      if (data.top_3_sources) {
        const enriched = await Promise.all(
          data.top_3_sources.map(async (src) => {
            const url = src.url || src.URL;
            const articleText = await fetchArticleText(url);
            const summary = await generateSummary(articleText, query, url);

            return {
              title: src.title,
              url,
              summary,
            };
          })
        );
        data.top_3_sources = enriched;
      }
      enrichedResults.set(requestId, { status: "done", data });
    })();
  } catch (error) {
    console.error("Error parsing API response:", error);
    res.status(500).json({ error: "Perplexity API response is not valid JSON" });
  }
});

// Route: Fetch enriched result later
app.get("/fact-check/enriched/:id", (req, res) => {
  const result = enrichedResults.get(req.params.id);
  if (!result) return res.status(404).json({ error: "Result not found" });
  res.json(result);
});

app.listen(5000, () => console.log("✅ Backend is Running Fine!!"));

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { generateText } from "ai";
import { perplexity } from "@ai-sdk/perplexity";
import fetch from "node-fetch";
import stringSimilarity from "string-similarity";
import * as cheerio from "cheerio";
import mysql from "mysql2/promise";

/**
 * TRUTHLENS BACKEND DOCUMENTATION
 * 
 * This is a fact-checking API backend that:
 * 1. Takes user claims/queries as input
 * 2. Checks if similar queries exist in cache
 * 3. Uses AI (Perplexity) to fact-check new claims
 * 4. Returns verdicts with confidence scores and sources
 * 5. Enriches results with article summaries
 * 6. Stores everything in MySQL database with IST timestamps
 */

// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app = express();
app.use(express.json());

/**
 * CORS Configuration
 * Allows frontend hosted on Vercel to communicate with this backend
 */
app.use(
  cors({
    origin: "https://truthlenss.vercel.app",
  })
);

/**
 * Temporary storage for enriched results
 * Maps request IDs to processing/done results
 * Used while background tasks fetch article content
 */
const enrichedResults = new Map();

// ✅ MySQL Database Connection Configuration
/**
 * Creates a connection pool to MySQL database with:
 * - Connection details from environment variables
 * - IST timezone enforcement (+05:30 for India)
 * - Connection pooling for better performance
 * - Automatic reconnection handling
 */
const db = await mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  timezone: "+05:30", // Indian Standard Time
  waitForConnections: true,
  connectionLimit: 5, // Maximum 5 simultaneous connections
  queueLimit: 0, // No limit on waiting connections
  connectTimeout: 10000, // 10 second connection timeout
  idleTimeout: 60000, // Close idle connections after 60 seconds
});

/**
 * Database Keep-Alive Mechanism
 * Prevents MySQL from closing idle connections
 * Runs every 50 seconds to maintain connection
 */
setInterval(async () => {
  try {
    await db.query("SELECT 1"); // Simple query to keep connection alive
    console.log("🔁 MySQL keep-alive ping successful");
  } catch (err) {
    console.error("⚠️ MySQL keep-alive ping failed:", err.message);
  }
}, 50000); // Every 50 seconds

/**
 * Database Error Handler
 * Listens for connection errors and handles reconnection
 */
db.on?.("error", (err) => {
  console.error("⚠️ MySQL Pool Error:", err.code);
  if (err.code === "PROTOCOL_CONNECTION_LOST" || err.code === "ECONNRESET") {
    console.log("🔄 Attempting to reconnect to MySQL...");
  }
});

/**
 * Helper Function: Get Indian Standard Time (IST)
 * Converts current time to IST timezone
 * @returns {string} Current datetime in IST format (YYYY-MM-DD HH:MM:SS)
 */
function getISTDateTime() {
  const date = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // +05:30 offset in milliseconds
  const istTime = new Date(date.getTime() + istOffset);
  return istTime.toISOString().slice(0, 19).replace("T", " "); // MySQL DATETIME format
}

/**
 * Web Scraping Function
 * Fetches and extracts text content from article URLs
 * @param {string} url - The article URL to scrape
 * @returns {string} First 2000 characters of cleaned article text
 */
async function fetchArticleText(url) {
  try {
    if (!url || url === "N/A") return ""; // Skip invalid URLs

    // Fetch HTML content with timeout
    const response = await fetch(url, { timeout: 5000 });
    const html = await response.text();

    // Load HTML into Cheerio for parsing
    const $ = cheerio.load(html);

    // Remove unnecessary elements (scripts, styles, navigation)
    $("script, style, nav, footer, header").remove();

    // Extract and clean text content
    const text = $("body").text().replace(/\s+/g, " ").trim();
    return text.slice(0, 2000); // Return first 2000 characters
  } catch {
    return ""; // Return empty string if scraping fails
  }
}

/**
 * AI-Powered Summary Generator
 * Creates summaries of articles in relation to the original claim
 * @param {string} articleText - Scraped article content
 * @param {string} claim - Original fact-check claim
 * @param {string} url - Article URL (for context)
 * @returns {string} 2-3 sentence summary analyzing the article's stance
 */
async function generateSummary(articleText, claim, url) {
  try {
    if (articleText && articleText.length > 100) {
      // If article text is available, summarize based on content
      const { text } = await generateText({
        model: perplexity("sonar-pro"),
        prompt: `Claim: ${claim}
        Article Content: ${articleText}
        Summarize in 2–3 sentences whether this article supports, refutes, or is neutral about the claim.`,
      });
      return text.trim();
    } else {
      // If scraping failed, use AI knowledge about the URL
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
    return "Summary unavailable."; // Fallback if AI fails
  }
}

// 🧠 MAIN FACT-CHECK ROUTE
/**
 * POST /fact-check
 * Main endpoint for fact-checking claims
 * Process:
 * 1. Receives user query
 * 2. Checks cache for similar queries
 * 3. Uses AI for new fact-checks
 * 4. Stores results in database
 * 5. Returns immediate response
 * 6. Background enrichment of sources
 */
app.post("/fact-check", async (req, res) => {
  /**
   * Text normalization for similarity comparison
   * Converts to lowercase and removes special characters
   */
  const normalize = (str) => str.toLowerCase().replace(/[^\w]/g, "").trim();

  let { query } = req.body;

  // Validate input
  if (!query) return res.status(400).json({ error: "Query is required" });
  console.log(`📰 Incoming claim: ${query}`);

  // Extract main claim (handles "claim: context" format)
  const claimForAI = query.trim();
  const normalizedQuery = normalize(query);


  try {
    /**
     * CACHE CHECKING SYSTEM
     * Looks for similar queries in database to avoid duplicate AI calls
     * Uses string similarity comparison with 85% threshold
     */
    const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes cache lifetime

    // Fetch recent cached queries
    const [rows] = await db.query(`SELECT * FROM query_cache WHERE created_at_ms IS NOT NULL`);
    const now = Date.now();

    // Filter queries within cache timeframe
    const recentRows = rows.filter((r) => now - Number(r.created_at_ms) < CACHE_TTL_MS);

    // Find best matching cached query using similarity comparison
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

    // Return cached result if good match found
    if (bestMatch && highestScore >= 0.85) {
      console.log(`✅ Semantic cache hit — similarity: ${highestScore.toFixed(2)}`);
      let parsedResponse;

      // Parse cached response (could be string or object)
      if (typeof bestMatch.response === "string") {
        try {
          parsedResponse = JSON.parse(bestMatch.response);
        } catch {
          console.warn("⚠️ Could not parse cached response; using as-is");
          parsedResponse = bestMatch.response;
        }
      } else {
        parsedResponse = bestMatch.response;
      }

      return res.json({ requestId: "cached", ...parsedResponse });
    }

    /**
     * AI FACT-CHECKING PROCESS
     * Only reached when no cache hit occurs
     * Uses Perplexity AI to analyze the claim
     */
    console.log("🌀 Cache miss — Fetching from Perplexity");

    // Small delay to prevent rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));

    /**
     * Timeout wrapper for AI requests
     * Prevents hanging requests (20 second timeout)
     */
    const fetchWithTimeout = (promise, ms = 20000) =>
      Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms)),
      ]);

    let text;
    try {
      // Generate AI fact-check with comprehensive prompt
      ({ text } = await fetchWithTimeout(
        generateText({
          model: perplexity("sonar-pro"),
          prompt: `You are an expert multilingual fact-checking system.

You will receive a claim which might be written in English, Hindi, or Marathi.

Your task:
1. Determine whether the given text looks like a factual or news-type claim that can be verified.
2. If yes, perform a fact-check using your reasoning, public knowledge, and context.
3. If no (e.g., greetings, questions, opinions, or self-introductions), respond as "Uncertain".

Instructions:
- Always return valid JSON only. No explanations or markdown.
- If you are uncertain or cannot verify due to lack of reliable context, set verdict to "Uncertain" and confidence_percentage to 0.

Return response in this exact JSON format:
{
  "verdict": "True" | "False" | "Mixed" | "Uncertain",
  "confidence_percentage": <number>,
  "top_3_sources": [
    { "title": "<title>", "url": "<url>", "summary": "<short summary>" }
  ],
  "note": "<optional short note>"
}

Claim: ${claimForAI}`
        }),
        20000 // 20 second timeout
      ));
    } catch (err) {
      console.error("⚠️ Perplexity timeout or error:", err.message);
      return res.status(500).json({ error: "AI request timeout or failed" });
    }

    /**
     * AI RESPONSE PARSING
     * Extracts JSON from AI response text
     * Handles malformed JSON gracefully
     */
    let data;
    try {
      // Find JSON in response (might be wrapped in markdown)
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

    /**
     * DATABASE STORAGE
     * Save new fact-check result to MySQL cache
     * Uses IST timestamp for consistent timezone
     */
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

    /**
     * BACKGROUND ENRICHMENT SETUP
     * Store initial result and start background processing
     * User gets immediate response, sources get enriched later
     */
    const requestId = Date.now().toString();
    enrichedResults.set(requestId, { status: "processing", data, timestamp: Date.now() });

    // Ensure verdict has valid fallback values
    if (!data.verdict || data.verdict.trim() === "") {
      data.verdict = "Uncertain";
      data.confidence_percentage = 0;
      data.top_3_sources = [];
      data.note = "The claim could not be verified with high certainty.";
    }

    console.log(`✅ Verdict: ${data.verdict} (${data.confidence_percentage}%)`);

    // Send immediate response to user
    res.json(data);

    /**
     * BACKGROUND ENRICHMENT PROCESS
     * Runs after response is sent to user
     * Fetches article content and generates summaries
     * Updates enrichedResults map when complete
     */
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

/**
 * AUTOMATED CACHE CLEANUP
 * Removes old cache entries every 3 minutes
 * Prevents database from growing indefinitely
 */
setInterval(async () => {
  const CUTOFF = Date.now() - 3 * 60 * 1000; // 3 minutes ago
  try {
    await db.query("DELETE FROM query_cache WHERE created_at_ms < ?", [CUTOFF]);
    console.log("🧹 Periodic cache cleanup done");
  } catch (err) {
    console.error("⚠️ Cleanup error:", err.message);
  }
}, 3 * 60 * 1000); // Run every 3 minutes

/**
 * ENRICHED RESULTS ENDPOINT
 * Allows frontend to check status of background enrichment
 * Used when user wants to see detailed source summaries
 */
app.get("/fact-check/enriched/:id", (req, res) => {
  const result = enrichedResults.get(req.params.id);
  if (!result) return res.status(404).json({ error: "Result not found" });
  res.json(result);
});

/**
 * SERVER STARTUP
 * Initialize the Express server on port 5000
 */
app.listen(5000, () => console.log("✅ Backend is Running Fine (IST Enabled)!"));
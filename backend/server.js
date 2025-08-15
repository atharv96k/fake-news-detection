import express from "express";
import dotenv from "dotenv";
import cors from "cors";   
import { generateText } from "ai";
import { perplexity } from "@ai-sdk/perplexity";

dotenv.config();
const app = express();

app.use(express.json());

// Allow requests from frontend
app.use(cors({
  origin: "https://fake-news-detection-psbo.vercel.app" // your React frontend URL
}));

app.post("/fact-check", async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Query is required" });

  try {
    const { text } = await generateText({
      model: perplexity("sonar-pro"),
      prompt: `Fact check the following claim and respond in JSON format with:
      - verdict (True/Fake/Mixed)
      - confidence_percentage
      - top_3_sources with title and URL

      Claim: ${query}`,
    });

    // console.log("Perplexity response:", text);

    // Safely extract JSON from response
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}") + 1;
    const jsonText = text.slice(jsonStart, jsonEnd);

    const data = JSON.parse(jsonText); // Safe parse
    res.json(data);

  } catch (error) {
    console.error("Error parsing API response:", error);
    res.status(500).json({ error: "Perplexity API response is not valid JSON" });
  }
});

app.listen(5000, () => console.log("Backend running on port 5000"));

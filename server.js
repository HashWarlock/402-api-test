import express from "express";
import { paymentMiddleware } from "x402-express";
import { facilitator } from "@coinbase/x402";
import dotenv from "dotenv";
import path from "path";
import OpenAI from "openai";
import { runTestBuy, getTestAccountPublicKey } from "./testBuy.js";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();

// Serve static files from the public directory
app.use(express.static(path.join(process.cwd(), "public")));

app.use(express.json());

app.use(
  paymentMiddleware(
    process.env.WALLET_ADDRESS, // your receiving wallet address
    {
      // Route configurations for protected endpoints
      "POST /text-to-image": {
        price: "$0.25",
        network: "base-sepolia",
      },
      "GET /text-to-image": {
        price: "$0.25",
        network: "base-sepolia",
      },
      "POST /word-count": {
        price: "$0.01",
        network: "base-sepolia",
      },
      "GET /word-count": {
        price: "$0.01",
        network: "base-sepolia",
      },
      "POST /sentiment-analysis": {
        price: "$0.05",
        network: "base-sepolia",
      },
      "GET /sentiment-analysis": {
        price: "$0.05",
        network: "base-sepolia",
      },
    },
    facilitator
  )
);

const MAX_WORDS = 10000;

// Shared handler for text-to-image
async function textToImageHandler(req, res) {
  try {
    // Add logging to debug the request
    console.log("Request body:", req.body);
    console.log("Request query:", req.query);

    const prompt =
      req.body?.prompt || req.query?.prompt || "a beautiful landscape";
    console.log("Using prompt:", prompt);

    const promptWordCount = prompt.trim().split(/\s+/).length;
    if (promptWordCount > MAX_WORDS) {
      return res.status(400).send({
        error: `Prompt exceeds maximum word count of ${MAX_WORDS} words.`,
      });
    }
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      quality: "standard",
      size: "1024x1024",
    });
    const imageUrl = response.data[0].url;
    res.send({
      image: imageUrl,
      prompt: prompt,
    });
  } catch (error) {
    console.error("Error generating image:", error);
    res.status(500).send({
      error: "Failed to generate image",
      message: error.message,
    });
  }
}
app.post("/text-to-image", textToImageHandler);
app.get("/text-to-image", textToImageHandler);

// Shared handler for word-count
function wordCountHandler(req, res) {
  try {
    const text = req.body.text || req.query.text;
    if (!text) {
      return res.status(400).send({
        error: "No text provided",
      });
    }
    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount > MAX_WORDS) {
      return res.status(400).send({
        error: `Text exceeds maximum word count of ${MAX_WORDS} words.`,
      });
    }
    res.send({
      wordCount,
      text: text,
    });
  } catch (error) {
    console.error("Error counting words:", error);
    res.status(500).send({
      error: "Failed to count words",
      message: error.message,
    });
  }
}
app.post("/word-count", wordCountHandler);
app.get("/word-count", wordCountHandler);

// Shared handler for sentiment-analysis
function sentimentAnalysisHandler(req, res) {
  try {
    const text = req.body.text || req.query.text;
    if (!text) {
      return res.status(400).send({
        error: "No text provided",
      });
    }
    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount > MAX_WORDS) {
      return res.status(400).send({
        error: `Text exceeds maximum word count of ${MAX_WORDS} words.`,
      });
    }
    const positiveWords = [
      "happy",
      "good",
      "great",
      "awesome",
      "love",
      "excellent",
      "nice",
      "joy",
      "positive",
    ];
    const negativeWords = [
      "sad",
      "bad",
      "terrible",
      "hate",
      "awful",
      "poor",
      "cry",
      "negative",
    ];
    let sentiment = "neutral";
    let positiveScore = 0;
    let negativeScore = 0;
    const words = text.toLowerCase().split(/\s+/);
    words.forEach((word) => {
      if (positiveWords.includes(word)) {
        positiveScore++;
      } else if (negativeWords.includes(word)) {
        negativeScore++;
      }
    });
    if (positiveScore > negativeScore) {
      sentiment = "positive";
    } else if (negativeScore > positiveScore) {
      sentiment = "negative";
    }
    res.send({
      sentiment,
      text: text,
      scores: {
        positive: positiveScore,
        negative: negativeScore,
      },
    });
  } catch (error) {
    console.error("Error performing sentiment analysis:", error);
    res.status(500).send({
      error: "Failed to perform sentiment analysis",
      message: error.message,
    });
  }
}
app.post("/sentiment-analysis", sentimentAnalysisHandler);
app.get("/sentiment-analysis", sentimentAnalysisHandler);

// Add an endpoint to trigger the testBuy logic
app.get("/test-buy", async (_req, res) => {
  try {
    // Call the test buy function and return its result
    const result = await runTestBuy();
    res.send({ success: true, result });
  } catch (error) {
    // Return error details for debugging
    res.status(500).send({
      success: false,
      error: error.message,
      stack: error.stack,
    });
  }
});

// Add an endpoint to get the public key (address) of the test account
app.get("/test-account-address", async (_req, res) => {
  try {
    // Call the function to get the address
    const address = await getTestAccountPublicKey();
    console.log("Test account address:", address);
    res.send({ success: true, address });
  } catch (error) {
    // Return error details for debugging
    res.status(500).send({
      success: false,
      error: error.message,
      stack: error.stack,
    });
  }
});

// Serve the home page
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

// Add this line at the end of the file
export default app;

// Add this block to run the server locally
const PORT = process.env.PORT || 4021;
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});

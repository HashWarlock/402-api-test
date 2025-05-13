import express from "express";
import { paymentMiddleware } from "x402-express";
import { facilitator } from "@coinbase/x402";
import dotenv from "dotenv";
import path from "path";
import OpenAI from "openai";
import { base } from "viem/chains";
import { log } from "./utils/log.js";
import { textToImageHandler } from "./handlers/textToImageHandler.js";
import { wordCountHandler } from "./handlers/wordCountHandler.js";
import { sentimentAnalysisHandler } from "./handlers/sentimentAnalysisHandler.js";
import { testAccountAddressHandler } from "./handlers/testBuyHandler.js";
import { testBuyHandler } from "./handlers/testBuyHandler.js";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();

// Uncomment for Base sepolia (testing)
const network = "base-sepolia";
const facilitatorObj = { url: "https://x402.org/facilitator" };
// Uncomment for Base mainnet
// const network = "base";
// const facilitatorObj = facilitator;

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
        network: network,
      },
      "GET /text-to-image": {
        price: "$0.25",
        network: network,
      },
      "POST /word-count": {
        price: "$0.01",
        network: network,
      },
      "GET /word-count": {
        price: "$0.01",
        network: network,
      },
      "POST /sentiment-analysis": {
        price: "$0.05",
        network: network,
      },
      "GET /sentiment-analysis": {
        price: "$0.05",
        network: network,
      },
    },
    facilitatorObj
  )
);

// Add request logging middleware (only in development)
app.use((req, res, next) => {
  const start = Date.now();
  log(`${req.method} ${req.url}`);
  log(`Request Headers: ${JSON.stringify(req.headers)}`);
  res.on("finish", () => {
    const duration = Date.now() - start;
    log(`${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

app.post("/text-to-image", await textToImageHandler(openai));
app.get("/text-to-image", await textToImageHandler(openai));

app.post("/word-count", wordCountHandler);
app.get("/word-count", wordCountHandler);

app.post("/sentiment-analysis", sentimentAnalysisHandler);
app.get("/sentiment-analysis", sentimentAnalysisHandler);

app.get("/test-account-address", testAccountAddressHandler);
app.get("/test-buy", testBuyHandler);

// Serve the home page
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

// Add this line at the end of the file
export default app;

// This block to runs the server locally
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 4021;
  app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
  });
}

# 402 API

Boilerplate for building an API on the [X402 payment protocol](https://www.x402.org/) for monetizing API endpoints.

Live demo at [x402 API in TEE](https://x402.incipient.ltd)

## Overview

This project provides a Node.js-based API server with monetized endpoints using the X402 payment protocol. It includes a web frontend for user interaction and various specialized API handlers for different functionalities. The project can be deployed in a Trusted Execution Environment (TEE) on [Phala Cloud](https://cloud.phala.network) to ensure secure and verifiable execution of API calls, protecting sensitive operations and payment transactions.

## API Endpoints

The server exposes the following API endpoints (GET or POST). Each endpoint requires payment via the X402 protocol on the Base network. Below are detailed descriptions of each endpoint, including how to make calls and expected responses:

### `/text-to-image`

- **Description**: Generates an image based on a text prompt using OpenAI's DALL-E 3 model. This endpoint leverages AI to create visual content from textual descriptions.
- **Payment Required**: Yes (e.g., $0.10 on Base network).
- **Method**: GET or POST
- **Query Parameters (for GET)**:
  - `prompt` (string): The text prompt for image generation (defaults to "a beautiful landscape").
- **Request Body (for POST)**:
  - `prompt` (string): The text prompt for image generation.
- **Word Limit**: The prompt is limited to a maximum of 10,000 words.
- **Returns**: JSON object with:
  - `image` (string): URL of the generated image.
  - `prompt` (string): The original prompt used for generation.
- **Example Call** (using curl):
  ```bash
  curl -X POST "http://localhost:4021/text-to-image" -H "Content-Type: application/json" -d '{"prompt": "a futuristic cityscape"}'
  ```
- **Example Response**:
  ```json
  {
    "image": "https://example.com/generated-image.jpg",
    "prompt": "a futuristic cityscape"
  }
  ```

### `/word-count`

- **Description**: Counts the number of words in a given text. Useful for text analysis or validation tasks.
- **Payment Required**: Yes (e.g., $0.01 on Base network).
- **Method**: POST
- **Request Body**:
  - `text` (string): The text for which to count words.
- **Word Limit**: The input text is limited to a maximum of 10,000 words.
- **Returns**: JSON object with:
  - `wordCount` (number): The number of words in the text.
  - `text` (string): The original input text.
- **Example Call** (using curl):
  ```bash
  curl -X POST "http://localhost:4021/word-count" -H "Content-Type: application/json" -d '{"text": "This is a sample text."}'
  ```
- **Example Response**:
  ```json
  {
    "wordCount": 5,
    "text": "This is a sample text."
  }
  ```

### `/sentiment-analysis`

- **Description**: Performs basic sentiment analysis on the provided text, classifying it as positive, negative, or neutral based on keyword scoring.
- **Payment Required**: Yes (e.g., $0.05 on Base network).
- **Method**: POST
- **Request Body**:
  - `text` (string): The text to analyze.
- **Word Limit**: The input text is limited to a maximum of 10,000 words.
- **Returns**: JSON object with:
  - `sentiment` (string): The overall sentiment ("positive", "negative", or "neutral").
  - `text` (string): The original input text.
  - `scores` (object): Contains counts of positive and negative words.
- **Example Call** (using curl):
  ```bash
  curl -X POST "http://localhost:4021/sentiment-analysis" -H "Content-Type: application/json" -d '{"text": "I love this amazing product!"}'
  ```
- **Example Response**:
  ```json
  {
    "sentiment": "positive",
    "text": "I love this amazing product!",
    "scores": {
      "positive": 3,
      "negative": 0
    }
  }
  ```

### `/test-buy`

- **Description**: A test endpoint for simulating a purchase or transaction using the X402 protocol. This is useful for developers integrating payment flows.
- **Payment Required**: No, this will use a generated key to pay for the test generation of a red ball.
- **Method**: POST
- **Request Body**: Parameters are hard coded to generate a red ball.
- **Returns**: JSON response indicating the result of the test transaction.
- **Example Call** (using curl):
  ```bash
  curl -X POST "http://localhost:4021/test-buy" -H "Content-Type: application/json" -d '{}'
  ```
- **Example Response**:
  ```json
  {
    "status": "success",
    "message": "Test transaction completed."
  }
  ```

### `GET /`

- **Description**: Serves the `index.html` page from the `public` directory, providing a web interface to interact with the API.
- **Payment Required**: No
- **Method**: GET
- **Returns**: HTML content of the web interface.
- **Example Call** (using curl):
  ```bash
  curl "http://localhost:4021/"
  ```

## Trusted Execution Environment (TEE)

This project supports deployment in a Trusted Execution Environment (TEE), as demonstrated in the live demo at [x402 API in TEE](https://x402.incipient.ltd). TEE provides a secure environment for executing code, ensuring that sensitive operations such as payment processing via the X402 protocol and API key handling are protected from unauthorized access or tampering.

- **How TEE is Used**: When deployed in a TEE, the API server runs within a Trust Domain in an isolated confidential VM. This enclave guarantees that the code and data (like secret salts for key generation, payment transactions, and API responses) are shielded from the host system and external threats. For instance, payment validations and interactions with the Base network are processed securely.
- **Benefits**: Using TEE enhances trust for users and developers by ensuring that monetized API calls are handled transparently and securely. It prevents potential manipulation of pricing or bypassing payment requirements.
- **Deployment**: The project can be configured to run in TEE platforms like [Phala Cloud](https://cloud.phala.network). Specific setup may vary based on the chosen TEE provider, but the codebase is designed to be compatible with such environments without significant changes.

## Project Structure

- **`handlers/`**: Contains individual handler files for each API endpoint logic.
- **`public/`**: Includes static files for the web frontend (HTML, CSS, JavaScript).
- **`utils/`**: Shared utilities like logging functions used across the project.
- **`server.js`**: Main server file that sets up Express and routes.
- **`testBuy.js`**: Script for testing the X402 payment protocol integration.

## Setup and Run Server

1. **Install Dependencies**:

   ```bash
   npm install
   # or
   yarn install
   ```

2. **Environment Variables**:
   Create a `.env` file in the root of the project with the following variables:

   ```env
   # Your wallet address that will receive payments
   WALLET_ADDRESS=your_wallet_address_here

   # OpenAI API key for DALL-E image generation
   OPENAI_API_KEY=your_openai_api_key_here

   # CDP API key ID
   CDP_API_KEY_ID=your_cdp_api_key_id_here

   # CDP API key secret
   CDP_API_KEY_SECRET=your_cdp_api_key_secret_here
   ```

3. **Start the Server**:

   ```bash
   node server.js
   ```

   The server will start on `http://localhost:4021`.

## Test Buy

1. **Install Dependencies** (if not already done):

   ```bash
   npm install
   # or
   yarn install
   ```

2. **Environment Variables**:
   Add the following to your `.env` file for testing buy:

   ```env
   # Your wallet address that will receive payments
   WALLET_ADDRESS=your_wallet_address_here

   # OpenAI API key for DALL-E image generation
   OPENAI_API_KEY=your_openai_api_key_here

   # Secret salt to generate a key from in TEE
   DSTACK_SECRET_SALT=secret_salt
   ```

3. **Test Buy**:

   ```bash
   node testBuy.js
   ```

## Dependencies

- `express`: Web framework for Node.js.
- `x402-express`: Express middleware for X402 payments.
- `@coinbase/x402`: Facilitator for X402 protocol.
- `dotenv`: Loads environment variables from a `.env` file.
- `openai`: OpenAI Node.js library for accessing the DALL-E API.

---

Learn more about the 402 payment protocol at [x402.org](https://www.x402.org/).

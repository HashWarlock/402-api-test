import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { wrapFetchWithPayment, decodeXPaymentResponse } from "x402-fetch";
import { TappdClient } from "@phala/dstack-sdk";
import { toViemAccount } from "@phala/dstack-sdk/viem";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Runs the test buy logic and returns the result.
 * Throws an error if any step fails.
 */
export async function runTestBuy() {
  let account;
  let privateKey = process.env.PRIVATE_KEY;

  // If PRIVATE_KEY is not set, try to derive it from DSTACK_SECRET_SALT
  if (!privateKey) {
    if (!process.env.DSTACK_SECRET_SALT) {
      throw new Error("DSTACK_SECRET_SALT environment variable is not set");
    }
    const client = new TappdClient();
    console.log("Deriving key from DSTACK_SECRET_SALT");
    const deriveKeyResponse = await client.deriveKey(process.env.DSTACK_SECRET_SALT);
    account = toViemAccount(deriveKeyResponse);
    console.log("Derived key:", account.address);
  } else {
    // Convert to hex if it's not already
    if (!privateKey.startsWith("0x")) {
      privateKey = "0x" + Buffer.from(privateKey).toString("hex").padStart(64, "0");
    }
    account = privateKeyToAccount(privateKey);
  }
  
  // Set max payment amount to 1 USDC in base units
  const fetchWithPayment = wrapFetchWithPayment(
    fetch,
    account,
    BigInt(0.1 * 10 ** 7)
  );

  const url = "https://x402.incipient.ltd/text-to-image?prompt=a%20red%20ball";

  try {
    fetchWithPayment(url, {
      method: "GET",
    })
    .then(async (response) => {
      const body = await response.json();
        console.log(body);
        return body;
    })
    .catch((error) => {
      console.error(error);
    });
  } catch (error) {
    console.error(error);
  }
}

/**
 * Returns the public key (address) of the test account.
 * Uses the same logic as runTestBuy to generate or derive the account.
 */
export async function getTestAccountPublicKey() {
  let account;
  let privateKey = process.env.PRIVATE_KEY;

  // If PRIVATE_KEY is not set, try to derive it from DSTACK_SECRET_SALT
  if (!privateKey) {
    if (!process.env.DSTACK_SECRET_SALT) {
      throw new Error("DSTACK_SECRET_SALT environment variable is not set");
    }
    const client = new TappdClient();
    console.log("Deriving key from DSTACK_SECRET_SALT");
    const deriveKeyResponse = await client.deriveKey(process.env.DSTACK_SECRET_SALT);
    account = toViemAccount(deriveKeyResponse);
    console.log("Derived key:", account.address);
  } else {
    // Convert to hex if it's not already
    if (!privateKey.startsWith("0x")) {
      privateKey = "0x" + Buffer.from(privateKey).toString("hex").padStart(64, "0");
    }
    account = privateKeyToAccount(privateKey);
  }

  // Return the address (public key)
  return account.address;
}


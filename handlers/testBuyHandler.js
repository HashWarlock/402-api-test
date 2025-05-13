import { runTestBuy, getTestAccountPublicKey } from "../testBuy.js";
import { log } from "../utils/log.js";

/**
 * Handler for running the test buy logic.
 * Calls runTestBuy and returns the result or error.
 */
export async function testBuyHandler(_req, res) {
  const startTime = Date.now();
  try {
    log("Processing test buy request");
    const result = await runTestBuy();
    log(`Test buy completed in ${Date.now() - startTime}ms`);
    res.send({ success: true, result });
  } catch (error) {
    log("Error in test buy:", "error", error);
    res.status(500).send({
      success: false,
      error: error.message,
      stack: error.stack,
    });
  }
}

/**
 * Handler for getting the public key (address) of the test account.
 * Calls getTestAccountPublicKey and returns the address or error.
 */
export async function testAccountAddressHandler(_req, res) {
  const startTime = Date.now();
  try {
    log("Processing test account address request");
    const address = await getTestAccountPublicKey();
    log(`Test account address: ${address}`);
    log(`Request completed in ${Date.now() - startTime}ms`);
    res.send({ success: true, address });
  } catch (error) {
    log("Error getting test account address:", "error", error);
    res.status(500).send({
      success: false,
      error: error.message,
      stack: error.stack,
    });
  }
} 
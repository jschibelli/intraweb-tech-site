#!/usr/bin/env node
/**
 * Print a Google Cloud access token for reCAPTCHA Enterprise API testing (e.g. Postman).
 * Uses Application Default Credentials: GOOGLE_APPLICATION_CREDENTIALS or gcloud ADC.
 *
 * Usage:
 *   node scripts/recaptcha-print-token.js
 *   # Or with a key file:
 *   set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\service-account.json
 *   node scripts/recaptcha-print-token.js
 *
 * Copy the printed token into Postman → Auth → Bearer Token.
 */

const { GoogleAuth } = require("google-auth-library");

const RECAPTCHA_SCOPE = "https://www.googleapis.com/auth/cloud-platform";

async function main() {
  try {
    const auth = new GoogleAuth({ scopes: [RECAPTCHA_SCOPE] });
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const token = tokenResponse?.token ?? tokenResponse;
    if (token) {
      console.log(token);
    } else {
      console.error("Could not obtain access token.");
      console.error("Set GOOGLE_APPLICATION_CREDENTIALS to a service account JSON path, or run: gcloud auth application-default login");
      process.exit(1);
    }
  } catch (err) {
    console.error("Error:", err.message);
    console.error("\nEnsure one of:");
    console.error("  1. GOOGLE_APPLICATION_CREDENTIALS points to a service account JSON file");
    console.error("  2. You have run: gcloud auth application-default login");
    process.exit(1);
  }
}

main();

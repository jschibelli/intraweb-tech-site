# Testing reCAPTCHA Enterprise with Postman

Use this to test and validate the **Create Assessment** API call used by the contact form.

## 1. Get an access token

The API requires a Bearer token. Use one of these:

**Option A – Node script (no gcloud install)**  
If you have a service account key file (JSON from GCP Console → IAM → Service Accounts → Keys):

1. Set the path (PowerShell):
   ```powershell
   $env:GOOGLE_APPLICATION_CREDENTIALS = "C:\path\to\your-service-account.json"
   ```
2. Run:
   ```powershell
   npm run recaptcha:token
   ```
   (or `node scripts/recaptcha-print-token.js`)
3. Copy the printed token into Postman → **Auth** → **Bearer Token**. Run again when you get 401 (tokens expire in about an hour).

**Option B – gcloud CLI**  
If [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) is installed (e.g. [Windows installer](https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe)), run:

```bash
gcloud auth application-default login
```

then:

```bash
gcloud auth print-access-token
```

Copy the token into Postman → **Auth** → **Bearer Token**.

**Option C – Postman OAuth 2.0**  
You can configure Postman to get tokens automatically with a Google Cloud OAuth client (see [Authenticate to reCAPTCHA](https://docs.cloud.google.com/recaptcha/docs/authentication)).

---

## 2. Request setup

### URL (no query params)

```
POST https://recaptchaenterprise.googleapis.com/v1/projects/angelic-ivy-461304-j2/assessments
```

- **Params tab:** leave empty. Do **not** put `sitekey` or `key` in the URL.

### Headers

| Key             | Value              |
|-----------------|--------------------|
| Content-Type    | application/json   |

(Postman often sets Content-Type when you pick "raw" + "JSON" in Body.)

### Body (raw, JSON)

```json
{
  "event": {
    "token": "PASTE_TOKEN_FROM_CONTACT_FORM_HERE",
    "siteKey": "6LckZE4rAAAAADYbgtBw5rZ-oazauYc7rKlBGpHL",
    "expectedAction": "contact"
  }
}
```

Optional (can improve risk analysis):

```json
{
  "event": {
    "token": "PASTE_TOKEN_HERE",
    "siteKey": "6LckZE4rAAAAADYbgtBw5rZ-oazauYc7rKlBGpHL",
    "expectedAction": "contact",
    "userAgent": "Mozilla/5.0 ...",
    "userIpAddress": "203.0.113.42"
  }
}
```

---

## 3. Get a real token to paste

The `token` value must come from your site’s contact form (same key and action).

1. Start the site: `npm run dev`
2. Open **http://localhost:3000/contact**
3. Open DevTools → **Console**
4. Before submitting, run:

```javascript
grecaptcha.enterprise.ready(async () => {
  const token = await grecaptcha.enterprise.execute(
    '6LckZE4rAAAAADYbgtBw5rZ-oazauYc7rKlBGpHL',
    { action: 'contact' }
  );
  console.log('Token (copy this):', token);
});
```

5. Copy the printed token into the Postman body as `event.token`, then **Send**.

---

## 4. Validate the response

**Success (200):**

- `tokenProperties.valid` should be `true`
- `tokenProperties.action` should be `"contact"`
- `riskAnalysis.score` is between 0.0 and 1.0 (e.g. ≥ 0.5 is often treated as low risk)

**Common errors:**

| Status | Cause |
|--------|--------|
| 400 – "sitekey" unknown | You put `siteKey` in **Params** (URL). Put it only in **Body** → `event.siteKey`. |
| 401 | Token expired or missing. Run `gcloud auth print-access-token` again and update Bearer token. |
| 403 | Project/API not enabled or account lacks `recaptchaenterprise.assessments.create`. |

**200 OK but `tokenProperties.valid: false`, `invalidReason: "BROWSER_ERROR"`:**

Google returns this when the token cannot be validated. [Official doc](https://cloud.google.com/recaptcha/docs/troubleshoot-recaptcha-issues): *"Localhost domains are not supported by default."*

1. **Add your domain to the key (required for localhost)**  
   - Go to [Google Cloud Console → Security → reCAPTCHA Enterprise](https://console.cloud.google.com/security/recaptcha).  
   - Open your key (the one used in `event.siteKey`).  
   - Under **Domains**, add **both**:
     - `localhost`
     - `127.0.0.1`  
   (Use whichever you open in the browser; they are different origins.)  
   - Save. Then generate a **new** token on the contact page and try Postman again.

2. **Token already used** – Tokens are single-use. Get a fresh token, paste into Postman, and Send **once**. For the next test, get another token.

3. **Token expired** – Tokens expire in ~2 minutes. Copy and send the request immediately.

4. **Site key mismatch** – The key in the request body must match the key used when generating the token (`NEXT_PUBLIC_RECAPTCHA_SITE_KEY` on the contact page).

5. **Key in same project** – The key must belong to the same GCP project as the URL you call (`/v1/projects/YOUR_PROJECT_ID/assessments`). If you have multiple projects, create the key in the project you use for the API.

---

## 5. Optional: import collection

Use the Postman collection in this repo for a pre-configured request:

**File:** `docs/postman-recaptcha-create-assessment.json`

Import via Postman: **Import** → select that file. Then set the **Auth** Bearer token and replace `event.token` in the body with a fresh token from step 3.

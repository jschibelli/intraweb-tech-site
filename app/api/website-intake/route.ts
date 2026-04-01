import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { timingSafeEqual } from "crypto";
import { hubspotCreateOrUpdateContact, isHubSpotSyncFailure } from "@/lib/hubspotCreateOrUpdateContact";
import { formatWebsiteIntakeJsonSafe, formatWebsiteIntakePlainText } from "@/lib/formatWebsiteIntakeForHubSpot";
import { hubSpotDealStageOrDefault } from "@/lib/normalizeHubSpotDealStage";

export const maxDuration = 60;

const RECAPTCHA_ACTION = "website_intake";
const RECAPTCHA_MIN_SCORE = 0.5;

const inputSchema = z.object({
  contact: z
    .object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional().default(""),
      company: z.string().min(1),
      industry: z.string().min(1),
    })
    .passthrough(),
  createDeal: z.boolean().optional().default(true),
  dealStage: z
    .string()
    .optional()
    .default("qualifiedtobuy")
    .transform((s) => hubSpotDealStageOrDefault(s, "qualifiedtobuy")),
  tier: z.enum(["starter", "growth"]).optional().default("starter"),
  painOverride: z.string().optional().default(""),
  intake: z.unknown().optional(),
  recaptchaToken: z.string().optional(),
});

/** Postman / server-to-server testing only. Set WEBSITE_INTAKE_BYPASS_RECAPTCHA_SECRET (≥16 chars) and send matching X-Intraweb-Website-Intake-Bypass header. */
function isRecaptchaBypassAuthorized(request: NextRequest): boolean {
  const envSecret = process.env.WEBSITE_INTAKE_BYPASS_RECAPTCHA_SECRET?.trim();
  if (!envSecret || envSecret.length < 16) {
    return false;
  }
  const headerVal = request.headers.get("x-intraweb-website-intake-bypass")?.trim();
  if (!headerVal) {
    return false;
  }
  try {
    const a = Buffer.from(headerVal, "utf8");
    const b = Buffer.from(envSecret, "utf8");
    if (a.length !== b.length) {
      return false;
    }
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

async function verifyRecaptchaToken(
  token: string,
  request: NextRequest
): Promise<{ valid: boolean; score?: number; invalidReason?: string; hostname?: string; apiErrorMessage?: string }> {
  const projectId = process.env.RECAPTCHA_ENTERPRISE_PROJECT_ID;
  const siteKey = process.env.RECAPTCHA_ENTERPRISE_SITE_KEY;
  if (!projectId || !siteKey) {
    return { valid: false };
  }
  try {
    const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    if (!credentialsJson || credentialsJson.trim() === "") {
      return {
        valid: false,
        invalidReason: "api_error",
        apiErrorMessage:
          "GOOGLE_APPLICATION_CREDENTIALS_JSON is not set. In Vercel: Settings → Environment Variables → add the full service account JSON for Production, then redeploy.",
      };
    }
    let key: { client_email?: string; private_key?: string; [k: string]: unknown };
    try {
      key = JSON.parse(credentialsJson) as typeof key;
    } catch (parseErr) {
      const msg = parseErr instanceof Error ? parseErr.message : String(parseErr);
      return {
        valid: false,
        invalidReason: "api_error",
        apiErrorMessage: `Invalid GOOGLE_APPLICATION_CREDENTIALS_JSON (parse error: ${msg}). Paste the full JSON from your service account key file.`,
      };
    }
    if (!key.client_email || !key.private_key) {
      return {
        valid: false,
        invalidReason: "api_error",
        apiErrorMessage:
          "GOOGLE_APPLICATION_CREDENTIALS_JSON must contain client_email and private_key. Use the JSON file from Google Cloud service account Keys.",
      };
    }
    const privateKey = key.private_key.includes("\\n") ? key.private_key.replace(/\\n/g, "\n") : key.private_key;
    const keyWithNewlines = { ...key, private_key: privateKey };
    const tmpDir = tmpdir();
    const credsPath = join(tmpDir, "gcp-recaptcha-creds.json");
    try {
      mkdirSync(tmpDir, { recursive: true });
      writeFileSync(credsPath, JSON.stringify(keyWithNewlines), "utf8");
    } catch (writeErr) {
      const msg = writeErr instanceof Error ? writeErr.message : String(writeErr);
      return {
        valid: false,
        invalidReason: "api_error",
        apiErrorMessage: `Could not write credentials file: ${msg}.`,
      };
    }

    const prevPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    process.env.GOOGLE_APPLICATION_CREDENTIALS = credsPath;
    type AssessmentResult = {
      tokenProperties?: { valid?: boolean; invalidReason?: string; action?: string; hostname?: string; createTime?: string };
      riskAnalysis?: { score?: number };
    };
    let response: AssessmentResult;
    try {
      const client = new RecaptchaEnterpriseServiceClient();
      const projectPath = client.projectPath(projectId);
      const userAgent = request.headers.get("user-agent") ?? "";
      const forwarded = request.headers.get("x-forwarded-for");
      const userIp = forwarded ? forwarded.split(",")[0].trim() : "";
      const result = await client.createAssessment({
        parent: projectPath,
        assessment: {
          event: {
            token,
            siteKey,
            expectedAction: RECAPTCHA_ACTION,
            userAgent: userAgent || undefined,
            userIpAddress: userIp || undefined,
          },
        },
      });
      response = result[0] as AssessmentResult;
    } finally {
      if (prevPath !== undefined) process.env.GOOGLE_APPLICATION_CREDENTIALS = prevPath;
      else delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    }

    const invalidReasonRaw = response!.tokenProperties?.invalidReason;
    const invalidReason = invalidReasonRaw != null ? String(invalidReasonRaw) : "unknown";
    const score = response.riskAnalysis?.score ?? 0;
    const action = response.tokenProperties?.action ?? "";
    const hostname = response.tokenProperties?.hostname ?? "";

    if (!response.tokenProperties?.valid) {
      return { valid: false, invalidReason, score, hostname };
    }
    if (response.tokenProperties.action !== RECAPTCHA_ACTION) {
      return { valid: false, invalidReason: "action_mismatch", score, hostname };
    }
    const scoreOk = score >= RECAPTCHA_MIN_SCORE;
    return {
      valid: scoreOk,
      score,
      invalidReason: scoreOk ? undefined : "score_below_threshold",
      hostname,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("reCAPTCHA verification error:", err);
    return { valid: false, invalidReason: "api_error", apiErrorMessage: message };
  }
}

export async function POST(req: NextRequest) {
  try {
    const raw = (await req.json().catch(() => null)) as unknown;
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid form data", error: parsed.error.issues?.[0]?.message ?? "Invalid payload" },
        { status: 400 },
      );
    }

    const recaptchaProjectId = process.env.RECAPTCHA_ENTERPRISE_PROJECT_ID;
    const recaptchaSiteKey = process.env.RECAPTCHA_ENTERPRISE_SITE_KEY;
    const recaptchaEnabled = Boolean(recaptchaProjectId && recaptchaSiteKey);

    const skipRecaptchaInDev =
      process.env.NODE_ENV === "development" && process.env.RECAPTCHA_SKIP_IN_DEV === "true";

    const recaptchaBypass = isRecaptchaBypassAuthorized(req);
    if (recaptchaBypass) {
      console.warn(
        "[website-intake] reCAPTCHA skipped: X-Intraweb-Website-Intake-Bypass matched WEBSITE_INTAKE_BYPASS_RECAPTCHA_SECRET (remove secret from production when done testing)"
      );
    }

    if (recaptchaEnabled && !skipRecaptchaInDev && !recaptchaBypass) {
      const token = parsed.data.recaptchaToken;
      if (!token || typeof token !== "string") {
        return NextResponse.json(
          { error: "reCAPTCHA verification required", message: "Please complete the security check and try again." },
          { status: 400 }
        );
      }
      const { valid, invalidReason, score, hostname, apiErrorMessage } = await verifyRecaptchaToken(token, req);
      if (!valid) {
        console.error("[reCAPTCHA] verification failed", {
          invalidReason,
          score,
          hostname,
          apiErrorMessage,
          hint: "Check: NEXT_PUBLIC_RECAPTCHA_SITE_KEY matches RECAPTCHA_ENTERPRISE_SITE_KEY; domain allowed in reCAPTCHA key; token not reused; Google credentials and API enabled.",
        });
        const responseBody: Record<string, unknown> = {
          error: "reCAPTCHA verification failed",
          message: "Security check failed. Please try again.",
        };
        if (process.env.RECAPTCHA_DEBUG_RESPONSE === "true") {
          responseBody.debug = { invalidReason, score, hostname, apiErrorMessage };
        }
        return NextResponse.json(responseBody, { status: 400 });
      }
    }

    const webhookUrl =
      process.env.N8N_CONTACT_WEBHOOK_URL ||
      "https://n8n.intrawebtech.com/webhook/hubspot-website-form-lead";

    // Do not forward reCAPTCHA token to n8n (secret, large, not part of workflow contract).
    const { recaptchaToken: _drop, ...restForN8n } = parsed.data;

    const intakePlain = formatWebsiteIntakePlainText(parsed.data.intake);
    /** Full structured intake for deal `description` + contact `pain_point` (n8n Prep Create Deal / SW Create HubSpot Deal). */
    const painForDeal = (intakePlain || parsed.data.painOverride || "").trim();

    let bodyForN8n: Record<string, unknown> = { ...restForN8n, painOverride: painForDeal };
    /** Set when HubSpot CRM create/update succeeded; used to avoid 502 if n8n is down. */
    let crmContactId: string | null = null;

    const hubspotToken = process.env.HUBSPOT_ACCESS_TOKEN?.trim();
    if (hubspotToken) {
      const c = parsed.data.contact;
      let website = "";
      const intake = parsed.data.intake;
      if (intake && typeof intake === "object" && !Array.isArray(intake)) {
        const ic = (intake as { contact?: { website?: unknown } }).contact;
        if (ic && typeof ic.website === "string") {
          website = ic.website.trim();
        }
      }
      const intakeJson = formatWebsiteIntakeJsonSafe(parsed.data.intake);

      const hubspotResult = await hubspotCreateOrUpdateContact(hubspotToken, {
        email: c.email,
        firstName: c.firstName,
        lastName: c.lastName,
        company: c.company,
        phone: c.phone || "",
        website,
        painPoint: painForDeal,
        intakePlainText: intakePlain,
        intakeJson,
        intake: parsed.data.intake,
      });
      if (isHubSpotSyncFailure(hubspotResult)) {
        console.error("[website-intake] HubSpot sync failed:", hubspotResult.error);
        return NextResponse.json(
          {
            message: "We could not save your request. Please try again or email us.",
            error: "hubspot_sync_failed",
            detail: process.env.WEBSITE_INTAKE_DEBUG_UPSTREAM === "true" ? hubspotResult.error : undefined,
          },
          { status: 503 },
        );
      }
      crmContactId = hubspotResult.contactId;
      bodyForN8n = { ...bodyForN8n, contactId: hubspotResult.contactId };
      console.log("[website-intake] HubSpot contact", hubspotResult.action, hubspotResult.contactId);
    }

    // Stay under `export const maxDuration = 60` (seconds) with margin for reCAPTCHA + JSON work.
    const webhookTimeoutMs = Math.min(
      Number(process.env.N8N_WEBHOOK_TIMEOUT_MS) || 55000,
      57_000,
    );

    const webhookHeaders: Record<string, string> = { "Content-Type": "application/json" };
    const webhookSecret = process.env.N8N_WEBHOOK_SECRET?.trim();
    if (webhookSecret) {
      const headerName =
        process.env.N8N_WEBHOOK_SECRET_HEADER?.trim() || "X-Intraweb-Website-Intake-Secret";
      webhookHeaders[headerName] = webhookSecret;
    }

    const strictN8n = process.env.WEBSITE_INTAKE_STRICT_N8N === "true";

    let res: Response;
    try {
      res = await fetch(webhookUrl, {
        method: "POST",
        headers: webhookHeaders,
        body: JSON.stringify(bodyForN8n),
        signal: AbortSignal.timeout(Math.max(5000, webhookTimeoutMs)),
      });
    } catch (fetchErr) {
      const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
      console.error("[website-intake] n8n fetch failed:", msg);
      if (crmContactId && !strictN8n) {
        console.error(
          "[website-intake] accepting submission: CRM lead saved; n8n unreachable (contactId:",
          crmContactId,
          ")",
        );
        return NextResponse.json(
          { ok: true, crmRecorded: true, automationDispatch: "unreachable" }, { status: 200 },
        );
      }
      return NextResponse.json(
        {
          message: "Could not reach lead intake service. Please try again in a moment.",
          error: "webhook_unreachable",
          detail: process.env.WEBSITE_INTAKE_DEBUG_UPSTREAM === "true" ? msg : undefined,
        },
        { status: 503 },
      );
    }

    const text = await res.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!res.ok) {
      const errSnippet =
        typeof data === "string"
          ? data.slice(0, 500)
          : JSON.stringify(data).slice(0, 500);
      console.error("[website-intake] n8n webhook non-OK:", res.status, errSnippet);
      if (crmContactId && !strictN8n) {
        console.error(
          "[website-intake] accepting submission: CRM lead saved; n8n returned error (contactId:",
          crmContactId,
          "status:",
          res.status,
          ")",
        );
        return NextResponse.json(
          {
            ok: true,
            crmRecorded: true,
            automationDispatch: "failed",
            n8nStatus: res.status,
          },
          { status: 200 },
        );
      }
      return NextResponse.json(
        {
          message: "Lead intake service returned an error. Please try again or email us.",
          error: "upstream_webhook_error",
          status: res.status,
          upstream:
            typeof data === "string"
              ? data
              : (data as { error?: string; message?: string })?.error ||
                (data as { message?: string })?.message ||
                undefined,
          detail: process.env.WEBSITE_INTAKE_DEBUG_UPSTREAM === "true" ? errSnippet : undefined,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, upstream: data }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Server error", error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}


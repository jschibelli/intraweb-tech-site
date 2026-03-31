"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const RECAPTCHA_ACTION = "website_intake";

const inputStyles =
  "w-full px-4 py-3 rounded-md bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent";

declare global {
  interface Window {
    grecaptcha?: {
      enterprise: {
        ready: (cb: () => void) => void;
        execute: (siteKey: string, options: { action: string }) => Promise<string>;
      };
    };
  }
}

/** Google API keys start with `AIza`; reCAPTCHA Enterprise *site* keys do not — using an API key breaks `enterprise.js?render=` */
function isGoogleApiKeyMistakenForSiteKey(key: string): boolean {
  return key.trim().startsWith("AIza");
}

function loadRecaptchaScript(siteKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  return new Promise((resolve, reject) => {
    if (window.grecaptcha?.enterprise) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/enterprise.js?render=${siteKey}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("reCAPTCHA failed to load"));
    document.head.appendChild(script);
  });
}

const schema = z.object({
  // Step 1
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().default(""),
  businessName: z.string().min(1, "Business name is required"),
  industry: z.string().min(1, "Industry is required"),
  location: z.string().default(""),
  currentSite: z.string().default(""),
  bizDesc: z.string().default(""),

  // Step 2
  goals: z.array(z.string()).min(1, "Select at least one goal"),
  goalDetail: z.string().default(""),
  timeline: z.string().min(1, "Timeline is required"),
  hardDeadline: z.string().default(""),
  audience: z.string().default(""),

  // Step 3
  vibe: z.array(z.string()).min(1, "Select at least one"),
  hasLogo: z.string().default(""),
  brandColors: z.string().default(""),
  fontStyle: z.string().default(""),
  hasPhotos: z.string().default(""),
  dontWant: z.string().default(""),
  designNotes: z.string().default(""),

  // Step 4
  pages: z.array(z.string()).min(1, "Select at least one page"),
  otherPages: z.string().default(""),
  copywriter: z.string().min(1, "Required"),
  cms: z.string().default(""),
  features: z.array(z.string()).default([]),

  // Step 5
  budget: z.string().min(1, "Required"),
  ongoing: z.string().default(""),
  funding: z.string().default(""),
  payment: z.string().default(""),
  budgetNotes: z.string().default(""),

  // Step 6
  competitors: z.array(z.string()).default([]),
  inspiration: z.array(z.string()).default([]),
  likeAbout: z.string().default(""),
  dislikeAbout: z.string().default(""),
  differentiator: z.string().default(""),
  finalNotes: z.string().default(""),
});

type WebsiteIntakeFormValues = z.input<typeof schema>;
type WebsiteIntakeFormData = z.output<typeof schema>;

const GOALS = [
  "Generate more leads",
  "Sell products / services online",
  "Build brand credibility",
  "Replace / redesign existing site",
  "Rank higher on Google (SEO)",
  "Automate booking / scheduling",
  "Other",
] as const;

const VIBES = [
  "Clean & minimal",
  "Bold & modern",
  "Professional / corporate",
  "Friendly & approachable",
  "Luxury / premium",
  "Technical / industrial",
] as const;

const PAGES = [
  "Home",
  "About",
  "Services / Offerings",
  "Pricing",
  "Blog / Resources",
  "Portfolio / Gallery",
  "Testimonials / Reviews",
  "Contact / Quote Request",
  "Booking / Scheduling",
  "FAQs",
  "Legal / Privacy / Terms",
] as const;

const FEATURES = [
  "Contact / Lead Forms",
  "Online Payments",
  "Live Chat",
  "Appointment Booking",
  "Email Marketing Integration",
  "CRM Integration",
  "Google Reviews Widget",
  "AI Chatbot",
] as const;

const BUDGETS = [
  "Under $2,500",
  "$2,500 – $5,000",
  "$5,000 – $10,000",
  "$10,000 – $20,000",
  "$20,000+",
  "Not sure — need guidance",
] as const;

function toggleArrayValue(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
}

function toTier(budget: string): "starter" | "growth" {
  const b = budget.toLowerCase();
  return b.includes("10,000") || b.includes("20,000") ? "growth" : "starter";
}

function buildPainOverride(data: WebsiteIntakeFormData): string {
  const lines = [
    "Website intake submission",
    `Business: ${data.businessName}`,
    `Industry: ${data.industry}`,
    `Goals: ${data.goals.join(", ")}`,
    `Timeline: ${data.timeline}`,
    `Budget: ${data.budget}`,
    data.goalDetail ? `Outcome: ${data.goalDetail}` : "",
    data.finalNotes ? `Notes: ${data.finalNotes}` : "",
  ].filter(Boolean);
  return lines.join("\n");
}

export default function WebsiteIntakeForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | "review">(1);
  const [submitStatus, setSubmitStatus] = useState<{ type: "error"; message: string } | null>(null);
  const recaptchaReady = useRef(false);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<WebsiteIntakeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      businessName: "",
      industry: "",
      location: "",
      currentSite: "",
      bizDesc: "",

      goals: [],
      goalDetail: "",
      timeline: "",
      hardDeadline: "",
      audience: "",

      vibe: [],
      hasLogo: "",
      brandColors: "",
      fontStyle: "",
      hasPhotos: "",
      dontWant: "",
      designNotes: "",

      pages: [],
      otherPages: "",
      copywriter: "",
      cms: "",
      features: [],

      budget: "",
      ongoing: "",
      funding: "",
      payment: "",
      budgetNotes: "",

      competitors: [],
      inspiration: [],
      likeAbout: "",
      dislikeAbout: "",
      differentiator: "",
      finalNotes: "",
    },
    mode: "onTouched",
  });

  const progress = useMemo(() => {
    const idx = step === "review" ? 7 : step;
    return Math.round((idx / 7) * 100);
  }, [step]);

  const goals = watch("goals");
  const vibe = watch("vibe");
  const pages = watch("pages");
  const features = watch("features") || [];
  const competitors = watch("competitors") || [];
  const inspiration = watch("inspiration") || [];

  const canGoNext = async (): Promise<boolean> => {
    setSubmitStatus(null);
    if (step === "review") return true;
    const fieldsByStep: Record<number, (keyof WebsiteIntakeFormData)[]> = {
      1: ["firstName", "lastName", "email", "businessName", "industry"],
      2: ["goals", "timeline"],
      3: ["vibe"],
      4: ["pages", "copywriter"],
      5: ["budget"],
      6: [],
    };
    const fields = fieldsByStep[step];
    return trigger(fields as any);
  };

  const next = async () => {
    const ok = await canGoNext();
    if (!ok) return;
    if (step === "review") return;
    if (step === 6) {
      setStep("review");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const nextStep = (Number(step) + 1) as 2 | 3 | 4 | 5 | 6;
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = () => {
    setSubmitStatus(null);
    if (step === "review") setStep(6);
    else setStep((Math.max(1, step - 1) as any) as any);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getRecaptchaToken = useCallback(async (): Promise<string | null> => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey) return null;
    if (isGoogleApiKeyMistakenForSiteKey(siteKey)) {
      console.error(
        "[reCAPTCHA] NEXT_PUBLIC_RECAPTCHA_SITE_KEY is set to a Google API key (starts with AIza). " +
          "Use the reCAPTCHA Enterprise key from Google Cloud → Security → reCAPTCHA Enterprise → Keys (Website key), " +
          "and set the same value in RECAPTCHA_ENTERPRISE_SITE_KEY on the server—not an API key."
      );
      return null;
    }
    try {
      if (!recaptchaReady.current) {
        await loadRecaptchaScript(siteKey);
        recaptchaReady.current = true;
      }
      return new Promise((resolve) => {
        window.grecaptcha!.enterprise.ready(() => {
          window
            .grecaptcha!.enterprise.execute(siteKey, { action: RECAPTCHA_ACTION })
            .then(resolve)
            .catch((err: unknown) => {
              console.error("[reCAPTCHA] enterprise.execute failed:", err);
              resolve(null);
            });
        });
      });
    } catch {
      return null;
    }
  }, []);

  const onSubmit = async (data: WebsiteIntakeFormValues) => {
    setSubmitStatus(null);
    try {
      const parsed = schema.parse(data);
      const recaptchaToken = await getRecaptchaToken();
      const payload = {
        contact: {
          firstName: parsed.firstName,
          lastName: parsed.lastName,
          email: parsed.email,
          phone: parsed.phone || "",
          company: parsed.businessName,
          industry: parsed.industry,
        },
        createDeal: true,
        dealStage: "qualifiedtobuy",
        tier: toTier(parsed.budget),
        painOverride: buildPainOverride(parsed),
        intake: {
          contact: {
            firstName: parsed.firstName,
            lastName: parsed.lastName,
            email: parsed.email,
            phone: parsed.phone || "",
            businessName: parsed.businessName,
            industry: parsed.industry,
            location: parsed.location,
            website: parsed.currentSite,
            bizDesc: parsed.bizDesc,
          },
          goals: {
            goals: parsed.goals,
            goalDetail: parsed.goalDetail,
            timeline: parsed.timeline,
            hardDeadline: parsed.hardDeadline,
            audience: parsed.audience,
          },
          design: {
            vibe: parsed.vibe,
            hasLogo: parsed.hasLogo,
            brandColors: parsed.brandColors,
            fontStyle: parsed.fontStyle,
            hasPhotos: parsed.hasPhotos,
            dontWant: parsed.dontWant,
            designNotes: parsed.designNotes,
          },
          content: {
            pages: parsed.pages,
            otherPages: parsed.otherPages,
            copywriter: parsed.copywriter,
            cms: parsed.cms,
            features: parsed.features,
          },
          budget: {
            range: parsed.budget,
            ongoing: parsed.ongoing,
            funding: parsed.funding,
            payment: parsed.payment,
            notes: parsed.budgetNotes,
          },
          research: {
            competitors: parsed.competitors,
            inspiration: parsed.inspiration,
            likeAbout: parsed.likeAbout,
            dislikeAbout: parsed.dislikeAbout,
            differentiator: parsed.differentiator,
            finalNotes: parsed.finalNotes,
          },
        },
        recaptchaToken: recaptchaToken ?? undefined,
      };

      const res = await fetch("/api/website-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
        throw new Error(err.message || err.error || "Submission failed");
      }
      router.push("/thank-you");
    } catch (e) {
      setSubmitStatus({
        type: "error",
        message: e instanceof Error ? e.message : "Something went wrong. Please try again.",
      });
    }
  };

  const renderMultiSelect = (
    name: "goals" | "vibe" | "pages" | "features",
    options: readonly string[],
    values: string[],
    error?: string,
  ) => (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = values.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => setValue(name, toggleArrayValue(values, opt), { shouldValidate: true })}
              className={[
                "px-3 py-2 rounded-md border text-sm transition-colors",
                selected
                  ? "bg-teal-500/20 border-teal-500/60 text-teal-200"
                  : "bg-gray-800 border-gray-700 text-gray-200 hover:border-teal-500/40",
              ].join(" ")}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {error ? <p className="text-sm text-red-400" role="alert">{error}</p> : null}
    </div>
  );

  return (
    <div className="rounded-lg bg-gray-900/30 border border-gray-800">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs tracking-widest uppercase text-gray-400">Website Intake</p>
            <h3 className="text-xl font-heading font-bold text-white mt-1">
              {step === "review" ? "Review & submit" : `Section ${step} of 6`}
            </h3>
          </div>
          <div className="text-sm text-teal-300 font-mono">{progress}%</div>
        </div>
        <div className="mt-4 h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-teal-600 to-teal-400" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-6 space-y-8">
        {submitStatus && (
          <div className="p-4 rounded-md bg-red-500/20 text-red-200 border border-red-500/40">
            {submitStatus.message}
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-6">
            <h4 className="text-lg font-heading font-semibold text-white">Business & contact</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1.5">First name *</label>
                <input {...register("firstName")} className={`${inputStyles} ${errors.firstName ? "border-red-500" : ""}`} />
                {errors.firstName?.message && <p className="mt-1 text-sm text-red-400" role="alert">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1.5">Last name *</label>
                <input {...register("lastName")} className={`${inputStyles} ${errors.lastName ? "border-red-500" : ""}`} />
                {errors.lastName?.message && <p className="mt-1 text-sm text-red-400" role="alert">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1.5">Email *</label>
              <input {...register("email")} type="email" className={`${inputStyles} ${errors.email ? "border-red-500" : ""}`} />
              {errors.email?.message && <p className="mt-1 text-sm text-red-400" role="alert">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1.5">Phone (optional)</label>
              <input {...register("phone")} type="tel" className={inputStyles} placeholder="+1 (555) 000-0000" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1.5">Business name *</label>
              <input {...register("businessName")} className={`${inputStyles} ${errors.businessName ? "border-red-500" : ""}`} />
              {errors.businessName?.message && <p className="mt-1 text-sm text-red-400" role="alert">{errors.businessName.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1.5">Industry / niche *</label>
                <select {...register("industry")} className={`${inputStyles} ${errors.industry ? "border-red-500" : ""}`}>
                  <option value="">Select…</option>
                  <option>HVAC</option>
                  <option>Plumbing</option>
                  <option>Electrical</option>
                  <option>Landscaping</option>
                  <option>Accounting / Finance</option>
                  <option>Insurance</option>
                  <option>Med Spa / Aesthetics</option>
                  <option>Dental</option>
                  <option>Legal</option>
                  <option>Real Estate</option>
                  <option>Retail / E-Commerce</option>
                  <option>Restaurant / Food</option>
                  <option>Health & Fitness</option>
                  <option>Other</option>
                </select>
                {errors.industry?.message && <p className="mt-1 text-sm text-red-400" role="alert">{errors.industry.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1.5">Location (optional)</label>
                <input {...register("location")} className={inputStyles} placeholder="City, State" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1.5">Current website (optional)</label>
              <input {...register("currentSite")} className={inputStyles} placeholder="https://example.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1.5">Briefly describe your business (optional)</label>
              <textarea {...register("bizDesc")} className={`${inputStyles} resize-y`} rows={4} />
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-6">
            <h4 className="text-lg font-heading font-semibold text-white">Goals & timeline</h4>
            <div>
              <p className="block text-sm font-medium text-gray-200 mb-2">Primary goals *</p>
              {renderMultiSelect("goals", GOALS, goals, (errors.goals as any)?.message)}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1.5">Describe the outcome you want (optional)</label>
              <textarea {...register("goalDetail")} className={`${inputStyles} resize-y`} rows={4} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1.5">Target launch date *</label>
                <select {...register("timeline")} className={`${inputStyles} ${errors.timeline ? "border-red-500" : ""}`}>
                  <option value="">Select…</option>
                  <option>ASAP (within 2 weeks)</option>
                  <option>1 month</option>
                  <option>6–8 weeks</option>
                  <option>2–3 months</option>
                  <option>3–6 months</option>
                  <option>Flexible / no hard deadline</option>
                </select>
                {errors.timeline?.message && <p className="mt-1 text-sm text-red-400" role="alert">{errors.timeline.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1.5">Hard deadline driver (optional)</label>
                <input {...register("hardDeadline")} className={inputStyles} placeholder="Trade show, launch, etc." />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1.5">Who is this site for? (optional)</label>
              <textarea {...register("audience")} className={`${inputStyles} resize-y`} rows={3} />
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-6">
            <h4 className="text-lg font-heading font-semibold text-white">Design preferences</h4>
            <div>
              <p className="block text-sm font-medium text-gray-200 mb-2">Overall vibe *</p>
              {renderMultiSelect("vibe", VIBES, vibe, (errors.vibe as any)?.message)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1.5">Logo</label>
                <select {...register("hasLogo")} className={inputStyles}>
                  <option value="">Select…</option>
                  <option>Yes — I will provide files</option>
                  <option>No — I need a logo designed</option>
                  <option>I have a rough logo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1.5">Preferred font style</label>
                <select {...register("fontStyle")} className={inputStyles}>
                  <option value="">Select…</option>
                  <option>Serif (traditional, editorial)</option>
                  <option>Sans-serif (modern, clean)</option>
                  <option>No preference</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1.5">Brand colors (optional)</label>
                <input {...register("brandColors")} className={inputStyles} placeholder="#0B1F36, #15B8A1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1.5">Photos</label>
                <select {...register("hasPhotos")} className={inputStyles}>
                  <option value="">Select…</option>
                  <option>Yes — professional photos</option>
                  <option>Yes — phone photos only</option>
                  <option>No — need stock photos</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1.5">Anything you don’t want (optional)</label>
              <textarea {...register("dontWant")} className={`${inputStyles} resize-y`} rows={3} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1.5">Additional design notes (optional)</label>
              <textarea {...register("designNotes")} className={`${inputStyles} resize-y`} rows={3} />
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="space-y-6">
            <h4 className="text-lg font-heading font-semibold text-white">Content & pages</h4>
            <div>
              <p className="block text-sm font-medium text-gray-200 mb-2">Pages you need *</p>
              {renderMultiSelect("pages", PAGES, pages, (errors.pages as any)?.message)}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1.5">Other pages (optional)</label>
              <input {...register("otherPages")} className={inputStyles} placeholder="Custom calculator, portal, etc." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1.5">Who writes the copy? *</label>
              <select {...register("copywriter")} className={`${inputStyles} ${errors.copywriter ? "border-red-500" : ""}`}>
                <option value="">Select…</option>
                <option>I will write all copy</option>
                <option>I need you to write the copy</option>
                <option>Split — I have some, need help with the rest</option>
              </select>
              {errors.copywriter?.message && <p className="mt-1 text-sm text-red-400" role="alert">{errors.copywriter.message}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1.5">Need a CMS/blog?</label>
                <select {...register("cms")} className={inputStyles}>
                  <option value="">Select…</option>
                  <option>Yes</option>
                  <option>No</option>
                  <option>Not sure</option>
                </select>
              </div>
            </div>
            <div>
              <p className="block text-sm font-medium text-gray-200 mb-2">Integrations / features (optional)</p>
              {renderMultiSelect("features", FEATURES, features, undefined)}
            </div>
          </div>
        )}

        {/* STEP 5 */}
        {step === 5 && (
          <div className="space-y-6">
            <h4 className="text-lg font-heading font-semibold text-white">Budget</h4>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1.5">Budget range *</label>
              <select {...register("budget")} className={`${inputStyles} ${errors.budget ? "border-red-500" : ""}`}>
                <option value="">Select…</option>
                {BUDGETS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              {errors.budget?.message && <p className="mt-1 text-sm text-red-400" role="alert">{errors.budget.message}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1.5">Ongoing support after launch?</label>
                <select {...register("ongoing")} className={inputStyles}>
                  <option value="">Select…</option>
                  <option>Yes</option>
                  <option>No</option>
                  <option>Possibly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1.5">Payment preference</label>
                <select {...register("payment")} className={inputStyles}>
                  <option value="">Select…</option>
                  <option>Upfront / milestone</option>
                  <option>Monthly retainer</option>
                  <option>Flexible</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1.5">Funding source (optional)</label>
              <select {...register("funding")} className={inputStyles}>
                <option value="">Select…</option>
                <option>Business funds</option>
                <option>Personal funds</option>
                <option>Grant / loan</option>
                <option>Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1.5">Budget notes (optional)</label>
              <textarea {...register("budgetNotes")} className={`${inputStyles} resize-y`} rows={3} />
            </div>
          </div>
        )}

        {/* STEP 6 */}
        {step === 6 && (
          <div className="space-y-6">
            <h4 className="text-lg font-heading font-semibold text-white">Competitors & inspiration</h4>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1.5">Competitors (optional)</label>
              <textarea
                className={`${inputStyles} resize-y`}
                rows={3}
                placeholder="One per line: name or URL"
                value={competitors.join("\n")}
                onChange={(e) =>
                  setValue(
                    "competitors",
                    e.target.value
                      .split("\n")
                      .map((s) => s.trim())
                      .filter(Boolean),
                    { shouldDirty: true, shouldTouch: true },
                  )
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1.5">Sites you love (optional)</label>
              <textarea
                className={`${inputStyles} resize-y`}
                rows={3}
                placeholder="One per line: https://example.com"
                value={inspiration.join("\n")}
                onChange={(e) =>
                  setValue(
                    "inspiration",
                    e.target.value
                      .split("\n")
                      .map((s) => s.trim())
                      .filter(Boolean),
                    { shouldDirty: true, shouldTouch: true },
                  )
                }
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1.5">What do you like? (optional)</label>
                <textarea {...register("likeAbout")} className={`${inputStyles} resize-y`} rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1.5">What do you dislike? (optional)</label>
                <textarea {...register("dislikeAbout")} className={`${inputStyles} resize-y`} rows={3} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1.5">What makes you different? (optional)</label>
              <textarea {...register("differentiator")} className={`${inputStyles} resize-y`} rows={3} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1.5">Anything else before kickoff? (optional)</label>
              <textarea {...register("finalNotes")} className={`${inputStyles} resize-y`} rows={4} />
            </div>
          </div>
        )}

        {/* REVIEW */}
        {step === "review" && (
          <div className="space-y-6">
            <h4 className="text-lg font-heading font-semibold text-white">Review</h4>
            <div className="rounded-md border border-gray-800 bg-gray-950/30 p-4 text-sm text-gray-200 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><span className="text-gray-400">Name:</span> {getValues("firstName")} {getValues("lastName")}</div>
                <div><span className="text-gray-400">Email:</span> {getValues("email")}</div>
                <div><span className="text-gray-400">Business:</span> {getValues("businessName")}</div>
                <div><span className="text-gray-400">Industry:</span> {getValues("industry")}</div>
                <div><span className="text-gray-400">Goals:</span> {(getValues("goals") || []).join(", ") || "—"}</div>
                <div><span className="text-gray-400">Timeline:</span> {getValues("timeline") || "—"}</div>
                <div><span className="text-gray-400">Pages:</span> {(getValues("pages") || []).join(", ") || "—"}</div>
                <div><span className="text-gray-400">Budget:</span> {getValues("budget") || "—"}</div>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              When you submit, we’ll send your intake to our lead intake workflow and follow up within 1 business day.
            </p>
          </div>
        )}

        <div className="pt-2 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={back}
            disabled={step === 1 || isSubmitting}
            className="px-5 py-2.5 rounded-md border border-gray-700 text-gray-200 hover:border-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          {step === "review" ? (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-md bg-orange-500 text-white font-semibold hover:bg-teal-500 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting…" : "Submit intake"}
            </button>
          ) : (
            <button
              type="button"
              onClick={next}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-md bg-teal-600 text-white font-semibold hover:bg-teal-500 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === 6 ? "Review" : "Next"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}


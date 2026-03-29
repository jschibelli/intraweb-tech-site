"use client";
import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const RECAPTCHA_ACTION = "contact";

/** Match HubSpot `pain_point` single-line limit used on the server */
const PAIN_POINT_MAX = 1000;

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

function toSingleLinePainPoint(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function isValidOptionalWebsite(raw: string): boolean {
  const t = raw.trim();
  if (!t) return true;
  const normalized = /^https?:\/\//i.test(t) ? t : `https://${t}`;
  try {
    new URL(normalized);
    return true;
  } catch {
    return false;
  }
}

const formSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  companyName: z.string().min(1, "Company or business name is required"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .refine((v) => {
      const digits = v.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 15;
    }, "Enter a valid phone number (10–15 digits, e.g. +1 555 000 0000)"),
  website: z
    .string()
    .transform((s) => s.trim())
    .refine(isValidOptionalWebsite, "Enter a valid URL or leave blank"),
  painPoint: z
    .string()
    .max(PAIN_POINT_MAX, `Please use at most ${PAIN_POINT_MAX} characters`)
    .transform(toSingleLinePainPoint)
    .refine(
      (s) => s.length > 0,
      "Please tell us what you are trying to fix or achieve"
    ),
});

type FormData = z.infer<typeof formSchema>;

const inputStyles =
  "w-full px-4 py-3 rounded-md bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent";

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

export default function ContactForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const recaptchaReady = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      companyName: "",
      phone: "",
      website: "",
      painPoint: "",
    },
  });

  const getRecaptchaToken = useCallback(async (): Promise<string | null> => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey) return null;
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
            .catch(() => resolve(null));
        });
      });
    } catch {
      return null;
    }
  }, []);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      const recaptchaToken = await getRecaptchaToken();
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          companyName: data.companyName,
          phone: data.phone,
          website: data.website.trim() === "" ? "" : data.website.trim(),
          painPoint: data.painPoint,
          recaptchaToken: recaptchaToken ?? undefined,
        }),
      });
      if (!response.ok) {
        const errData = (await response.json().catch(() => ({}))) as {
          message?: string;
          error?: string;
        };
        // API sends technical `error` and user-facing `message`; prefer the latter
        throw new Error(errData.message || errData.error || "Submission failed");
      }
      router.push("/thank-you");
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate suppressHydrationWarning>
      {submitStatus && (
        <div
          className={`p-4 rounded-md ${
            submitStatus.type === "success"
              ? "bg-teal-500/20 text-teal-300 border border-teal-500/50"
              : "bg-red-500/20 text-red-300 border border-red-500/50"
          }`}
        >
          {submitStatus.message}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1.5">
          Email <span className="text-red-400">*</span>
        </label>
        <input
          {...register("email")}
          type="email"
          id="email"
          autoComplete="email"
          placeholder="you@company.com"
          className={`${inputStyles} ${errors.email ? "border-red-500" : ""}`}
          aria-invalid={!!errors.email}
          suppressHydrationWarning
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-400" role="alert">{errors.email.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-200 mb-1.5">
            First name <span className="text-red-400">*</span>
          </label>
          <input
            {...register("firstName")}
            type="text"
            id="firstName"
            autoComplete="given-name"
            placeholder="First name"
            className={`${inputStyles} ${errors.firstName ? "border-red-500" : ""}`}
            aria-invalid={!!errors.firstName}
            suppressHydrationWarning
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-400" role="alert">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-200 mb-1.5">
            Last name <span className="text-red-400">*</span>
          </label>
          <input
            {...register("lastName")}
            type="text"
            id="lastName"
            autoComplete="family-name"
            placeholder="Last name"
            className={`${inputStyles} ${errors.lastName ? "border-red-500" : ""}`}
            aria-invalid={!!errors.lastName}
            suppressHydrationWarning
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-400" role="alert">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="companyName" className="block text-sm font-medium text-gray-200 mb-1.5">
          Company / business name <span className="text-red-400">*</span>
        </label>
        <input
          {...register("companyName")}
          type="text"
          id="companyName"
          autoComplete="organization"
          placeholder="Acme Corp"
          className={`${inputStyles} ${errors.companyName ? "border-red-500" : ""}`}
          aria-invalid={!!errors.companyName}
          suppressHydrationWarning
        />
        {errors.companyName && (
          <p className="mt-1 text-sm text-red-400" role="alert">{errors.companyName.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-200 mb-1.5">
          Phone <span className="text-red-400">*</span>
        </label>
        <input
          {...register("phone")}
          type="tel"
          id="phone"
          autoComplete="tel"
          placeholder="+1 (555) 000-0000"
          className={`${inputStyles} ${errors.phone ? "border-red-500" : ""}`}
          aria-invalid={!!errors.phone}
          aria-describedby="phone-hint"
          suppressHydrationWarning
        />
        <p id="phone-hint" className="text-sm text-gray-400 mt-1">
          Include country code if outside the US (10–15 digits total).
        </p>
        {errors.phone && (
          <p className="mt-1 text-sm text-red-400" role="alert">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="website" className="block text-sm font-medium text-gray-200 mb-1.5">
          Website <span className="text-gray-500 font-normal">(optional)</span>
        </label>
        <input
          {...register("website")}
          type="url"
          id="website"
          autoComplete="url"
          placeholder="https://example.com"
          className={`${inputStyles} ${errors.website ? "border-red-500" : ""}`}
          aria-invalid={!!errors.website}
          suppressHydrationWarning
        />
        {errors.website && (
          <p className="mt-1 text-sm text-red-400" role="alert">{errors.website.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="painPoint" className="block text-sm font-medium text-gray-200 mb-1.5">
          What are you trying to fix or achieve? <span className="text-red-400">*</span>
        </label>
        <textarea
          {...register("painPoint")}
          id="painPoint"
          rows={5}
          maxLength={PAIN_POINT_MAX}
          placeholder="e.g. what’s broken, what you want to improve, timeline if any."
          className={`${inputStyles} resize-y ${errors.painPoint ? "border-red-500" : ""}`}
          aria-invalid={!!errors.painPoint}
          aria-describedby="pain-point-hint"
          suppressHydrationWarning
        />
        <p id="pain-point-hint" className="text-sm text-gray-400 mt-1">
          Up to {PAIN_POINT_MAX} characters.
        </p>
        {errors.painPoint && (
          <p className="mt-1 text-sm text-red-400" role="alert">{errors.painPoint.message}</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full px-6 py-3 rounded-md bg-orange-500 text-white font-semibold hover:bg-teal-500 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}

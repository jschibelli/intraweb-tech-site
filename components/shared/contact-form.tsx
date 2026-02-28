"use client";
import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const RECAPTCHA_ACTION = "contact";

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

const reasonOptions = [
  { value: "", label: "Select..." },
  { value: "ai-transformation", label: "AI Transformation" },
  { value: "custom-ai-engineer", label: "Developing custom AI solutions / AI Engineer" },
  { value: "educating-team", label: "Educating your team on AI" },
  { value: "reselling-white-label", label: "Re-selling/white-label your solutions" },
];

const decisionMakerOptions = [
  { value: "", label: "Select..." },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const annualRevenueOptions = [
  { value: "", label: "Select revenue range" },
  { value: "less-than-100k", label: "Less than $100K" },
  { value: "100k-500k", label: "$100K - $500K" },
  { value: "500k-1m", label: "$500K - $1M" },
  { value: "1m-5m", label: "$1M - $5M" },
  { value: "5m-10m", label: "$5M - $10M" },
  { value: "10m-plus", label: "$10M+" },
  { value: "prefer-not", label: "Prefer not to say" },
];

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  website: z.string().min(1, "Website is required"),
  reasonForCall: z.string().min(1, "Please select a reason"),
  email: z.string().email("Please enter a valid email"),
  decisionMaker: z.string().min(1, "Please select an option"),
  annualRevenue: z.string().min(1, "Please select a revenue range"),
  numberOfEmployees: z.string().optional(),
  message: z.string().min(1, "Message is required"),
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
      firstName: "",
      lastName: "",
      website: "",
      reasonForCall: "",
      email: "",
      decisionMaker: "",
      annualRevenue: "",
      numberOfEmployees: "",
      message: "",
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
          firstName: data.firstName,
          lastName: data.lastName,
          website: data.website,
          reasonForCall: data.reasonForCall,
          email: data.email,
          decisionMaker: data.decisionMaker,
          annualRevenue: data.annualRevenue,
          numberOfEmployees: data.numberOfEmployees || "",
          message: data.message,
          recaptchaToken: recaptchaToken ?? undefined,
        }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || "Submission failed");
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-200 mb-1.5">
          First Name <span className="text-red-400">*</span>
        </label>
        <input
          {...register("firstName")}
          type="text"
          id="firstName"
          placeholder="Your first name"
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
          Last Name <span className="text-red-400">*</span>
        </label>
        <input
          {...register("lastName")}
          type="text"
          id="lastName"
          placeholder="Your last name"
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
        <label htmlFor="website" className="block text-sm font-medium text-gray-200 mb-1.5">
          Please provide your website <span className="text-red-400">*</span>
        </label>
        <input
          {...register("website")}
          type="url"
          id="website"
          placeholder="https://"
          className={`${inputStyles} ${errors.website ? "border-red-500" : ""}`}
          aria-invalid={!!errors.website}
          suppressHydrationWarning
        />
        {errors.website && (
          <p className="mt-1 text-sm text-red-400" role="alert">{errors.website.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="reasonForCall" className="block text-sm font-medium text-gray-200 mb-1.5">
          Which best describes the reason for the call? <span className="text-red-400">*</span>
        </label>
        <select
          {...register("reasonForCall")}
          id="reasonForCall"
          className={`${inputStyles} ${errors.reasonForCall ? "border-red-500" : ""}`}
          aria-invalid={!!errors.reasonForCall}
          suppressHydrationWarning
        >
          {reasonOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors.reasonForCall && (
          <p className="mt-1 text-sm text-red-400" role="alert">{errors.reasonForCall.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1.5">
          What is your email? <span className="text-red-400">*</span>
        </label>
        <input
          {...register("email")}
          type="email"
          id="email"
          placeholder="you@company.com"
          className={`${inputStyles} ${errors.email ? "border-red-500" : ""}`}
          aria-invalid={!!errors.email}
          suppressHydrationWarning
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-400" role="alert">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="decisionMaker" className="block text-sm font-medium text-gray-200 mb-1.5">
          Are you the only decision maker? <span className="text-red-400">*</span>
        </label>
        <select
          {...register("decisionMaker")}
          id="decisionMaker"
          className={`${inputStyles} ${errors.decisionMaker ? "border-red-500" : ""}`}
          aria-invalid={!!errors.decisionMaker}
          suppressHydrationWarning
        >
          {decisionMakerOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors.decisionMaker && (
          <p className="mt-1 text-sm text-red-400" role="alert">{errors.decisionMaker.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="annualRevenue" className="block text-sm font-medium text-gray-200 mb-1.5">
          Company revenue <span className="text-red-400">*</span>
        </label>
        <select
          {...register("annualRevenue")}
          id="annualRevenue"
          className={`${inputStyles} ${errors.annualRevenue ? "border-red-500" : ""}`}
          aria-invalid={!!errors.annualRevenue}
          suppressHydrationWarning
        >
          {annualRevenueOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors.annualRevenue && (
          <p className="mt-1 text-sm text-red-400" role="alert">{errors.annualRevenue.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="numberOfEmployees" className="block text-sm font-medium text-gray-200 mb-1.5">
          Company size (employees)
        </label>
        <input
          {...register("numberOfEmployees")}
          type="number"
          id="numberOfEmployees"
          min={0}
          placeholder="e.g. 50"
          className={inputStyles}
          aria-describedby="numberOfEmployees-hint"
          suppressHydrationWarning
        />
        <p id="numberOfEmployees-hint" className="text-sm text-gray-400 mt-1">
          Optional. Helps us prioritize follow-up (ICP: 10–150).
        </p>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-200 mb-1.5">
          Message <span className="text-red-400">*</span>
        </label>
        <textarea
          {...register("message")}
          id="message"
          rows={5}
          placeholder="Tell us about your goals and challenges..."
          className={`${inputStyles} resize-y ${errors.message ? "border-red-500" : ""}`}
          aria-invalid={!!errors.message}
          suppressHydrationWarning
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-400" role="alert">{errors.message.message}</p>
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

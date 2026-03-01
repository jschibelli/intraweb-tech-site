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

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  companyName: z.string().min(1, "Company name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  website: z.string().min(1, "Website is required"),
  message: z.string().min(1, "Please describe your pain point"),
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
      companyName: "",
      email: "",
      phone: "",
      website: "",
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
          companyName: data.companyName,
          email: data.email,
          phone: data.phone ?? "",
          website: data.website,
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
        <label htmlFor="companyName" className="block text-sm font-medium text-gray-200 mb-1.5">
          Company Name <span className="text-red-400">*</span>
        </label>
        <input
          {...register("companyName")}
          type="text"
          id="companyName"
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
        <label htmlFor="phone" className="block text-sm font-medium text-gray-200 mb-1.5">
          Phone Number
        </label>
        <input
          {...register("phone")}
          type="tel"
          id="phone"
          placeholder="+1 (555) 000-0000"
          className={inputStyles}
          aria-describedby="phone-hint"
          suppressHydrationWarning
        />
        <p id="phone-hint" className="text-sm text-gray-400 mt-1">
          Include your number for a same-day callback
        </p>
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
        <label htmlFor="message" className="block text-sm font-medium text-gray-200 mb-1.5">
          What’s your main pain point? <span className="text-red-400">*</span>
        </label>
        <textarea
          {...register("message")}
          id="message"
          rows={5}
          placeholder="Describe the challenge or problem you’re looking to solve..."
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
